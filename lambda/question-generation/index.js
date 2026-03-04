const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, GetCommand } = require('@aws-sdk/lib-dynamodb');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const crypto = require('crypto');

const region = process.env.AWS_REGION || 'us-east-1';
const bedrockClient = new BedrockRuntimeClient({ region });
const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({ region }));
const s3Client = new S3Client({ region });

// Amazon Nova 2 Lite model ID
const MODEL_ID = process.env.BEDROCK_MODEL_ID || 'us.amazon.nova-2-lite-v1:0';
const TABLE_NAME = process.env.DYNAMODB_TABLE || 'LogicLensSessionsTable';
const CACHE_TABLE = 'LogicLens-Cache';
const BUCKET_NAME = process.env.S3_BUCKET_NAME;

exports.handler = async (event) => {
  console.log('Question Generation Lambda triggered', { event: JSON.stringify(event) });

  // Handle OPTIONS request for CORS preflight
  if (event.httpMethod === 'OPTIONS' || event.requestContext?.http?.method === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Methods': 'POST,OPTIONS'
      },
      body: ''
    };
  }

  try {
    // Parse body - handle both string and object
    let body;
    if (typeof event.body === 'string') {
      body = JSON.parse(event.body);
    } else if (event.body && typeof event.body === 'object') {
      body = event.body;
    } else {
      body = event;
    }

    const { code, context, language = 'en', sessionId, difficulty = 'intermediate' } = body;
    const finalSessionId = sessionId || generateSessionId();

    // Validate input
    if (!code || code.trim().length < 10) {
      return errorResponse(400, 'Code must be at least 10 characters');
    }

    if (!context || !['understanding', 'debugging', 'optimization', 'optimizing'].includes(context)) {
      return errorResponse(400, 'Invalid context. Must be: understanding, debugging, or optimization');
    }

    // --- Caching Logic ---
    const normalizedCode = code.trim().replace(/\s+/g, ' ');
    const cacheKey = crypto.createHash('sha256')
      .update(`${normalizedCode}|${context}|${difficulty}|${language}`)
      .digest('hex');

    console.log('Checking cache...', { cacheKey });
    let questions;
    let cacheHit = false;

    try {
      const cacheResult = await dynamoClient.send(new GetCommand({
        TableName: CACHE_TABLE,
        Key: { cacheKey }
      }));

      if (cacheResult.Item) {
        console.log('Cache HIT - reusing questions');
        questions = cacheResult.Item.response;
        cacheHit = true;
      }
    } catch (cacheError) {
      console.warn('Cache lookup failed, proceeding with fresh generation', cacheError);
    }

    if (!cacheHit) {
      console.log('Cache MISS - generating from Bedrock');
      // Generate questions using Bedrock
      questions = await generateQuestions(code, context, language, difficulty);

      // Store in cache table (expires in 7 days)
      try {
        await dynamoClient.send(new PutCommand({
          TableName: CACHE_TABLE,
          Item: {
            cacheKey,
            response: questions,
            code: code.substring(0, 100) + '...', // For debugging
            context,
            difficulty,
            language,
            createdAt: Date.now(),
            ttl: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60)
          }
        }));
        console.log('Cache entry created');
      } catch (cacheSaveError) {
        console.warn('Failed to save to cache', cacheSaveError);
      }
    }

    // --- S3 Storage Logic ---
    if (BUCKET_NAME) {
      try {
        // Store code
        await s3Client.send(new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: `sessions/${finalSessionId}/code.txt`,
          Body: code,
          ContentType: 'text/plain'
        }));

        // Store questions
        await s3Client.send(new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: `sessions/${finalSessionId}/questions.json`,
          Body: JSON.stringify(questions),
          ContentType: 'application/json'
        }));
        console.log('Data stored in S3');
      } catch (s3Error) {
        console.warn('Failed to store data in S3 (non-fatal)', s3Error);
      }
    }

    // Store session in DynamoDB (LogicLensSessionsTable)
    const session = {
      sessionId: finalSessionId,
      // code, // Removed code from DynamoDB
      context,
      language,
      // questions, // Removed questions from DynamoDB
      createdAt: Date.now(),
      ttl: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
      status: 'questions_generated',
      cacheHit,
      hasS3: !!BUCKET_NAME
    };

    await dynamoClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: session
    }));

    console.log('Final response prepared', { sessionId: session.sessionId, cacheHit });

    return successResponse({
      sessionId: session.sessionId,
      questions,
      cacheHit,
      message: cacheHit ? 'Reused cached questions' : 'Questions generated successfully'
    });

  } catch (error) {
    console.error('Error in question generation:', error);
    return errorResponse(500, 'Failed to generate questions', error.message);
  }
};

async function generateQuestions(code, context, language, difficulty = 'intermediate') {
  const isHindi = language === 'hi';

  const systemPrompt = isHindi
    ? 'आप एक अनुभवी सॉफ्टवेयर डेवलपर हैं जो कोड की समझ की जांच करने के लिए targeted questions पूछते हैं। आपको ONLY valid JSON return करना है।'
    : 'You are an experienced software developer who asks targeted questions to test code understanding. Return ONLY valid JSON.';

  const contextInstructions = {
    understanding: isHindi
      ? 'कोड के logic flow, data transformations, और edge cases के बारे में सवाल पूछें।'
      : 'Ask questions about logic flow, data transformations, and edge cases.',
    debugging: isHindi
      ? 'संभावित bugs, null handling, और error scenarios के बारे में सवाल पूछें।'
      : 'Ask questions about potential bugs, null handling, and error scenarios.',
    optimization: isHindi
      ? 'Performance bottlenecks, time complexity, और optimization opportunities के बारे में सवाल पूछें।'
      : 'Ask questions about performance bottlenecks, time complexity, and optimization opportunities.',
    optimizing: isHindi
      ? 'Performance bottlenecks, time complexity, और optimization opportunities के बारे में सवाल पूछें।'
      : 'Ask questions about performance bottlenecks, time complexity, and optimization opportunities.'
  };

  const difficultyInstructions = {
    beginner: isHindi
      ? 'सवाल बहुत simple रखें। "Output क्या होगा?", "यह function क्या return करता है?" जैसे basic सवाल पूछें। Code tracing और simple behavior पर focus करें।'
      : 'Keep questions VERY SIMPLE. Ask basic questions like "What will this output?", "What does this function return?", "What value does this variable hold after the loop?". Focus on code tracing and simple behavior.',
    intermediate: isHindi
      ? 'Edge cases, null/empty inputs, और data flow के बारे में सवाल पूछें। Developer को "What if" scenarios के बारे में सोचने पर मजबूर करें।'
      : 'Ask about edge cases, null/empty inputs, and data flow. Make the developer think about "What if" scenarios and boundary conditions.',
    advanced: isHindi
      ? 'Time/space complexity, design pattern choices, thread safety, scalability, और architectural tradeoffs के बारे में गहरे सवाल पूछें।'
      : 'Ask deep questions about time/space complexity, design pattern choices, thread safety, scalability, and architectural tradeoffs. Challenge the developer\'s reasoning about WHY certain approaches were chosen.'
  };

  const lineCount = code.split('\n').length;

  const userPrompt = `
${contextInstructions[context]}

DIFFICULTY LEVEL: ${difficulty.toUpperCase()}
${difficultyInstructions[difficulty]}

Code to analyze (${lineCount} lines total):
\`\`\`
${code}
\`\`\`

Generate 3-5 targeted questions that test the developer's CONCEPTUAL understanding of this code. Each question should:
1. Focus on what the code DOES, not on syntax details
2. Test understanding of logic flow, output, or behavior
3. Be answerable in simple natural language (1-2 sentences)
4. Ask "what happens when..." or "what will the output be..." style questions
5. NEVER reference specific line numbers — ask about the code behavior instead

BAD question examples (do NOT generate these):
- "What happens if the semicolon on line 13 is removed?" (references lines, tests syntax not logic)
- "What is the variable type on line 5?" (too trivial, syntax-focused)

GOOD question examples:
- "What will this code output when run?"
- "What happens if the input array is empty?"
- "Will this function work correctly with negative numbers? Why or why not?"

${isHindi ? 'सवाल सरल हिंदी में लिखें।' : 'Write questions in clear, simple language.'}

Return ONLY a JSON array (no markdown, no code fences, no extra text) in this EXACT format:
[
  {
    "id": 1,
    "question": "${isHindi ? 'सवाल यहाँ' : 'Question text here'}",
    "focus": "logic_flow"
  }
]

RULES:
- "id" must be a unique number starting from 1
- "focus" must be one of: "logic_flow", "edge_case", "data_state", "error_handling"
- Generate exactly 3-5 questions
- NEVER mention line numbers in questions
- Return ONLY the JSON array, nothing else
`;

  // Build the request payload for Amazon Nova Lite
  const payload = {
    messages: [
      {
        role: 'user',
        content: [
          {
            text: `${systemPrompt}\n\n${userPrompt}`
          }
        ]
      }
    ],
    inferenceConfig: {
      max_new_tokens: 2048,
      temperature: 0.7
    }
  };

  const command = new InvokeModelCommand({
    modelId: MODEL_ID,
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify(payload)
  });

  console.log('Invoking Bedrock with model:', MODEL_ID);

  let response;
  try {
    response = await bedrockClient.send(command);
  } catch (bedrockError) {
    console.error('Bedrock invocation failed:', {
      error: bedrockError.message,
      code: bedrockError.code,
      modelId: MODEL_ID,
      region: process.env.AWS_REGION || 'us-east-1'
    });
    throw new Error(`Bedrock API error: ${bedrockError.message}`);
  }

  const responseBody = JSON.parse(new TextDecoder().decode(response.body));

  console.log('Bedrock response metadata:', {
    modelId: MODEL_ID,
    inputTokens: responseBody.usage?.inputTokens || responseBody.usage?.input_tokens,
    outputTokens: responseBody.usage?.outputTokens || responseBody.usage?.output_tokens,
    stopReason: responseBody.stopReason || responseBody.stop_reason
  });

  // Extract text from response — handle both Nova and Claude formats
  let content = '';
  if (responseBody.output?.message?.content) {
    // Nova format (primary)
    content = responseBody.output.message.content[0].text;
  } else if (responseBody.content && Array.isArray(responseBody.content)) {
    // Claude format
    content = responseBody.content.map(c => c.text || '').join('');
  } else if (typeof responseBody.completion === 'string') {
    content = responseBody.completion;
  }

  console.log('Raw model output (first 500 chars):', content.substring(0, 500));

  // Robust JSON extraction
  let questions = null;

  // Attempt 1: Direct parse
  try {
    questions = JSON.parse(content.trim());
  } catch (e) {
    console.log('Direct parse failed, trying regex');
  }

  // Attempt 2: Extract JSON array from text
  if (!questions) {
    try {
      const cleaned = content.replace(/```json\s*/gi, '').replace(/```\s*/g, '');
      const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        questions = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error('Regex JSON extraction failed:', e.message);
    }
  }

  if (!questions || !Array.isArray(questions) || questions.length === 0) {
    throw new Error('Failed to parse questions from Bedrock response');
  }

  // Normalize question format
  return questions.map((q, idx) => ({
    id: q.id || idx + 1,
    question: q.question || `Question ${idx + 1}`,
    focus: q.focus || 'logic_flow',
    order: idx + 1
  }));
}

function generateSessionId() {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function successResponse(data) {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS'
    },
    body: JSON.stringify(data)
  };
}

function errorResponse(statusCode, message, details = null) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS'
    },
    body: JSON.stringify({
      error: message,
      details,
      timestamp: new Date().toISOString()
    })
  };
}

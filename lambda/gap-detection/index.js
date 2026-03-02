const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');

const bedrockClient = new BedrockRuntimeClient({ region: process.env.AWS_REGION || 'us-east-1' });
const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' }));

// Claude 3.5 Sonnet model ID
const MODEL_ID = process.env.BEDROCK_MODEL_ID || 'us.amazon.nova-lite-v1:0';
const TABLE_NAME = process.env.DYNAMODB_TABLE || 'LogicLensSessionsTable';

exports.handler = async (event) => {
  console.log('Gap Detection Lambda triggered', { event });

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
    // Parse body - handle both API Gateway formats
    let body;
    if (event.body) {
      body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    } else {
      body = event;
    }

    const { sessionId, answers } = body;

    // Validate input
    if (!sessionId || !answers || !Array.isArray(answers)) {
      return errorResponse(400, 'Invalid input. sessionId and answers array required');
    }

    // Retrieve session from DynamoDB
    const sessionResult = await dynamoClient.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: { sessionId }
    }));

    if (!sessionResult.Item) {
      return errorResponse(404, 'Session not found');
    }

    const session = sessionResult.Item;

    // Analyze answers and detect gaps
    const analysis = await analyzeAnswers(
      session.code,
      session.questions,
      answers,
      session.language || 'en'
    );

    // Strip undefined values before DynamoDB write (DynamoDB rejects undefined)
    const cleanAnalysis = removeUndefined(analysis);
    const cleanAnswers = removeUndefined(answers);

    // Try to update session in DynamoDB (non-fatal if it fails)
    try {
      await dynamoClient.send(new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { sessionId },
        UpdateExpression: 'SET answers = :answers, analysis = :analysis, #status = :status, updatedAt = :updatedAt',
        ExpressionAttributeNames: {
          '#status': 'status'
        },
        ExpressionAttributeValues: {
          ':answers': cleanAnswers,
          ':analysis': cleanAnalysis,
          ':status': 'analysis_complete',
          ':updatedAt': Date.now()
        }
      }));
    } catch (dbError) {
      console.error('DynamoDB update failed (non-fatal):', dbError.message);
      // Continue — still return the analysis to the user
    }

    console.log('Gap detection completed', {
      sessionId,
      gapsFound: analysis.gaps.length,
      correctCount: analysis.correctUnderstandings.length
    });

    return successResponse({
      sessionId,
      analysis,
      message: 'Analysis completed successfully'
    });

  } catch (error) {
    console.error('Error in gap detection:', error);
    return errorResponse(500, 'Failed to analyze answers', error.message);
  }
};

/**
 * Recursively remove undefined values from an object/array.
 * DynamoDB DocumentClient rejects objects containing undefined.
 */
function removeUndefined(obj) {
  if (obj === null || obj === undefined) return null;
  if (Array.isArray(obj)) {
    return obj.map(item => removeUndefined(item));
  }
  if (typeof obj === 'object') {
    const clean = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        clean[key] = removeUndefined(value);
      }
    }
    return clean;
  }
  return obj;
}

async function analyzeAnswers(code, questions, answers, language) {
  const isHindi = language === 'hi';

  // Build Q&A pairs
  const qaText = questions.map((q, idx) => {
    const answer = answers.find(a => a.questionId === q.id || a.questionId === String(q.id) || a.questionId === idx + 1);
    return `
Question ${idx + 1} (ID: ${q.id}): ${q.question}
Developer's Answer: ${answer?.answer || '(skipped)'}
`;
  }).join('\n');

  const systemPrompt = isHindi
    ? 'आप एक code analysis expert हैं। आपको developer के answers को actual code behavior से compare करके reasoning gaps identify करने हैं। आपको ONLY valid JSON return करना है, कोई अतिरिक्त text नहीं।'
    : 'You are a code analysis expert. Compare the developer answers against actual code behavior and identify reasoning gaps. Return ONLY valid JSON, no additional text.';

  const userPrompt = `
Code being analyzed:
\`\`\`
${code}
\`\`\`

${qaText}

IMPORTANT GRADING GUIDELINES — READ CAREFULLY:
- BE LENIENT. The developer is a student learning to reason about code. They will NOT give textbook-perfect answers.
- If the developer's answer shows they UNDERSTAND THE CONCEPT, even if their wording is informal, imprecise, or incomplete, mark it as CORRECT.
- Only mark something as a "gap" if the developer is clearly WRONG or demonstrates a fundamental misunderstanding.
- A vague but directionally correct answer (e.g., "it prints hello" for code that prints "Hello") should be marked CORRECT.
- An answer that captures the main idea but misses minor details should be marked CORRECT with a note, NOT as a gap.

Examples of answers that SHOULD be marked correct:
- Q: "What does this code output?" A: "It prints hello" → CORRECT (even if output is technically "Hello" with capital H)
- Q: "What happens with empty input?" A: "It would return nothing" → CORRECT (even if it technically returns 0 or undefined)
- Q: "Does this handle errors?" A: "No, there's no error handling" → CORRECT (if indeed there's no try/catch)

Examples of answers that ARE gaps:
- Q: "What does this loop do?" A: "It sorts the array" → GAP (when the loop actually finds the maximum)
- Q: "What is returned?" A: "It returns the minimum" → GAP (when it returns the maximum)

You MUST return ONLY a valid JSON object (no markdown, no code fences, no extra text) in this EXACT schema:

{
  "gaps": [
    {
      "id": "gap-1",
      "severity": "critical",
      "category": "logic-flow",
      "title": "${isHindi ? 'Gap का शीर्षक' : 'Brief descriptive title of the gap'}",
      "description": "${isHindi ? 'Gap का विवरण' : 'Short description of what was misunderstood'}",
      "userAnswer": "${isHindi ? 'डेवलपर ने क्या कहा (उनका actual answer copy करें)' : 'What the developer said (copy their actual answer)'}",
      "actualBehavior": "${isHindi ? 'Code actually क्या करता है' : 'What the code actually does'}",
      "explanation": "${isHindi ? 'विस्तृत explanation — यह क्यों ज़रूरी है' : 'Detailed explanation of why this matters and the correct reasoning'}",
      "codeSnippet": "relevant code snippet from the analyzed code"
    }
  ],
  "correctUnderstandings": [
    "${isHindi ? 'डेवलपर ने यह सही समझा...' : 'The developer correctly understood that...'}"
  ],
  "optimizedCode": "Provide an improved/optimal version of the ENTIRE code with better practices, error handling, meaningful variable names, and any fixes. Keep the same programming language. Include helpful comments explaining key improvements.",
  "checklist": [
    "${isHindi ? 'सुधार के लिए suggestion' : 'Improvement suggestion'}"
  ],
  "testSuggestions": [
    "${isHindi ? 'Test suggestion' : 'Test suggestion'}"
  ]
}

RULES:
- "severity" MUST be one of: "critical", "moderate", "minor"
- "category" MUST be one of: "logic-flow", "data-state", "error-handling", "performance"
- "id" MUST be unique strings like "gap-1", "gap-2", etc.
- "gaps" array: include ONLY questions where the developer was CLEARLY WRONG (not just imprecise)
- "correctUnderstandings" array: include a string for EACH question the developer got roughly right. Be generous here.
- "optimizedCode" MUST be a single string containing the improved version of the code. Use \\n for newlines. This is REQUIRED.
- Use "critical" severity ONLY for completely wrong answers. Use "minor" for partial understanding.
- If a question was skipped, treat it as a gap with severity "moderate"
- Every field shown above is REQUIRED - do not omit any field
- "codeSnippet" should be a relevant 1-3 line snippet from the actual code (do NOT reference line numbers)
- ${isHindi ? 'सभी explanations सरल हिंदी में लिखें' : 'Write all explanations in clear, beginner-friendly English'}
- Return ONLY the JSON object. No markdown fences. No explanation outside the JSON.
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
      max_new_tokens: 4096,
      temperature: 0.3
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
    // Return fallback analysis instead of throwing
    return buildFallbackAnalysis(questions, answers, isHindi);
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
    // Claude Messages API format
    content = responseBody.content.map(c => c.text || '').join('');
  } else if (typeof responseBody.completion === 'string') {
    // Legacy format
    content = responseBody.completion;
  }

  console.log('Raw model output (first 500 chars):', content.substring(0, 500));

  // Robust JSON extraction
  let analysis = null;

  // Attempt 1: Try to parse the entire content as JSON
  try {
    analysis = JSON.parse(content.trim());
  } catch (e) {
    console.log('Direct parse failed, trying regex extraction');
  }

  // Attempt 2: Extract JSON object from within the text
  if (!analysis) {
    try {
      // Remove markdown code fences if present
      const cleaned = content.replace(/```json\s*/gi, '').replace(/```\s*/g, '');
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error('Regex JSON extraction failed:', e.message);
    }
  }

  // Attempt 3: Fallback analysis
  if (!analysis) {
    console.warn('All JSON parsing attempts failed, using fallback analysis');
    return buildFallbackAnalysis(questions, answers, isHindi);
  }

  // Normalize the analysis to match frontend types exactly
  const normalized = normalizeAnalysis(analysis, questions, answers, isHindi);

  // Revalidate: catch false-positive gaps where user answer ≈ actual behavior
  return revalidateGaps(normalized);
}

/**
 * Normalize any analysis shape to match the frontend Analysis type exactly.
 */
function normalizeAnalysis(raw, questions, answers, isHindi) {
  const gaps = (raw.gaps || []).map((gap, idx) => ({
    id: gap.id || `gap-${idx + 1}`,
    severity: ['critical', 'moderate', 'minor'].includes(gap.severity) ? gap.severity : 'moderate',
    category: ['logic-flow', 'data-state', 'error-handling', 'performance'].includes(gap.category)
      ? gap.category
      : (gap.category || 'logic-flow').replace(/_/g, '-'),
    title: gap.title || (isHindi ? 'Reasoning Gap पाया गया' : 'Reasoning Gap Found'),
    description: gap.description || gap.misconception || gap.title || '',
    userAnswer: gap.userAnswer || gap.developerAnswer || gap.developer_answer || '',
    actualBehavior: gap.actualBehavior || gap.actual_behavior || gap.actual || '',
    explanation: gap.explanation || gap.detail || gap.description || '',
    codeSnippet: gap.codeSnippet || gap.code_snippet || gap.lineReferences?.join(', ') || '',
    lineNumber: gap.lineNumber || (gap.lineReferences ? gap.lineReferences[0] : undefined)
  }));

  // Handle both correctUnderstandings and correctAnswers field names
  let correctUnderstandings = raw.correctUnderstandings || [];
  if (correctUnderstandings.length === 0 && raw.correctAnswers) {
    correctUnderstandings = raw.correctAnswers.map(ca => {
      if (typeof ca === 'string') return ca;
      return ca.feedback || ca.understanding || ca.message || JSON.stringify(ca);
    });
  }

  return {
    sessionId: raw.sessionId || `session_${Date.now()}`,
    gaps,
    correctUnderstandings,
    optimizedCode: raw.optimizedCode || raw.refactoredCode || raw.improved_code || '',
    checklist: raw.checklist || [],
    testSuggestions: raw.testSuggestions || raw.test_suggestions || [],
    analyzedAt: Date.now()
  };
}

/**
 * Revalidate gaps: if the user's answer is semantically similar to the
 * AI's "actual behavior", the gap was a false positive — move to correct.
 * This catches cases where Nova Lite marks correct answers as wrong.
 */
function revalidateGaps(analysis) {
  const STOP_WORDS = new Set([
    'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'shall', 'can', 'to', 'of', 'in', 'for',
    'on', 'with', 'at', 'by', 'from', 'as', 'into', 'through', 'during',
    'before', 'after', 'above', 'below', 'between', 'and', 'but', 'or',
    'not', 'no', 'so', 'if', 'then', 'than', 'that', 'this', 'these',
    'those', 'it', 'its', 'i', 'my', 'me', 'we', 'our', 'you', 'your',
    'he', 'she', 'they', 'them', 'their', 'what', 'which', 'who', 'whom',
    'how', 'when', 'where', 'why', 'all', 'each', 'every', 'both', 'few',
    'more', 'most', 'some', 'any', 'also', 'just', 'about', 'up', 'out',
    'think', 'because', 'yes', 'yeah', 'will', 'correctly', 'actually'
  ]);

  function extractKeywords(text) {
    if (!text) return new Set();
    return new Set(
      text.toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length > 2 && !STOP_WORDS.has(w))
    );
  }

  function isAffirmative(text) {
    if (!text) return false;
    const lower = text.toLowerCase().trim();
    return /^(yes|yeah|yep|correct|right|true|it does|it will|it can)/.test(lower);
  }

  const survivingGaps = [];
  const reclassified = [];

  for (const gap of analysis.gaps) {
    const userWords = extractKeywords(gap.userAnswer);
    const actualWords = extractKeywords(gap.actualBehavior);
    const descWords = extractKeywords(gap.description);

    // Count overlapping meaningful keywords
    let overlap = 0;
    for (const word of userWords) {
      if (actualWords.has(word)) overlap++;
    }

    const userIsAffirmative = isAffirmative(gap.userAnswer);
    const actualIsAffirmative = isAffirmative(gap.actualBehavior);

    // Calculate overlap ratio based on the smaller set
    const smallerSize = Math.min(userWords.size, actualWords.size);
    const overlapRatio = smallerSize > 0 ? overlap / smallerSize : 0;

    // Reclassify as correct if:
    // 1. High keyword overlap (>= 40% of meaningful words match), OR
    // 2. User said "yes" affirming the same concept the actual behavior describes, OR
    // 3. At least 3 meaningful keywords overlap
    const shouldReclassify = (
      (overlapRatio >= 0.4 && overlap >= 2) ||
      (userIsAffirmative && overlap >= 1) ||
      (overlap >= 3)
    );

    if (shouldReclassify) {
      console.log(`Revalidation: reclassifying gap "${gap.title}" as correct (overlap=${overlap}, ratio=${overlapRatio.toFixed(2)}, affirmative=${userIsAffirmative})`);
      reclassified.push(
        `The developer correctly understood: ${gap.title}. Their answer "${gap.userAnswer}" aligns with the actual behavior.`
      );
    } else {
      survivingGaps.push(gap);
    }
  }

  if (reclassified.length > 0) {
    console.log(`Revalidation summary: ${reclassified.length} false-positive gaps reclassified as correct`);
  }

  return {
    ...analysis,
    gaps: survivingGaps,
    correctUnderstandings: [...analysis.correctUnderstandings, ...reclassified]
  };
}

/**
 * Build a safe fallback analysis when Bedrock fails or returns unparseable output.
 */
function buildFallbackAnalysis(questions, answers, isHindi) {
  const gaps = questions.map((q, idx) => {
    const answer = answers.find(a => a.questionId === q.id || a.questionId === String(q.id) || a.questionId === idx + 1);
    const wasSkipped = !answer?.answer || answer.answer.trim() === '' || answer.skipped;

    return {
      id: `gap-${idx + 1}`,
      severity: wasSkipped ? 'moderate' : 'minor',
      category: 'logic-flow',
      title: isHindi
        ? `सवाल ${idx + 1} की समीक्षा ज़रूरी`
        : `Question ${idx + 1} needs review`,
      description: isHindi
        ? 'AI analysis उपलब्ध नहीं हो सका — कृपया manually review करें'
        : 'AI analysis was unavailable — please review manually',
      userAnswer: answer?.answer || '',
      actualBehavior: isHindi
        ? 'Code का actual behavior manually verify करें'
        : 'Please verify the actual code behavior manually',
      explanation: isHindi
        ? `सवाल "${q.question}" के लिए code को ध्यान से trace करें।`
        : `Trace through the code carefully for the question: "${q.question}"`,
      codeSnippet: '',
    };
  });

  return {
    sessionId: `fallback_${Date.now()}`,
    gaps,
    correctUnderstandings: [
      isHindi
        ? 'आपने code analyze करने की कोशिश की — यह सीखने की अच्छी शुरुआत है।'
        : 'You attempted to analyze the code — that\'s a great start to learning.'
    ],
    checklist: [
      isHindi ? 'हर सवाल के लिए code manually trace करें' : 'Manually trace the code for each question',
      isHindi ? 'Edge cases पर विचार करें' : 'Consider edge cases'
    ],
    testSuggestions: [
      isHindi ? 'Different inputs के साथ code test करें' : 'Test the code with different inputs'
    ],
    analyzedAt: Date.now()
  };
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

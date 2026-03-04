const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const { S3Client, GetObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3');

const region = process.env.AWS_REGION || 'us-east-1';
const bedrockClient = new BedrockRuntimeClient({ region });
const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({ region }));
const s3Client = new S3Client({ region });

// Use inference profile for Nova models (required for on-demand throughput)
const MODEL_ID = process.env.BEDROCK_MODEL_ID || 'us.amazon.nova-2-lite-v1:0';
const TABLE_NAME = process.env.DYNAMODB_TABLE || 'LogicLensSessionsTable';
const BUCKET_NAME = process.env.S3_BUCKET_NAME;

exports.handler = async (event) => {
  console.log('Refactor Code Lambda triggered', { event });

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

    const { sessionId } = body;

    if (!sessionId) {
      return errorResponse(400, 'sessionId required');
    }

    // Retrieve session
    const sessionResult = await dynamoClient.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: { sessionId }
    }));

    if (!sessionResult.Item) {
      return errorResponse(404, 'Session not found');
    }

    const session = sessionResult.Item;
    let code = session.code;
    let analysis = session.analysis;

    // --- S3 Retrieval Logic ---
    if (session.hasAnalysisInS3 && BUCKET_NAME) {
      try {
        console.log('Fetching data from S3...');
        // Fetch code
        const codeRes = await s3Client.send(new GetObjectCommand({
          Bucket: BUCKET_NAME,
          Key: `sessions/${sessionId}/code.txt`
        }));
        code = await codeRes.Body.transformToString();

        // Fetch analysis
        const analysisRes = await s3Client.send(new GetObjectCommand({
          Bucket: BUCKET_NAME,
          Key: `sessions/${sessionId}/analysis.json`
        }));
        analysis = JSON.parse(await analysisRes.Body.transformToString());
      } catch (s3ReadError) {
        console.error('Failed to read from S3:', s3ReadError.message);
        if (!code || !analysis) {
          return errorResponse(500, 'Failed to retrieve session data from S3');
        }
      }
    }

    if (!analysis) {
      return errorResponse(400, 'Analysis must be completed first');
    }

    // Generate refactored code and checklist
    const refactorResult = await generateRefactoredCode(
      code,
      analysis,
      session.language || 'en'
    );

    // --- S3 Storage Logic ---
    if (BUCKET_NAME) {
      try {
        // Store refactored code
        await s3Client.send(new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: `sessions/${sessionId}/refactored.txt`,
          Body: refactorResult.refactoredCode,
          ContentType: 'text/plain'
        }));

        // Store checklist
        await s3Client.send(new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: `sessions/${sessionId}/checklist.json`,
          Body: JSON.stringify(refactorResult.checklist),
          ContentType: 'application/json'
        }));
        console.log('Refactoring results stored in S3');
      } catch (s3WriteError) {
        console.warn('Failed to store refactoring in S3 (non-fatal):', s3WriteError.message);
      }
    }

    // Update session
    try {
      await dynamoClient.send(new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { sessionId },
        UpdateExpression: 'SET #status = :status, completedAt = :completedAt, hasRefactorInS3 = :hasS3',
        ExpressionAttributeNames: {
          '#status': 'status'
        },
        ExpressionAttributeValues: {
          ':status': 'completed',
          ':completedAt': Date.now(),
          ':hasS3': !!BUCKET_NAME
        }
      }));
    } catch (dbError) {
      console.error('DynamoDB update failed (non-fatal):', dbError.message);
    }

    console.log('Refactoring completed', { sessionId });

    return successResponse({
      sessionId,
      refactoredCode: refactorResult.refactoredCode,
      checklist: refactorResult.checklist,
      message: 'Refactoring completed successfully'
    });

  } catch (error) {
    console.error('Error in refactoring:', error);
    return errorResponse(500, 'Failed to generate refactored code', error.message);
  }
};

async function generateRefactoredCode(code, analysis, language) {
  const isHindi = language === 'hi';

  const systemPrompt = isHindi
    ? 'आप एक expert software engineer हैं जो code को refactor करते हैं और debugging checklists बनाते हैं।'
    : 'You are an expert software engineer who refactors code and creates debugging checklists.';

  // Summarize gaps for context
  const gapsSummary = analysis.gaps.map(g =>
    `- ${g.category}: ${g.title} (Line ${g.lineReferences?.join(', ') || 'N/A'})`
  ).join('\n');

  const userPrompt = `
Original code:
\`\`\`
${code}
\`\`\`

Identified issues:
${gapsSummary}

Tasks:
1. Refactor the code to fix all identified issues
2. Add comments explaining key fixes
3. Ensure proper error handling and edge case coverage
4. Create a debugging checklist for similar code

${isHindi ? 'Comments और checklist हिंदी में दें।' : 'Provide comments and checklist in clear language.'}

Return ONLY a JSON object in this exact format:
{
  "refactoredCode": "${isHindi ? 'सुधारा हुआ code यहाँ' : 'Improved code here'}",
  "changes": [
    {
      "line": 12,
      "change": "${isHindi ? 'क्या बदला' : 'What changed'}",
      "reason": "${isHindi ? 'क्यों बदला' : 'Why changed'}"
    }
  ],
  "checklist": [
    "${isHindi ? 'Null/undefined handling check करें' : 'Check null/undefined handling'}",
    "${isHindi ? 'Empty array/object cases test करें' : 'Test empty array/object cases'}"
  ]
}
`;

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
      max_new_tokens: 2500,
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
    throw new Error(`Bedrock API error: ${bedrockError.message}`);
  }

  const responseBody = JSON.parse(new TextDecoder().decode(response.body));

  console.log('Bedrock response:', {
    modelId: MODEL_ID,
    inputTokens: responseBody.usage?.inputTokens,
    outputTokens: responseBody.usage?.outputTokens,
    stopReason: responseBody.stopReason
  });

  // Extract JSON from response - Nova format
  const content = responseBody.output.message.content[0].text;
  const jsonMatch = content.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    throw new Error('Failed to parse refactored code from Bedrock response');
  }

  return JSON.parse(jsonMatch[0]);
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

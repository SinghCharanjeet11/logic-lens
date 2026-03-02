const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');

const bedrockClient = new BedrockRuntimeClient({ region: process.env.AWS_REGION || 'us-east-1' });
const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' }));

// Use inference profile for Nova models (required for on-demand throughput)
const MODEL_ID = 'us.amazon.nova-lite-v1:0'; // Amazon Nova Lite inference profile
const TABLE_NAME = process.env.DYNAMODB_TABLE || 'LogicLensSessionsTable';

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
      // API Gateway REST API format
      body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    } else {
      // Direct invocation or API Gateway HTTP API format
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
    
    if (!session.analysis) {
      return errorResponse(400, 'Analysis must be completed first');
    }
    
    // Generate refactored code and checklist
    const refactorResult = await generateRefactoredCode(
      session.code,
      session.analysis,
      session.language || 'en'
    );
    
    // Update session
    await dynamoClient.send(new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { sessionId },
      UpdateExpression: 'SET refactoredCode = :refactored, checklist = :checklist, #status = :status, completedAt = :completedAt',
      ExpressionAttributeNames: {
        '#status': 'status'
      },
      ExpressionAttributeValues: {
        ':refactored': refactorResult.refactoredCode,
        ':checklist': refactorResult.checklist,
        ':status': 'completed',
        ':completedAt': Date.now()
      }
    }));
    
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

// AWS Service Configuration

export const awsConfig = {
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
  bedrock: {
    modelId: process.env.NEXT_PUBLIC_BEDROCK_MODEL_ID || 'anthropic.claude-3-5-sonnet-20241022-v2:0',
    maxTokens: 4096,
    temperature: 0.7,
  },
  dynamodb: {
    tableName: process.env.NEXT_PUBLIC_DYNAMODB_TABLE_NAME || 'logic-lens-sessions',
    ttl: 24 * 60 * 60, // 24 hours in seconds
  },
  apiGateway: {
    baseUrl: process.env.NEXT_PUBLIC_API_GATEWAY_URL || '',
    endpoints: {
      analyzeCode: '/analyze-code',
      generateQuestions: '/generate-questions',
      analyzeAnswers: '/analyze-answers',
    },
  },
};

// Validate required environment variables
export function validateAwsConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!awsConfig.region) {
    errors.push('NEXT_PUBLIC_AWS_REGION is not set');
  }

  if (!awsConfig.credentials.accessKeyId) {
    errors.push('NEXT_PUBLIC_AWS_ACCESS_KEY_ID is not set');
  }

  if (!awsConfig.credentials.secretAccessKey) {
    errors.push('AWS_SECRET_ACCESS_KEY is not set');
  }

  if (!awsConfig.bedrock.modelId) {
    errors.push('NEXT_PUBLIC_BEDROCK_MODEL_ID is not set');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Demo mode mock data
const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

function generateMockQuestions(code: string, context: string, language: string): any {
  const isHindi = language === 'hi';
  
  return {
    sessionId: `demo_${Date.now()}`,
    questions: [
      {
        id: 1,
        question: isHindi 
          ? 'अगर input null या undefined हो तो क्या होगा?'
          : 'What happens if the input is null or undefined?',
        focus: 'edge_case'
      },
      {
        id: 2,
        question: isHindi
          ? 'क्या यह code सभी data types के साथ काम करेगा?'
          : 'Will this code work with all data types?',
        focus: 'data_state'
      },
      {
        id: 3,
        question: isHindi
          ? 'Performance के लिए कोई concern है?'
          : 'Are there any performance concerns?',
        focus: 'logic_flow'
      }
    ],
    message: isHindi ? 'Questions generate हो गए (Demo Mode)' : 'Questions generated (Demo Mode)'
  };
}

function generateMockAnalysis(answers: any[], language: string): any {
  const isHindi = language === 'hi';
  
  return {
    analysis: {
      sessionId: `demo_${Date.now()}`,
      gaps: [
        {
          id: 'gap-1',
          severity: 'critical',
          category: 'error-handling',
          title: isHindi ? 'Null/Undefined Check Missing' : 'Null/Undefined Check Missing',
          description: isHindi ? 'Input validation नहीं है' : 'Missing input validation',
          userAnswer: answers[0]?.answer || '',
          actualBehavior: isHindi
            ? 'Code crash हो जाएगा अगर input null हो'
            : 'Code will crash if input is null',
          explanation: isHindi
            ? 'आपको input validate करना चाहिए। Null या undefined values के लिए check add करें।'
            : 'You should validate input. Add checks for null or undefined values.',
          codeSnippet: 'if (!input) {\n  throw new Error("Input required");\n}',
          lineNumber: 1
        },
        {
          id: 'gap-2',
          severity: 'moderate',
          category: 'data-state',
          title: isHindi ? 'Type Validation Missing' : 'Type Validation Missing',
          description: isHindi ? 'Type checking नहीं है' : 'Missing type checking',
          userAnswer: answers[1]?.answer || '',
          actualBehavior: isHindi
            ? 'Wrong data type के साथ unexpected results आ सकते हैं'
            : 'Wrong data types may produce unexpected results',
          explanation: isHindi
            ? 'Input की type check करें। typeof या instanceof का use करें।'
            : 'Check input types. Use typeof or instanceof operators.',
          codeSnippet: 'if (typeof input !== "string") {\n  return null;\n}',
          lineNumber: 3
        }
      ],
      correctUnderstandings: [
        isHindi
          ? 'आपने performance concern को सही identify किया'
          : 'You correctly identified the performance concern',
        isHindi
          ? 'Loop की complexity को सही समझा'
          : 'You understood the loop complexity correctly'
      ],
      checklist: [
        isHindi ? 'Input validation add करें' : 'Add input validation',
        isHindi ? 'Type checking implement करें' : 'Implement type checking',
        isHindi ? 'Error handling improve करें' : 'Improve error handling'
      ],
      testSuggestions: [
        isHindi ? 'Null input के साथ test करें' : 'Test with null input',
        isHindi ? 'Different data types try करें' : 'Try different data types'
      ]
    }
  };
}

// API request helper with timeout and error handling
export async function apiRequest(
  endpoint: string,
  body?: any
): Promise<any> {
  // Demo mode - return mock data
  if (DEMO_MODE) {
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
    
    if (endpoint === '/generate-questions') {
      return generateMockQuestions(body.code, body.context, body.language);
    }
    
    if (endpoint === '/analyze-answers') {
      return generateMockAnalysis(body.answers, body.language || 'en');
    }
    
    throw new Error('Unknown endpoint in demo mode');
  }

  // Real API mode
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
    if (!apiUrl) {
      throw new Error('API URL not configured');
    }

    const response = await fetch(`${apiUrl}${endpoint}`, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timed out. Please try again.');
      }
      throw error;
    }

    throw new Error('An unexpected error occurred');
  }
}

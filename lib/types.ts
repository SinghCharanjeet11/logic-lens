// Core type definitions for LogicLens

export type Language = 'en' | 'hi';

export type ContextType = 'understanding' | 'debugging' | 'optimizing';

export interface CodeInput {
  code: string;
  language: string;
  context: ContextType;
  errorMessage?: string;
}

export interface Question {
  id: string;
  question: string;
  focus: string;
  order: number;
}

export interface Answer {
  questionId: string;
  answer: string;
  skipped: boolean;
}

export interface ReasoningGap {
  id: string;
  severity: 'critical' | 'moderate' | 'minor';
  category: 'logic-flow' | 'data-state' | 'error-handling' | 'performance';
  title: string;
  description: string;
  userAnswer: string;
  actualBehavior: string;
  explanation: string;
  codeSnippet?: string;
  lineNumber?: number;
}

export interface AnalysisResult {
  sessionId: string;
  gaps: ReasoningGap[];
  correctUnderstandings: string[];
  refactoredCode?: string;
  checklist: string[];
  testSuggestions: string[];
}

export type Analysis = AnalysisResult;

export interface Session {
  id: string;
  codeInput: CodeInput;
  questions: Question[];
  answers: Answer[];
  analysisResult?: AnalysisResult;
  createdAt: string;
  updatedAt: string;
  language: Language;
}

export interface ConnectionSpeed {
  type: 'fast' | 'slow' | 'offline';
  effectiveType?: '4g' | '3g' | '2g' | 'slow-2g';
}

export interface UserSettings {
  language: Language;
  lowBandwidthMode: boolean;
  onboardingCompleted: boolean;
}

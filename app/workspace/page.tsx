'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import ContextSelector, { ContextType } from '@/components/ContextSelector';
import QuestionPanel from '@/components/QuestionPanel';
import ResultsPanel from '@/components/ResultsPanel';
import BadgesDisplay from '@/components/BadgesDisplay';
import ShareResultsCard from '@/components/ShareResultsCard';
import { Question, Answer, Analysis } from '@/lib/types';
import { apiRequest } from '@/services/aws-config';
import { detectLanguage } from '@/lib/languageDetector';
import { useGameProgress } from '@/hooks/useGameProgress';

// Dynamic import of Monaco Editor to prevent SSR hydration issues
const CodeEditor = dynamic(() => import('@/components/CodeEditor'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-900 rounded-2xl flex items-center justify-center">
      <div className="text-slate-400 text-sm">Loading editor...</div>
    </div>
  ),
});

type WorkflowStep = 'input' | 'questions' | 'results';

export default function WorkspacePage() {
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [step, setStep] = useState<WorkflowStep>('input');
  const [code, setCode] = useState('');
  const [detectedLang, setDetectedLang] = useState('javascript');
  const [context, setContext] = useState<ContextType | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [codeTab, setCodeTab] = useState<'original' | 'optimal'>('original');
  const [copied, setCopied] = useState(false);
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [showShareCard, setShowShareCard] = useState(false);
  const { recordSession, allBadges, streakDays, totalSessions } = useGameProgress();

  const isHindi = language === 'hi';

  // Auto-detect programming language when code changes
  useEffect(() => {
    if (code.trim().length > 10) {
      const detection = detectLanguage(code);
      setDetectedLang(detection.language);
    }
  }, [code]);

  const handleGenerateQuestions = async () => {
    if (!code.trim() || !context) {
      setError(isHindi ? 'कृपया code और context दोनों भरें' : 'Please provide both code and context');
      return;
    }

    const lines = code.split('\n').length;
    if (lines < 10) {
      setError(isHindi ? 'कम से कम 10 lines का code चाहिए' : 'Please provide at least 10 lines of code');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiRequest('/generate-questions', {
        code,
        context,
        language,
        difficulty
      });

      setSessionId(response.sessionId);
      setQuestions(response.questions);
      setStep('questions');
    } catch (err: any) {
      setError(err.message || (isHindi ? 'Questions generate करने में error' : 'Failed to generate questions'));
    } finally {
      setIsLoading(false);
    }
  };

  // Normalize any backend response shape into the frontend Analysis type
  const normalizeAnalysisResponse = (raw: any): Analysis => {
    if (!raw || typeof raw !== 'object') {
      return buildClientFallbackAnalysis();
    }

    // Map gaps: handle both backend field names
    const rawGaps = raw.gaps || [];
    const gaps = rawGaps.map((g: any, idx: number) => ({
      id: g.id || `gap-${idx + 1}`,
      severity: (['critical', 'moderate', 'minor'].includes(g.severity) ? g.severity : 'moderate') as 'critical' | 'moderate' | 'minor',
      category: (['logic-flow', 'data-state', 'error-handling', 'performance'].includes(g.category)
        ? g.category
        : (g.category || 'logic-flow').replace(/_/g, '-')) as 'logic-flow' | 'data-state' | 'error-handling' | 'performance',
      title: g.title || 'Reasoning gap found',
      description: g.description || g.misconception || g.title || '',
      userAnswer: g.userAnswer || g.developerAnswer || g.developer_answer || '',
      actualBehavior: g.actualBehavior || g.actual_behavior || g.actual || '',
      explanation: g.explanation || g.detail || g.description || '',
      codeSnippet: g.codeSnippet || g.code_snippet || '',
      lineNumber: g.lineNumber || (g.lineReferences ? g.lineReferences[0] : undefined),
    }));

    // Handle both correctUnderstandings and correctAnswers
    let correctUnderstandings: string[] = raw.correctUnderstandings || [];
    if (correctUnderstandings.length === 0 && raw.correctAnswers) {
      correctUnderstandings = raw.correctAnswers.map((ca: any) => {
        if (typeof ca === 'string') return ca;
        return ca.feedback || ca.understanding || ca.message || JSON.stringify(ca);
      });
    }

    return {
      sessionId: raw.sessionId || sessionId || `session_${Date.now()}`,
      gaps,
      correctUnderstandings,
      refactoredCode: raw.optimizedCode || raw.refactoredCode || raw.improved_code || '',
      checklist: raw.checklist || [],
      testSuggestions: raw.testSuggestions || raw.test_suggestions || [],
    };
  };

  // Client-side fallback analysis when everything fails
  const buildClientFallbackAnalysis = (): Analysis => ({
    sessionId: sessionId || `fallback_${Date.now()}`,
    gaps: questions.map((q, idx) => ({
      id: `gap-${idx + 1}`,
      severity: 'minor' as const,
      category: 'logic-flow' as const,
      title: isHindi ? `सवाल ${idx + 1} की समीक्षा` : `Review Question ${idx + 1}`,
      description: isHindi ? 'AI analysis उपलब्ध नहीं हो सका' : 'AI analysis was unavailable',
      userAnswer: '',
      actualBehavior: isHindi ? 'Code manually verify करें' : 'Please verify manually',
      explanation: q.question,
      codeSnippet: '',
    })),
    correctUnderstandings: [
      isHindi
        ? 'आपने code analyze करने की कोशिश की — यह अच्छी शुरुआत है।'
        : 'You attempted to analyze the code — great start!',
    ],
    checklist: [isHindi ? 'Code manually trace करें' : 'Trace the code manually'],
    testSuggestions: [isHindi ? 'Different inputs try करें' : 'Try different inputs'],
  });

  const handleSubmitAnswers = async (answers: Answer[]) => {
    if (!sessionId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiRequest('/analyze-answers', {
        sessionId,
        answers
      });

      // Robust extraction: handle multiple possible response shapes
      let rawAnalysis: any = null;

      // Shape 1: { analysis: { ... } } (expected from lambda)
      if (response?.analysis && typeof response.analysis === 'object') {
        rawAnalysis = response.analysis;
      }
      // Shape 2: response IS the analysis (has gaps directly)
      else if (response?.gaps) {
        rawAnalysis = response;
      }
      // Shape 3: API Gateway stringified body
      else if (typeof response?.body === 'string') {
        try {
          const parsed = JSON.parse(response.body);
          // Check if this is an error response, not analysis data
          if (parsed.error) {
            console.error('API returned error:', parsed.error, parsed.details);
            rawAnalysis = null; // Will trigger fallback
          } else {
            rawAnalysis = parsed.analysis || parsed;
          }
        } catch { /* ignore parse error */ }
      }
      // Shape 4: response itself if it has any analysis-like fields (but not error responses)
      else if (response && typeof response === 'object' && !response.error) {
        rawAnalysis = response;
      }

      const normalizedAnalysis = normalizeAnalysisResponse(rawAnalysis);
      setAnalysis(normalizedAnalysis);
      setStep('results');

      // Record session for gamification
      const correctCount = normalizedAnalysis.correctUnderstandings?.length || 0;
      const totalQ = questions.length || 5;
      recordSession(correctCount, totalQ);
    } catch (err: any) {
      console.error('Analysis error:', err);
      // Even on error, show fallback results instead of leaving the user stuck
      const fallback = buildClientFallbackAnalysis();
      setAnalysis(fallback);
      setStep('results');
      setError(
        isHindi
          ? 'AI analysis में समस्या हुई — fallback results दिखाए जा रहे हैं'
          : 'AI analysis had an issue — showing fallback results'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setStep('input');
    setCode('');
    setContext(null);
    setSessionId(null);
    setQuestions([]);
    setAnalysis(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-indigo-100/50 via-violet-50/30 to-transparent pointer-events-none" />
      <div className="absolute top-20 -right-40 w-80 h-80 bg-violet-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-40 -left-40 w-80 h-80 bg-indigo-200/20 rounded-full blur-3xl pointer-events-none" />

      {/* Content sits on top */}
      <div className="relative z-10">
        {/* Header */}
        <header className="bg-white/70 backdrop-blur-2xl backdrop-saturate-150 border-b border-white/40 sticky top-0 z-50 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center gap-4">
              {/* Left side: Home button + Logo */}
              <div className="flex items-center gap-6">
                {/* Back to Home Button */}
                <Link
                  href="/"
                  className="flex items-center gap-1.5 px-3 py-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all text-sm font-medium group"
                  aria-label="Back to home"
                >
                  <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  <span>Home</span>
                </Link>

                {/* Logo */}
                <div className="flex items-center gap-3">
                  {/* Icon */}
                  <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      {/* Left brace */}
                      <path d="M8 3c-2 0-3 1-3 3v4c0 2-1 3-3 3 2 0 3 1 3 3v4c0 2 1 3 3 3" />
                      {/* Right brace */}
                      <path d="M16 3c2 0 3 1 3 3v4c0 2 1 3 3 3-2 0-3 1-3 3v4c0 2-1 3-3 3" />
                      {/* Center dot */}
                      <circle cx="12" cy="13" r="1" fill="white" stroke="none" />
                    </svg>
                  </div>
                  {/* Text */}
                  <div>
                    <h1 className="text-lg font-bold text-slate-900 leading-tight tracking-tight">
                      Logic<span className="text-indigo-600">Lens</span>
                    </h1>
                    <p className="text-[9px] text-slate-400 font-medium tracking-wider uppercase leading-none">
                      {isHindi ? 'Code Reasoning जांचें' : 'Code Reasoning Check'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Step Indicator */}
              <div className="hidden md:flex items-center gap-2">
                {[
                  { label: 'Paste Code', step: 'input' as WorkflowStep },
                  { label: 'Answer', step: 'questions' as WorkflowStep },
                  { label: 'Results', step: 'results' as WorkflowStep },
                ].map((s, i, arr) => (
                  <div key={s.step} className="flex items-center gap-2">
                    <div className={`
                    flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all
                    ${step === s.step
                        ? 'bg-indigo-100 text-indigo-700 ring-2 ring-indigo-500/20'
                        : (['input', 'questions', 'results'] as WorkflowStep[]).indexOf(step) > i
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-100 text-slate-400'
                      }
                  `}>
                      <span className="w-5 h-5 rounded-full bg-current/10 flex items-center justify-center text-[11px]">
                        {(['input', 'questions', 'results'] as WorkflowStep[]).indexOf(step) > i ? '✓' : i + 1}
                      </span>
                      {s.label}
                    </div>
                    {i < arr.length - 1 && (
                      <div className={`w-6 h-0.5 rounded ${(['input', 'questions', 'results'] as WorkflowStep[]).indexOf(step) > i ? 'bg-emerald-300' : 'bg-slate-200'
                        }`} />
                    )}
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-3">
                {/* Language Toggle - Segmented Control */}
                <div className="flex bg-slate-100 rounded-lg p-0.5 border border-slate-200">
                  <button
                    onClick={() => setLanguage('en')}
                    className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 ${language === 'en'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                      }`}
                  >
                    EN
                  </button>
                  <button
                    onClick={() => setLanguage('hi')}
                    className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 ${language === 'hi'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                      }`}
                  >
                    हिंदी
                  </button>
                </div>
                {step !== 'input' && (
                  <button
                    onClick={handleReset}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                  >
                    ↻ {isHindi ? 'नया शुरू करें' : 'Start Over'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Error Banner */}
        {error && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <span className="text-red-500 text-xl">⚠️</span>
              <div className="flex-1">
                <p className="text-red-800 font-medium">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {step === 'input' && (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Left: Code Input - 60% width */}
              <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-1">
                  {isHindi ? 'अपना Code Paste करें' : 'Paste Your Code'}
                </h2>
                <p className="text-sm text-slate-500 mb-1">
                  Detected language: <span className="font-medium text-slate-700">{detectedLang}</span>
                </p>
                <p className="text-xs text-slate-400 mb-4">
                  {isHindi ? 'सार्थक code paste करें — हम logic पर focus करते हैं, syntax errors पर नहीं' : 'Paste meaningful code — we focus on logic, not syntax errors'}
                </p>
                <div className="h-96">
                  <CodeEditor
                    value={code}
                    onChange={setCode}
                    language={detectedLang}
                  />
                </div>
              </div>

              {/* Right: Context Selection - 40% width */}
              <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col">
                <h2 className="text-lg font-bold text-slate-900 mb-1">
                  {isHindi ? 'अपना Goal चुनें' : 'Choose Your Goal'}
                </h2>
                <p className="text-sm text-slate-400 mb-1">Select what you want to focus on</p>
                <p className="text-xs text-slate-500 mb-5">
                  {isHindi ? 'आपकी choice तय करती है कि हम कैसे questions पूछेंगे' : 'Your choice decides the kind of questions we ask'}
                </p>
                <ContextSelector
                  value={context}
                  onChange={setContext}
                  language={language}
                />

                {/* Difficulty Level Selector */}
                <div className="mt-5">
                  <p className="text-sm font-semibold text-slate-700 mb-2">
                    {isHindi ? 'कठिनाई स्तर' : 'Difficulty Level'}
                  </p>
                  <div className="flex bg-slate-100 rounded-lg p-1 border border-slate-200">
                    {[
                      { value: 'beginner' as const, label: isHindi ? '🌱 शुरुआती' : '🌱 Beginner', color: 'emerald' },
                      { value: 'intermediate' as const, label: isHindi ? '⚡ मध्यम' : '⚡ Intermediate', color: 'indigo' },
                      { value: 'advanced' as const, label: isHindi ? '🔥 उन्नत' : '🔥 Advanced', color: 'rose' },
                    ].map((d) => (
                      <button
                        key={d.value}
                        onClick={() => setDifficulty(d.value)}
                        className={`flex-1 px-2 py-2 rounded-md text-xs font-semibold transition-all duration-200 ${difficulty === d.value
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-500 hover:text-slate-700'
                          }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1.5">
                    {difficulty === 'beginner' && (isHindi ? 'Output और basic logic के सवाल' : 'Questions about output & basic logic')}
                    {difficulty === 'intermediate' && (isHindi ? 'Edge cases और data flow के सवाल' : 'Questions about edge cases & data flow')}
                    {difficulty === 'advanced' && (isHindi ? 'Complexity, design patterns और tradeoffs' : 'Complexity, design patterns & tradeoffs')}
                  </p>
                </div>

                <div className="mt-auto pt-6">
                  <button
                    onClick={handleGenerateQuestions}
                    disabled={!code.trim() || !context || isLoading}
                    className="w-full px-6 py-4 bg-gradient-to-r from-indigo-500 to-violet-500 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:scale-100 transition-all duration-200"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        {isHindi ? 'Questions बन रहे हैं...' : 'Generating Questions...'}
                      </span>
                    ) : (
                      <>{isHindi ? 'Questions Generate करें →' : 'Generate Questions →'}</>
                    )}
                  </button>
                  <p className="text-xs text-center text-slate-400 mt-3">
                    {isHindi ? 'हम पहले questions पूछेंगे, फिर explanations देंगे' : "We'll ask questions before giving explanations"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {step === 'questions' && (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Left: Code (Read-only) */}
              <div className="lg:col-span-2 bg-white/80 rounded-2xl shadow-sm border border-slate-200 p-6 opacity-90">
                <h2 className="text-lg font-bold text-slate-900 mb-1">
                  {isHindi ? 'आपका Code' : 'Your Code'}
                </h2>
                <p className="text-sm text-slate-400 mb-4">Reference</p>
                <div className="h-96">
                  <CodeEditor
                    value={code}
                    onChange={() => { }}
                    language={detectedLang}
                    readOnly
                  />
                </div>
              </div>

              {/* Right: Questions */}
              <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-1">
                  {isHindi ? 'अपनी सोच को परखें' : 'Check Your Reasoning'}
                </h2>
                <p className="text-sm text-slate-400 mb-1">
                  {isHindi ? 'अपने code के बारे में सवालों के जवाब दें' : 'Answer questions about your code'}
                </p>
                {/* Reassurance line */}
                <p className="text-xs text-emerald-600/70 mb-4 flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {isHindi ? 'गलत जवाब का कोई नुकसान नहीं है' : 'No penalties for wrong answers'}
                </p>
                <div className="min-h-[420px]">
                  <QuestionPanel
                    questions={questions}
                    onSubmit={handleSubmitAnswers}
                    language={language}
                    isLoading={isLoading}
                  />
                </div>
              </div>
            </div>
          )}

          {step === 'results' && analysis && (() => {
            const optimizedCode = analysis.refactoredCode || '';
            return (
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Left: Code with Original/Optimal tabs */}
                <div className="lg:col-span-2 bg-white/80 rounded-2xl shadow-sm border border-slate-200 p-6">
                  {/* Tab Switcher */}
                  <div className="flex items-center gap-1 mb-4 bg-slate-100 rounded-lg p-1">
                    <button
                      onClick={() => setCodeTab('original')}
                      className={`flex-1 px-3 py-2 rounded-md text-xs font-semibold transition-all duration-200 ${codeTab === 'original'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                      📝 {isHindi ? 'Original Code' : 'Original Code'}
                    </button>
                    <button
                      onClick={() => setCodeTab('optimal')}
                      disabled={!optimizedCode}
                      className={`flex-1 px-3 py-2 rounded-md text-xs font-semibold transition-all duration-200 ${codeTab === 'optimal'
                        ? 'bg-emerald-50 text-emerald-700 shadow-sm ring-1 ring-emerald-200'
                        : optimizedCode
                          ? 'text-slate-500 hover:text-emerald-600'
                          : 'text-slate-300 cursor-not-allowed'
                        }`}
                    >
                      ✨ {isHindi ? 'Optimal Solution' : 'Optimal Solution'}
                    </button>
                  </div>

                  {/* Code description */}
                  <p className="text-sm text-slate-400 mb-3">
                    {codeTab === 'original'
                      ? (isHindi ? 'आपका submitted code' : 'Your submitted code')
                      : (isHindi ? 'बेहतर practices के साथ improved version' : 'Improved version with better practices')
                    }
                  </p>

                  {/* Editor */}
                  <div className="h-96">
                    <CodeEditor
                      value={codeTab === 'optimal' && optimizedCode ? optimizedCode : code}
                      onChange={() => { }}
                      language={detectedLang}
                      readOnly
                    />
                  </div>

                  {/* Optimal code badge + copy button */}
                  {codeTab === 'optimal' && optimizedCode && (
                    <div className="mt-3 p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between">
                      <p className="text-xs text-emerald-700 font-medium flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        {isHindi ? 'AI-generated improved code' : 'AI-generated improved code'}
                      </p>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(optimizedCode);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        }}
                        className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 ${copied
                          ? 'bg-emerald-200 text-emerald-800'
                          : 'bg-white text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                          }`}
                      >
                        {copied ? (
                          <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Copied!</>
                        ) : (
                          <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" strokeWidth={2} /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg> Copy Code</>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* Right: Results */}
                <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                  <h2 className="text-lg font-bold text-slate-900 mb-1">
                    {isHindi ? 'आपकी समझ' : 'Your Understanding'}
                  </h2>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-slate-400">
                      {isHindi ? 'आपकी सोच का विश्लेषण' : 'Analysis of your reasoning'}
                    </p>
                    <button
                      onClick={() => setShowShareCard(true)}
                      className="px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 border border-indigo-200"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                      {isHindi ? 'Share करें' : 'Share Score'}
                    </button>
                  </div>

                  <div className="max-h-[calc(100vh-220px)] overflow-y-auto pr-1 scrollbar-thin">
                    <ResultsPanel
                      analysis={analysis}
                      language={language}
                      onReset={handleReset}
                    />
                    <BadgesDisplay
                      badges={allBadges}
                      streakDays={streakDays}
                      totalSessions={totalSessions}
                      language={language}
                    />
                  </div>
                </div>
              </div>
            );
          })()}
        </main>
      </div>

      {/* Share Results Modal */}
      {showShareCard && analysis && (
        <ShareResultsCard
          analysis={analysis}
          language={language}
          onClose={() => setShowShareCard(false)}
        />
      )}
    </div>
  );
}

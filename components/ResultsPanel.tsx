'use client';

import { useState } from 'react';
import { Analysis } from '@/lib/types';
import {
  AlertOctagon, AlertTriangle, Lightbulb, Info, CheckCircle2, ChevronDown,
  MessageSquare, Eye, HelpCircle, TrendingUp, RotateCcw, ArrowRight
} from 'lucide-react';

interface ResultsPanelProps {
  analysis: Analysis;
  language?: 'en' | 'hi';
  onReset?: () => void;
}

export default function ResultsPanel({
  analysis,
  language = 'en',
  onReset
}: ResultsPanelProps) {
  const [expandedGapId, setExpandedGapId] = useState<string | null>(
    analysis.gaps?.[0]?.id || null
  );
  const isHindi = language === 'hi';

  const toggleGap = (gapId: string) => {
    setExpandedGapId(prev => prev === gapId ? null : gapId);
  };

  const gapCount = analysis.gaps?.length || 0;
  const correctCount = analysis.correctUnderstandings?.length || 0;
  const totalQuestions = gapCount + correctCount;
  const overallScore = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  const getUnderstandingLevel = (score: number) => {
    if (score >= 80) return { label: 'Strong', labelHi: 'मजबूत' };
    if (score >= 50) return { label: 'Developing', labelHi: 'विकसित हो रही' };
    return { label: 'Early', labelHi: 'शुरुआती' };
  };

  const getSeverityLabel = (severity: string, isHindi: boolean) => {
    switch (severity) {
      case 'critical': return isHindi ? 'ज़रूरी' : 'Important';
      case 'moderate': return isHindi ? 'सहायक' : 'Helpful';
      case 'minor': return isHindi ? 'सुझाव' : 'Suggestion';
      default: return isHindi ? 'जानकारी' : 'Info';
    }
  };

  const getSeverityConfig = (severity: string) => {
    switch (severity) {
      case 'critical':
        return {
          icon: AlertOctagon,
          borderColor: 'border-l-rose-400',
          badgeBg: 'bg-rose-100',
          badgeText: 'text-rose-600',
          iconColor: 'text-rose-400',
        };
      case 'moderate':
        return {
          icon: AlertTriangle,
          borderColor: 'border-l-amber-500',
          badgeBg: 'bg-amber-100',
          badgeText: 'text-amber-700',
          iconColor: 'text-amber-500',
        };
      case 'minor':
        return {
          icon: Lightbulb,
          borderColor: 'border-l-blue-500',
          badgeBg: 'bg-blue-100',
          badgeText: 'text-blue-700',
          iconColor: 'text-blue-500',
        };
      default:
        return {
          icon: Info,
          borderColor: 'border-l-slate-400',
          badgeBg: 'bg-slate-100',
          badgeText: 'text-slate-600',
          iconColor: 'text-slate-400',
        };
    }
  };

  const getImprovementTips = (category: string, isHindi: boolean): string[] => {
    const tips: Record<string, { en: string[]; hi: string[] }> = {
      'error-handling': {
        en: ['Add input validation at the start of your function', 'Use try-catch blocks for operations that might fail'],
        hi: ['Function की शुरुआत में input validation add करें', 'fail हो सकने वाले operations के लिए try-catch use करें'],
      },
      'data-state': {
        en: ['Check the type of input before processing', 'Use typeof or instanceof to validate data shapes'],
        hi: ['Processing से पहले input का type check करें', 'Data shapes validate करने के लिए typeof या instanceof use करें'],
      },
      'logic-flow': {
        en: ['Trace through the code with sample inputs on paper', 'Add console.log at key points to verify flow'],
        hi: ['Sample inputs के साथ code को paper पर trace करें', 'Flow verify करने के लिए key points पर console.log add करें'],
      },
      'performance': {
        en: ['Consider the time complexity of your approach', 'Look for unnecessary iterations or memory allocations'],
        hi: ['अपने approach की time complexity पर विचार करें', 'Unnecessary iterations या memory allocations ढूंढें'],
      },
    };
    const categoryTips = tips[category] || tips['logic-flow'];
    return isHindi ? categoryTips.hi : categoryTips.en;
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Hero Summary Card - Dark Gradient */}
      <div className="relative rounded-2xl p-6 overflow-hidden">
        {/* Card background with visible gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.15),_transparent_50%)]" />

        {/* Content — white text on dark gradient */}
        <div className="relative z-10 text-white">
          {/* Understanding Level — BIG and prominent */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-white/70 mb-1">
                {isHindi ? 'समझ का स्तर' : 'Understanding Level'}
              </p>
              <p className="text-3xl font-extrabold tracking-tight">
                {isHindi ? getUnderstandingLevel(overallScore).labelHi : getUnderstandingLevel(overallScore).label}
              </p>
            </div>
            {/* Circular indicator */}
            <div className="relative w-16 h-16">
              <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="28" fill="none" strokeWidth="4" className="stroke-white/20" />
                <circle cx="32" cy="32" r="28" fill="none" strokeWidth="4"
                  strokeLinecap="round"
                  className="stroke-white transition-all duration-1000 ease-out"
                  strokeDasharray={`${2 * Math.PI * 28}`}
                  strokeDashoffset={`${2 * Math.PI * 28 * (1 - overallScore / 100)}`}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white">
                {correctCount}/{totalQuestions}
              </span>
            </div>
          </div>

          {/* Stats chips */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
              <span className="text-xs font-semibold text-white/90">{correctCount} {isHindi ? 'सही' : 'Correct'}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-300" />
              <span className="text-xs font-semibold text-white/90">{gapCount} {isHindi ? 'Gaps' : 'Gaps'}</span>
            </div>
          </div>

          {/* Reassurance */}
          <p className="text-xs text-white/50 leading-relaxed">
            {isHindi
              ? 'समझ अभ्यास से बेहतर होती है — gaps मिलना सीखने की शुरुआत है।'
              : 'Understanding improves with practice — finding gaps is where learning begins.'}
          </p>
        </div>
      </div>

      {/* Gaps */}
      {analysis.gaps && analysis.gaps.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-slate-900 text-base flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            {isHindi ? 'सीखने के मौके' : 'Learning Opportunities'}
          </h3>
          <p className="text-xs text-slate-400 mt-1 mb-3">
            {isHindi ? 'हर gap एक सीखने का मौका है' : 'Each gap is a chance to deepen your understanding'}
          </p>
          <div className="space-y-3 stagger-children">
            {analysis.gaps.map((gap) => {
              const config = getSeverityConfig(gap.severity);
              const Icon = config.icon;
              const isExpanded = expandedGapId === gap.id;

              return (
                <div
                  key={gap.id}
                  className={`rounded-2xl overflow-hidden transition-all duration-300 
                    ${isExpanded
                      ? 'shadow-lg shadow-slate-200/50 ring-1 ring-slate-200'
                      : 'shadow-sm hover:shadow-md hover:-translate-y-0.5'
                    }
                    bg-white border-l-[3px] ${config.borderColor}`}
                >
                  <button
                    onClick={() => toggleGap(gap.id)}
                    className="w-full text-left p-5 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      {/* Colored icon container */}
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${config.badgeBg}`}>
                        <Icon className={`w-4 h-4 ${config.iconColor}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={`text-[10px] uppercase tracking-wider font-bold ${config.badgeText}`}>
                            {getSeverityLabel(gap.severity, isHindi)}
                          </span>
                          <span className="text-[10px] text-slate-300">•</span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {gap.category?.replace(/[-_]/g, ' ')}
                          </span>
                        </div>
                        <h4 className="font-semibold text-slate-800 text-[15px] group-hover:text-indigo-600 transition-colors">
                          {gap.title}
                        </h4>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-slate-300 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-indigo-500' : 'group-hover:text-slate-500'
                        }`} />
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-5 pb-5 pt-1 space-y-4 border-t border-slate-100 animate-fade-in">
                      {/* What you thought */}
                      <div className="bg-slate-50 rounded-xl p-4">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <MessageSquare className="w-3 h-3" />
                          {isHindi ? 'आपका सोचना' : 'What you thought'}
                        </p>
                        {gap.userAnswer?.trim() ? (
                          <p className="text-sm text-slate-600 leading-relaxed">{gap.userAnswer}</p>
                        ) : (
                          <p className="text-sm text-slate-400 italic">
                            {isHindi ? 'आपने यह छोड़ दिया — कोई बात नहीं।' : "You skipped this — that's okay."}
                          </p>
                        )}
                      </div>

                      {/* What actually happens */}
                      <div className="bg-amber-50/50 rounded-xl p-4 border border-amber-100/50">
                        <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <Eye className="w-3 h-3" />
                          {isHindi ? 'असल में क्या होता है' : 'What actually happens'}
                        </p>
                        <p className="text-sm text-slate-700 leading-relaxed">{gap.actualBehavior}</p>
                      </div>

                      {/* Why this matters */}
                      <div className="bg-white rounded-xl p-4 border border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <HelpCircle className="w-3 h-3" />
                          {isHindi ? 'यह क्यों ज़रूरी है' : 'Why this matters'}
                        </p>
                        <p className="text-sm text-slate-600 leading-relaxed">{gap.explanation}</p>
                      </div>

                      {/* How to improve */}
                      <div className="bg-gradient-to-r from-emerald-50 to-teal-50/50 rounded-xl p-4 border border-emerald-100/50">
                        <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <TrendingUp className="w-3 h-3" />
                          {isHindi ? 'कैसे सुधारें' : 'How to improve'}
                        </p>
                        <ul className="text-sm text-emerald-700 space-y-1.5">
                          {getImprovementTips(gap.category, isHindi).map((tip, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-emerald-400 mt-1 text-xs">→</span>
                              <span className="leading-relaxed">{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {gap.codeSnippet && (
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                            {isHindi ? 'संबंधित Code' : 'Related Code'}
                          </p>
                          <pre className="text-xs bg-slate-900 text-slate-100 p-4 rounded-xl overflow-x-auto leading-relaxed">
                            <code>{gap.codeSnippet}</code>
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Correct Understanding */}
      {analysis.correctUnderstandings && analysis.correctUnderstandings.length > 0 && (
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-5 border border-emerald-100/50">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600" />
            </div>
            <div>
              <h4 className="font-bold text-emerald-800 text-sm mb-0.5">
                {isHindi ? 'बहुत अच्छा!' : 'Nice work!'} 🎯
              </h4>
              <p className="text-sm text-emerald-600 leading-relaxed mb-2">
                {isHindi
                  ? `आपने ${correctCount} बातें सही समझीं — आपकी सोच सही दिशा में है।`
                  : `You got ${correctCount} thing${correctCount > 1 ? 's' : ''} right — your thinking is on track.`
                }
              </p>
              {analysis.correctUnderstandings.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {analysis.correctUnderstandings.map((item, idx) => (
                    <li key={idx} className="text-xs text-emerald-500 flex items-start gap-1.5">
                      <span className="mt-0.5">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Empty state fallback — if no gaps and no correct understandings, show a message */}
      {(!analysis.gaps || analysis.gaps.length === 0) && (!analysis.correctUnderstandings || analysis.correctUnderstandings.length === 0) && (
        <div className="bg-gradient-to-r from-indigo-50 to-violet-50 rounded-2xl p-6 border border-indigo-100/50 text-center">
          <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-6 h-6 text-indigo-600" />
          </div>
          <h4 className="font-bold text-indigo-800 text-base mb-2">
            {isHindi ? 'विश्लेषण पूरा हुआ' : 'Analysis Complete'}
          </h4>
          <p className="text-sm text-indigo-600 leading-relaxed max-w-md mx-auto">
            {isHindi
              ? 'आपकी सोच की जांच हो गई है। कोई significant gap नहीं पाया गया — बहुत बढ़िया!'
              : 'Your reasoning has been checked. No significant gaps were found — great job!'}
          </p>
        </div>
      )}

      {/* Action buttons */}
      <div className="pt-5 mt-3 space-y-3">
        {onReset && (
          <button
            onClick={onReset}
            className="w-full px-6 py-4 bg-gradient-to-r from-indigo-500 to-violet-500 text-white rounded-2xl
              font-bold text-[15px] shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 
              hover:scale-[1.015] active:scale-[0.99] transition-all duration-200 
              flex items-center justify-center gap-2 animate-pulse-glow"
          >
            {isHindi ? 'नया Code Try करें' : 'Try Another Code'}
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="w-full px-4 py-2.5 text-slate-400 hover:text-slate-600 text-sm font-medium 
            transition-colors flex items-center justify-center gap-1.5 hover:bg-slate-50 rounded-xl"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          {isHindi ? 'जवाब दोबारा देखें' : 'Review My Answers'}
        </button>
      </div>
    </div>
  );
}

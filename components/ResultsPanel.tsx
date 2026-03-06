'use client';

import { useState } from 'react';
import { Analysis } from '@/lib/types';

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
  const [expandedGapId, setExpandedGapId] = useState<string | null>(null);
  const isHindi = language === 'hi';

  const toggleGap = (gapId: string) => {
    setExpandedGapId(prev => prev === gapId ? null : gapId);
  };

  const gapCount = analysis.gaps?.length || 0;
  const correctCount = analysis.correctUnderstandings?.length || 0;
  const totalQuestions = gapCount + correctCount;
  const overallScore = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  const getSeverityConfig = (severity: string) => {
    switch (severity) {
      case 'critical':
        return {
          label: 'CRITICAL',
          labelHi: 'गंभीर',
          border: 'border-l-red-500',
          bg: 'bg-red-50 dark:bg-red-950/30',
          text: 'text-red-600 dark:text-red-400',
          dot: 'bg-red-500',
          detailBorder: 'border-red-500/20',
        };
      case 'moderate':
        return {
          label: 'MODERATE',
          labelHi: 'मध्यम',
          border: 'border-l-amber-500',
          bg: 'bg-amber-50 dark:bg-amber-950/30',
          text: 'text-amber-600 dark:text-amber-400',
          dot: 'bg-amber-500',
          detailBorder: 'border-amber-500/20',
        };
      case 'minor':
        return {
          label: 'MINOR',
          labelHi: 'सुझाव',
          border: 'border-l-blue-500',
          bg: 'bg-blue-50 dark:bg-blue-950/30',
          text: 'text-blue-600 dark:text-blue-400',
          dot: 'bg-blue-500',
          detailBorder: 'border-blue-500/20',
        };
      default:
        return {
          label: 'INFO',
          labelHi: 'जानकारी',
          border: 'border-l-slate-400',
          bg: 'bg-slate-50 dark:bg-slate-800',
          text: 'text-slate-500 dark:text-slate-400',
          dot: 'bg-slate-400',
          detailBorder: 'border-slate-200 dark:border-slate-700',
        };
    }
  };

  return (
    <div className="flex flex-col gap-4">

      {/* Summary Stats Bar */}
      <div className="grid grid-cols-3 gap-3 stagger-children">
        <div className={`p-4 rounded-xl text-center border ${gapCount > 0 ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800' : 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800'
          }`}>
          <div className={`text-[28px] font-extrabold ${gapCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {gapCount}
          </div>
          <div className={`text-[10px] font-semibold uppercase tracking-wide mt-1 ${gapCount > 0 ? 'text-red-500' : 'text-green-500'
            }`}>
            {isHindi ? 'Gaps पाए गए' : 'Gaps Found'}
          </div>
        </div>
        <div className="p-4 rounded-xl text-center bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
          <div className="text-[28px] font-extrabold text-green-600">
            {correctCount}
          </div>
          <div className="text-[10px] font-semibold uppercase tracking-wide mt-1 text-green-500">
            {isHindi ? 'सही समझा' : 'Correct'}
          </div>
        </div>
        <div className="p-4 rounded-xl text-center bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800">
          <div className="text-[28px] font-extrabold text-indigo-600">
            {overallScore}%
          </div>
          <div className="text-[10px] font-semibold uppercase tracking-wide mt-1 text-indigo-500">
            {isHindi ? 'स्कोर' : 'Score'}
          </div>
        </div>
      </div>

      {/* Gap Cards */}
      {analysis.gaps && analysis.gaps.length > 0 && (
        <div className="flex flex-col gap-3">
          {analysis.gaps.map((gap) => {
            const config = getSeverityConfig(gap.severity);
            const isExpanded = expandedGapId === gap.id;

            return (
              <div
                key={gap.id}
                className={`rounded-xl border-l-4 ${config.border} ${config.bg} overflow-hidden transition-all duration-200`}
              >
                {/* Clickable Header */}
                <button
                  onClick={() => toggleGap(gap.id)}
                  className="w-full py-3.5 px-4 bg-transparent border-none cursor-pointer text-left flex items-start justify-between gap-3"
                >
                  <div className="flex-1">
                    {/* Severity Label */}
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className={`w-2 h-2 rounded-full ${config.dot} inline-block`} />
                      <span className={`text-[10px] font-bold uppercase tracking-wide ${config.text}`}>
                        {isHindi ? config.labelHi : config.label}
                      </span>
                    </div>
                    {/* Title */}
                    <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-0.5">
                      {gap.title}
                    </div>
                    {/* Short description */}
                    <div className="text-xs text-slate-500 dark:text-slate-400 leading-snug">
                      {gap.description}
                    </div>
                  </div>
                  {/* Chevron */}
                  <svg
                    width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    className={`flex-shrink-0 mt-1 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-4 pb-4 flex flex-col gap-2.5 border-t border-black/5 animate-fade-in">
                    {/* Your Answer */}
                    {gap.userAnswer && gap.userAnswer.trim() && (
                      <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700 mt-2.5">
                        <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-1.5">
                          💬 {isHindi ? 'आपका जवाब' : 'Your Answer'}
                        </div>
                        <div className="text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed">
                          {gap.userAnswer}
                        </div>
                      </div>
                    )}

                    {/* What Actually Happens */}
                    <div className={`bg-white dark:bg-slate-800 rounded-lg p-3 border ${config.detailBorder} ${!gap.userAnswer?.trim() ? 'mt-2.5' : ''
                      }`}>
                      <div className={`text-[10px] font-bold uppercase tracking-wide ${config.text} mb-1.5`}>
                        👁️ {isHindi ? 'असल में क्या होता है' : 'What Actually Happens'}
                      </div>
                      <div className="text-[13px] text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                        {gap.actualBehavior}
                      </div>
                    </div>

                    {/* Explanation */}
                    {gap.explanation && (
                      <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
                        <div className="text-[10px] font-bold uppercase tracking-wide text-indigo-500 dark:text-indigo-400 mb-1.5">
                          💡 {isHindi ? 'विस्तृत समझ' : 'Detailed Explanation'}
                        </div>
                        <div className="text-[13px] text-slate-700 dark:text-slate-300 leading-relaxed">
                          {gap.explanation}
                        </div>
                      </div>
                    )}

                    {/* Code Snippet */}
                    {gap.codeSnippet && (
                      <div className="bg-slate-800 rounded-lg p-3 font-mono text-xs text-slate-200 leading-relaxed overflow-x-auto whitespace-pre-wrap">
                        {gap.codeSnippet}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* What You Got Right */}
      {analysis.correctUnderstandings && analysis.correctUnderstandings.length > 0 && (
        <div className="bg-green-50 dark:bg-green-950/30 rounded-xl p-4 border-l-4 border-l-green-500">
          <div className="flex items-center gap-1.5 mb-2.5">
            <span className="text-base">✅</span>
            <span className="text-sm font-bold text-green-800 dark:text-green-400">
              {isHindi ? 'आपने क्या सही समझा' : 'What You Got Right'}
            </span>
          </div>
          <div className="flex flex-col gap-1.5">
            {analysis.correctUnderstandings.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2 text-[13px] text-green-800 dark:text-green-300 leading-relaxed">
                <span className="text-green-500 font-bold flex-shrink-0">✓</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Checklist */}
      {analysis.checklist && analysis.checklist.length > 0 && (
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2.5">
            📋 {isHindi ? 'सुधार Checklist' : 'Improvement Checklist'}
          </div>
          <div className="flex flex-col gap-1.5">
            {analysis.checklist.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                <span className="w-4 h-4 rounded border-[1.5px] border-slate-300 dark:border-slate-600 flex items-center justify-center flex-shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {(!analysis.gaps || analysis.gaps.length === 0) &&
        (!analysis.correctUnderstandings || analysis.correctUnderstandings.length === 0) && (
          <div className="bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-950/30 dark:to-violet-950/20 rounded-xl p-6 text-center border border-indigo-200 dark:border-indigo-800">
            <div className="text-[32px] mb-2">🎉</div>
            <div className="text-base font-bold text-indigo-800 dark:text-indigo-300 mb-1">
              {isHindi ? 'विश्लेषण पूरा हुआ' : 'Analysis Complete'}
            </div>
            <div className="text-[13px] text-indigo-500 dark:text-indigo-400">
              {isHindi
                ? 'कोई significant gap नहीं पाया गया — बहुत बढ़िया!'
                : 'No significant gaps found — great job!'}
            </div>
          </div>
        )}

      {/* Action Buttons */}
      <div className="flex flex-col gap-2.5 pt-2">
        {onReset && (
          <button
            onClick={onReset}
            className="w-full py-3.5 rounded-xl border-none bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-[15px] font-bold cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            {isHindi ? 'नया Code Try करें' : 'Try Another Code'} →
          </button>
        )}
      </div>
    </div>
  );
}

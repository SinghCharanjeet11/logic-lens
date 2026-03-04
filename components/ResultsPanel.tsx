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
          borderColor: '#EF4444',
          bgColor: '#FEF2F2',
          textColor: '#DC2626',
          dotColor: '#EF4444',
        };
      case 'moderate':
        return {
          label: 'MODERATE',
          labelHi: 'मध्यम',
          borderColor: '#F59E0B',
          bgColor: '#FFFBEB',
          textColor: '#D97706',
          dotColor: '#F59E0B',
        };
      case 'minor':
        return {
          label: 'MINOR',
          labelHi: 'सुझाव',
          borderColor: '#3B82F6',
          bgColor: '#EFF6FF',
          textColor: '#2563EB',
          dotColor: '#3B82F6',
        };
      default:
        return {
          label: 'INFO',
          labelHi: 'जानकारी',
          borderColor: '#94A3B8',
          bgColor: '#F8FAFC',
          textColor: '#64748B',
          dotColor: '#94A3B8',
        };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* Summary Stats Bar */}
      <div style={{ display: 'flex', gap: '12px' }}>
        <div style={{
          flex: 1, padding: '16px', borderRadius: '12px', textAlign: 'center',
          background: gapCount > 0 ? '#FEF2F2' : '#F0FDF4',
          border: `1px solid ${gapCount > 0 ? '#FECACA' : '#BBF7D0'}`
        }}>
          <div style={{ fontSize: '28px', fontWeight: 800, color: gapCount > 0 ? '#DC2626' : '#16A34A' }}>
            {gapCount}
          </div>
          <div style={{
            fontSize: '10px', fontWeight: 600, textTransform: 'uppercase' as const,
            letterSpacing: '0.5px', marginTop: '4px', color: gapCount > 0 ? '#EF4444' : '#22C55E'
          }}>
            {isHindi ? 'Gaps पाए गए' : 'Gaps Found'}
          </div>
        </div>
        <div style={{
          flex: 1, padding: '16px', borderRadius: '12px', textAlign: 'center',
          background: '#F0FDF4', border: '1px solid #BBF7D0'
        }}>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#16A34A' }}>
            {correctCount}
          </div>
          <div style={{
            fontSize: '10px', fontWeight: 600, textTransform: 'uppercase' as const,
            letterSpacing: '0.5px', marginTop: '4px', color: '#22C55E'
          }}>
            {isHindi ? 'सही समझा' : 'Correct'}
          </div>
        </div>
        <div style={{
          flex: 1, padding: '16px', borderRadius: '12px', textAlign: 'center',
          background: '#EEF2FF', border: '1px solid #C7D2FE'
        }}>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#4F46E5' }}>
            {overallScore}%
          </div>
          <div style={{
            fontSize: '10px', fontWeight: 600, textTransform: 'uppercase' as const,
            letterSpacing: '0.5px', marginTop: '4px', color: '#6366F1'
          }}>
            {isHindi ? 'स्कोर' : 'Score'}
          </div>
        </div>
      </div>

      {/* Gap Cards */}
      {analysis.gaps && analysis.gaps.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {analysis.gaps.map((gap) => {
            const config = getSeverityConfig(gap.severity);
            const isExpanded = expandedGapId === gap.id;

            return (
              <div
                key={gap.id}
                style={{
                  borderRadius: '12px',
                  borderLeft: `4px solid ${config.borderColor}`,
                  background: config.bgColor,
                  overflow: 'hidden',
                  transition: 'all 0.2s ease',
                }}
              >
                {/* Clickable Header */}
                <button
                  onClick={() => toggleGap(gap.id)}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '12px',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    {/* Severity Label */}
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px'
                    }}>
                      <span style={{
                        width: '8px', height: '8px', borderRadius: '50%',
                        background: config.dotColor, display: 'inline-block'
                      }} />
                      <span style={{
                        fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const,
                        letterSpacing: '0.5px', color: config.textColor
                      }}>
                        {isHindi ? config.labelHi : config.label}
                      </span>
                    </div>
                    {/* Title */}
                    <div style={{
                      fontSize: '14px', fontWeight: 600, color: '#1E293B', marginBottom: '2px'
                    }}>
                      {gap.title}
                    </div>
                    {/* Short description */}
                    <div style={{ fontSize: '12px', color: '#64748B', lineHeight: 1.4 }}>
                      {gap.description}
                    </div>
                  </div>
                  {/* Chevron */}
                  <svg
                    width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    style={{
                      transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s ease',
                      flexShrink: 0,
                      marginTop: '4px',
                    }}
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>

                {/* Expanded Details */}
                {isExpanded && (
                  <div style={{
                    padding: '0 16px 16px 16px',
                    display: 'flex', flexDirection: 'column', gap: '10px',
                    borderTop: '1px solid rgba(0,0,0,0.06)',
                  }}>
                    {/* Your Answer */}
                    {gap.userAnswer && gap.userAnswer.trim() && (
                      <div style={{
                        background: 'white', borderRadius: '8px', padding: '12px',
                        border: '1px solid #E2E8F0', marginTop: '10px'
                      }}>
                        <div style={{
                          fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const,
                          letterSpacing: '0.5px', color: '#94A3B8', marginBottom: '6px'
                        }}>
                          💬 {isHindi ? 'आपका जवाब' : 'Your Answer'}
                        </div>
                        <div style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5 }}>
                          {gap.userAnswer}
                        </div>
                      </div>
                    )}

                    {/* What Actually Happens */}
                    <div style={{
                      background: 'white', borderRadius: '8px', padding: '12px',
                      border: `1px solid ${config.borderColor}30`,
                      ...(!gap.userAnswer?.trim() ? { marginTop: '10px' } : {})
                    }}>
                      <div style={{
                        fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const,
                        letterSpacing: '0.5px', color: config.textColor, marginBottom: '6px'
                      }}>
                        👁️ {isHindi ? 'असल में क्या होता है' : 'What Actually Happens'}
                      </div>
                      <div style={{ fontSize: '13px', color: '#1E293B', lineHeight: 1.5, fontWeight: 500 }}>
                        {gap.actualBehavior}
                      </div>
                    </div>

                    {/* Explanation */}
                    {gap.explanation && (
                      <div style={{
                        background: 'white', borderRadius: '8px', padding: '12px',
                        border: '1px solid #E2E8F0'
                      }}>
                        <div style={{
                          fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const,
                          letterSpacing: '0.5px', color: '#6366F1', marginBottom: '6px'
                        }}>
                          💡 {isHindi ? 'विस्तृत समझ' : 'Detailed Explanation'}
                        </div>
                        <div style={{ fontSize: '13px', color: '#334155', lineHeight: 1.6 }}>
                          {gap.explanation}
                        </div>
                      </div>
                    )}

                    {/* Code Snippet */}
                    {gap.codeSnippet && (
                      <div style={{
                        background: '#1E293B', borderRadius: '8px', padding: '12px',
                        fontFamily: "'Courier New', monospace", fontSize: '12px',
                        color: '#E2E8F0', lineHeight: 1.7, overflowX: 'auto' as const,
                        whiteSpace: 'pre-wrap' as const,
                      }}>
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
        <div style={{
          background: '#F0FDF4',
          borderRadius: '12px',
          padding: '16px',
          borderLeft: '4px solid #22C55E',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px'
          }}>
            <span style={{ fontSize: '16px' }}>✅</span>
            <span style={{
              fontSize: '14px', fontWeight: 700, color: '#15803D'
            }}>
              {isHindi ? 'आपने क्या सही समझा' : 'What You Got Right'}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {analysis.correctUnderstandings.map((item, idx) => (
              <div key={idx} style={{
                display: 'flex', alignItems: 'flex-start', gap: '8px',
                fontSize: '13px', color: '#166534', lineHeight: 1.5
              }}>
                <span style={{ color: '#22C55E', fontWeight: 700, flexShrink: 0 }}>✓</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Checklist */}
      {analysis.checklist && analysis.checklist.length > 0 && (
        <div style={{
          background: '#F8FAFC', borderRadius: '12px', padding: '16px',
          border: '1px solid #E2E8F0'
        }}>
          <div style={{
            fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '10px'
          }}>
            📋 {isHindi ? 'सुधार Checklist' : 'Improvement Checklist'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {analysis.checklist.map((item, idx) => (
              <div key={idx} style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                fontSize: '12px', color: '#475569'
              }}>
                <span style={{
                  width: '16px', height: '16px', borderRadius: '4px',
                  border: '1.5px solid #CBD5E1', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }} />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {(!analysis.gaps || analysis.gaps.length === 0) &&
        (!analysis.correctUnderstandings || analysis.correctUnderstandings.length === 0) && (
          <div style={{
            background: 'linear-gradient(135deg, #EEF2FF, #F5F3FF)',
            borderRadius: '12px', padding: '24px', textAlign: 'center',
            border: '1px solid #C7D2FE'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🎉</div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#4338CA', marginBottom: '4px' }}>
              {isHindi ? 'विश्लेषण पूरा हुआ' : 'Analysis Complete'}
            </div>
            <div style={{ fontSize: '13px', color: '#6366F1' }}>
              {isHindi
                ? 'कोई significant gap नहीं पाया गया — बहुत बढ़िया!'
                : 'No significant gaps found — great job!'}
            </div>
          </div>
        )}

      {/* Action Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '8px' }}>
        {onReset && (
          <button
            onClick={onReset}
            style={{
              width: '100%', padding: '14px', borderRadius: '12px', border: 'none',
              background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
              color: 'white', fontSize: '15px', fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
              transition: 'all 0.2s ease',
            }}
            onMouseOver={(e) => { (e.target as HTMLElement).style.transform = 'scale(1.02)'; }}
            onMouseOut={(e) => { (e.target as HTMLElement).style.transform = 'scale(1)'; }}
          >
            {isHindi ? 'नया Code Try करें' : 'Try Another Code'} →
          </button>
        )}
      </div>
    </div>
  );
}

'use client';

import { useRef, useState } from 'react';
import { Analysis } from '@/lib/types';

interface ShareResultsCardProps {
    analysis: Analysis;
    language?: 'en' | 'hi';
    onClose: () => void;
}

export default function ShareResultsCard({ analysis, language = 'en', onClose }: ShareResultsCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [downloaded, setDownloaded] = useState(false);
    const isHindi = language === 'hi';

    const gaps = analysis.gaps || [];
    const correct = analysis.correctUnderstandings || [];
    const total = gaps.length + correct.length;
    const score = total > 0 ? correct.length : 0;
    const level = score === total && total > 0 ? 'Strong' : score >= total * 0.6 ? 'Good' : 'Early';

    const handleDownload = async () => {
        if (!cardRef.current || isGenerating) return;
        setIsGenerating(true);

        try {
            const html2canvas = (await import('html2canvas')).default;
            const canvas = await html2canvas(cardRef.current, {
                backgroundColor: null,
                scale: 2,
                logging: false,
            });

            const link = document.createElement('a');
            link.download = `logiclens-score-${Date.now()}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            setDownloaded(true);
            setTimeout(() => setDownloaded(false), 3000);
        } catch (err) {
            console.error('Failed to generate image:', err);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
                {/* Close button */}
                <div className="flex items-center justify-between px-6 pt-5 pb-2">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        {isHindi ? '📤 अपना Score Share करें' : '📤 Share Your Score'}
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* The shareable card — uses inline styles for html2canvas compatibility */}
                <div style={{ padding: '0 24px 16px' }}>
                    <div
                        ref={cardRef}
                        style={{
                            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #7e22ce 100%)',
                            borderRadius: '16px',
                            padding: '32px',
                            color: '#ffffff',
                            position: 'relative',
                            overflow: 'hidden',
                            fontFamily: 'system-ui, -apple-system, sans-serif',
                        }}
                    >
                        {/* Background decoration — positioned with explicit values */}
                        <div style={{
                            position: 'absolute', top: '-32px', right: '-32px',
                            width: '128px', height: '128px', borderRadius: '50%',
                            background: 'rgba(255,255,255,0.08)',
                        }} />
                        <div style={{
                            position: 'absolute', bottom: '-24px', left: '-24px',
                            width: '96px', height: '96px', borderRadius: '50%',
                            background: 'rgba(255,255,255,0.06)',
                        }} />

                        {/* Logo row */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', position: 'relative', zIndex: 10 }}>
                            <div style={{
                                width: '36px', height: '36px', background: 'rgba(255,255,255,0.2)',
                                borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <span style={{ fontSize: '14px', fontWeight: 700 }}>{'{}'}</span>
                            </div>
                            <div>
                                <div style={{ fontSize: '15px', fontWeight: 700, lineHeight: '1.2' }}>LogicLens</div>
                                <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Code Reasoning Check</div>
                            </div>
                        </div>

                        {/* Score circle — centered */}
                        <div style={{ textAlign: 'center', marginBottom: '24px', position: 'relative', zIndex: 10 }}>
                            <div style={{
                                display: 'inline-block',
                                width: '88px', height: '88px', borderRadius: '50%',
                                background: 'rgba(255,255,255,0.12)',
                                border: '3px solid rgba(255,255,255,0.25)',
                                lineHeight: '82px',
                                textAlign: 'center',
                                marginBottom: '12px',
                            }}>
                                <span style={{ fontSize: '30px', fontWeight: 700, verticalAlign: 'middle' }}>{score}/{total}</span>
                            </div>
                            <div style={{ fontSize: '26px', fontWeight: 700, marginBottom: '4px' }}>{level}</div>
                            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
                                {isHindi ? 'समझ का स्तर' : 'Understanding Level'}
                            </div>
                        </div>

                        {/* Stats row */}
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '24px', position: 'relative', zIndex: 10 }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '20px', fontWeight: 700 }}>{correct.length}</div>
                                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.55)' }}>{isHindi ? 'सही' : 'Correct'}</div>
                            </div>
                            <div style={{ width: '1px', height: '28px', background: 'rgba(255,255,255,0.2)' }} />
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '20px', fontWeight: 700 }}>{gaps.length}</div>
                                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.55)' }}>{isHindi ? 'सुधार' : 'Gaps'}</div>
                            </div>
                        </div>

                        {/* Date */}
                        <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.35)', textAlign: 'center', marginTop: '16px', position: 'relative', zIndex: 10 }}>
                            {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="px-6 pb-6 flex gap-3">
                    <button
                        onClick={handleDownload}
                        disabled={isGenerating}
                        className={`flex-1 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${downloaded
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white hover:shadow-lg hover:shadow-indigo-500/25'
                            }`}
                    >
                        {isGenerating ? (
                            <>
                                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                {isHindi ? 'बन रहा है...' : 'Generating...'}
                            </>
                        ) : downloaded ? (
                            <>{isHindi ? '✓ Download हो गया!' : '✓ Downloaded!'}</>
                        ) : (
                            <>{isHindi ? '📥 PNG Download करें' : '📥 Download PNG'}</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

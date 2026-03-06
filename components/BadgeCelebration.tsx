'use client';

import { Badge } from '@/hooks/useGameProgress';
import { useState, useEffect } from 'react';

interface BadgeCelebrationProps {
    badges: Badge[];
    language?: 'en' | 'hi';
    onContinue: () => void;
}

export default function BadgeCelebration({
    badges,
    language = 'en',
    onContinue,
}: BadgeCelebrationProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [visible, setVisible] = useState(false);
    const isHindi = language === 'hi';
    const badge = badges[currentIndex];

    // Trigger entrance animation
    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 50);
        return () => clearTimeout(t);
    }, [currentIndex]);

    if (!badge) return null;

    const handleContinue = () => {
        if (currentIndex < badges.length - 1) {
            setVisible(false);
            setTimeout(() => {
                setCurrentIndex(prev => prev + 1);
            }, 300);
        } else {
            setVisible(false);
            setTimeout(onContinue, 300);
        }
    };

    return (
        <div className="badge-celebration-overlay" onClick={(e) => e.stopPropagation()}>

            {/* Radiant light beams */}
            <div className="badge-light-rays">
                {Array.from({ length: 12 }).map((_, i) => (
                    <div
                        key={i}
                        className="badge-light-ray"
                        style={{
                            transform: `rotate(${i * 30}deg)`,
                            animationDelay: `${i * 0.1}s`,
                        }}
                    />
                ))}
            </div>

            {/* Floating particles */}
            <div className="badge-particles">
                {Array.from({ length: 30 }).map((_, i) => (
                    <div
                        key={i}
                        className="badge-particle"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 3}s`,
                            animationDuration: `${2 + Math.random() * 3}s`,
                            '--particle-x': `${(Math.random() - 0.5) * 200}px`,
                            '--particle-y': `${-100 - Math.random() * 200}px`,
                        } as React.CSSProperties}
                    />
                ))}
            </div>

            {/* Main content */}
            <div className={`badge-celebration-content ${visible ? 'badge-visible' : 'badge-hidden'}`}>

                {/* "Achievement Unlocked" text */}
                <div className="badge-title-text">
                    <span className="badge-title-icon">🏆</span>
                    <h2 className="badge-achievement-title">
                        {isHindi ? 'उपलब्धि अनलॉक!' : 'Achievement Unlocked!'}
                    </h2>
                </div>

                {/* 3D Rotating Badge */}
                <div className="badge-3d-container">
                    {/* Glow ring behind badge */}
                    <div className="badge-glow-ring" />
                    <div className="badge-glow-ring badge-glow-ring-2" />

                    {/* The rotating coin/medal */}
                    <div className="badge-3d-coin">
                        <div className="badge-3d-front">
                            <span className="badge-3d-icon">{badge.icon}</span>
                        </div>
                        <div className="badge-3d-back">
                            <span className="badge-3d-icon">✨</span>
                        </div>
                    </div>
                </div>

                {/* Badge name and description */}
                <div className="badge-info">
                    <h3 className="badge-name">
                        {isHindi ? badge.nameHi : badge.name}
                    </h3>
                    <p className="badge-description">
                        {isHindi ? badge.descriptionHi : badge.description}
                    </p>
                </div>

                {/* Badge counter */}
                {badges.length > 1 && (
                    <p className="badge-counter">
                        {currentIndex + 1} / {badges.length}
                    </p>
                )}

                {/* Continue button */}
                <button onClick={handleContinue} className="badge-continue-btn">
                    {currentIndex < badges.length - 1
                        ? (isHindi ? 'अगला Badge →' : 'Next Badge →')
                        : (isHindi ? 'परिणाम देखें →' : 'Continue to Results →')
                    }
                </button>
            </div>
        </div>
    );
}

'use client';

import { useState, useEffect, useCallback } from 'react';

interface GameProgress {
    totalSessions: number;
    streakDays: number;
    lastSessionDate: string; // YYYY-MM-DD
    sessionDates: string[]; // Array of YYYY-MM-DD dates
    bestScore: number; // Best score ratio (0-1)
    perfectScores: number; // Number of 5/5 scores
    badges: Badge[];
}

export interface Badge {
    id: string;
    name: string;
    nameHi: string;
    icon: string;
    description: string;
    descriptionHi: string;
    earned: boolean;
    earnedAt?: string;
}

const STORAGE_KEY = 'logiclens_game_progress';

const DEFAULT_PROGRESS: GameProgress = {
    totalSessions: 0,
    streakDays: 0,
    lastSessionDate: '',
    sessionDates: [],
    bestScore: 0,
    perfectScores: 0,
    badges: [],
};

const BADGE_DEFINITIONS: Omit<Badge, 'earned' | 'earnedAt'>[] = [
    {
        id: 'first-session',
        name: 'First Steps',
        nameHi: 'पहला कदम',
        icon: '🎯',
        description: 'Complete your first session',
        descriptionHi: 'अपना पहला session पूरा करें',
    },
    {
        id: 'perfect-score',
        name: 'Perfect Score',
        nameHi: 'शत-प्रतिशत',
        icon: '⭐',
        description: 'Get all answers correct',
        descriptionHi: 'सभी जवाब सही दें',
    },
    {
        id: 'streak-3',
        name: '3-Day Streak',
        nameHi: '3 दिन की लगन',
        icon: '🔥',
        description: 'Practice 3 days in a row',
        descriptionHi: 'लगातार 3 दिन practice करें',
    },
    {
        id: 'five-sessions',
        name: 'Dedicated Learner',
        nameHi: 'समर्पित शिक्षार्थी',
        icon: '📚',
        description: 'Complete 5 sessions',
        descriptionHi: '5 sessions पूरे करें',
    },
    {
        id: 'ten-sessions',
        name: 'Code Master',
        nameHi: 'कोड मास्टर',
        icon: '🏆',
        description: 'Complete 10 sessions',
        descriptionHi: '10 sessions पूरे करें',
    },
    {
        id: 'streak-7',
        name: 'Week Warrior',
        nameHi: 'हफ्ते का योद्धा',
        icon: '⚡',
        description: 'Practice 7 days in a row',
        descriptionHi: 'लगातार 7 दिन practice करें',
    },
];

function getToday(): string {
    return new Date().toISOString().split('T')[0];
}

function calculateStreak(sessionDates: string[]): number {
    if (sessionDates.length === 0) return 0;

    const uniqueDates = [...new Set(sessionDates)].sort().reverse();
    const today = getToday();
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    // Streak must include today or yesterday
    if (uniqueDates[0] !== today && uniqueDates[0] !== yesterday) return 0;

    let streak = 1;
    for (let i = 0; i < uniqueDates.length - 1; i++) {
        const current = new Date(uniqueDates[i]);
        const previous = new Date(uniqueDates[i + 1]);
        const diffDays = (current.getTime() - previous.getTime()) / 86400000;

        if (diffDays === 1) {
            streak++;
        } else {
            break;
        }
    }

    return streak;
}

export function useGameProgress() {
    const [progress, setProgress] = useState<GameProgress>(DEFAULT_PROGRESS);

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                setProgress(JSON.parse(stored));
            }
        } catch (e) {
            console.warn('Failed to load game progress:', e);
        }
    }, []);

    // Save to localStorage whenever progress changes
    const saveProgress = useCallback((newProgress: GameProgress) => {
        setProgress(newProgress);
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newProgress));
        } catch (e) {
            console.warn('Failed to save game progress:', e);
        }
    }, []);

    // Record a completed session
    const recordSession = useCallback((correctCount: number, totalQuestions: number) => {
        const today = getToday();
        const score = totalQuestions > 0 ? correctCount / totalQuestions : 0;
        const isPerfect = correctCount === totalQuestions && totalQuestions > 0;

        const newDates = [...progress.sessionDates, today];
        const newStreak = calculateStreak(newDates);

        const newProgress: GameProgress = {
            totalSessions: progress.totalSessions + 1,
            streakDays: newStreak,
            lastSessionDate: today,
            sessionDates: newDates,
            bestScore: Math.max(progress.bestScore, score),
            perfectScores: progress.perfectScores + (isPerfect ? 1 : 0),
            badges: progress.badges,
        };

        // Check and award badges
        const earnedBadges = [...(newProgress.badges || [])];
        const earnedIds = new Set(earnedBadges.filter(b => b.earned).map(b => b.id));

        for (const def of BADGE_DEFINITIONS) {
            if (earnedIds.has(def.id)) continue;

            let shouldEarn = false;
            if (def.id === 'first-session' && newProgress.totalSessions >= 1) shouldEarn = true;
            if (def.id === 'perfect-score' && isPerfect) shouldEarn = true;
            if (def.id === 'streak-3' && newProgress.streakDays >= 3) shouldEarn = true;
            if (def.id === 'five-sessions' && newProgress.totalSessions >= 5) shouldEarn = true;
            if (def.id === 'ten-sessions' && newProgress.totalSessions >= 10) shouldEarn = true;
            if (def.id === 'streak-7' && newProgress.streakDays >= 7) shouldEarn = true;

            if (shouldEarn) {
                earnedBadges.push({ ...def, earned: true, earnedAt: new Date().toISOString() });
            }
        }

        newProgress.badges = earnedBadges;
        saveProgress(newProgress);

        return newProgress;
    }, [progress, saveProgress]);

    // Get all badges (earned + unearned)
    const allBadges: Badge[] = BADGE_DEFINITIONS.map(def => {
        const earned = progress.badges.find(b => b.id === def.id && b.earned);
        return earned || { ...def, earned: false };
    });

    return {
        progress,
        recordSession,
        allBadges,
        streakDays: progress.streakDays,
        totalSessions: progress.totalSessions,
    };
}

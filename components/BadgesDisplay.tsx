'use client';

import { Badge } from '@/hooks/useGameProgress';

interface BadgesDisplayProps {
    badges: Badge[];
    streakDays: number;
    totalSessions: number;
    language?: 'en' | 'hi';
}

export default function BadgesDisplay({
    badges,
    streakDays,
    totalSessions,
    language = 'en',
}: BadgesDisplayProps) {
    const isHindi = language === 'hi';
    const earnedBadges = badges.filter(b => b.earned);
    const unearnedBadges = badges.filter(b => !b.earned);

    return (
        <div className="mt-6 pt-6 border-t border-slate-200">
            {/* Header with streak */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    🏅 {isHindi ? 'आपकी उपलब्धियाँ' : 'Your Achievements'}
                </h3>
                <div className="flex items-center gap-3">
                    {/* Streak counter */}
                    {streakDays > 0 && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 border border-orange-200 rounded-full">
                            <span className="text-base">🔥</span>
                            <span className="text-xs font-bold text-orange-700">
                                {streakDays} {isHindi ? 'दिन' : streakDays === 1 ? 'day' : 'days'}
                            </span>
                        </div>
                    )}
                    {/* Session counter */}
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 border border-indigo-200 rounded-full">
                        <span className="text-xs font-bold text-indigo-700">
                            {totalSessions} {isHindi ? 'sessions' : totalSessions === 1 ? 'session' : 'sessions'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Earned badges */}
            {earnedBadges.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mb-3">
                    {earnedBadges.map(badge => (
                        <div
                            key={badge.id}
                            className="flex flex-col items-center gap-1.5 p-3 bg-gradient-to-b from-amber-50 to-yellow-50 border border-amber-200 rounded-xl relative overflow-hidden group"
                        >
                            {/* Shimmer effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                            <span className="text-2xl relative z-10">{badge.icon}</span>
                            <span className="text-[10px] font-bold text-amber-800 text-center leading-tight relative z-10">
                                {isHindi ? badge.nameHi : badge.name}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {/* Unearned badges (dimmed) */}
            {unearnedBadges.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                    {unearnedBadges.map(badge => (
                        <div
                            key={badge.id}
                            className="flex flex-col items-center gap-1.5 p-3 bg-slate-50 border border-slate-200 rounded-xl opacity-40 group relative"
                            title={isHindi ? badge.descriptionHi : badge.description}
                        >
                            <span className="text-2xl grayscale">{badge.icon}</span>
                            <span className="text-[10px] font-semibold text-slate-500 text-center leading-tight">
                                {isHindi ? badge.nameHi : badge.name}
                            </span>
                            {/* Tooltip */}
                            <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-800 text-white text-[9px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                                {isHindi ? badge.descriptionHi : badge.description}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

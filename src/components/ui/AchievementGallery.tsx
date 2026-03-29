"use client";

import { ACHIEVEMENTS } from "@/hooks/useAchievements";
import { cn } from "@/lib/cn";

interface AchievementGalleryProps {
  earned: Record<string, { date: string }>;
  stats: { gamesPlayed: number; gamesWon: number };
  onClose: () => void;
}

export function AchievementGallery({ earned, stats, onClose }: AchievementGalleryProps) {
  const earnedCount = Object.keys(earned).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/90 overflow-y-auto py-8">
      <div className="rounded-xl border border-navy-600 bg-navy-800 p-6 max-w-lg w-full mx-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-steel-100">
            Achievements ({earnedCount}/{ACHIEVEMENTS.length})
          </h2>
          <button onClick={onClose} className="text-navy-400 hover:text-steel-100 text-lg">
            &times;
          </button>
        </div>

        <div className="flex gap-4 text-xs text-navy-400">
          <span>{stats.gamesPlayed} games played</span>
          <span>{stats.gamesWon} won</span>
          <span>{Math.round((stats.gamesWon / Math.max(1, stats.gamesPlayed)) * 100)}% win rate</span>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {ACHIEVEMENTS.map((ach) => {
            const isEarned = !!earned[ach.id];
            return (
              <div
                key={ach.id}
                className={cn(
                  "flex items-center gap-3 rounded-lg border px-3 py-2",
                  isEarned
                    ? "border-amber-500/30 bg-amber-500/5"
                    : "border-navy-600/50 bg-navy-700/30 opacity-50"
                )}
              >
                <span className={cn("text-xl", !isEarned && "grayscale")}>{ach.icon}</span>
                <div className="flex-1">
                  <div className={cn("text-sm font-bold", isEarned ? "text-steel-100" : "text-navy-400")}>
                    {ach.name}
                  </div>
                  <div className="text-xs text-navy-400">{ach.description}</div>
                </div>
                {isEarned && (
                  <span className="text-[10px] text-amber-400">{earned[ach.id].date}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

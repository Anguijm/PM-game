"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { Achievement } from "@/hooks/useAchievements";

interface AchievementPopupProps {
  achievements: Achievement[];
  onDismiss: () => void;
}

export function AchievementPopup({ achievements, onDismiss }: AchievementPopupProps) {
  if (achievements.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] space-y-2"
      >
        {achievements.map((ach) => (
          <motion.div
            key={ach.id}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="rounded-xl border border-amber-500/50 bg-navy-800 px-5 py-3 shadow-xl cursor-pointer"
            onClick={onDismiss}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{ach.icon}</span>
              <div>
                <div className="text-xs text-amber-400 uppercase tracking-wider">
                  Achievement Unlocked
                </div>
                <div className="text-sm font-bold text-steel-100">{ach.name}</div>
                <div className="text-xs text-navy-400">{ach.description}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </AnimatePresence>
  );
}

"use client";

import { motion } from "framer-motion";
import { GAME_CONSTANTS, SI_THRESHOLDS } from "@/game/types";
import { getSIColor } from "@/lib/theme";

interface SITrackerProps {
  value: number;
}

export function SITracker({ value }: SITrackerProps) {
  const siColor = getSIColor(value);
  const pct = Math.max(0, (value / GAME_CONSTANTS.STARTING_SI) * 100);

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-navy-400 uppercase">SI</span>
      <div className="relative w-24 h-4 rounded-full bg-navy-700 overflow-hidden sm:w-32">
        {/* Threshold markers */}
        {[SI_THRESHOLDS.EMERGENCY_MEASURES, SI_THRESHOLDS.SUPPLY_CHAIN_SKEPTICISM, SI_THRESHOLDS.INCREASED_OVERSIGHT].map(
          (threshold) => (
            <div
              key={threshold}
              className="absolute top-0 bottom-0 w-px bg-navy-400/40"
              style={{
                left: `${(threshold / GAME_CONSTANTS.STARTING_SI) * 100}%`,
              }}
            />
          )
        )}
        {/* Fill bar */}
        <motion.div
          className={`absolute inset-y-0 left-0 rounded-full ${siColor.bg} border-r ${siColor.border} ${
            value < SI_THRESHOLDS.EMERGENCY_MEASURES ? "animate-pulse" : ""
          }`}
          animate={{ width: `${pct}%` }}
          transition={{ type: "spring", stiffness: 100, damping: 15 }}
        />
      </div>
      <span className={`text-sm font-bold ${siColor.text}`}>{value}</span>
    </div>
  );
}

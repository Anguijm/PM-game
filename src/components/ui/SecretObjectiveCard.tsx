"use client";

import { useState } from "react";
import { SECRET_OBJECTIVES, type SecretObjective } from "@/data/objectives";
import { cn } from "@/lib/cn";

interface SecretObjectiveIndicatorProps {
  objectiveId: string | null;
  /** Whether to show the full card (hover/tap) or just the icon */
  revealed?: boolean;
  /** Whether the objective was fulfilled (for post-game) */
  fulfilled?: boolean;
}

export function SecretObjectiveIndicator({
  objectiveId,
  revealed = false,
  fulfilled,
}: SecretObjectiveIndicatorProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  if (!objectiveId) return null;

  const objective = SECRET_OBJECTIVES.find((o) => o.id === objectiveId);
  if (!objective) return null;

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onClick={() => setShowTooltip(!showTooltip)}
    >
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-bold cursor-pointer",
          revealed
            ? fulfilled
              ? "bg-amber-500/20 text-amber-400"
              : "bg-navy-700 text-navy-400"
            : "bg-prestige/20 text-prestige"
        )}
      >
        {revealed ? (fulfilled ? "✓" : "✗") : "?"} Secret Objective
      </span>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full left-0 mb-2 z-50 w-56 rounded-lg border border-navy-600 bg-navy-800 p-3 shadow-xl">
          <div className="text-xs text-prestige font-bold">{objective.name}</div>
          <div className="text-xs text-navy-200 mt-1">{objective.description}</div>
          <div className="text-xs text-amber-400 mt-1">+{objective.bonusPP} PP if fulfilled</div>
          {fulfilled !== undefined && (
            <div className={cn("text-xs mt-1 font-bold", fulfilled ? "text-success" : "text-alert-red")}>
              {fulfilled ? "FULFILLED!" : "Not met"}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

"use client";

import type { PlayerState, DrydockMastersState } from "@/game/types";
import { GAME_CONSTANTS } from "@/game/types";
import { cn } from "@/lib/cn";

interface MilestoneTrackerProps {
  player: PlayerState;
  round: number;
  numPlayers: number;
  admiralMandate: DrydockMastersState["admiralMandate"];
}

function getQuotaScale(numPlayers: number): number {
  return numPlayers <= 2 ? 1.0 : numPlayers === 3 ? 0.70 : 0.60;
}

function getMilestoneRounds(accel: boolean): [number, number, number] {
  const a = accel ? 1 : 0;
  return [6 - a, 8 - a, 10 - a];
}

export function MilestoneTracker({
  player,
  round,
  numPlayers,
  admiralMandate,
}: MilestoneTrackerProps) {
  if (!player.contract) return null;

  const accel = admiralMandate?.rule === "acceleratedTimeline";
  const [r6, r8, r10] = getMilestoneRounds(accel);
  const scale = getQuotaScale(numPlayers);

  const milestones = [
    { round: r6, quota: Math.max(1, Math.round(GAME_CONSTANTS.MILESTONE_R6_QUOTA * scale)), label: "Early" },
    { round: r8, quota: Math.max(1, Math.round(GAME_CONSTANTS.MILESTONE_R8_QUOTA * scale)), label: "Mid" },
    { round: r10, quota: Math.max(1, Math.round(GAME_CONSTANTS.MILESTONE_R10_QUOTA * scale)), label: "Final" },
  ];

  const completedJobs = player.completedWork.length;

  // Find next upcoming milestone
  const nextMilestone = milestones.find((m) => round <= m.round);

  return (
    <div className="rounded-lg border border-navy-600 bg-navy-800 p-3">
      <h3 className="text-xs text-navy-400 uppercase tracking-wider mb-2">
        Contract: {player.contract.name}
      </h3>

      <div className="flex gap-2">
        {milestones.map((m) => {
          const met = completedJobs >= m.quota;
          const isPast = round > m.round;
          const isNext = nextMilestone === m;

          return (
            <div
              key={m.round}
              className={cn(
                "flex-1 rounded border px-2 py-1.5 text-center text-xs",
                met
                  ? "border-success/50 bg-success/10 text-success"
                  : isPast
                    ? "border-alert-red/50 bg-alert-red/10 text-alert-red"
                    : isNext
                      ? "border-amber-500/50 bg-amber-500/10 text-amber-400"
                      : "border-navy-600 bg-navy-700/50 text-navy-400"
              )}
            >
              <div className="font-bold">
                R{m.round} {m.label}
              </div>
              <div className="mt-0.5">
                {completedJobs}/{m.quota} jobs
              </div>
              {met && <div className="text-[10px]">Passed</div>}
              {isPast && !met && <div className="text-[10px]">FAILED</div>}
              {isNext && !met && (
                <div className="text-[10px]">
                  {m.quota - completedJobs} needed
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

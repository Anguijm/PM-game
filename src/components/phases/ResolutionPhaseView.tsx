"use client";

import type { DrydockMastersState, PlayerState, LaborDie } from "@/game/types";
import { GAME_CONSTANTS, SI_THRESHOLDS } from "@/game/types";
import { getSIColor } from "@/lib/theme";
import { cn } from "@/lib/cn";

interface ResolutionPhaseViewProps {
  G: DrydockMastersState;
  isActive: boolean;
  onAcknowledge: () => void;
}

export function ResolutionPhaseView({
  G,
  isActive,
  onAcknowledge,
}: ResolutionPhaseViewProps) {
  const isLateRound = G.round > GAME_CONSTANTS.ON_TIME_ROUND;
  const isMilestoneRound = [6, 8, 10].includes(G.round);
  const siColor = getSIColor(G.shipyardIntegrity);

  // Count active dice still counting down (post-resolution state)
  const activeDice = Object.values(G.players).reduce((count, player) => {
    return (
      count +
      player.dice.filter(
        (d) => d.assignedToSlot !== null && d.value !== null && d.value > 0
      ).length
    );
  }, 0);

  // Total completed jobs across all players
  const totalCompletedJobs = Object.values(G.players).reduce(
    (count, player) => count + player.completedWork.length,
    0
  );

  return (
    <div className="rounded-lg border border-prestige/30 bg-navy-800 p-4 space-y-4">
      <h3 className="text-sm font-bold text-prestige uppercase tracking-wider">
        Resolution — Round {G.round}
      </h3>

      {/* What happened */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <ResolutionStat
          label="Dice Ticking"
          value={String(activeDice)}
          detail="still counting down"
          color="text-die-blue"
        />
        <ResolutionStat
          label="Jobs Completed"
          value={String(totalCompletedJobs)}
          detail="total across all players"
          color="text-success"
        />
        <ResolutionStat
          label="Shipyard Integrity"
          value={String(G.shipyardIntegrity)}
          detail={siColor.label}
          color={siColor.text}
        />
      </div>

      {/* Warnings */}
      {isLateRound && (
        <div className="rounded border border-alert-red/30 bg-alert-red/10 px-3 py-2 text-sm text-alert-red">
          Late completion penalty: -{GAME_CONSTANTS.LATE_PENALTY_SI} SI
          applied this round.
        </div>
      )}

      {isMilestoneRound && (
        <div className="rounded border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-400">
          Milestone deadline check this round. Contract quotas evaluated.
        </div>
      )}

      {G.shipyardIntegrity < SI_THRESHOLDS.INCREASED_OVERSIGHT && (
        <div className="rounded border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-400">
          {G.shipyardIntegrity < SI_THRESHOLDS.EMERGENCY_MEASURES
            ? "EMERGENCY: Cross-training disabled."
            : G.shipyardIntegrity < SI_THRESHOLDS.SUPPLY_CHAIN_SKEPTICISM
              ? "Supply chain skepticism: Procurement yields reduced."
              : "Increased oversight: Utilization bonus unavailable."}
        </div>
      )}

      {/* Player scoreboard */}
      <div className="space-y-1">
        <h4 className="text-xs text-navy-400 uppercase tracking-wider">
          Standings
        </h4>
        {Object.values(G.players)
          .sort((a, b) => b.pp - a.pp)
          .map((player, rank) => (
            <PlayerResolutionRow
              key={player.id}
              player={player}
              rank={rank + 1}
            />
          ))}
      </div>

      {/* Action */}
      {isActive ? (
        <div className="text-center pt-2">
          <button
            onClick={onAcknowledge}
            className="rounded bg-prestige px-6 py-2 text-sm font-bold text-navy-900 hover:bg-prestige/80 transition-colors"
          >
            {G.round >= GAME_CONSTANTS.MAX_ROUNDS
              ? "VIEW FINAL RESULTS"
              : "CONTINUE TO NEXT ROUND"}
          </button>
        </div>
      ) : (
        <p className="text-xs text-navy-400 text-center">
          Waiting for the active player to continue...
        </p>
      )}
    </div>
  );
}

function ResolutionStat({
  label,
  value,
  detail,
  color,
}: {
  label: string;
  value: string;
  detail: string;
  color: string;
}) {
  return (
    <div className="rounded-lg border border-navy-600 bg-navy-700 p-3 text-center">
      <div className="text-xs text-navy-400 uppercase">{label}</div>
      <div className={cn("text-2xl font-bold mt-1", color)}>{value}</div>
      <div className="text-xs text-navy-400 mt-0.5">{detail}</div>
    </div>
  );
}

function PlayerResolutionRow({
  player,
  rank,
}: {
  player: PlayerState;
  rank: number;
}) {
  return (
    <div className="flex items-center justify-between rounded bg-navy-700/50 px-3 py-1.5 text-sm">
      <div className="flex items-center gap-2">
        <span className="text-xs text-navy-400 w-4">{rank}.</span>
        <span className="text-steel-100">{player.name}</span>
      </div>
      <div className="flex items-center gap-4 text-xs">
        <span className="text-prestige font-bold">{player.pp} PP</span>
        <span className="text-navy-400">
          {player.completedWork.length} jobs
        </span>
        <span className="text-funding">${player.funding}</span>
        <span className="text-material">{player.material}M</span>
      </div>
    </div>
  );
}

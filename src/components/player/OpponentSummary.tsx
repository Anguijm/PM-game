"use client";

import type { PlayerState } from "@/game/types";

interface OpponentSummaryProps {
  players: Record<string, PlayerState>;
  currentPlayerID: string;
}

export function OpponentSummary({
  players,
  currentPlayerID,
}: OpponentSummaryProps) {
  const opponents = Object.values(players).filter(
    (p) => p.id !== currentPlayerID
  );

  if (opponents.length === 0) return null;

  return (
    <div className="rounded-lg border border-navy-600 bg-navy-800 p-3">
      <h3 className="text-xs text-navy-400 uppercase tracking-wider mb-2">
        Other Superintendents
      </h3>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {opponents.map((opp) => (
          <OpponentCard key={opp.id} player={opp} />
        ))}
      </div>
    </div>
  );
}

function OpponentCard({ player }: { player: PlayerState }) {
  const stagedCount = player.stagedSlots.filter((s) => s.card !== null).length;
  const availableDice = player.dice.filter(
    (d) => d.holderID === player.id && d.assignedToSlot === null
  ).length;

  return (
    <div className="rounded border border-navy-600/50 bg-navy-700/50 px-3 py-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-steel-100">
          {player.name}
        </span>
        {player.hasPassed && (
          <span className="text-[10px] text-navy-400 uppercase">Passed</span>
        )}
      </div>
      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-navy-400">
        <span className="text-prestige">{player.pp} PP</span>
        <span className="text-funding">${player.funding}</span>
        <span className="text-material">{player.material}M</span>
        <span>{stagedCount}/4 slots</span>
        <span>{availableDice} dice free</span>
        <span>{player.completedWork.length} done</span>
      </div>
    </div>
  );
}

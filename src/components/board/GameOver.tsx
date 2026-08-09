"use client";

import { motion } from "framer-motion";
import type { DrydockMastersState } from "@/game/types";
import { GAME_CONSTANTS } from "@/game/types";
import { cn } from "@/lib/cn";
import { SECRET_OBJECTIVES } from "@/data/objectives";
import { ScoreTimeline } from "@/components/ui/ScoreTimeline";

interface GameOverProps {
  gameover: {
    winner?: string | string[];
    allLose?: boolean;
    scores?: Record<string, number>;
  };
  players: DrydockMastersState["players"];
  round: number;
  shipyardIntegrity: number;
}

interface Badge {
  name: string;
  color: string;
  player?: string;
}

export function GameOver({ gameover, players, round, shipyardIntegrity }: GameOverProps) {
  const isLoss = gameover.allLose;
  const scores = gameover.scores || Object.fromEntries(
    Object.values(players).map((p) => [p.id, p.pp])
  );
  const sortedPlayers = Object.entries(scores).sort(([, a], [, b]) => b - a);

  // Calculate badges
  const badges: Badge[] = [];
  const playerList = Object.values(players);

  // Dock Master (winner)
  if (!isLoss && gameover.winner) {
    const winners = Array.isArray(gameover.winner) ? gameover.winner : [gameover.winner];
    winners.forEach((w) => badges.push({ name: "Dock Master", color: "bg-amber-500 text-navy-900", player: players[w]?.name }));
  }

  // Iron Will — survived with SI dropping below 10
  if (!isLoss && playerList.some((p) => p.hasHadLowSI)) {
    badges.push({ name: "Iron Will", color: "bg-alert-red/20 text-alert-red" });
  }

  // Speed Runner — game ended at or before round 10
  if (round <= GAME_CONSTANTS.ON_TIME_ROUND) {
    badges.push({ name: "Speed Runner", color: "bg-success/20 text-success" });
  }

  // The Cleaner — most problems cleared
  const maxCleared = Math.max(...playerList.map((p) => p.problemsCleared));
  if (maxCleared > 0) {
    const cleaners = playerList.filter((p) => p.problemsCleared === maxCleared);
    cleaners.forEach((p) => badges.push({ name: "The Cleaner", color: "bg-die-blue/20 text-die-blue", player: p.name }));
  }

  // Paper Pusher — most jobs completed
  const maxJobs = Math.max(...playerList.map((p) => p.completedWork.length));
  if (maxJobs > 0) {
    const pushers = playerList.filter((p) => p.completedWork.length === maxJobs);
    pushers.forEach((p) => badges.push({ name: "Paper Pusher", color: "bg-prestige/20 text-prestige", player: p.name }));
  }

  // Growth Survivor — most growth works hit but placed top 2
  const maxGrowth = Math.max(...playerList.map((p) => p.growthWorksHit));
  if (maxGrowth >= 2) {
    const topTwo = sortedPlayers.slice(0, 2).map(([id]) => id);
    const survivors = playerList.filter((p) => p.growthWorksHit === maxGrowth && topTwo.includes(p.id));
    survivors.forEach((p) => badges.push({ name: "Growth Survivor", color: "bg-amber-500/20 text-amber-400", player: p.name }));
  }

  // Game stats
  const totalJobs = playerList.reduce((s, p) => s + p.completedWork.length, 0);
  const totalCleared = playerList.reduce((s, p) => s + p.problemsCleared, 0);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/95 overflow-y-auto py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="rounded-xl border border-navy-600 bg-navy-800 p-6 max-w-lg w-full mx-4 space-y-5"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
      >
        {/* Header */}
        {isLoss ? (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-alert-red">SHIPYARD FAILURE</h2>
            <p className="mt-1 text-sm text-navy-200">SI reached zero. All superintendents relieved.</p>
          </div>
        ) : (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-success">MISSION COMPLETE</h2>
            {gameover.winner && (
              <p className="mt-1 text-base text-amber-400 font-bold">
                Promoted: {Array.isArray(gameover.winner)
                  ? gameover.winner.map((w) => players[w]?.name || `Player ${parseInt(w) + 1}`).join(" & ")
                  : players[gameover.winner]?.name || `Player ${parseInt(gameover.winner) + 1}`}
              </p>
            )}
          </div>
        )}

        {/* Scoreboard */}
        <div className="space-y-2">
          {sortedPlayers.map(([pid, score], rank) => {
            const player = players[pid];
            if (!player) return null;
            const isWinner = Array.isArray(gameover.winner)
              ? gameover.winner.includes(pid) : gameover.winner === pid;
            const fundingBonus = Math.floor(player.funding / GAME_CONSTANTS.FINAL_FUNDING_PP_RATIO);
            const materialBonus = Math.floor(player.material / GAME_CONSTANTS.FINAL_MATERIAL_PP_RATIO);

            return (
              <div key={pid} className={cn(
                "rounded-lg border p-3",
                isWinner ? "border-amber-500/50 bg-amber-500/10" : "border-navy-600 bg-navy-700/50"
              )}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={cn("text-lg font-bold", rank === 0 ? "text-amber-400" : "text-navy-400")}>
                      #{rank + 1}
                    </span>
                    <span className="text-steel-100 font-bold text-sm">{player.name}</span>
                  </div>
                  <span className="text-lg font-bold text-prestige">{score} PP</span>
                </div>
                <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-navy-400">
                  <span>{player.pp} in-game</span>
                  {fundingBonus > 0 && <span className="text-funding">+{fundingBonus} funding</span>}
                  {materialBonus > 0 && <span className="text-material">+{materialBonus} material</span>}
                  <span>{player.completedWork.length} jobs</span>
                  {player.growthWorksHit > 0 && <span className="text-alert-red">{player.growthWorksHit} growth</span>}
                  {(() => {
                    if (!player.secretObjectiveId) return null;
                    const obj = SECRET_OBJECTIVES.find((o) => o.id === player.secretObjectiveId);
                    if (!obj) return null;
                    const fakeG = { players, round, shipyardIntegrity } as any;
                    const fulfilled = obj.check(player, fakeG, pid);
                    return (
                      <span className={fulfilled ? "text-prestige" : "text-navy-500"}>
                        {fulfilled ? `+${obj.bonusPP}` : "✗"} {obj.name}
                      </span>
                    );
                  })()}
                </div>
              </div>
            );
          })}
        </div>

        {/* Badges */}
        {badges.length > 0 && (
          <div>
            <h3 className="text-xs text-navy-400 uppercase tracking-wider mb-2">Awards</h3>
            <div className="flex flex-wrap gap-2">
              {badges.map((badge, i) => (
                <span key={i} className={cn("rounded-full px-3 py-1 text-xs font-bold", badge.color)}>
                  {badge.name}{badge.player ? ` — ${badge.player}` : ""}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Score Timeline */}
        <ScoreTimeline players={players} shipyardIntegrity={shipyardIntegrity} />

        {/* Game Stats */}
        <div className="flex gap-4 text-xs text-navy-400 justify-center">
          <span>Round {round}/12</span>
          <span>SI: {shipyardIntegrity}</span>
          <span>{totalJobs} jobs</span>
          <span>{totalCleared} cleared</span>
        </div>

        {/* Play again */}
        <div className="text-center">
          <button
            onClick={() => window.location.reload()}
            className="rounded-lg bg-amber-500 px-6 py-2 text-sm font-bold text-navy-900 hover:bg-amber-400 transition-colors"
          >
            NEW GAME
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

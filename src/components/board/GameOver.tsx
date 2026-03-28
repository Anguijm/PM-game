"use client";

import { motion } from "framer-motion";
import type { DrydockMastersState } from "@/game/types";
import { GAME_CONSTANTS } from "@/game/types";
import { cn } from "@/lib/cn";

interface GameOverProps {
  gameover: {
    winner?: string | string[];
    allLose?: boolean;
    scores?: Record<string, number>;
  };
  players: DrydockMastersState["players"];
}

export function GameOver({ gameover, players }: GameOverProps) {
  const isLoss = gameover.allLose;
  // Fallback to in-game PP if engine didn't compute final scores (e.g., early SI=0 loss)
  const scores = gameover.scores || Object.fromEntries(
    Object.values(players).map((p) => [p.id, p.pp])
  );

  // Sort players by score
  const sortedPlayers = Object.entries(scores).sort(
    ([, a], [, b]) => b - a
  );

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/95"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="rounded-xl border border-navy-600 bg-navy-800 p-8 max-w-lg w-full mx-4 space-y-6"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
      >
        {/* Header */}
        {isLoss ? (
          <div className="text-center">
            <h2 className="text-3xl font-bold text-alert-red">
              SHIPYARD FAILURE
            </h2>
            <p className="mt-2 text-navy-200">
              The RMC has lost its charter. Shipyard Integrity reached zero.
              All superintendents are relieved of duty.
            </p>
          </div>
        ) : (
          <div className="text-center">
            <h2 className="text-3xl font-bold text-success">
              MISSION COMPLETE
            </h2>
            <p className="mt-2 text-navy-200">
              The fleet is operational. The Admiral is pleased.
            </p>
            {gameover.winner && (
              <p className="mt-1 text-lg text-amber-400 font-bold">
                Promoted:{" "}
                {Array.isArray(gameover.winner)
                  ? gameover.winner
                      .map((w) => `Player ${parseInt(w) + 1}`)
                      .join(" & ")
                  : `Player ${parseInt(gameover.winner) + 1}`}
              </p>
            )}
          </div>
        )}

        {/* Scoreboard */}
        {sortedPlayers.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs text-navy-400 uppercase tracking-wider text-center">
              Final Standings
            </h3>
            {sortedPlayers.map(([pid, score], rank) => {
              const player = players[pid];
              if (!player) return null;

              const isWinner = Array.isArray(gameover.winner)
                ? gameover.winner.includes(pid)
                : gameover.winner === pid;

              const inGamePP = player.pp;
              const fundingBonus = Math.floor(
                player.funding / GAME_CONSTANTS.FINAL_FUNDING_PP_RATIO
              );
              const materialBonus = Math.floor(
                player.material / GAME_CONSTANTS.FINAL_MATERIAL_PP_RATIO
              );

              return (
                <div
                  key={pid}
                  className={cn(
                    "rounded-lg border p-3",
                    isWinner
                      ? "border-amber-500/50 bg-amber-500/10"
                      : "border-navy-600 bg-navy-700/50"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "text-lg font-bold",
                          rank === 0 ? "text-amber-400" : "text-navy-400"
                        )}
                      >
                        #{rank + 1}
                      </span>
                      <span className="text-steel-100 font-bold">
                        {player.name}
                      </span>
                      {isWinner && (
                        <span className="text-xs text-amber-400 uppercase">
                          Winner
                        </span>
                      )}
                    </div>
                    <span className="text-xl font-bold text-prestige">
                      {score} PP
                    </span>
                  </div>

                  {/* Score breakdown */}
                  <div className="mt-1 flex gap-3 text-xs text-navy-400">
                    <span>In-game: {inGamePP} PP</span>
                    {fundingBonus > 0 && (
                      <span className="text-funding">
                        +{fundingBonus} (${player.funding} funding)
                      </span>
                    )}
                    {materialBonus > 0 && (
                      <span className="text-material">
                        +{materialBonus} ({player.material} material)
                      </span>
                    )}
                    <span>{player.completedWork.length} jobs completed</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

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

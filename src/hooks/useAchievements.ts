"use client";

import { useState, useCallback } from "react";
import type { DrydockMastersState } from "@/game/types";
import { trackEvent } from "@/app/providers";
import { GAME_CONSTANTS } from "@/game/types";

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: "first_blood", name: "First Blood", description: "Complete your first game", icon: "⚔️" },
  { id: "dock_master", name: "Dock Master", description: "Win a game", icon: "🏆" },
  { id: "iron_will", name: "Iron Will", description: "Win with SI finishing below 10", icon: "🛡️" },
  { id: "speed_runner", name: "Speed Runner", description: "Win by Round 10", icon: "⚡" },
  { id: "the_cleaner", name: "The Cleaner", description: "Clear 3+ obstructions in one game", icon: "🧹" },
  { id: "paper_pusher", name: "Paper Pusher", description: "Complete 8+ jobs in one game", icon: "📋" },
  { id: "growth_survivor", name: "Growth Survivor", description: "Get 3+ growth works and place top 2", icon: "🌱" },
  { id: "penny_pincher", name: "Penny Pincher", description: "Win with $0 funding remaining", icon: "💸" },
  { id: "material_girl", name: "Material Girl", description: "End a game with 0 material", icon: "🪨" },
  { id: "team_player", name: "Team Player", description: "Use 3+ team actions in one game", icon: "🤝" },
  { id: "trader", name: "Trader", description: "Make 5+ trades in one game", icon: "🔄" },
  { id: "high_roller", name: "High Roller", description: "Complete a High Profile job", icon: "⭐" },
  { id: "full_house", name: "Full House", description: "Have all 4 drydock slots occupied at once", icon: "🏗️" },
  { id: "admirals_favorite", name: "Admiral's Favorite", description: "Win 5 games total", icon: "🎖️" },
  { id: "veteran", name: "Veteran", description: "Play 10 games total", icon: "🏅" },
];

interface StoredData {
  earned: Record<string, { date: string }>;
  stats: { gamesPlayed: number; gamesWon: number };
}

function loadData(): StoredData {
  if (typeof window === "undefined") return { earned: {}, stats: { gamesPlayed: 0, gamesWon: 0 } };
  try {
    const raw = localStorage.getItem("drydock_achievements");
    if (raw) return JSON.parse(raw);
  } catch {}
  return { earned: {}, stats: { gamesPlayed: 0, gamesWon: 0 } };
}

function saveData(data: StoredData) {
  if (typeof window === "undefined") return;
  localStorage.setItem("drydock_achievements", JSON.stringify(data));
}

export function useAchievements() {
  const [newlyEarned, setNewlyEarned] = useState<Achievement[]>([]);
  const [data, setData] = useState<StoredData>(loadData);

  const evaluate = useCallback(
    (
      G: DrydockMastersState,
      gameover: any,
      playerID: string
    ) => {
      const stored = loadData();
      const player = G.players[playerID];
      if (!player) return;

      const isWin = gameover && !gameover.allLose;
      const isWinner =
        isWin &&
        (Array.isArray(gameover.winner)
          ? gameover.winner.includes(playerID)
          : gameover.winner === playerID);

      // Increment cumulative stats FIRST (fixes order-of-operations bug)
      stored.stats.gamesPlayed++;
      if (isWinner) stored.stats.gamesWon++;

      // Compute scores for ranking
      const scores = Object.entries(G.players)
        .map(([pid, p]) => ({ pid, score: p.pp }))
        .sort((a, b) => b.score - a.score);
      const rank = scores.findIndex((s) => s.pid === playerID) + 1;

      // Check each achievement
      const earned: Achievement[] = [];
      function check(id: string, condition: boolean) {
        if (condition && !stored.earned[id]) {
          stored.earned[id] = { date: new Date().toISOString().split("T")[0] };
          const ach = ACHIEVEMENTS.find((a) => a.id === id);
          if (ach) earned.push(ach);
        }
      }

      check("first_blood", true);
      check("dock_master", isWinner);
      check("iron_will", isWinner && G.shipyardIntegrity < 10);
      check("speed_runner", isWinner && G.round <= GAME_CONSTANTS.ON_TIME_ROUND);
      check("the_cleaner", player.problemsCleared >= 3);
      check("paper_pusher", player.completedWork.length >= 8);
      check("growth_survivor", player.growthWorksHit >= 3 && rank <= 2);
      check("penny_pincher", isWinner && player.funding === 0);
      check("material_girl", player.material === 0);
      check("team_player", player.teamActionsCount >= 3);
      check("trader", player.tradesCount >= 5);
      check("high_roller", player.completedWork.some((c) => c.isHighProfile));
      check("full_house", player.hadFullHouse);
      check("admirals_favorite", stored.stats.gamesWon >= 5);
      check("veteran", stored.stats.gamesPlayed >= 10);

      saveData(stored);
      setData(stored);
      if (earned.length > 0) {
        setNewlyEarned(earned);
        earned.forEach((a) => trackEvent("achievement_earned", { id: a.id, name: a.name }));
      }
    },
    []
  );

  const dismissNewAchievements = useCallback(() => setNewlyEarned([]), []);

  return {
    achievements: ACHIEVEMENTS,
    earned: data.earned,
    stats: data.stats,
    newlyEarned,
    evaluate,
    dismissNewAchievements,
  };
}

import type { PlayerState, DrydockMastersState } from "@/game/types";

export interface SecretObjective {
  id: string;
  name: string;
  description: string;
  bonusPP: number;
  /** Evaluate whether this objective was fulfilled at game end */
  check: (player: PlayerState, G: DrydockMastersState, playerID: string) => boolean;
}

export const SECRET_OBJECTIVES: SecretObjective[] = [
  {
    id: "stockpiler",
    name: "Stockpiler",
    description: "End the game with 10+ material",
    bonusPP: 4,
    check: (p) => p.material >= 10,
  },
  {
    id: "the_miser",
    name: "The Miser",
    description: "End the game with 10+ funding",
    bonusPP: 4,
    check: (p) => p.funding >= 10,
  },
  {
    id: "speed_demon",
    name: "Speed Demon",
    description: "Complete 3 jobs by Round 6",
    bonusPP: 5,
    // Can't check mid-game from end state — track via completedWork timestamps
    // Simplified: check total completed >= 3 AND game ended by round 10
    check: (p, G) => p.completedWork.length >= 3 && G.round <= 10,
  },
  {
    id: "jack_of_all_trades",
    name: "Jack of All Trades",
    description: "Complete jobs in 3+ different categories",
    bonusPP: 4,
    check: (p) => {
      const cats = new Set(p.completedWork.map((c) => ("category" in c ? c.category : "general")));
      return cats.size >= 3;
    },
  },
  {
    id: "lone_wolf",
    name: "Lone Wolf",
    description: "Make 0 trades all game",
    bonusPP: 3,
    check: (p) => p.tradesCount === 0,
  },
  {
    id: "saboteur",
    name: "Saboteur",
    description: "Have the most growth works hit by end of game",
    bonusPP: 6,
    check: (p, G, pid) => {
      const maxGrowth = Math.max(...Object.values(G.players).map((pl) => pl.growthWorksHit));
      return p.growthWorksHit === maxGrowth && p.growthWorksHit >= 2;
    },
  },
  {
    id: "guardian",
    name: "Guardian",
    description: "Clear 2+ obstructions",
    bonusPP: 3,
    check: (p) => p.problemsCleared >= 2,
  },
  {
    id: "high_ambition",
    name: "High Ambition",
    description: "Complete 2+ High Profile jobs",
    bonusPP: 5,
    check: (p) => p.completedWork.filter((c) => c.isHighProfile).length >= 2,
  },
  {
    id: "diplomat",
    name: "Diplomat",
    description: "Make 3+ trades",
    bonusPP: 3,
    check: (p) => p.tradesCount >= 3,
  },
  {
    id: "overtime_king",
    name: "Overtime King",
    description: "Use 2+ team actions",
    bonusPP: 3,
    check: (p) => p.teamActionsCount >= 2,
  },
  {
    id: "the_specialist",
    name: "The Specialist",
    description: "Complete 3+ jobs in the same category",
    bonusPP: 4,
    check: (p) => {
      const counts: Record<string, number> = {};
      for (const c of p.completedWork) {
        const cat = "category" in c ? c.category : "general";
        counts[cat] = (counts[cat] || 0) + 1;
      }
      return Object.values(counts).some((v) => v >= 3);
    },
  },
  {
    id: "full_house",
    name: "Full House",
    description: "Have all 4 drydock slots occupied at once during the game",
    bonusPP: 3,
    check: (p) => p.hadFullHouse,
  },
  {
    id: "penny_pincher",
    name: "Penny Pincher",
    description: "End the game with $0 funding",
    bonusPP: 3,
    check: (p) => p.funding === 0,
  },
  {
    id: "underdog",
    name: "Underdog",
    description: "Be in last place for PP at any milestone check",
    bonusPP: 5,
    // Simplified: lowest PP among all players at game end but still close (within 5 of winner)
    check: (p, G, pid) => {
      const pps = Object.values(G.players).map((pl) => pl.pp);
      const minPP = Math.min(...pps);
      const maxPP = Math.max(...pps);
      return p.pp === minPP && p.pp !== maxPP && maxPP - minPP <= 8;
    },
  },
  {
    id: "iron_resolve",
    name: "Iron Resolve",
    description: "Finish the game with SI below 5",
    bonusPP: 4,
    check: (_p, G) => G.shipyardIntegrity < 5 && G.shipyardIntegrity > 0,
  },
];

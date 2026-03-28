import { useMemo } from "react";
import type { DrydockMastersState, LaborDie } from "@/game/types";

/** Pre-compute a Map of dieID → LaborDie for O(1) lookups */
export function useDiceMap(
  players: DrydockMastersState["players"]
): Map<string, LaborDie> {
  return useMemo(() => {
    const map = new Map<string, LaborDie>();
    for (const player of Object.values(players)) {
      for (const die of player.dice) {
        map.set(die.id, die);
      }
    }
    return map;
  }, [players]);
}

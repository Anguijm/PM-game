import { Game } from "boardgame.io";
import type { DrydockMastersState, EventCard } from "./types";
import { GamePhase, EventPersistence, GAME_CONSTANTS } from "./types";
import { setupGame } from "./setup";
import {
  selectContract,
  stageWork,
  assignLabor,
  procurement,
  coordinate,
  analyzeMarket,
  hireForeman,
  clearObstruction,
  trade,
  emergencyOvertime,
  expeditedShipping,
  draftCard,
  pass,
  acknowledgeEvent,
  acknowledgeResolution,
} from "./moves";
import {
  applyPersistentProblemDrain,
  applyUtilizationBonus,
  countdownDice,
  resolveCompletions,
  checkMilestones,
  marketChurn,
  cleanup,
  calculateFinalScores,
} from "./resolution";

// ============================================================
// Event Phase Logic
// ============================================================

function resolveEvent(G: DrydockMastersState, event: EventCard) {
  const effect = event.effect;

  // Apply SI change
  if (effect.siChange) {
    G.shipyardIntegrity += effect.siChange;
    if (G.shipyardIntegrity <= 0) {
      G.shipyardIntegrity = 0;
      G.gameOver = true;
    }
  }

  // Apply per-player changes
  for (const player of Object.values(G.players)) {
    if (effect.fundingChange) {
      player.funding = Math.max(0, player.funding + effect.fundingChange);
    }
    if (effect.materialChange) {
      player.material = Math.max(0, player.material + effect.materialChange);
    }
  }

  // Apply special effects
  if (effect.special) {
    resolveSpecialEffect(G, effect.special);
  }

  // Handle persistent events
  if (event.persistence === EventPersistence.Persistent) {
    G.persistentProblems.push(event);
  }
}

function resolveSpecialEffect(G: DrydockMastersState, special: string) {
  const maxSI = GAME_CONSTANTS.MAX_SI ?? 35;

  switch (special) {
    case "admiralVisit": {
      // SI +3 if at least one High Profile job is in progress
      const hasHighProfile = Object.values(G.players).some((p) =>
        p.stagedSlots.some(
          (s) => s.card?.isHighProfile && s.assignedDice.filter(Boolean).length > 0
        )
      );
      if (hasHighProfile) {
        G.shipyardIntegrity = Math.min(maxSI, G.shipyardIntegrity + 3);
      }
      break;
    }

    case "igVisit": {
      // If SI > 20, gain +3 SI. If SI < 10, lose 3 SI.
      if (G.shipyardIntegrity > 20) {
        G.shipyardIntegrity = Math.min(maxSI, G.shipyardIntegrity + 3);
      } else if (G.shipyardIntegrity < 10) {
        G.shipyardIntegrity -= 3;
        if (G.shipyardIntegrity <= 0) {
          G.shipyardIntegrity = 0;
          G.gameOver = true;
        }
      }
      break;
    }

    // Persistent specials (hurricaneWarning, congressionalAudit, dockFlooding)
    // are handled by checking G.persistentProblems in the move reducers.
    // Their effect is applied passively while active — no instant resolution needed.
    case "hurricaneWarning":
    case "congressionalAudit":
    case "dockFlooding":
      // These are persistent — effect applied via hasPersistentSpecial() checks in moves
      break;
  }
}

/** Check if a specific persistent special effect is currently active */
export function hasPersistentSpecial(G: DrydockMastersState, special: string): boolean {
  return G.persistentProblems.some((p) => p.effect.special === special);
}

// ============================================================
// Boardgame.io Game Definition
// ============================================================

export const DrydockMasters: Game<DrydockMastersState> = {
  name: "drydock-masters",

  setup: ({ ctx }) => setupGame(ctx),

  phases: {
    // --- Phase 0: Contract Selection (sequential turns) ---
    [GamePhase.ContractSelection]: {
      start: true,
      next: GamePhase.Event,

      moves: {
        selectContract: selectContract,
      },

      turn: {
        minMoves: 1,
        maxMoves: 1,
      },

      endIf: ({ G }) => {
        const allChosen = Object.values(G.players).every((p) => p.contract !== null);
        return allChosen ? true : undefined;
      },
    },

    // --- Phase I: Event ---
    [GamePhase.Event]: {
      next: GamePhase.Planning,

      onBegin: ({ G }) => {
        G.eventAcknowledged = false;

        // Draw and resolve event
        const deck = G.round <= 6 ? G.eventDeckI : G.eventDeckII;
        const event = deck.pop();

        if (event) {
          G.activeEvent = event;
          resolveEvent(G, event);
        } else {
          // No event to show — auto-acknowledge
          G.eventAcknowledged = true;
        }
      },

      moves: {
        acknowledgeEvent: { move: acknowledgeEvent, noLimit: true },
      },

      endIf: ({ G }) => {
        return G.eventAcknowledged ? true : undefined;
      },
    },

    // --- Phase II: Planning (Draft) ---
    [GamePhase.Planning]: {
      next: GamePhase.Action,

      onBegin: ({ G }) => {
        G.playersDraftedThisRound = [];

        // Deck management at round 6
        if (G.round === 6) {
          G.workOrderDeck = [...G.workOrderDeck, ...G.workOrderDeckB];
          G.workOrderDeckB = [];
        }

        // Refresh market
        const marketSize = Object.keys(G.players).length + 2;
        while (G.workOrderMarket.length < marketSize && G.workOrderDeck.length > 0) {
          const card = G.workOrderDeck.pop();
          if (card) G.workOrderMarket.push(card);
        }
      },

      moves: {
        draftCard: draftCard,
      },

      turn: {
        minMoves: 1,
        maxMoves: 1,
      },

      endIf: ({ G, ctx }) => {
        // End when all players have drafted
        return G.playersDraftedThisRound.length >= ctx.numPlayers ? true : undefined;
      },
    },

    // --- Phase III: Action ---
    [GamePhase.Action]: {
      next: GamePhase.Resolution,

      onBegin: ({ G }) => {
        // Reset actions for all players
        for (const player of Object.values(G.players)) {
          player.actionsRemaining = GAME_CONSTANTS.ACTIONS_PER_TURN;
        }
      },

      moves: {
        // Costed actions (1 action each)
        stageWork: { move: stageWork, noLimit: true },
        assignLabor: { move: assignLabor, noLimit: true },
        procurement: { move: procurement, noLimit: true },
        coordinate: { move: coordinate, noLimit: true },
        analyzeMarket: { move: analyzeMarket, noLimit: true },
        hireForeman: { move: hireForeman, noLimit: true },
        clearObstruction: { move: clearObstruction, noLimit: true },

        // Free actions
        trade: { move: trade, noLimit: true },

        // Team actions (SI cost)
        emergencyOvertime: { move: emergencyOvertime, noLimit: true },
        expeditedShipping: { move: expeditedShipping, noLimit: true },

        // Explicit pass
        pass: { move: pass, noLimit: true },
      },

      turn: {
        // Turn ends when the current player has passed
        endIf: ({ G, ctx }) => {
          const player = G.players[ctx.currentPlayer];
          return player?.hasPassed === true;
        },
      },

      endIf: ({ G }) => {
        // Phase ends when ALL players have passed
        const allPassed = Object.values(G.players).every(
          (p) => p.hasPassed
        );
        return allPassed ? true : undefined;
      },
    },

    // --- Phase IV: Resolution ---
    [GamePhase.Resolution]: {
      next: GamePhase.Event,

      onBegin: ({ G, random }) => {
        G.resolutionAcknowledged = false;

        // Step 0: Persistent problem SI drain
        applyPersistentProblemDrain(G);

        // Step 1: Utilization bonus
        applyUtilizationBonus(G);

        // Step 2: Countdown all dice
        countdownDice(G);

        // Step 3: Check completions and run inspections (deterministic shuffle)
        resolveCompletions(G, random?.Shuffle);

        // Step 4: Milestone checks
        checkMilestones(G);

        // Step 5: Market churn
        marketChurn(G);

        // Step 6: Cleanup & advance round
        cleanup(G);
      },

      moves: {
        acknowledgeResolution: { move: acknowledgeResolution, noLimit: true },
      },

      endIf: ({ G }) => {
        return G.resolutionAcknowledged ? true : undefined;
      },
    },
  },

  endIf: ({ G }) => {
    if (!G.gameOver) return undefined;

    if (!G.collectiveGoalMet) {
      // Everyone loses
      return { winner: undefined, allLose: true };
    }

    // Calculate final scores
    const scores = calculateFinalScores(G);
    const sortedPlayers = Object.entries(scores).sort((a, b) => b[1] - a[1]);

    // Check for tie
    if (
      sortedPlayers.length > 1 &&
      sortedPlayers[0][1] === sortedPlayers[1][1]
    ) {
      // Tiebreaker: most completed work orders
      const p0 = G.players[sortedPlayers[0][0]];
      const p1 = G.players[sortedPlayers[1][0]];
      if (p0.completedWork.length !== p1.completedWork.length) {
        return {
          winner: p0.completedWork.length > p1.completedWork.length
            ? sortedPlayers[0][0]
            : sortedPlayers[1][0],
          scores,
        };
      }
      // Shared victory
      return { winner: [sortedPlayers[0][0], sortedPlayers[1][0]], scores };
    }

    return { winner: sortedPlayers[0][0], scores };
  },

  minPlayers: 2,
  maxPlayers: 6,
};

export default DrydockMasters;

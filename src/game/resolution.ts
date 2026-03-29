import type {
  DrydockMastersState,
  PlayerState,
  LaborDie,
  StagedWorkSlot,
  WorkCard,
} from "./types";
import {
  CFRResult,
  GAME_CONSTANTS,
  SI_THRESHOLDS,
  GamePhase,
} from "./types";
import { shuffle } from "./utils";

// ============================================================
// Resolution Phase Logic
// ============================================================

/** Step 0: Persistent Problem SI Drain — problems beyond the first cost -1 SI each per round */
export function applyPersistentProblemDrain(G: DrydockMastersState) {
  // Every problem drains SI
  const drainingProblems = G.persistentProblems.length;
  if (drainingProblems === 0) return;
  const drain = drainingProblems * GAME_CONSTANTS.PERSISTENT_PROBLEM_SI_DRAIN;
  G.shipyardIntegrity -= drain;

  // Track if SI ever dropped below 10 (for "Iron Will" badge)
  if (G.shipyardIntegrity < 10) {
    for (const player of Object.values(G.players)) {
      player.hasHadLowSI = true;
    }
  }

  if (G.shipyardIntegrity <= 0) {
    G.shipyardIntegrity = 0;
    G.gameOver = true;
  }
}

/** Step 1: Utilization Bonus — $2 if all staged slots are actively processing */
export function applyUtilizationBonus(G: DrydockMastersState) {
  if (G.shipyardIntegrity < SI_THRESHOLDS.INCREASED_OVERSIGHT) return;

  for (const player of Object.values(G.players)) {
    const activeSlots = player.stagedSlots.filter((s) => s.card !== null);

    // Must have at least one card staged, and ALL cards must have at least one die
    if (
      activeSlots.length > 0 &&
      activeSlots.every((slot) => slot.assignedDice.filter(Boolean).length > 0)
    ) {
      player.funding += GAME_CONSTANTS.UTILIZATION_BONUS;
    }
  }
}

/** Step 2: Countdown — reduce all assigned dice by 1 */
export function countdownDice(G: DrydockMastersState) {
  for (const player of Object.values(G.players)) {
    for (const die of player.dice) {
      if (die.assignedToSlot !== null && die.value !== null && die.value > 0) {
        die.value -= 1;
      }
    }
  }
}

/** Find the die object across all players by ID */
function findDieGlobal(G: DrydockMastersState, dieID: string): LaborDie | undefined {
  for (const player of Object.values(G.players)) {
    const die = player.dice.find((d) => d.id === dieID);
    if (die) return die;
  }
  return undefined;
}

/** Shuffle function type — either boardgame.io's random.Shuffle or our fallback */
type ShuffleFn = <T>(arr: T[]) => T[];

/** Step 3: Completion & Inspection */
export function resolveCompletions(G: DrydockMastersState, shuffleFn?: ShuffleFn): CompletionResult[] {
  const results: CompletionResult[] = [];

  for (const player of Object.values(G.players)) {
    for (const slot of player.stagedSlots) {
      if (!slot.card) continue;
      if (slot.assignedDice.filter(Boolean).length === 0) continue;

      // Check if ALL dice on this slot have reached 0
      const allDiceComplete = slot.assignedDice
        .filter(Boolean)
        .every((dieID) => {
          const die = findDieGlobal(G, dieID);
          return die && die.value === 0;
        });

      // Check if all labor requirements are filled
      const allReqsFilled =
        slot.assignedDice.filter(Boolean).length >= slot.card.laborRequirements.length;

      if (allDiceComplete && allReqsFilled) {
        // Draw CFR token
        let cfrResult = drawCFR(G, shuffleFn);

        // Foreman: cfrRedraw — pay $2 to redraw a Growth result once
        if (
          cfrResult === "growth" &&
          player.foreman?.ability === "cfrRedraw" &&
          player.funding >= 2
        ) {
          player.funding -= 2;
          cfrResult = drawCFR(G, shuffleFn);
        }

        results.push({
          playerID: player.id,
          slotID: slot.id,
          card: slot.card,
          cfrResult,
        });

        if (cfrResult === "clear") {
          // Success — move to completed work
          let ppGained = slot.card.prestigeValue;

          // Admiral's Mandate: combatBonus — +1 PP for combat category
          if (
            G.admiralMandate?.rule === "combatBonus" &&
            "category" in slot.card &&
            slot.card.category === "combat"
          ) {
            ppGained += 1;
          }

          // High Profile bonus
          if (slot.card.isHighProfile) {
            G.shipyardIntegrity += GAME_CONSTANTS.HIGH_PROFILE_SI_BONUS;
            ppGained += GAME_CONSTANTS.HIGH_PROFILE_PP_BONUS;
          }

          // PP compression: leaders get 1 less PP from completions (min 1)
          // Threshold scales with player count: more players = tighter compression
          const numP = Object.keys(G.players).length;
          const ppThreshold = numP <= 2 ? 14 : numP === 3 ? 10 : 8;
          if (player.pp > ppThreshold && ppGained > 1) {
            ppGained -= 1;
          }

          // Handle loaned labor PP distribution
          const loanedDice = slot.assignedDice.filter(Boolean).map((dieID) => {
            const die = findDieGlobal(G, dieID)!;
            return die;
          }).filter((d) => d.ownerID !== player.id);

          if (loanedDice.length > 0) {
            distributeLoanPP(G, player, slot, ppGained, loanedDice);
          } else {
            player.pp += ppGained;
          }

          player.completedWork.push(slot.card);
        } else {
          // Growth Work — fail-forward: team loses SI, player gets compensation
          player.growthWorksHit++;
          player.pp = Math.max(0, player.pp - 1);

          // Shared pain: team loses SI (safetyFirst mandate: extra -1 SI)
          let siPenalty: number = GAME_CONSTANTS.GROWTH_WORK_SI_PENALTY; // negative number
          if (G.admiralMandate?.rule === "safetyFirst") siPenalty -= 1; // more negative = more penalty
          G.shipyardIntegrity = Math.max(0, G.shipyardIntegrity + siPenalty);

          // Individual compensation: PP + funding
          player.pp += GAME_CONSTANTS.GROWTH_WORK_PP_COMPENSATION;
          player.funding += GAME_CONSTANTS.GROWTH_WORK_FUNDING_COMPENSATION;

          const growthCard = G.growthWorkDeck.pop();
          if (growthCard) {
            // Clone the card to avoid mutating the template
            const stagedGrowth = { ...growthCard };
            // safetyFirst mandate: growth work costs 1 less material
            if (G.admiralMandate?.rule === "safetyFirst") {
              stagedGrowth.materialCost = Math.max(0, stagedGrowth.materialCost - 1);
            }
            // Find empty slot
            const emptySlot = player.stagedSlots.find((s) => s.card === null);
            if (emptySlot) {
              emptySlot.card = stagedGrowth;
            } else {
              // Must pause an existing job — for now, pause the last slot
              const pauseSlot = player.stagedSlots[GAME_CONSTANTS.STAGED_SLOTS - 1];
              if (pauseSlot.card) {
                player.hand.push(pauseSlot.card);
                returnDiceFromSlot(G, pauseSlot);
                pauseSlot.card = stagedGrowth;
                pauseSlot.assignedDice = [];
              }
            }
          }
        }

        // Return all dice from this completed slot to owners
        returnDiceFromSlot(G, slot);
        slot.card = null;
        slot.assignedDice = [];
      }
    }
  }

  return results;
}

function drawCFR(G: DrydockMastersState, shuffleFn?: ShuffleFn): CFRResult {
  if (G.cfrBag.tokens.length === 0) {
    const newTokens: CFRResult[] = [
      ...Array(GAME_CONSTANTS.CFR_CLEAR_COUNT).fill(CFRResult.Clear),
      ...Array(GAME_CONSTANTS.CFR_GROWTH_COUNT).fill(CFRResult.Growth),
    ];
    // Use deterministic shuffle from boardgame.io if available, else fallback
    G.cfrBag.tokens = (shuffleFn || shuffle)(newTokens);
  }
  return G.cfrBag.tokens.pop()!;
}

function returnDiceFromSlot(G: DrydockMastersState, slot: StagedWorkSlot) {
  for (const dieID of slot.assignedDice) {
    if (!dieID) continue;
    const die = findDieGlobal(G, dieID);
    if (die) {
      die.value = null;
      die.originalValue = null;
      die.assignedToSlot = null;
      die.holderID = die.ownerID; // return to owner
    }
  }
}

function distributeLoanPP(
  G: DrydockMastersState,
  cardOwner: PlayerState,
  slot: StagedWorkSlot,
  totalPP: number,
  loanedDice: LaborDie[]
) {
  // Check for explicit loan agreements
  const agreements = cardOwner.activeLoans.filter(
    (loan) => loan.slotID === slot.id
  );

  let ownerPP = totalPP;

  if (agreements.length > 0) {
    // Use negotiated splits
    for (const agreement of agreements) {
      if (agreement.agreedPP !== null) {
        const lender = G.players[agreement.lenderID];
        if (lender) {
          lender.pp += agreement.agreedPP;
          ownerPP -= agreement.agreedPP;
        }
      }
    }
  } else {
    // Default proportional split — owner gets at least half (rounded up)
    const ownerShare = Math.ceil(totalPP / 2);
    const lenderShare = totalPP - ownerShare;

    // Distribute lender share proportionally by original time commitment
    const totalLoanedPips = loanedDice.reduce((sum, d) => {
      return sum + (d.originalValue ?? 1);
    }, 0);

    if (totalLoanedPips > 0 && lenderShare > 0) {
      for (const die of loanedDice) {
        const pips = die.originalValue ?? 1;
        const share = Math.round((pips / totalLoanedPips) * lenderShare);
        const lender = G.players[die.ownerID];
        if (lender) lender.pp += share;
        ownerPP -= share;
      }
    }
  }

  // Clean up loan agreements for this slot
  cardOwner.activeLoans = cardOwner.activeLoans.filter(
    (loan) => loan.slotID !== slot.id
  );

  cardOwner.pp += Math.max(0, ownerPP);
}

export interface CompletionResult {
  playerID: string;
  slotID: string;
  card: WorkCard;
  cfrResult: CFRResult;
}

/** Step 4: Milestone Deadline Checks — CUMULATIVE TOTAL JOBS (Batch 3 balance) */
export function checkMilestones(G: DrydockMastersState) {
  // acceleratedTimeline mandate: milestones 1 round earlier
  const accel = G.admiralMandate?.rule === "acceleratedTimeline" ? 1 : 0;
  const milestoneRounds = [6 - accel, 8 - accel, 10 - accel];
  if (!milestoneRounds.includes(G.round)) return;

  // Cumulative quota: total jobs needed by this round (any category)
  // Scale down for 3+ players (more events/drain, tighter economy per capita)
  const numPlayers = Object.keys(G.players).length;
  // Direct per-player-count scaling
  // 2P: R6=2, R8=4, R10=6 | 3P: R6=1, R8=3, R10=4 | 4P: R6=1, R8=2, R10=4
  const quotaScale = numPlayers <= 2 ? 1.0 : numPlayers === 3 ? 0.70 : 0.58;
  let baseQuota: number;
  if (G.round === milestoneRounds[0]) baseQuota = GAME_CONSTANTS.MILESTONE_R6_QUOTA;
  else if (G.round === milestoneRounds[1]) baseQuota = GAME_CONSTANTS.MILESTONE_R8_QUOTA;
  else baseQuota = GAME_CONSTANTS.MILESTONE_R10_QUOTA;
  const requiredTotal = Math.max(1, Math.round(baseQuota * quotaScale));

  let anyFailed = false;
  for (const player of Object.values(G.players)) {
    if (!player.contract) continue;

    const totalCompleted = player.completedWork.length;

    if (totalCompleted >= requiredTotal) {
      if (G.round !== 10) {
        player.pp += GAME_CONSTANTS.MILESTONE_REWARD_PP;
      }
    } else {
      anyFailed = true;
      const missing = requiredTotal - totalCompleted;
      // PP penalty is individual
      player.pp = Math.max(0, player.pp - GAME_CONSTANTS.MILESTONE_PENALTY_PP * missing);
    }
  }

  // SI penalty is applied ONCE to the team if anyone failed (not per-player)
  if (anyFailed) {
    G.shipyardIntegrity -= GAME_CONSTANTS.MILESTONE_PENALTY_SI_FLAT;
  }

  // Check for SI=0 game over
  if (G.shipyardIntegrity <= 0) {
    G.shipyardIntegrity = 0;
    G.gameOver = true;
  }
}

/** Step 5: Market Churn — discard leftmost card */
export function marketChurn(G: DrydockMastersState) {
  if (G.workOrderMarket.length > 0) {
    G.workOrderMarket.shift();
  }
}

/** Step 6: Cleanup — advance round, rotate first player */
export function cleanup(G: DrydockMastersState) {
  // Check for late completion penalties
  if (G.round === 10) {
    // Check if collective goal is met
    const allContractsComplete = checkAllContractsComplete(G);
    if (allContractsComplete) {
      G.gameOver = true;
      G.collectiveGoalMet = true;
      return;
    }
  }

  if (G.round >= 11) {
    // Late penalty
    G.shipyardIntegrity -= GAME_CONSTANTS.LATE_PENALTY_SI;
    if (G.shipyardIntegrity <= 0) {
      G.shipyardIntegrity = 0;
      G.gameOver = true;
      return;
    }
  }

  if (G.round >= GAME_CONSTANTS.MAX_ROUNDS) {
    G.gameOver = true;
    G.collectiveGoalMet = checkAllContractsComplete(G);
    return;
  }

  // Advance round
  G.round++;

  // Rotate first player
  const numPlayers = Object.keys(G.players).length;
  G.firstPlayerIndex = (G.firstPlayerIndex + 1) % numPlayers;

  // Reset per-round state
  G.teamActionsUsedThisRound = {
    emergencyOvertime: false,
    expeditedShipping: false,
  };

  // Note: eventAcknowledged and resolutionAcknowledged are reset in their
  // respective phase onBegin hooks, NOT here. Resetting here causes a race
  // condition where the bot acks between cleanup and the next onBegin.

  // Reset actions and pass state for all players
  for (const player of Object.values(G.players)) {
    player.actionsRemaining = GAME_CONSTANTS.ACTIONS_PER_TURN;
    player.hasPassed = false;
    player.foremanUsedThisRound = false;
  }

  // Deck management
  if (G.round === 6) {
    // Shuffle Phase B into the work order deck
    G.workOrderDeck = [...G.workOrderDeck, ...G.workOrderDeckB];
    // Shuffle would use boardgame.io RNG in production
  }
}

function checkAllContractsComplete(G: DrydockMastersState): boolean {
  const numPlayers = Object.keys(G.players).length;
  // Direct per-player-count scaling
  // 2P: R6=2, R8=4, R10=6 | 3P: R6=1, R8=3, R10=4 | 4P: R6=1, R8=2, R10=4
  const quotaScale = numPlayers <= 2 ? 1.0 : numPlayers === 3 ? 0.70 : 0.58;
  const requiredTotal = Math.max(1, Math.round(GAME_CONSTANTS.MILESTONE_R10_QUOTA * quotaScale));

  for (const player of Object.values(G.players)) {
    if (!player.contract) continue;
    if (player.completedWork.length < requiredTotal) return false;
  }
  return true;
}

/** Calculate final scores */
export function calculateFinalScores(G: DrydockMastersState): Record<string, number> {
  const scores: Record<string, number> = {};

  for (const player of Object.values(G.players)) {
    let total = player.pp;
    total += Math.floor(player.funding / GAME_CONSTANTS.FINAL_FUNDING_PP_RATIO);
    total += Math.floor(player.material / GAME_CONSTANTS.FINAL_MATERIAL_PP_RATIO);
    scores[player.id] = total;
  }

  return scores;
}

import { INVALID_MOVE } from "boardgame.io/core";
import type {
  DrydockMastersState,
  WorkCard,
  LaborDie,
  StagedWorkSlot,
  TradeOffer,
  LoanAgreement,
} from "./types";
import {
  DieColor,
  GAME_CONSTANTS,
  SI_THRESHOLDS,
} from "./types";
import type { FnContext } from "boardgame.io";

type MoveContext = { G: DrydockMastersState; playerID: string; events?: any };

function hasPersistentSpecial(G: DrydockMastersState, special: string): boolean {
  return G.persistentProblems.some((p) => p.effect.special === special);
}

function hasForeman(G: DrydockMastersState, playerID: string, ability: string): boolean {
  return G.players[playerID]?.foreman?.ability === ability;
}

function hasMandate(G: DrydockMastersState, rule: string): boolean {
  return G.admiralMandate?.rule === rule;
}

// ============================================================
// Helper functions
// ============================================================

function getPlayer(G: DrydockMastersState, playerID: string) {
  return G.players[playerID];
}

function getAvailableDice(G: DrydockMastersState, playerID: string): LaborDie[] {
  const player = getPlayer(G, playerID);
  return player.dice.filter(
    (d) => d.holderID === playerID && d.assignedToSlot === null
  );
}

function findDie(G: DrydockMastersState, playerID: string, dieID: string): LaborDie | undefined {
  return G.players[playerID].dice.find((d) => d.id === dieID);
}

// ============================================================
// Action Moves (cost 1 action each)
// ============================================================

/** Stage Work: Move a card from hand (AWP) to an empty staged slot */
export function stageWork(
  { G, playerID }: MoveContext,
  cardID: string,
  slotIndex: number
) {
  const player = getPlayer(G, playerID);
  if (player.hasPassed || player.actionsRemaining <= 0) return INVALID_MOVE;

  // Find card in hand
  const cardIndex = player.hand.findIndex((c) => c.id === cardID);
  if (cardIndex === -1) return INVALID_MOVE;

  // Check slot is valid and empty
  if (slotIndex < 0 || slotIndex >= GAME_CONSTANTS.STAGED_SLOTS) return INVALID_MOVE;
  // Dock Flooding: last slot is locked
  if (hasPersistentSpecial(G, "dockFlooding") && slotIndex === GAME_CONSTANTS.STAGED_SLOTS - 1) return INVALID_MOVE;
  const slot = player.stagedSlots[slotIndex];
  if (slot.card !== null) return INVALID_MOVE;

  const card = player.hand[cardIndex];

  // Pay material cost (foreman: hullDiscount reduces hull work by 1M)
  let materialCost = card.materialCost;
  if (hasForeman(G, playerID, "hullDiscount") && card.laborRequirements.some((r) => r.color === DieColor.Red)) {
    materialCost = Math.max(0, materialCost - 1);
  }
  if (player.material < materialCost) return INVALID_MOVE;
  player.material -= materialCost;

  // Move card from hand to slot
  player.hand.splice(cardIndex, 1);
  slot.card = card;

  player.actionsRemaining--;
}

/** Assign Labor: Place an available die on a staged work slot */
export function assignLabor(
  { G, playerID }: MoveContext,
  dieID: string,
  slotIndex: number,
  requirementIndex: number
) {
  const player = getPlayer(G, playerID);
  if (player.hasPassed || player.actionsRemaining <= 0) return INVALID_MOVE;

  // Find the die (could be owned or loaned to this player)
  let die: LaborDie | undefined;
  for (const p of Object.values(G.players)) {
    die = p.dice.find((d) => d.id === dieID && d.holderID === playerID);
    if (die) break;
  }
  if (!die || die.assignedToSlot !== null) return INVALID_MOVE;

  // Check slot
  if (slotIndex < 0 || slotIndex >= GAME_CONSTANTS.STAGED_SLOTS) return INVALID_MOVE;
  const slot = player.stagedSlots[slotIndex];
  if (!slot.card) return INVALID_MOVE;

  // Check requirement index is valid and not already filled
  const req = slot.card.laborRequirements[requirementIndex];
  if (!req) return INVALID_MOVE;

  // Check if this requirement slot already has a die
  if (slot.assignedDice.length > requirementIndex) {
    // Check if already assigned at this index
    const existingDieForReq = slot.assignedDice[requirementIndex];
    if (existingDieForReq) return INVALID_MOVE;
  }

  // Calculate wage cost (foreman: electricianFreeWages = yellow dice free)
  let wageCost: number = GAME_CONSTANTS.LABOR_WAGE;
  if (hasForeman(G, playerID, "electricianFreeWages") && die.color === DieColor.Yellow) {
    wageCost = 0;
  }
  const isCrossTraining = die.color !== req.color && die.color !== DieColor.Gray;

  if (isCrossTraining) {
    // Check SI threshold for cross-training
    if (G.shipyardIntegrity < SI_THRESHOLDS.EMERGENCY_MEASURES) return INVALID_MOVE;
    wageCost += GAME_CONSTANTS.CROSS_TRAINING_FEE;
    // Congressional Audit: +$1 extra
    if (hasPersistentSpecial(G, "congressionalAudit")) wageCost += 1;
    // Foreman: crossTrainingDiscount -$1
    if (hasForeman(G, playerID, "crossTrainingDiscount")) wageCost = Math.max(1, wageCost - 1) as number;
  }

  if (player.funding < wageCost) return INVALID_MOVE;
  player.funding -= wageCost;

  // Assign the die
  die.value = req.time;
  die.originalValue = req.time;
  die.assignedToSlot = slot.id;
  slot.assignedDice[requirementIndex] = die.id;

  player.actionsRemaining--;
}

/** Calculate net procurement funding gain (centralized modifier stacking) */
function calcProcurementFunding(G: DrydockMastersState, playerID: string): number {
  const base = GAME_CONSTANTS.PROCUREMENT_FUNDING;
  let modifier = 0;
  if (hasPersistentSpecial(G, "hurricaneWarning")) modifier -= 1;
  if (hasMandate(G, "reducedProcurement")) modifier -= 1;
  if (hasForeman(G, playerID, "procurementBonus")) modifier += 1;
  return Math.max(1, base + modifier);
}

/** Calculate net procurement material gain (centralized modifier stacking) */
function calcProcurementMaterial(G: DrydockMastersState, playerID: string): number {
  const base = GAME_CONSTANTS.PROCUREMENT_MATERIAL;
  let modifier = 0;
  if (G.shipyardIntegrity < SI_THRESHOLDS.SUPPLY_CHAIN_SKEPTICISM) modifier -= 1;
  if (hasPersistentSpecial(G, "hurricaneWarning")) modifier -= 1;
  if (hasForeman(G, playerID, "procurementBonus")) modifier += 1;
  return Math.max(0, base + modifier);
}

/** Procurement: Gain Funding OR Material */
export function procurement(
  { G, playerID }: MoveContext,
  choice: "funding" | "material"
) {
  const player = getPlayer(G, playerID);
  if (player.hasPassed || player.actionsRemaining <= 0) return INVALID_MOVE;

  const cap = GAME_CONSTANTS.RESOURCE_CAP ?? 999;

  if (choice === "funding") {
    player.funding = Math.min(cap, player.funding + calcProcurementFunding(G, playerID));
  } else if (choice === "material") {
    player.material = Math.min(cap, player.material + calcProcurementMaterial(G, playerID));
  } else {
    return INVALID_MOVE;
  }

  player.actionsRemaining--;
}

/** Coordinate: Loan a die to another player */
export function coordinate(
  { G, playerID }: MoveContext,
  dieID: string,
  targetPlayerID: string
) {
  const player = getPlayer(G, playerID);
  if (player.hasPassed || player.actionsRemaining <= 0) return INVALID_MOVE;
  if (targetPlayerID === playerID) return INVALID_MOVE;
  if (!G.players[targetPlayerID]) return INVALID_MOVE;

  const die = findDie(G, playerID, dieID);
  if (!die || die.assignedToSlot !== null || die.holderID !== playerID) return INVALID_MOVE;

  // Transfer holder
  die.holderID = targetPlayerID;

  player.actionsRemaining--;
}

/** Analyze Market: Discard all market cards and refresh */
export function analyzeMarket({ G, playerID }: MoveContext) {
  const player = getPlayer(G, playerID);
  if (player.hasPassed || player.actionsRemaining <= 0) return INVALID_MOVE;
  if (player.funding < GAME_CONSTANTS.ANALYZE_MARKET_COST) return INVALID_MOVE;

  player.funding -= GAME_CONSTANTS.ANALYZE_MARKET_COST;

  // Discard current market
  G.workOrderMarket = [];

  // Refill from deck
  const marketSize = Object.keys(G.players).length + 2;
  for (let i = 0; i < marketSize && G.workOrderDeck.length > 0; i++) {
    const card = G.workOrderDeck.pop();
    if (card) G.workOrderMarket.push(card);
  }

  player.actionsRemaining--;
}

/** Hire Foreman: Pay $10, take a foreman card, gain 3 PP */
export function hireForeman(
  { G, playerID }: MoveContext,
  foremanIndex: number
) {
  const player = getPlayer(G, playerID);
  if (player.hasPassed || player.actionsRemaining <= 0) return INVALID_MOVE;
  if (player.funding < GAME_CONSTANTS.FOREMAN_COST) return INVALID_MOVE;
  if (player.foreman !== null) return INVALID_MOVE; // already has one
  if (foremanIndex < 0 || foremanIndex >= G.foremanMarket.length) return INVALID_MOVE;

  player.funding -= GAME_CONSTANTS.FOREMAN_COST;
  player.foreman = G.foremanMarket.splice(foremanIndex, 1)[0];
  player.pp += GAME_CONSTANTS.FOREMAN_PP;

  // Refresh foreman market
  const replacement = G.foremanDeck.pop();
  if (replacement) G.foremanMarket.push(replacement);

  player.actionsRemaining--;
}

/** Clear Obstruction: Remove a persistent problem */
export function clearObstruction(
  { G, playerID }: MoveContext,
  problemIndex: number
) {
  const player = getPlayer(G, playerID);
  if (player.hasPassed || player.actionsRemaining <= 0) return INVALID_MOVE;
  if (problemIndex < 0 || problemIndex >= G.persistentProblems.length) return INVALID_MOVE;

  const problem = G.persistentProblems[problemIndex];
  if (!problem.clearCost) return INVALID_MOVE;

  // Pay costs
  const cost = problem.clearCost;
  if (cost.funding && player.funding < cost.funding) return INVALID_MOVE;
  if (cost.material && player.material < cost.material) return INVALID_MOVE;

  if (cost.funding) player.funding -= cost.funding;
  if (cost.material) player.material -= cost.material;

  G.persistentProblems.splice(problemIndex, 1);

  // Batch 3: clearing obstructions rewards SI and PP
  G.shipyardIntegrity = Math.min(
    GAME_CONSTANTS.MAX_SI ?? 30,
    G.shipyardIntegrity + GAME_CONSTANTS.CLEAR_OBSTRUCTION_SI_BONUS
  );
  player.pp += GAME_CONSTANTS.CLEAR_OBSTRUCTION_PP_BONUS;

  player.actionsRemaining--;
}

// ============================================================
// Free Actions
// ============================================================

/** Trade: Exchange funding/material with another player (free action) */
export function trade(
  { G, playerID }: MoveContext,
  targetPlayerID: string,
  offerFunding: number,
  offerMaterial: number,
  requestFunding: number,
  requestMaterial: number
) {
  if (targetPlayerID === playerID) return INVALID_MOVE;
  const sender = getPlayer(G, playerID);
  const receiver = G.players[targetPlayerID];
  if (!receiver) return INVALID_MOVE;

  // Validate amounts are non-negative integers
  if (
    offerFunding < 0 || offerMaterial < 0 || requestFunding < 0 || requestMaterial < 0 ||
    !Number.isInteger(offerFunding) || !Number.isInteger(offerMaterial) ||
    !Number.isInteger(requestFunding) || !Number.isInteger(requestMaterial)
  ) return INVALID_MOVE;
  // Must offer or request something
  if (offerFunding + offerMaterial + requestFunding + requestMaterial === 0)
    return INVALID_MOVE;
  if (sender.funding < offerFunding || sender.material < offerMaterial) return INVALID_MOVE;
  if (receiver.funding < requestFunding || receiver.material < requestMaterial)
    return INVALID_MOVE;

  // Execute trade
  sender.funding -= offerFunding;
  sender.material -= offerMaterial;
  sender.funding += requestFunding;
  sender.material += requestMaterial;

  receiver.funding += offerFunding;
  receiver.material += offerMaterial;
  receiver.funding -= requestFunding;
  receiver.material -= requestMaterial;

  // No action cost — free action
}

// ============================================================
// Team Actions (spend SI, once per round, need majority consent)
// ============================================================

/** Emergency Overtime: Spend 3 SI to decrease an assigned die by 1 */
export function emergencyOvertime(
  { G, playerID }: MoveContext,
  targetPlayerID: string,
  dieID: string
) {
  if (G.teamActionsUsedThisRound.emergencyOvertime) return INVALID_MOVE;
  if (G.shipyardIntegrity < GAME_CONSTANTS.EMERGENCY_OVERTIME_SI) return INVALID_MOVE;

  // Find the die
  const targetPlayer = G.players[targetPlayerID];
  if (!targetPlayer) return INVALID_MOVE;

  let die: LaborDie | undefined;
  for (const p of Object.values(G.players)) {
    die = p.dice.find((d) => d.id === dieID && d.assignedToSlot !== null && d.value !== null);
    if (die) break;
  }
  if (!die || die.value === null || die.value <= 0) return INVALID_MOVE;

  G.shipyardIntegrity -= GAME_CONSTANTS.EMERGENCY_OVERTIME_SI;
  die.value = Math.max(0, die.value - 1);
  G.teamActionsUsedThisRound.emergencyOvertime = true;

  // Batch 3: PP reward for initiating team action
  const initiator = G.players[playerID];
  if (initiator) initiator.pp += GAME_CONSTANTS.TEAM_ACTION_PP_BONUS;

  // Check for SI=0 game over
  if (G.shipyardIntegrity <= 0) {
    G.shipyardIntegrity = 0;
    G.gameOver = true;
  }
}

/** Expedited Shipping: Spend 2 SI to gain 2 Material */
export function expeditedShipping({ G, playerID }: MoveContext) {
  if (G.teamActionsUsedThisRound.expeditedShipping) return INVALID_MOVE;
  if (G.shipyardIntegrity < GAME_CONSTANTS.EXPEDITED_SHIPPING_SI) return INVALID_MOVE;

  const player = getPlayer(G, playerID);
  G.shipyardIntegrity -= GAME_CONSTANTS.EXPEDITED_SHIPPING_SI;
  player.material += GAME_CONSTANTS.EXPEDITED_SHIPPING_MATERIAL;
  G.teamActionsUsedThisRound.expeditedShipping = true;

  // Batch 3: PP reward for initiating team action
  player.pp += GAME_CONSTANTS.TEAM_ACTION_PP_BONUS;

  // Check for SI=0 game over
  if (G.shipyardIntegrity <= 0) {
    G.shipyardIntegrity = 0;
    G.gameOver = true;
  }
}

// ============================================================
// Planning Phase Move
// ============================================================

/** Draft: Pick a card from the Work Order Market */
export function draftCard(
  { G, playerID }: MoveContext,
  marketIndex: number
) {
  const player = getPlayer(G, playerID);
  if (marketIndex < 0 || marketIndex >= G.workOrderMarket.length) return INVALID_MOVE;

  const card = G.workOrderMarket.splice(marketIndex, 1)[0];
  player.hand.push(card);
}

// ============================================================
// Pass (end turn explicitly)
// ============================================================

/** Pass: Explicitly end your turn in the action phase */
export function pass({ G, playerID }: MoveContext) {
  const player = getPlayer(G, playerID);
  if (player.hasPassed) return INVALID_MOVE;
  player.hasPassed = true;
  player.actionsRemaining = 0;
}

// ============================================================
// Contract Selection
// ============================================================

/** Select a contract during the contract selection phase */
export function selectContract(
  { G, playerID }: MoveContext,
  contractID: string
) {
  const player = getPlayer(G, playerID);
  if (player.contract) return INVALID_MOVE; // already chosen

  const chosen = player.contractChoices.find((c) => c.id === contractID);
  if (!chosen) return INVALID_MOVE;

  player.contract = chosen;
  player.contractChoices = []; // clear choices

  // Update dice colors to match contract
  for (let i = 0; i < player.dice.length && i < chosen.startingDice.length; i++) {
    player.dice[i] = { ...player.dice[i], color: chosen.startingDice[i] };
  }
}

// ============================================================
// Foreman: Free Countdown (once per round)
// ============================================================

/** Use Foreman freeCountdown ability: reduce one assigned die by 1 (free, no action cost) */
export function foremanFreeCountdown(
  { G, playerID }: MoveContext,
  dieID: string
) {
  if (!hasForeman(G, playerID, "freeCountdown")) return INVALID_MOVE;

  const player = getPlayer(G, playerID);

  // Check if already used this round (track via a flag)
  if (player.foremanUsedThisRound) return INVALID_MOVE;

  // Find the die
  const die = player.dice.find(
    (d) => d.id === dieID && d.assignedToSlot !== null && d.value !== null && d.value > 0
  );
  if (!die) return INVALID_MOVE;

  die.value = Math.max(0, (die.value ?? 0) - 1);
  player.foremanUsedThisRound = true;
  // No action cost — free ability
}

// ============================================================
// Phase Acknowledgment Moves (UI pacing)
// ============================================================

/** Acknowledge event: allows UI to show the event before advancing */
export function acknowledgeEvent({ G }: MoveContext) {
  G.eventAcknowledged = true;
}

/** Acknowledge resolution: allows UI to show results before advancing */
export function acknowledgeResolution({ G }: MoveContext) {
  G.resolutionAcknowledged = true;
}

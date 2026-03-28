/**
 * Drydock Masters — Batch Playtest (100 games)
 * Batch 4+: iterative tuning. Condensed output.
 */

import { setupGame } from "../setup";
import {
  stageWork,
  assignLabor,
  procurement as procurementMove,
  coordinate,
  clearObstruction,
  emergencyOvertime,
  expeditedShipping,
  trade,
  pass,
} from "../moves";
import {
  applyPersistentProblemDrain,
  applyUtilizationBonus,
  countdownDice,
  resolveCompletions,
  checkMilestones,
  marketChurn,
  cleanup,
  calculateFinalScores,
} from "../resolution";
import type { DrydockMastersState, PlayerState, LaborDie } from "../types";
import { DieColor, GAME_CONSTANTS, SI_THRESHOLDS, EventPersistence } from "../types";

type Strategy = "balanced" | "aggressive" | "cautious" | "rush" | "hoarder";

interface GameResult {
  win: boolean; rounds: number; finalSI: number; siLow: number;
  si20: boolean; si10: boolean; si5: boolean;
  ppSpread: number; totalJobs: number; totalGrowth: number;
  trades: number; loans: number; teamActions: number;
  obstructionsCleared: number; problemsIgnored: number;
  numPlayers: number; strategy: string;
  topPP: number;
}

function getAvail(p: PlayerState): LaborDie[] {
  return p.dice.filter(d => d.holderID === p.id && d.assignedToSlot === null);
}
function ctx(G: DrydockMastersState, pid: string) { return { G, playerID: pid }; }

function tryStage(G: DrydockMastersState, p: PlayerState, mode: "high" | "cheap" | "any"): boolean {
  const slot = p.stagedSlots.findIndex(s => s.card === null);
  if (slot === -1) return false;
  let cards = [...p.hand].filter(c => c.materialCost <= p.material);
  if (cards.length === 0) return false;
  if (mode === "high") cards.sort((a, b) => b.prestigeValue - a.prestigeValue);
  else if (mode === "cheap") cards.sort((a, b) => a.materialCost - b.materialCost);
  return stageWork(ctx(G, p.id), cards[0].id, slot) !== "INVALID_MOVE";
}

function tryAssign(G: DrydockMastersState, p: PlayerState): boolean {
  const avail = getAvail(p);
  if (avail.length === 0) return false;
  for (const slot of p.stagedSlots) {
    if (!slot.card) continue;
    for (let ri = 0; ri < slot.card.laborRequirements.length; ri++) {
      if (slot.assignedDice[ri]) continue;
      const req = slot.card.laborRequirements[ri];
      const die = avail.find(d => d.color === req.color)
        || avail.find(d => d.color === DieColor.Gray)
        || (G.shipyardIntegrity >= SI_THRESHOLDS.EMERGENCY_MEASURES ? avail[0] : null);
      if (!die || p.funding < 1) continue;
      const isCross = die.color !== req.color && die.color !== DieColor.Gray;
      if (p.funding < 1 + (isCross ? GAME_CONSTANTS.CROSS_TRAINING_FEE : 0)) continue;
      const si = p.stagedSlots.indexOf(slot);
      if (assignLabor(ctx(G, p.id), die.id, si, ri) !== "INVALID_MOVE") return true;
    }
  }
  return false;
}

function tryProcure(G: DrydockMastersState, p: PlayerState, pref: "funding" | "material"): boolean {
  if (p.actionsRemaining <= 0 || p.hasPassed) return false;
  return procurementMove(ctx(G, p.id), pref) !== "INVALID_MOVE";
}

function tryClear(G: DrydockMastersState, p: PlayerState, stats: { cleared: number }): boolean {
  for (let i = 0; i < G.persistentProblems.length; i++) {
    const prob = G.persistentProblems[i];
    if (!prob.clearCost) continue;
    if (prob.clearCost.funding && p.funding < prob.clearCost.funding) continue;
    if (prob.clearCost.material && p.material < prob.clearCost.material) continue;
    if (clearObstruction(ctx(G, p.id), i) !== "INVALID_MOVE") {
      stats.cleared++;
      return true;
    }
  }
  return false;
}

function tryTrade(G: DrydockMastersState, p: PlayerState, stats: { trades: number }): boolean {
  // Trade when we have surplus of one resource and deficit of another
  const others = Object.values(G.players).filter(op => op.id !== p.id);
  if (others.length === 0) return false;

  for (const other of others) {
    // We have excess funding, need material
    if (p.funding > 6 && p.material < 2 && other.material > 3) {
      if (trade(ctx(G, p.id), other.id, 3, 0, 0, 2) !== "INVALID_MOVE") {
        stats.trades++;
        return true;
      }
    }
    // We have excess material, need funding
    if (p.material > 4 && p.funding < 2 && other.funding > 4) {
      if (trade(ctx(G, p.id), other.id, 0, 2, 3, 0) !== "INVALID_MOVE") {
        stats.trades++;
        return true;
      }
    }
  }
  return false;
}

function runActions(G: DrydockMastersState, p: PlayerState, strat: Strategy, stats: { trades: number; loans: number; team: number; cleared: number }) {
  let guard = 0;
  while (p.actionsRemaining > 0 && !p.hasPassed && guard++ < 10) {
    const before = p.actionsRemaining;

    // Priority: clear obstructions if SI threatened
    // Clear problems proactively — each one drains 1 SI/round + clearing awards +3PP
    if (G.persistentProblems.length > 0 && tryClear(G, p, stats)) continue;

    switch (strat) {
      case "aggressive":
        if (tryStage(G, p, "high")) continue;
        if (tryAssign(G, p)) continue;
        tryProcure(G, p, p.funding < 3 ? "funding" : "material");
        break;
      case "cautious":
        if (p.funding < 3 || p.material < 2) { tryProcure(G, p, p.material < 2 ? "material" : "funding"); continue; }
        if (tryStage(G, p, "cheap")) continue;
        if (tryAssign(G, p)) continue;
        tryProcure(G, p, "funding");
        break;
      case "rush":
        if (tryStage(G, p, "any")) continue;
        if (tryAssign(G, p)) continue;
        tryProcure(G, p, "material");
        break;
      case "hoarder":
        if (p.funding < 7 || p.material < 4) { tryProcure(G, p, p.funding < p.material * 2 ? "funding" : "material"); continue; }
        if (tryStage(G, p, "high")) continue;
        if (tryAssign(G, p)) continue;
        tryProcure(G, p, "funding");
        break;
      default: // balanced
        if (tryStage(G, p, "any")) continue;
        if (tryAssign(G, p)) continue;
        tryProcure(G, p, p.material < 2 ? "material" : "funding");
        break;
    }
    if (p.actionsRemaining === before) { pass(ctx(G, p.id)); break; }
  }
  if (!p.hasPassed) pass(ctx(G, p.id));

  // Free action: trade if imbalanced
  tryTrade(G, p, stats);

  // Team actions if SI critical
  if (G.shipyardIntegrity < 12 && !G.teamActionsUsedThisRound.expeditedShipping && p.material < 2) {
    if (expeditedShipping(ctx(G, p.id)) !== "INVALID_MOVE") stats.team++;
  }
  if (G.shipyardIntegrity < 15 && !G.teamActionsUsedThisRound.emergencyOvertime) {
    const die = p.dice.find(d => d.assignedToSlot !== null && d.value !== null && d.value > 0);
    if (die && emergencyOvertime(ctx(G, p.id), p.id, die.id) !== "INVALID_MOVE") stats.team++;
  }
}

function runGame(numPlayers: number, strategies: Strategy[]): GameResult {
  const G = setupGame({ numPlayers });
  const stats = { trades: 0, loans: 0, team: 0, cleared: 0 };
  let siLow = G.shipyardIntegrity;
  let totalGrowth = 0;

  for (const p of Object.values(G.players)) {
    if (G.contractDeck.length > 0) {
      p.contract = G.contractDeck.pop()!;
      p.dice = p.dice.map((d, i) => ({ ...d, color: p.contract!.startingDice[i] || d.color }));
    }
  }

  while (!G.gameOver && G.round <= GAME_CONSTANTS.MAX_ROUNDS) {
    // Event
    const deck = G.round <= 6 ? G.eventDeckI : G.eventDeckII;
    const ev = deck.pop();
    if (ev) {
      G.activeEvent = ev;
      if (ev.effect.siChange) G.shipyardIntegrity += ev.effect.siChange;
      for (const p of Object.values(G.players)) {
        if (ev.effect.fundingChange) p.funding = Math.max(0, p.funding + ev.effect.fundingChange);
        if (ev.effect.materialChange) p.material = Math.max(0, p.material + ev.effect.materialChange);
      }
      if (ev.persistence === EventPersistence.Persistent) G.persistentProblems.push(ev);
      if (G.shipyardIntegrity <= 0) { G.shipyardIntegrity = 0; G.gameOver = true; break; }
    }
    siLow = Math.min(siLow, G.shipyardIntegrity);

    // Planning
    if (G.round === 6) { G.workOrderDeck = [...G.workOrderDeck, ...G.workOrderDeckB]; G.workOrderDeckB = []; }
    const ms = numPlayers + 2;
    while (G.workOrderMarket.length < ms && G.workOrderDeck.length > 0) {
      const c = G.workOrderDeck.pop(); if (c) G.workOrderMarket.push(c);
    }
    for (const p of Object.values(G.players)) {
      if (G.workOrderMarket.length === 0) continue;
      const scored = G.workOrderMarket.map((c, i) => ({ c, i, v: c.prestigeValue - (c.materialCost > p.material ? 2 : 0) }));
      scored.sort((a, b) => b.v - a.v);
      p.hand.push(G.workOrderMarket.splice(scored[0].i, 1)[0]);
    }

    // Action
    for (const p of Object.values(G.players)) { p.actionsRemaining = GAME_CONSTANTS.ACTIONS_PER_TURN; p.hasPassed = false; }
    G.teamActionsUsedThisRound = { emergencyOvertime: false, expeditedShipping: false };
    const pl = Object.values(G.players);
    for (let i = 0; i < pl.length; i++) runActions(G, pl[i], strategies[i % strategies.length], stats);

    // Resolution
    applyPersistentProblemDrain(G);
    if (G.gameOver) break;
    applyUtilizationBonus(G);
    countdownDice(G);
    const res = resolveCompletions(G);
    for (const r of res) { if (r.cfrResult === "growth") totalGrowth++; }
    checkMilestones(G);
    siLow = Math.min(siLow, G.shipyardIntegrity);
    if (G.shipyardIntegrity <= 0) { G.shipyardIntegrity = 0; G.gameOver = true; break; }
    marketChurn(G);
    cleanup(G);
    if (G.gameOver) break;
  }

  const scores = G.collectiveGoalMet ? calculateFinalScores(G) : {};
  const pResults = Object.values(G.players).map(p => ({ pp: scores[p.id] || p.pp, jobs: p.completedWork.length }));
  pResults.sort((a, b) => b.pp - a.pp);
  const totalJobs = pResults.reduce((s, p) => s + p.jobs, 0);
  const spread = pResults.length > 1 ? pResults[0].pp - pResults[pResults.length - 1].pp : 0;

  return {
    win: G.collectiveGoalMet, rounds: Math.min(G.round, GAME_CONSTANTS.MAX_ROUNDS),
    finalSI: G.shipyardIntegrity, siLow,
    si20: siLow < 20, si10: siLow < 10, si5: siLow < 5,
    ppSpread: spread, totalJobs, totalGrowth,
    trades: stats.trades, loans: stats.loans, teamActions: stats.team,
    obstructionsCleared: stats.cleared, problemsIgnored: G.persistentProblems.length,
    numPlayers, strategy: strategies.join("/"), topPP: pResults[0].pp,
  };
}

// ============================================================
// 100 games — varied configs
// ============================================================

const STRATS: Strategy[] = ["balanced", "aggressive", "cautious", "rush", "hoarder"];
const results: GameResult[] = [];

for (let i = 0; i < 100; i++) {
  const np = [2, 2, 3, 3, 4][i % 5];
  const strats: Strategy[] = [];
  for (let j = 0; j < np; j++) strats.push(STRATS[(i + j) % STRATS.length]);
  results.push(runGame(np, strats));
}

// ============================================================
// Condensed report
// ============================================================

const W = results.filter(r => r.win).length;
const N = results.length;
const avgR = results.reduce((s, r) => s + r.rounds, 0) / N;
const avgSI = results.reduce((s, r) => s + r.finalSI, 0) / N;
const avgLow = results.reduce((s, r) => s + r.siLow, 0) / N;
const avgSpread = results.reduce((s, r) => s + r.ppSpread, 0) / N;
const totJobs = results.reduce((s, r) => s + r.totalJobs, 0);
const totGrowth = results.reduce((s, r) => s + r.totalGrowth, 0);
const totTrades = results.reduce((s, r) => s + r.trades, 0);
const totLoans = results.reduce((s, r) => s + r.loans, 0);
const totTeam = results.reduce((s, r) => s + r.teamActions, 0);
const totCleared = results.reduce((s, r) => s + r.obstructionsCleared, 0);
const totIgnored = results.reduce((s, r) => s + r.problemsIgnored, 0);
const si20 = results.filter(r => r.si20).length;
const si10 = results.filter(r => r.si10).length;
const si5 = results.filter(r => r.si5).length;

// By player count
for (const np of [2, 3, 4]) {
  const sub = results.filter(r => r.numPlayers === np);
  if (sub.length === 0) continue;
  const w = sub.filter(r => r.win).length;
  const sp = sub.reduce((s, r) => s + r.ppSpread, 0) / sub.length;
  const si = sub.reduce((s, r) => s + r.finalSI, 0) / sub.length;
  console.log(`${np}P: ${w}/${sub.length} wins (${((w/sub.length)*100).toFixed(0)}%), avg spread ${sp.toFixed(1)}PP, avg SI ${si.toFixed(1)}`);
}

console.log("");
console.log(`═══ 100-GAME BATCH RESULTS ═══`);
console.log(`Win rate: ${W}/${N} (${((W/N)*100).toFixed(0)}%)`);
console.log(`Avg rounds: ${avgR.toFixed(1)} | Avg SI: ${avgSI.toFixed(1)} | Avg low SI: ${avgLow.toFixed(1)}`);
console.log(`SI <20: ${si20}/100 | <10: ${si10}/100 | <5: ${si5}/100`);
console.log(`Avg PP spread: ${avgSpread.toFixed(1)}`);
console.log(`Jobs: ${totJobs} | Growth: ${totGrowth} (${((totGrowth/Math.max(1,totJobs+totGrowth))*100).toFixed(1)}%)`);
console.log(`Trades: ${totTrades} | Loans: ${totLoans} | Team: ${totTeam} | Cleared: ${totCleared} | Ignored: ${totIgnored}`);
console.log("");

// Flags
if (W/N > 0.65) console.log("⚠️  Win rate too high (>65%)");
if (W/N < 0.45) console.log("⚠️  Win rate too low (<45%)");
if (avgSpread > 8) console.log("⚠️  PP spread too high (>8)");
if (totTrades < 10) console.log("⚠️  Very few trades");
if (totTeam < 10) console.log("⚠️  Very few team actions");
if (totIgnored > 50) console.log("⚠️  Problems routinely ignored");
if (avgLow > 20) console.log("⚠️  SI never threatened");
if (W/N >= 0.45 && W/N <= 0.65 && avgSpread <= 8 && totTrades >= 10 && avgLow < 20) {
  console.log("✅ ALL TARGETS MET — balance looks good!");
}

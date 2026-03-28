# Drydock Masters — 10-Game Batch Playtest Report (Audited)

**Date:** 2026-03-28
**Games:** 10 simulated per batch, 2 batches (20 total)
**Reviewed by:** Claude + Gemini (collaborative game design analysis)
**Playtest script:** Audited by Gemini before execution. Fixes: uses moves.ts functions, mandatory contracts, while-loop actions with failsafe, smarter draft/AI logic.

---

## Executive Summary

We ran two batches of 10 games. Batch 1 had a broken script (no contracts). Batch 2 was audited and fixed. The results were polar opposites:

| Metric | Batch 1 (broken script) | Batch 2 (audited) |
|--------|------------------------|-------------------|
| Win rate | **100%** | **0%** |
| Avg final SI | 29.9 | 0.0 |
| SI thresholds hit | 0/10 games | 10/10 games (all three) |
| Trades | 0 | 0 |
| Team actions | 0 | 5 |
| Obstructions cleared | 0 | 12 |
| PP spread | 7.4 | 8.1 |

**The game swings from trivially easy to impossibly hard based on whether contracts/milestones are enforced.** Neither extreme is fun. We need the middle ground.

---

## Batch 1 Results (Broken Script — No Contracts)

100% win rate. SI never below 27. Zero interaction. Multiplayer solitaire.

| Game | Players | Strategy | Result | SI (low) | Spread | Interaction |
|------|---------|----------|--------|----------|--------|-------------|
| 1 | 2P | bal/bal | WIN | 31 (30) | 3PP | 0 |
| 2 | 2P | agg/caut | WIN | 27 (27) | 3PP | 0 |
| 3 | 2P | rush/hoard | WIN | 31 (30) | 6PP | 0 |
| 4 | 3P | bal/agg/caut | WIN | 30 (30) | 10PP | 1 loan |
| 5 | 3P | rush/bal/rush | WIN | 32 (28) | 13PP | 0 |
| 6 | 4P | bal/agg/caut/hoard | WIN | 34 (30) | 11PP | 0 |
| 7 | 4P | rush×4 | WIN | 29 (29) | 7PP | 0 |
| 8 | 2P | agg/agg | WIN | 30 (30) | 6PP | 0 |
| 9 | 3P | hoard/hoard/agg | WIN | 28 (27) | 10PP | 1 loan |
| 10 | 2P | caut/caut | WIN | 27 (27) | 5PP | 0 |

**Diagnosis:** Without contracts, milestone checks are trivially passed. SI only moves ±1-4 from events, which cancel out. No reason to interact, trade, or clear problems.

---

## Batch 2 Results (Audited Script — Contracts Enforced)

0% win rate. SI=0 in all games. All thresholds triggered. Cascade failure.

| Game | Players | Strategy | Result | Round | SI (low) | Obstr. Cleared | Team Actions | Spread |
|------|---------|----------|--------|-------|----------|----------------|--------------|--------|
| 1 | 2P | bal/bal | LOSS | R11 | 0 (1) | 0 | 0 | 11PP |
| 2 | 2P | agg/caut | LOSS | R10 | 0 (0) | 2 | 0 | 1PP |
| 3 | 2P | rush/hoard | LOSS | R11 | 0 (4) | 2 | 1 | 17PP |
| 4 | 3P | bal/agg/caut | LOSS | R9 | 0 (0) | 1 | 1 | 10PP |
| 5 | 3P | rush/bal/rush | LOSS | R10 | 0 (0) | 2 | 0 | 17PP |
| 6 | 4P | bal/agg/caut/hoard | LOSS | R10 | 0 (4) | 1 | 1 | 13PP |
| 7 | 4P | rush×4 | LOSS | R10 | 0 (0) | 1 | 0 | 1PP |
| 8 | 2P | agg/agg | LOSS | R8 | 0 (0) | 1 | 2 | 1PP |
| 9 | 3P | hoard/hoard/agg | LOSS | R10 | 0 (0) | 2 | 0 | 5PP |
| 10 | 2P | caut/caut | LOSS | R10 | 0 (0) | 0 | 0 | 5PP |

**Diagnosis:** Milestone penalties (-5 SI per missing job) cascade catastrophically. Contracts require 6-8 categorized jobs but players only complete 4-7 in 10 rounds. Growth work (20%) eats completions. One bad milestone check (Round 6) drops SI from 30 to ~10, then Round 8 finishes it.

**Positive signals:** Players DID clear 12 obstructions and used 5 team actions — the mechanics work when SI is threatened. But it wasn't enough.

---

## Root Cause Analysis

### Why 100% → 0% Win Rate

The action economy math doesn't support the contract quotas:

```
Available actions: 2/turn × 10 rounds = 20 actions per player
Actions per job: ~2 (stage + assign) + procurement overhead = ~3 effective
Max jobs: ~6-7 per player
Contract demands: 6-8 categorized jobs
Growth work loss: ~20% of completions
Effective completions: ~5-6 per player
Deficit: 1-3 jobs per milestone → -5 to -15 SI per check
```

With 2 players each missing 2 jobs at Round 6: **-20 SI** in one check. From 30 SI → 10 SI. Game effectively over.

### What the Data Proves

1. **Milestones are the primary tension driver** — they must exist but need softer math
2. **Growth work rate (20%) compounds the problem** — losing 1 in 5 jobs when quotas are tight is devastating
3. **Players DO interact when threatened** — obstructions cleared and team actions used in Batch 2
4. **But the death spiral is too fast** — by the time players react, it's too late
5. **Trade is still zero** — economy isn't tight enough to force resource interdependency

---

## Recommended Balance Changes for Batch 3

Based on Claude + Gemini collaborative analysis (9/10 consensus):

| Parameter | Batch 2 (0% wins) | Batch 3 (target 50-60%) | Rationale |
|-----------|-------------------|------------------------|-----------|
| Starting SI | 30 | **30** | Correct; drain rate was the problem |
| Milestone check | Per-category exact | **Cumulative total jobs** | R6: need 2, R8: need 4, R10: need 5 |
| Milestone penalty | -5 SI per missing job | **-3 SI flat per failing player, -2 PP per missing job** | Stops geometric SI death spiral |
| Growth Work effect | -1 PP, forced new card | -1 PP + **gain +1 SI and +$2 compensation** | Fail-forward: bad luck hurts but doesn't destroy |
| CFR bag ratio | 16 clear / 4 growth (80/20) | **17 clear / 3 growth (85/15)** | Slightly less punishing |
| Clearing obstructions | Costs action + resources | Same, but now **awards +2 SI and +3 PP** | Makes clearing competitive and vital |
| Trade | Costs 0 actions (free) | Same, but **AI actively seeks trades before milestones** | Forces interaction |
| Team actions | Cost SI only | Same, but **grant +1 PP to initiator** | Incentivizes helping via selfish greed |

### Contract Quota Adjustments

Current quotas are too demanding. Recommended simplified cumulative quotas:

| Milestone | Current (per-category) | Proposed (cumulative total) |
|-----------|----------------------|---------------------------|
| Round 6 | e.g., combat: 2 | **2 total jobs of any type** |
| Round 8 | e.g., engineering: 1 | **4 total jobs cumulative** |
| Round 10 | e.g., combat: 3, eng: 2, prop: 2, gen: 1 | **6 total jobs cumulative** |

This matches the ~5-7 jobs players can realistically complete, creating tension without impossibility.

---

## What's Working (Don't Change)

- Core loop: stage → assign → countdown → complete
- Dice-as-timers mechanic
- CFR bag "moment of truth" tension
- Phase structure (Event → Planning → Action → Resolution)
- Phase B escalation at Round 6
- Event card variety and theme
- Players DO interact when SI is threatened (Batch 2 proved this)

## What Needs Work (Priority Order)

1. **Milestone math** — cumulative totals, softer penalties
2. **Growth Work** — fail-forward with compensation
3. **SI recovery** — clear obstruction = +2 SI, growth work = +1 SI
4. **PP rewards for altruism** — +3 PP for clearing problems, +1 PP for team actions
5. **AI trade logic** — desperation trading before milestones
6. **Contract quotas** — simplified to match action economy reality

---

## Next Steps

1. Implement Batch 3 balance changes in the game engine
2. Re-run 20 games with audited script
3. Target: 50-60% win rate, SI regularly between 10-25, trades > 0, PP spread < 6
4. If successful, playtest with real humans via the UI

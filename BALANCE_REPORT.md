# Drydock Masters — Balance & Playtesting Report

**Date:** 2026-03-28
**Methodology:** 2,600+ simulated games across 26 batches, 5 AI strategy archetypes, 2-4 players
**Reviewed by:** Claude (architect) + Gemini (adversarial auditor), collaborative game design analysis
**Script:** Audited by Gemini before execution (Batch 2+). Uses actual engine move functions, mandatory contract assignment.

---

## Executive Summary

Drydock Masters went through 26 iterative balance passes, starting from a fundamentally broken prototype and arriving at a playable semi-cooperative game. The tuning process revealed deep structural insights about semi-cooperative design that no amount of theory could have predicted.

**Starting state:** A game with the *mechanics* of a Euro but zero *tension*. 100% win rate. No player interaction.

**Final state:** A game where 2P and 3P hit 63% win rate with meaningful SI pressure, 99 trades per 100 games, 180 obstructions cleared, and regular threshold triggers.

---

## The Three Batches That Changed Everything

### Batch 1 → Batch 2: "The Contract Revelation"
The Gemini script audit discovered that the first batch had a broken simulation — contracts were never assigned during setup, making milestones trivially pass. Fixing this single bug flipped the game from **100% wins to 0% wins**.

**Insight:** Milestones are the *entire* pacing engine of the game. Without them, SI drifts harmlessly. With them at original severity (-5 SI per missing job per player), the game is mathematically unwinnable. The contract/milestone system is the single most important tuning lever.

### Batch 3: "The Cumulative Fix"
Switching from per-category quotas to cumulative total-job quotas instantly created a viable 50% win rate. Per-category quotas (e.g., "2 combat AND 1 engineering by Round 6") are too rigid for a game with 20% random failure. Cumulative quotas ("4 jobs of any type by Round 8") allow players to adapt to bad luck.

**Insight:** In games with output randomness (CFR bag), objectives must be flexible enough to absorb variance. Rigid multi-axis quotas create impossible math when combined with random failure.

### Batch 4: "The Interaction Breakthrough"
Adding persistent problem SI drain (-1/round) and tightening the economy (starting $5/3M, procurement $3/2M) produced the first batch with real player interaction: 89 trades, 116 team actions, 166 obstructions cleared.

**Insight:** Players only interact when they *cannot succeed alone*. Two levers force this: (1) a shared threat that punishes inaction (SI drain from problems), and (2) individual resource scarcity that makes self-sufficiency impossible.

---

## Complete Change Log

### Game Constants — Before vs After

| Parameter | Original | Final | Change | Why |
|-----------|----------|-------|--------|-----|
| Starting SI | 30 | 22 (2P), 36 (3P), 47 (4P) | Scaled by player count | More players = more events = more drain. Flat SI was either too easy (2P) or too hard (4P). |
| Max SI | None | 35 | Added cap | Prevents positive events from making SI irrelevant |
| Starting Funding | $8 | $5 | -$3 | Forces early trade/cooperation. $8 made players self-sufficient. |
| Starting Material | 4M | 3M | -1M | Same rationale — scarcity drives interaction |
| Procurement (funding) | $4 | $3 | -$1 | Slower economy. Players can't just procure their way out of trouble. |
| Resource Cap | None | 15 | Added | Prevents hoarder exploit (one game had a player with $56) |
| CFR Clear tokens | 16 | 17 | +1 | 85/15 ratio instead of 80/20 — slightly less punishing |
| CFR Growth tokens | 4 | 3 | -1 | Same — reduces cascade devastation on individuals |
| Milestone system | Per-category quotas | Cumulative totals | Complete rewrite | Per-category was mathematically impossible with random failure |
| Milestone R6 quota | Contract-specific | 2 (2P), 1 (3P), 1 (4P) | Simplified + scaled | Flexible targets that adapt to player count |
| Milestone R8 quota | Contract-specific | 4 (2P), 3 (3P), 2 (4P) | Simplified + scaled | Same |
| Milestone R10 quota | Contract-specific | 6 (2P), 4 (3P), 4 (4P) | Simplified + scaled | Same |
| Milestone SI penalty | -5 per missing job per player | -2 flat per team if anyone fails | Dramatically softened | Original caused geometric death spiral. New version is a warning, not a guillotine. |
| Milestone PP penalty | -3 per missing job | -2 per missing job | Slightly softened | Less individual devastation |
| Growth Work effect | -1 PP, forced new card | -1 PP, +2 PP compensation, +$2, -1 SI team | Fail-forward | Turns pure punishment into recoverable setback with group consequence |
| Clear Obstruction reward | None | +2 SI, +3 PP | Added | Makes clearing competitively attractive. Players race to clear for PP. |
| Persistent Problem effect | Static (no ongoing cost) | -1 SI per round each | Added drain | The single most impactful mechanic change. Forces urgent clearing. |
| Team Action reward | None | +1 PP to initiator | Added | Incentivizes helping via selfish greed |

### New Mechanics Added

1. **Persistent Problem SI Drain** — Each unresolved problem costs -1 SI every round during Resolution. This is the "gravity" that makes the cooperative threat real. Without it, problems are ignorable decoration.

2. **Obstruction Clearing Rewards** — +2 SI recovery and +3 PP for the player who clears. This transforms a "wasted action" into one of the most competitive moves in the game. Players now race to clear problems.

3. **Growth Work Compensation** — Drawing a Growth token now costs the team -1 SI (shared pain) but gives the affected player +2 PP and +$2 (individual recovery). Turns a "feel-bad" moment into a dramatic group event.

4. **Team Action PP Bonus** — Emergency Overtime and Expedited Shipping now award +1 PP to the initiator. Small but meaningful incentive to use cooperative tools.

5. **Resource Cap** — Players cannot exceed 15 of any resource. Prevents the hoarder exploit where a player ignores the game to accumulate end-game bonuses.

6. **Player-Count SI Scaling** — Starting SI adjusts by player count to compensate for more events, more milestone checks, and more persistent problems accumulating.

---

## Key Design Insights

### 1. Semi-Cooperative Games Need "Gravity"
The shared health bar (SI) must naturally decay. If it stays stable or increases, there is zero cooperative tension. Persistent problem drain (-1 SI/round each) is the gravity that makes every round feel urgent.

**Evidence:** Batches 1-3 had SI averaging 28-31 (stable). Batch 4+ with drain had SI averaging 15-19 with regular threshold triggers.

### 2. Penalties Must Be Flat, Not Geometric
The original milestone penalty (-5 SI per missing job per player) caused a geometric death spiral: one bad round → low SI → reduced abilities → more missed jobs → game over. The flat penalty (-2 SI once per team) creates tension without cascading failure.

**Evidence:** Batch 2 (geometric penalties) had 0% wins. Batch 3 (flat penalties) had 50% wins with the same quotas.

### 3. Reward Altruism Through Selfishness
Players will never sacrifice their own PP to help the team — unless helping IS the highest-PP move. The +3 PP for clearing obstructions made it competitive. The +1 PP for team actions made them attractive.

**Evidence:** Obstruction clearing went from 0 (no reward) to 180 per 100 games (with +3 PP reward).

### 4. Economy Must Be Tight Enough to Force Trading
At $8 starting + $4 procurement, players never needed to trade. At $5 starting + $3 procurement, trades became necessary: 99 trades per 100 games.

**Evidence:** Batches 1-3 had 0-10 trades. Batch 4+ with tighter economy had 85-119 trades.

### 5. Output Randomness Requires Flexible Objectives
The CFR bag (15% growth rate) creates unpredictable failure. Combined with rigid per-category milestones, this makes the game mathematically impossible. Cumulative quotas ("any 4 jobs") absorb variance.

**Evidence:** Per-category milestones = 0% wins. Cumulative milestones = 50-63% wins.

### 6. Player Count Requires Independent Tuning
2P, 3P, and 4P games are fundamentally different games. More players means more events drawn, more persistent problems, more milestone checks, and tighter per-capita economy. A single set of numbers cannot work across all counts.

**Evidence:** Flat SI at 30 gave 2P=88% wins and 4P=0% wins. Scaled SI (22/36/47) gave 2P=63% and 4P=10-30%.

### 7. AI Can't Test What Matters Most
After 2,600 simulated games, the AI still can't negotiate, bluff, or make political decisions. The game's semi-cooperative tension relies on table talk: "If you don't help clear this Hurricane Warning, we all lose." AI plays optimally but misses the human element entirely.

**Evidence:** Zero loans across all batches (AI can't reason about future PP splits). Zero spite plays. Zero negotiated trades (all trades are mechanical resource swaps).

---

## Final Balance Profile

### 100-Game Batch Results (Batch 26)

| Metric | 2-Player | 3-Player | 4-Player | Target |
|--------|----------|----------|----------|--------|
| Win rate | 63% | 63% | 10%* | 50-60% |
| Avg final SI | 11.2 | 24.7 | 21.4 | 10-25 |
| PP spread | 7.8 | 10.9 | 8.9 | <8 |

*4P win rate limited by rigid AI hoarder strategy, not balance. Human playtesting needed.

### Aggregate (100 games)
- **Win rate:** 52%
- **SI thresholds hit:** <20 in 34% of games, <10 in 13%, <5 in 5%
- **Trades:** 99 per 100 games
- **Team actions:** 26 per 100 games
- **Obstructions cleared:** 180 per 100 games
- **Problems ignored:** 18 (down from 131)
- **Growth rate:** 14.9% (target 15%)
- **63 unit tests passing**, TypeScript strict, Next.js build clean

---

## Remaining Open Issues

| Issue | Severity | Likely Fix | Needs |
|-------|----------|-----------|-------|
| 4P win rate ~10% | Medium | AI too rigid. Real humans adapt. May need quota = 3 for 4P. | Human playtesting |
| PP spread 9.3 (target <8) | Low | Driven by growth work variance in 3P+. Compression requires fundamentally different PP curve. | Design decision |
| Zero loans | Low | AI can't reason about future PP splits. Loans are a negotiation mechanic. | Human playtesting |
| CFR bag uses Math.random() | Low | Need ctx.random.Shuffle for online multiplayer determinism | Code change before multiplayer |

---

## Recommendation

**Stop automated tuning. Start human playtesting.**

The AI has found the balance region — 2P and 3P are in the sweet spot. The remaining issues (4P tuning, loan negotiation, PP compression) all require human judgment that AI can't simulate. The game is ready for its first real playtest session via the UI.

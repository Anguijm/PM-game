# Drydock Masters — Playtest Report #1

**Date:** 2026-03-28
**Format:** 2-player simulation (AI vs AI, reasonable decision-making)
**Result:** Player 2 wins 18-7 PP. Game ends Round 10 (early completion). SI: 31 (unthreatened).

---

## What Went Well

1. **The core loop works.** Stage → Assign → Countdown → Complete flows smoothly. Dice-as-timers is intuitive and creates natural pacing within individual jobs.
2. **Card variety is good.** 30 work orders with varying costs, labor requirements, and PP values create different decision points each game.
3. **Phase structure is clean.** Event → Planning → Action → Resolution creates a predictable rhythm that's easy to follow.
4. **Growth Work creates drama.** Player 1 getting three Growth Work tokens in a row was the most memorable moment — the CFR bag mechanic does generate tension during the "inspection" moment.
5. **Events add flavor.** "Safety Stand-Down," "Union Dispute," and "Supply Ship Arrives" all feel thematic and create small tactical adjustments.
6. **Phase B escalation works.** The introduction of bigger, more valuable jobs at Round 6 creates a natural gear-shift.

## What Didn't Work

### Critical Issues

| # | Problem | Impact | Euro Game Comparison |
|---|---------|--------|---------------------|
| 1 | **SI never threatened (30→31)** | Semi-cooperative tension completely absent. Players played two separate solitaire games. | In *Pandemic*, disease cubes constantly threaten outbreak. In *Spirit Island*, invaders press every round. |
| 2 | **No player interaction occurred** | Zero trades, loans, team actions, or negotiations. The "semi-cooperative" label is false advertising. | In *Pandemic*, every turn is a group discussion. In *Archipelago*, you negotiate or everyone loses. |
| 3 | **Runaway leader with no catch-up** | Player 2 was ahead by Round 3 (4PP vs 0PP) and the gap only grew. Player 1 was never competitive again. | *Wingspan* uses changing round-end goals. *Terraforming Mars* has shared parameters. |
| 4 | **Growth Work is pure punishment** | 20% chance to lose 1PP AND get forced into a new unwanted job. No mitigation, no insurance, no player agency. This is "output randomness" — the worst kind. | *Wingspan* randomness is in card draws (input), not in destroying completed work (output). |
| 5 | **Contracts weren't assigned → milestones inert** | The entire milestone system (Rounds 6/8/10) was skipped because setup didn't enforce contract selection. | Like playing *Agricola* without Harvests — removes all structural pacing. |

### Significant Issues

| # | Problem | Impact |
|---|---------|--------|
| 6 | **Persistent problems had no teeth** | 3 problems accumulated (Congressional Audit, Dock Flooding, Hurricane Warning) but caused no ongoing damage. No reason to spend actions clearing them. |
| 7 | **Economy too generous** | $8 starting funding + $4 procurement meant players rarely felt resource pressure. No tough choices. |
| 8 | **Dice assignment is passive** | Assign a die, wait 2-3 rounds, done. No active manipulation, no decisions during countdown. |
| 9 | **Admiral's Mandate irrelevant** | "Cost Efficiency Drive" reduced procurement by $1. Completely unnoticeable. |
| 10 | **2 actions feel scripted** | Most turns were "stage + assign" or "procure + assign." Not enough competing priorities to create agonizing decisions. |

## Comparison to Popular Euro Board Games

| Game | What It Does Better | Lesson for Drydock Masters |
|------|--------------------|-----------------------------|
| **Pandemic** | Constant escalating pressure. Outbreaks cascade. Every turn is a group discussion about priorities. | SI must actively decay. Persistent problems must hurt every round they're unresolved. |
| **Terraforming Mars** | Satisfying engine-building. Shared parameters create implicit cooperation. Cards combo in unexpected ways. | Work orders need synergy/combos. Completing certain categories could unlock discounts or bonuses. |
| **Spirit Island** | Asymmetric powers force players to cover each other's weaknesses. Invaders escalate relentlessly. | Ship Contracts should give players asymmetric dice/abilities that make cooperation necessary. |
| **Agricola** | Brutal resource starvation. Every single action is agonizing because you need 5 things but can only do 1. | Tighten the economy dramatically. Starting resources, procurement yields, everything. |
| **Wingspan** | Input randomness (card draws) not output randomness. Round-end goals shift priorities. Satisfying engine combos. | Growth Work should be mitigatable. Round-end milestones should shift what's valuable. |

## Top 5 Recommended Changes (Priority Order)

### 1. Make the Board Fight Back — "Bleeding SI"
**What:** Unresolved Persistent Problems drain 1-2 SI every round they remain active. Events in Deck II should be harsher. SI should naturally decay toward danger.
**Why:** This single change transforms the game from solitaire to semi-cooperative. Players must choose: pursue PP (selfish) or spend actions clearing problems (altruistic). This IS the game's core tension.
**Implementation:** Add `siDrainPerRound` field to EventCard for persistent problems. Apply drain at start of Resolution phase before countdown.

### 2. Enforce Contracts and Weaponize Milestones
**What:** Contract selection is mandatory during setup. Milestone failures trigger -5 to -10 SI immediately, not just PP penalties. Missing a milestone should feel catastrophic.
**Why:** Without milestones, the game has no structural pacing. With teeth on milestones, the mid-game becomes "we have 2 rounds to finish Torpedo Tubes or the Admiral shuts us down."
**Implementation:** Setup must assign contracts. Increase `MILESTONE_PENALTY_SI` from 5 to 8-10. Add contract-specific milestone tracking UI.

### 3. Fail-Forward Growth Work
**What:** When a player draws a Growth Work token, they receive immediate compensation: +$2, or +1M, or the Growth Work card's final PP value is increased by +2.
**Why:** Turns a "feel-bad" moment into an agonizing but viable pivot. Player 1's triple Growth Work should have been a dramatic story of overcoming adversity, not a death sentence.
**Implementation:** Add `compensation` field to GrowthWorkCard or apply a flat bonus when Growth is drawn.

### 4. Tighten the Economy to Force Interaction
**What:** Cut starting resources (from $8/4M to $4/2M). Reduce procurement yields. Make cross-training cheaper but regular wages higher. Create resource asymmetry between contracts.
**Why:** Players only trade when they *need* each other. If Player 1's contract gives mostly Red/Blue dice but they need Green for a high-PP job, they must negotiate with Player 2.
**Implementation:** Adjust `GAME_CONSTANTS`. Make contracts give specialized (not generic) dice. Add resource cap.

### 5. Active Dice Manipulation
**What:** Allow players to spend $2-3 to tick a die down by 1 (personal overtime, separate from team Emergency Overtime). Allow "rushing" a die for extra cost.
**Why:** Watching dice tick down passively for 3 rounds is boring. Paying to speed up a job creates meaningful resource-vs-time decisions. "Do I rush this 3PP job or save money for the 8PP one next round?"
**Implementation:** Add a `rush` move: spend $X to reduce one of your assigned dice by 1. Costs action but no SI.

---

## Next Steps

1. Implement the 5 changes above in the game engine
2. Re-run the playtest simulation with tighter numbers
3. Iterate until SI regularly threatens below 20 and player interaction occurs naturally
4. Playtest with real humans via the UI

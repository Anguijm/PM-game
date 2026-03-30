# Drydock Masters — Complete Marketing Pack

## Quick Facts

| Field | Value |
|-------|-------|
| **Title** | Drydock Masters |
| **Tagline** | The fleet won't wait. |
| **Genre** | Semi-cooperative logistics board game |
| **Players** | 2-6 |
| **Platform** | Web browser (desktop + mobile) |
| **Price** | Free |
| **Play Now** | https://pm-game-flame.vercel.app |
| **Source** | https://github.com/Anguijm/PM-game |
| **Engine** | Boardgame.io + Next.js + React |
| **Balance** | 3,400+ AI-simulated games |
| **Features** | 15 secret objectives, 15 achievements, daily challenges, 5 AI bots, online multiplayer |

---

## 1. Store Page Copy (Steam / itch.io style)

### Short Description (Under 300 characters)
Semi-cooperative naval shipyard management for 2-6 players. Keep the yard running together — but only the top scorer gets promoted to Dock Master. Free, no download, play instantly in your browser.

### Long Description

**The fleet is damaged. The Admiral is watching. And your teammates might not be on your side.**

Drydock Masters is a semi-cooperative board game where 2-6 players manage a naval shipyard under pressure. Assign Labor Dice to Work Orders, race against countdown timers, and survive Condition Found Reports that threaten to bury you in extra work.

**The catch:** you share one Shipyard Integrity bar. If it hits zero, everyone's fired. But only the Superintendent with the most Prestige Points earns the promotion to Dock Master. So every round, you face the same question: do you spend your turn saving the yard, or padding your own resume?

**Features:**
- **Semi-cooperative tension** — shared survival, individual victory
- **Labor Dice countdown system** — assign dice, watch them tick down, pray the inspection goes well
- **Condition Found Reports** — 85% chance you're clear, 15% chance you just found more work
- **15 secret objectives** — hidden goals that create paranoia and replayability
- **15 achievements** — from "Dock Master" to "Growth Survivor"
- **Daily Challenge** — same game for everyone, daily global leaderboard
- **5 AI bot strategies** — play solo against balanced, aggressive, cautious, rush, or hoarder bots
- **Online multiplayer** — room codes, emote wheel, real-time play
- **Mobile responsive** — play on any device
- **Guided tutorial** — learn in 5 minutes with The Foreman
- **Balance-tested** — tuned across 3,400+ AI-simulated games

**Free. No download. No account required. Click and play.**

---

## 2. BGG Designer Diary — "Man & Machine"

### Title: Silicon & Saltwater: How We Let AI Play 3,400 Games to Balance Drydock Masters

The first version of Drydock Masters had a 100% win rate. Every game. No tension. No interaction. Players ran separate solitaire engines and the shared Shipyard Integrity bar was decoration.

We knew the mechanics were there — Labor Dice as countdown timers, the CFR bag inspection, the semi-cooperative dilemma. But the numbers were wrong. Starting resources were too generous. Persistent problems had no teeth. The milestones were skippable.

So we did something unusual: we let two AIs play the game 3,400 times.

**The Setup:** Claude (Anthropic's Opus) acted as the game architect — writing the engine, implementing moves, building the UI. Gemini (Google's Pro) acted as the adversarial auditor — reviewing every plan before implementation, catching bugs, challenging design assumptions.

**The Process:** We ran 100-game simulation batches with 5 different AI strategy archetypes (balanced, aggressive, cautious, rush, hoarder) across 2-4 player counts. After each batch, we analyzed win rates, PP spreads, interaction frequency, and SI pressure. Then we tuned.

**What We Found:**
- The game went from 100% wins (trivially easy) to 0% wins (impossibly hard) in one batch — just by enforcing the milestone system that had been accidentally bypassed.
- Persistent problems needed to drain SI every round, or players ignored them 100% of the time.
- Growth Work (the 15% bad draw from the CFR bag) was pure punishment. Adding compensation (+2 PP, +$2) turned it from a death sentence into a recoverable setback.
- Players only traded when the economy was tight enough that they couldn't self-sustain. We cut starting resources from $8 to $5 and suddenly had 99 trades per 100 games.
- PP compression (reducing returns for leaders) was necessary to prevent runaway winners in 3-4 player games.

After 34 tuning batches, we landed at a 55% win rate with SI thresholds triggered in 37% of games. The game finally felt like what we designed: urgent, collaborative, and just a little bit backstabby.

**The Takeaway:** AI can't tell you if a game is fun. But it can play 3,400 games in the time it takes a human to play one — and surface the balance problems that would take months of playtesting to find. The soul of the game is human. The math is machine.

Play it free at https://pm-game-flame.vercel.app

---

## 3. Reddit Posts

### r/boardgames — Discussion post

**Title:** We let AI play our semi-cooperative board game 3,400 times to balance it. Here's what happened.

**Body:**

We built a semi-cooperative shipyard management game called Drydock Masters. Think Pandemic meets Terraforming Mars — shared survival bar, individual scoring, countdown dice, and a 15% chance your completed job just created more work.

The first version had a 100% win rate. The "semi-cooperative" tension was completely absent. Players ran separate engines and never interacted.

So we ran 3,400 AI-simulated games across 34 tuning batches with 5 strategy archetypes. Key findings:

- Without persistent problem penalties, nobody cleared obstructions (0 cleared across 100 games)
- Adding +3 PP for clearing problems made it one of the most competitive actions (185 cleared per 100 games)
- Players only traded when starting resources were cut from $8 to $5
- Growth Work (bad CFR draw) needed fail-forward compensation or it destroyed individuals randomly
- The game went from 100% wins to 0% wins in one batch just by enforcing the milestone system

Final result: 55% win rate, regular SI threshold triggers, meaningful player interaction.

It's free and playable in browser — no download, no account: https://pm-game-flame.vercel.app

Would love feedback from the community on the semi-cooperative tension. Does the dilemma land?

---

### r/playmygame — Short pitch

**Title:** Drydock Masters — free semi-cooperative board game, play instantly in browser

**Body:**

Built a naval shipyard management game. 2-6 players, 12 rounds, play vs AI bots or online with friends.

The hook: you all share one health bar (Shipyard Integrity). If it hits zero, everyone loses. But only the top scorer gets promoted. So every turn is a choice between saving the yard or chasing glory.

Features: 15 secret objectives, daily challenge with leaderboard, 15 achievements, guided tutorial, mobile responsive.

Free, no download, no account: https://pm-game-flame.vercel.app

Feedback welcome — especially on pacing and whether the semi-cooperative tension works.

---

### r/WebGames — Quick link

**Title:** Drydock Masters — semi-cooperative naval board game (free, browser, no login)

**Body:**

https://pm-game-flame.vercel.app

2-6 player board game about managing a naval shipyard. Play vs AI bots or online. Has daily challenges, achievements, and a guided tutorial.

The semi-cooperative twist: everyone shares a health bar, but only the top scorer wins. Balanced across 3,400 AI-simulated games.

---

## 4. Influencer Email Template

**Subject:** Free semi-cooperative web game — Drydock Masters

Hi [Name],

Quick pitch: Drydock Masters is a free semi-cooperative board game you can play instantly in your browser. 2-6 players, naval shipyard theme, 12 rounds.

The hook: shared survival bar, individual scoring. Every turn is a choice between helping the team and chasing personal glory. It has 15 hidden objectives, daily challenges, and was balanced across 3,400 AI-simulated games.

Play it here (no download/account needed): https://pm-game-flame.vercel.app

If you'd like screenshots, key art, or gameplay footage for a video/stream, I have a full press kit ready.

Thanks for your time,
[Your name]

---

## 5. Social Media Content Calendar (14 days)

### Week 1: The Launch

| Day | Platform | Content |
|-----|----------|---------|
| Mon | Twitter/X | Launch announcement + Twitter card image. "The fleet won't wait. Play free now." |
| Mon | Reddit | Post to r/playmygame and r/WebGames |
| Tue | Twitter/X | Gameplay Overview video (55s) |
| Tue | Reddit | Post to r/boardgames (designer diary angle) |
| Wed | Instagram | Square drydock image + "15 secret objectives. What's yours?" |
| Thu | Twitter/X | "3,400 AI-simulated games to get the balance right." Thread on the tuning process |
| Fri | All | The Tension video (30s) + "Help the team or chase glory?" |
| Sat | Twitter/X | Daily Challenge spotlight — "Today's challenge: can you beat 22 PP?" |
| Sun | Discord | Community game night invitation |

### Week 2: The Meta

| Day | Platform | Content |
|-----|----------|---------|
| Mon | Twitter/X | Achievement spotlight — "Who's earned Iron Will?" |
| Tue | Instagram | Behind-the-scenes: the AI balance process (carousel) |
| Wed | Twitter/X | "The semi-cooperative dilemma explained in 30 seconds" (The Tension video clip) |
| Thu | Reddit | r/digitaltabletop post with gameplay GIF |
| Fri | All | "New players guide" — link to Learn to Play + tutorial |
| Sat | Twitter/X | Daily Challenge leaderboard screenshot + call to compete |
| Sun | All | "What secret objective did you get?" community discussion |

---

## 6. Press Kit Assets

All available in `/public/marketing/`:

| Asset | File | Size |
|-------|------|------|
| Key Art (4K) | `marketing/key-art.jpg` | 8.6MB |
| Twitter Card (16:9) | `marketing/social/twitter-card.jpg` | 2.6MB |
| Instagram Square (1:1) | `marketing/social/instagram-square.jpg` | 3.6MB |
| Reddit Banner (3:2) | `marketing/social/reddit-banner.jpg` | 3.1MB |
| Gameplay Overview Video | `marketing/gameplay-overview.mp4` | 16MB, 55s |
| The Tension Video | `marketing/the-tension.mp4` | 12MB, 30s |
| Trailer | `marketing/trailer.mp4` | 1.7MB, 22s |
| AI Teaser | `marketing/teaser.mp4` | 2.9MB, 8s |
| Shipyard Background | `images/promo/bg-shipyard.jpg` | 2K |
| Blueprint Background | `images/promo/bg-blueprint.jpg` | 2K |
| Workers Background | `images/promo/bg-split-choice.jpg` | 2K |
| Danger Gauge | `images/promo/bg-danger-gauge.jpg` | 2K |

---

## 7. Key Messages (Elevator Pitches)

**5-second:** Semi-cooperative naval board game. Free in browser.

**15-second:** Drydock Masters is a free board game where 2-6 players manage a naval shipyard. You share one health bar — if it hits zero, everyone loses. But only the top scorer gets promoted. Play instantly at pm-game-flame.vercel.app.

**30-second:** Drydock Masters is a semi-cooperative board game about managing a naval shipyard under pressure. Assign Labor Dice to Work Orders, survive Condition Found Reports, and balance shared survival against individual ambition. 15 secret objectives, daily challenges, and AI bots. Balanced across 3,400 simulated games. Free, no download, works on any device.

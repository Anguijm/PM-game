"use client";

import { useEffect, useRef, useState } from "react";
import { Client } from "boardgame.io/client";
import { Local } from "boardgame.io/multiplayer";
import { DrydockMasters } from "@/game";
import { GameBoard } from "@/components/board/GameBoard";
import { getBotMove, type BotStrategy } from "@/game/bot";
import type { DrydockMastersState } from "@/game/types";
import {
  getTodayUTC,
  getDeviceId,
  hasAttemptedToday,
  markAttempted,
  hasSubmittedToday,
  markSubmitted,
} from "@/lib/daily";
import { cn } from "@/lib/cn";

const BOT_STRATEGIES: BotStrategy[] = ["balanced", "aggressive", "cautious"];

interface LeaderboardEntry {
  initials: string;
  score: number;
}

export default function DailyChallenge() {
  const [phase, setPhase] = useState<"intro" | "playing" | "submit" | "leaderboard">(
    hasAttemptedToday() ? (hasSubmittedToday() ? "leaderboard" : "submit") : "intro"
  );
  const [gameState, setGameState] = useState<{ G: DrydockMastersState; ctx: any } | null>(null);
  const [initials, setInitials] = useState("");
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [finalScore, setFinalScore] = useState(0);
  const clientRef = useRef<any>(null);
  const botIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const todayDate = getTodayUTC();

  // Fetch leaderboard
  useEffect(() => {
    if (phase === "leaderboard" || phase === "submit") {
      fetch(`/api/daily/leaderboard?date=${todayDate}`)
        .then((r) => r.json())
        .then((data) => setLeaderboard(data.leaderboard || []))
        .catch(() => {});
    }
  }, [phase, todayDate]);

  function startGame() {
    markAttempted();

    // Create client with today's date as seed (boardgame.io Alea PRNG)
    const client = Client({
      game: DrydockMasters,
      numPlayers: 4,
      playerID: "0",
      multiplayer: Local(),
      matchID: `daily-${todayDate}`,
      debug: false,
    });

    // Create bot clients
    const botClients: any[] = [];
    for (let i = 1; i <= 3; i++) {
      const bc = Client({
        game: DrydockMasters,
        numPlayers: 4,
        playerID: String(i),
        multiplayer: Local(),
        matchID: `daily-${todayDate}`,
        debug: false,
      });
      bc.start();
      botClients.push(bc);
    }

    client.subscribe((s: any) => {
      if (s) {
        setGameState({ G: s.G, ctx: s.ctx });

        if (s.ctx.gameover) {
          const scores = s.ctx.gameover.scores || {};
          setFinalScore(scores["0"] || s.G.players["0"]?.pp || 0);
          setPhase(hasSubmittedToday() ? "leaderboard" : "submit");

          // Stop bot interval
          if (botIntervalRef.current) clearInterval(botIntervalRef.current);
        }
      }
    });

    client.start();
    clientRef.current = client;

    // Bot polling
    const botFailCounts: Record<string, number> = {};
    botIntervalRef.current = setInterval(() => {
      for (let i = 0; i < botClients.length; i++) {
        const pid = String(i + 1);
        const bc = botClients[i];
        const state = bc.getState();
        if (!state?.G || !state?.ctx || !state.isActive || state.ctx.gameover) continue;
        if (state.ctx.currentPlayer !== pid) continue;

        const stateKey = `${pid}-${state.ctx.turn}-${state.ctx.phase}`;
        if (!botFailCounts[pid]) botFailCounts[pid] = 0;

        const move = getBotMove(state.G, pid, BOT_STRATEGIES[i], state.ctx.phase);
        if (move) {
          const fn = bc.moves[move.move];
          if (fn) fn(...move.args);

          // Stuck detection
          const newState = bc.getState();
          const newKey = `${pid}-${newState?.ctx?.turn}-${newState?.ctx?.phase}`;
          if (newKey === stateKey) {
            botFailCounts[pid]++;
            if (botFailCounts[pid] > 5) {
              try { bc.moves.pass?.(); } catch {}
              botFailCounts[pid] = 0;
            }
          } else {
            botFailCounts[pid] = 0;
          }
        }
      }
    }, 200);

    setPhase("playing");
  }

  async function submitScore() {
    if (initials.length < 1) return;

    try {
      await fetch("/api/daily/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          initials: initials.toUpperCase().slice(0, 3),
          score: finalScore,
          date: todayDate,
          deviceId: getDeviceId(),
        }),
      });
    } catch {}

    markSubmitted();
    setPhase("leaderboard");
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (botIntervalRef.current) clearInterval(botIntervalRef.current);
      if (clientRef.current) clientRef.current.stop();
    };
  }, []);

  // INTRO
  if (phase === "intro") {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md mx-4">
          <h1 className="text-3xl font-bold text-steel-100">DAILY CHALLENGE</h1>
          <p className="text-navy-400">{todayDate}</p>
          <p className="text-sm text-navy-200">
            Same game for everyone today. Play against 3 bots.
            Your score is your final Prestige Points.
            One attempt per day — make it count.
          </p>
          <button
            onClick={startGame}
            className="rounded-lg bg-amber-500 px-8 py-3 text-lg font-bold text-navy-900 hover:bg-amber-400 transition-colors"
          >
            START CHALLENGE
          </button>
          <div>
            <a href="/" className="text-xs text-navy-400 hover:text-navy-200">
              ← Back to lobby
            </a>
          </div>
        </div>
      </div>
    );
  }

  // PLAYING
  if (phase === "playing" && gameState && clientRef.current) {
    return (
      <div className="min-h-screen bg-navy-950 flex flex-col">
        <div className="bg-amber-500/10 border-b border-amber-500/30 px-4 py-1.5 text-center text-xs text-amber-400">
          Daily Challenge — {todayDate}
        </div>
        <GameBoard
          G={gameState.G}
          ctx={gameState.ctx}
          moves={clientRef.current.moves}
          events={clientRef.current.events}
          isActive={gameState.ctx.currentPlayer === "0" && !gameState.ctx.gameover}
          playerID="0"
        />
      </div>
    );
  }

  // SUBMIT SCORE
  if (phase === "submit") {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md mx-4">
          <h1 className="text-3xl font-bold text-steel-100">CHALLENGE COMPLETE</h1>
          <div className="text-5xl font-bold text-prestige">{finalScore} PP</div>
          <div className="space-y-3">
            <p className="text-sm text-navy-200">Enter your initials for the leaderboard:</p>
            <input
              value={initials}
              onChange={(e) => setInitials(e.target.value.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 3))}
              placeholder="AAA"
              maxLength={3}
              className="rounded bg-navy-700 border border-navy-600 px-4 py-3 text-2xl text-center text-steel-100 tracking-[0.5em] w-32 uppercase"
              autoFocus
            />
            <div>
              <button
                onClick={submitScore}
                disabled={initials.length < 1}
                className={cn(
                  "rounded-lg px-8 py-3 text-lg font-bold transition-colors",
                  initials.length >= 1
                    ? "bg-amber-500 text-navy-900 hover:bg-amber-400"
                    : "bg-navy-700 text-navy-500 cursor-not-allowed"
                )}
              >
                SUBMIT SCORE
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // LEADERBOARD
  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center">
      <div className="text-center space-y-6 max-w-md mx-4 w-full">
        <h1 className="text-2xl font-bold text-steel-100">DAILY LEADERBOARD</h1>
        <p className="text-navy-400">{todayDate}</p>

        {finalScore > 0 && (
          <div className="text-lg text-prestige font-bold">Your score: {finalScore} PP</div>
        )}

        {leaderboard.length > 0 ? (
          <div className="space-y-1">
            {leaderboard.map((entry, i) => (
              <div
                key={i}
                className={cn(
                  "flex items-center justify-between rounded px-4 py-2 text-sm",
                  i === 0
                    ? "bg-amber-500/10 border border-amber-500/30 text-amber-400"
                    : "bg-navy-700/50 text-steel-300"
                )}
              >
                <div className="flex items-center gap-3">
                  <span className={cn("w-6 font-bold", i === 0 ? "text-amber-400" : "text-navy-400")}>
                    {i + 1}.
                  </span>
                  <span className="font-mono tracking-wider">{entry.initials}</span>
                </div>
                <span className="font-bold text-prestige">{entry.score} PP</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-navy-400">
            No scores yet today. {hasSubmittedToday() ? "" : "Be the first!"}
          </p>
        )}

        <div className="space-y-2 pt-4">
          {hasSubmittedToday() && (
            <p className="text-xs text-navy-400">Come back tomorrow for a new challenge!</p>
          )}
          <a
            href="/"
            className="inline-block rounded bg-navy-600 px-6 py-2 text-sm font-bold text-steel-300 hover:bg-navy-500 transition-colors"
          >
            ← Back to Lobby
          </a>
        </div>
      </div>
    </div>
  );
}

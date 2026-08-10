"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { BOT_STRATEGIES, type BotStrategy } from "@/game/bot";
import { createMatch, findMatch, joinMatch, listOpenMatches, type LobbyMatch } from "@/lib/lobby";
import { cn } from "@/lib/cn";
import { useAchievements } from "@/hooks/useAchievements";
import { AchievementGallery } from "@/components/ui/AchievementGallery";

const BoardgameClient = dynamic(
  () => import("@/components/client/BoardgameClient"),
  { ssr: false }
);

const OnlineClient = dynamic(
  () => import("@/components/client/OnlineClient"),
  { ssr: false }
);

type GameMode = "menu" | "tutorial" | "local-setup" | "local-playing" | "online";

interface OnlineSession {
  matchID: string;
  playerID: string;
  credentials: string;
  roomCode: string;
}

export default function Home() {
  const [mode, setMode] = useState<GameMode>("menu");
  const [numPlayers, setNumPlayers] = useState(2);
  const [botSlots, setBotSlots] = useState<Record<string, BotStrategy | "human">>({
    "0": "human",
    "1": "balanced",
  });

  // Online state
  const [onlineSession, setOnlineSession] = useState<OnlineSession | null>(null);
  const [roomCode, setRoomCode] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [onlineNumPlayers, setOnlineNumPlayers] = useState(2);
  const [error, setError] = useState("");
  const [showAchievements, setShowAchievements] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const { earned, stats } = useAchievements();

  // First-time visitors: nudge them toward the tutorial.
  useEffect(() => {
    if (typeof window !== "undefined" && !localStorage.getItem("dm_seen_intro")) {
      setShowIntro(true);
    }
  }, []);
  function dismissIntro() {
    if (typeof window !== "undefined") localStorage.setItem("dm_seen_intro", "1");
    setShowIntro(false);
  }
  const [loading, setLoading] = useState(false);
  const [createdRoomCode, setCreatedRoomCode] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [openMatches, setOpenMatches] = useState<LobbyMatch[]>([]);
  const [lobbyLoading, setLobbyLoading] = useState(false);

  function updatePlayerCount(n: number) {
    setNumPlayers(n);
    const newSlots: Record<string, BotStrategy | "human"> = { "0": "human" };
    for (let i = 1; i < n; i++) {
      newSlots[String(i)] = botSlots[String(i)] || "balanced";
    }
    setBotSlots(newSlots);
  }

  // Poll for open matches when in online setup mode
  const refreshLobby = useCallback(async () => {
    setLobbyLoading(true);
    try {
      const matches = await listOpenMatches();
      setOpenMatches(matches);
    } catch {
      // silently fail — lobby is a nice-to-have
    }
    setLobbyLoading(false);
  }, []);

  useEffect(() => {
    if (mode !== "online" || onlineSession) return;
    refreshLobby();
    // Add jitter to prevent thundering herd
    const jitter = Math.random() * 2000;
    const interval = setInterval(refreshLobby, 10_000 + jitter);
    return () => clearInterval(interval);
  }, [mode, onlineSession, refreshLobby]);

  async function handleCreateRoom() {
    setError("");
    setLoading(true);
    try {
      const { matchID, roomCode: code } = await createMatch(onlineNumPlayers, isPublic);
      setCreatedRoomCode(code);

      // Auto-join as first player
      const session = await joinMatch(matchID, playerName || "Player 1");
      setOnlineSession({ ...session, matchID, roomCode: code });
    } catch (e: any) {
      setError(e.message || "Failed to create room");
    }
    setLoading(false);
  }

  async function handleLobbyJoin(matchID: string) {
    setError("");
    setLoading(true);
    try {
      const session = await joinMatch(matchID, playerName || "Player");
      const match = openMatches.find((m) => m.matchID === matchID);
      setOnlineSession({ ...session, matchID, roomCode: match?.roomCode || "" });
    } catch (e: any) {
      if (e.message?.includes("No open seats")) {
        setError("Room filled up. Try another!");
        refreshLobby(); // refresh list
      } else {
        setError(e.message || "Failed to join");
      }
    }
    setLoading(false);
  }

  async function handleJoinRoom() {
    setError("");
    setLoading(true);
    try {
      const matchID = await findMatch(roomCode.toUpperCase());
      if (!matchID) {
        setError("Room not found. Check the code.");
        setLoading(false);
        return;
      }
      const session = await joinMatch(matchID, playerName || "Player");
      setOnlineSession({ ...session, matchID, roomCode: roomCode.toUpperCase() });
    } catch (e: any) {
      setError(e.message || "Failed to join room");
    }
    setLoading(false);
  }

  // Tutorial mode
  if (mode === "tutorial") {
    return (
      <BoardgameClient
        numPlayers={2}
        botSlots={{ "0": "human", "1": "cautious" }}
        isTutorial
      />
    );
  }

  // Playing local
  if (mode === "local-playing") {
    return <BoardgameClient numPlayers={numPlayers} botSlots={botSlots} />;
  }

  // Playing online
  if (mode === "online" && onlineSession) {
    return (
      <OnlineClient
        matchID={onlineSession.matchID}
        playerID={onlineSession.playerID}
        credentials={onlineSession.credentials}
      />
    );
  }

  // Menu
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-4 py-8">
      <div className="w-full max-w-2xl text-center">
        {/* Key art — the game's own brand hero (title baked in) */}
        <div className="overflow-hidden rounded-xl border border-navy-600 shadow-[0_10px_40px_rgba(0,0,0,0.55)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/marketing/key-art.jpg"
            alt="Drydock Masters"
            className="w-full"
          />
        </div>
        <p className="stencil mt-3 text-xs text-navy-400 sm:text-sm">
          Regional Maintenance Center — Shipyard Operations
        </p>
      </div>

      {mode === "menu" && (
        <div className="flex flex-col items-center gap-4 w-80">
          {showIntro && (
            <div className="w-full rounded-lg border border-amber-500/50 bg-amber-500/10 p-3 text-center">
              <p className="stencil text-xs text-amber-400">New here?</p>
              <p className="mt-1 text-[13px] text-steel-300">
                Drydock Masters has some depth. The 5-minute{" "}
                <b className="text-amber-400">Tutorial</b> teaches the whole loop — start there,
                then jump into Local Play.
              </p>
              <div className="mt-2 flex justify-center gap-2">
                <button
                  onClick={() => {
                    dismissIntro();
                    setMode("tutorial");
                  }}
                  className="stencil rounded bg-amber-500 px-3 py-1 text-xs text-navy-900 hover:bg-amber-400"
                >
                  Start Tutorial
                </button>
                <button
                  onClick={dismissIntro}
                  className="stencil rounded border border-navy-600 px-3 py-1 text-xs text-navy-300 hover:text-steel-100"
                >
                  Skip
                </button>
              </div>
            </div>
          )}
          <a
            href="/daily"
            className="w-full rounded-lg bg-prestige py-3 text-lg font-bold text-navy-900 hover:bg-prestige/80 transition-colors block text-center"
          >
            DAILY CHALLENGE
          </a>
          <button
            onClick={() => setMode("tutorial")}
            className="w-full rounded-lg border-2 border-amber-500 bg-amber-500/10 py-3 text-lg font-bold text-amber-400 hover:bg-amber-500/20 transition-colors"
          >
            TUTORIAL — LEARN TO PLAY
          </button>
          <button
            onClick={() => setMode("local-setup")}
            className="w-full rounded-lg bg-amber-500 py-3 text-lg font-bold text-navy-900 hover:bg-amber-400 transition-colors"
          >
            LOCAL PLAY
          </button>
          <button
            onClick={() => setMode("online")}
            className="w-full rounded-lg border border-die-blue bg-die-blue/10 py-3 text-lg font-bold text-die-blue hover:bg-die-blue/20 transition-colors"
          >
            ONLINE PLAY
          </button>
          <button
            onClick={() => setShowAchievements(true)}
            className="text-xs text-navy-400 hover:text-amber-400 transition-colors"
          >
            Achievements ({Object.keys(earned).length}/15) | {stats.gamesPlayed} games played
          </button>
          <p className="text-sm text-navy-600">
            Local: hot-seat with bots | Online: lobby + room codes
          </p>

          {showAchievements && (
            <AchievementGallery
              earned={earned}
              stats={stats}
              onClose={() => setShowAchievements(false)}
            />
          )}
        </div>
      )}

      {/* Online setup */}
      {mode === "online" && !onlineSession && (
        <div className="flex flex-col items-center gap-6 rounded-xl border border-navy-600 bg-navy-800 p-8 w-96">
          <button
            onClick={() => setMode("menu")}
            className="self-start text-xs text-navy-400 hover:text-navy-200"
          >
            &larr; Back
          </button>

          {/* Player name */}
          <label className="flex flex-col gap-1 w-full">
            <span className="text-xs text-navy-200 uppercase tracking-wider">
              Your Name
            </span>
            <input
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Superintendent"
              className="rounded bg-navy-700 border border-navy-600 px-3 py-2 text-steel-100 text-sm"
            />
          </label>

          {/* Open Games Lobby */}
          <div className="w-full space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-navy-200 uppercase tracking-wider">
                Open Games
              </span>
              <button
                onClick={refreshLobby}
                disabled={lobbyLoading}
                className="text-[10px] text-navy-400 hover:text-navy-200 transition-colors"
              >
                {lobbyLoading ? "Refreshing..." : "Refresh"}
              </button>
            </div>
            {openMatches.length === 0 ? (
              <div className="rounded bg-navy-700/50 border border-navy-600 px-3 py-4 text-center text-xs text-navy-400">
                No open games. Create one below!
              </div>
            ) : (
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {openMatches.map((m) => (
                  <div
                    key={m.matchID}
                    className="flex items-center justify-between rounded bg-navy-700/50 border border-navy-600 px-3 py-2"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-amber-400 tracking-wider">
                          {m.roomCode}
                        </span>
                        <span className="text-[10px] text-navy-400">
                          {m.players.length}/{m.maxPlayers}
                        </span>
                      </div>
                      <div className="text-[10px] text-navy-400 truncate">
                        {m.players.join(", ") || "Waiting..."}
                      </div>
                    </div>
                    <button
                      onClick={() => handleLobbyJoin(m.matchID)}
                      disabled={loading}
                      className="ml-2 rounded bg-success px-3 py-1 text-xs font-bold text-navy-900 hover:bg-success/80 disabled:opacity-50 transition-colors shrink-0"
                    >
                      JOIN
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 w-full">
            <div className="flex-1 h-px bg-navy-600" />
            <span className="text-xs text-navy-400">CREATE OR JOIN</span>
            <div className="flex-1 h-px bg-navy-600" />
          </div>

          {/* Create room */}
          <div className="w-full space-y-2">
            <span className="text-xs text-navy-200 uppercase tracking-wider">
              Create a Room
            </span>
            <div className="flex gap-2">
              {[2, 3, 4].map((n) => (
                <button
                  key={n}
                  onClick={() => setOnlineNumPlayers(n)}
                  className={cn(
                    "flex-1 rounded-lg py-2 text-lg font-bold transition-colors",
                    onlineNumPlayers === n
                      ? "bg-die-blue text-white"
                      : "bg-navy-700 text-navy-200 hover:bg-navy-600"
                  )}
                >
                  {n}P
                </button>
              ))}
            </div>
            <label className="flex items-center gap-2 text-xs text-navy-300 cursor-pointer">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="rounded border-navy-600 bg-navy-700 text-die-blue focus:ring-die-blue"
              />
              List in public lobby
            </label>
            <button
              onClick={handleCreateRoom}
              disabled={loading}
              className="w-full rounded bg-die-blue py-2 text-sm font-bold text-white hover:bg-die-blue/80 disabled:opacity-50 transition-colors"
            >
              {loading ? "Creating..." : "CREATE ROOM"}
            </button>
            {createdRoomCode && !onlineSession && (
              <div className="text-center">
                <p className="text-xs text-navy-400">Room Code:</p>
                <p className="text-2xl font-bold text-amber-400 tracking-widest">
                  {createdRoomCode}
                </p>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 w-full">
            <div className="flex-1 h-px bg-navy-600" />
            <span className="text-xs text-navy-400">OR JOIN BY CODE</span>
            <div className="flex-1 h-px bg-navy-600" />
          </div>

          {/* Join room by code */}
          <div className="w-full space-y-2">
            <input
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="Enter 6-letter code"
              maxLength={6}
              className="w-full rounded bg-navy-700 border border-navy-600 px-3 py-2 text-steel-100 text-sm text-center tracking-widest uppercase"
            />
            <button
              onClick={handleJoinRoom}
              disabled={loading || roomCode.length < 6}
              className="w-full rounded bg-success py-2 text-sm font-bold text-navy-900 hover:bg-success/80 disabled:opacity-50 transition-colors"
            >
              {loading ? "Joining..." : "JOIN ROOM"}
            </button>
          </div>

          {error && (
            <p className="text-sm text-alert-red">{error}</p>
          )}
        </div>
      )}

      {/* Local setup */}
      {mode === "local-setup" && (
        <div className="flex flex-col items-center gap-6 rounded-xl border border-navy-600 bg-navy-800 p-8 w-96">
          <button
            onClick={() => setMode("menu")}
            className="self-start text-xs text-navy-400 hover:text-navy-200"
          >
            &larr; Back
          </button>

          <label className="flex flex-col gap-2 w-full">
            <span className="text-sm text-navy-200 uppercase tracking-wider">
              Superintendents
            </span>
            <div className="flex gap-2">
              {[2, 3, 4, 5, 6].map((n) => (
                <button
                  key={n}
                  onClick={() => updatePlayerCount(n)}
                  className={cn(
                    "flex-1 rounded-lg py-2 text-lg font-bold transition-colors",
                    numPlayers === n
                      ? "bg-amber-500 text-navy-900"
                      : "bg-navy-700 text-navy-200 hover:bg-navy-600"
                  )}
                >
                  {n}
                </button>
              ))}
            </div>
          </label>

          <div className="w-full space-y-2">
            <span className="text-sm text-navy-200 uppercase tracking-wider">
              Player Setup
            </span>
            {Array.from({ length: numPlayers }, (_, i) => String(i)).map(
              (pid) => (
                <div
                  key={pid}
                  className="flex items-center gap-2 rounded bg-navy-700 px-3 py-2"
                >
                  <span className="text-sm text-steel-100 w-16">
                    Seat {parseInt(pid) + 1}
                  </span>
                  <select
                    value={botSlots[pid] || "balanced"}
                    onChange={(e) =>
                      setBotSlots((prev) => ({
                        ...prev,
                        [pid]: e.target.value as BotStrategy | "human",
                      }))
                    }
                    className="flex-1 rounded bg-navy-600 text-steel-100 text-sm px-2 py-1 border border-navy-500"
                  >
                    <option value="human">Human</option>
                    {BOT_STRATEGIES.map((s) => (
                      <option key={s.id} value={s.id}>
                        Bot: {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              )
            )}
          </div>

          <button
            onClick={() => setMode("local-playing")}
            className="w-full rounded-lg bg-amber-500 py-3 text-lg font-bold text-navy-900 hover:bg-amber-400 transition-colors"
          >
            LAUNCH OPERATIONS
          </button>
        </div>
      )}
    </div>
  );
}

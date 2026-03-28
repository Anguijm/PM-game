"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Client } from "boardgame.io/client";
import { Local } from "boardgame.io/multiplayer";
import { DrydockMasters } from "@/game";
import { GameBoard } from "@/components/board/GameBoard";
import { PlayerSwitcher } from "@/components/player/PlayerSwitcher";
import type { DrydockMastersState } from "@/game/types";
import { getBotMove, type BotStrategy } from "@/game/bot";

interface ClientState {
  G: DrydockMastersState | null;
  ctx: any;
  isActive: boolean;
}

export default function BoardgameClient({
  numPlayers,
  botSlots,
  isTutorial = false,
}: {
  numPlayers: number;
  botSlots: Record<string, BotStrategy | "human">;
  isTutorial?: boolean;
}) {
  const [activePlayerID, setActivePlayerID] = useState("0");
  const [clientStates, setClientStates] = useState<
    Record<string, ClientState>
  >({});
  const clientsRef = useRef<Record<string, any>>({});
  const lastBotMoveKey = useRef<string>("");
  const botMoveCounter = useRef(0);
  const botFailCount = useRef(0);
  const clientStatesRef = useRef(clientStates);

  useEffect(() => {
    setClientStates({});
    const currentClients: Record<string, any> = {};

    for (let i = 0; i < numPlayers; i++) {
      const playerID = String(i);
      const client = Client({
        game: DrydockMasters,
        numPlayers,
        playerID,
        multiplayer: Local(),
        matchID: "drydock-local",
        debug: false,
      });

      currentClients[playerID] = client;

      client.subscribe((state: any) => {
        if (!state) return;
        setClientStates((prev) => ({
          ...prev,
          [playerID]: {
            G: state.G,
            ctx: state.ctx,
            isActive: state.isActive,
          },
        }));
      });

      client.start();
    }

    clientsRef.current = currentClients;

    return () => {
      Object.values(currentClients).forEach((c) => c.stop());
      clientsRef.current = {};
      // cleanup handled by interval in bot effect
    };
  }, [numPlayers]);

  // Keep ref in sync for the polling interval
  clientStatesRef.current = clientStates;

  // Bot auto-play: poll every 500ms for bot moves
  // React useEffect with clientStates dependency was unreliable — batching prevented re-triggers
  useEffect(() => {
    const interval = setInterval(() => {
      for (const [pid] of Object.entries(botSlots)) {
        if (botSlots[pid] === "human") continue;

        const client = clientsRef.current[pid];
        if (!client) continue;

        // Read state directly from boardgame.io client (not React state — avoids staleness)
        const state = client.getState();
        if (!state?.G || !state?.ctx) { console.log(`[BOT] ${pid}: no state`); continue; }
        if (state.ctx.currentPlayer !== pid) continue; // normal — not this bot's turn
        if (!state.isActive) { console.log(`[BOT] ${pid}: not active (CP=${state.ctx.currentPlayer} phase=${state.ctx.phase})`); continue; }
        if (state.ctx.gameover) { console.log(`[BOT] ${pid}: game over`); continue; }

        // Key based on game state — changes when a valid move is processed
        const player = state.G.players[pid];
        const actionsLeft = player?.actionsRemaining ?? 0;
        const handSize = player?.hand?.length ?? 0;
        const stateKey = `${pid}-${state.ctx.turn ?? 0}-${state.ctx.phase}-${actionsLeft}-${handSize}`;

        // Stuck detection: same state key seen multiple times
        if (stateKey === lastBotMoveKey.current) {
          botFailCount.current++;
          if (botFailCount.current > 5) {
            try { client.moves.pass?.(); } catch {}
            botFailCount.current = 0;
            lastBotMoveKey.current = ""; // reset to allow next state
          }
          continue;
        }

        const phase = state.ctx.phase || "event";
        const move = getBotMove(state.G, pid, botSlots[pid] as any, phase);

        if (move) {
          const fresh = client.getState();
          if (
            !fresh?.isActive ||
            fresh.ctx?.currentPlayer !== pid ||
            fresh.ctx?.gameover ||
            fresh.ctx?.phase !== phase
          ) continue;

          lastBotMoveKey.current = stateKey;
          botFailCount.current = 0;
          const moveFn = client.moves[move.move];
          if (moveFn) moveFn(...move.args);
          break;
        }
      }
    }, 200);

    return () => clearInterval(interval);
  }, [botSlots]);

  // Find the first human player for initial view
  const firstHuman = Object.keys(botSlots).find(
    (pid) => botSlots[pid] === "human"
  ) || "0";

  const activeState = clientStates[activePlayerID];
  const activeClient = clientsRef.current[activePlayerID];

  if (!activeState?.G || !activeState?.ctx || !activeClient) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-navy-400 text-lg">Initializing shipyard...</p>
      </div>
    );
  }

  // Check if the active view is a bot
  const isViewingBot = botSlots[activePlayerID] !== "human";

  return (
    <div className="min-h-screen flex flex-col">
      <PlayerSwitcher
        numPlayers={numPlayers}
        activePlayerID={activePlayerID}
        currentTurnPlayerID={activeState.ctx.currentPlayer}
        onSwitch={setActivePlayerID}
        botSlots={botSlots}
      />

      {/* Bot indicator */}
      {isViewingBot && (
        <div className="bg-navy-700 border-b border-navy-600 px-4 py-1.5 text-center text-xs text-navy-400">
          Viewing Bot ({botSlots[activePlayerID]}) — switch to a human seat to play
        </div>
      )}

      <GameBoard
        G={activeState.G}
        ctx={activeState.ctx}
        moves={activeClient.moves}
        events={activeClient.events}
        isActive={activeState.isActive && !isViewingBot}
        playerID={activePlayerID}
        isTutorial={isTutorial}
      />
    </div>
  );
}

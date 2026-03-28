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
        if (!state?.G || !state?.ctx) continue;
        if (state.ctx.currentPlayer !== pid) continue;
        if (state.ctx.gameover) continue;

        // Use our own counter instead of numMoves (noLimit moves don't increment numMoves)
        const moveKey = `${pid}-${state.ctx.turn ?? 0}-${state.ctx.phase}-${botMoveCounter.current}`;
        if (moveKey === lastBotMoveKey.current) continue;

        const phase = state.ctx.phase || "event";
        const move = getBotMove(state.G, pid, botSlots[pid] as any, phase);

        if (move) {
          lastBotMoveKey.current = moveKey;
          botMoveCounter.current++;
          const moveFn = client.moves[move.move];
          if (moveFn) moveFn(...move.args);
          break;
        }
      }
    }, 500);

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

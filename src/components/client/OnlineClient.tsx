"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Client } from "boardgame.io/client";
import { SocketIO } from "boardgame.io/multiplayer";
import { DrydockMasters } from "@/game";
import { GameBoard } from "@/components/board/GameBoard";
import { EmoteWheel, EmoteBubble } from "@/components/ui/EmoteWheel";
import type { DrydockMastersState } from "@/game/types";
import { getServerURL } from "@/lib/lobby";

interface OnlineClientProps {
  matchID: string;
  playerID: string;
  credentials: string;
}

interface ClientState {
  G: DrydockMastersState | null;
  ctx: any;
  isActive: boolean;
}

export default function OnlineClient({
  matchID,
  playerID,
  credentials,
}: OnlineClientProps) {
  const [state, setState] = useState<ClientState>({
    G: null,
    ctx: null,
    isActive: false,
  });
  const clientRef = useRef<any>(null);
  const [activeEmote, setActiveEmote] = useState<{ playerName: string; emoteId: string } | null>(null);
  const lastChatCount = useRef<number | null>(null); // null = first load
  const emoteTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastEmoteSent = useRef(0);

  useEffect(() => {
    const server = getServerURL();

    const client = Client({
      game: DrydockMasters,
      multiplayer: SocketIO({ server }),
      matchID,
      playerID,
      credentials,
    });

    client.subscribe((s: any) => {
      if (s) {
        setState({
          G: s.G,
          ctx: s.ctx,
          isActive: s.isActive,
        });

        // Check for new chat messages (emotes)
        const msgs = s.chatMessages || [];

        // First load: set baseline, don't trigger old emotes
        if (lastChatCount.current === null) {
          lastChatCount.current = msgs.length;
        } else if (msgs.length > lastChatCount.current) {
          // Process new messages since last check
          const newMsgs = msgs.slice(lastChatCount.current);
          for (const msg of newMsgs) {
            const payload = msg?.payload;
            if (payload && typeof payload === "object" && payload.type === "EMOTE") {
              const senderName =
                s.G?.players?.[msg.sender]?.name ||
                `Player ${parseInt(msg.sender || "0") + 1}`;

              // Clear previous timer to prevent race condition
              if (emoteTimer.current) clearTimeout(emoteTimer.current);
              setActiveEmote({ playerName: senderName, emoteId: payload.id });
              emoteTimer.current = setTimeout(() => setActiveEmote(null), 3000);
            }
          }
          lastChatCount.current = msgs.length;
        }
      }
    });

    client.start();
    clientRef.current = client;

    return () => {
      client.stop();
      clientRef.current = null;
    };
  }, [matchID, playerID, credentials]);

  const activeClient = clientRef.current;

  if (!state.G || !state.ctx || !activeClient) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-3">
          <div className="h-8 w-8 mx-auto border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-navy-400 text-lg">Connecting to shipyard...</p>
          <p className="text-navy-600 text-sm">
            Match: {matchID} | You are Player {parseInt(playerID) + 1}
          </p>
          <p className="text-navy-600 text-xs mt-4">
            Server may take up to 30 seconds to wake up on first connect.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Online status bar */}
      <div className="flex items-center justify-between border-b border-navy-600 bg-navy-900 px-4 py-2">
        <span className="text-xs text-navy-400">
          Online — Player {parseInt(playerID) + 1}
        </span>
        <span className="text-xs text-success">Connected</span>
      </div>

      <GameBoard
        G={state.G}
        ctx={state.ctx}
        moves={activeClient.moves}
        events={activeClient.events}
        isActive={state.isActive}
        playerID={playerID}
      />

      {/* Emote system */}
      <EmoteWheel
        isOnline={true}
        onSendEmote={(emoteId) => {
          const now = Date.now();
          if (now - lastEmoteSent.current < 2000) return; // 2s cooldown
          lastEmoteSent.current = now;
          activeClient.sendChatMessage({ type: "EMOTE", id: emoteId });
        }}
      />

      {activeEmote && (
        <EmoteBubble
          playerName={activeEmote.playerName}
          emoteId={activeEmote.emoteId}
          onDone={() => setActiveEmote(null)}
        />
      )}
    </div>
  );
}

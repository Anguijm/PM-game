"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/cn";

const EMOTES = [
  { id: "need_material", label: "Need Material!", icon: "🔩" },
  { id: "need_funding", label: "Need Funding!", icon: "💰" },
  { id: "ill_handle_it", label: "I'll handle it", icon: "🛠️" },
  { id: "help", label: "Help!", icon: "🆘" },
  { id: "nice_move", label: "Nice move", icon: "👍" },
  { id: "betrayal", label: "Betrayal!", icon: "🗡️" },
  { id: "watch_si", label: "Watch the SI!", icon: "⚠️" },
  { id: "gg", label: "Good game", icon: "🤝" },
];

interface EmoteWheelProps {
  onSendEmote: (emoteId: string) => void;
  isOnline: boolean;
}

export function EmoteWheel({ onSendEmote, isOnline }: EmoteWheelProps) {
  const [open, setOpen] = useState(false);

  if (!isOnline) return null;

  return (
    <div className="fixed bottom-16 right-4 z-20 sm:bottom-4">
      {/* Trigger button */}
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "h-10 w-10 rounded-full flex items-center justify-center text-lg transition-all shadow-lg",
          open
            ? "bg-amber-500 text-navy-900"
            : "bg-navy-700 text-navy-400 hover:bg-navy-600"
        )}
      >
        💬
      </button>

      {/* Emote options */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            className="absolute bottom-12 right-0 bg-navy-800 border border-navy-600 rounded-xl p-2 shadow-xl w-48"
          >
            {EMOTES.map((emote) => (
              <button
                key={emote.id}
                onClick={() => {
                  onSendEmote(emote.id);
                  setOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-steel-300 hover:bg-navy-700 hover:text-steel-100 transition-colors"
              >
                <span>{emote.icon}</span>
                <span>{emote.label}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Toast that shows received emotes
interface EmoteBubbleProps {
  playerName: string;
  emoteId: string;
  onDone: () => void;
}

export function EmoteBubble({ playerName, emoteId, onDone }: EmoteBubbleProps) {
  const emote = EMOTES.find((e) => e.id === emoteId);

  useEffect(() => {
    const timer = setTimeout(onDone, 3000);
    return () => clearTimeout(timer);
  }, [onDone]);

  if (!emote) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="fixed top-20 left-1/2 -translate-x-1/2 z-30 rounded-lg border border-navy-600 bg-navy-800 px-4 py-2 shadow-lg"
    >
      <span className="text-sm text-steel-100">
        <span className="font-bold text-amber-400">{playerName}:</span>{" "}
        {emote.icon} {emote.label}
      </span>
    </motion.div>
  );
}

export { EMOTES };

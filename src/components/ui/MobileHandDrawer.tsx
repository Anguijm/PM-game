"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { WorkCard } from "@/game/types";
import { WorkOrderCard } from "@/components/cards/WorkOrderCard";
import { useGameUI } from "@/hooks/useGameUI";
import { cn } from "@/lib/cn";

interface MobileHandDrawerProps {
  hand: WorkCard[];
  isActive: boolean;
}

export function MobileHandDrawer({ hand, isActive }: MobileHandDrawerProps) {
  const [expanded, setExpanded] = useState(false);
  const { actionMode, startStagingWork, cancelAction } = useGameUI();
  const selectedCardID =
    actionMode.type === "stagingWork" ? actionMode.cardID : null;

  if (hand.length === 0) return null;

  return (
    <div
      className="fixed bottom-12 left-0 right-0 z-20 sm:hidden"
      style={{ touchAction: "manipulation" }}
    >
      {/* Peek bar — always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between bg-navy-800 border-t border-navy-600 px-4 py-2"
      >
        <span className="text-xs text-navy-400 uppercase tracking-wider">
          Hand ({hand.length})
          {selectedCardID && (
            <span className="text-amber-400 ml-2">— tap slot to stage</span>
          )}
        </span>
        <span className="text-navy-400 text-xs">{expanded ? "▼" : "▲"}</span>
      </button>

      {/* Expanded drawer */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="overflow-hidden bg-navy-800 border-t border-navy-600"
          >
            <div className="flex gap-2 p-3 overflow-x-auto">
              {hand.map((card, idx) => (
                <div key={`${card.id}-${idx}`} className="shrink-0 w-40">
                  <WorkOrderCard
                    card={card}
                    size="compact"
                    selected={selectedCardID === card.id}
                    onClick={
                      isActive
                        ? () => {
                            if (selectedCardID === card.id) cancelAction();
                            else startStagingWork(card.id);
                            setExpanded(false);
                          }
                        : undefined
                    }
                    disabled={!isActive}
                  />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

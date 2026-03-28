"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useGameUI } from "@/hooks/useGameUI";

export function Toast() {
  const { toast, clearToast } = useGameUI();

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div
            className="rounded-lg border border-alert-red/50 bg-alert-red/20 px-4 py-2 text-sm font-bold text-alert-red shadow-lg backdrop-blur-sm cursor-pointer"
            onClick={clearToast}
          >
            {toast}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

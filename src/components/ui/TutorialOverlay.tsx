"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTutorial } from "@/hooks/useTutorial";

export function TutorialOverlay() {
  const { active, currentStep, advance, skipTutorial, currentStepIndex, totalSteps } =
    useTutorial();
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);

  const updateHighlight = useCallback(() => {
    if (!currentStep?.highlight) {
      setHighlightRect(null);
      return;
    }
    const el = document.querySelector(currentStep.highlight);
    if (el) {
      setHighlightRect(el.getBoundingClientRect());
    } else {
      setHighlightRect(null);
    }
  }, [currentStep]);

  // Use MutationObserver + resize/scroll listeners instead of arbitrary timeouts
  useEffect(() => {
    if (!currentStep?.highlight) {
      setHighlightRect(null);
      return;
    }

    updateHighlight();

    const observer = new MutationObserver(updateHighlight);
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("resize", updateHighlight);
    window.addEventListener("scroll", updateHighlight, true);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateHighlight);
      window.removeEventListener("scroll", updateHighlight, true);
    };
  }, [currentStep, updateHighlight]);

  if (!active || !currentStep) return null;

  const isManualAdvance = currentStep.requiredMove === null;

  return (
    <>
      {/* Dark overlay with cutout */}
      {highlightRect && (
        <div
          className="fixed inset-0 z-[100] pointer-events-none"
          style={{
            background: `radial-gradient(
              ellipse ${highlightRect.width + 40}px ${highlightRect.height + 40}px
              at ${highlightRect.left + highlightRect.width / 2}px ${highlightRect.top + highlightRect.height / 2}px,
              transparent 50%,
              rgba(10, 14, 26, 0.75) 51%
            )`,
          }}
        />
      )}

      {/* No highlight — just dim */}
      {!highlightRect && (
        <div className="fixed inset-0 z-[100] bg-navy-950/50 pointer-events-none" />
      )}

      {/* Tutorial dialog */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStepIndex}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -10, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[101] w-[90%] max-w-xl"
        >
          <div className="rounded-xl border border-amber-500/40 bg-navy-800 shadow-2xl overflow-hidden">
            {/* Foreman header */}
            <div className="flex items-center gap-3 bg-navy-700 px-4 py-2 border-b border-navy-600">
              <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-navy-900 text-sm font-bold">
                F
              </div>
              <span className="text-sm font-bold text-amber-400">
                The Foreman
              </span>
              <span className="ml-auto text-xs text-navy-400">
                {currentStepIndex + 1} / {totalSteps}
              </span>
            </div>

            {/* Message */}
            <div className="px-5 py-4">
              <p className="text-sm text-steel-100 leading-relaxed">
                {currentStep.text}
              </p>
            </div>

            {/* Action bar */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-navy-600">
              <button
                onClick={skipTutorial}
                className="text-xs text-navy-400 hover:text-navy-200 transition-colors"
              >
                Skip Tutorial
              </button>
              <div className="flex items-center gap-3">
                <span className="text-xs text-navy-400">
                  {isManualAdvance
                    ? ""
                    : "Perform the highlighted action"}
                </span>
                {isManualAdvance && (
                  <button
                    onClick={advance}
                    className="rounded bg-amber-500 px-4 py-1.5 text-sm font-bold text-navy-900 hover:bg-amber-400 transition-colors"
                  >
                    NEXT
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}

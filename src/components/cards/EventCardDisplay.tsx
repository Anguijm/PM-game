"use client";

import type { EventCard } from "@/game/types";

interface EventCardDisplayProps {
  event: EventCard;
  onAcknowledge?: () => void;
}

export function EventCardDisplay({
  event,
  onAcknowledge,
}: EventCardDisplayProps) {
  return (
    <div className="rounded-lg border border-amber-500/40 bg-navy-800 p-4">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-lg font-bold text-amber-400">{event.name}</h3>
        {event.persistence === "persistent" && (
          <span className="shrink-0 rounded bg-alert-red/20 px-1.5 py-0.5 text-[10px] font-bold text-alert-red uppercase">
            Persistent
          </span>
        )}
      </div>
      <p className="mt-1 text-sm text-navy-200">{event.description}</p>

      {/* Effect summary */}
      <div className="mt-2 flex flex-wrap gap-2 text-xs">
        {event.effect.siChange && (
          <span
            className={
              event.effect.siChange > 0 ? "text-success" : "text-alert-red"
            }
          >
            SI {event.effect.siChange > 0 ? "+" : ""}
            {event.effect.siChange}
          </span>
        )}
        {event.effect.fundingChange && (
          <span
            className={
              event.effect.fundingChange > 0
                ? "text-funding"
                : "text-alert-red"
            }
          >
            ${event.effect.fundingChange > 0 ? "+" : ""}
            {event.effect.fundingChange} each
          </span>
        )}
        {event.effect.materialChange && (
          <span
            className={
              event.effect.materialChange > 0
                ? "text-material"
                : "text-alert-red"
            }
          >
            {event.effect.materialChange > 0 ? "+" : ""}
            {event.effect.materialChange}M each
          </span>
        )}
      </div>

      {onAcknowledge && (
        <button
          onClick={onAcknowledge}
          className="mt-3 rounded bg-amber-500 px-4 py-1.5 text-sm font-bold text-navy-900 hover:bg-amber-400 transition-colors"
        >
          ACKNOWLEDGE
        </button>
      )}
    </div>
  );
}

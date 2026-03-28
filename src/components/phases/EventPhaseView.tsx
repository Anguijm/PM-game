"use client";

import type { EventCard } from "@/game/types";
import { EventCardDisplay } from "@/components/cards/EventCardDisplay";

interface EventPhaseViewProps {
  event: EventCard | null;
  isActive: boolean;
  onAcknowledge: () => void;
}

export function EventPhaseView({
  event,
  isActive,
  onAcknowledge,
}: EventPhaseViewProps) {
  if (!event) {
    return (
      <div className="rounded-lg border border-navy-600 bg-navy-800 p-4 text-center">
        <p className="text-sm text-navy-400">No event this round.</p>
        {isActive && (
          <button
            onClick={onAcknowledge}
            className="mt-3 rounded bg-amber-500 px-4 py-1.5 text-sm font-bold text-navy-900 hover:bg-amber-400 transition-colors"
          >
            CONTINUE
          </button>
        )}
      </div>
    );
  }

  return (
    <EventCardDisplay
      event={event}
      onAcknowledge={isActive ? onAcknowledge : undefined}
    />
  );
}

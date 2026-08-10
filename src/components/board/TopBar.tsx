"use client";

import type { AdmiralMandateCard, EventCard } from "@/game/types";
import { GAME_CONSTANTS } from "@/game/types";
import { PHASE_LABELS } from "@/lib/theme";
import { SIGauge } from "./SIGauge";
import { Panel } from "@/components/ui/Panel";
import { HelpButton } from "@/components/ui/RulesReference";
import { VolumeControl } from "@/components/ui/VolumeControl";

interface TopBarProps {
  round: number;
  phase: string;
  shipyardIntegrity: number;
  currentPlayerLabel: string;
  isActive: boolean;
  admiralMandate: AdmiralMandateCard | null;
  persistentProblems: EventCard[];
}

export function TopBar({
  round,
  phase,
  shipyardIntegrity,
  currentPlayerLabel,
  isActive,
  admiralMandate,
  persistentProblems,
}: TopBarProps) {
  const phaseInfo = PHASE_LABELS[phase] || { label: "UNKNOWN", color: "text-steel-300" };

  return (
    <div className="space-y-2">
      <Panel className="flex flex-wrap items-center gap-4 p-3 sm:gap-6">
        {/* Round */}
        <div className="flex items-center gap-2">
          <span className="stencil text-[10px] text-navy-400">Round</span>
          <span className="text-xl font-bold text-steel-100">
            {round}/{GAME_CONSTANTS.MAX_ROUNDS}
          </span>
        </div>

        {/* Phase */}
        <div className="flex items-center gap-2">
          <span className="stencil text-[10px] text-navy-400">Phase</span>
          <span className={`stencil text-sm ${phaseInfo.color}`}>
            {phaseInfo.label}
          </span>
        </div>

        {/* SI gauge — the signature device */}
        <SIGauge value={shipyardIntegrity} size={116} />

        {/* Turn */}
        <div className="flex items-center gap-2">
          <span className="stencil text-[10px] text-navy-400">Turn</span>
          <span className="text-sm text-steel-100">{currentPlayerLabel}</span>
        </div>

        {/* Active indicator */}
        <div className="ml-auto flex items-center gap-3">
          <HelpButton />
          <VolumeControl />
          {isActive && (
            <span className="stencil rounded bg-success/20 px-2 py-0.5 text-xs text-success">
              Your Turn
            </span>
          )}
        </div>
      </Panel>

      {/* Admiral's Mandate — truncated on mobile, full on desktop */}
      {admiralMandate && (
        <div className="rounded border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs sm:text-sm">
          <span className="font-bold text-amber-400">
            Mandate:
          </span>{" "}
          <span className="text-amber-400/80 line-clamp-1 sm:line-clamp-none">
            {admiralMandate.name} — {admiralMandate.description}
          </span>
        </div>
      )}

      {/* Persistent Problems */}
      {persistentProblems.length > 0 && (
        <div className="rounded border border-alert-red/30 bg-alert-red/10 px-3 py-2">
          <h3 className="text-xs text-alert-red uppercase tracking-wider mb-1">
            Persistent Problems
          </h3>
          {persistentProblems.map((p) => (
            <p key={p.id} className="text-sm text-alert-red/80">
              {p.name}: {p.description}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { Panel } from "@/components/ui/Panel";
import { HudIcon, type HudIconName } from "@/components/ui/HudIcon";

interface ResourceBarProps {
  funding: number;
  material: number;
  pp: number;
  actionsRemaining: number;
  hasPassed: boolean;
}

export function ResourceBar({
  funding,
  material,
  pp,
  actionsRemaining,
  hasPassed,
}: ResourceBarProps) {
  return (
    <Panel className="flex flex-wrap items-center gap-4 p-3 sm:gap-6">
      <ResourceItem icon="funding" value={funding} label="Funding" />
      <ResourceItem icon="material" value={material} label="Material" />
      <ResourceItem icon="prestige" value={pp} label="Prestige" />
      <div className="ml-auto flex items-center gap-1.5">
        <span className="text-success font-bold">&#9654;</span>
        <span className="text-lg font-bold text-steel-100">{actionsRemaining}</span>
        <span className="stencil text-[10px] text-navy-400">
          {hasPassed ? "Passed" : "Actions"}
        </span>
      </div>
    </Panel>
  );
}

function ResourceItem({
  icon,
  value,
  label,
}: {
  icon: HudIconName;
  value: number;
  label: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <HudIcon name={icon} size={18} title={label} />
      <span className="text-lg font-bold text-steel-100">{value}</span>
      <span className="stencil text-[10px] text-navy-400">{label}</span>
    </div>
  );
}

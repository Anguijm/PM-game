"use client";

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
    <div className="flex flex-wrap gap-3 rounded-lg border border-navy-600 bg-navy-800 p-3 sm:gap-5">
      <ResourceItem icon="$" color="text-funding" value={funding} label="Funding" />
      <ResourceItem icon="&#9724;" color="text-material" value={material} label="Material" />
      <ResourceItem icon="&#9733;" color="text-prestige" value={pp} label="Prestige" />
      <div className="flex items-center gap-1.5">
        <span className="text-success font-bold">&#9654;</span>
        <span className="text-steel-100 font-bold">{actionsRemaining}</span>
        <span className="text-xs text-navy-400">
          {hasPassed ? "(Passed)" : "Actions"}
        </span>
      </div>
    </div>
  );
}

function ResourceItem({
  icon,
  color,
  value,
  label,
}: {
  icon: string;
  color: string;
  value: number;
  label: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`${color} font-bold`}>{icon}</span>
      <span className="text-steel-100 font-bold">{value}</span>
      <span className="text-xs text-navy-400">{label}</span>
    </div>
  );
}

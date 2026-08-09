import { cn } from "@/lib/cn";
import { DieColor } from "@/game/types";

export type HudIconName =
  | "hull"
  | "engineering"
  | "electrical"
  | "combat"
  | "support"
  | "funding"
  | "material"
  | "prestige";

/** Die discipline → HUD icon. */
export const DISCIPLINE_ICON: Record<DieColor, HudIconName> = {
  [DieColor.Red]: "hull",
  [DieColor.Blue]: "engineering",
  [DieColor.Yellow]: "electrical",
  [DieColor.Green]: "combat",
  [DieColor.Gray]: "support",
};

/** A glowing-amber naval HUD line icon (transparent PNG, composites on any dark surface). */
export function HudIcon({
  name,
  size = 20,
  className,
  title,
}: {
  name: HudIconName;
  size?: number;
  className?: string;
  title?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/images/ui/icons/${name}.png`}
      alt={title ?? name}
      width={size}
      height={size}
      draggable={false}
      className={cn("hud-icon inline-block select-none", className)}
      style={{ width: size, height: size }}
    />
  );
}

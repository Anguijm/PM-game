import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Ruggedized-HUD panel: brushed-steel texture, beveled frame, corner rivets.
 * The signature surface for Drydock Masters' in-game UI.
 */
export function Panel({
  children,
  className,
  rivets = true,
  as: Tag = "div" as ElementType,
}: {
  children: ReactNode;
  className?: string;
  rivets?: boolean;
  as?: ElementType;
}) {
  return (
    <Tag className={cn("dm-panel", className)}>
      {rivets && (
        <>
          <span className="dm-rivet" style={{ top: 6, left: 6 }} />
          <span className="dm-rivet" style={{ top: 6, right: 6 }} />
          <span className="dm-rivet" style={{ bottom: 6, left: 6 }} />
          <span className="dm-rivet" style={{ bottom: 6, right: 6 }} />
        </>
      )}
      {children}
    </Tag>
  );
}

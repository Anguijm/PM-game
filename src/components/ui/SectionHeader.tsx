import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Stencil military section header with an amber HUD rule underline. */
export function SectionHeader({
  children,
  right,
  className,
}: {
  children: ReactNode;
  right?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-2", className)}>
      <div className="flex items-center justify-between gap-2">
        <h3 className="stencil text-xs text-steel-100 sm:text-sm">{children}</h3>
        {right}
      </div>
      <div className="hud-rule mt-1" />
    </div>
  );
}

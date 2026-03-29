"use client";

import { cn } from "@/lib/cn";

export type MobileTab = "board" | "market" | "info";

interface MobileNavProps {
  activeTab: MobileTab;
  onTabChange: (tab: MobileTab) => void;
  marketNotification?: boolean;
  infoNotification?: boolean;
}

export function MobileNav({
  activeTab,
  onTabChange,
  marketNotification = false,
  infoNotification = false,
}: MobileNavProps) {
  const tabs: { id: MobileTab; label: string; notify?: boolean }[] = [
    { id: "board", label: "Board" },
    { id: "market", label: "Market", notify: marketNotification },
    { id: "info", label: "Info", notify: infoNotification },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 flex border-t border-navy-600 bg-navy-900 sm:hidden pb-safe"
      style={{ touchAction: "manipulation", paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "relative flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors",
            activeTab === tab.id
              ? "text-amber-400 bg-navy-800"
              : "text-navy-400"
          )}
          style={{ minHeight: 48 }}
        >
          {tab.label}
          {tab.notify && (
            <span className="absolute top-2 right-1/4 h-2 w-2 rounded-full bg-alert-red" />
          )}
        </button>
      ))}
    </nav>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { signOut } from "@/lib/api";
import { clsx } from "clsx";
import type { Employee } from "@/types";

type AdminTab = "schedule" | "swaps";

interface NavigationProps {
  employee: Employee | null;
  // Admin-only tab props
  activeTab?: AdminTab;
  onTabChange?: (tab: AdminTab) => void;
  pendingCount?: number;
}

export function Navigation({
  employee,
  activeTab,
  onTabChange,
  pendingCount,
}: NavigationProps) {
  const router = useRouter();
  const isAdmin = employee?.role === "admin";

  async function handleSignOut() {
    await signOut();
    router.push("/login");
  }

  return (
    <nav className="sticky top-0 z-50 glass border-b border-white/[0.06] pt-safe">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">

        {/* Left: Logo + Name — bei Admin auf Mobile ausgeblendet, bei Mitarbeiter immer sichtbar */}
        <div className={clsx("flex items-center gap-3 shrink-0", isAdmin && "hidden md:flex")}>
          <div className="w-8 h-8 rounded-xl bg-accent-blue flex items-center justify-center shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="3" y1="10" x2="21" y2="10" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="16" y1="2" x2="16" y2="6" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-white font-semibold text-sm leading-none">
              Dienstplan
            </p>
            {employee && (
              <p className="text-white/40 text-xs mt-0.5 truncate">
                {employee.name}
                {isAdmin && (
                  <span className="ml-1.5 text-accent-blue">· Admin</span>
                )}
              </p>
            )}
          </div>
        </div>

        {/* Center: Admin Tabs — auf Mobile volle Breite */}
        {isAdmin && onTabChange && activeTab && (
          <div className="flex-1 flex md:justify-center justify-start">
            <div className="inline-flex p-1 bg-white/[0.06] rounded-2xl">
              <NavTabButton
                active={activeTab === "schedule"}
                onClick={() => onTabChange("schedule")}
                label="Dienstplan"
                icon={
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                  </svg>
                }
              />
              <NavTabButton
                active={activeTab === "swaps"}
                onClick={() => onTabChange("swaps")}
                label="Tauschanfragen"
                badge={pendingCount}
                icon={
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M7 16V4m0 0L3 8m4-4l4 4" />
                    <path d="M17 8v12m0 0l4-4m-4 4l-4-4" />
                  </svg>
                }
              />
            </div>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={handleSignOut}
          className="text-white/40 hover:text-white/70 transition-colors p-2 rounded-xl hover:bg-white/[0.06] shrink-0"
          aria-label="Abmelden"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>
    </nav>
  );
}

function NavTabButton({
  active,
  onClick,
  label,
  icon,
  badge,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all",
        active
          ? "bg-white/[0.1] text-white shadow-apple-sm"
          : "text-white/40 hover:text-white/60"
      )}
    >
      {icon}
      {label}
      {badge != null && badge > 0 && (
        <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-accent-orange text-black text-[10px] font-bold leading-none">
          {badge}
        </span>
      )}
    </button>
  );
}

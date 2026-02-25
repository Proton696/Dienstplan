"use client";

import { useRouter, usePathname } from "next/navigation";
import { signOut } from "@/lib/api";
import type { Employee } from "@/types";

interface NavigationProps {
  employee: Employee | null;
}

export function Navigation({ employee }: NavigationProps) {
  const router = useRouter();
  const pathname = usePathname();

  async function handleSignOut() {
    await signOut();
    router.push("/login");
  }

  const isAdmin = employee?.role === "admin";

  return (
    <nav className="sticky top-0 z-50 glass border-b border-white/[0.06] pt-safe">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Left: App name + current user */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-accent-blue flex items-center justify-center shrink-0">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
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

        {/* Right: Navigation tabs + logout */}
        <div className="flex items-center gap-2">
          {isAdmin && (
            <button
              onClick={() =>
                router.push(pathname === "/admin" ? "/schedule" : "/admin")
              }
              className={`
                text-sm font-medium px-3 py-1.5 rounded-xl transition-all
                ${
                  pathname === "/admin"
                    ? "bg-accent-blue/20 text-accent-blue"
                    : "text-white/50 hover:text-white hover:bg-white/[0.06]"
                }
              `}
            >
              {pathname === "/admin" ? "Dienstplan" : "Admin"}
            </button>
          )}

          <button
            onClick={handleSignOut}
            className="text-white/40 hover:text-white/70 transition-colors p-2 rounded-xl hover:bg-white/[0.06]"
            aria-label="Abmelden"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
}

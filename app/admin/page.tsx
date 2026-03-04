"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useSchedule } from "@/hooks/useSchedule";
import { Navigation } from "@/components/Navigation";
import { WeekNavigator } from "@/components/WeekNavigator";
import { AdminShiftEditor } from "@/components/AdminShiftEditor";
import { SwapRequestsList } from "@/components/SwapRequestsList";
import { ScheduleValidation } from "@/components/ScheduleValidation";
import { AddEmployeeForm } from "@/components/AddEmployeeForm";
import { getWeekDays, nextWeek, prevWeek } from "@/lib/week";
import { fetchSwapRequests, signOut } from "@/lib/api";

type Tab = "schedule" | "swaps" | "employees";

export default function AdminPage() {
  const router = useRouter();
  const { user, employee, isAdmin, loading: authLoading } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState<Tab>("schedule");
  const [pendingCount, setPendingCount] = useState(0);

  const { rows, schedules, loading, error, refresh } = useSchedule(currentDate);
  const weekDays = getWeekDays(currentDate);

  const loadPendingCount = useCallback(async () => {
    try {
      const all = await fetchSwapRequests();
      setPendingCount(all.filter((r) => r.status === "pending").length);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    loadPendingCount();
  }, [loadPendingCount]);

  // Auth guard
  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      router.replace(user ? "/schedule" : "/login");
    }
  }, [authLoading, user, isAdmin, router]);

  async function handleSignOut() {
    await signOut();
    router.push("/login");
  }

  if (authLoading || !user || !isAdmin) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-black flex flex-col overflow-x-hidden">
      <Navigation
        employee={employee}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as Tab)}
        pendingCount={pendingCount}
      />

      <main className="max-w-7xl mx-auto w-full pb-20 md:pb-0 overflow-x-hidden">
        {activeTab === "schedule" && (
          <>
            <WeekNavigator
              currentDate={currentDate}
              onPrev={() => setCurrentDate(prevWeek(currentDate))}
              onNext={() => setCurrentDate(nextWeek(currentDate))}
              onToday={() => setCurrentDate(new Date())}
            />
            {error && (
              <div className="mx-4 mb-4 bg-accent-red/10 border border-accent-red/20 rounded-2xl px-4 py-3">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}
            {!loading && (
              <ScheduleValidation
                employees={rows.map((r) => r.employee)}
                schedules={schedules}
                weekDays={weekDays}
              />
            )}
            {loading ? (
              <ScheduleSkeleton />
            ) : (
              <AdminShiftEditor
                rows={rows}
                weekDays={weekDays}
                schedules={schedules}
                onRefresh={refresh}
              />
            )}
          </>
        )}

        {activeTab === "swaps" && (
          <div className="pt-4 overflow-x-hidden pb-24 md:pb-0">
            <SwapRequestsList
              currentDate={currentDate}
              onScheduleChange={() => {
                refresh();
                loadPendingCount();
              }}
            />
          </div>
        )}

        {activeTab === "employees" && (
          <div className="pt-4 px-4 pb-8">
            <AddEmployeeForm onSuccess={refresh} />
          </div>
        )}
      </main>

      {/* Mobile Footer mit Logout */}
      <footer className="md:hidden fixed bottom-0 left-0 right-0 py-3 px-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] z-40">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-[#1c1c1e] text-white/60 hover:text-white hover:bg-[#2c2c2e] transition-colors font-medium text-sm"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Abmelden
        </button>
      </footer>
    </div>
  );
}

function ScheduleSkeleton() {
  return (
    <div className="px-4 space-y-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="skeleton h-24 rounded-3xl" />
      ))}
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-white/10 border-t-accent-blue rounded-full animate-spin" />
        <p className="text-white/30 text-sm">Lädt…</p>
      </div>
    </div>
  );
}

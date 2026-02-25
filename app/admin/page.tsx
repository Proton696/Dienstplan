"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useSchedule } from "@/hooks/useSchedule";
import { Navigation } from "@/components/Navigation";
import { WeekNavigator } from "@/components/WeekNavigator";
import { AdminShiftEditor } from "@/components/AdminShiftEditor";
import { SwapRequestsList } from "@/components/SwapRequestsList";
import { getWeekDays, nextWeek, prevWeek } from "@/lib/week";
import { fetchSwapRequests } from "@/lib/api";

type Tab = "schedule" | "swaps";

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

  if (authLoading || !user || !isAdmin) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-black">
      <Navigation
        employee={employee}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        pendingCount={pendingCount}
      />

      <main className="max-w-5xl mx-auto">
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
          <div className="pt-4">
            <SwapRequestsList
              currentDate={currentDate}
              onScheduleChange={() => {
                refresh();
                loadPendingCount();
              }}
            />
          </div>
        )}
      </main>
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

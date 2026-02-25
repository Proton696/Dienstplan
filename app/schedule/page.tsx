"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useSchedule } from "@/hooks/useSchedule";
import { Navigation } from "@/components/Navigation";
import { WeekNavigator } from "@/components/WeekNavigator";
import { WeeklySchedule } from "@/components/WeeklySchedule";
import { getWeekDays, nextWeek, prevWeek } from "@/lib/week";
import { fetchMySwapRequests } from "@/lib/api";
import type { ShiftSwapRequest } from "@/types";
import { clsx } from "clsx";

export default function SchedulePage() {
  const router = useRouter();
  const { user, employee, loading: authLoading } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [myRequests, setMyRequests] = useState<ShiftSwapRequest[]>([]);

  const { rows, schedules, loading, error, refresh } = useSchedule(currentDate);
  const weekDays = getWeekDays(currentDate);

  // Auth guard
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [authLoading, user, router]);

  // Load own swap requests
  useEffect(() => {
    if (!employee) return;
    fetchMySwapRequests(employee.id).then(setMyRequests).catch(() => {});
  }, [employee]);

  if (authLoading || !user) {
    return <LoadingScreen />;
  }

  const pendingRequests = myRequests.filter((r) => r.status === "pending");

  return (
    <div className="min-h-screen bg-black">
      <Navigation employee={employee} />

      <main className="max-w-5xl mx-auto">
        {/* Week Navigator */}
        <WeekNavigator
          currentDate={currentDate}
          onPrev={() => setCurrentDate(prevWeek(currentDate))}
          onNext={() => setCurrentDate(nextWeek(currentDate))}
          onToday={() => setCurrentDate(new Date())}
        />

        {/* My pending swap requests banner */}
        {pendingRequests.length > 0 && (
          <div className="mx-4 mb-4 glass rounded-2xl px-4 py-3 flex items-center gap-3 border border-accent-orange/20 animate-fade-in">
            <div className="w-2 h-2 rounded-full bg-accent-orange animate-pulse shrink-0" />
            <p className="text-sm text-white/70">
              <span className="text-white font-medium">
                {pendingRequests.length} Tauschanfrage
                {pendingRequests.length > 1 ? "n" : ""}
              </span>{" "}
              ausstehend · Warten auf Admin
            </p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="mx-4 mb-4 bg-accent-red/10 border border-accent-red/20 rounded-2xl px-4 py-3">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Loading skeleton */}
        {loading ? (
          <ScheduleSkeleton />
        ) : (
          <WeeklySchedule
            rows={rows}
            weekDays={weekDays}
            currentEmployee={employee}
            schedules={schedules}
            onRefresh={refresh}
          />
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

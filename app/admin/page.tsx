"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useSchedule } from "@/hooks/useSchedule";
import { Navigation } from "@/components/Navigation";
import { WeekNavigator } from "@/components/WeekNavigator";
import { AdminShiftEditor } from "@/components/AdminShiftEditor";
import { SwapRequestsList } from "@/components/SwapRequestsList";
import { getWeekDays, nextWeek, prevWeek } from "@/lib/week";
import { clsx } from "clsx";

type Tab = "schedule" | "swaps";

export default function AdminPage() {
  const router = useRouter();
  const { user, employee, isAdmin, loading: authLoading } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState<Tab>("schedule");

  const { rows, schedules, loading, error, refresh } = useSchedule(currentDate);
  const weekDays = getWeekDays(currentDate);

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
      <Navigation employee={employee} />

      <main className="max-w-5xl mx-auto">
        {/* Tab Bar */}
        <div className="px-4 pt-4 pb-2">
          <div className="inline-flex p-1 bg-white/[0.06] rounded-2xl">
            <TabButton
              active={activeTab === "schedule"}
              onClick={() => setActiveTab("schedule")}
              label="Dienstplan"
              icon={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                </svg>
              }
            />
            <TabButton
              active={activeTab === "swaps"}
              onClick={() => setActiveTab("swaps")}
              label="Tauschanfragen"
              icon={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M7 16V4m0 0L3 8m4-4l4 4" />
                  <path d="M17 8v12m0 0l4-4m-4 4l-4-4" />
                </svg>
              }
            />
          </div>
        </div>

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
              onScheduleChange={refresh}
            />
          </div>
        )}
      </main>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  label,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all",
        active
          ? "bg-white/[0.1] text-white shadow-apple-sm"
          : "text-white/40 hover:text-white/60"
      )}
    >
      {icon}
      {label}
    </button>
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

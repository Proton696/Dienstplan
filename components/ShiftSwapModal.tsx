"use client";

import { useState } from "react";
import { clsx } from "clsx";
import { ShiftBadge } from "./ShiftBadge";
import { createSwapRequest } from "@/lib/api";
import type { Employee, Schedule, WeekDay } from "@/types";

interface ShiftSwapModalProps {
  currentEmployee: Employee;
  allEmployees: Employee[];
  schedules: Schedule[];
  selectedDate: string;
  weekDays: WeekDay[];
  onClose: () => void;
  onSuccess: () => void;
}

export function ShiftSwapModal({
  currentEmployee,
  allEmployees,
  schedules,
  selectedDate,
  weekDays,
  onClose,
  onSuccess,
}: ShiftSwapModalProps) {
  const [step, setStep] = useState<"select-employee" | "select-day" | "confirm">(
    "select-employee"
  );
  const [targetEmployee, setTargetEmployee] = useState<Employee | null>(null);
  const [targetDate, setTargetDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mySchedule = schedules.find(
    (s) => s.employee_id === currentEmployee.id && s.date === selectedDate
  );

  const otherEmployees = allEmployees.filter(
    (e) => e.id !== currentEmployee.id && e.role !== "admin"
  );

  function getSchedule(employeeId: string, dateStr: string): Schedule | null {
    return (
      schedules.find(
        (s) => s.employee_id === employeeId && s.date === dateStr
      ) ?? null
    );
  }

  function getWeekDay(dateStr: string): WeekDay | undefined {
    return weekDays.find((d) => d.dateString === dateStr);
  }

  async function handleConfirm() {
    if (!targetEmployee || !targetDate) return;
    setError(null);
    setLoading(true);
    try {
      await createSwapRequest({
        fromEmployeeId: currentEmployee.id,
        toEmployeeId: targetEmployee.id,
        fromDate: selectedDate,
        toDate: targetDate,
      });
      onSuccess();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Anfrage konnte nicht gesendet werden."
      );
    } finally {
      setLoading(false);
    }
  }

  const targetSchedule =
    targetDate && targetEmployee
      ? getSchedule(targetEmployee.id, targetDate)
      : null;

  const myDay = getWeekDay(selectedDate);

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 pb-safe">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="relative w-full max-w-sm bg-surface-secondary rounded-3xl shadow-apple-lg animate-slide-up overflow-hidden">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 md:hidden">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <div>
            <h2 className="text-white font-semibold text-base">
              Schichttausch anfragen
            </h2>
            <p className="text-white/40 text-xs mt-0.5">
              Meine Schicht: {myDay?.fullLabel} ·{" "}
              {mySchedule ? (
                <ShiftBadge shift={mySchedule.shift_type} size="sm" />
              ) : (
                "–"
              )}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/[0.07] text-white/50 hover:text-white transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 px-5 py-3">
          {["select-employee", "select-day", "confirm"].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={clsx(
                  "w-2 h-2 rounded-full transition-all",
                  step === s
                    ? "bg-accent-blue scale-125"
                    : ["select-employee", "select-day", "confirm"].indexOf(step) > i
                    ? "bg-accent-blue/40"
                    : "bg-white/20"
                )}
              />
              {i < 2 && <div className="flex-1 h-px bg-white/10 w-6" />}
            </div>
          ))}
          <span className="ml-auto text-xs text-white/30">
            {step === "select-employee" && "Kollege wählen"}
            {step === "select-day" && "Tag wählen"}
            {step === "confirm" && "Bestätigen"}
          </span>
        </div>

        {/* Content */}
        <div className="px-5 pb-5 max-h-[60vh] overflow-y-auto">
          {/* Step 1: Select employee */}
          {step === "select-employee" && (
            <div className="space-y-2">
              <p className="text-white/50 text-sm mb-3">
                Mit wem möchtest du tauschen?
              </p>
              {otherEmployees.map((emp) => (
                <button
                  key={emp.id}
                  onClick={() => {
                    setTargetEmployee(emp);
                    setStep("select-day");
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/[0.05] hover:bg-white/[0.09] active:bg-white/[0.04] transition-all text-left"
                >
                  <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-sm font-semibold text-white/60 shrink-0">
                    {emp.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </div>
                  <span className="text-white font-medium">{emp.name}</span>
                  <svg
                    className="ml-auto text-white/20"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              ))}
            </div>
          )}

          {/* Step 2: Select day */}
          {step === "select-day" && targetEmployee && (
            <div>
              <p className="text-white/50 text-sm mb-3">
                Welchen Tag von{" "}
                <span className="text-white font-medium">
                  {targetEmployee.name}
                </span>{" "}
                möchtest du tauschen?
              </p>
              <div className="space-y-2">
                {weekDays.map((day) => {
                  const schedule = getSchedule(targetEmployee.id, day.dateString);
                  if (!schedule || schedule.shift_type === "frei") return null;

                  return (
                    <button
                      key={day.dateString}
                      onClick={() => {
                        setTargetDate(day.dateString);
                        setStep("confirm");
                      }}
                      className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-white/[0.05] hover:bg-white/[0.09] active:bg-white/[0.04] transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={clsx(
                            "w-9 h-9 rounded-xl flex flex-col items-center justify-center",
                            day.isToday ? "bg-accent-blue" : "bg-white/10"
                          )}
                        >
                          <span className="text-[10px] font-bold text-white/60 uppercase leading-none">
                            {day.label}
                          </span>
                          <span className="text-sm font-bold text-white leading-none mt-0.5">
                            {day.date.getDate()}
                          </span>
                        </div>
                        <span className="text-white/70 text-sm">
                          {day.fullLabel}
                        </span>
                      </div>
                      <ShiftBadge shift={schedule.shift_type} size="sm" />
                    </button>
                  );
                })}
                {weekDays.every((day) => {
                  const s = getSchedule(targetEmployee.id, day.dateString);
                  return !s || s.shift_type === "frei";
                }) && (
                  <p className="text-white/30 text-sm text-center py-4">
                    Keine tauschbaren Schichten diese Woche
                  </p>
                )}
              </div>
              <button
                onClick={() => setStep("select-employee")}
                className="mt-3 text-sm text-white/40 hover:text-white/70 transition-colors"
              >
                ← Zurück
              </button>
            </div>
          )}

          {/* Step 3: Confirm */}
          {step === "confirm" && targetEmployee && targetDate && (
            <div>
              <p className="text-white/50 text-sm mb-4">
                Bitte überprüfe deine Tauschanfrage:
              </p>

              {/* Swap visualization */}
              <div className="bg-white/[0.04] rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-accent-blue flex items-center justify-center text-xs font-bold text-white shrink-0">
                    {currentEmployee.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white/40">Du gibst ab</p>
                    <p className="text-white text-sm font-medium">
                      {myDay?.fullLabel}
                    </p>
                  </div>
                  <ShiftBadge shift={mySchedule?.shift_type ?? null} />
                </div>

                <div className="flex justify-center text-white/20">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M7 16V4m0 0L3 8m4-4l4 4" />
                    <path d="M17 8v12m0 0l4-4m-4 4l-4-4" />
                  </svg>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white/60 shrink-0">
                    {targetEmployee.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white/40">
                      {targetEmployee.name} gibt ab
                    </p>
                    <p className="text-white text-sm font-medium">
                      {getWeekDay(targetDate)?.fullLabel}
                    </p>
                  </div>
                  <ShiftBadge shift={targetSchedule?.shift_type ?? null} />
                </div>
              </div>

              <p className="text-xs text-white/30 mt-3 text-center">
                Der Admin muss den Tausch noch bestätigen
              </p>

              {error && (
                <div className="mt-3 bg-accent-red/10 border border-accent-red/20 rounded-xl px-4 py-3">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setStep("select-day")}
                  className="flex-1 py-3 rounded-2xl bg-white/[0.06] text-white/60 font-medium text-sm hover:bg-white/[0.1] transition-all"
                >
                  Zurück
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={loading}
                  className="flex-1 py-3 rounded-2xl bg-accent-blue text-white font-semibold text-sm hover:bg-blue-500 transition-all active:scale-95 disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Senden…
                    </span>
                  ) : (
                    "Anfrage senden"
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { clsx } from "clsx";
import { ShiftBadge } from "./ShiftBadge";
import { createSwapRequest } from "@/lib/api";
import { canSwapWith } from "@/types";
import type { Employee, Schedule, WeekDay } from "@/types";
import { format } from "date-fns";
import { de } from "date-fns/locale";

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
  const [step, setStep] = useState<"select-employee" | "confirm">(
    "select-employee"
  );
  const [targetEmployee, setTargetEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mySchedule = schedules.find(
    (s) => s.employee_id === currentEmployee.id && s.date === selectedDate
  );

  const selectedDay = weekDays.find((d) => d.dateString === selectedDate);

  // Nur kompatible Kollegen (gleicher Typ) ohne Admin, die an diesem Tag eine nicht-freie Schicht haben
  const compatibleColleagues = allEmployees.filter((e) => {
    if (e.id === currentEmployee.id) return false;
    if (e.role === "admin") return false;
    if (!canSwapWith(currentEmployee.role, e.role)) return false;

    const theirShift = schedules.find(
      (s) => s.employee_id === e.id && s.date === selectedDate
    );
    return theirShift && theirShift.shift_type !== "frei";
  });

  function getColleagueSchedule(employeeId: string): Schedule | null {
    return schedules.find(
      (s) => s.employee_id === employeeId && s.date === selectedDate
    ) ?? null;
  }

  async function handleConfirm() {
    if (!targetEmployee) return;
    setError(null);
    setLoading(true);
    try {
      await createSwapRequest({
        fromEmployeeId: currentEmployee.id,
        toEmployeeId: targetEmployee.id,
        fromDate: selectedDate,
        toDate: selectedDate, // gleicher Tag
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

  const targetSchedule = targetEmployee
    ? getColleagueSchedule(targetEmployee.id)
    : null;

  const roleLabel = currentEmployee.role === "assistent" ? "Assistent" : "Händler";

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 pb-safe">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Sheet */}
      <div className="relative w-full max-w-sm bg-surface-secondary rounded-3xl shadow-apple-lg animate-slide-up overflow-hidden">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 md:hidden">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <div>
            <h2 className="text-white font-semibold text-base">Schichttausch anfragen</h2>
            <p className="text-white/40 text-xs mt-0.5">
              {selectedDay?.fullLabel} · Meine Schicht:{" "}
              <span className="inline-block">
                <ShiftBadge shift={mySchedule?.shift_type ?? null} size="sm" />
              </span>
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

        {/* Content */}
        <div className="px-5 pb-5 max-h-[60vh] overflow-y-auto">

          {/* Step 1: Kollege auswählen */}
          {step === "select-employee" && (
            <div className="pt-4 space-y-2">
              <p className="text-white/50 text-sm mb-3">
                Mit wem möchtest du tauschen?{" "}
                <span className="text-white/30 text-xs">({roleLabel})</span>
              </p>

              {compatibleColleagues.length === 0 ? (
                <div className="py-6 text-center">
                  <p className="text-white/30 text-sm">
                    Kein passender Kollege verfügbar
                  </p>
                  <p className="text-white/20 text-xs mt-1">
                    Nur {roleLabel}s mit einer Schicht heute
                  </p>
                </div>
              ) : (
                compatibleColleagues.map((emp) => {
                  const theirShift = getColleagueSchedule(emp.id);
                  return (
                    <button
                      key={emp.id}
                      onClick={() => {
                        setTargetEmployee(emp);
                        setStep("confirm");
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/[0.05] hover:bg-white/[0.09] active:bg-white/[0.04] transition-all text-left"
                    >
                      <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-sm font-semibold text-white/60 shrink-0">
                        {emp.name[0]}
                      </div>
                      <span className="text-white font-medium flex-1">{emp.name}</span>
                      <ShiftBadge shift={theirShift?.shift_type ?? null} size="sm" />
                      <svg className="text-white/20 shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </button>
                  );
                })
              )}
            </div>
          )}

          {/* Step 2: Bestätigen */}
          {step === "confirm" && targetEmployee && (
            <div className="pt-4">
              <p className="text-white/50 text-sm mb-4">
                Bitte überprüfe deine Tauschanfrage:
              </p>

              {/* Swap-Visualisierung */}
              <div className="bg-white/[0.04] rounded-2xl p-4 space-y-3">
                {/* Tag */}
                <div className="text-center pb-2 border-b border-white/[0.06]">
                  <span className="text-white/60 text-xs font-semibold uppercase tracking-wide">
                    {selectedDay?.fullLabel}, {format(new Date(selectedDate), "d. MMM", { locale: de })}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-accent-blue flex items-center justify-center text-xs font-bold text-white shrink-0">
                    {currentEmployee.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white/40">Du gibst ab</p>
                    <p className="text-white text-sm font-medium">{currentEmployee.name}</p>
                  </div>
                  <ShiftBadge shift={mySchedule?.shift_type ?? null} />
                </div>

                <div className="flex justify-center text-white/20 text-xl">⇅</div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white/60 shrink-0">
                    {targetEmployee.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white/40">{targetEmployee.name} gibt ab</p>
                    <p className="text-white text-sm font-medium">{targetEmployee.name}</p>
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
                  onClick={() => setStep("select-employee")}
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

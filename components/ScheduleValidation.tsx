"use client";

import { clsx } from "clsx";
import type { Employee, Schedule, WeekDay } from "@/types";

interface ScheduleValidationProps {
  employees: Employee[];
  schedules: Schedule[];
  weekDays: WeekDay[];
}

interface DayValidation {
  day: WeekDay;
  hasFrüh: boolean;
  hasSpät: boolean;
  ok: boolean;
}

export function ScheduleValidation({
  employees,
  schedules,
  weekDays,
}: ScheduleValidationProps) {
  const händler = employees.filter(
    (e) => e.role === "händler" || e.role === "admin"
  );

  const validations: DayValidation[] = weekDays.map((day) => {
    const daySchedules = schedules.filter(
      (s) =>
        s.date === day.dateString &&
        händler.some((h) => h.id === s.employee_id)
    );

    const hasFrüh = daySchedules.some((s) => s.shift_type === "Früh");
    const hasSpät = daySchedules.some((s) => s.shift_type === "Spät");

    return { day, hasFrüh, hasSpät, ok: hasFrüh && hasSpät };
  });

  const warnings = validations.filter((v) => !v.ok);

  if (warnings.length === 0) return null;

  return (
    <div className="mx-4 mb-4 bg-accent-orange/10 border border-accent-orange/20 rounded-2xl p-4 animate-fade-in">
      <div className="flex items-center gap-2 mb-3">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ff9f0a" strokeWidth="2" strokeLinecap="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        <span className="text-orange-400 text-sm font-semibold">
          Händler-Abdeckung unvollständig
        </span>
      </div>

      <div className="space-y-1.5">
        {warnings.map(({ day, hasFrüh, hasSpät }) => (
          <div key={day.dateString} className="flex items-center gap-3 text-sm">
            <span className="text-white/60 w-20 shrink-0">{day.fullLabel}</span>
            <div className="flex gap-2">
              <span
                className={clsx(
                  "text-xs px-2 py-0.5 rounded-lg font-medium",
                  hasFrüh
                    ? "bg-accent-green/10 text-green-400"
                    : "bg-accent-red/10 text-red-400"
                )}
              >
                Früh {hasFrüh ? "✓" : "fehlt"}
              </span>
              <span
                className={clsx(
                  "text-xs px-2 py-0.5 rounded-lg font-medium",
                  hasSpät
                    ? "bg-accent-green/10 text-green-400"
                    : "bg-accent-red/10 text-red-400"
                )}
              >
                Spät {hasSpät ? "✓" : "fehlt"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

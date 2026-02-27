"use client";

import { useState, useMemo } from "react";
import { clsx } from "clsx";
import { ShiftBadge } from "./ShiftBadge";
import { ShiftSwapModal } from "./ShiftSwapModal";
import { getWeekDays } from "@/lib/week";
import type { Employee, Schedule, ScheduleRow, WeekDay } from "@/types";

interface WeeklyScheduleProps {
  rows: ScheduleRow[];
  weekDays: WeekDay[];
  currentEmployee: Employee | null;
  schedules: Schedule[];
  onRefresh: () => void;
}

export function WeeklySchedule({
  rows,
  weekDays,
  currentEmployee,
  schedules,
  onRefresh,
}: WeeklyScheduleProps) {
  const [swapTarget, setSwapTarget] = useState<{
    date: string;
    shiftId: string;
  } | null>(null);

  const isEmployee = currentEmployee?.role === "assistent" || currentEmployee?.role === "händler";

  function getScheduleForEmployee(
    employeeId: string,
    dateString: string
  ): Schedule | null {
    return (
      schedules.find(
        (s) => s.employee_id === employeeId && s.date === dateString
      ) ?? null
    );
  }

  function handleCellClick(date: string, schedule: Schedule | null) {
    if (!isEmployee || !currentEmployee) return;
    if (!schedule) return;
    // Only allow swap on own shifts
    if (schedule.employee_id !== currentEmployee.id) return;

    setSwapTarget({ date, shiftId: schedule.id });
  }

  return (
    <>
      {/* Mobile: Card-based layout */}
      <div className="block md:hidden space-y-3 px-4 pb-8">
        {rows.map((row) => (
          <MobileEmployeeCard
            key={row.employee.id}
            row={row}
            weekDays={weekDays}
            currentEmployee={currentEmployee}
            schedules={schedules}
            onSwapClick={handleCellClick}
          />
        ))}
      </div>

      {/* Desktop: Table layout */}
      <div className="hidden md:block px-4 pb-8">
        <div className="glass rounded-3xl overflow-hidden shadow-apple">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left px-5 py-4 text-xs font-semibold text-white/40 uppercase tracking-wider w-36">
                  Mitarbeiter
                </th>
                {weekDays.map((day) => (
                  <th
                    key={day.dateString}
                    className={clsx(
                      "px-3 py-4 text-center text-xs font-semibold uppercase tracking-wider",
                      day.isToday ? "text-accent-blue" : "text-white/40"
                    )}
                  >
                    <span className="block">{day.label}</span>
                    <span
                      className={clsx(
                        "inline-flex items-center justify-center w-6 h-6 rounded-full mt-1 text-sm font-bold",
                        day.isToday
                          ? "bg-accent-blue text-white"
                          : "text-white/60 font-normal"
                      )}
                    >
                      {day.date.getDate()}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIdx) => {
                const isMe = row.employee.id === currentEmployee?.id;
                return (
                  <tr
                    key={row.employee.id}
                    className={clsx(
                      "border-b border-white/[0.04] last:border-0 transition-colors",
                      isMe && "bg-accent-blue/[0.04]"
                    )}
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <Avatar name={row.employee.name} isMe={isMe} />
                        <span
                          className={clsx(
                            "text-sm font-medium truncate",
                            isMe ? "text-white" : "text-white/70"
                          )}
                        >
                          {row.employee.name}
                        </span>
                      </div>
                    </td>
                    {weekDays.map((day) => {
                      const schedule = getScheduleForEmployee(
                        row.employee.id,
                        day.dateString
                      );
                      const canSwap =
                        isEmployee &&
                        isMe &&
                        schedule !== null &&
                        schedule.shift_type !== "frei";

                      return (
                        <td
                          key={day.dateString}
                          className={clsx(
                            "px-2 py-3 text-center",
                            canSwap &&
                              "cursor-pointer hover:bg-white/[0.03] rounded-xl"
                          )}
                          onClick={() =>
                            canSwap && handleCellClick(day.dateString, schedule)
                          }
                        >
                          <div className="flex justify-center">
                            <ShiftBadge shift={schedule?.shift_type ?? null} />
                          </div>
                          {canSwap && (
                            <p className="text-[10px] text-white/20 mt-1">
                              Tausch
                            </p>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Swap Modal */}
      {swapTarget && currentEmployee && (
        <ShiftSwapModal
          currentEmployee={currentEmployee}
          allEmployees={rows.map((r) => r.employee)}
          schedules={schedules}
          selectedDate={swapTarget.date}
          weekDays={weekDays}
          onClose={() => setSwapTarget(null)}
          onSuccess={() => {
            setSwapTarget(null);
            onRefresh();
          }}
        />
      )}
    </>
  );
}

// ─── Mobile Card ──────────────────────────────────────────────────────────────

function MobileEmployeeCard({
  row,
  weekDays,
  currentEmployee,
  schedules,
  onSwapClick,
}: {
  row: ScheduleRow;
  weekDays: WeekDay[];
  currentEmployee: Employee | null;
  schedules: Schedule[];
  onSwapClick: (date: string, schedule: Schedule | null) => void;
}) {
  const isMe = row.employee.id === currentEmployee?.id;
  const isEmployee = currentEmployee?.role === "assistent" || currentEmployee?.role === "händler";

  function getSchedule(dateString: string): Schedule | null {
    return (
      schedules.find(
        (s) => s.employee_id === row.employee.id && s.date === dateString
      ) ?? null
    );
  }

  return (
    <div
      className={clsx(
        "rounded-3xl overflow-hidden shadow-apple-sm",
        isMe ? "bg-surface-secondary border border-accent-blue/20" : "glass"
      )}
    >
      {/* Employee Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06]">
        <Avatar name={row.employee.name} isMe={isMe} size="sm" />
        <div>
          <p
            className={clsx(
              "text-sm font-semibold",
              isMe ? "text-white" : "text-white/80"
            )}
          >
            {row.employee.name}
            {isMe && (
              <span className="ml-1.5 text-xs text-accent-blue font-normal">
                (Du)
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Shifts Grid */}
      <div className="grid grid-cols-5 divide-x divide-white/[0.05]">
        {weekDays.map((day) => {
          const schedule = getSchedule(day.dateString);
          const canSwap =
            isEmployee &&
            isMe &&
            schedule !== null &&
            schedule.shift_type !== "frei";

          return (
            <button
              key={day.dateString}
              className={clsx(
                "flex flex-col items-center gap-1.5 py-3 px-1 transition-colors",
                canSwap ? "active:bg-white/[0.06]" : "cursor-default",
                day.isToday && "bg-accent-blue/[0.04]"
              )}
              onClick={() => canSwap && onSwapClick(day.dateString, schedule)}
              disabled={!canSwap}
            >
              <span
                className={clsx(
                  "text-[10px] font-semibold uppercase tracking-wide",
                  day.isToday ? "text-accent-blue" : "text-white/30"
                )}
              >
                {day.label}
              </span>
              <span
                className={clsx(
                  "flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold",
                  day.isToday
                    ? "bg-accent-blue text-white"
                    : "text-white/40"
                )}
              >
                {day.date.getDate()}
              </span>
              <ShiftBadge
                shift={schedule?.shift_type ?? null}
                size="sm"
              />
              {canSwap && (
                <span className="text-[9px] text-accent-blue/60">↔ Tausch</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({
  name,
  isMe,
  size = "md",
}: {
  name: string;
  isMe: boolean;
  size?: "sm" | "md";
}) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className={clsx(
        "rounded-full flex items-center justify-center font-semibold shrink-0",
        size === "sm" ? "w-7 h-7 text-[10px]" : "w-8 h-8 text-xs",
        isMe
          ? "bg-accent-blue text-white"
          : "bg-white/10 text-white/60"
      )}
    >
      {initials}
    </div>
  );
}

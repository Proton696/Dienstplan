"use client";

import { useState } from "react";
import { clsx } from "clsx";
import { ShiftBadge, SHIFT_TYPES, getShiftConfig } from "./ShiftBadge";
import { upsertSchedule } from "@/lib/api";
import type { Employee, Schedule, ScheduleRow, WeekDay, ShiftType } from "@/types";

interface AdminShiftEditorProps {
  rows: ScheduleRow[];
  weekDays: WeekDay[];
  schedules: Schedule[];
  onRefresh: () => void;
}

interface EditingCell {
  employeeId: string;
  employeeName: string;
  dateString: string;
  dayLabel: string;
  current: ShiftType | null;
}

export function AdminShiftEditor({
  rows,
  weekDays,
  schedules,
  onRefresh,
}: AdminShiftEditorProps) {
  const [editing, setEditing] = useState<EditingCell | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedCell, setSavedCell] = useState<string | null>(null);

  function getSchedule(employeeId: string, dateStr: string): Schedule | null {
    return schedules.find(
      (s) => s.employee_id === employeeId && s.date === dateStr
    ) ?? null;
  }

  async function handleShiftSelect(shift: ShiftType) {
    if (!editing) return;
    setSaving(true);
    try {
      await upsertSchedule(editing.employeeId, editing.dateString, shift);
      setSavedCell(`${editing.employeeId}_${editing.dateString}`);
      setTimeout(() => setSavedCell(null), 1500);
      onRefresh();
      setEditing(null);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  const nonAdminRows = rows.filter((r) => r.employee.role !== "admin");

  return (
    <>
      {/* Mobile */}
      <div className="block md:hidden space-y-3 px-4 pb-6">
        {nonAdminRows.map((row) => (
          <div key={row.employee.id} className="glass rounded-3xl overflow-hidden shadow-apple-sm">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06]">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-semibold text-white/60 shrink-0">
                {row.employee.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
              </div>
              <span className="text-white font-semibold text-sm">{row.employee.name}</span>
            </div>
            <div className="grid grid-cols-5 divide-x divide-white/[0.05]">
              {weekDays.map((day) => {
                const schedule = getSchedule(row.employee.id, day.dateString);
                const key = `${row.employee.id}_${day.dateString}`;
                const justSaved = savedCell === key;

                return (
                  <button
                    key={day.dateString}
                    onClick={() =>
                      setEditing({
                        employeeId: row.employee.id,
                        employeeName: row.employee.name,
                        dateString: day.dateString,
                        dayLabel: day.fullLabel,
                        current: schedule?.shift_type ?? null,
                      })
                    }
                    className={clsx(
                      "flex flex-col items-center gap-1.5 py-3 px-1 transition-colors active:bg-white/[0.06]",
                      day.isToday && "bg-accent-blue/[0.04]",
                      justSaved && "bg-accent-green/10"
                    )}
                  >
                    <span className={clsx("text-[10px] font-semibold uppercase tracking-wide", day.isToday ? "text-accent-blue" : "text-white/30")}>
                      {day.label}
                    </span>
                    <span className={clsx("flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold", day.isToday ? "bg-accent-blue text-white" : "text-white/40")}>
                      {day.date.getDate()}
                    </span>
                    <ShiftBadge shift={schedule?.shift_type ?? null} size="sm" />
                    {justSaved && (
                      <span className="text-[9px] text-accent-green">✓</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop */}
      <div className="hidden md:block px-4 pb-6">
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
                    <span className={clsx("inline-flex items-center justify-center w-6 h-6 rounded-full mt-1 text-sm font-bold", day.isToday ? "bg-accent-blue text-white" : "text-white/60 font-normal")}>
                      {day.date.getDate()}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {nonAdminRows.map((row) => (
                <tr key={row.employee.id} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-semibold text-white/60 shrink-0">
                        {row.employee.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </div>
                      <span className="text-sm font-medium text-white/80 truncate">
                        {row.employee.name}
                      </span>
                    </div>
                  </td>
                  {weekDays.map((day) => {
                    const schedule = getSchedule(row.employee.id, day.dateString);
                    const key = `${row.employee.id}_${day.dateString}`;
                    const justSaved = savedCell === key;

                    return (
                      <td
                        key={day.dateString}
                        className={clsx(
                          "px-2 py-2 text-center cursor-pointer rounded-xl transition-all",
                          justSaved && "bg-accent-green/10"
                        )}
                        onClick={() =>
                          setEditing({
                            employeeId: row.employee.id,
                            employeeName: row.employee.name,
                            dateString: day.dateString,
                            dayLabel: day.fullLabel,
                            current: schedule?.shift_type ?? null,
                          })
                        }
                      >
                        <div className="flex flex-col items-center gap-1 group">
                          <ShiftBadge shift={schedule?.shift_type ?? null} />
                          <span className="text-[10px] text-white/0 group-hover:text-white/30 transition-colors">
                            Bearbeiten
                          </span>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Sheet */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 pb-safe">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setEditing(null)} />
          <div className="relative w-full max-w-xs bg-surface-secondary rounded-3xl shadow-apple-lg animate-slide-up overflow-hidden">
            <div className="flex justify-center pt-3 pb-1 md:hidden">
              <div className="w-10 h-1 rounded-full bg-white/20" />
            </div>
            <div className="px-5 pt-4 pb-2 border-b border-white/[0.06]">
              <p className="text-white font-semibold">{editing.employeeName}</p>
              <p className="text-white/40 text-sm">{editing.dayLabel} · Schicht wählen</p>
            </div>
            <div className="p-4 grid grid-cols-2 gap-2">
              {SHIFT_TYPES.map((shift) => {
                const config = getShiftConfig(shift);
                const isActive = editing.current === shift;
                return (
                  <button
                    key={shift}
                    onClick={() => handleShiftSelect(shift)}
                    disabled={saving}
                    className={clsx(
                      "flex items-center gap-2.5 px-4 py-3 rounded-2xl font-semibold text-sm transition-all active:scale-95",
                      isActive
                        ? `${config.bg} ${config.text} ring-1 ring-current/30`
                        : "bg-white/[0.05] text-white/60 hover:bg-white/[0.09]"
                    )}
                  >
                    <span className={clsx("w-2 h-2 rounded-full", config.dot)} />
                    {config.label}
                    {isActive && (
                      <svg className="ml-auto" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
            <div className="px-4 pb-5">
              <button onClick={() => setEditing(null)} className="w-full py-3 rounded-2xl bg-white/[0.06] text-white/50 text-sm font-medium hover:bg-white/[0.09] transition-all">
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

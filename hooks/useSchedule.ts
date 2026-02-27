"use client";

import { useEffect, useState, useCallback } from "react";
import { fetchWeekSchedules, fetchEmployees } from "@/lib/api";
import { getWeekRange } from "@/lib/week";
import type { Employee, Schedule, ScheduleRow } from "@/types";

interface UseScheduleResult {
  rows: ScheduleRow[];
  employees: Employee[];
  schedules: Schedule[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useSchedule(referenceDate: Date): UseScheduleResult {
  const [rows, setRows] = useState<ScheduleRow[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const { start, end } = getWeekRange(referenceDate);

    Promise.all([fetchEmployees(), fetchWeekSchedules(start, end)])
      .then(([emps, scheds]) => {
        if (cancelled) return;
        setEmployees(emps);
        setSchedules(scheds);

        // Build rows: one per employee
        const scheduleMap: Record<string, Schedule> = {};
        for (const s of scheds) {
          scheduleMap[`${s.employee_id}_${s.date}`] = s;
        }

        const builtRows: ScheduleRow[] = emps.map((emp) => {
          const shifts: Record<string, Schedule | null> = {};
          // We'll fill the actual date keys in the component
          for (const s of scheds) {
            if (s.employee_id === emp.id) {
              shifts[s.date] = s;
            }
          }
          return { employee: emp, shifts };
        });

        setRows(builtRows);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message ?? "Fehler beim Laden");
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [referenceDate, tick]);

  return { rows, employees, schedules, loading, error, refresh };
}

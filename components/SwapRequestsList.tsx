"use client";

import { useState, useEffect, useCallback } from "react";
import { clsx } from "clsx";
import { ShiftBadge } from "./ShiftBadge";
import {
  fetchSwapRequests,
  updateSwapRequestStatus,
  upsertSchedule,
  fetchWeekSchedules,
  fetchSchedulesByDates,
} from "@/lib/api";
import { getWeekRange } from "@/lib/week";
import type { ShiftSwapRequest, Schedule } from "@/types";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface SwapRequestsListProps {
  currentDate: Date;
  onScheduleChange: () => void;
}

export function SwapRequestsList({
  currentDate,
  onScheduleChange,
}: SwapRequestsListProps) {
  const [requests, setRequests] = useState<ShiftSwapRequest[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadRequests = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchSwapRequests();
      setRequests(data);

      // Schichten für alle betroffenen Daten laden
      const dates = Array.from(
        new Set(data.flatMap((r) => [r.from_date, r.to_date]))
      );
      const scheds = await fetchSchedulesByDates(dates);
      setSchedules(scheds);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  async function handleApprove(request: ShiftSwapRequest) {
    setProcessingId(request.id);
    try {
      // Fetch both shifts to swap
      const { start, end } = getWeekRange(new Date(request.from_date));
      const schedules = await fetchWeekSchedules(start, end);

      const fromShift = schedules.find(
        (s) =>
          s.employee_id === request.from_employee_id &&
          s.date === request.from_date
      );
      const toShift = schedules.find(
        (s) =>
          s.employee_id === request.to_employee_id &&
          s.date === request.to_date
      );

      if (!fromShift || !toShift) {
        throw new Error("Schichten nicht gefunden");
      }

      // Swap the shifts
      await Promise.all([
        upsertSchedule(
          request.from_employee_id,
          request.from_date,
          toShift.shift_type
        ),
        upsertSchedule(
          request.to_employee_id,
          request.to_date,
          fromShift.shift_type
        ),
      ]);

      // Update request status
      await updateSwapRequestStatus(request.id, "approved");
      await loadRequests();
      onScheduleChange();
    } catch (err) {
      console.error(err);
    } finally {
      setProcessingId(null);
    }
  }

  async function handleReject(request: ShiftSwapRequest) {
    setProcessingId(request.id);
    try {
      await updateSwapRequestStatus(request.id, "rejected");
      await loadRequests();
    } finally {
      setProcessingId(null);
    }
  }

  const pendingRequests = requests.filter((r) => r.status === "pending");
  const resolvedRequests = requests.filter((r) => r.status !== "pending");

  if (loading) {
    return (
      <div className="px-4">
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="skeleton h-24 rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pb-8 space-y-6">
      {/* Pending */}
      <div>
        <h3 className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2">
          Ausstehend
          {pendingRequests.length > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-accent-orange/20 text-accent-orange text-[10px] font-bold">
              {pendingRequests.length}
            </span>
          )}
        </h3>

        {pendingRequests.length === 0 ? (
          <div className="glass rounded-3xl p-6 text-center">
            <p className="text-white/30 text-sm">Keine ausstehenden Anfragen</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingRequests.map((req) => (
              <SwapRequestCard
                key={req.id}
                request={req}
                schedules={schedules}
                onApprove={() => handleApprove(req)}
                onReject={() => handleReject(req)}
                processing={processingId === req.id}
              />
            ))}
          </div>
        )}
      </div>

      {/* Resolved */}
      {resolvedRequests.length > 0 && (
        <div>
          <h3 className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-3">
            Verlauf
          </h3>
          <div className="space-y-2">
            {resolvedRequests.slice(0, 10).map((req) => {
              const fromShift = schedules.find(
                (s) => s.employee_id === req.from_employee_id && s.date === req.from_date
              );
              const toShift = schedules.find(
                (s) => s.employee_id === req.to_employee_id && s.date === req.to_date
              );
              return (
                <div
                  key={req.id}
                  className="glass rounded-2xl px-4 py-3 flex items-center gap-3"
                >
                  <div
                    className={clsx(
                      "w-2 h-2 rounded-full shrink-0",
                      req.status === "approved"
                        ? "bg-accent-green"
                        : "bg-accent-red"
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-white/70 text-sm truncate">
                      {req.from_employee?.name} ↔ {req.to_employee?.name}
                    </p>
                    <p className="text-white/30 text-xs">
                      {formatDate(req.from_date)} ↔ {formatDate(req.to_date)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <ShiftBadge shift={fromShift?.shift_type ?? null} size="sm" />
                    <span className="text-white/20 text-xs">↔</span>
                    <ShiftBadge shift={toShift?.shift_type ?? null} size="sm" />
                  </div>
                  <span
                    className={clsx(
                      "text-xs font-semibold px-2 py-0.5 rounded-lg shrink-0",
                      req.status === "approved"
                        ? "bg-accent-green/10 text-green-400"
                        : "bg-accent-red/10 text-red-400"
                    )}
                  >
                    {req.status === "approved" ? "Genehmigt" : "Abgelehnt"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function SwapRequestCard({
  request,
  schedules,
  onApprove,
  onReject,
  processing,
}: {
  request: ShiftSwapRequest;
  schedules: Schedule[];
  onApprove: () => void;
  onReject: () => void;
  processing: boolean;
}) {
  const fromShift = schedules.find(
    (s) => s.employee_id === request.from_employee_id && s.date === request.from_date
  );
  const toShift = schedules.find(
    (s) => s.employee_id === request.to_employee_id && s.date === request.to_date
  );

  return (
    <div className="glass rounded-3xl p-4 shadow-apple-sm space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-accent-orange animate-pulse" />
          <span className="text-xs font-semibold text-accent-orange uppercase tracking-wide">
            Tauschanfrage
          </span>
        </div>
        <span className="text-xs text-white/30">
          {formatDate(request.created_at, true)}
        </span>
      </div>

      {/* Swap details */}
      <div className="bg-white/[0.04] rounded-2xl p-3 space-y-2.5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-accent-blue/20 flex items-center justify-center text-xs font-bold text-accent-blue shrink-0">
            {request.from_employee?.name?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium">
              {request.from_employee?.name}
            </p>
            <p className="text-white/40 text-xs">{formatDate(request.from_date)}</p>
          </div>
          <ShiftBadge shift={fromShift?.shift_type ?? null} />
        </div>

        <div className="flex justify-center text-white/20 text-lg">⇅</div>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white/60 shrink-0">
            {request.to_employee?.name?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium">
              {request.to_employee?.name}
            </p>
            <p className="text-white/40 text-xs">{formatDate(request.to_date)}</p>
          </div>
          <ShiftBadge shift={toShift?.shift_type ?? null} />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={onReject}
          disabled={processing}
          className="flex-1 py-2.5 rounded-2xl bg-accent-red/10 text-red-400 font-semibold text-sm hover:bg-accent-red/20 transition-all active:scale-95 disabled:opacity-50"
        >
          Ablehnen
        </button>
        <button
          onClick={onApprove}
          disabled={processing}
          className="flex-1 py-2.5 rounded-2xl bg-accent-green/10 text-green-400 font-semibold text-sm hover:bg-accent-green/20 transition-all active:scale-95 disabled:opacity-50"
        >
          {processing ? (
            <span className="flex items-center justify-center gap-1.5">
              <span className="w-3 h-3 border-2 border-green-400/30 border-t-green-400 rounded-full animate-spin" />
              …
            </span>
          ) : (
            "Genehmigen"
          )}
        </button>
      </div>
    </div>
  );
}

function formatDate(dateStr: string, withTime = false): string {
  try {
    const d = new Date(dateStr);
    if (withTime) {
      return format(d, "d. MMM, HH:mm", { locale: de });
    }
    return format(d, "EEEE, d. MMM", { locale: de });
  } catch {
    return dateStr;
  }
}

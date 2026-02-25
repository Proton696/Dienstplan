"use client";

import { formatWeekLabel, isCurrentWeek } from "@/lib/week";

interface WeekNavigatorProps {
  currentDate: Date;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}

export function WeekNavigator({
  currentDate,
  onPrev,
  onNext,
  onToday,
}: WeekNavigatorProps) {
  const isCurrent = isCurrentWeek(currentDate);

  return (
    <div className="flex items-center justify-between gap-3 py-4 px-4">
      <button
        onClick={onPrev}
        className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white/[0.06] text-white/60 hover:text-white hover:bg-white/[0.1] transition-all active:scale-90"
        aria-label="Vorherige Woche"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      <div className="text-center flex-1 min-w-0">
        <p className="text-white font-semibold text-sm truncate">
          {formatWeekLabel(currentDate)}
        </p>
        {!isCurrent && (
          <button
            onClick={onToday}
            className="text-accent-blue text-xs mt-0.5 hover:text-blue-400 transition-colors"
          >
            Zur aktuellen Woche
          </button>
        )}
      </div>

      <button
        onClick={onNext}
        className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white/[0.06] text-white/60 hover:text-white hover:bg-white/[0.1] transition-all active:scale-90"
        aria-label="Nächste Woche"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </div>
  );
}

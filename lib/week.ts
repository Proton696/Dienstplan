import {
  startOfWeek,
  endOfWeek,
  addDays,
  addWeeks,
  subWeeks,
  format,
  isToday,
  parseISO,
} from "date-fns";
import { de } from "date-fns/locale";
import type { WeekDay } from "@/types";

export const DAY_LABELS_SHORT = ["Mo", "Di", "Mi", "Do", "Fr"];
export const DAY_LABELS_FULL = [
  "Montag",
  "Dienstag",
  "Mittwoch",
  "Donnerstag",
  "Freitag",
];

export function getWeekDays(referenceDate: Date): WeekDay[] {
  const monday = startOfWeek(referenceDate, { weekStartsOn: 1 });

  return Array.from({ length: 5 }, (_, i) => {
    const date = addDays(monday, i);
    const dateString = format(date, "yyyy-MM-dd");
    return {
      date,
      dateString,
      label: DAY_LABELS_SHORT[i],
      fullLabel: DAY_LABELS_FULL[i],
      isToday: isToday(date),
    };
  });
}

export function getWeekRange(referenceDate: Date): {
  start: string;
  end: string;
} {
  const monday = startOfWeek(referenceDate, { weekStartsOn: 1 });
  const friday = addDays(monday, 4);
  return {
    start: format(monday, "yyyy-MM-dd"),
    end: format(friday, "yyyy-MM-dd"),
  };
}

export function nextWeek(date: Date): Date {
  return addWeeks(date, 1);
}

export function prevWeek(date: Date): Date {
  return subWeeks(date, 1);
}

export function formatWeekLabel(referenceDate: Date): string {
  const monday = startOfWeek(referenceDate, { weekStartsOn: 1 });
  const friday = addDays(monday, 4);
  const weekNum = format(monday, "w", { locale: de });

  if (monday.getMonth() === friday.getMonth()) {
    return `${format(monday, "d.")} – ${format(friday, "d. MMMM yyyy", { locale: de })} · KW ${weekNum}`;
  }
  return `${format(monday, "d. MMM", { locale: de })} – ${format(friday, "d. MMM yyyy", { locale: de })} · KW ${weekNum}`;
}

export function isCurrentWeek(date: Date): boolean {
  const today = new Date();
  const monday = startOfWeek(today, { weekStartsOn: 1 });
  const inputMonday = startOfWeek(date, { weekStartsOn: 1 });
  return format(monday, "yyyy-MM-dd") === format(inputMonday, "yyyy-MM-dd");
}

export type ShiftType = "frei" | "HO" | "Früh" | "Spät" | "Urlaub" | "MD";

export type EmployeeRole = "assistent" | "händler" | "admin";

export type SwapStatus = "pending" | "approved" | "rejected";

export interface Employee {
  id: string;
  name: string;
  role: EmployeeRole;
  user_id: string;
  email: string;
}

// Für Tauschanfragen: Admin gilt als Händler
export function getSwapType(role: EmployeeRole): "assistent" | "händler" {
  return role === "assistent" ? "assistent" : "händler";
}

export function canSwapWith(a: EmployeeRole, b: EmployeeRole): boolean {
  return getSwapType(a) === getSwapType(b);
}

export interface Schedule {
  id: string;
  employee_id: string;
  date: string; // ISO date string YYYY-MM-DD
  shift_type: ShiftType;
}

export interface ScheduleWithEmployee extends Schedule {
  employees: Employee;
}

export interface ShiftSwapRequest {
  id: string;
  from_employee_id: string;
  to_employee_id: string;
  from_date: string;
  to_date: string;
  status: SwapStatus;
  created_at: string;
  from_employee?: Employee;
  to_employee?: Employee;
  from_schedule?: Schedule;
  to_schedule?: Schedule;
}

export interface WeekDay {
  date: Date;
  dateString: string; // YYYY-MM-DD
  label: string; // "Mo", "Di", etc.
  fullLabel: string; // "Montag", etc.
  isToday: boolean;
}

export interface ScheduleRow {
  employee: Employee;
  shifts: Record<string, Schedule | null>; // dateString -> Schedule
}

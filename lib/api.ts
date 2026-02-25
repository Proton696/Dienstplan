import { getSupabaseClient } from "./supabase";
import type {
  Employee,
  Schedule,
  ShiftSwapRequest,
  ShiftType,
} from "@/types";

// ─── Employees ────────────────────────────────────────────────────────────────

export async function fetchEmployees(): Promise<Employee[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("employees")
    .select("*")
    .order("name");
  if (error) throw error;
  return data ?? [];
}

export async function fetchEmployeeByUserId(
  userId: string
): Promise<Employee | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("employees")
    .select("*")
    .eq("user_id", userId)
    .single();
  if (error) return null;
  return data;
}

// ─── Schedules ────────────────────────────────────────────────────────────────

export async function fetchWeekSchedules(
  startDate: string,
  endDate: string
): Promise<Schedule[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("schedules")
    .select("*")
    .gte("date", startDate)
    .lte("date", endDate);
  if (error) throw error;
  return data ?? [];
}

export async function fetchSchedulesByDates(
  dates: string[]
): Promise<Schedule[]> {
  if (dates.length === 0) return [];
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("schedules")
    .select("*")
    .in("date", dates);
  if (error) throw error;
  return data ?? [];
}

export async function upsertSchedule(
  employeeId: string,
  date: string,
  shiftType: ShiftType
): Promise<Schedule> {
  const supabase = getSupabaseClient();

  // Try update first, then insert (upsert on conflict)
  const { data, error } = await supabase
    .from("schedules")
    .upsert(
      { employee_id: employeeId, date, shift_type: shiftType },
      { onConflict: "employee_id,date" }
    )
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteSchedule(
  employeeId: string,
  date: string
): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from("schedules")
    .delete()
    .eq("employee_id", employeeId)
    .eq("date", date);
  if (error) throw error;
}

// ─── Shift Swap Requests ──────────────────────────────────────────────────────

export async function fetchSwapRequests(): Promise<ShiftSwapRequest[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("shift_swap_requests")
    .select(
      `
      *,
      from_employee:employees!shift_swap_requests_from_employee_id_fkey(*),
      to_employee:employees!shift_swap_requests_to_employee_id_fkey(*)
    `
    )
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchMySwapRequests(
  employeeId: string
): Promise<ShiftSwapRequest[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("shift_swap_requests")
    .select(
      `
      *,
      from_employee:employees!shift_swap_requests_from_employee_id_fkey(*),
      to_employee:employees!shift_swap_requests_to_employee_id_fkey(*)
    `
    )
    .or(`from_employee_id.eq.${employeeId},to_employee_id.eq.${employeeId}`)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createSwapRequest(params: {
  fromEmployeeId: string;
  toEmployeeId: string;
  fromDate: string;
  toDate: string;
}): Promise<ShiftSwapRequest> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("shift_swap_requests")
    .insert({
      from_employee_id: params.fromEmployeeId,
      to_employee_id: params.toEmployeeId,
      from_date: params.fromDate,
      to_date: params.toDate,
      status: "pending",
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateSwapRequestStatus(
  requestId: string,
  status: "approved" | "rejected"
): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from("shift_swap_requests")
    .update({ status })
    .eq("id", requestId);
  if (error) throw error;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function signIn(email: string, password: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const supabase = getSupabaseClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  const supabase = getSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}

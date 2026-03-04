"use client";

import { useEffect, useState, useCallback } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import { fetchEmployeeByUserId } from "@/lib/api";
import type { Employee } from "@/types";
import type { User } from "@supabase/supabase-js";

interface AuthState {
  user: User | null;
  employee: Employee | null;
  loading: boolean;
  isAdmin: boolean;
}

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    user: null,
    employee: null,
    loading: true,
    isAdmin: false,
  });

  const loadEmployee = useCallback(async (user: User | null) => {
    if (!user) {
      setState({ user: null, employee: null, loading: false, isAdmin: false });
      return;
    }
    const employee = await fetchEmployeeByUserId(user.id);
    setState({
      user,
      employee,
      loading: false,
      isAdmin: employee?.role === "admin",
    });
  }, []);

  useEffect(() => {
    const supabase = getSupabaseClient();

    supabase.auth.getSession().then(({ data: { session } }) => {
      loadEmployee(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      loadEmployee(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [loadEmployee]);

  return state;
}

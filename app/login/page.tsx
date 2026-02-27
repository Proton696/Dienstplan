"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/api";
import { fetchEmployeesPublic } from "@/lib/api";

interface EmployeeOption {
  id: string;
  name: string;
  email: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [selectedEmail, setSelectedEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(true);

  useEffect(() => {
    fetchEmployeesPublic()
      .then(setEmployees)
      .catch(() => {})
      .finally(() => setLoadingEmployees(false));
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!selectedEmail) {
      setError("Bitte wähle deinen Namen aus.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await signIn(selectedEmail, password);
      router.push("/schedule");
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Anmeldung fehlgeschlagen."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-5 pt-safe">
      <div className="w-full max-w-sm animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-[22px] bg-accent-blue mb-5 shadow-apple-lg">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
              <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
            </svg>
          </div>
          <h1 className="text-3xl font-semibold text-white tracking-tight">
            Dienstplan
          </h1>
          <p className="text-sm text-white/40 mt-1">
            Wähle deinen Namen und melde dich an
          </p>
        </div>

        {/* Login Card */}
        <div className="glass rounded-3xl p-6 shadow-apple">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3">
              {/* Name Dropdown */}
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wide">
                  Name
                </label>
                <div className="relative">
                  <select
                    value={selectedEmail}
                    onChange={(e) => setSelectedEmail(e.target.value)}
                    required
                    disabled={loadingEmployees}
                    className="w-full bg-white/[0.07] border border-white/10 rounded-xl px-4 py-3 text-white text-base focus:outline-none focus:border-accent-blue/60 focus:bg-white/[0.09] transition-all appearance-none cursor-pointer disabled:opacity-50"
                  >
                    <option value="" className="bg-[#1c1c1e] text-white/40">
                      {loadingEmployees ? "Lädt…" : "Name auswählen…"}
                    </option>
                    {employees.map((emp) => (
                      <option
                        key={emp.id}
                        value={emp.email}
                        className="bg-[#1c1c1e] text-white"
                      >
                        {emp.name}
                      </option>
                    ))}
                  </select>
                  {/* Dropdown-Pfeil */}
                  <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-white/30">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Passwort */}
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wide">
                  Passwort
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-white/[0.07] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 text-base focus:outline-none focus:border-accent-blue/60 focus:bg-white/[0.09] transition-all"
                  autoComplete="current-password"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2.5 bg-accent-red/10 border border-accent-red/20 rounded-xl px-4 py-3 animate-fade-in">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ff453a" strokeWidth="2" strokeLinecap="round" className="shrink-0">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || loadingEmployees}
              className="w-full bg-accent-blue text-white font-semibold py-3.5 rounded-xl text-base transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-apple-sm hover:bg-blue-500 mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Wird angemeldet…
                </span>
              ) : (
                "Anmelden"
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-white/20 mt-6">
          Zugangsdaten erhältst du von deinem Vorgesetzten
        </p>
      </div>
    </div>
  );
}

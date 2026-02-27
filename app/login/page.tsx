"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/api";
import { getSupabaseClient } from "@/lib/supabase";

interface EmployeeOption {
  id: string;
  name: string;
  email?: string | null;
}

export default function LoginPage() {
  const router = useRouter();
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = getSupabaseClient();
      // Zuerst mit email-Spalte versuchen, dann ohne als Fallback
      let { data, error } = await supabase
        .from("employees")
        .select("id, name, email")
        .order("name");

      if (error) {
        // Fallback: email-Spalte existiert evtl. noch nicht
        const res = await supabase
          .from("employees")
          .select("id, name")
          .order("name");
        data = res.data;
      }

      setEmployees(data ?? []);
      setLoadingEmployees(false);
    }
    load();
  }, []);

  function handleNameSelect(e: React.ChangeEvent<HTMLSelectElement>) {
    const emp = employees.find((x) => x.id === e.target.value);
    setSelectedId(e.target.value);
    // E-Mail vorausfüllen falls in DB vorhanden
    if (emp?.email) {
      setEmail(emp.email);
    } else {
      setEmail("");
    }
    setError(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!selectedId) {
      setError("Bitte wähle deinen Namen aus.");
      return;
    }
    if (!email.trim()) {
      setError("Bitte gib deine E-Mail-Adresse ein.");
      return;
    }

    setLoading(true);
    try {
      await signIn(email.trim(), password);
      router.push("/schedule");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Anmeldung fehlgeschlagen.";
      // Verständlichere Fehlermeldungen
      if (msg.includes("Invalid login credentials")) {
        setError("E-Mail oder Passwort falsch. Bitte prüfen.");
      } else if (msg.includes("Email not confirmed")) {
        setError("E-Mail noch nicht bestätigt. Bitte Postfach prüfen.");
      } else {
        setError(msg);
      }
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
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <h1 className="text-3xl font-semibold text-white tracking-tight">Dienstplan</h1>
          <p className="text-sm text-white/40 mt-1">Melde dich mit deinem Account an</p>
        </div>

        {/* Card */}
        <div className="glass rounded-3xl p-6 shadow-apple">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3">

              {/* Name */}
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wide">
                  Name
                </label>
                <div className="relative">
                  <select
                    value={selectedId}
                    onChange={handleNameSelect}
                    disabled={loadingEmployees}
                    className="w-full bg-white/[0.07] border border-white/10 rounded-xl px-4 py-3 text-white text-base focus:outline-none focus:border-accent-blue/60 transition-all appearance-none cursor-pointer disabled:opacity-50"
                  >
                    <option value="" className="bg-[#1c1c1e] text-white/40">
                      {loadingEmployees ? "Lädt…" : employees.length === 0 ? "Keine Mitarbeiter gefunden" : "Name auswählen…"}
                    </option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id} className="bg-[#1c1c1e] text-white">
                        {emp.name}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-white/30">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* E-Mail — immer sichtbar */}
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wide">
                  E-Mail
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="deine@email.de"
                  required
                  autoCapitalize="none"
                  autoComplete="email"
                  className="w-full bg-white/[0.07] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 text-base focus:outline-none focus:border-accent-blue/60 focus:bg-white/[0.09] transition-all"
                />
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
                  autoComplete="current-password"
                  className="w-full bg-white/[0.07] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 text-base focus:outline-none focus:border-accent-blue/60 focus:bg-white/[0.09] transition-all"
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
              disabled={loading}
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

"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signIn(email, password);
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
        {/* Logo / App Title */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-[22px] bg-accent-blue mb-5 shadow-apple-lg">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
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
            Melde dich mit deinem Account an
          </p>
        </div>

        {/* Login Card */}
        <div className="glass rounded-3xl p-6 shadow-apple">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wide">
                  E-Mail
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@beispiel.de"
                  required
                  className="w-full bg-white/[0.07] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 text-base focus:outline-none focus:border-accent-blue/60 focus:bg-white/[0.09] transition-all"
                  autoComplete="email"
                  autoCapitalize="none"
                />
              </div>

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
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#ff453a"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="shrink-0"
                >
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

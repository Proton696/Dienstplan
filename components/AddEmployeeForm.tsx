"use client";

import { useState, useEffect, useCallback } from "react";
import { clsx } from "clsx";
import { createEmployee, deleteEmployee, fetchEmployees, updateEmployeeRole } from "@/lib/api";
import type { Employee, EmployeeRole } from "@/types";

interface AddEmployeeFormProps {
  onSuccess: () => void;
}

const ROLE_OPTIONS: { value: EmployeeRole; label: string; desc: string }[] = [
  { value: "assistent", label: "Assistent", desc: "Kann nur mit Assistenten tauschen" },
  { value: "händler",   label: "Händler",   desc: "Kann mit Händlern & Admin tauschen" },
];

export function AddEmployeeForm({ onSuccess }: AddEmployeeFormProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<EmployeeRole>("assistent");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadEmployees = useCallback(async () => {
    setLoadingList(true);
    try {
      const data = await fetchEmployees();
      setEmployees(data);
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await createEmployee({ name, email, password, role });
      setName("");
      setEmail("");
      setPassword("");
      setRole("assistent");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      await loadEmployees();
      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Fehler beim Anlegen.");
    } finally {
      setSaving(false);
    }
  }

  async function handleRoleChange(emp: Employee, newRole: EmployeeRole) {
    if (emp.role === newRole) return;
    setUpdatingId(emp.id);
    try {
      await updateEmployeeRole(emp.id, newRole);
      await loadEmployees();
      onSuccess();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Fehler beim Aktualisieren.");
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleDelete(emp: Employee) {
    if (!confirm(`${emp.name} wirklich löschen?`)) return;
    setDeletingId(emp.id);
    try {
      await deleteEmployee(emp.id);
      await loadEmployees();
      onSuccess();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Fehler beim Löschen.");
    } finally {
      setDeletingId(null);
    }
  }

  const roleColor: Record<EmployeeRole, string> = {
    assistent: "bg-accent-blue/10 text-blue-400",
    händler:   "bg-accent-purple/10 text-purple-400",
    admin:     "bg-accent-orange/10 text-orange-400",
  };

  return (
    <div className="space-y-6 max-w-2xl">

      {/* Neuer Mitarbeiter */}
      <div className="glass rounded-3xl p-5 shadow-apple">
        <h3 className="text-white font-semibold text-base mb-4 flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-accent-blue">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <line x1="19" y1="8" x2="19" y2="14" />
            <line x1="22" y1="11" x2="16" y2="11" />
          </svg>
          Neuen Mitarbeiter anlegen
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wide">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Vorname Nachname"
                required
                className="w-full bg-white/[0.07] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 text-sm focus:outline-none focus:border-accent-blue/60 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wide">E-Mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@firma.de"
                required
                className="w-full bg-white/[0.07] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 text-sm focus:outline-none focus:border-accent-blue/60 transition-all"
                autoCapitalize="none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wide">Passwort</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mindestens 6 Zeichen"
                required
                minLength={6}
                className="w-full bg-white/[0.07] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 text-sm focus:outline-none focus:border-accent-blue/60 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wide">Typ</label>
              <div className="grid grid-cols-2 gap-2">
                {ROLE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setRole(opt.value)}
                    className={clsx(
                      "px-3 py-2.5 rounded-xl text-sm font-semibold transition-all text-left border",
                      role === opt.value
                        ? "bg-accent-blue/15 border-accent-blue/40 text-white"
                        : "bg-white/[0.04] border-white/10 text-white/50 hover:bg-white/[0.08]"
                    )}
                  >
                    <p className="leading-none">{opt.label}</p>
                    <p className="text-[10px] font-normal mt-0.5 opacity-60 leading-tight">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-accent-red/10 border border-accent-red/20 rounded-xl px-4 py-3">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-accent-green/10 border border-accent-green/20 rounded-xl px-4 py-3 flex items-center gap-2 animate-fade-in">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#30d158" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <p className="text-sm text-green-400">Mitarbeiter erfolgreich angelegt!</p>
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-accent-blue text-white font-semibold py-3 rounded-xl text-sm hover:bg-blue-500 transition-all active:scale-95 disabled:opacity-50"
          >
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Wird angelegt…
              </span>
            ) : (
              "Mitarbeiter anlegen"
            )}
          </button>
        </form>
      </div>

      {/* Mitarbeiterliste */}
      <div>
        <h3 className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-3">
          Alle Mitarbeiter ({employees.length})
        </h3>

        {loadingList ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-14 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {employees.map((emp) => (
              <div
                key={emp.id}
                className="glass rounded-2xl px-4 py-3 flex items-center gap-3"
              >
                <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-sm font-semibold text-white/60 shrink-0">
                  {emp.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{emp.name}</p>
                  <p className="text-white/30 text-xs truncate">{emp.email}</p>
                </div>
                {emp.role === "admin" ? (
                  <span className={clsx("text-xs font-semibold px-2.5 py-1 rounded-lg shrink-0", roleColor[emp.role])}>
                    Admin
                  </span>
                ) : (
                  <select
                    value={emp.role}
                    onChange={(e) => handleRoleChange(emp, e.target.value as EmployeeRole)}
                    disabled={updatingId === emp.id}
                    className={clsx(
                      "text-xs font-semibold px-2.5 py-1 rounded-lg shrink-0 border cursor-pointer focus:outline-none focus:ring-1 focus:ring-accent-blue/50",
                      roleColor[emp.role],
                      "border-transparent bg-transparent appearance-none"
                    )}
                  >
                    <option value="assistent" className="bg-[#1c1c1e] text-white">Assistent</option>
                    <option value="händler" className="bg-[#1c1c1e] text-white">Händler</option>
                  </select>
                )}
                {emp.role !== "admin" && (
                  <button
                    onClick={() => handleDelete(emp)}
                    disabled={deletingId === emp.id}
                    className="p-2 rounded-xl text-white/20 hover:text-red-400 hover:bg-accent-red/10 transition-all disabled:opacity-40"
                    aria-label="Löschen"
                  >
                    {deletingId === emp.id ? (
                      <span className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin block" />
                    ) : (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14H6L5 6" />
                        <path d="M10 11v6M14 11v6" />
                        <path d="M9 6V4h6v2" />
                      </svg>
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

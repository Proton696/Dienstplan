-- ============================================================
-- Migration v2: employee_type + email-Spalte
-- Nur ausführen wenn schema v1 bereits läuft!
-- Für Neuinstallation: schema.sql verwenden.
-- ============================================================

-- Neue Enum-Werte hinzufügen
alter type employee_role add value if not exists 'assistent';
alter type employee_role add value if not exists 'händler';

-- Email-Spalte hinzufügen
alter table public.employees add column if not exists email text;

-- Bestehende 'employee'-Einträge auf 'assistent' migrieren
update public.employees set role = 'assistent' where role = 'employee';

-- Anon-Lesezugriff für Login-Dropdown
create policy "employees: anon can read"
  on public.employees for select
  to anon
  using (true);

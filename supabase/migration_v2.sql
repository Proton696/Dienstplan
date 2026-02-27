-- ============================================================
-- Migration v2 – WICHTIG: Zwei Schritte nacheinander ausführen!
-- Schritt 1 ausführen → "Run" klicken → dann Schritt 2 ausführen
-- ============================================================

-- ════════════════════════════════════════════════════════════
-- SCHRITT 1: Enum-Werte hinzufügen (zuerst alleine ausführen!)
-- ════════════════════════════════════════════════════════════

alter type employee_role add value if not exists 'assistent';
alter type employee_role add value if not exists 'händler';

-- ► Jetzt "Run" drücken und warten bis erfolgreich.
-- ► Dann Schritt 2 separat ausführen.


-- ════════════════════════════════════════════════════════════
-- SCHRITT 2: Daten + Schema aktualisieren (separat ausführen!)
-- ════════════════════════════════════════════════════════════

-- Email-Spalte hinzufügen
alter table public.employees
  add column if not exists email text;

-- Bestehende 'employee'-Einträge auf 'assistent' migrieren
update public.employees
  set role = 'assistent'
  where role::text = 'employee';

-- Anon-Lesezugriff für Login-Dropdown (falls noch nicht vorhanden)
do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'employees'
      and policyname = 'employees: anon can read'
  ) then
    execute $policy$
      create policy "employees: anon can read"
        on public.employees for select
        to anon
        using (true)
    $policy$;
  end if;
end $$;

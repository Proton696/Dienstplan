-- ============================================================
-- Beispiel-Schichten für die aktuelle Woche (KW anpassen!)
-- Führe dies aus, nachdem du die Mitarbeiter angelegt hast.
-- ============================================================

-- Beispiel: Schichten für KW 9 (24.–28. Feb 2026)
-- Passe die employee_id und Datum-Werte an deine echten Daten an.

/*
-- Erst employee IDs holen:
select id, name from public.employees order by name;

-- Dann Schichten einfügen (Beispiel-Struktur):
insert into public.schedules (employee_id, date, shift_type) values
  -- Maik
  ('EMP_MAIK_ID', '2026-02-24', 'Früh'),
  ('EMP_MAIK_ID', '2026-02-25', 'Früh'),
  ('EMP_MAIK_ID', '2026-02-26', 'HO'),
  ('EMP_MAIK_ID', '2026-02-27', 'Früh'),
  ('EMP_MAIK_ID', '2026-02-28', 'frei'),

  -- Timon
  ('EMP_TIMON_ID', '2026-02-24', 'Spät'),
  ('EMP_TIMON_ID', '2026-02-25', 'Spät'),
  ('EMP_TIMON_ID', '2026-02-26', 'Spät'),
  ('EMP_TIMON_ID', '2026-02-27', 'HO'),
  ('EMP_TIMON_ID', '2026-02-28', 'Spät'),

  -- Niklas
  ('EMP_NIKLAS_ID', '2026-02-24', 'HO'),
  ('EMP_NIKLAS_ID', '2026-02-25', 'HO'),
  ('EMP_NIKLAS_ID', '2026-02-26', 'Früh'),
  ('EMP_NIKLAS_ID', '2026-02-27', 'Früh'),
  ('EMP_NIKLAS_ID', '2026-02-28', 'HO'),

  -- Emanuel
  ('EMP_EMANUEL_ID', '2026-02-24', 'Urlaub'),
  ('EMP_EMANUEL_ID', '2026-02-25', 'Urlaub'),
  ('EMP_EMANUEL_ID', '2026-02-26', 'Urlaub'),
  ('EMP_EMANUEL_ID', '2026-02-27', 'Urlaub'),
  ('EMP_EMANUEL_ID', '2026-02-28', 'Urlaub');
*/

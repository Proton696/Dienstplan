-- ============================================================
-- E-Mails für bestehende Mitarbeiter eintragen
-- Passe die E-Mails an deine echten Supabase Auth-E-Mails an!
-- ============================================================

-- Erst schauen welche Mitarbeiter noch keine E-Mail haben:
-- SELECT id, name, email FROM public.employees ORDER BY name;

-- Dann E-Mails updaten (Beispiel – echte E-Mails eintragen!):
UPDATE public.employees SET email = 'maik@firma.de'    WHERE name = 'Maik'    AND (email IS NULL OR email = '');
UPDATE public.employees SET email = 'timon@firma.de'   WHERE name = 'Timon'   AND (email IS NULL OR email = '');
UPDATE public.employees SET email = 'niklas@firma.de'  WHERE name = 'Niklas'  AND (email IS NULL OR email = '');
UPDATE public.employees SET email = 'emanuel@firma.de' WHERE name = 'Emanuel' AND (email IS NULL OR email = '');
UPDATE public.employees SET email = 'henning@firma.de' WHERE name = 'Henning' AND (email IS NULL OR email = '');
UPDATE public.employees SET email = 'laurens@firma.de' WHERE name = 'Laurens' AND (email IS NULL OR email = '');
UPDATE public.employees SET email = 'rayene@firma.de'  WHERE name = 'Rayene'  AND (email IS NULL OR email = '');
UPDATE public.employees SET email = 'natan@firma.de'   WHERE name = 'Natan'   AND (email IS NULL OR email = '');
UPDATE public.employees SET email = 'mathias@firma.de' WHERE name = 'Mathias' AND (email IS NULL OR email = '');

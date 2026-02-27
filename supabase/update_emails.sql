-- ============================================================
-- E-Mails + Rollen für bestehende Mitarbeiter updaten
-- Passe die E-Mails an deine echten Supabase Auth-E-Mails an!
-- ============================================================

-- Email-Spalte hinzufügen falls noch nicht vorhanden
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS email text;

-- E-Mails eintragen (ersetze mit den echten E-Mails aus Supabase Auth → Users)
UPDATE public.employees SET email = 'maik@deine-domain.de'    WHERE user_id = 'f0262681-68c7-4a62-b24d-3bf74dba6a0c';
UPDATE public.employees SET email = 'timon@deine-domain.de'   WHERE user_id = '648a97c8-476c-4af8-b011-2a72abba94ee';
UPDATE public.employees SET email = 'niklas@deine-domain.de'  WHERE user_id = '723ce8a0-bdef-4f66-b9e6-7dd7ee8ec4fa';
UPDATE public.employees SET email = 'emanuel@deine-domain.de' WHERE user_id = 'ad813f5f-d83d-477d-9211-b1215f7f94ed';
UPDATE public.employees SET email = 'henning@deine-domain.de' WHERE user_id = 'a7e1031a-fccc-43ab-836f-7ccde5dd2c48';
UPDATE public.employees SET email = 'laurens@deine-domain.de' WHERE user_id = '219bd1bd-97be-47d2-9b61-db3ff5906cfc';
UPDATE public.employees SET email = 'rayene@deine-domain.de'  WHERE user_id = '5aae1a1a-067e-432f-9a96-052551e7315a';
UPDATE public.employees SET email = 'natan@deine-domain.de'   WHERE user_id = 'e5f21b67-5f3b-4c5a-a09d-1564be23eb5e';
UPDATE public.employees SET email = 'mathias@deine-domain.de' WHERE user_id = 'b4e156fe-816e-4a3d-b75a-18bd6ebd1a41';

-- Rollen aktualisieren (employee → assistent, nur falls Migration v2 noch nicht lief)
UPDATE public.employees SET role = 'assistent' WHERE role::text = 'employee' AND user_id != 'b4e156fe-816e-4a3d-b75a-18bd6ebd1a41';

-- Prüfen:
-- SELECT name, email, role FROM public.employees ORDER BY name;

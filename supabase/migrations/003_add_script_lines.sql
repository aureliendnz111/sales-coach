-- Ajoute un champ pour le contenu à dire (phrases, scripts, pas seulement des questions)
alter table steps add column if not exists script_lines text[];

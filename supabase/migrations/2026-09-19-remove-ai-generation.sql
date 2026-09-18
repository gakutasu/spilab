-- For projects created with the earlier schema that included in-app AI generation.
-- Safe to run more than once.
drop table if exists public.generated_questions;
alter table public.settings drop column if exists ai_model;
alter table public.settings drop column if exists ai_verify;

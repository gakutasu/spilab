-- SPILAB cloud sync schema. Run this in the Supabase SQL editor once.
-- All tables are protected by Row Level Security so users only see their own rows.

create table if not exists public.answers (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  question_id text not null,
  answered_at timestamptz not null,
  selected_choice smallint,
  result text not null check (result in ('correct', 'incorrect', 'unknown')),
  answer_time_ms integer not null,
  created_at timestamptz not null default now(),
  unique (user_id, question_id, answered_at)
);

create index if not exists answers_user_created_idx on public.answers (user_id, created_at);

create table if not exists public.generated_questions (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  id text not null,
  data jsonb not null,
  created_at timestamptz not null default now(),
  primary key (user_id, id)
);

create table if not exists public.settings (
  user_id uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  questions_per_day integer not null default 7,
  ai_model text not null default 'claude-opus-5',
  ai_verify boolean not null default true,
  updated_at timestamptz not null default now()
);

alter table public.answers enable row level security;
alter table public.generated_questions enable row level security;
alter table public.settings enable row level security;

drop policy if exists "answers owner" on public.answers;
create policy "answers owner" on public.answers
  for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "generated owner" on public.generated_questions;
create policy "generated owner" on public.generated_questions
  for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "settings owner" on public.settings;
create policy "settings owner" on public.settings
  for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

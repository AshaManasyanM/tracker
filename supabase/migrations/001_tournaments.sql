-- Run this in Supabase → SQL Editor after creating a project.
-- Enables per-user tournaments stored as JSON (full app state).

create table if not exists public.tournaments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null default 'New scrim',
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tournaments_user_id_idx on public.tournaments (user_id);
create index if not exists tournaments_updated_at_idx on public.tournaments (updated_at desc);

alter table public.tournaments enable row level security;

create policy "tournaments_select_own"
  on public.tournaments for select
  using (auth.uid() = user_id);

create policy "tournaments_insert_own"
  on public.tournaments for insert
  with check (auth.uid() = user_id);

create policy "tournaments_update_own"
  on public.tournaments for update
  using (auth.uid() = user_id);

create policy "tournaments_delete_own"
  on public.tournaments for delete
  using (auth.uid() = user_id);

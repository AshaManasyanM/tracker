-- Public directory of accounts (one row per Auth user).
-- Run in Supabase → SQL Editor, or via `supabase db push`.
--
-- If you already created public.users, ensure you have at least:
--   id uuid primary key references auth.users(id)
--   email text (nullable ok)
-- Then run only the trigger + backfill sections if the table block fails.

create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists users_email_idx on public.users (lower(email));

alter table public.users enable row level security;

drop policy if exists "users_select_authenticated" on public.users;
create policy "users_select_authenticated"
  on public.users for select
  to authenticated
  using (true);

drop policy if exists "users_insert_self" on public.users;
create policy "users_insert_self"
  on public.users for insert
  to authenticated
  with check (auth.uid() = id);

drop policy if exists "users_update_self" on public.users;
create policy "users_update_self"
  on public.users for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Mirror new sign-ups from Supabase Auth into public.users
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email)
  on conflict (id) do update
    set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill anyone who signed up before this migration
insert into public.users (id, email)
select id, email from auth.users
on conflict (id) do update
  set email = excluded.email;

-- Keep public.users.created_at in sync with auth.users.created_at (real signup time).
-- Safe to run after 002_users.sql. Replaces the auth trigger function.

alter table public.users
  add column if not exists created_at timestamptz not null default timezone('utc'::text, now());

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, created_at)
  values (
    new.id,
    new.email,
    coalesce(new.created_at, timezone('utc'::text, now()))
  )
  on conflict (id) do update
    set email = excluded.email;
  -- created_at is not updated on conflict so the original join date is preserved
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill from Auth for existing rows (fixes rows created before this migration)
update public.users u
set created_at = a.created_at
from auth.users a
where u.id = a.id;

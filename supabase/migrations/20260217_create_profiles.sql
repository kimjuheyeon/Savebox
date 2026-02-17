create extension if not exists "uuid-ossp";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, new.raw_user_meta_data->>'display_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;

drop policy if exists profile_select_own on public.profiles;
create policy profile_select_own
  on public.profiles
  for select
  using (id = auth.uid());

drop policy if exists profile_update_own on public.profiles;
create policy profile_update_own
  on public.profiles
  for update
  using (id = auth.uid())
  with check (id = auth.uid());

drop policy if exists profile_insert_own on public.profiles;
create policy profile_insert_own
  on public.profiles
  for insert
  with check (id = auth.uid());

create or replace function public.touch_profiles_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists update_profile_updated_at on public.profiles;
create trigger update_profile_updated_at
  before update on public.profiles
  for each row execute procedure public.touch_profiles_updated_at();

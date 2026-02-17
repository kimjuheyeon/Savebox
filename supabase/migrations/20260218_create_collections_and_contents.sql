-- =============================================
-- Phase 2: Collections & Contents 테이블
-- =============================================

-- 1. Collections 테이블
create table if not exists public.collections (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  color_tag text default 'Blue',
  is_system boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- 2. Contents 테이블
create table if not exists public.contents (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  collection_id uuid references public.collections(id) on delete set null,
  title text not null,
  url text not null,
  thumbnail_url text,
  memo text,
  source text not null default 'Other',
  color_tag text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- 3. 인덱스
create index if not exists idx_contents_user_created on public.contents(user_id, created_at desc);
create index if not exists idx_contents_user_collection on public.contents(user_id, collection_id);
create index if not exists idx_contents_user_source on public.contents(user_id, source);
create index if not exists idx_collections_user_created on public.collections(user_id, created_at desc);

-- 4. updated_at 자동 갱신 트리거
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists update_collections_updated_at on public.collections;
create trigger update_collections_updated_at
  before update on public.collections
  for each row execute procedure public.touch_updated_at();

drop trigger if exists update_contents_updated_at on public.contents;
create trigger update_contents_updated_at
  before update on public.contents
  for each row execute procedure public.touch_updated_at();

-- 5. RLS (Row Level Security)
alter table public.collections enable row level security;
alter table public.contents enable row level security;

-- Collections RLS
drop policy if exists collections_select_own on public.collections;
create policy collections_select_own
  on public.collections for select
  using (user_id = auth.uid());

drop policy if exists collections_insert_own on public.collections;
create policy collections_insert_own
  on public.collections for insert
  with check (user_id = auth.uid());

drop policy if exists collections_update_own on public.collections;
create policy collections_update_own
  on public.collections for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists collections_delete_own on public.collections;
create policy collections_delete_own
  on public.collections for delete
  using (user_id = auth.uid());

-- Contents RLS
drop policy if exists contents_select_own on public.contents;
create policy contents_select_own
  on public.contents for select
  using (user_id = auth.uid());

drop policy if exists contents_insert_own on public.contents;
create policy contents_insert_own
  on public.contents for insert
  with check (user_id = auth.uid());

drop policy if exists contents_update_own on public.contents;
create policy contents_update_own
  on public.contents for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists contents_delete_own on public.contents;
create policy contents_delete_own
  on public.contents for delete
  using (user_id = auth.uid());

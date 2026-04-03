-- Run this in Supabase SQL Editor (Dashboard → SQL) after creating a project.
-- Enables businesses + integrations with Row Level Security.

create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  name text not null,
  tagline text not null default '',
  created_at timestamptz not null default now()
);

-- If `businesses` already existed from an older/partial run without `user_id`,
-- `CREATE TABLE IF NOT EXISTS` does nothing and the index below would fail.
alter table public.businesses
  add column if not exists user_id uuid references auth.users (id) on delete cascade;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'businesses'
      and column_name = 'user_id'
      and is_nullable = 'yes'
  )
  and not exists (select 1 from public.businesses where user_id is null) then
    alter table public.businesses alter column user_id set not null;
  end if;
end $$;

create table if not exists public.business_integrations (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses on delete cascade,
  provider text not null default 'servewise',
  base_url text not null,
  api_key text not null,
  metrics_path text not null default '/v1/metrics',
  updated_at timestamptz not null default now(),
  unique (business_id)
);

create index if not exists businesses_user_id_idx on public.businesses (user_id);
create index if not exists integrations_business_id_idx on public.business_integrations (business_id);

alter table public.businesses enable row level security;
alter table public.business_integrations enable row level security;

drop policy if exists "businesses_select_own" on public.businesses;
drop policy if exists "businesses_insert_own" on public.businesses;
drop policy if exists "businesses_update_own" on public.businesses;
drop policy if exists "businesses_delete_own" on public.businesses;

create policy "businesses_select_own"
  on public.businesses for select
  using (auth.uid() = user_id);

create policy "businesses_insert_own"
  on public.businesses for insert
  with check (auth.uid() = user_id);

create policy "businesses_update_own"
  on public.businesses for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "businesses_delete_own"
  on public.businesses for delete
  using (auth.uid() = user_id);

drop policy if exists "integrations_all_via_business" on public.business_integrations;

create policy "integrations_all_via_business"
  on public.business_integrations for all
  using (
    exists (
      select 1 from public.businesses b
      where b.id = business_integrations.business_id
        and b.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.businesses b
      where b.id = business_integrations.business_id
        and b.user_id = auth.uid()
    )
  );

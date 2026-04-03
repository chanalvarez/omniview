-- Secure integration storage (API keys server-written only; never expose in client SELECT).
-- Run in Supabase SQL Editor after 001_omniview_businesses.sql.

create table if not exists public.external_connections (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses on delete cascade,
  provider text not null default 'servewise',
  base_url text not null,
  api_key text not null,
  metrics_path text not null default '/v1/metrics',
  verified_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (business_id)
);

create index if not exists external_connections_business_id_idx
  on public.external_connections (business_id);

alter table public.external_connections enable row level security;

drop policy if exists "external_connections_all_via_business" on public.external_connections;

create policy "external_connections_all_via_business"
  on public.external_connections for all
  using (
    exists (
      select 1 from public.businesses b
      where b.id = external_connections.business_id
        and b.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.businesses b
      where b.id = external_connections.business_id
        and b.user_id = auth.uid()
    )
  );

-- Optional: copy from legacy table if it exists.
do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'business_integrations'
  ) then
    insert into public.external_connections (
      business_id, provider, base_url, api_key, metrics_path, verified_at, updated_at
    )
    select
      business_id,
      provider,
      base_url,
      api_key,
      metrics_path,
      updated_at,
      updated_at
    from public.business_integrations
    on conflict (business_id) do nothing;
  end if;
end $$;

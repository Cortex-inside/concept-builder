alter table public.companies
  add column if not exists completed_projects integer not null default 0,
  add column if not exists certifications text[] not null default '{}',
  add column if not exists experience_summary text;

alter table public.requests
  add column if not exists participation_mode text not null default 'open',
  add column if not exists require_verified boolean not null default false,
  add column if not exists min_years_in_market integer,
  add column if not exists min_completed_projects integer,
  add column if not exists required_certifications text[] not null default '{}',
  add column if not exists required_experience text,
  add column if not exists qualification_note text;

alter table public.account_modules
  add column if not exists advanced_qualification_enabled boolean not null default false,
  add column if not exists supplier_invites_enabled boolean not null default false;

alter table public.requests
  drop constraint if exists requests_participation_mode_check;

alter table public.requests
  add constraint requests_participation_mode_check
  check (participation_mode in ('open','qualified','invite_only'));

alter table public.companies
  drop constraint if exists companies_completed_projects_check;

alter table public.companies
  add constraint companies_completed_projects_check
  check (completed_projects >= 0);

alter table public.requests
  drop constraint if exists requests_min_years_in_market_check;

alter table public.requests
  add constraint requests_min_years_in_market_check
  check (min_years_in_market is null or min_years_in_market >= 0);

alter table public.requests
  drop constraint if exists requests_min_completed_projects_check;

alter table public.requests
  add constraint requests_min_completed_projects_check
  check (min_completed_projects is null or min_completed_projects >= 0);

create index if not exists requests_participation_mode_idx on public.requests(participation_mode);

alter table public.account_modules enable row level security;

create policy if not exists "Users can read own account modules"
  on public.account_modules for select
  to authenticated
  using (auth.uid() = user_id);

create policy if not exists "Users can update own account modules"
  on public.account_modules for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

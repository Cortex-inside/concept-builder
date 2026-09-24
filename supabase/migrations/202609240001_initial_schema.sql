create extension if not exists pgcrypto;

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  sector text not null,
  province text not null,
  description text not null,
  services text[] not null default '{}',
  email text,
  phone text,
  verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.companies
  add column if not exists trade_name text,
  add column if not exists slug text,
  add column if not exists website text,
  add column if not exists whatsapp text,
  add column if not exists city text,
  add column if not exists address text,
  add column if not exists entity_type text,
  add column if not exists employees text,
  add column if not exists founded_year integer,
  add column if not exists nuit text,
  add column if not exists served_provinces text[] not null default '{}',
  add column if not exists verification_status text not null default 'unverified',
  add column if not exists verification_submitted_at timestamptz,
  add column if not exists verification_reviewed_at timestamptz,
  add column if not exists verification_reviewed_by uuid references auth.users(id),
  add column if not exists verification_notes text;

create unique index if not exists companies_slug_unique_idx on public.companies(slug) where slug is not null;
create index if not exists companies_sector_idx on public.companies(sector);
create index if not exists companies_province_idx on public.companies(province);
create index if not exists companies_verification_status_idx on public.companies(verification_status);

create table if not exists public.requests (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  sector text not null,
  province text not null,
  budget text,
  description text not null,
  status text not null default 'open' check (status in ('open','review','closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.proposal_invitations (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.requests(id) on delete cascade,
  supplier_id uuid not null references public.companies(id) on delete cascade,
  status text not null default 'invited' check (status in ('invited','accepted','declined')),
  created_at timestamptz not null default now(),
  unique(request_id, supplier_id)
);

create table if not exists public.proposals (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.requests(id) on delete cascade,
  supplier_id uuid not null references public.companies(id) on delete cascade,
  amount numeric,
  currency text not null default 'MZN',
  delivery_days integer,
  notes text,
  status text not null default 'received' check (status in ('draft','received','accepted','rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  preferred_language text not null default 'pt' check (preferred_language in ('pt','en')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('user','moderator','admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.company_verification_documents (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  document_type text not null,
  storage_path text not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id),
  notes text
);

create index if not exists requests_owner_idx on public.requests(owner_id);
create index if not exists requests_status_idx on public.requests(status);
create index if not exists proposals_request_idx on public.proposals(request_id);
create index if not exists company_verification_documents_company_idx on public.company_verification_documents(company_id);
create index if not exists user_roles_role_idx on public.user_roles(role);

alter table public.companies enable row level security;
alter table public.requests enable row level security;
alter table public.proposal_invitations enable row level security;
alter table public.proposals enable row level security;
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.company_verification_documents enable row level security;

create policy if not exists "Public can read companies" on public.companies for select using (true);
create policy if not exists "Users manage their company" on public.companies for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy if not exists "Authenticated users can read open requests" on public.requests for select using (auth.uid() is not null and (status = 'open' or owner_id = auth.uid()));
create policy if not exists "Users manage their requests" on public.requests for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy if not exists "Users can read own profile" on public.profiles for select using (auth.uid() = id);
create policy if not exists "Users can manage own profile" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy if not exists "Users can read own role" on public.user_roles for select using (auth.uid() = user_id);
create policy if not exists "Company owners can read verification documents" on public.company_verification_documents for select to authenticated using (exists (select 1 from public.companies c where c.id = company_id and c.owner_id = auth.uid()));
create policy if not exists "Company owners can submit verification documents" on public.company_verification_documents for insert to authenticated with check (exists (select 1 from public.companies c where c.id = company_id and c.owner_id = auth.uid()));
create policy if not exists "Company owners can update verification documents" on public.company_verification_documents for update to authenticated using (exists (select 1 from public.companies c where c.id = company_id and c.owner_id = auth.uid())) with check (exists (select 1 from public.companies c where c.id = company_id and c.owner_id = auth.uid()));

create schema if not exists app_private;
create or replace function app_private.handle_new_user()
returns trigger language plpgsql security definer set search_path = public, app_private as $$

begin
  insert into public.profiles (id, full_name, phone, preferred_language)
  values (new.id, nullif(new.raw_user_meta_data ->> 'full_name',''), nullif(new.raw_user_meta_data ->> 'phone',''), case when new.raw_user_meta_data ->> 'preferred_language' = 'en' then 'en' else 'pt' end)
  on conflict (id) do nothing;
  insert into public.user_roles (user_id, role) values (new.id, 'user') on conflict (user_id) do nothing;
  insert into public.account_modules (user_id) values (new.id) on conflict (user_id) do nothing;
  return new;
end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function app_private.handle_new_user();

create policy if not exists "Request owners and invited suppliers can read invitations" on public.proposal_invitations for select using (exists (select 1 from public.requests r where r.id = request_id and r.owner_id = auth.uid()) or exists (select 1 from public.companies c where c.id = supplier_id and c.owner_id = auth.uid()));
create policy if not exists "Request owners can create invitations" on public.proposal_invitations for insert with check (exists (select 1 from public.requests r where r.id = request_id and r.owner_id = auth.uid()));
create policy if not exists "Proposal participants can read proposals" on public.proposals for select using (exists (select 1 from public.requests r where r.id = request_id and r.owner_id = auth.uid()) or exists (select 1 from public.companies c where c.id = supplier_id and c.owner_id = auth.uid()));
create policy if not exists "Invited suppliers can create proposals" on public.proposals for insert with check (exists (select 1 from public.companies c join public.proposal_invitations i on i.supplier_id = c.id where c.id = supplier_id and c.owner_id = auth.uid() and i.request_id = proposals.request_id and i.status in ('invited','accepted')));
create policy if not exists "Proposal participants can update proposals" on public.proposals for update using (exists (select 1 from public.requests r where r.id = request_id and r.owner_id = auth.uid()) or exists (select 1 from public.companies c where c.id = supplier_id and c.owner_id = auth.uid()));

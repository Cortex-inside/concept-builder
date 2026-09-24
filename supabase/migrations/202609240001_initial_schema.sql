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

create index if not exists companies_sector_idx on public.companies(sector);
create index if not exists companies_province_idx on public.companies(province);
create index if not exists requests_owner_idx on public.requests(owner_id);
create index if not exists requests_status_idx on public.requests(status);
create index if not exists proposals_request_idx on public.proposals(request_id);

alter table public.companies enable row level security;
alter table public.requests enable row level security;
alter table public.proposal_invitations enable row level security;
alter table public.proposals enable row level security;

create policy "Public can read companies"
  on public.companies for select using (true);

create policy "Users manage their company"
  on public.companies for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "Authenticated users can read open requests"
  on public.requests for select using (auth.uid() is not null and (status = 'open' or owner_id = auth.uid()));

create policy "Users manage their requests"
  on public.requests for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "Request owners and invited suppliers can read invitations"
  on public.proposal_invitations for select
  using (
    exists (select 1 from public.requests r where r.id = request_id and r.owner_id = auth.uid())
    or exists (select 1 from public.companies c where c.id = supplier_id and c.owner_id = auth.uid())
  );

create policy "Request owners can create invitations"
  on public.proposal_invitations for insert
  with check (exists (select 1 from public.requests r where r.id = request_id and r.owner_id = auth.uid()));

create policy "Proposal participants can read proposals"
  on public.proposals for select
  using (
    exists (select 1 from public.requests r where r.id = request_id and r.owner_id = auth.uid())
    or exists (select 1 from public.companies c where c.id = supplier_id and c.owner_id = auth.uid())
  );

create policy "Invited suppliers can create proposals"
  on public.proposals for insert
  with check (
    exists (
      select 1 from public.companies c
      join public.proposal_invitations i on i.supplier_id = c.id
      where c.id = supplier_id and c.owner_id = auth.uid() and i.request_id = request_id and i.status in ('invited','accepted')
    )
  );

create policy "Proposal participants can update proposals"
  on public.proposals for update
  using (
    exists (select 1 from public.requests r where r.id = request_id and r.owner_id = auth.uid())
    or exists (select 1 from public.companies c where c.id = supplier_id and c.owner_id = auth.uid())
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
  role text not null check (role in ('buyer','supplier','buyer_supplier','moderator','admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists user_roles_role_idx on public.user_roles(role);

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users can manage own profile"
  on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "Users can read own role"
  on public.user_roles for select using (auth.uid() = user_id);

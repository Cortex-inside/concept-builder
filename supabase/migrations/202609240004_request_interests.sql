create table if not exists public.request_interests (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.requests(id) on delete cascade,
  supplier_id uuid not null references public.companies(id) on delete cascade,
  status text not null default 'interested' check (status in ('interested','withdrawn')),
  created_at timestamptz not null default now(),
  unique(request_id,supplier_id)
);

alter table public.request_interests enable row level security;

create or replace function public.company_qualifies_for_request(p_request_id uuid, p_company_id uuid)
returns boolean
language sql
stable
set search_path = public, pg_temp
as $
  select exists (
    select 1
    from public.requests r
    join public.companies c on c.id=p_company_id
    where r.id=p_request_id
      and (not r.require_verified or c.verified)
      and (r.min_years_in_market is null or (c.founded_year is not null and extract(year from now())::int-c.founded_year >= r.min_years_in_market))
      and (r.min_completed_projects is null or c.completed_projects >= r.min_completed_projects)
      and (cardinality(r.required_certifications)=0 or r.required_certifications <@ c.certifications)
  );
$$;

create index if not exists request_interests_request_idx on public.request_interests(request_id);
create index if not exists request_interests_supplier_idx on public.request_interests(supplier_id);

drop policy if exists "Users can read request interests they participate in" on public.request_interests;
create policy "Users can read request interests they participate in" on public.request_interests for select to authenticated
using (
  exists (select 1 from public.requests r where r.id=request_id and r.owner_id=auth.uid())
  or exists (select 1 from public.companies c where c.id=supplier_id and c.owner_id=auth.uid())
);

drop policy if exists "Suppliers can express interest" on public.request_interests;
create policy "Suppliers can express interest" on public.request_interests for insert to authenticated
with check (
  exists (select 1 from public.companies c where c.id=supplier_id and c.owner_id=auth.uid())
  and exists (
    select 1 from public.requests r
    where r.id=request_id and r.status='open' and r.owner_id<>auth.uid()
      and r.participation_mode in ('open','qualified')
  )
  and public.company_qualifies_for_request(request_id,supplier_id)
);

drop policy if exists "Suppliers can withdraw interest" on public.request_interests;
create policy "Suppliers can withdraw interest" on public.request_interests for update to authenticated
using (exists (select 1 from public.companies c where c.id=supplier_id and c.owner_id=auth.uid()))
with check (exists (select 1 from public.companies c where c.id=supplier_id and c.owner_id=auth.uid()));

drop policy if exists "Invited suppliers can create proposals" on public.proposals;
drop policy if exists "Eligible suppliers can create proposals" on public.proposals;
create policy "Eligible suppliers can create proposals" on public.proposals for insert to authenticated
with check (
  exists (select 1 from public.companies c where c.id=supplier_id and c.owner_id=auth.uid())
  and (
    exists (
      select 1 from public.proposal_invitations i
      where i.supplier_id=supplier_id and i.request_id=proposals.request_id
        and i.status in ('invited','accepted')
    )
    or exists (
      select 1 from public.request_interests ri
      where ri.supplier_id=supplier_id and ri.request_id=proposals.request_id
        and ri.status='interested'
    )
  )
  and public.company_qualifies_for_request(proposals.request_id,supplier_id)
);

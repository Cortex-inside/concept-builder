create table if not exists public.request_interests (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.requests(id) on delete cascade,
  supplier_id uuid not null references public.companies(id) on delete cascade,
  status text not null default 'interested' check (status in ('interested','withdrawn')),
  created_at timestamptz not null default now(),
  unique(request_id,supplier_id)
);

alter table public.request_interests enable row level security;

create policy "Users can read request interests they participate in"
on public.request_interests for select to authenticated
using (
  exists (select 1 from public.requests r where r.id=request_id and r.owner_id=auth.uid())
  or exists (select 1 from public.companies c where c.id=supplier_id and c.owner_id=auth.uid())
);

create policy "Suppliers can express interest"
on public.request_interests for insert to authenticated
with check (
  exists (select 1 from public.companies c where c.id=supplier_id and c.owner_id=auth.uid())
  and exists (
    select 1 from public.requests r
    where r.id=request_id and r.status='open' and r.owner_id<>auth.uid()
      and r.participation_mode in ('open','qualified')
  )
);

create policy "Suppliers can withdraw interest"
on public.request_interests for update to authenticated
using (exists (select 1 from public.companies c where c.id=supplier_id and c.owner_id=auth.uid()))
with check (exists (select 1 from public.companies c where c.id=supplier_id and c.owner_id=auth.uid()));

drop policy if exists "Invited suppliers can create proposals" on public.proposals;
create policy "Eligible suppliers can create proposals"
on public.proposals for insert to authenticated
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
      join public.requests r on r.id=ri.request_id
      where ri.supplier_id=supplier_id and ri.request_id=proposals.request_id
        and ri.status='interested' and r.participation_mode in ('open','qualified')
    )
  )
);

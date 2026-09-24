alter table public.requests
  add column if not exists tender_summary text,
  add column if not exists document_access text not null default 'none',
  add column if not exists document_price numeric(14,2),
  add column if not exists document_currency text default 'MZN',
  add column if not exists payment_instructions text,
  add column if not exists terms_content text;

alter table public.requests drop constraint if exists requests_document_access_check;
alter table public.requests add constraint requests_document_access_check check (document_access in ('none','free','paid'));

create table if not exists public.request_documents (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.requests(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  file_name text not null,
  storage_path text not null,
  file_size bigint,
  mime_type text,
  version integer not null default 1,
  is_public boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.request_documents enable row level security;

create table if not exists public.request_document_access (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.requests(id) on delete cascade,
  document_id uuid not null references public.request_documents(id) on delete cascade,
  participant_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check(status in ('pending','approved','rejected','expired')),
  payment_proof_path text,
  payment_proof_file_name text,
  payment_submitted_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id),
  monitor_flag boolean not null default false,
  monitor_note text,
  created_at timestamptz not null default now(),
  unique(document_id,participant_id)
);
alter table public.request_document_access enable row level security;

create table if not exists public.request_monitor_flags (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.requests(id) on delete cascade,
  reporter_id uuid references auth.users(id) on delete set null,
  reason text not null,
  status text not null default 'open' check(status in ('open','reviewing','resolved','dismissed')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);
alter table public.request_monitor_flags enable row level security;

create index if not exists request_documents_request_idx on public.request_documents(request_id);
create index if not exists request_document_access_document_idx on public.request_document_access(document_id,status);
create index if not exists request_document_access_participant_idx on public.request_document_access(participant_id,status);
create index if not exists request_monitor_flags_request_idx on public.request_monitor_flags(request_id,status);

drop policy if exists "Owners manage request documents" on public.request_documents;
create policy "Owners manage request documents" on public.request_documents for all to authenticated
using (owner_id=auth.uid())
with check (owner_id=auth.uid());

drop policy if exists "Participants read request documents" on public.request_documents;
create policy "Participants read request documents" on public.request_documents for select to authenticated
using (
  exists (select 1 from public.requests r where r.id=request_id and r.owner_id=auth.uid())
  or exists (select 1 from public.request_document_access a where a.document_id=request_documents.id and a.participant_id=auth.uid() and a.status='approved')
  or (
    is_public
    and exists (
      select 1
      from public.requests r
      join public.companies c on c.owner_id=auth.uid()
      where r.id=request_id
        and r.status='open'
        and r.owner_id<>auth.uid()
        and (
          (r.participation_mode in ('open','qualified') and public.company_qualifies_for_request(r.id,c.id))
          or (
            r.participation_mode='invite_only'
            and exists (
              select 1 from public.proposal_invitations i
              where i.request_id=r.id and i.supplier_id=c.id and i.status in ('invited','accepted')
            )
          )
        )
    )
  )
);

drop policy if exists "Participants request document access" on public.request_document_access;
create policy "Participants request document access" on public.request_document_access for insert to authenticated
with check (
  participant_id=auth.uid()
  and exists (
    select 1
    from public.requests r
    join public.companies c on c.owner_id=auth.uid()
    where r.id=request_id
      and r.status='open'
      and r.owner_id<>auth.uid()
      and (
        (r.participation_mode in ('open','qualified') and public.company_qualifies_for_request(r.id,c.id))
        or (
          r.participation_mode='invite_only'
          and exists (
            select 1 from public.proposal_invitations i
            where i.request_id=r.id and i.supplier_id=c.id and i.status in ('invited','accepted')
          )
        )
      )
  )
  and exists (select 1 from public.request_documents d where d.id=document_id and d.request_id=request_id)
);

drop policy if exists "Participants and owners read document access" on public.request_document_access;
create policy "Participants and owners read document access" on public.request_document_access for select to authenticated
using (
  participant_id=auth.uid()
  or exists (select 1 from public.requests r where r.id=request_id and r.owner_id=auth.uid())
);

drop policy if exists "Owners review document access" on public.request_document_access;
create policy "Owners review document access" on public.request_document_access for update to authenticated
using (exists (select 1 from public.requests r where r.id=request_id and r.owner_id=auth.uid()))
with check (exists (select 1 from public.requests r where r.id=request_id and r.owner_id=auth.uid()));

drop policy if exists "Users can report request issues" on public.request_monitor_flags;
create policy "Users can report request issues" on public.request_monitor_flags for insert to authenticated
with check (reporter_id=auth.uid());

drop policy if exists "Reporters read own flags" on public.request_monitor_flags;
create policy "Reporters read own flags" on public.request_monitor_flags for select to authenticated
using (reporter_id=auth.uid());

insert into storage.buckets (id,name,public)
values ('request-documents','request-documents',false)
on conflict (id) do nothing;

drop policy if exists "Request document owner upload" on storage.objects;
create policy "Request document owner upload" on storage.objects for insert to authenticated
with check (
  bucket_id='request-documents'
  and exists (
    select 1 from public.requests r
    where r.owner_id=auth.uid()
      and name like 'requests/'||r.id||'/documents/%'
  )
);

drop policy if exists "Request participant upload payment proof" on storage.objects;
create policy "Request participant upload payment proof" on storage.objects for insert to authenticated
with check (
  bucket_id='request-documents'
  and name like 'requests/'||auth.uid()||'/payments/%'
);

drop policy if exists "Request document read access" on storage.objects;
create policy "Request document read access" on storage.objects for select to authenticated
using (
  bucket_id='request-documents'
  and (
    exists (
      select 1 from public.request_documents d
      where d.storage_path=name
        and (
          d.owner_id=auth.uid()
          or (
            d.is_public
            and (
              exists (
                select 1
                from public.requests r
                join public.companies c on c.owner_id=auth.uid()
                where r.id=d.request_id
                  and r.status='open'
                  and r.owner_id<>auth.uid()
                  and (
                    (r.participation_mode in ('open','qualified') and public.company_qualifies_for_request(r.id,c.id))
                    or (
                      r.participation_mode='invite_only'
                      and exists (
                        select 1 from public.proposal_invitations i
                        where i.request_id=r.id and i.supplier_id=c.id and i.status in ('invited','accepted')
                      )
                    )
                  )
              )
            )
          )
        )
    )
    or exists (
      select 1 from public.request_document_access a
      where a.payment_proof_path=name and a.participant_id=auth.uid()
    )
    or exists (
      select 1 from public.request_document_access a
      where a.payment_proof_path=name
        and exists (select 1 from public.requests r where r.id=a.request_id and r.owner_id=auth.uid())
    )
  )
);

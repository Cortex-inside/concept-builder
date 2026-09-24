
create type public.app_role as enum ('admin', 'moderator', 'user');
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  role app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "own roles readable" on public.user_roles for select to authenticated using (user_id = auth.uid());

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create table public.profiles (
  id uuid primary key,
  full_name text,
  phone text,
  created_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "profiles self select" on public.profiles for select to authenticated using (id = auth.uid());
create policy "profiles self insert" on public.profiles for insert to authenticated with check (id = auth.uid());
create policy "profiles self update" on public.profiles for update to authenticated using (id = auth.uid());

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name) values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'));
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create table public.sectors (
  id serial primary key,
  slug text unique not null,
  name_pt text not null,
  name_en text not null
);
grant select on public.sectors to anon, authenticated;
grant all on public.sectors to service_role;
alter table public.sectors enable row level security;
create policy "sectors public" on public.sectors for select to anon, authenticated using (true);

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid,
  slug text unique not null,
  name text not null,
  trade_name text,
  nuit text,
  entity_type text,
  founded_year int,
  sector_id int references public.sectors(id),
  description text,
  phone text,
  whatsapp text,
  email text,
  website text,
  province text not null default 'Maputo Cidade',
  city text,
  district text,
  bairro text,
  address text,
  employees text,
  served_provinces text[] not null default '{}',
  services text[] not null default '{}',
  plan text not null default 'free',
  verif_contact boolean not null default false,
  verif_company boolean not null default false,
  verif_service boolean not null default false,
  verif_experience boolean not null default false,
  search tsvector,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index companies_search_idx on public.companies using gin(search);
create index companies_owner_idx on public.companies(owner_id);
grant select on public.companies to anon, authenticated;
grant insert, update, delete on public.companies to authenticated;
grant all on public.companies to service_role;
alter table public.companies enable row level security;
create policy "companies public read" on public.companies for select to anon, authenticated using (true);
create policy "companies owner insert" on public.companies for insert to authenticated with check (owner_id = auth.uid());
create policy "companies owner update" on public.companies for update to authenticated using (owner_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "companies owner delete" on public.companies for delete to authenticated using (owner_id = auth.uid());

create or replace function public.companies_before_write()
returns trigger language plpgsql set search_path = public as $$
begin
  new.search := setweight(to_tsvector('portuguese', coalesce(new.name,'') || ' ' || coalesce(new.trade_name,'')), 'A')
    || setweight(to_tsvector('portuguese', array_to_string(new.services, ' ')), 'B')
    || setweight(to_tsvector('portuguese', coalesce(new.description,'') || ' ' || coalesce(new.city,'') || ' ' || coalesce(new.province,'')), 'C');
  new.updated_at := now();
  if auth.uid() is not null and not public.has_role(auth.uid(),'admin') then
    if tg_op = 'INSERT' then
      new.verif_company := false; new.verif_service := false; new.verif_experience := false; new.verif_contact := false; new.plan := 'free';
    else
      new.verif_company := old.verif_company; new.verif_service := old.verif_service;
      new.verif_experience := old.verif_experience; new.verif_contact := old.verif_contact; new.plan := old.plan;
    end if;
  end if;
  return new;
end $$;
create trigger companies_bw before insert or update on public.companies for each row execute function public.companies_before_write();

create or replace function public.is_company_owner(_company uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.companies where id = _company and owner_id = auth.uid())
$$;

create table public.portfolio_items (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  title text not null,
  description text,
  client text,
  year int,
  category text,
  created_at timestamptz not null default now()
);
grant select on public.portfolio_items to anon, authenticated;
grant insert, update, delete on public.portfolio_items to authenticated;
grant all on public.portfolio_items to service_role;
alter table public.portfolio_items enable row level security;
create policy "portfolio public" on public.portfolio_items for select to anon, authenticated using (true);
create policy "portfolio owner write" on public.portfolio_items for all to authenticated using (public.is_company_owner(company_id)) with check (public.is_company_owner(company_id));

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  author_id uuid not null,
  author_name text,
  rating int not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  unique (company_id, author_id)
);
grant select on public.reviews to anon, authenticated;
grant insert, update, delete on public.reviews to authenticated;
grant all on public.reviews to service_role;
alter table public.reviews enable row level security;
create policy "reviews public" on public.reviews for select to anon, authenticated using (true);
create policy "reviews own insert" on public.reviews for insert to authenticated with check (author_id = auth.uid() and not public.is_company_owner(company_id));
create policy "reviews own update" on public.reviews for update to authenticated using (author_id = auth.uid());
create policy "reviews own delete" on public.reviews for delete to authenticated using (author_id = auth.uid());

create table public.company_events (
  id bigserial primary key,
  company_id uuid not null references public.companies(id) on delete cascade,
  type text not null check (type in ('view','phone','whatsapp','email','website')),
  created_at timestamptz not null default now()
);
grant insert on public.company_events to anon, authenticated;
grant select on public.company_events to authenticated;
grant usage on sequence public.company_events_id_seq to anon, authenticated;
grant all on public.company_events to service_role;
alter table public.company_events enable row level security;
create policy "events insert any" on public.company_events for insert to anon, authenticated with check (true);
create policy "events owner read" on public.company_events for select to authenticated using (public.is_company_owner(company_id));

create table public.requests (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null,
  buyer_company text,
  title text not null,
  description text,
  sector_id int references public.sectors(id),
  service text,
  province text,
  city text,
  deadline text,
  budget text,
  quantity text,
  company_size text,
  status text not null default 'open' check (status in ('open','closed')),
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.requests to authenticated;
grant all on public.requests to service_role;
alter table public.requests enable row level security;

create or replace function public.is_request_buyer(_req uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.requests where id = _req and buyer_id = auth.uid())
$$;

create table public.rfq_invitations (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.requests(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  match_score int not null default 0,
  status text not null default 'invited' check (status in ('invited','accepted','declined','clarification')),
  message text,
  created_at timestamptz not null default now(),
  unique (request_id, company_id)
);
grant select, insert, update, delete on public.rfq_invitations to authenticated;
grant all on public.rfq_invitations to service_role;
alter table public.rfq_invitations enable row level security;
create policy "inv buyer all" on public.rfq_invitations for all to authenticated using (public.is_request_buyer(request_id)) with check (public.is_request_buyer(request_id));
create policy "inv supplier read" on public.rfq_invitations for select to authenticated using (public.is_company_owner(company_id));
create policy "inv supplier update" on public.rfq_invitations for update to authenticated using (public.is_company_owner(company_id));

create or replace function public.is_invited_owner(_req uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.rfq_invitations i join public.companies c on c.id = i.company_id
    where i.request_id = _req and c.owner_id = auth.uid())
$$;

create policy "req buyer all" on public.requests for all to authenticated using (buyer_id = auth.uid()) with check (buyer_id = auth.uid());
create policy "req open read" on public.requests for select to authenticated using (status = 'open' or public.is_invited_owner(id));

create table public.proposals (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.requests(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  price numeric,
  currency text not null default 'MZN',
  delivery_time text,
  validity_date date,
  payment_terms text,
  warranty text,
  notes text,
  status text not null default 'submitted' check (status in ('draft','submitted','under_review','clarification','shortlisted','rejected','accepted','expired')),
  created_at timestamptz not null default now(),
  unique (request_id, company_id)
);
grant select, insert, update, delete on public.proposals to authenticated;
grant all on public.proposals to service_role;
alter table public.proposals enable row level security;
create policy "prop supplier all" on public.proposals for all to authenticated using (public.is_company_owner(company_id)) with check (public.is_company_owner(company_id));
create policy "prop buyer read" on public.proposals for select to authenticated using (public.is_request_buyer(request_id));
create policy "prop buyer update" on public.proposals for update to authenticated using (public.is_request_buyer(request_id));

insert into public.sectors (slug, name_pt, name_en) values
('contabilidade','Contabilidade e Auditoria','Accounting & Audit'),
('construcao','Construção Civil','Construction'),
('logistica','Logística e Transporte','Logistics & Transport'),
('tecnologia','Tecnologias de Informação','Information Technology'),
('seguranca','Segurança Privada','Private Security'),
('rh','Recursos Humanos e Formação','HR & Training'),
('energia','Energia e Electricidade','Energy & Power'),
('agro','Agricultura e Agro-indústria','Agriculture & Agribusiness'),
('juridico','Serviços Jurídicos','Legal Services'),
('limpeza','Limpeza e Facility Management','Cleaning & Facilities'),
('marketing','Marketing e Comunicação','Marketing & Communications'),
('saude','Saúde e Equipamento Médico','Health & Medical Supplies');

insert into public.companies (slug,name,trade_name,nuit,entity_type,founded_year,sector_id,description,phone,whatsapp,email,website,province,city,bairro,address,employees,served_provinces,services,plan,verif_contact,verif_company,verif_service,verif_experience) values
('contamoz-auditores','ContaMoz Auditores, Lda','ContaMoz','400123456','Lda',2009,(select id from sectors where slug='contabilidade'),'Contabilidade, auditoria externa e processamento salarial para PMEs e ONGs.','+258 21 300 100','+258 84 300 1001','geral@contamoz.co.mz','contamoz.co.mz','Maputo Cidade','Maputo','Polana Cimento','Av. Julius Nyerere, 1250','26-50','{"Maputo Cidade","Maputo Província","Gaza"}','{"contabilidade","auditoria","folha salarial","fiscalidade"}','business',true,true,true,true),
('fiscal-plus','Fiscal Plus Consultores','Fiscal Plus','400223344','Lda',2016,(select id from sectors where slug='contabilidade'),'Consultoria fiscal, declarações ao fisco e contabilidade organizada.','+258 21 410 220','+258 82 410 2200','info@fiscalplus.co.mz',null,'Maputo Província','Matola','Machava','Rua da Machava, 45','6-25','{"Maputo Província","Maputo Cidade"}','{"contabilidade","fiscalidade","consultoria"}','free',true,false,false,false),
('sul-construcoes','Construções do Sul, SA','ConSul','400334455','SA',2004,(select id from sectors where slug='construcao'),'Obras públicas, edifícios comerciais e reabilitação de infra-estruturas.','+258 21 480 900','+258 84 480 9000','obras@consul.co.mz','consul.co.mz','Maputo Cidade','Maputo','Malhangalene','Av. Vladimir Lenine, 2100','200+','{"Maputo Cidade","Maputo Província","Gaza","Inhambane"}','{"construção civil","reabilitação","obras públicas","fiscalização"}','professional',true,true,true,true),
('beira-logistics','Beira Logistics Lda','BeiraLog','400445566','Lda',2011,(select id from sectors where slug='logistica'),'Transporte rodoviário de carga, desalfandegamento e armazenagem no corredor da Beira.','+258 23 320 550','+258 84 320 5500','ops@beiralog.co.mz','beiralog.co.mz','Sofala','Beira','Ponta Gêa','Rua Major Serpa Pinto, 12','51-200','{"Sofala","Manica","Tete","Zambézia"}','{"transporte de carga","desalfandegamento","armazenagem"}','business',true,true,true,false),
('nampula-tech','Nampula Tech Solutions','NTS','400556677','Lda',2018,(select id from sectors where slug='tecnologia'),'Redes, suporte informático e desenvolvimento de software para empresas.','+258 26 210 330','+258 86 210 3300','ola@nts.co.mz',null,'Nampula','Nampula','Muahivire','Av. Eduardo Mondlane, 800','6-25','{"Nampula","Cabo Delgado","Niassa"}','{"redes","suporte informático","desenvolvimento de software"}','free',true,true,false,false),
('maputo-digital','Maputo Digital Lda','MD','400667788','Lda',2014,(select id from sectors where slug='tecnologia'),'Sistemas ERP, desenvolvimento web e cloud para médias empresas.','+258 21 490 440','+258 84 490 4400','comercial@mdigital.co.mz','mdigital.co.mz','Maputo Cidade','Maputo','Sommerschield','Rua da Resistência, 1600','26-50','{"Maputo Cidade","Maputo Província","Sofala"}','{"desenvolvimento de software","ERP","cloud","redes"}','business',true,true,true,true),
('guarda-forte','Guarda Forte Segurança','Guarda Forte','400778899','Lda',2007,(select id from sectors where slug='seguranca'),'Segurança física, vigilância electrónica e escolta para indústria e armazéns.','+258 21 750 120','+258 84 750 1200','seguranca@guardaforte.co.mz',null,'Maputo Província','Matola','Zona Industrial','Estrada Nacional 4, km 8','200+','{"Maputo Província","Maputo Cidade","Gaza"}','{"segurança física","vigilância electrónica","CCTV"}','business',true,true,true,false),
('capital-humano','Capital Humano Consultoria','CHC','400889900','Lda',2012,(select id from sectors where slug='rh'),'Recrutamento, formação em RH e gestão de folha salarial.','+258 21 320 780','+258 82 320 7800','rh@capitalhumano.co.mz','capitalhumano.co.mz','Maputo Cidade','Maputo','Coop','Av. Mao Tse Tung, 540','6-25','{"Maputo Cidade","Sofala","Nampula"}','{"recrutamento","formação","folha salarial","gestão de RH"}','professional',true,true,true,true),
('solar-tete','Solar Tete Energia','SolarTete','400990011','Lda',2019,(select id from sectors where slug='energia'),'Instalação de sistemas solares, geradores e manutenção eléctrica.','+258 25 222 610','+258 87 222 6100','info@solartete.co.mz',null,'Tete','Tete','Chingodzi','Av. da Independência, 77','6-25','{"Tete","Manica","Zambézia"}','{"energia solar","instalação eléctrica","geradores"}','free',true,false,false,false),
('agro-chimoio','AgroChimoio, Lda','AgroChimoio','401001122','Lda',2010,(select id from sectors where slug='agro'),'Insumos agrícolas, assistência técnica e compra de produção.','+258 25 124 300','+258 84 124 3000','vendas@agrochimoio.co.mz',null,'Manica','Chimoio','Centro','Rua do Mercado, 3','26-50','{"Manica","Sofala","Tete"}','{"insumos agrícolas","assistência técnica","sementes"}','business',true,true,true,false),
('lexmoz-advogados','LexMoz Advogados','LexMoz','401112233','Sociedade de Advogados',2008,(select id from sectors where slug='juridico'),'Direito comercial, laboral e contratos públicos.','+258 21 360 900','+258 84 360 9000','lex@lexmoz.co.mz','lexmoz.co.mz','Maputo Cidade','Maputo','Polana Cimento','Av. 24 de Julho, 1097','6-25','{"Maputo Cidade"}','{"direito comercial","direito laboral","contratos"}','professional',true,true,true,true),
('limpa-bem','LimpaBem Serviços','LimpaBem','401223344','Lda',2015,(select id from sectors where slug='limpeza'),'Limpeza de escritórios, jardinagem e facility management.','+258 21 470 330','+258 84 470 3300','geral@limpabem.co.mz',null,'Maputo Cidade','Maputo','Alto Maé','Av. Guerra Popular, 900','51-200','{"Maputo Cidade","Maputo Província"}','{"limpeza","jardinagem","facility management"}','free',true,false,false,false),
('pemba-marine','Pemba Marine Services','PMS','401334455','Lda',2013,(select id from sectors where slug='logistica'),'Serviços portuários, logística offshore e fornecimento a projectos de gás.','+258 27 221 880','+258 84 221 8800','ops@pembamarine.co.mz',null,'Cabo Delgado','Pemba','Wimbe','Av. Marginal, 15','26-50','{"Cabo Delgado","Nampula"}','{"logística portuária","transporte de carga","fornecimento"}','business',true,true,false,true),
('medsupply-moz','MedSupply Moçambique','MedSupply','401445566','Lda',2017,(select id from sectors where slug='saude'),'Distribuição de equipamento médico e consumíveis hospitalares.','+258 21 330 440','+258 84 330 4400','vendas@medsupply.co.mz',null,'Maputo Cidade','Maputo','Central','Av. Karl Marx, 300','6-25','{"Maputo Cidade","Gaza","Inhambane"}','{"equipamento médico","consumíveis"}','free',true,true,false,false);

insert into public.portfolio_items (company_id,title,description,client,year,category)
select id,'Auditoria anual a rede de farmácias','Auditoria às demonstrações financeiras de 12 lojas.','Cliente confidencial',2024,'Auditoria' from public.companies where slug='contamoz-auditores';
insert into public.portfolio_items (company_id,title,description,client,year,category)
select id,'Reabilitação do mercado municipal','Reabilitação estrutural e cobertura, 3.200 m².','Município da Matola',2023,'Obras públicas' from public.companies where slug='sul-construcoes';
insert into public.portfolio_items (company_id,title,description,client,year,category)
select id,'Implementação ERP para distribuidora','Módulos de stock, vendas e facturação.','Distribuidora do Sul',2024,'Software' from public.companies where slug='maputo-digital';

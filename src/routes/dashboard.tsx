import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight, Bell, Building2, CheckCircle2, ChevronRight, CircleUserRound,
  FileText, LayoutDashboard, LogOut, Menu, PackageSearch, Plus, Search, Settings,
  ShoppingBag, Store, UserRound, X,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { supabase } from "../lib/supabase";
import type { Request } from "../lib/concept-data";

export const Route = createFileRoute("/dashboard")({ component: Dashboard });

type AccountModules = { buying_enabled: boolean; selling_enabled: boolean };

function Dashboard() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [modules, setModules] = useState<AccountModules>({ buying_enabled: false, selling_enabled: false });
  const [fullName, setFullName] = useState("Utilizador");
  const [companyName, setCompanyName] = useState("A sua empresa");
  const [mobileNav, setMobileNav] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchSector, setSearchSector] = useState("");
  const [searchProvince, setSearchProvince] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const [requestResult, moduleResult, profileResult, companyResult] = await Promise.all([
        supabase.from("requests").select("*").eq("owner_id", data.user.id).order("created_at", { ascending: false }),
        supabase.from("account_modules").select("buying_enabled, selling_enabled").eq("user_id", data.user.id).maybeSingle(),
        supabase.from("profiles").select("full_name").eq("id", data.user.id).maybeSingle(),
        supabase.from("companies").select("name").eq("owner_id", data.user.id).maybeSingle(),
      ]);
      setRequests((requestResult.data ?? []) as Request[]);
      if (moduleResult.data) setModules(moduleResult.data);
      if (profileResult.data?.full_name) setFullName(profileResult.data.full_name);
      if (companyResult.data?.name) setCompanyName(companyResult.data.name);
    });
  }, []);

  async function activateModule(module: "buying_enabled" | "selling_enabled") {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;
    const next = { ...modules, [module]: true };
    setModules(next);
    await supabase.from("account_modules").upsert({ user_id: userData.user.id, ...next });
  }

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <div className="min-h-[calc(100vh-72px)] bg-[#f4f7fa]">
      <div className="mx-auto flex max-w-[1440px]">
        <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:block">
          <div className="sticky top-0 flex min-h-[calc(100vh-72px)] flex-col p-4">
            <div className="rounded-2xl bg-[#102a43] p-4 text-white">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10"><CircleUserRound className="h-5 w-5" /></div>
                <div className="min-w-0"><p className="truncate text-sm font-semibold">{fullName}</p><p className="truncate text-xs text-white/60">{companyName}</p></div>
              </div>
            </div>
            <nav className="mt-5 space-y-1">
              <NavItem to="/dashboard" icon={<LayoutDashboard />} label="Balcão" active />
              <NavItem to="/dashboard/profile" icon={<Building2 />} label="Minha empresa" />
              <NavItem to="/requests" icon={<PackageSearch />} label="Oportunidades" />
              <NavItem to="/proposals" icon={<FileText />} label="Propostas" />
              <NavItem to="/plans" icon={<Store />} label="Planos" />
            </nav>
            <div className="mt-auto space-y-1 border-t border-slate-100 pt-4">
              <NavItem to="/dashboard/profile" icon={<Settings />} label="Definições" />
              <button onClick={signOut} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-[#102a43]"><LogOut className="h-4 w-4" />Sair</button>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
          <div className="mb-5 flex items-center justify-between lg:hidden">
            <button onClick={() => setMobileNav(true)} className="rounded-xl border border-slate-200 bg-white p-2.5"><Menu className="h-5 w-5" /></button>
            <div className="flex items-center gap-2"><div className="h-8 w-8 rounded-lg bg-[#102a43]" /><span className="font-bold text-[#102a43]">Balcão</span></div>
            <button className="rounded-xl border border-slate-200 bg-white p-2.5"><Bell className="h-5 w-5 text-slate-500" /></button>
          </div>

          {mobileNav && <div className="fixed inset-0 z-50 bg-[#102a43]/30 lg:hidden"><div className="h-full w-[290px] bg-white p-5 shadow-2xl"><div className="flex items-center justify-between"><b className="text-[#102a43]">Menu</b><button onClick={() => setMobileNav(false)}><X /></button></div><nav className="mt-8 space-y-2"><NavItem to="/dashboard" icon={<LayoutDashboard />} label="Balcão" active /><NavItem to="/dashboard/profile" icon={<Building2 />} label="Minha empresa" /><NavItem to="/requests" icon={<PackageSearch />} label="Oportunidades" /><NavItem to="/proposals" icon={<FileText />} label="Propostas" /><NavItem to="/plans" icon={<Store />} label="Planos" /></nav></div></div>}

          <header className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.16em] text-[#0f766e]">Balcão virtual</p>
              <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#102a43] sm:text-4xl">Bom dia, {fullName.split(" ")[0]}.</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">O centro de comando da sua atividade no Concept Builder.</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="hidden rounded-xl border border-slate-200 bg-white p-2.5 text-slate-500 shadow-sm sm:block"><Bell className="h-4 w-4" /></button>
              <Link to="/dashboard/profile" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#102a43] shadow-sm">Perfil da empresa <ChevronRight className="h-4 w-4" /></Link>
            </div>
          </header>

          <section className="relative mt-7 overflow-hidden rounded-[30px] bg-[#102a43] shadow-xl">
            <div className="absolute -right-20 -top-28 h-72 w-72 rounded-full bg-[#0f766e]/25 blur-2xl" />
            <div className="absolute right-24 bottom-[-120px] h-64 w-64 rounded-full bg-[#c58a2a]/15 blur-3xl" />
            <div className="grid lg:grid-cols-[1.3fr_.7fr]">
              <div className="p-6 sm:p-8 lg:p-10">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/80"><span className="h-1.5 w-1.5 rounded-full bg-[#2dd4bf]" />Balcão empresarial</div>
                <h2 className="mt-5 max-w-2xl text-2xl font-bold tracking-tight text-white sm:text-3xl">Tudo o que a sua empresa precisa para fazer negócio.</h2>
                <p className="mt-3 max-w-xl text-sm leading-6 text-white/65">Pesquise empresas, publique necessidades, receba propostas e transforme contactos comerciais em relações de negócio — num único balcão.</p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <Link to="/directory" className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-[#102a43]">Encontrar empresas <ArrowRight className="h-4 w-4" /></Link>
                  <Link to="/requests/new" className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white">Publicar necessidade</Link>
                </div>
              </div>
              <div className="hidden items-center justify-center border-l border-white/10 bg-white/[.03] p-8 lg:flex">
                <div className="w-full max-w-xs rounded-2xl border border-white/10 bg-white/5 p-5">
                  <div className="flex items-center justify-between"><span className="text-xs font-medium text-white/50">Estado da conta</span><span className="h-2 w-2 rounded-full bg-emerald-400" /></div>
                  <p className="mt-5 text-2xl font-bold text-white">{Number(modules.buying_enabled) + Number(modules.selling_enabled)} / 2</p>
                  <p className="mt-1 text-xs text-white/50">capacidades ativas</p>
                  <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-[#2dd4bf]" style={{ width: `${(Number(modules.buying_enabled) + Number(modules.selling_enabled)) * 50}%` }} /></div>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8f5f3] text-[#0f766e]"><Search className="h-5 w-5" /></div><div><h2 className="font-bold text-[#102a43]">Pesquisa rápida</h2><p className="text-xs text-slate-500">Encontre empresas ou oportunidades sem sair do balcão.</p></div></div>
            <div className="mt-5 grid gap-3 md:grid-cols-[1.5fr_1fr_1fr_auto]"><input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Empresa, serviço, produto..." className="h-11 rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-[#0f766e]" /><select value={searchSector} onChange={(e) => setSearchSector(e.target.value)} className="h-11 rounded-xl border border-slate-200 px-3 text-sm text-slate-600 outline-none focus:border-[#0f766e]"><option value="">Todos os sectores</option><option>Construção e Engenharia</option><option>Tecnologia e Serviços</option><option>Logística e Transportes</option></select><select value={searchProvince} onChange={(e) => setSearchProvince(e.target.value)} className="h-11 rounded-xl border border-slate-200 px-3 text-sm text-slate-600 outline-none focus:border-[#0f766e]"><option value="">Todas as províncias</option><option>Maputo</option><option>Maputo Cidade</option><option>Gaza</option><option>Manica</option><option>Nampula</option><option>Sofala</option></select><Link to="/directory" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0f766e] px-5 text-sm font-bold text-white">Pesquisar <ArrowRight className="h-4 w-4" /></Link></div>
          </section>

          <section className="mt-7">
            <div className="mb-3 flex items-end justify-between"><div><h2 className="text-lg font-bold text-[#102a43]">As suas capacidades</h2><p className="text-sm text-slate-500">Escolha como quer usar a plataforma.</p></div></div>
            <div className="grid gap-4 md:grid-cols-2">
              <ModuleCard icon={<ShoppingBag />} title="Comprar" description="Encontre fornecedores, publique necessidades e compare propostas." enabled={modules.buying_enabled} onActivate={() => activateModule("buying_enabled")} href="/requests/new" cta={modules.buying_enabled ? "Publicar necessidade" : "Ativar Comprar"} />
              <ModuleCard icon={<Store />} title="Vender" description="Apresente a sua empresa, receba oportunidades e responda a pedidos." enabled={modules.selling_enabled} onActivate={() => activateModule("selling_enabled")} href="/requests" cta={modules.selling_enabled ? "Ver oportunidades" : "Ativar Vender"} />
            </div>
          </section>

          <section className="mt-7 grid gap-4 sm:grid-cols-3">
            <Metric label="Pedidos publicados" value={String(requests.length)} icon={<ShoppingBag />} />
            <Metric label="Capacidades ativas" value={String(Number(modules.buying_enabled) + Number(modules.selling_enabled))} icon={<CheckCircle2 />} />
            <Metric label="Perfil empresarial" value="Em gestão" icon={<Building2 />} />
          </section>

          <section className="mt-7 rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
              <div><h2 className="font-bold text-[#102a43]">Atividade recente</h2><p className="mt-0.5 text-xs text-slate-500">Os últimos movimentos da sua conta.</p></div>
              <Link to="/requests" className="text-sm font-semibold text-[#0b5f59]">Ver tudo</Link>
            </div>
            {requests.length === 0 ? <div className="px-6 py-10 text-center"><div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#e8f5f3] text-[#0f766e]"><Plus className="h-5 w-5" /></div><p className="mt-3 text-sm font-semibold text-[#102a43]">O seu balcão está pronto.</p><p className="mx-auto mt-1 max-w-md text-sm text-slate-500">Ative Comprar e publique a primeira necessidade para começar a gerar oportunidades.</p><Link to="/requests/new" className="mt-4 inline-flex rounded-xl bg-[#0f766e] px-4 py-2.5 text-sm font-semibold text-white">Criar necessidade</Link></div> : requests.slice(0, 5).map((request) => <div key={request.id} className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4 last:border-0 sm:px-6"><div className="min-w-0"><p className="truncate text-sm font-semibold text-[#102a43]">{request.title}</p><p className="mt-1 text-xs text-slate-500">{request.sector} · {request.province}</p></div><span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{request.status}</span></div>)}
          </section>
        </main>
      </div>
    </div>
  );
}

function NavItem({ to, icon, label, active = false }: { to: string; icon: ReactNode; label: string; active?: boolean }) {
  return <Link to={to as never} className={active ? "flex items-center gap-3 rounded-xl bg-[#e8f5f3] px-3 py-2.5 text-sm font-semibold text-[#0b5f59]" : "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-[#102a43]"}>{<span className="h-4 w-4">{icon}</span>}{label}</Link>;
}

function ModuleCard({ icon, title, description, enabled, onActivate, href, cta }: { icon: ReactNode; title: string; description: string; enabled: boolean; onActivate: () => void; href: string; cta: string }) {
  return <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-6">
    <div className="flex items-start justify-between"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e8f5f3] text-[#0f766e]">{icon}</div><span className={enabled ? "inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700" : "rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600"}>{enabled && <CheckCircle2 className="h-3.5 w-3.5" />}{enabled ? "Ativo" : "Disponível"}</span></div>
    <h3 className="mt-5 text-lg font-bold text-[#102a43]">{title}</h3><p className="mt-2 max-w-md text-sm leading-6 text-slate-500">{description}</p>
    {enabled ? <Link to={href as never} className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#0b5f59]">{cta}<ArrowRight className="h-4 w-4" /></Link> : <button onClick={onActivate} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#102a43] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#163a5f]">{cta}<ArrowRight className="h-4 w-4" /></button>}
  </div>;
}

function Metric({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><span className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</span><span className="text-[#0f766e]">{icon}</span></div><p className="mt-3 text-2xl font-bold tracking-tight text-[#102a43]">{value}</p></div>;
}

function ActionCard({ icon, title, text, to }: { icon: ReactNode; title: string; text: string; to: string }) { return <Link to={to as never} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#b9ddd8] hover:shadow-md"><div className="flex items-center justify-between"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8f5f3] text-[#0f766e]">{icon}</div><ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-1 group-hover:text-[#0f766e]" /></div><h3 className="mt-4 text-sm font-bold text-[#102a43]">{title}</h3><p className="mt-1 text-xs leading-5 text-slate-500">{text}</p></Link>; }

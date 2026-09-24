import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  Bell,
  Clock3,
  ShieldCheck,
  Sparkles,
  Building2,
  BadgeCheck,
  LockKeyhole,
  UserPlus,
  CheckCircle2,
  ChevronRight,
  CircleUserRound,
  FileText,
  FileCheck2,
  LayoutDashboard,
  LogOut,
  Menu,
  PackageSearch,
  Plus,
  Search,
  Settings,
  ShoppingBag,
  Store,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { supabase } from "../lib/supabase";
import type { Request } from "../lib/concept-data";

export const Route = createFileRoute("/dashboard")({ component: Dashboard });

type AccountModules = {
  buying_enabled: boolean;
  selling_enabled: boolean;
  advanced_qualification_enabled: boolean;
  supplier_invites_enabled: boolean;
};

function Dashboard() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [modules, setModules] = useState<AccountModules>({
    buying_enabled: false,
    selling_enabled: false,
    advanced_qualification_enabled: false,
    supplier_invites_enabled: false,
  });
  const [fullName, setFullName] = useState("Utilizador");
  const [companyName, setCompanyName] = useState("A sua empresa");
  const [companyVerification, setCompanyVerification] = useState("unverified");
  const [mobileNav, setMobileNav] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchSector, setSearchSector] = useState("");
  const [searchProvince, setSearchProvince] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    supabase.auth.getSession().then(async ({ data: sessionData }) => {
      if (!sessionData.session) {
        if (!cancelled) navigate({ to: "/login" });
        return;
      }
      const data = { user: sessionData.session.user };

      const [requestResult, moduleResult, profileResult, companyResult] =
        await Promise.all([
          supabase
            .from("requests")
            .select("*")
            .eq("owner_id", data.user.id)
            .order("created_at", { ascending: false }),
          supabase
            .from("account_modules")
            .select("buying_enabled, selling_enabled, advanced_qualification_enabled, supplier_invites_enabled")
            .eq("user_id", data.user.id)
            .maybeSingle(),
          supabase
            .from("profiles")
            .select("full_name")
            .eq("id", data.user.id)
            .maybeSingle(),
          supabase
            .from("companies")
            .select("id, name, verification_status")
            .eq("owner_id", data.user.id)
            .maybeSingle(),
        ]);

      setRequests((requestResult.data ?? []) as Request[]);
      if (moduleResult.data) setModules(moduleResult.data);
      if (profileResult.data?.full_name) setFullName(profileResult.data.full_name);
      if (companyResult.data?.name) setCompanyName(companyResult.data.name);
      if (companyResult.data?.verification_status) setCompanyVerification(companyResult.data.verification_status);
      if (!cancelled) return;
    });
    return () => { cancelled = true; };
  }, [navigate]);

  async function activateModule(module: keyof AccountModules) {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const next = { ...modules, [module]: true };
    setModules(next);
    await supabase
      .from("account_modules")
      .upsert({ user_id: userData.user.id, ...next });
  }

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  const activeModules =
    Number(modules.buying_enabled) + Number(modules.selling_enabled);
  const firstName = fullName.trim().split(" ")[0] || "Utilizador";

  function runSearch() {
    const params = new URLSearchParams();
    if (searchTerm.trim()) params.set("search", searchTerm.trim());
    if (searchSector) params.set("sector", searchSector);
    if (searchProvince) params.set("province", searchProvince);
    window.location.href = params.toString()
      ? `/directory?${params.toString()}`
      : "/directory";
  }

  return (
    <div className="min-h-[calc(100vh-72px)] bg-[#f6f8fb] text-[#172b4d]">
      <div className="mx-auto flex max-w-[1500px]">
        <aside className="hidden w-[258px] shrink-0 border-r border-[#e1e7ee] bg-white lg:block">
          <div className="sticky top-0 flex min-h-[calc(100vh-72px)] flex-col p-4">
            <div className="rounded-[22px] border border-[#e4eaf0] bg-[#f8fafc] p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#102a43] text-white">
                  <CircleUserRound className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">{fullName}</p>
                  <p className="truncate text-xs text-slate-500">{companyName}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between rounded-xl bg-white px-3 py-2 text-xs">
                <span className="text-slate-500">Conta</span>
                <span className="font-bold text-[#0f766e]">Ativa</span>
              </div>
            </div>

            <p className="mb-2 mt-7 px-3 text-[10px] font-bold uppercase tracking-[.18em] text-slate-400">
              Espaço de trabalho
            </p>
            <nav className="space-y-1">
              <NavItem to="/dashboard" icon={<LayoutDashboard />} label="Balcão" active />
              <NavItem to="/dashboard/profile" icon={<Building2 />} label="Minha empresa" />
              <NavItem to="/requests" icon={<PackageSearch />} label="Oportunidades" />
              <NavItem to="/proposals" icon={<FileText />} label="Propostas" />
              <NavItem to="/dashboard/documents" icon={<FileCheck2 />} label="Documentação" />
              <NavItem to="/plans" icon={<Store />} label="Planos" />
            </nav>

            <div className="mt-auto border-t border-slate-100 pt-4">
              <NavItem to="/dashboard/profile" icon={<Settings />} label="Definições" />
              <button
                onClick={signOut}
                className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-slate-50 hover:text-[#102a43]"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </button>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-5 sm:px-6 lg:px-9 lg:py-8">
          <div className="mb-5 flex items-center justify-between lg:hidden">
            <button
              onClick={() => setMobileNav(true)}
              className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm"
              aria-label="Abrir menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="w-8" />
            <button className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm" aria-label="Notificações">
              <Bell className="h-5 w-5 text-slate-500" />
            </button>
          </div>

          {mobileNav && (
            <div className="fixed inset-0 z-50 bg-[#102a43]/30 lg:hidden">
              <div className="h-full w-[290px] bg-white p-5 shadow-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[#0f766e]">Concept Builder</p>
                    <b className="text-[#102a43]">Menu principal</b>
                  </div>
                  <button onClick={() => setMobileNav(false)} aria-label="Fechar menu">
                    <X />
                  </button>
                </div>
                <nav className="mt-8 space-y-2">
                  <NavItem to="/dashboard" icon={<LayoutDashboard />} label="Balcão" active />
                  <NavItem to="/dashboard/profile" icon={<Building2 />} label="Minha empresa" />
                  <NavItem to="/requests" icon={<PackageSearch />} label="Oportunidades" />
                  <NavItem to="/proposals" icon={<FileText />} label="Propostas" />
                  <NavItem to="/dashboard/documents" icon={<FileCheck2 />} label="Documentação" />
                  <NavItem to="/plans" icon={<Store />} label="Planos" />
                </nav>
              </div>
            </div>
          )}

          <header className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#102a43] sm:text-[38px]">
                O seu espaço de negócio, {firstName}.
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Um único lugar para descobrir parceiros, gerir oportunidades e fazer crescer a sua atividade.
              </p>
            </div>
            <Link
              to="/dashboard/profile"
              className="inline-flex items-center gap-2 rounded-xl border border-[#dce4eb] bg-white px-4 py-2.5 text-sm font-bold text-[#102a43] shadow-sm transition hover:border-[#b9ddd8]"
            >
              <Building2 className="h-4 w-4 text-[#0f766e]" />
              Perfil da empresa
              <ChevronRight className="h-4 w-4" />
            </Link>
          </header>

          <section className="relative mt-7 overflow-hidden rounded-[30px] border border-[#cfe6e2] bg-gradient-to-br from-[#eaf8f5] via-white to-[#edf3ff] shadow-[0_18px_55px_rgba(16,42,67,.08)]">
            <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[#74cfc2]/20 blur-3xl" />
            <div className="absolute bottom-[-110px] left-[38%] h-64 w-64 rounded-full bg-[#c58a2a]/10 blur-3xl" />
            <div className="relative grid lg:grid-cols-[1.3fr_.7fr]">
              <div className="p-6 sm:p-8 lg:p-10">
                <span className="inline-flex items-center gap-2 rounded-full border border-[#bfe0db] bg-white/75 px-3 py-1.5 text-xs font-bold text-[#0b5f59]">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Workspace empresarial
                </span>
                <h2 className="mt-5 max-w-2xl text-2xl font-extrabold tracking-tight text-[#102a43] sm:text-3xl lg:text-[34px]">
                  Transforme necessidades em oportunidades reais.
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">
                  Procure empresas, publique necessidades, receba propostas e construa relações comerciais — sem trocar de plataforma.
                </p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <Link
                    to="/directory"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#0f766e] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#0b5f59]"
                  >
                    Encontrar empresas <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    to="/requests/new"
                    className="inline-flex items-center gap-2 rounded-xl border border-[#d6e1e9] bg-white px-4 py-2.5 text-sm font-bold text-[#102a43] shadow-sm"
                  >
                    Publicar necessidade
                  </Link>
                </div>
              </div>

              <div className="border-t border-[#dce8e8] p-5 lg:border-l lg:border-t-0 lg:p-8">
                <div className="rounded-2xl border border-white bg-white/80 p-5 shadow-[0_14px_35px_rgba(16,42,67,.07)] backdrop-blur">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Conta em foco</p>
                      <p className="mt-1 font-bold text-[#102a43]">{companyName}</p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8f5f3] text-[#0f766e]">
                      <Building2 className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              </div>              </div>
            </div>
          </section>

          <section className="mt-7">
            <div className="mb-4 flex items-end justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.15em] text-[#0f766e]">Acesso rápido</p>
                <h2 className="mt-1 text-xl font-extrabold text-[#102a43]">O que quer fazer hoje?</h2>
              </div>
              <span className="hidden text-xs text-slate-400 sm:block">Escolha uma ação para continuar</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <ActionCard icon={<Users />} title="Encontrar parceiros" text="Descubra empresas por sector e província." to="/directory" />
              <ActionCard icon={<PackageSearch />} title="Ver oportunidades" text="Explore necessidades publicadas por compradores." to="/requests" />
              <ActionCard icon={<Plus />} title="Publicar necessidade" text="Diga o que procura e encontre fornecedores." to="/requests/new" />
              <ActionCard icon={<FileText />} title="Gerir propostas" text="Acompanhe convites e propostas comerciais." to="/proposals" />
            </div>
          </section>

          <section className="mt-7 rounded-2xl border border-[#dfe6ed] bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#102a43] text-white">
                <Search className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-extrabold text-[#102a43]">Pesquisa rápida</h2>
                <p className="text-xs text-slate-500">Encontre empresas por actividade, sector ou localização.</p>
              </div>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-[1.5fr_1fr_1fr_auto]">
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && runSearch()}
                placeholder="Empresa, serviço ou produto..."
                className="h-11 rounded-xl border border-slate-200 bg-[#fbfcfd] px-4 text-sm outline-none transition focus:border-[#0f766e] focus:ring-2 focus:ring-[#0f766e]/10"
              />
              <select value={searchSector} onChange={(e) => setSearchSector(e.target.value)} className="h-11 rounded-xl border border-slate-200 bg-[#fbfcfd] px-3 text-sm text-slate-600 outline-none focus:border-[#0f766e]">
                <option value="">Todos os sectores</option>
                <option>Construção e Engenharia</option>
                <option>Tecnologia e Serviços</option>
                <option>Consultoria</option>
                <option>Logística e Transportes</option>
                <option>Indústria e Fornecimento</option>
                <option>Energia e Equipamentos</option>
              </select>
              <select value={searchProvince} onChange={(e) => setSearchProvince(e.target.value)} className="h-11 rounded-xl border border-slate-200 bg-[#fbfcfd] px-3 text-sm text-slate-600 outline-none focus:border-[#0f766e]">
                <option value="">Todas as províncias</option>
                <option>Maputo</option>
                <option>Maputo Cidade</option>
                <option>Gaza</option>
                <option>Inhambane</option>
                <option>Manica</option>
                <option>Nampula</option>
                <option>Sofala</option>
                <option>Tete</option>
                <option>Zambézia</option>
                <option>Cabo Delgado</option>
                <option>Niassa</option>
                <option>Central</option>
              </select>
              <button onClick={runSearch} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#102a43] px-5 text-sm font-bold text-white transition hover:bg-[#163a5f]">
                Pesquisar <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </section>

          <section className="mt-7">
            <div className="mb-4">
              <p className="text-xs font-bold uppercase tracking-[.15em] text-[#0f766e]">Módulos da conta</p>
              <h2 className="mt-1 text-xl font-extrabold text-[#102a43]">Módulos para comprar e vender.</h2>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                A sua conta é única. Os módulos <strong>Comprar</strong> e <strong>Vender</strong> activam as funcionalidades necessárias para cada lado da sua actividade comercial.
              </p>
            </div>
            <div className="grid gap-5 lg:grid-cols-2">
              <ModuleCard icon={<ShoppingBag />} title="Comprar" description="Transforme necessidades da sua empresa em pedidos estruturados e encontre fornecedores compatíveis." enabled={modules.buying_enabled} onActivate={() => activateModule("buying_enabled")} href="/requests/new" cta={modules.buying_enabled ? "Abrir módulo Comprar" : "Activar Comprar"} tone="teal" features={["Publicar necessidades", "Definir critérios e localização", "Receber e comparar propostas"]} />
              <ModuleCard icon={<Store />} title="Vender" description="Encontre oportunidades relevantes, apresente a sua empresa e responda com propostas comerciais." enabled={modules.selling_enabled} onActivate={() => activateModule("selling_enabled")} href="/requests" cta={modules.selling_enabled ? "Abrir módulo Vender" : "Activar Vender"} tone="navy" features={["Encontrar oportunidades", "Apresentar propostas", "Criar novas relações comerciais"]} />
            </div>
          </section>

          <section className="mt-7">
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.15em] text-[#0f766e]">Módulos adicionais</p>
                <h2 className="mt-1 text-xl font-extrabold text-[#102a43]">Estruture a sua operação comercial.</h2>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">Funcionalidades opcionais para elevar a qualidade das oportunidades e controlar quem recebe convites.</p>
              </div>
              <Link to="/plans" className="hidden items-center gap-1 text-xs font-bold text-[#0b5f59] sm:inline-flex">Ver planos <ArrowRight className="h-3.5 w-3.5" /></Link>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <AddonCard icon={<BadgeCheck />} title="Qualificação avançada" description="Adicione critérios de experiência, projectos, certificações e verificação aos seus pedidos." enabled={modules.advanced_qualification_enabled} onActivate={() => activateModule("advanced_qualification_enabled")} href="/requests/new" cta={modules.advanced_qualification_enabled ? "Configurar qualificação" : "Activar qualificação"} features={["Critérios de experiência", "Projectos concluídos", "Certificações e verificação"]} />
              <AddonCard icon={<UserPlus />} title="Convites a fornecedores" description="Convide empresas específicas para participar em oportunidades e mantenha maior controlo sobre a participação." enabled={modules.supplier_invites_enabled} onActivate={() => activateModule("supplier_invites_enabled")} href="/requests/new" cta={modules.supplier_invites_enabled ? "Gerir convites" : "Activar convites"} features={["Seleccionar fornecedores", "Convites direccionados", "Acompanhar respostas"]} />
            </div>
          </section>

          <section className="mt-7 rounded-2xl border border-[#dfe6ed] bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.15em] text-[#0f766e]">Estado da empresa</p>
                <h2 className="mt-1 text-lg font-extrabold text-[#102a43]">Mantenha a sua presença comercial pronta.</h2>
              </div>
              <Link to="/dashboard/profile" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-[#102a43]">Gerir empresa <ArrowRight className="h-4 w-4" /></Link>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <StatusPill label="Empresa" value={companyName === "A sua empresa" ? "Por completar" : "Perfil criado"} />
              <StatusPill label="Verificação" value={companyVerification === "verified" ? "Verificada" : companyVerification === "pending" ? "Em análise" : "Por verificar"} />
              <StatusPill label="Documentação" value="Consultar documentos" />
            </div>
          </section>

          <section className="mt-7 overflow-hidden rounded-2xl border border-[#dfe6ed] bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
              <div>
                <h2 className="font-extrabold text-[#102a43]">Actividade recente</h2>
                <p className="mt-0.5 text-xs text-slate-500">Os últimos movimentos da sua conta.</p>
              </div>
              <Link to="/requests" className="text-sm font-bold text-[#0b5f59]">Ver tudo</Link>
            </div>
            {requests.length === 0 ? (
              <div className="px-6 py-11 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e8f5f3] text-[#0f766e]">
                  <Plus className="h-5 w-5" />
                </div>
                <p className="mt-4 text-sm font-bold text-[#102a43]">O seu balcão está pronto.</p>
                <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-500">
                  Active Comprar e publique a primeira necessidade para começar a gerar oportunidades comerciais.
                </p>
                <Link to="/requests/new" className="mt-4 inline-flex rounded-xl bg-[#0f766e] px-4 py-2.5 text-sm font-bold text-white">
                  Criar necessidade
                </Link>
              </div>
            ) : (
              requests.slice(0, 5).map((request) => (
                <div key={request.id} className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4 last:border-0 sm:px-6">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-[#102a43]">{request.title}</p>
                    <p className="mt-1 text-xs text-slate-500">{request.sector} · {request.province}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">{request.status}</span>
                </div>
              ))
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

function NavItem({
  to,
  icon,
  label,
  active = false,
}: {
  to: string;
  icon: ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      to={to as never}
      className={
        active
          ? "flex items-center gap-3 rounded-xl bg-[#e8f5f3] px-3 py-2.5 text-sm font-bold text-[#0b5f59]"
          : "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-slate-50 hover:text-[#102a43]"
      }
    >
      <span className="h-4 w-4">{icon}</span>
      {label}
    </Link>
  );
}

function ActionCard({
  icon,
  title,
  text,
  to,
}: {
  icon: ReactNode;
  title: string;
  text: string;
  to: string;
}) {
  return (
    <Link
      to={to as never}
      className="group rounded-2xl border border-[#dfe6ed] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#b9ddd8] hover:shadow-md"
    >
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8f5f3] text-[#0f766e]">
          {icon}
        </div>
        <ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-1 group-hover:text-[#0f766e]" />
      </div>
      <h3 className="mt-4 text-sm font-extrabold text-[#102a43]">{title}</h3>
      <p className="mt-1 text-xs leading-5 text-slate-500">{text}</p>
    </Link>
  );
}

function ModuleCard({
  icon, title, description, enabled, onActivate, href, cta, tone, features,
}: {
  icon: ReactNode; title: string; description: string; enabled: boolean; onActivate: () => void; href: string; cta: string; tone: "teal" | "navy"; features: string[];
}) {
  const accent = tone === "teal";
  return (
    <div className="group relative overflow-hidden rounded-[24px] border border-[#dfe6ed] bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-[#b9ddd8] hover:shadow-lg sm:p-7">
      <div className={accent ? "absolute -right-12 -top-12 h-36 w-36 rounded-full bg-[#74cfc2]/15 blur-2xl" : "absolute -right-12 -top-12 h-36 w-36 rounded-full bg-[#102a43]/10 blur-2xl"} />
      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div className={accent ? "flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e8f5f3] text-[#0f766e]" : "flex h-12 w-12 items-center justify-center rounded-2xl bg-[#edf1f6] text-[#102a43]"}>{icon}</div>
          <span className={enabled ? "inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1.5 text-xs font-bold text-emerald-700" : "inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1.5 text-xs font-bold text-amber-700"}>{enabled ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Clock3 className="h-3.5 w-3.5" />}{enabled ? "Activo" : "Disponível"}</span>
        </div>
        <div className="mt-6 flex items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.14em] text-slate-400">Módulo</p><h3 className="mt-1 text-2xl font-extrabold tracking-tight text-[#102a43]">{title}</h3></div><span className="text-xs font-bold text-slate-400">01 / 02</span></div>
        <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">{description}</p>
        <div className="mt-5 grid gap-2 sm:grid-cols-3">{features.map((feature) => <div key={feature} className="rounded-xl bg-[#f6f8fb] px-3 py-2.5 text-xs font-semibold leading-5 text-slate-600"><CheckCircle2 className="mb-1 h-3.5 w-3.5 text-[#0f766e]" />{feature}</div>)}</div>
        <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-5">
          {enabled ? <Link to={href as never} className="inline-flex items-center gap-2 rounded-xl bg-[#0f766e] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#0b5f59]">{cta} <ArrowRight className="h-4 w-4" /></Link> : <button onClick={onActivate} className="inline-flex items-center gap-2 rounded-xl bg-[#102a43] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#163a5f]">{cta} <ArrowRight className="h-4 w-4" /></button>}
          <span className="text-xs text-slate-400">{enabled ? "Funcionalidades prontas a utilizar" : "Pode activar este módulo quando quiser"}</span>
        </div>
      </div>
    </div>
  );
}

function AddonCard({
  icon, title, description, enabled, onActivate, href, cta, features,
}: {
  icon: ReactNode; title: string; description: string; enabled: boolean; onActivate: () => void; href: string; cta: string; features: string[];
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#dfe6ed] bg-white p-5 shadow-sm transition hover:border-[#b9ddd8] hover:shadow-md sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f1f4f8] text-[#102a43]">{icon}</div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">{enabled ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> : <LockKeyhole className="h-3.5 w-3.5" />}{enabled ? "Activo" : "Add-on"}</span>
      </div>
      <h3 className="mt-5 text-lg font-extrabold text-[#102a43]">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
      <div className="mt-4 grid gap-2 sm:grid-cols-3">{features.map((feature) => <div key={feature} className="rounded-lg bg-[#f6f8fb] px-3 py-2 text-xs font-semibold text-slate-600">{feature}</div>)}</div>
      <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
        {enabled ? <Link to={href as never} className="inline-flex items-center gap-2 rounded-xl bg-[#0f766e] px-4 py-2.5 text-sm font-bold text-white">{cta} <ArrowRight className="h-4 w-4" /></Link> : <button onClick={onActivate} className="inline-flex items-center gap-2 rounded-xl bg-[#102a43] px-4 py-2.5 text-sm font-bold text-white">{cta} <ArrowRight className="h-4 w-4" /></button>}
        <span className="text-xs text-slate-400">{enabled ? "Disponível na sua conta" : "Activação opcional"}</span>
      </div>
    </div>
  );
}

function StatusPill({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border border-slate-100 bg-[#f8fafc] p-3"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p><p className="mt-1 text-sm font-extrabold text-[#102a43]">{value}</p></div>;
}

function Metric({ label, value, icon, detail }: { label: string; value: string; icon: ReactNode; detail: string }) {
  return (
    <div className="rounded-2xl border border-[#dfe6ed] bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between"><span className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</span><span className="text-[#0f766e]">{icon}</span></div>
      <p className="mt-3 text-2xl font-extrabold tracking-tight text-[#102a43]">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{detail}</p>
    </div>
  );
}


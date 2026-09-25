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
  ShoppingBag,
  Store,
  Settings,
  Users,
  UserPlus,
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
  const [activating, setActivating] = useState<keyof AccountModules | null>(null);
  const [moduleError, setModuleError] = useState("");
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

    setActivating(module);
    setModuleError("");
    const next = { ...modules, [module]: true };

    const { error } = await supabase
      .from("account_modules")
      .upsert({ user_id: userData.user.id, ...next });

    if (error) {
      setModuleError("Não foi possível activar este módulo. Tente novamente.");
      setActivating(null);
      return;
    }

    setModules(next);
    setActivating(null);

    const destination: Record<keyof AccountModules, "/directory" | "/requests" | "/requests/new"> = {
      buying_enabled: "/directory",
      selling_enabled: "/requests",
      advanced_qualification_enabled: "/requests/new",
      supplier_invites_enabled: "/requests/new",
    };

    navigate({ to: destination[module] });
  }

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

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

          <header className="rounded-[28px] border border-[#dbe5ec] bg-white px-6 py-6 shadow-sm sm:px-8 sm:py-7">
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div className="max-w-3xl">
                <p className="text-xs font-bold uppercase tracking-[.18em] text-[#0f766e]">Balcão Virtual</p>
                <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#102a43] sm:text-[38px]">Bom dia, {firstName}.</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">O seu espaço de negócio para comprar, vender, encontrar parceiros e gerir oportunidades.</p>
              </div>
              <Link to="/dashboard/profile" className="inline-flex items-center gap-2 rounded-xl border border-[#dce4eb] bg-[#f8fafc] px-4 py-2.5 text-sm font-bold text-[#102a43] transition hover:border-[#b9ddd8]">
                <Building2 className="h-4 w-4 text-[#0f766e]" />
                {companyName === "A sua empresa" ? "Completar empresa" : "Minha empresa"}
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-[#f6f8fb] px-4 py-3"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Agora</p><p className="mt-1 text-sm font-bold text-[#102a43]">{requests.length ? "Continue os seus pedidos" : "Comece pelo que procura"}</p><p className="mt-1 text-xs leading-5 text-slate-500">{requests.length ? "Há actividade para rever no seu balcão." : "Publique uma necessidade e abra uma conversa comercial."}</p></div>
              <div className="rounded-2xl bg-[#f6f8fb] px-4 py-3"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Comprar</p><p className="mt-1 text-sm font-bold text-[#102a43]">{modules.buying_enabled ? "Pronto a procurar" : "Disponível para activar"}</p><p className="mt-1 text-xs leading-5 text-slate-500">Encontre fornecedores e publique necessidades.</p></div>
              <div className="rounded-2xl bg-[#f6f8fb] px-4 py-3"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Vender</p><p className="mt-1 text-sm font-bold text-[#102a43]">{modules.selling_enabled ? "Pronto a oferecer" : "Disponível para activar"}</p><p className="mt-1 text-xs leading-5 text-slate-500">Mostre a sua oferta e responda a oportunidades.</p></div>
            </div>
          </header>

          <section className="mt-6">
            <div className="mb-3 flex items-end justify-between gap-3">
              <div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#0f766e]">Comece aqui</p><h2 className="mt-1 text-xl font-extrabold text-[#102a43]">Escolha a sua frente de negócio</h2></div>
              <span className="hidden text-xs text-slate-400 sm:block">Active uma ou as duas, conforme o seu negócio</span>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <ModuleCard icon={<ShoppingBag className="h-5 w-5" />} title="Procurar Produtos & Serviços" description="Quando precisa de comprar, encontre empresas e fornecedores capazes de responder ao que a sua empresa procura." enabled={modules.buying_enabled} busy={activating === "buying_enabled"} onActivate={() => activateModule("buying_enabled")} href="/directory" cta="Ver mais" tone="teal" features={["Descobrir fornecedores", "Encontrar produtos e serviços", "Publicar o que procura"]} />
              <ModuleCard icon={<Store className="h-5 w-5" />} title="Oferecer Produtos & Serviços" description="Quando quer vender, apresente a sua empresa e encontre oportunidades onde os seus produtos e serviços fazem sentido." enabled={modules.selling_enabled} busy={activating === "selling_enabled"} onActivate={() => activateModule("selling_enabled")} href="/requests" cta="Ver mais" tone="navy" features={["Mostrar o que oferece", "Encontrar oportunidades relevantes", "Responder com propostas"]} />
            </div>
            {moduleError && <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{moduleError}</div>}
          </section>

          <section className="mt-8 rounded-[24px] border border-[#dfe6ed] bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#c58a2a]">Ferramentas opcionais</p><h2 className="mt-1 text-xl font-extrabold text-[#102a43]">Potencie o seu Balcão Virtual</h2><p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">Add-ons para quando precisar de processos comerciais mais estruturados, critérios de selecção ou maior controlo sobre os participantes.</p></div>
              <Link to="/plans" className="inline-flex items-center gap-2 text-sm font-bold text-[#0b5f59]">Ver add-ons <ArrowRight className="h-4 w-4" /></Link>
            </div>
            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <AddonCard icon={<Sparkles className="h-5 w-5" />} eyebrow="Para processos de compra mais exigentes" title="Qualificação avançada" description="Use quando precisa de avaliar fornecedores com critérios definidos, documentação ou experiência antes de os considerar numa oportunidade." enabled={modules.advanced_qualification_enabled} href="/requests/new" purchaseHref="/plans?addon=qualification" features={["Defina critérios", "Estruture pedidos", "Compare melhor"]} benefit="Mais rigor na selecção de fornecedores." />
              <AddonCard icon={<UserPlus className="h-5 w-5" />} eyebrow="Para oportunidades com fornecedores específicos" title="Convites direccionados" description="Use quando já sabe com quem quer trabalhar e pretende convidar empresas específicas para participar numa oportunidade." enabled={modules.supplier_invites_enabled} href="/proposals" purchaseHref="/plans?addon=supplier-invites" features={["Escolha convidados", "Controle a participação", "Centralize respostas"]} benefit="Mais controlo sobre quem participa." />
            </div>
          </section>

          <section className="mt-8 rounded-[24px] border border-[#dfe6ed] bg-white p-5 shadow-sm sm:p-6">
            <div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#0f766e]">Próximos passos</p><h2 className="mt-1 text-xl font-extrabold text-[#102a43]">Continue o trabalho</h2><p className="mt-1 text-sm leading-6 text-slate-500">Sugestões baseadas no estado actual do seu balcão, sem repetir os acessos do menu.</p></div>
            <div className="mt-5 grid gap-3 lg:grid-cols-3">
              <NextStepCard icon={<Building2 />} title={companyVerification === "verified" ? "Empresa pronta para negociar" : "Prepare a empresa para negociar"} text={companyVerification === "verified" ? "A verificação já está concluída." : "Mantenha os dados da empresa completos para transmitir confiança aos parceiros."} to="/dashboard/profile" status={companyVerification === "verified" ? "Concluído" : "Recomendado"} />
              <NextStepCard icon={<Plus />} title={requests.length ? "Continue os seus pedidos" : "Crie a primeira necessidade"} text={requests.length ? "Tem pedidos registados. Reveja o que está em curso e avance." : "Descreva o que procura para começar a encontrar fornecedores compatíveis."} to="/requests/new" status={requests.length ? "Em curso" : "Recomendado"} />
              <NextStepCard icon={<ShieldCheck />} title={modules.advanced_qualification_enabled ? "Qualificação pronta" : "Considere qualificação avançada"} text={modules.advanced_qualification_enabled ? "Pode usar critérios e processos mais estruturados nas suas oportunidades." : "Útil quando uma compra exige critérios, documentação ou comparação mais rigorosa."} to="/plans?addon=qualification" status={modules.advanced_qualification_enabled ? "Activo" : "Opcional"} />
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
                  Escolha Procurar Produtos & Serviços e publique a primeira necessidade para começar a gerar oportunidades comerciais.
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

function ModuleCard({
  icon, title, description, enabled, busy = false, onActivate, href, cta, tone, features,
}: {
  icon: ReactNode; title: string; description: string; enabled: boolean; busy?: boolean; onActivate: () => void; href: string; cta: string; tone: "teal" | "navy"; features: string[];
}) {
  const accent = tone === "teal";

  return (
    <div className="group rounded-2xl border border-[#dfe6ed] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#b9ddd8] hover:shadow-md sm:p-6">
      <div className="flex items-start gap-4">
        <div className={accent ? "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#e8f5f3] text-[#0f766e]" : "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#edf1f6] text-[#102a43]"}>
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[.14em] text-slate-400">Módulo</p>
              <h3 className="mt-0.5 text-xl font-extrabold tracking-tight text-[#102a43]">{title}</h3>
            </div>
            <span className={enabled ? "inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700" : "inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700"}>
              {enabled ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Clock3 className="h-3.5 w-3.5" />}
              {enabled ? "Activo" : "Disponível"}
            </span>
          </div>

          <p className="mt-2 max-w-xl text-sm leading-5 text-slate-500">{description}</p>

          <div className="mt-4 flex flex-wrap gap-2">
            {features.map((feature) => (
              <span key={feature} className="inline-flex items-center gap-1.5 rounded-lg bg-[#f6f8fb] px-2.5 py-1.5 text-[11px] font-semibold text-slate-600">
                <CheckCircle2 className="h-3 w-3 text-[#0f766e]" />
                {feature}
              </span>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
            {enabled ? (
              <Link to={href as never} className="inline-flex items-center gap-2 rounded-lg bg-[#0f766e] px-3.5 py-2 text-xs font-bold text-white transition hover:bg-[#0b5f59]">
                {busy ? "A activar..." : cta} {!busy && <ArrowRight className="h-3.5 w-3.5" />}
              </Link>
            ) : (
              <button onClick={onActivate} className="inline-flex items-center gap-2 rounded-lg bg-[#102a43] px-3.5 py-2 text-xs font-bold text-white transition hover:bg-[#163a5f]">
                {cta} <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}
            <span className="text-[11px] text-slate-400">
              {enabled ? "Pronto a utilizar" : "Activação imediata"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function AddonCard({
  icon, eyebrow, title, description, enabled, href, purchaseHref, features, benefit,
}: {
  icon: ReactNode; eyebrow: string; title: string; description: string; enabled: boolean; href: string; purchaseHref: string; features: string[]; benefit: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#dfe6ed] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#b9ddd8] hover:shadow-md sm:p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f1f4f8] text-[#102a43]">{icon}</div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div><p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#0f766e]">{eyebrow}</p><h3 className="mt-1 text-lg font-extrabold tracking-tight text-[#102a43]">{title}</h3></div>
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">{enabled ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> : <LockKeyhole className="h-3.5 w-3.5" />}{enabled ? "Activo" : "Opcional"}</span>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-500">{description}</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-3">{features.map((feature) => <div key={feature} className="flex items-center gap-2 rounded-lg bg-[#f6f8fb] px-3 py-2 text-xs font-semibold text-slate-600"><CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#0f766e]" />{feature}</div>)}</div>
          <div className="mt-4 rounded-xl border border-[#dcefeb] bg-[#f3faf8] px-3.5 py-3"><p className="text-[10px] font-bold uppercase tracking-wider text-[#0f766e]">Benefício principal</p><p className="mt-1 text-xs font-bold text-[#174b47]">{benefit}</p></div>
          <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
            <Link to={(enabled ? href : purchaseHref) as never} className="inline-flex items-center gap-2 rounded-xl bg-[#102a43] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#163a5f]">Ver mais <ArrowRight className="h-4 w-4" /></Link>
            <span className="text-xs text-slate-400">{enabled ? "Já activo na sua conta" : "Opcional · ver condições e compra"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function NextStepCard({ icon, title, text, to, status }: { icon: ReactNode; title: string; text: string; to: string; status: string; }) {
  return (
    <Link to={to as never} className="group rounded-2xl border border-[#dfe6ed] bg-white p-4 transition hover:border-[#b9ddd8] hover:shadow-sm">
      <div className="flex items-start justify-between gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8f5f3] text-[#0f766e]">{icon}</div><span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-500">{status}</span></div>
      <h3 className="mt-4 text-sm font-extrabold text-[#102a43]">{title}</h3><p className="mt-1 text-xs leading-5 text-slate-500">{text}</p>
      <div className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#0b5f59]">Continuar <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" /></div>
    </Link>
  );
}

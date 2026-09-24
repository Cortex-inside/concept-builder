import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Building2, ShoppingBag, Store, UserRound } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { supabase } from "../lib/supabase";
import type { Request } from "../lib/concept-data";

export const Route = createFileRoute("/dashboard")({ component: Dashboard });
type AccountModules = { buying_enabled: boolean; selling_enabled: boolean };

function Dashboard() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [modules, setModules] = useState<AccountModules>({ buying_enabled: false, selling_enabled: false });
  const [fullName, setFullName] = useState("Utilizador");

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const [requestResult, moduleResult, profileResult] = await Promise.all([
        supabase.from("requests").select("*").eq("owner_id", data.user.id).order("created_at", { ascending: false }),
        supabase.from("account_modules").select("buying_enabled, selling_enabled").eq("user_id", data.user.id).maybeSingle(),
        supabase.from("profiles").select("full_name").eq("id", data.user.id).maybeSingle(),
      ]);
      setRequests((requestResult.data ?? []) as Request[]);
      if (moduleResult.data) setModules(moduleResult.data);
      if (profileResult.data?.full_name) setFullName(profileResult.data.full_name);
    });
  }, []);

  return <main className="mx-auto max-w-7xl px-4 py-12 lg:px-6">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><p className="text-sm font-semibold uppercase tracking-wide text-[#0f766e]">Área empresarial</p><h1 className="mt-1 text-3xl font-bold text-[#102a43]">Olá, {fullName.split(" ")[0]}</h1><p className="mt-2 text-slate-600">Uma conta. Várias formas de fazer negócio.</p></div>
      <Link to="/dashboard/profile" className="rounded-lg border border-slate-200 bg-white px-4 py-2 font-semibold text-[#102a43]">Editar perfil</Link>
    </div>
    <section className="mt-8 grid gap-5 md:grid-cols-2">
      <ModuleCard icon={<ShoppingBag className="h-6 w-6" />} title="Comprar" description="Encontre fornecedores, publique necessidades e compare propostas." enabled={modules.buying_enabled} href="/requests/new" cta={modules.buying_enabled ? "Publicar necessidade" : "Ativar Comprar"} />
      <ModuleCard icon={<Store className="h-6 w-6" />} title="Vender" description="Apresente a sua empresa, receba oportunidades e responda a pedidos." enabled={modules.selling_enabled} href="/directory" cta={modules.selling_enabled ? "Ver oportunidades" : "Ativar Vender"} />
    </section>
    <section className="mt-8 grid gap-4 md:grid-cols-3">
      <InfoCard icon={<Building2 />} label="Empresa" value="Perfil empresarial" href="/dashboard/profile" />
      <InfoCard icon={<ShoppingBag />} label="Pedidos" value={String(requests.length)} href="/requests" />
      <InfoCard icon={<UserRound />} label="Conta" value="Definições e preferências" href="/dashboard/profile" />
    </section>
    <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-[#102a43]">Pedidos recentes</h2>
      {requests.length === 0 ? <p className="mt-4 text-sm text-slate-500">Ainda não existem pedidos. Ative Comprar para começar.</p> : requests.map((request) => <div key={request.id} className="flex justify-between gap-4 border-b border-slate-100 py-4"><span><b>{request.title}</b><small className="block text-slate-500">{request.sector} · {request.province}</small></span><span className="text-sm text-[#0b5f59]">{request.status}</span></div>)}
    </section>
  </main>;
}

function ModuleCard({ icon, title, description, enabled, href, cta }: { icon: ReactNode; title: string; description: string; enabled: boolean; href: string; cta: string }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e8f5f3] text-[#0f766e]">{icon}</div>
    <div className="mt-5 flex items-start justify-between gap-4"><div><h2 className="text-xl font-bold text-[#102a43]">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{description}</p></div><span className={enabled ? "rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700" : "rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600"}>{enabled ? "Ativo" : "Disponível"}</span></div>
    <Link to={href as never} className="mt-6 inline-flex items-center gap-2 font-semibold text-[#0b5f59]">{cta}<ArrowRight className="h-4 w-4" /></Link>
  </div>;
}
function InfoCard({ icon, label, value, href }: { icon: ReactNode; label: string; value: string; href: string }) {
  return <Link to={href as never} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="text-[#0f766e]">{icon}</div><p className="mt-4 text-sm text-slate-500">{label}</p><p className="font-semibold text-[#102a43]">{value}</p></Link>;
}

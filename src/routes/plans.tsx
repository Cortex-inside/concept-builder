import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, ArrowRight, Sparkles, UserPlus, ShoppingBag, Store } from "lucide-react";

export const Route = createFileRoute("/plans")({ component: Plans });

const modules = [
  {
    icon: ShoppingBag,
    name: "Procurar Produtos & Serviços",
    description: "Para empresas que procuram fornecedores, produtos e serviços.",
    price: "Incluído",
    features: ["Diretório empresarial", "Pesquisa por sector e província", "Publicação de necessidades", "Gestão de propostas"],
  },
  {
    icon: Store,
    name: "Oferecer Produtos & Serviços",
    description: "Para empresas que querem apresentar a sua oferta e responder a oportunidades.",
    price: "Incluído",
    features: ["Perfil comercial", "Oportunidades compatíveis", "Participação em pedidos", "Resposta a oportunidades"],
  },
];

const addons = [
  {
    icon: Sparkles,
    key: "qualification",
    name: "Qualificação avançada",
    description: "Adicione critérios de participação e pedidos estruturados para processos comerciais mais exigentes.",
    price: "Sob consulta",
    features: ["Critérios de qualificação", "Pedidos estruturados", "Certificações e experiência", "Controlo de participantes"],
  },
  {
    icon: UserPlus,
    key: "supplier-invites",
    name: "Convites direccionados",
    description: "Convide fornecedores específicos para oportunidades reservadas.",
    price: "Sob consulta",
    features: ["Convites directos", "Participação controlada", "Gestão de convidados", "Processos reservados"],
  },
];

function Plans() {
  return (
    <main className="min-h-[calc(100vh-72px)] bg-[#f6f8fb] px-4 py-8 text-[#172b4d] sm:px-6 lg:px-9 lg:py-12">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[.18em] text-[#0f766e]">Balcão Virtual</p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#102a43] sm:text-4xl">Planos e add-ons</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">Active os módulos comerciais de que precisa e adicione funcionalidades avançadas à sua operação.</p>
          </div>
          <Link to="/dashboard" className="inline-flex items-center gap-2 rounded-xl border border-[#d9e2ec] bg-white px-4 py-2.5 text-sm font-bold text-[#102a43] shadow-sm">
            Voltar ao balcão <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <section className="mt-8">
          <div className="mb-4">
            <h2 className="text-xl font-extrabold text-[#102a43]">Módulos comerciais</h2>
            <p className="mt-1 text-sm text-slate-500">Uma conta pode utilizar as duas frentes.</p>
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            {modules.map(({ icon: Icon, name, description, price, features }) => (
              <article key={name} className="rounded-2xl border border-[#dfe6ed] bg-white p-6 shadow-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e8f5f3] text-[#0f766e]"><Icon className="h-5 w-5" /></div>
                <h3 className="mt-5 text-xl font-extrabold text-[#102a43]">{name}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
                <p className="mt-5 text-sm font-bold text-[#0f766e]">{price}</p>
                <ul className="mt-5 space-y-2.5">{features.map(f => <li key={f} className="flex gap-2 text-sm text-slate-600"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[#0f766e]" />{f}</li>)}</ul>
                <Link to="/dashboard" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#102a43] px-4 py-2.5 text-sm font-bold text-white">Gerir no dashboard <ArrowRight className="h-4 w-4" /></Link>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.16em] text-[#c58a2a]">Funcionalidades opcionais</p>
              <h2 className="mt-1 text-xl font-extrabold text-[#102a43]">Comprar add-ons</h2>
              <p className="mt-1 text-sm text-slate-500">Os preços podem ser configurados antes de activar o checkout.</p>
            </div>
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            {addons.map(({ icon: Icon, key, name, description, price, features }) => (
              <article key={key} id={key} className="rounded-2xl border border-[#d9e2ec] bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f1f4f8] text-[#102a43]"><Icon className="h-5 w-5" /></div>
                  <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700">Add-on</span>
                </div>
                <h3 className="mt-5 text-xl font-extrabold text-[#102a43]">{name}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
                <p className="mt-5 text-lg font-extrabold text-[#102a43]">{price}</p>
                <ul className="mt-5 grid gap-2 sm:grid-cols-2">{features.map(f => <li key={f} className="rounded-lg bg-[#f6f8fb] px-3 py-2 text-xs font-semibold text-slate-600">{f}</li>)}</ul>
                <div className="mt-6 border-t border-slate-100 pt-4">
                  <button type="button" disabled className="inline-flex items-center gap-2 rounded-xl bg-slate-200 px-4 py-2.5 text-sm font-bold text-slate-500">
                    Comprar quando o checkout estiver disponível <ArrowRight className="h-4 w-4" />
                  </button>
                  <p className="mt-2 text-xs text-slate-400">A compra ainda não é processada automaticamente nesta versão.</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

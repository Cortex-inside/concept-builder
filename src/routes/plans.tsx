import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";

export const Route = createFileRoute("/plans")({ component: Plans });

const plans = [
  { name: "Starter", description: "Para começar", price: "Grátis", features: ["Perfil empresarial", "Diretório", "Pedidos básicos"] },
  { name: "Business", description: "Para empresas em crescimento", price: "Sob consulta", features: ["Tudo do Starter", "Mais oportunidades", "Ferramentas comerciais"] },
  { name: "Enterprise", description: "Para equipas e operações maiores", price: "Sob consulta", features: ["Tudo do Business", "Suporte dedicado", "Condições personalizadas"] },
];

function Plans() {
  return <main className="mx-auto max-w-6xl px-4 py-12 lg:px-6"><div className="mx-auto max-w-2xl text-center"><p className="text-sm font-semibold uppercase text-[#0f766e]">Planos</p><h1 className="mt-1 text-4xl font-bold text-[#102a43]">Planos para diferentes necessidades</h1><p className="mt-3 text-slate-600">Comece gratuitamente e evolua com a sua empresa.</p></div><div className="mt-10 grid gap-5 md:grid-cols-3">{plans.map(plan => <article key={plan.name} className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm"><h2 className="text-xl font-bold text-[#102a43]">{plan.name}</h2><p className="mt-2 text-sm text-slate-500">{plan.description}</p><p className="mt-6 text-3xl font-extrabold text-[#102a43]">{plan.price}</p><ul className="mt-6 space-y-3">{plan.features.map(feature => <li key={feature} className="flex gap-2 text-sm"><Check size={18} className="text-[#0f766e]" />{feature}</li>)}</ul><Link to="/register" className="mt-8 block rounded-lg bg-[#0f766e] py-3 text-center font-semibold text-white">Começar</Link></article>)}</div></main>;
}

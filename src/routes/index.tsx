import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Building2, CheckCircle2, FileText, Search, Users } from "lucide-react";
import { useI18n } from "../lib/i18n";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const { lang } = useI18n();
  const pt = lang === "pt";

  const steps = [
    { Icon: FileText, title: pt ? "1. Publique" : "1. Publish", desc: pt ? "Descreva o que procura." : "Describe what you need." },
    { Icon: Search, title: pt ? "2. Descubra" : "2. Discover", desc: pt ? "Receba fornecedores compatíveis." : "Receive compatible suppliers." },
    { Icon: CheckCircle2, title: pt ? "3. Compare" : "3. Compare", desc: pt ? "Convide empresas e compare propostas." : "Invite companies and compare proposals." },
  ];

  return (
    <main>
      <section className="bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-600 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-20 md:grid-cols-[1.2fr_.8fr] md:items-center md:py-28">
          <div>
            <span className="rounded-full bg-white/15 px-3 py-1 text-sm">{pt ? "Marketplace B2B Moçambique" : "B2B Marketplace Mozambique"}</span>
            <h1 className="mt-6 text-4xl font-extrabold tracking-tight md:text-6xl">
              {pt ? "Encontre empresas. Crie oportunidades. Faça negócios." : "Find companies. Create opportunities. Do business."}
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-blue-50">
              {pt ? "Descubra fornecedores, publique necessidades e compare propostas numa única plataforma." : "Discover suppliers, publish needs and compare proposals in one platform."}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/directory" className="rounded-xl bg-white px-5 py-3 font-semibold text-blue-700">
                {pt ? "Explorar empresas" : "Explore companies"} <ArrowRight className="ml-1 inline" size={17} />
              </Link>
              <Link to="/register" className="rounded-xl border border-white/40 px-5 py-3 font-semibold">
                {pt ? "Criar conta" : "Create account"}
              </Link>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 text-slate-900 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-50 p-3 text-blue-700"><Search /></div>
              <div>
                <h2 className="font-bold">{pt ? "O que precisa?" : "What do you need?"}</h2>
                <p className="text-sm text-slate-500">{pt ? "Descreva a necessidade e encontre fornecedores compatíveis." : "Describe your need and find compatible suppliers."}</p>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              {[
                pt ? "Fornecedor de serviços" : "Service provider",
                pt ? "Produtos e materiais" : "Products and materials",
                pt ? "Consultoria" : "Consulting",
                pt ? "Tecnologia" : "Technology",
              ].map((item) => (
                <Link key={item} to="/requests/new" className="flex items-center justify-between rounded-xl border p-4 hover:border-blue-300 hover:bg-blue-50">
                  <span>{item}</span><ArrowRight size={17} />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <p className="text-sm font-bold uppercase tracking-widest text-blue-600">{pt ? "Como funciona" : "How it works"}</p>
        <h2 className="mt-2 text-3xl font-bold">{pt ? "Do pedido à proposta em poucos passos" : "From request to proposal in a few steps"}</h2>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {steps.map(({ Icon, title, desc }) => (
            <div key={title} className="rounded-2xl border bg-white p-6">
              <Icon className="text-blue-600" />
              <h3 className="mt-4 font-bold">{title}</h3>
              <p className="mt-2 text-sm text-slate-600">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y bg-white">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-14 md:grid-cols-3">
          <div className="rounded-2xl bg-slate-50 p-6"><Building2 className="text-blue-600" /><h3 className="mt-4 font-bold">{pt ? "Diretório empresarial" : "Business directory"}</h3><p className="mt-2 text-sm text-slate-600">{pt ? "Pesquise por sector, província e verificação." : "Search by sector, province and verification."}</p></div>
          <div className="rounded-2xl bg-slate-50 p-6"><CheckCircle2 className="text-blue-600" /><h3 className="mt-4 font-bold">{pt ? "Perfis verificados" : "Verified profiles"}</h3><p className="mt-2 text-sm text-slate-600">{pt ? "Identifique empresas com informação verificada." : "Identify companies with verified information."}</p></div>
          <div className="rounded-2xl bg-slate-50 p-6"><Users className="text-blue-600" /><h3 className="mt-4 font-bold">{pt ? "Rede B2B" : "B2B network"}</h3><p className="mt-2 text-sm text-slate-600">{pt ? "Crie relações comerciais num só lugar." : "Build business relationships in one place."}</p></div>
        </div>
      </section>
    </main>
  );
}

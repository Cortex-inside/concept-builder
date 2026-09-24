import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BadgeCheck, CheckCircle2, ChevronRight, FileText, Handshake, Search, ShieldCheck, TrendingUp, Users, WalletCards, Megaphone, Building2, BriefcaseBusiness, Wrench, Truck, Cpu, HardHat } from "lucide-react";
import { useI18n } from "../lib/i18n";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const { lang } = useI18n();
  const pt = lang === "pt";

  const steps = [
    { n: "01", Icon: FileText, title: pt ? "Publique uma necessidade" : "Publish a requirement", desc: pt ? "Explique o que a sua empresa precisa, defina prazo, localização e orçamento." : "Describe what your business needs, including timing, location and budget." },
    { n: "02", Icon: Search, title: pt ? "Encontre fornecedores" : "Find suppliers", desc: pt ? "Descubra empresas compatíveis e convide-as a participar." : "Discover compatible companies and invite them to participate." },
    { n: "03", Icon: Handshake, title: pt ? "Compare e decida" : "Compare and decide", desc: pt ? "Receba propostas, compare condições e avance com o fornecedor certo." : "Receive proposals, compare terms and move forward with the right supplier." },
  ];

  const benefits = [
    { Icon: ShieldCheck, title: pt ? "Mais confiança nas compras" : "More confidence in procurement", text: pt ? "Informação empresarial estruturada e indicadores de verificação ajudam a reduzir incerteza." : "Structured business information and verification indicators help reduce uncertainty." },
    { Icon: TrendingUp, title: pt ? "Mais oportunidades comerciais" : "More commercial opportunities", text: pt ? "Fornecedores apresentam serviços e respondem a oportunidades relevantes." : "Suppliers showcase services and respond to relevant opportunities." },
    { Icon: WalletCards, title: pt ? "Processos mais organizados" : "More organized processes", text: pt ? "Pedidos, fornecedores e propostas ficam centralizados num único espaço." : "Requirements, suppliers and proposals stay organized in one place." },
  ];

  const sectors = pt
    ? ["Construção e engenharia", "Tecnologia e serviços", "Consultoria", "Logística e transporte", "Indústria e fornecimento", "Energia e equipamentos"]
    : ["Construction & engineering", "Technology & services", "Consulting", "Logistics & transport", "Industry & supply", "Energy & equipment"];

  return (
    <main>
      <section className="relative overflow-hidden bg-[#102a43] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_18%,rgba(15,118,110,.32),transparent_34%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-16 lg:grid-cols-[1.08fr_.92fr] lg:px-6 lg:py-24">
          <div className="flex flex-col justify-center">
            <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-bold uppercase tracking-[.12em] text-teal-100">
              <BadgeCheck size={14} /> {pt ? "Marketplace B2B para Moçambique" : "B2B marketplace for Mozambique"}
            </div>
            <h1 className="max-w-3xl text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              {pt ? "Transforme necessidades de negócio em oportunidades." : "Turn business needs into opportunities."}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200">
              {pt ? "Encontre empresas, publique pedidos, receba propostas e construa relações comerciais — numa plataforma feita para o mercado B2B moçambicano." : "Find companies, publish requirements, receive proposals and build business relationships — in a platform designed for Mozambique's B2B market."}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/requests/new" className="rounded-lg bg-[#0f766e] px-5 py-3.5 text-sm font-bold text-white shadow-lg hover:bg-[#0b5f59]">
                {pt ? "Publicar uma necessidade" : "Publish a requirement"} <ArrowRight className="ml-1 inline" size={17}/>
              </Link>
              <Link to="/directory" className="rounded-lg border border-white/20 bg-white/5 px-5 py-3.5 text-sm font-bold text-white hover:bg-white/10">
                {pt ? "Explorar empresas" : "Explore companies"}
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-xs font-medium text-slate-300">
              <span className="flex items-center gap-2"><CheckCircle2 size={15} className="text-teal-300"/> {pt ? "Perfis empresariais" : "Business profiles"}</span>
              <span className="flex items-center gap-2"><CheckCircle2 size={15} className="text-teal-300"/> {pt ? "Pedidos e propostas" : "Requirements & proposals"}</span>
              <span className="flex items-center gap-2"><CheckCircle2 size={15} className="text-teal-300"/> {pt ? "Mercado moçambicano" : "Mozambican market"}</span>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-2xl border border-white/15 bg-white p-5 text-[#102a43] shadow-2xl sm:p-6">
              <div className="flex items-start gap-3 border-b border-slate-100 pb-5">
                <div className="grid h-11 w-11 place-items-center rounded-lg bg-[#e8f5f3] text-[#0f766e]"><Search size={20}/></div>
                <div><p className="text-xs font-bold uppercase tracking-wider text-[#0f766e]">{pt ? "Comece aqui" : "Start here"}</p><h2 className="mt-1 text-xl font-bold">{pt ? "O que precisa?" : "What do you need?"}</h2><p className="mt-1 text-sm text-slate-500">{pt ? "Encontre empresas capazes de responder." : "Find companies that can respond."}</p></div>
              </div>
              <div className="mt-5 space-y-2">
                {(pt ? ["Preciso de um fornecedor", "Procuro um serviço profissional", "Quero comprar produtos ou materiais", "Quero encontrar novos clientes"] : ["I need a supplier", "I need a professional service", "I want to buy products or materials", "I want to find new customers"]).map(item =>
                  <Link key={item} to="/requests/new" className="flex items-center justify-between rounded-lg border border-slate-200 p-3.5 text-sm font-semibold text-slate-700 hover:border-[#86cfc7] hover:bg-[#e8f5f3]">
                    {item}<ChevronRight size={17} className="text-[#0f766e]"/>
                  </Link>
                )}
              </div>
              <div className="mt-5 rounded-lg bg-[#fbf4e5] p-3 text-xs leading-5 text-[#765017]">
                {pt ? "Uma plataforma para aproximar quem procura de quem pode fornecer." : "A platform connecting businesses that need with businesses that can supply."}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-[#fbf4e5]">
        <div className="mx-auto max-w-7xl px-4 py-10 lg:px-6">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.16em] text-[#0f766e]"><Megaphone size={15}/> {pt ? "Destaques do mercado" : "Market highlights"}</p>
              <h2 className="mt-2 text-2xl font-bold text-[#102a43]">{pt ? "Conteúdos e oportunidades em destaque" : "Featured content and opportunities"}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{pt ? "Espaços editoriais para destacar categorias, empresas, serviços e oportunidades relevantes dentro do Concept Builder." : "Editorial spaces to highlight categories, companies, services and relevant opportunities inside Concept Builder."}</p>
            </div>
            <Link to="/directory" className="hidden text-sm font-bold text-[#0f766e] sm:inline-flex">{pt ? "Ver directório" : "View directory"} <ArrowRight className="ml-1" size={16}/></Link>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {(pt ? [
              ["Construção & Engenharia","Empresas, empreiteiros, projectistas e fornecedores para obras e infra-estruturas.",HardHat,"/directory"],
              ["Tecnologia & Serviços","Software, serviços profissionais, consultoria e soluções para empresas.",Cpu,"/directory"],
              ["Logística & Fornecimento","Transporte, equipamentos, materiais e fornecimento empresarial.",Truck,"/directory"],
            ] : [
              ["Construction & Engineering","Companies, contractors, designers and suppliers for projects and infrastructure.",HardHat,"/directory"],
              ["Technology & Services","Software, professional services, consulting and business solutions.",Cpu,"/directory"],
              ["Logistics & Supply","Transport, equipment, materials and business supply.",Truck,"/directory"],
            ]).map(([title,desc,Icon,to]) => (
              <Link key={title as string} to={to as "/directory"} className="group rounded-xl border border-[#eadbb9] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex items-start justify-between gap-4">
                  <div className="grid h-11 w-11 place-items-center rounded-lg bg-[#e8f5f3] text-[#0f766e]"><Icon size={20}/></div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#b47a20]">{pt ? "Destaque" : "Featured"}</span>
                </div>
                <h3 className="mt-5 font-bold text-[#102a43]">{title as string}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{desc as string}</p>
                <span className="mt-4 inline-flex items-center text-sm font-bold text-[#0f766e]">{pt ? "Explorar categoria" : "Explore category"} <ArrowRight className="ml-1" size={15}/></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:grid-cols-3 lg:px-6">
          {(pt ? [["01","Procure","Encontre empresas e serviços"],["02","Publique","Descreva uma necessidade"],["03","Compare","Avalie propostas e condições"]] : [["01","Search","Find companies and services"],["02","Publish","Describe a requirement"],["03","Compare","Evaluate proposals and terms"]]).map(([n,t,d]) =>
            <div key={n} className="flex gap-4"><span className="text-sm font-extrabold text-[#0f766e]">{n}</span><div><p className="font-bold text-[#102a43]">{t}</p><p className="mt-1 text-sm text-slate-500">{d}</p></div></div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 lg:px-6 lg:py-20">
        <div className="max-w-2xl"><p className="text-xs font-bold uppercase tracking-[.16em] text-[#0f766e]">{pt ? "Para compradores" : "For buyers"}</p><h2 className="mt-2 text-3xl font-bold tracking-tight text-[#102a43] sm:text-4xl">{pt ? "Torne o processo de compra empresarial mais simples." : "Make business procurement simpler."}</h2><p className="mt-4 leading-7 text-slate-600">{pt ? "Encontrar opções confiáveis e comparar propostas pode consumir tempo. O Concept Builder organiza esse processo." : "Finding reliable options and comparing proposals takes time. Concept Builder organizes that process."}</p></div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">{benefits.map(({Icon,title,text}) => <article key={title} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"><div className="grid h-10 w-10 place-items-center rounded-lg bg-[#e8f5f3] text-[#0f766e]"><Icon size={20}/></div><h3 className="mt-5 font-bold text-[#102a43]">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{text}</p></article>)}</div>
      </section>

      <section className="bg-[#f0f4f8]">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 lg:grid-cols-[.8fr_1.2fr] lg:px-6">
          <div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#0f766e]">{pt ? "Para fornecedores" : "For suppliers"}</p><h2 className="mt-2 text-3xl font-bold tracking-tight text-[#102a43]">{pt ? "Esteja onde as empresas procuram." : "Be where businesses are looking."}</h2><p className="mt-4 leading-7 text-slate-600">{pt ? "Apresente a sua empresa, mostre os seus serviços e responda a pedidos relevantes para criar oportunidades comerciais mais qualificadas." : "Present your company, showcase your services and respond to relevant requirements to create more qualified opportunities."}</p><Link to="/register" className="mt-6 inline-flex items-center rounded-lg bg-[#102a43] px-5 py-3 text-sm font-bold text-white hover:bg-[#163a5f]">{pt ? "Registar empresa" : "Register company"} <ArrowRight className="ml-2" size={16}/></Link></div>
          <div className="grid gap-3 sm:grid-cols-2">{sectors.map((s,i) => <div key={s} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4"><span className="grid h-9 w-9 place-items-center rounded-md bg-[#fbf4e5] text-xs font-bold text-[#765017]">0{i+1}</span><span className="text-sm font-semibold text-[#102a43]">{s}</span></div>)}</div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 lg:px-6 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="rounded-2xl bg-[#102a43] p-8 text-white sm:p-10"><p className="text-xs font-bold uppercase tracking-[.16em] text-teal-200">{pt ? "Como funciona" : "How it works"}</p><h2 className="mt-3 text-3xl font-bold">{pt ? "Da necessidade ao negócio." : "From requirement to business."}</h2><p className="mt-4 leading-7 text-slate-300">{pt ? "Um fluxo simples para reduzir pesquisa manual e dar estrutura à relação entre compradores e fornecedores." : "A simple flow to reduce manual searching and structure buyer-supplier relationships."}</p></div>
          <div className="space-y-5">{steps.map(({n,Icon,title,desc}) => <div key={n} className="flex gap-4"><div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-slate-200 bg-white text-[#0f766e] shadow-sm"><Icon size={19}/></div><div><div className="flex items-center gap-2"><span className="text-xs font-bold text-[#0f766e]">{n}</span><h3 className="font-bold text-[#102a43]">{title}</h3></div><p className="mt-1 text-sm leading-6 text-slate-600">{desc}</p></div></div>)}</div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 text-center lg:px-6"><Users className="mx-auto text-[#0f766e]" size={25}/><h2 className="mt-4 text-2xl font-bold text-[#102a43]">{pt ? "Feito para relações comerciais de longo prazo" : "Built for long-term business relationships"}</h2><p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-600">{pt ? "O Concept Builder não é apenas um directório. É uma base para descobrir empresas, criar oportunidades e organizar processos comerciais." : "Concept Builder is more than a directory. It is a foundation to discover companies, create opportunities and organize commercial processes."}</p></div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 lg:px-6">
        <div className="rounded-2xl bg-[#0f766e] px-6 py-10 text-white sm:px-10 sm:py-12 lg:flex lg:items-center lg:justify-between lg:gap-10"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-teal-100">{pt ? "Comece agora" : "Get started"}</p><h2 className="mt-2 text-3xl font-bold">{pt ? "Pronto para criar novas oportunidades?" : "Ready to create new opportunities?"}</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-teal-50">{pt ? "Procure empresas ou publique a sua primeira necessidade no Concept Builder." : "Find companies or publish your first requirement on Concept Builder."}</p></div><div className="mt-6 flex shrink-0 flex-wrap gap-3 lg:mt-0"><Link to="/directory" className="rounded-lg bg-white px-5 py-3 text-sm font-bold text-[#0b5f59]">{pt ? "Explorar empresas" : "Explore companies"}</Link><Link to="/register" className="rounded-lg border border-white/30 px-5 py-3 text-sm font-bold text-white hover:bg-white/10">{pt ? "Criar conta" : "Create account"}</Link></div></div>
      </section>
    </main>
  );
}

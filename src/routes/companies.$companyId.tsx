import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Award, BriefcaseBusiness, Building2, Globe2, MapPin, ShieldCheck, Users } from "lucide-react";
import { supabase } from "../lib/supabase";
import type { Company } from "../lib/concept-data";
import {
  CompanyContactPanel,
  CompanyProfileCompleteness,
  CompanyProfileSection,
  CompanyProfileStats,
  CompanyVerificationBadge,
} from "../components/company-profile";

export const Route = createFileRoute("/companies/$companyId")({ component: CompanyDetail });

function CompanyDetail() {
  const { companyId } = Route.useParams();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    supabase.from("companies").select("*").eq("id", companyId).maybeSingle().then(({ data, error: loadError }) => {
      if (!active) return;
      if (loadError) setError(loadError.message);
      setCompany((data ?? null) as Company | null);
      setLoading(false);
    });
    return () => { active = false; };
  }, [companyId]);

  if (loading) {
    return <main className="mx-auto max-w-6xl px-4 py-16"><div className="h-96 animate-pulse rounded-2xl border border-slate-200 bg-white" /></main>;
  }

  if (error) {
    return <main className="mx-auto max-w-3xl px-4 py-16"><h1 className="text-2xl font-bold text-[#102a43]">Não foi possível carregar o perfil</h1><p className="mt-2 text-sm text-red-600">{error}</p><Link to="/directory" className="mt-5 inline-block text-sm font-bold text-[#0b5f59]">← Voltar ao diretório</Link></main>;
  }

  if (!company) {
    return <main className="mx-auto max-w-3xl px-4 py-16"><h1 className="text-3xl font-bold text-[#102a43]">Empresa não encontrada</h1><p className="mt-2 text-slate-500">O perfil pode ter sido removido ou ainda não estar disponível.</p><Link to="/directory" className="mt-5 inline-block text-sm font-bold text-[#0b5f59]">← Voltar ao diretório</Link></main>;
  }

  const services = company.services ?? [];
  const coverage = company.served_provinces ?? [];
  const certifications = company.certifications ?? [];

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 lg:px-6">
      <Link to="/directory" className="text-sm font-bold text-[#0b5f59] hover:underline">← Diretório empresarial</Link>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-7">
          <section className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm sm:p-9">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 gap-4">
                <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-[#e8f5f3] text-[#0b5f59]"><Building2 size={28} /></div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-3xl font-bold tracking-tight text-[#102a43]">{company.trade_name || company.name}</h1>
                    {company.verified && <ShieldCheck className="text-[#0f766e]" size={22} />}
                  </div>
                  {company.trade_name && <p className="mt-1 text-sm text-slate-500">{company.name}</p>}
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <CompanyVerificationBadge company={company} />
                    <span className="text-sm font-semibold text-[#0b5f59]">{company.sector}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-wide text-slate-400">Localização</p><p className="mt-1 flex items-center gap-2 text-sm font-semibold text-[#102a43]"><MapPin size={15} />{company.city ? `${company.city}, ` : ""}{company.province}</p></div>
              <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-wide text-slate-400">Tipo de entidade</p><p className="mt-1 text-sm font-semibold text-[#102a43]">{company.entity_type || "Não informado"}</p></div>
            </div>

            <CompanyProfileSection title="Sobre a empresa" icon={<Building2 size={18} />}>
              <p className="whitespace-pre-line text-[15px] leading-7 text-slate-600">{company.description || "A empresa ainda não adicionou uma descrição pública."}</p>
            </CompanyProfileSection>

            <CompanyProfileSection title="Produtos e serviços" icon={<BriefcaseBusiness size={18} />}>
              {services.length > 0 ? <div className="flex flex-wrap gap-2">{services.map((service) => <span key={service} className="rounded-lg bg-[#e8f5f3] px-3 py-2 text-sm font-medium text-[#0b5f59]">{service}</span>)}</div> : <p className="text-sm text-slate-500">Ainda não foram publicados produtos ou serviços.</p>}
            </CompanyProfileSection>

            {coverage.length > 0 && (
              <CompanyProfileSection title="Área de actuação" icon={<Globe2 size={18} />}>
                <div className="flex flex-wrap gap-2">{coverage.map((item) => <span key={item} className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600">{item}</span>)}</div>
              </CompanyProfileSection>
            )}

            <CompanyProfileSection title="Experiência e capacidade" icon={<BriefcaseBusiness size={18} />}>
              {company.experience_summary && <p className="whitespace-pre-line text-sm leading-6 text-slate-600">{company.experience_summary}</p>}
              <CompanyProfileStats company={company} />
              {!company.experience_summary && company.completed_projects == null && !company.founded_year && !company.employees && <p className="text-sm text-slate-500">Esta empresa ainda não publicou informação detalhada sobre a sua experiência.</p>}
            </CompanyProfileSection>

            <CompanyProfileSection title="Certificações e credenciais" icon={<Award size={18} />}>
              {certifications.length > 0 ? <div className="space-y-2">{certifications.map((item) => <div key={item} className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 text-sm text-slate-700"><Award size={16} className="text-[#0f766e]" />{item}</div>)}</div> : <p className="text-sm text-slate-500">Nenhuma certificação foi publicada neste perfil.</p>}
            </CompanyProfileSection>
          </section>
        </div>

        <aside className="space-y-4">
          <CompanyContactPanel company={company} />
          <CompanyProfileCompleteness company={company} />
          <div className="rounded-2xl border border-slate-200 bg-[#102a43] p-6 text-white">
            <p className="text-xs font-bold uppercase tracking-[.16em] text-slate-300">Próximo passo</p>
            <h2 className="mt-2 text-lg font-bold">Precisa desta capacidade?</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">Crie uma necessidade e use este perfil como referência para o seu processo de compra.</p>
            <Link to="/requests/new" className="mt-5 inline-flex w-full items-center justify-center rounded-lg bg-white px-4 py-3 text-sm font-bold text-[#102a43]">Criar necessidade</Link>
          </div>
        </aside>
      </div>
    </main>
  );
}

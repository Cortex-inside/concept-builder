import { CheckCircle2, Globe2, Mail, MapPin, Phone, ShieldCheck, Users, BriefcaseBusiness, Award, Building2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { Company } from "../lib/concept-data";

function safeList(values?: string[] | null) {
  return (values ?? []).filter(Boolean);
}

export function CompanyVerificationBadge({ company }: { company: Company }) {
  const status = company.verification_status ?? (company.verified ? "verified" : "unverified");

  if (status === "verified" || company.verified) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
        <CheckCircle2 size={14} /> Empresa verificada
      </span>
    );
  }

  if (status === "pending") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">
        <ShieldCheck size={14} /> Verificação em análise
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
      <ShieldCheck size={14} /> Perfil não verificado
    </span>
  );
}

export function CompanyProfileCompleteness({ company }: { company: Company }) {
  const checks = [
    Boolean(company.name),
    Boolean(company.description),
    Boolean(company.sector),
    Boolean(company.province),
    safeList(company.services).length > 0,
    Boolean(company.city),
    Boolean(company.website || company.email || company.phone || company.whatsapp),
    Boolean(company.experience_summary || company.completed_projects != null),
    safeList(company.certifications).length > 0,
  ];
  const completed = checks.filter(Boolean).length;
  const percentage = Math.round((completed / checks.length) * 100);

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-[#102a43]">Perfil empresarial</p>
          <p className="mt-1 text-xs text-slate-500">Quanto mais completo, mais informação disponível para compradores.</p>
        </div>
        <span className="text-sm font-bold text-[#0b5f59]">{percentage}%</span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
        <div className="h-full rounded-full bg-[#0f766e]" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}

export function CompanyProfileCard({ company }: { company: Company }) {
  const services = safeList(company.services);
  const coverage = safeList(company.served_provinces);

  return (
    <article className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#e8f5f3] text-[#0b5f59]">
            <Building2 size={22} />
          </div>
          <div className="min-w-0">
            <Link
              to="/companies/$companyId"
              params={{ companyId: company.id }}
              className="line-clamp-2 text-lg font-bold text-[#102a43] hover:text-[#0b5f59]"
            >
              {company.trade_name || company.name}
            </Link>
            {company.trade_name && <p className="mt-0.5 text-xs text-slate-500">{company.name}</p>}
          </div>
        </div>
        {company.verified && <CheckCircle2 className="mt-1 shrink-0 text-[#0f766e]" size={18} />}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <CompanyVerificationBadge company={company} />
        <span className="text-xs font-semibold text-slate-500">{company.sector}</span>
      </div>

      <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">{company.description}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {services.slice(0, 5).map((service) => (
          <span key={service} className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
            {service}
          </span>
        ))}
        {services.length > 5 && <span className="px-1 py-1 text-xs font-semibold text-slate-400">+{services.length - 5}</span>}
      </div>

      <div className="mt-auto grid gap-2 border-t border-slate-100 pt-5 text-xs text-slate-500 sm:grid-cols-2">
        <span className="inline-flex items-center gap-1.5"><MapPin size={14} />{company.city ? `${company.city}, ` : ""}{company.province}</span>
        {coverage.length > 0 && <span className="inline-flex items-center gap-1.5"><Globe2 size={14} />Actua em {coverage.length} província{coverage.length === 1 ? "" : "s"}</span>}
      </div>

      <Link
        to="/companies/$companyId"
        params={{ companyId: company.id }}
        className="mt-4 inline-flex items-center justify-center rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-bold text-[#102a43] hover:border-[#0f766e] hover:text-[#0b5f59]"
      >
        Ver perfil
      </Link>
    </article>
  );
}

export function CompanyProfileSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-slate-200 pt-7">
      <div className="flex items-center gap-2">
        {icon && <span className="text-[#0f766e]">{icon}</span>}
        <h2 className="text-lg font-bold text-[#102a43]">{title}</h2>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function CompanyContactPanel({ company }: { company: Company }) {
  const website = company.website?.trim();

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-base font-bold text-[#102a43]">Contactar a empresa</h2>
      <div className="mt-4 space-y-3 text-sm text-slate-600">
        {company.email && <a href={`mailto:${company.email}`} className="flex items-center gap-3 hover:text-[#0b5f59]"><Mail size={16} />{company.email}</a>}
        {company.phone && <a href={`tel:${company.phone}`} className="flex items-center gap-3 hover:text-[#0b5f59]"><Phone size={16} />{company.phone}</a>}
        {company.whatsapp && <a href={`https://wa.me/${company.whatsapp.replace(/\\D/g, "")}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 hover:text-[#0b5f59]"><Phone size={16} />WhatsApp</a>}
        {website && <a href={website} target="_blank" rel="noreferrer" className="flex items-center gap-3 break-all hover:text-[#0b5f59]"><Globe2 size={16} />{website}</a>}
        {!company.email && !company.phone && !company.whatsapp && !website && <p className="text-slate-500">Os contactos públicos ainda não foram disponibilizados.</p>}
      </div>
    </div>
  );
}

export function CompanyProfileStats({ company }: { company: Company }) {
  const stats = [
    company.founded_year ? { label: "No mercado desde", value: String(company.founded_year), icon: <Building2 size={16} /> } : null,
    company.completed_projects != null ? { label: "Projectos concluídos", value: String(company.completed_projects), icon: <BriefcaseBusiness size={16} /> } : null,
    company.employees ? { label: "Dimensão", value: company.employees, icon: <Users size={16} /> } : null,
    safeList(company.certifications).length > 0 ? { label: "Certificações", value: String(company.certifications?.length), icon: <Award size={16} /> } : null,
  ].filter(Boolean) as { label: string; value: string; icon: React.ReactNode }[];

  if (stats.length === 0) return null;

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.label} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center gap-2 text-[#0f766e]">{stat.icon}<span className="text-xs font-bold uppercase tracking-wide text-slate-500">{stat.label}</span></div>
          <p className="mt-2 text-lg font-bold text-[#102a43]">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}

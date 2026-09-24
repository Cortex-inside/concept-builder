import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { supabase } from "../lib/supabase";
import type { Company } from "../lib/concept-data";

export const Route = createFileRoute("/companies/$companyId")({ component: Company });

function Company() {
  const { companyId } = Route.useParams();
  const [company, setCompany] = useState<Company | null>(null);

  useEffect(() => {
    supabase.from("companies").select("*").eq("id", companyId).maybeSingle().then(({ data }) => {
      setCompany((data ?? null) as Company | null);
    });
  }, [companyId]);

  if (!company) return <main className="mx-auto max-w-3xl px-4 py-16"><h1 className="text-3xl font-bold">Empresa não encontrada</h1><Link to="/directory" className="mt-4 inline-block text-[#0b5f59]">Voltar ao diretório</Link></main>;

  return <main className="mx-auto max-w-4xl px-4 py-12">
    <Link to="/directory" className="text-sm font-semibold text-[#0b5f59]">← Diretório</Link>
    <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="flex items-center gap-2">
        <h1 className="text-3xl font-bold text-[#102a43]">{company.name}</h1>
        {company.verified && <CheckCircle2 className="text-[#0f766e]" size={20} />}
      </div>
      <p className="mt-2 font-semibold text-[#0b5f59]">{company.sector} · {company.province}</p>
      <p className="mt-5 leading-7 text-slate-600">{company.description}</p>
      <div className="mt-6 flex flex-wrap gap-2">{company.services.map(service => <span key={service} className="rounded-md bg-[#e8f5f3] px-3 py-1 text-sm text-[#0b5f59]">{service}</span>)}</div>
      {(company.email || company.phone) && <div className="mt-8 border-t border-slate-200 pt-6 text-sm text-slate-600">{company.email ?? ""}{company.email && company.phone ? " · " : ""}{company.phone ?? ""}</div>}
      <Link to="/requests/new" className="mt-6 inline-block rounded-lg bg-[#0f766e] px-5 py-3 font-semibold text-white">Solicitar proposta</Link>
    </div>
  </main>;
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, Mail, Send } from "lucide-react";
import { supabase } from "../lib/supabase";
import type { Company } from "../lib/concept-data";

export const Route = createFileRoute("/proposals")({ component: Proposals });

function Proposals() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [invited, setInvited] = useState<string[]>([]);
  useEffect(() => {
    supabase.from("companies").select("*").order("name").limit(12).then(({ data }) => setCompanies((data ?? []) as Company[]));
  }, []);

  async function invite(companyId: string) {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;
    const { data: request } = await supabase.from("requests").select("id").eq("owner_id", userData.user.id).eq("status", "open").order("created_at", { ascending: false }).limit(1).maybeSingle();
    if (!request) return;
    const { error } = await supabase.from("proposal_invitations").upsert({ request_id: request.id, supplier_id: companyId, status: "invited" }, { onConflict: "request_id,supplier_id" });
    if (!error) setInvited(v => v.includes(companyId) ? v : [...v, companyId]);
  }

  return <main className="mx-auto max-w-7xl px-4 py-12 lg:px-6"><h1 className="text-3xl font-bold text-[#102a43]">Fornecedores e propostas</h1><p className="mt-2 text-slate-600">Convide fornecedores e acompanhe propostas.</p>
    <div className="mt-8 grid gap-4 md:grid-cols-2">{companies.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-sm text-slate-500 md:col-span-2">Ainda não existem empresas registadas.</div> : companies.map(company => <div key={company.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-center gap-2"><h2 className="font-bold text-[#102a43]">{company.name}</h2>{company.verified && <CheckCircle2 className="text-[#0f766e]" size={18} />}</div><p className="mt-2 text-sm text-[#0b5f59]">{company.sector}</p><p className="mt-3 text-sm text-slate-600">{company.description}</p><button onClick={() => invite(company.id)} className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 py-2.5 font-semibold">{invited.includes(company.id) ? <><Send size={16} /> Convite enviado</> : <><Mail size={16} /> Convidar para propor</>}</button></div>)}</div>
    <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-xl font-bold text-[#102a43]">Comparação</h2><p className="mt-3 text-sm text-slate-500">As propostas reais aparecerão aqui quando os fornecedores responderem aos convites.</p><Link to="/requests" className="mt-5 inline-block font-semibold text-[#0b5f59]">Ver pedidos →</Link></section>
  </main>;
}

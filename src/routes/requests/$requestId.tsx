import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, FileText, Mail, Send, ShieldCheck } from "lucide-react";
import { supabase } from "../../lib/supabase";
import type { Company, Request } from "../../lib/concept-data";

export const Route = createFileRoute("/requests/$requestId")({ component: RequestDetail });

function RequestDetail() {
  const { requestId } = Route.useParams();
  const [request, setRequest] = useState<Request | null>(null);
  const [owner, setOwner] = useState<Company | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [interested, setInterested] = useState(false);
  const [invited, setInvited] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [{ data: r }, { data: auth }] = await Promise.all([
        supabase.from("requests").select("*").eq("id", requestId).maybeSingle(),
        supabase.auth.getUser(),
      ]);
      setRequest(r as Request | null);
      if (!r) { setLoading(false); return; }
      const [{ data: buyer }, { data: mine }] = await Promise.all([
        supabase.from("companies").select("*").eq("owner_id", r.owner_id ?? "").maybeSingle(),
        auth.user ? supabase.from("companies").select("*").eq("owner_id", auth.user.id).maybeSingle() : Promise.resolve({ data: null }),
      ]);
      setOwner((buyer ?? null) as Company | null);
      setCompany((mine ?? null) as Company | null);
      if (mine) {
        const [{ data: i }, { data: invite }] = await Promise.all([
          supabase.from("request_interests").select("id").eq("request_id", requestId).eq("supplier_id", mine.id).maybeSingle(),
          supabase.from("proposal_invitations").select("id").eq("request_id", requestId).eq("supplier_id", mine.id).maybeSingle(),
        ]);
        setInterested(Boolean(i)); setInvited(Boolean(invite));
      }
      setLoading(false);
    })();
  }, [requestId]);

  async function expressInterest() {
    if (!company || !request) return;
    setBusy(true); setMessage("");
    const { error } = await supabase.from("request_interests").upsert(
      { request_id: request.id, supplier_id: company.id, status: "interested" },
      { onConflict: "request_id,supplier_id" },
    );
    setBusy(false);
    if (error) setMessage(error.message);
    else { setInterested(true); setMessage("Interesse registado. Pode agora preparar a sua proposta."); }
  }

  if (loading) return <main className="mx-auto max-w-4xl px-4 py-12 text-sm text-slate-500">A carregar oportunidade...</main>;
  if (!request) return <main className="mx-auto max-w-4xl px-4 py-12"><div className="rounded-2xl border border-slate-200 bg-white p-8"><h1 className="text-xl font-extrabold text-[#102a43]">Oportunidade não encontrada</h1><Link className="mt-4 inline-flex items-center text-sm font-bold text-[#0f766e]" to="/requests"><ArrowLeft className="mr-2 h-4 w-4" />Voltar às oportunidades</Link></div></main>;

  const isOwner = Boolean(company?.id && owner?.id === company.id);
  const open = request.status === "open";
  const inviteOnly = request.participation_mode === "invite_only";
  const canParticipate = open && !isOwner && !inviteOnly;
  const canPrepare = canParticipate && (request.participation_mode === "open" || interested || invited);

  return <main className="mx-auto max-w-5xl px-4 py-10 lg:px-6">
    <Link to="/requests" className="inline-flex items-center gap-2 text-sm font-bold text-[#0f766e]"><ArrowLeft className="h-4 w-4" />Voltar às oportunidades</Link>
    <section className="mt-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#0f766e]">Oportunidade</p><h1 className="mt-2 text-3xl font-extrabold text-[#102a43]">{request.title}</h1><p className="mt-2 text-sm text-slate-500">{request.sector} · {request.province}</p></div>
        <span className="rounded-full bg-[#e8f5f3] px-3 py-1.5 text-xs font-bold text-[#0b5f59]">{open ? "Aberta" : request.status}</span>
      </div>
      <div className="mt-7 grid gap-7 lg:grid-cols-[1fr_280px]">
        <div>
          <h2 className="font-extrabold text-[#102a43]">O que a empresa procura</h2>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-600">{request.description}</p>
          {request.tender_summary && <div className="mt-5 rounded-2xl bg-[#f6f8fb] p-4"><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Resumo do processo</p><p className="mt-2 text-sm leading-6 text-slate-600">{request.tender_summary}</p></div>}
          {request.terms_content && <div className="mt-5 rounded-2xl border border-slate-200 p-4"><div className="flex items-center gap-2"><FileText className="h-4 w-4 text-[#0f766e]" /><p className="text-sm font-bold text-[#102a43]">Condições da oportunidade</p></div><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{request.terms_content}</p></div>}
        </div>
        <aside className="space-y-3">
          <div className="rounded-2xl bg-[#f6f8fb] p-4"><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Participação</p><p className="mt-1 text-sm font-bold text-[#102a43]">{request.participation_mode === "open" ? "Aberta" : request.participation_mode === "qualified" ? "Qualificada" : "Por convite"}</p></div>
          {request.budget && <div className="rounded-2xl bg-[#f6f8fb] p-4"><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Orçamento indicado</p><p className="mt-1 text-sm font-bold text-[#102a43]">{request.budget}</p></div>}
          {request.require_verified && <div className="rounded-2xl bg-[#e8f5f3] p-4"><p className="flex items-center gap-2 text-xs font-bold text-[#0b5f59]"><ShieldCheck className="h-4 w-4" />Empresa verificada exigida</p></div>}
          {request.min_years_in_market != null && <div className="rounded-2xl bg-[#f6f8fb] p-4 text-xs text-slate-600">Experiência mínima: <strong>{request.min_years_in_market} anos</strong></div>}
          {request.min_completed_projects != null && <div className="rounded-2xl bg-[#f6f8fb] p-4 text-xs text-slate-600">Projectos mínimos: <strong>{request.min_completed_projects}</strong></div>}
          {request.required_certifications?.length ? <div className="rounded-2xl bg-[#f6f8fb] p-4 text-xs text-slate-600"><strong>Certificações:</strong><div className="mt-2 flex flex-wrap gap-1.5">{request.required_certifications.map(x => <span key={x} className="rounded-full bg-white px-2 py-1">{x}</span>)}</div></div> : null}
        </aside>
      </div>
      {message && <div className="mt-6 rounded-xl bg-[#f3faf8] px-4 py-3 text-sm font-semibold text-[#0b5f59]">{message}</div>}
      <div className="mt-7 border-t border-slate-100 pt-6">
        {isOwner ? <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-bold text-[#102a43]">Esta oportunidade pertence à sua empresa.</p><p className="mt-1 text-xs text-slate-500">Acompanhe convites e propostas recebidas.</p></div><Link to="/proposals" className="rounded-xl bg-[#102a43] px-4 py-2.5 text-sm font-bold text-white">Gerir propostas</Link></div>
        : !company ? <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">Registe a sua empresa para participar nesta oportunidade.</div>
        : inviteOnly && !invited ? <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600"><Mail className="mr-2 inline h-4 w-4" />Esta oportunidade é apenas por convite.</div>
        : canParticipate ? <div className="flex flex-wrap items-center justify-between gap-4"><div><p className="font-bold text-[#102a43]">{invited ? "Foi convidado para esta oportunidade." : interested ? "Interesse manifestado." : "Pode participar nesta oportunidade."}</p><p className="mt-1 text-xs text-slate-500">O próximo passo é preparar e enviar a sua proposta.</p></div><div className="flex gap-2">{!interested && !invited && <button disabled={busy} onClick={expressInterest} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-[#102a43]">{busy ? "A registar..." : "Manifestar interesse"}</button>}{canPrepare && <Link to="/proposals" search={{ requestId }} className="inline-flex items-center gap-2 rounded-xl bg-[#0f766e] px-4 py-2.5 text-sm font-bold text-white"><Send className="h-4 w-4" />Preparar proposta</Link>}</div></div>
        : <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">Esta oportunidade já não está disponível para participação.</div>}
      </div>
    </section>
    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-[#0f766e]" /><h2 className="font-extrabold text-[#102a43]">Sobre o comprador</h2></div>
      {owner ? <div className="mt-4"><p className="font-bold text-[#102a43]">{owner.name}</p><p className="mt-1 text-sm text-slate-500">{owner.sector} · {owner.province}{owner.verified ? " · Empresa verificada" : ""}</p>{owner.description && <p className="mt-3 text-sm leading-6 text-slate-600">{owner.description}</p>}<Link to="/directory" className="mt-4 inline-flex text-sm font-bold text-[#0f766e]">Explorar empresas →</Link></div> : <p className="mt-3 text-sm text-slate-500">Informação do comprador indisponível.</p>}
    </section>
  </main>;
}

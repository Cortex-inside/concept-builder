import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, FileText, Mail, Send, ShieldCheck, XCircle } from "lucide-react";
import { supabase } from "../lib/supabase";
import type { Company, Request } from "../lib/concept-data";

export const Route = createFileRoute("/proposals")({
  validateSearch: (search: Record<string, unknown>) => ({
    requestId: typeof search.requestId === "string" ? search.requestId : "",
  }),
  component: Proposals,
});

type Proposal = {
  id: string;
  request_id: string;
  supplier_id: string;
  amount: number | null;
  currency: string;
  delivery_days: number | null;
  notes: string | null;
  status: "draft" | "received" | "accepted" | "rejected";
  created_at: string;
  supplier?: Company | null;
  request?: Request | null;
};

type Invitation = {
  id: string;
  request_id: string;
  supplier_id: string;
  status: "invited" | "accepted" | "declined";
  supplier?: Company | null;
};

function Proposals() {
  const [userId, setUserId] = useState<string | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [requests, setRequests] = useState<Request[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [selectedRequest, setSelectedRequest] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("MZN");
  const [deliveryDays, setDeliveryDays] = useState("");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [supplierMode, setSupplierMode] = useState(false);
  const { requestId } = Route.useSearch();

  async function load() {
    const { data: auth } = await supabase.auth.getUser();
    const uid = auth.user?.id;
    if (!uid) return;
    setUserId(uid);

    const [{ data: ownCompany }, { data: ownRequests }, { data: allCompanies }, { data: ownInvites }] = await Promise.all([
      supabase.from("companies").select("*").eq("owner_id", uid).maybeSingle(),
      supabase.from("requests").select("*").eq("owner_id", uid).order("created_at", { ascending: false }),
      supabase.from("companies").select("*").order("name"),
      supabase.from("proposal_invitations").select("*"),
    ]);

    const own = (ownCompany ?? null) as Company | null;
    setCompany(own);
    const ownedRequests = (ownRequests ?? []) as Request[];
    const companyRows = (allCompanies ?? []) as Company[];
    setRequests(ownedRequests);
    setCompanies(companyRows);

    const requestIds = ownedRequests.map((r) => r.id);
    const [{ data: received }, { data: sent }] = await Promise.all([
      requestIds.length
        ? supabase.from("proposals").select("*").in("request_id", requestIds).order("created_at", { ascending: false })
        : Promise.resolve({ data: [] }),
      own
        ? supabase.from("proposals").select("*").eq("supplier_id", own.id).order("created_at", { ascending: false })
        : Promise.resolve({ data: [] }),
    ]);

    const merged = [...((received ?? []) as Proposal[]), ...((sent ?? []) as Proposal[])];
    const unique = Array.from(new Map(merged.map((p) => [p.id, p])).values());
    setProposals(unique.map((p) => ({
      ...p,
      supplier: companyRows.find((c) => c.id === p.supplier_id) ?? null,
      request: ownedRequests.find((r) => r.id === p.request_id) ?? null,
    })));

    const inviteRows = (ownInvites ?? []) as Invitation[];
    setInvitations(inviteRows.map((i) => ({ ...i, supplier: companyRows.find((c) => c.id === i.supplier_id) ?? null })));

    const participated = own
      ? (await supabase.from("request_interests").select("request_id").eq("supplier_id", own.id)).data ?? []
      : [];
    if (participated.length || own) {
      const candidateIds = Array.from(new Set([...participated.map((x) => x.request_id), ...inviteRows.map((x) => x.request_id)]));
      if (candidateIds.length) {
        const { data: candidateRequests } = await supabase.from("requests").select("*").in("id", candidateIds);
        setRequests((current) => Array.from(new Map([...current, ...((candidateRequests ?? []) as Request[])].map((r) => [r.id, r])).values()));
      }
    }
  }

  useEffect(() => {\n    load();\n  }, []);\n\n  useEffect(() => {\n    if (requestId) {\n      setSelectedRequest(requestId);\n      setSupplierMode(true);\n    }\n  }, [requestId]);

  const ownedRequests = useMemo(() => requests.filter((r) => r.owner_id === userId), [requests, userId]);
  const availableForProposal = useMemo(() => requests.filter((r) => r.owner_id !== userId && r.status === "open"), [requests, userId]);

  async function inviteSupplier() {
    if (!selectedRequest || !selectedSupplier) return;
    setBusy(true); setError(""); setMessage("");
    const { error: insertError } = await supabase.from("proposal_invitations").upsert(
      { request_id: selectedRequest, supplier_id: selectedSupplier, status: "invited" },
      { onConflict: "request_id,supplier_id" },
    );
    setBusy(false);
    if (insertError) setError(insertError.message);
    else { setMessage("Convite enviado."); await load(); }
  }

  async function submitProposal() {
    if (!company || !selectedRequest || !amount) return;
    setBusy(true); setError(""); setMessage("");
    const { error: insertError } = await supabase.from("proposals").insert({
      request_id: selectedRequest,
      supplier_id: company.id,
      amount: Number(amount),
      currency,
      delivery_days: deliveryDays ? Number(deliveryDays) : null,
      notes: notes.trim() || null,
      status: "received",
    });
    setBusy(false);
    if (insertError) setError(insertError.message);
    else { setMessage("Proposta enviada."); setAmount(""); setDeliveryDays(""); setNotes(""); await load(); }
  }

  async function updateProposal(id: string, status: "accepted" | "rejected") {
    setBusy(true); setError(""); setMessage("");
    const { error: updateError } = await supabase.from("proposals").update({ status }).eq("id", id);
    setBusy(false);
    if (updateError) setError(updateError.message);
    else { setMessage(status === "accepted" ? "Proposta aceite." : "Proposta rejeitada."); await load(); }
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 lg:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.16em] text-[#0f766e]">Negociação</p>
          <h1 className="mt-2 text-3xl font-extrabold text-[#102a43]">Propostas</h1>
          <p className="mt-2 max-w-2xl text-slate-600">Escolha primeiro a oportunidade. Depois convide fornecedores ou envie uma proposta, sem depender de um pedido seleccionado automaticamente.</p>
        </div>
        <button onClick={() => setSupplierMode((v) => !v)} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-[#102a43]">
          {supplierMode ? "Gerir como comprador" : "Responder como fornecedor"}
        </button>
      </div>

      {(message || error) && <div className={error ? "mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700" : "mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700"}>{error || message}</div>}

      {supplierMode ? (
        <section className="mt-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8f5f3] text-[#0f766e]"><Send className="h-5 w-5" /></div>
            <div><h2 className="text-xl font-extrabold text-[#102a43]">Enviar uma proposta</h2><p className="mt-1 text-sm text-slate-500">Só aparecem oportunidades abertas às quais a sua empresa pode responder. Convites e manifestações de interesse também permitem participação.</p></div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="text-sm font-semibold text-slate-700">Oportunidade
              <select className="field mt-1.5 w-full" value={selectedRequest} onChange={(e) => setSelectedRequest(e.target.value)}>
                <option value="">Seleccione uma oportunidade</option>
                {availableForProposal.map((r) => <option key={r.id} value={r.id}>{r.title} · {r.province}</option>)}
              </select>
            </label>
            <label className="text-sm font-semibold text-slate-700">Valor
              <div className="mt-1.5 flex gap-2"><input className="field flex-1" type="number" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Ex.: 250000" /><select className="field w-24" value={currency} onChange={(e) => setCurrency(e.target.value)}><option>MZN</option><option>USD</option><option>EUR</option></select></div>
            </label>
            <label className="text-sm font-semibold text-slate-700">Prazo de entrega (dias)
              <input className="field mt-1.5 w-full" type="number" min="0" value={deliveryDays} onChange={(e) => setDeliveryDays(e.target.value)} placeholder="Ex.: 30" />
            </label>
            <label className="text-sm font-semibold text-slate-700">Nota comercial
              <textarea className="field mt-1.5 min-h-24 w-full" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Inclua condições, validade ou informação relevante." />
            </label>
          </div>
          <button disabled={busy || !company || !selectedRequest || !amount} onClick={submitProposal} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#0f766e] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"><Send className="h-4 w-4" />{busy ? "A enviar..." : "Enviar proposta"}</button>
          {!company && <p className="mt-3 text-sm text-amber-700">Registe a empresa antes de enviar uma proposta.</p>}
        </section>
      ) : (
        <>
          <section className="mt-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf1f6] text-[#102a43]"><Mail className="h-5 w-5" /></div>
              <div><h2 className="text-xl font-extrabold text-[#102a43]">Convidar fornecedor</h2><p className="mt-1 text-sm text-slate-500">Seleccione a oportunidade e a empresa convidada. O convite fica ligado à oportunidade correcta.</p></div>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
              <select className="field" value={selectedRequest} onChange={(e) => setSelectedRequest(e.target.value)}><option value="">Seleccione a oportunidade</option>{ownedRequests.filter((r) => r.status === "open").map((r) => <option key={r.id} value={r.id}>{r.title}</option>)}</select>
              <select className="field" value={selectedSupplier} onChange={(e) => setSelectedSupplier(e.target.value)}><option value="">Seleccione o fornecedor</option>{companies.filter((c) => c.id !== company?.id).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
              <button disabled={busy || !selectedRequest || !selectedSupplier} onClick={inviteSupplier} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#102a43] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"><Mail className="h-4 w-4" />Convidar</button>
            </div>
            {invitations.length > 0 && <div className="mt-5 overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b border-slate-100 text-xs uppercase tracking-wider text-slate-400"><th className="px-2 py-2">Oportunidade</th><th className="px-2 py-2">Fornecedor</th><th className="px-2 py-2">Estado</th></tr></thead><tbody>{invitations.map((i) => <tr key={i.id} className="border-b border-slate-50"><td className="px-2 py-3">{ownedRequests.find((r) => r.id === i.request_id)?.title ?? "Oportunidade"}</td><td className="px-2 py-3 font-semibold">{i.supplier?.name ?? "Fornecedor"}</td><td className="px-2 py-3">{i.status}</td></tr>)}</tbody></table></div>}
          </section>

          <section className="mt-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3"><div><h2 className="text-xl font-extrabold text-[#102a43]">Propostas recebidas</h2><p className="mt-1 text-sm text-slate-500">Compare valor, prazo e condições antes de decidir.</p></div><ShieldCheck className="h-5 w-5 text-[#0f766e]" /></div>
            <div className="mt-5 space-y-3">
              {proposals.filter((p) => p.request?.owner_id === userId).length === 0 ? <p className="rounded-xl border border-dashed border-slate-200 p-6 text-sm text-slate-500">Ainda não recebeu propostas para os seus pedidos.</p> : proposals.filter((p) => p.request?.owner_id === userId).map((p) => <div key={p.id} className="rounded-xl border border-slate-200 p-4"><div className="flex flex-wrap justify-between gap-3"><div><p className="font-bold text-[#102a43]">{p.supplier?.name ?? "Fornecedor"}</p><p className="mt-1 text-xs text-slate-500">{p.request?.title ?? "Oportunidade"} · {p.currency} {p.amount ?? "—"} · {p.delivery_days ?? "—"} dias</p></div><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold">{p.status}</span></div><p className="mt-3 text-sm text-slate-600">{p.notes || "Sem nota comercial."}</p>{p.status === "received" && <div className="mt-3 flex gap-2"><button disabled={busy} onClick={() => updateProposal(p.id,"accepted")} className="inline-flex items-center gap-1.5 rounded-lg bg-[#0f766e] px-3 py-2 text-xs font-bold text-white"><CheckCircle2 className="h-3.5 w-3.5" />Aceitar</button><button disabled={busy} onClick={() => updateProposal(p.id,"rejected")} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600"><XCircle className="h-3.5 w-3.5" />Rejeitar</button></div>}</div>)}
            </div>
          </section>
        </>
      )}

      <section className="mt-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3"><FileText className="h-5 w-5 text-[#0f766e]" /><div><h2 className="font-extrabold text-[#102a43]">Continuar a partir de uma oportunidade</h2><p className="mt-1 text-sm text-slate-500">Se ainda não tem uma oportunidade, explore os pedidos abertos.</p></div></div>
        <Link to="/requests" className="mt-4 inline-flex rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-[#102a43]">Ver oportunidades</Link>
      </section>
    </main>
  );
}

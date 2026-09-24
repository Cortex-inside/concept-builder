import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, FileCheck2, FileText, ShieldAlert, XCircle } from "lucide-react";
import { supabase } from "../lib/supabase";

export const Route = createFileRoute("/dashboard/documents")({ component: Documents });

type AccessRow = {
  id: string; request_id: string; document_id: string; participant_id: string;
  status: "pending"|"approved"|"rejected"|"expired"; payment_proof_file_name?: string|null;
  payment_submitted_at?: string|null; request_documents?: { file_name:string; request_id:string } | null;
};

function Documents() {
  const [rows,setRows]=useState<AccessRow[]>([]);
  const [busy,setBusy]=useState<string|null>(null);
  const [message,setMessage]=useState("");
  async function load(){
    const {data:u}=await supabase.auth.getUser(); if(!u.user)return;
    const {data:requests}=await supabase.from("requests").select("id").eq("owner_id",u.user.id);
    const ids=(requests??[]).map(x=>x.id); if(!ids.length){setRows([]);return;}
    const {data}=await supabase.from("request_document_access").select("*, request_documents(file_name,request_id)").in("request_id",ids).order("created_at",{ascending:false});
    setRows((data??[]) as AccessRow[]);
  }
  useEffect(()=>{load()},[]);
  async function review(row:AccessRow,status:"approved"|"rejected"){
    setBusy(row.id); setMessage("");
    const {data:u}=await supabase.auth.getUser();
    const {error}=await supabase.from("request_document_access").update({status,reviewed_at:new Date().toISOString(),reviewed_by:u.user?.id??null}).eq("id",row.id);
    setBusy(null); if(error)setMessage(error.message); else await load();
  }
  return <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#0f766e]">Documentação</p><h1 className="mt-2 text-3xl font-extrabold text-[#102a43]">Pedidos de acesso</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Valide os comprovativos enviados pelos participantes. A monitoria da plataforma intervém apenas quando existe um sinal ou denúncia.</p></div><div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm"><span className="font-bold text-[#102a43]">{rows.filter(r=>r.status==="pending").length}</span> pendentes</div></div>
    {message&&<p className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">{message}</p>}
    <div className="mt-7 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {rows.length===0?<div className="px-6 py-14 text-center"><FileCheck2 className="mx-auto h-9 w-9 text-slate-300"/><p className="mt-3 font-bold text-[#102a43]">Nenhum pedido de acesso.</p><p className="mt-1 text-sm text-slate-500">Os pedidos de documentação paga aparecerão aqui.</p></div>:rows.map(row=><div key={row.id} className="border-b border-slate-100 p-5 last:border-0"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="font-bold text-[#102a43]">{row.request_documents?.file_name ?? "Documento"}</p><p className="mt-1 text-xs text-slate-500">Participante: {row.participant_id}</p>{row.payment_proof_file_name&&<p className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-slate-600"><FileText className="h-3.5 w-3.5"/> {row.payment_proof_file_name}</p>}</div><span className={row.status==="approved"?"rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700":row.status==="rejected"?"rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700":"rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700"}>{row.status}</span></div>{row.status==="pending"&&<div className="mt-4 flex flex-wrap gap-2"><button disabled={busy===row.id} onClick={()=>review(row,"approved")} className="inline-flex items-center gap-2 rounded-lg bg-[#0f766e] px-3 py-2 text-xs font-bold text-white"><CheckCircle2 className="h-4 w-4"/>Aprovar acesso</button><button disabled={busy===row.id} onClick={()=>review(row,"rejected")} className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-bold text-red-700"><XCircle className="h-4 w-4"/>Rejeitar</button></div>}</div>)}
    </div>
    <div className="mt-5 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><ShieldAlert className="mt-0.5 h-5 w-5 shrink-0"/><p><b>Monitoria:</b> use o mecanismo de denúncia para sinalizar comportamentos suspeitos. A monitoria não valida pagamentos de rotina.</p></div>
  </main>;
}

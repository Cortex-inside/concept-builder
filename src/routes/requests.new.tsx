import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { provinces, sectors } from "../lib/concept-data";

export const Route = createFileRoute("/requests/new")({ component: NewRequest });

function NewRequest() {
  const [title,setTitle]=useState(""); const [sector,setSector]=useState(sectors[0]); const [province,setProvince]=useState(provinces[0]);
  const [budget,setBudget]=useState(""); const [description,setDescription]=useState("");
  const [participationMode,setParticipationMode]=useState<"open"|"qualified"|"invite_only">("open");
  const [requireVerified,setRequireVerified]=useState(false); const [minYears,setMinYears]=useState(""); const [minProjects,setMinProjects]=useState("");
  const [certifications,setCertifications]=useState(""); const [experience,setExperience]=useState(""); const [qualificationNote,setQualificationNote]=useState("");
  const [advanced,setAdvanced]=useState(false); const [invites,setInvites]=useState(false); const [done,setDone]=useState(false); const [error,setError]=useState("");

  useEffect(()=>{ supabase.auth.getUser().then(async ({data})=>{ if(!data.user)return; const {data:m}=await supabase.from("account_modules").select("buying_enabled,advanced_qualification_enabled,supplier_invites_enabled").eq("user_id",data.user.id).maybeSingle(); setAdvanced(Boolean(m?.advanced_qualification_enabled)); setInvites(Boolean(m?.supplier_invites_enabled)); }); },[]);

  async function submit(event:React.FormEvent){event.preventDefault();setError("");const {data:userData}=await supabase.auth.getUser();if(!userData.user){setError("Entre na sua conta para criar um pedido.");return;}
    if(participationMode!=="open"&&!advanced){setError("Os critérios avançados de qualificação são um módulo adicional. Active-o para restringir a participação.");return;}
    if(participationMode==="invite_only"&&!invites){setError("Os convites direccionados são um addon. Active-o para limitar a participação por convite.");return;}
    const {error:e}=await supabase.from("requests").insert({owner_id:userData.user.id,title,sector,province,budget:budget||null,description,participation_mode:participationMode,require_verified:advanced?requireVerified:false,min_years_in_market:advanced&&minYears?Number(minYears):null,min_completed_projects:advanced&&minProjects?Number(minProjects):null,required_certifications:advanced?certifications.split(",").map(x=>x.trim()).filter(Boolean):[],required_experience:advanced?(experience||null):null,qualification_note:advanced?(qualificationNote||null):null});
    if(e){setError(e.message);return;}setDone(true);
  }
  if(done)return <main className="mx-auto max-w-2xl px-4 py-16 text-center"><div className="rounded-2xl border border-slate-200 bg-white p-10 shadow-sm"><h1 className="text-3xl font-bold text-[#102a43]">Pedido criado</h1><p className="mt-3 text-slate-600">A necessidade foi publicada com as regras de participação definidas.</p><Link to="/requests" className="mt-6 inline-block rounded-lg bg-[#0f766e] px-5 py-3 font-semibold text-white">Ver oportunidades</Link></div></main>;
  return <main className="mx-auto max-w-3xl px-4 py-12"><h1 className="text-3xl font-bold text-[#102a43]">O que precisa?</h1><p className="mt-2 text-slate-600">Publique a necessidade. Por defeito, qualquer empresa compatível pode manifestar interesse voluntariamente.</p>
  <form onSubmit={submit} className="mt-8 space-y-6 rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
    <label className="field-label">Título<input required value={title} onChange={e=>setTitle(e.target.value)} className="field"/></label>
    <div className="grid gap-4 md:grid-cols-2"><label className="field-label">Sector<select className="field" value={sector} onChange={e=>setSector(e.target.value)}>{sectors.map(x=><option key={x}>{x}</option>)}</select></label><label className="field-label">Província<select className="field" value={province} onChange={e=>setProvince(e.target.value)}>{provinces.map(x=><option key={x}>{x}</option>)}</select></label></div>
    <label className="field-label">Orçamento<input value={budget} onChange={e=>setBudget(e.target.value)} className="field" placeholder="Opcional"/></label>
    <label className="field-label">Descrição<textarea required value={description} onChange={e=>setDescription(e.target.value)} className="field min-h-40"/></label>
    <section className="rounded-2xl border border-slate-200 bg-[#f8fafc] p-5"><h2 className="font-extrabold text-[#102a43]">Participação</h2><p className="mt-1 text-sm text-slate-600">Escolha quanto quer restringir a concorrência.</p>
      <div className="mt-4 grid gap-3">
        <label className="flex gap-3 rounded-xl border bg-white p-4"><input type="radio" checked={participationMode==="open"} onChange={()=>setParticipationMode("open")}/><span><b>Aberta</b><span className="block text-sm text-slate-500">Qualquer empresa compatível pode manifestar interesse voluntariamente.</span></span></label>
        <label className="flex gap-3 rounded-xl border bg-white p-4"><input type="radio" checked={participationMode==="qualified"} onChange={()=>setParticipationMode("qualified")}/><span><b>Qualificada</b><span className="block text-sm text-slate-500">Aplica critérios como experiência, antiguidade, projectos e certificações.</span></span></label>
        <label className="flex gap-3 rounded-xl border bg-white p-4"><input type="radio" checked={participationMode==="invite_only"} onChange={()=>setParticipationMode("invite_only")}/><span><b>Por convite</b><span className="block text-sm text-slate-500">Só empresas que receberem convite poderão apresentar proposta.</span></span></label>
      </div>
      {!advanced&&<div className="mt-4 rounded-xl border border-[#e8f5f3] bg-[#e8f5f3] p-4 text-sm text-[#0b5f59]"><b>Qualificação avançada é um módulo adicional.</b> Pode publicar pedidos abertos sem custo; os critérios de selecção ficam disponíveis como upsell.</div>}
      {advanced&&<div className="mt-4 space-y-4 rounded-xl border border-slate-200 bg-white p-4">
        <label className="flex gap-3 text-sm"><input type="checkbox" checked={requireVerified} onChange={e=>setRequireVerified(e.target.checked)}/><span><b>Apenas empresas verificadas</b><span className="block text-slate-500">Exige estado de verificação activo.</span></span></label>
        <div className="grid gap-4 md:grid-cols-2"><label className="field-label">Anos mínimos no mercado<input type="number" min="0" value={minYears} onChange={e=>setMinYears(e.target.value)} className="field"/></label><label className="field-label">Projectos concluídos mínimos<input type="number" min="0" value={minProjects} onChange={e=>setMinProjects(e.target.value)} className="field"/></label></div>
        <label className="field-label">Certificações exigidas<input value={certifications} onChange={e=>setCertifications(e.target.value)} className="field" placeholder="ISO 9001, etc."/></label>
        <label className="field-label">Experiência específica<textarea value={experience} onChange={e=>setExperience(e.target.value)} className="field min-h-24"/></label>
        <label className="field-label">Nota aos fornecedores<textarea value={qualificationNote} onChange={e=>setQualificationNote(e.target.value)} className="field min-h-20"/></label>
      </div>}
    </section>
    {participationMode==="invite_only"&&!invites&&<div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"><b>Addon de convites direccionados.</b> Esta opção será activada quando o módulo de convites estiver activo.</div>}
    {error&&<p className="text-sm text-red-700">{error}</p>}<button className="w-full rounded-lg bg-[#0f766e] py-3 font-semibold text-white">Criar pedido</button>
  </form></main>;
}
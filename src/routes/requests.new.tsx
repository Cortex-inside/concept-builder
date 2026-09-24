import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "../lib/supabase";
import { provinces, sectors } from "../lib/concept-data";

export const Route = createFileRoute("/requests/new")({ component: NewRequest });

function NewRequest() {
  const [title, setTitle] = useState("");
  const [sector, setSector] = useState(sectors[0]);
  const [province, setProvince] = useState(provinces[0]);
  const [budget, setBudget] = useState("");
  const [description, setDescription] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) { setError("Entre na sua conta para criar um pedido."); return; }
    const { error: insertError } = await supabase.from("requests").insert({ owner_id: userData.user.id, title, sector, province, budget: budget || null, description });
    if (insertError) { setError(insertError.message); return; }
    setDone(true);
  }

  if (done) return <main className="mx-auto max-w-2xl px-4 py-16 text-center"><div className="rounded-2xl border border-slate-200 bg-white p-10 shadow-sm"><h1 className="text-3xl font-bold text-[#102a43]">Pedido criado</h1><p className="mt-3 text-slate-600">O pedido foi guardado na plataforma.</p><Link to="/requests" className="mt-6 inline-block rounded-lg bg-[#0f766e] px-5 py-3 font-semibold text-white">Ver pedidos</Link></div></main>;

  return <main className="mx-auto max-w-3xl px-4 py-12"><h1 className="text-3xl font-bold text-[#102a43]">O que precisa?</h1><p className="mt-2 text-slate-600">Descreva a necessidade para encontrar fornecedores.</p><form onSubmit={submit} className="mt-8 space-y-5 rounded-2xl border border-slate-200 bg-white p-7 shadow-sm"><label className="field-label">Título<input required value={title} onChange={e => setTitle(e.target.value)} className="field" /></label><div className="grid gap-4 md:grid-cols-2"><label className="field-label">Sector<select className="field" value={sector} onChange={e => setSector(e.target.value)}>{sectors.map(x => <option key={x}>{x}</option>)}</select></label><label className="field-label">Província<select className="field" value={province} onChange={e => setProvince(e.target.value)}>{provinces.map(x => <option key={x}>{x}</option>)}</select></label></div><label className="field-label">Orçamento<input value={budget} onChange={e => setBudget(e.target.value)} className="field" /></label><label className="field-label">Descrição<textarea required value={description} onChange={e => setDescription(e.target.value)} className="field min-h-40" /></label>{error && <p className="text-sm text-red-700">{error}</p>}<button className="w-full rounded-lg bg-[#0f766e] py-3 font-semibold text-white">Criar pedido</button></form></main>;
}

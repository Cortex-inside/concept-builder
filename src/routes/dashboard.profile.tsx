import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { provinces, sectors } from "../lib/concept-data";

export const Route = createFileRoute("/dashboard/profile")({ component: Profile });

function Profile() {
  const [id, setId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [sector, setSector] = useState(sectors[0]);
  const [province, setProvince] = useState(provinces[0]);
  const [description, setDescription] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      supabase.from("companies").select("*").eq("owner_id", data.user.id).maybeSingle().then(({ data: company }) => {
        if (!company) return;
        setId(company.id);
        setName(company.name);
        setSector(company.sector);
        setProvince(company.province);
        setDescription(company.description);
      });
    });
  }, []);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setSaved(false);
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;
    const payload = { owner_id: userData.user.id, name, sector, province, description, services: [] as string[] };
    const result = id
      ? await supabase.from("companies").update(payload).eq("id", id).select().single()
      : await supabase.from("companies").insert(payload).select().single();
    if (!result.error && result.data) setId(result.data.id);
    setSaved(!result.error);
  }

  return <main className="mx-auto max-w-3xl px-4 py-12"><h1 className="text-3xl font-bold text-[#102a43]">Perfil da empresa</h1><p className="mt-2 text-slate-600">Registe e mantenha os dados públicos da empresa.</p>
    <form onSubmit={save} className="mt-8 space-y-5 rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
      <label className="field-label">Nome<input required value={name} onChange={e => setName(e.target.value)} className="field" /></label>
      <div className="grid gap-4 md:grid-cols-2"><label className="field-label">Sector<select className="field" value={sector} onChange={e => setSector(e.target.value)}>{sectors.map(x => <option key={x}>{x}</option>)}</select></label><label className="field-label">Província<select className="field" value={province} onChange={e => setProvince(e.target.value)}>{provinces.map(x => <option key={x}>{x}</option>)}</select></label></div>
      <label className="field-label">Descrição<textarea required value={description} onChange={e => setDescription(e.target.value)} className="field min-h-32" /></label>
      <button className="rounded-lg bg-[#0f766e] px-5 py-3 font-semibold text-white">Guardar perfil</button>
      {saved && <p className="text-sm text-green-700">Perfil guardado.</p>}
    </form>
  </main>;
}

import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, MapPin } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { supabase } from "../lib/supabase";
import { provinces, sectors, type Company } from "../lib/concept-data";
import { PageHeader, SearchBox } from "../components/app-shell";

export const Route = createFileRoute("/directory")({ component: Directory });

function Directory() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [q, setQ] = useState("");
  const [sector, setSector] = useState("");
  const [province, setProvince] = useState("");
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setQ(params.get("search") ?? "");
    setSector(params.get("sector") ?? "");
    setProvince(params.get("province") ?? "");
    supabase.from("companies").select("*").order("name").then(({ data }) => setCompanies((data ?? []) as Company[]));
  }, []);

  const list = useMemo(() => companies.filter(c =>
    (!q || [c.name, c.description, ...c.services].join(" ").toLowerCase().includes(q.toLowerCase())) &&
    (!sector || c.sector === sector) &&
    (!province || c.province === province) &&
    (!verified || c.verified)
  ), [companies, q, sector, province, verified]);

  return <main className="mx-auto max-w-7xl px-4 py-10 lg:px-6">
    <PageHeader eyebrow="Diretório empresarial" title="Encontre fornecedores para o seu negócio" description="Pesquise empresas por actividade, localização e informação verificada." />
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid gap-3 md:grid-cols-[1fr_190px_190px_auto]">
        <SearchBox value={q} onChange={setQ} placeholder="Pesquisar empresa, serviço ou produto" />
        <select className="field" value={sector} onChange={e => setSector(e.target.value)}><option value="">Todos os sectores</option>{sectors.map(s => <option key={s}>{s}</option>)}</select>
        <select className="field" value={province} onChange={e => setProvince(e.target.value)}><option value="">Todas as províncias</option>{provinces.map(p => <option key={p}>{p}</option>)}</select>
        <label className="flex min-h-11 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-600"><input type="checkbox" checked={verified} onChange={e => setVerified(e.target.checked)} /> Verificadas</label>
      </div>
    </div>
    <p className="my-7 text-sm font-semibold text-slate-500">{list.length} empresas encontradas</p>
    <div className="grid gap-4 md:grid-cols-2">
      {list.map(c => <article key={c.id} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2"><Link to={`/companies/${c.id}` as never} className="text-lg font-bold text-[#102a43] hover:text-[#0b5f59]">{c.name}</Link>{c.verified && <CheckCircle2 className="text-[#0f766e]" size={17} />}</div>
        <p className="mt-1 flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-[#0f766e]"><MapPin size={13} />{c.sector} · {c.province}</p>
        <p className="mt-4 text-sm leading-6 text-slate-600">{c.description}</p>
        <div className="mt-5 flex flex-wrap gap-2">{c.services.map(s => <span key={s} className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">{s}</span>)}</div>
      </article>)}
    </div>
  </main>;
}
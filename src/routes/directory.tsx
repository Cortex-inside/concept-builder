import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Building2, Filter, Search } from "lucide-react";
import { supabase } from "../lib/supabase";
import { provinces, sectors, type Company } from "../lib/concept-data";
import { PageHeader } from "../components/app-shell";
import { CompanyProfileCard } from "../components/company-profile";

export const Route = createFileRoute("/directory")({ component: Directory });

function Directory() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [q, setQ] = useState("");
  const [sector, setSector] = useState("");
  const [province, setProvince] = useState("");
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    supabase.from("companies").select("*").order("name").then(({ data, error: loadError }) => {
      if (!active) return;
      if (loadError) setError(loadError.message);
      setCompanies((data ?? []) as Company[]);
      setLoading(false);
    });
    return () => { active = false; };
  }, []);

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return companies.filter((company) => {
      const searchable = [
        company.name,
        company.trade_name ?? "",
        company.description,
        company.sector,
        ...company.services,
        ...(company.served_provinces ?? []),
      ].join(" ").toLowerCase();

      return (
        (!needle || searchable.includes(needle)) &&
        (!sector || company.sector === sector) &&
        (!province || company.province === province || (company.served_provinces ?? []).includes(province)) &&
        (!verified || company.verified)
      );
    });
  }, [companies, q, sector, province, verified]);

  const hasFilters = Boolean(q || sector || province || verified);

  function clearFilters() {
    setQ("");
    setSector("");
    setProvince("");
    setVerified(false);
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 lg:px-6">
      <PageHeader
        eyebrow="Diretório empresarial"
        title="Encontre empresas para o seu negócio"
        description="Explore perfis empresariais, capacidades, experiência e informação de verificação antes de iniciar um contacto comercial."
      />

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-bold text-[#102a43]">
          <Search size={17} className="text-[#0f766e]" />
          Pesquisar no diretório
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_210px_210px_auto]">
          <label className="relative block">
            <span className="sr-only">Pesquisar</span>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Empresa, produto, serviço ou sector" className="field pl-10" />
          </label>
          <select className="field" value={sector} onChange={(e) => setSector(e.target.value)}>
            <option value="">Todos os sectores</option>
            {sectors.map((item) => <option key={item}>{item}</option>)}
          </select>
          <select className="field" value={province} onChange={(e) => setProvince(e.target.value)}>
            <option value="">Todas as províncias</option>
            {provinces.map((item) => <option key={item}>{item}</option>)}
          </select>
          <label className="flex min-h-11 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-600">
            <input type="checkbox" checked={verified} onChange={(e) => setVerified(e.target.checked)} />
            Apenas verificadas
          </label>
        </div>
        {hasFilters && (
          <button type="button" onClick={clearFilters} className="mt-3 text-xs font-bold text-[#0b5f59] hover:underline">
            Limpar filtros
          </button>
        )}
      </section>

      <div className="my-7 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-[#102a43]">{list.length} {list.length === 1 ? "empresa encontrada" : "empresas encontradas"}</p>
          <p className="mt-1 text-xs text-slate-500">Abra um perfil para consultar os detalhes públicos da empresa.</p>
        </div>
        <div className="hidden items-center gap-2 text-xs font-semibold text-slate-500 sm:flex">
          <Filter size={14} /> Diretório
        </div>
      </div>

      {loading && (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((item) => <div key={item} className="h-72 animate-pulse rounded-2xl border border-slate-200 bg-white" />)}
        </div>
      )}

      {error && !loading && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          Não foi possível carregar o diretório. {error}
        </div>
      )}

      {!loading && !error && list.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
          <Building2 className="mx-auto text-slate-300" size={34} />
          <h2 className="mt-4 text-lg font-bold text-[#102a43]">Nenhuma empresa corresponde aos filtros</h2>
          <p className="mt-2 text-sm text-slate-500">Tente alterar a pesquisa, o sector ou a província.</p>
          <button type="button" onClick={clearFilters} className="mt-5 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-bold text-[#102a43]">
            Limpar filtros
          </button>
        </div>
      )}

      {!loading && !error && list.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {list.map((company) => <CompanyProfileCard key={company.id} company={company} />)}
        </div>
      )}
    </main>
  );
}
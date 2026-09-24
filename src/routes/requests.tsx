import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Building2, CheckCircle2, MapPin, Target } from "lucide-react";
import { supabase } from "../lib/supabase";
import type { Company, Request } from "../lib/concept-data";

export const Route = createFileRoute("/requests")({ component: Requests });

type Match = {
  company: Company;
  score: number;
  reasons: string[];
};

function matchRequest(request: Request, company: Company): Match {
  let score = 0;
  const reasons: string[] = [];

  if (company.sector === request.sector) {
    score += 50;
    reasons.push("Mesmo sector");
  }

  const operatesInProvince =
    company.province === request.province ||
    Boolean(company.served_provinces?.includes(request.province));

  if (operatesInProvince) {
    score += 30;
    reasons.push("Opera nesta província");
  }

  const requestText = `${request.title} ${request.description}`.toLowerCase();
  const relevantServices = (company.services ?? []).filter((service) =>
    requestText.includes(service.toLowerCase()),
  );

  if (relevantServices.length > 0) {
    score += 15;
    reasons.push("Serviços relevantes");
  }

  if (company.verified) {
    score += 5;
    reasons.push("Empresa verificada");
  }

  return { company, score, reasons };
}

function Requests() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [q, setQ] = useState("");
  const [sector, setSector] = useState("");

  useEffect(() => {
    Promise.all([
      supabase
        .from("requests")
        .select("*")
        .eq("status", "open")
        .order("created_at", { ascending: false }),
      supabase.from("companies").select("*").order("name"),
    ]).then(([requestResult, companyResult]) => {
      setRequests((requestResult.data ?? []) as Request[]);
      setCompanies((companyResult.data ?? []) as Company[]);
    });
  }, []);

  const filtered = requests.filter(
    (request) =>
      (!q ||
        [request.title, request.description, request.sector, request.province]
          .join(" ")
          .toLowerCase()
          .includes(q.toLowerCase())) &&
      (!sector || request.sector === sector),
  );

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 lg:px-6">
      <div className="flex flex-wrap justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.16em] text-[#0f766e]">Oportunidades</p>
          <h1 className="mt-2 text-3xl font-extrabold text-[#102a43]">Pedidos de empresas</h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            Necessidades abertas com fornecedores identificados através de regras transparentes de compatibilidade.
          </p>
        </div>
        <Link to="/requests/new" className="rounded-xl bg-[#0f766e] px-4 py-2.5 font-bold text-white">
          Criar pedido
        </Link>
      </div>

      <div className="mt-8 grid gap-3 md:grid-cols-[1fr_240px]">
        <input
          className="field"
          placeholder="Pesquisar pedidos"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select className="field" value={sector} onChange={(e) => setSector(e.target.value)}>
          <option value="">Todos os sectores</option>
          {[...new Set(requests.map((request) => request.sector))].map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </div>

      <div className="mt-8 space-y-5">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
            Ainda não existem pedidos que correspondam aos filtros.
          </div>
        ) : (
          filtered.map((request) => {
            const matches = companies
              .map((company) => matchRequest(request, company))
              .filter((match) => match.score >= 50)
              .sort((a, b) => b.score - a.score || a.company.name.localeCompare(b.company.name));

            return (
              <article key={request.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="p-6">
                  <div className="flex flex-wrap justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-extrabold text-[#102a43]">{request.title}</h2>
                      <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                        <MapPin size={14} />
                        {request.sector} · {request.province}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 rounded-full bg-[#e8f5f3] px-3 py-1.5 text-xs font-bold text-[#0b5f59]">
                      <Target size={14} />
                      {matches.length} correspondências
                    </div>
                  </div>

                  <p className="mt-4 text-sm leading-6 text-slate-600">{request.description}</p>
                </div>

                <div className="border-t border-slate-100 bg-[#fbfcfd] p-6">
                  <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <h3 className="font-extrabold text-[#102a43]">Fornecedores compatíveis</h3>
                      <p className="mt-1 text-xs text-slate-500">
                        Correspondência calculada por sector, área de operação, serviços e verificação.
                      </p>
                    </div>
                    <Link to="/proposals" className="text-sm font-bold text-[#0b5f59]">
                      Gerir convites →
                    </Link>
                  </div>

                  {matches.length === 0 ? (
                    <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-white p-5 text-sm text-slate-500">
                      Ainda não encontramos uma empresa com compatibilidade suficiente para esta necessidade.
                    </div>
                  ) : (
                    <div className="mt-4 grid gap-3 lg:grid-cols-3">
                      {matches.slice(0, 3).map((match) => (
                        <div key={match.company.id} className="rounded-xl border border-slate-200 bg-white p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate font-bold text-[#102a43]">{match.company.name}</p>
                              <p className="mt-1 text-xs text-slate-500">
                                {match.company.city || match.company.province}
                              </p>
                            </div>
                            <span className="shrink-0 rounded-full bg-[#e8f5f3] px-2 py-1 text-xs font-extrabold text-[#0b5f59]">
                              {match.score}%
                            </span>
                          </div>

                          <div className="mt-3 space-y-1.5">
                            {match.reasons.slice(0, 3).map((reason) => (
                              <p key={reason} className="flex items-center gap-1.5 text-xs text-slate-600">
                                <CheckCircle2 size={13} className="text-[#0f766e]" />
                                {reason}
                              </p>
                            ))}
                          </div>

                          <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-400">
                            <Building2 size={13} />
                            {match.company.verified ? "Verificada" : "Não verificada"}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            );
          })
        )}
      </div>
    </main>
  );
}

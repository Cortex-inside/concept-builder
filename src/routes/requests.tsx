import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Request } from "../lib/concept-data";

export const Route = createFileRoute("/requests")({ component: Requests });

function Requests() {
  const [requests, setRequests] = useState<Request[]>([]);
  useEffect(() => {
    supabase.from("requests").select("*").eq("status", "open").order("created_at", { ascending: false }).then(({ data }) => setRequests((data ?? []) as Request[]));
  }, []);
  return <main className="mx-auto max-w-6xl px-4 py-12 lg:px-6"><div className="flex flex-wrap justify-between gap-4"><div><h1 className="text-3xl font-bold text-[#102a43]">Pedidos</h1><p className="mt-2 text-slate-600">Necessidades publicadas na plataforma.</p></div><Link to="/requests/new" className="rounded-lg bg-[#0f766e] px-4 py-2 font-semibold text-white">Criar pedido</Link></div>
    <div className="mt-8 space-y-4">{requests.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">Ainda não existem pedidos publicados.</div> : requests.map(request => <article key={request.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="font-bold text-[#102a43]">{request.title}</h2><p className="mt-1 text-sm text-slate-500">{request.sector} · {request.province}{request.budget ? ` · ${request.budget}` : ""}</p><p className="mt-3 text-sm text-slate-600">{request.description}</p><Link to="/proposals" className="mt-4 inline-block text-sm font-semibold text-[#0b5f59]">Ver fornecedores e propostas →</Link></article>)}</div>
  </main>;
}

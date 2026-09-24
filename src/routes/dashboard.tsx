import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2, FileCheck2, FileText } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Request } from "../lib/concept-data";

export const Route = createFileRoute("/dashboard")({ component: Dashboard });

function Dashboard() {
  const [requests, setRequests] = useState<Request[]>([]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      supabase.from("requests").select("*").eq("owner_id", data.user.id).order("created_at", { ascending: false }).then(({ data: rows }) => {
        setRequests((rows ?? []) as Request[]);
      });
    });
  }, []);

  return <main className="mx-auto max-w-7xl px-4 py-12 lg:px-6">
    <div className="flex flex-wrap justify-between gap-4">
      <div><p className="text-sm font-semibold uppercase text-[#0f766e]">Área empresarial</p><h1 className="text-3xl font-bold text-[#102a43]">Painel</h1><p className="mt-2 text-slate-600">Gerencie perfil, pedidos e propostas.</p></div>
      <div className="flex gap-3"><Link to="/dashboard/profile" className="rounded-lg border border-slate-200 bg-white px-4 py-2 font-semibold">Editar perfil</Link><Link to="/requests/new" className="rounded-lg bg-[#0f766e] px-4 py-2 font-semibold text-white">Novo pedido</Link></div>
    </div>
    <div className="mt-8 grid gap-4 md:grid-cols-3">
      {[[Building2, "Perfil", "Dados da empresa"], [FileText, "Pedidos", String(requests.length)], [FileCheck2, "Propostas", "Consulte as propostas"]].map(([Icon, label, value]) => {
        const I = Icon as typeof Building2;
        return <div key={label as string} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><I className="text-[#0f766e]" /><p className="mt-5 text-sm text-slate-500">{label as string}</p><p className="text-xl font-bold text-[#102a43]">{value as string}</p></div>;
      })}
    </div>
    <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-xl font-bold text-[#102a43]">Pedidos recentes</h2>{requests.length === 0 ? <p className="mt-4 text-sm text-slate-500">Ainda não existem pedidos.</p> : requests.map(request => <div key={request.id} className="flex justify-between gap-4 border-b border-slate-100 py-4"><span><b>{request.title}</b><small className="block text-slate-500">{request.sector} · {request.province}</small></span><span className="text-sm text-[#0b5f59]">{request.status}</span></div>)}</section>
  </main>;
}

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "../lib/supabase";

export const Route = createFileRoute("/register")({ component: Register });

function Register() {
  const [n, setN] = useState(""), [e, setE] = useState(""), [p, setP] = useState(""), [error, setError] = useState("");
  const nav = useNavigate();
  async function submit(x: React.FormEvent) {
    x.preventDefault(); setError("");
    const { error } = await supabase.auth.signUp({ email: e, password: p, options: { data: { company_name: n } } });
    if (error) return setError(error.message);
    nav({ to: "/dashboard/profile" });
  }
  return <main className="mx-auto max-w-md px-4 py-16"><div className="rounded-3xl border border-slate-200 bg-white p-8">
    <h1 className="text-3xl font-bold text-[#102a43]">Criar conta</h1>
    <form onSubmit={submit} className="mt-7 space-y-4">
      <label className="field-label">Nome da empresa<input required value={n} onChange={x => setN(x.target.value)} className="field" /></label>
      <label className="field-label">Email<input required type="email" value={e} onChange={x => setE(x.target.value)} className="field" /></label>
      <label className="field-label">Palavra-passe<input required minLength={8} type="password" value={p} onChange={x => setP(x.target.value)} className="field" /></label>
      {error && <p className="text-sm text-red-700">{error}</p>}
      <button className="w-full rounded-xl bg-[#0f766e] py-3 font-semibold text-white">Criar conta</button>
    </form>
    <p className="mt-6 text-center text-sm">Já tem conta? <Link to="/login" className="text-[#0b5f59]">Entrar</Link></p>
  </div></main>;
}
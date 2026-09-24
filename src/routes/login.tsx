import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { supabase } from "../lib/supabase";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const [e, setE] = useState(""), [p, setP] = useState(""), [error, setError] = useState("");
  const nav = useNavigate();
  async function submit(x: FormEvent) {
    x.preventDefault(); setError("");
    const { error } = await supabase.auth.signInWithPassword({ email: e, password: p });
    if (error) return setError(error.message);
    nav({ to: "/dashboard" });
  }
  return <main className="mx-auto max-w-md px-4 py-16"><div className="rounded-3xl border border-slate-200 bg-white p-8">
    <h1 className="text-3xl font-bold text-[#102a43]">Entrar</h1>
    <form onSubmit={submit} className="mt-7 space-y-4">
      <label className="field-label">Email<input required type="email" value={e} onChange={x => setE(x.target.value)} className="field" /></label>
      <label className="field-label">Palavra-passe<input required type="password" value={p} onChange={x => setP(x.target.value)} className="field" /></label>
      {error && <p className="text-sm text-red-700">{error}</p>}
      <button className="w-full rounded-xl bg-[#0f766e] py-3 font-semibold text-white">Entrar</button>
    </form>
    <p className="mt-6 text-center text-sm">Ainda não tem conta? <Link to="/register" className="text-[#0b5f59]">Criar conta</Link></p>
  </div></main>;
}
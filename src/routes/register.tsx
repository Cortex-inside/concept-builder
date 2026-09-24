import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { supabase } from "../lib/supabase";

export const Route = createFileRoute("/register")({ component: Register });

function Register() {
  const [companyName, setCompanyName] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const nav = useNavigate();

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    const { error: signUpError } = await supabase.auth.signUp({ email, password, options: { data: { company_name: companyName, full_name: fullName, phone } } });
    if (signUpError) return setError(signUpError.message);
    nav({ to: "/dashboard/profile" });
  }

  return <main className="mx-auto max-w-2xl px-4 py-12"><div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-9">
    <p className="text-xs font-bold uppercase tracking-[.16em] text-[#0f766e]">Começar</p>
    <h1 className="mt-2 text-3xl font-bold text-[#102a43]">Criar conta</h1>
    <p className="mt-2 max-w-xl text-slate-600">Uma única conta para toda a sua atividade no Concept Builder. As capacidades de comprar e vender são ativadas dentro da plataforma.</p>
    <form onSubmit={submit} className="mt-8 space-y-6">
      <div className="grid gap-4 sm:grid-cols-2"><label className="field-label">Nome completo<input required value={fullName} onChange={(event) => setFullName(event.target.value)} className="field" /></label><label className="field-label">Empresa<input required value={companyName} onChange={(event) => setCompanyName(event.target.value)} className="field" /></label></div>
      <div className="grid gap-4 sm:grid-cols-2"><label className="field-label">Email<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="field" /></label><label className="field-label">Telefone<input value={phone} onChange={(event) => setPhone(event.target.value)} className="field" /></label></div>
      <label className="field-label">Palavra-passe<input required minLength={8} type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="field" /></label>
      <div className="rounded-2xl border border-[#d9e2ec] bg-[#f4f7fa] p-5"><p className="font-semibold text-[#102a43]">Uma conta, várias oportunidades</p><p className="mt-2 text-sm leading-6 text-slate-600">Comece com uma única conta. Quando precisar de comprar ou vender, ative a respetiva capacidade dentro do painel.</p></div>
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <button className="w-full rounded-xl bg-[#0f766e] py-3.5 font-semibold text-white shadow-sm hover:bg-[#0b5f59]">Criar conta</button>
    </form>
    <p className="mt-6 text-center text-sm text-slate-600">Já tem conta?{" "}<Link to="/login" className="font-semibold text-[#0b5f59]">Entrar</Link></p>
  </div></main>;
}

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { supabase } from "../lib/supabase";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [resetMode, setResetMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      if (resetMode) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/login`,
        });
        if (error) return setError(error.message);
        setMessage("Enviámos um link de recuperação para o seu email.");
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) return setError(error.message);
      nav({ to: "/dashboard" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível concluir o acesso.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[.16em] text-[#0f766e]">Conta</p>
        <h1 className="mt-2 text-3xl font-bold text-[#102a43]">{resetMode ? "Recuperar acesso" : "Entrar"}</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          {resetMode
            ? "Indique o email da sua conta para receber um link de recuperação."
            : "Entre na sua conta para aceder ao seu espaço de negócio."}
        </p>

        <form onSubmit={submit} className="mt-7 space-y-4">
          <label className="field-label">
            Email
            <input
              required
              autoComplete="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="field"
            />
          </label>

          {!resetMode && (
            <label className="field-label">
              Palavra-passe
              <input
                required
                autoComplete="current-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="field"
              />
            </label>
          )}

          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          {message && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p>}

          <button
            disabled={loading}
            className="w-full rounded-xl bg-[#0f766e] py-3 font-semibold text-white transition hover:bg-[#0b5f59] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Aguarde..." : resetMode ? "Enviar recuperação" : "Entrar"}
          </button>
        </form>

        <div className="mt-6 flex flex-col gap-2 text-center text-sm">
          <button
            type="button"
            onClick={() => { setResetMode((value) => !value); setError(""); setMessage(""); }}
            className="font-semibold text-[#0b5f59]"
          >
            {resetMode ? "Voltar ao login" : "Esqueci a palavra-passe"}
          </button>
          <p className="text-slate-600">
            Ainda não tem conta?{" "}
            <Link to="/register" className="font-semibold text-[#0b5f59]">Criar conta</Link>
          </p>
        </div>
      </div>
    </main>
  );
}

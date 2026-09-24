import { Link, Outlet, useLocation } from "@tanstack/react-router";
import { Building2, Menu, X } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "../lib/i18n";

export function AppShell() {
  const { t, language, setLanguage } = useLanguage();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const links = [["/","home"],["/directory","directory"],["/requests","requests"],["/proposals","proposals"],["/plans","plans"]] as const;
  return <div className="min-h-screen bg-slate-50 text-slate-900">
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-bold text-blue-700"><span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-600 text-white"><Building2 size={19}/></span>Concept Builder</Link>
        <button className="md:hidden" onClick={()=>setOpen(v=>!v)} aria-label="Menu">{open?<X/>:<Menu/>}</button>
        <nav className="hidden items-center gap-5 md:flex">{links.map(([to,key])=><Link key={to} to={to} className={location.pathname===to?"font-semibold text-blue-700":"text-sm text-slate-600 hover:text-slate-900"}>{t[key]}</Link>)}<button onClick={()=>setLanguage(language==="pt"?"en":"pt")} className="rounded-lg border px-2.5 py-1 text-xs font-semibold">{language.toUpperCase()}</button><Link to="/login" className="text-sm font-semibold">{t.login}</Link><Link to="/register" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white">{t.register}</Link></nav>
      </div>
      {open&&<nav className="border-t px-4 py-4 md:hidden">{links.map(([to,key])=><Link key={to} to={to} onClick={()=>setOpen(false)} className="block py-2">{t[key]}</Link>)}<button onClick={()=>setLanguage(language==="pt"?"en":"pt")} className="mt-2 rounded border px-3 py-1 text-sm">{language.toUpperCase()}</button></nav>}
    </header><Outlet/>
    <footer className="mt-16 border-t bg-white"><div className="mx-auto max-w-7xl px-4 py-8 text-sm text-slate-500">© 2026 Concept Builder · Plataforma B2B</div></footer>
  </div>;
}
export function PageHeader({eyebrow,title,description}:{eyebrow?:string;title:string;description?:string}){return <div className="mb-8"><p className="text-sm font-semibold uppercase tracking-wider text-blue-600">{eyebrow}</p><h1 className="mt-1 text-3xl font-bold">{title}</h1>{description&&<p className="mt-2 max-w-2xl text-slate-600">{description}</p>}</div>}
export function SearchBox({value,onChange,placeholder="Pesquisar..."}:{value:string;onChange:(v:string)=>void;placeholder?:string}){return <input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} className="field"/>}

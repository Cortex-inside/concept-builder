import { Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { Building2, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useI18n } from "../lib/i18n";

export function AppShell() {
  const { t, lang, setLang } = useI18n();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (active) setSignedIn(Boolean(data.session));
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) setSignedIn(Boolean(session));
    });
    return () => { active = false; listener.subscription.unsubscribe(); };
  }, []);
  const links = [["/directory","nav.directory"],["/requests","home.need.title"],["/proposals","req.proposals"],["/plans","nav.plans"]] as const;
  return <div className="min-h-screen bg-slate-50 text-slate-900">
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 lg:px-6">
        <Link to={signedIn ? "/dashboard" : "/"} className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-lg bg-[#102a43] text-white"><Building2 size={20}/></span><span><strong className="block text-[15px] tracking-tight text-[#102a43]">Concept Builder</strong><small className="hidden text-[10px] font-semibold uppercase tracking-[.16em] text-slate-400 sm:block">B2B · Moçambique</small></span></Link>
        <button className="rounded-lg p-2 text-slate-600 md:hidden" onClick={()=>setOpen(v=>!v)} aria-label="Menu">{open?<X/>:<Menu/>}</button>
        <nav className="hidden items-center gap-1 md:flex">{links.map(([to,key])=><Link key={to} to={to} className={location.pathname===to ? "rounded-lg bg-[#e8f5f3] px-3 py-2 text-sm font-semibold text-[#0b5f59]" : "rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-[#102a43]"}>{t(key)}</Link>)}<span className="mx-2 h-5 w-px bg-slate-200"/><button onClick={()=>setLang(lang==="pt"?"en":"pt")} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600">{lang.toUpperCase()}</button>{signedIn ? <><Link to="/dashboard" className="ml-2 px-3 py-2 text-sm font-semibold text-[#102a43]">Minha conta</Link><button onClick={async () => { await supabase.auth.signOut(); navigate({ to: "/" }); }} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-[#102a43]">Sair</button></> : <><Link to="/login" className="ml-2 px-3 py-2 text-sm font-semibold text-[#102a43]">{t("nav.signin")}</Link><Link to="/register" className="rounded-lg bg-[#0f766e] px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#0b5f59]">{t("nav.register")}</Link></>}</nav>
      </div>
      {open&&<nav className="border-t bg-white px-4 py-4 md:hidden">{links.map(([to,key])=><Link key={to} to={to} onClick={()=>setOpen(false)} className="block border-b border-slate-100 py-3 text-sm font-medium">{t(key)}</Link>)}<div className="mt-4 flex gap-2"><button onClick={()=>setLang(lang==="pt"?"en":"pt")} className="rounded-lg border px-3 py-2 text-sm font-bold">{lang.toUpperCase()}</button>{signedIn ? <><Link to="/dashboard" onClick={()=>setOpen(false)} className="rounded-lg px-3 py-2 text-sm font-semibold">Minha conta</Link><button onClick={async()=>{await supabase.auth.signOut();setOpen(false);navigate({to:"/"})}} className="rounded-lg border px-3 py-2 text-sm font-semibold">Sair</button></> : <><Link to="/login" onClick={()=>setOpen(false)} className="rounded-lg px-3 py-2 text-sm font-semibold">{t("nav.signin")}</Link><Link to="/register" onClick={()=>setOpen(false)} className="rounded-lg bg-[#0f766e] px-3 py-2 text-sm font-semibold text-white">{t("nav.register")}</Link></>}</div></nav>}
    </header><Outlet/><footer className="mt-20 border-t border-slate-200 bg-[#102a43] text-white"><div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-10 sm:flex-row sm:items-center sm:justify-between lg:px-6"><div><strong className="text-sm">Concept Builder</strong><p className="mt-1 text-xs text-slate-300">{t("footer.rights")}</p></div><p className="text-xs text-slate-400">Conectamos empresas, fornecedores e oportunidades.</p></div></footer>
  </div>;
}
export function PageHeader({eyebrow,title,description}:{eyebrow?:string;title:string;description?:string}){return <div className="mb-8 border-b border-slate-200 pb-6"><p className="text-xs font-bold uppercase tracking-[.16em] text-[#0f766e]">{eyebrow}</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-[#102a43]">{title}</h1>{description&&<p className="mt-2 max-w-2xl text-[15px] leading-6 text-slate-600">{description}</p>}</div>}
export function SearchBox({value,onChange,placeholder="Pesquisar..." }:{value:string;onChange:(v:string)=>void;placeholder?:string}){return <input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} className="field"/>}

import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "../lib/supabase";
import { provinces, sectors } from "../lib/concept-data";

export const Route = createFileRoute("/dashboard/profile")({ component: Profile });

function Profile() {
  const [id, setId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [tradeName, setTradeName] = useState("");
  const [sector, setSector] = useState(sectors[0]);
  const [province, setProvince] = useState(provinces[0]);
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [website, setWebsite] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [description, setDescription] = useState("");
  const [services, setServices] = useState("");
  const [servedProvinces, setServedProvinces] = useState("");
  const [entityType, setEntityType] = useState("");
  const [employees, setEmployees] = useState("");
  const [foundedYear, setFoundedYear] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      setEmail(data.user.email ?? "");
      supabase
        .from("companies")
        .select("*")
        .eq("owner_id", data.user.id)
        .maybeSingle()
        .then(({ data: company, error: loadError }) => {
          if (loadError) {
            setError(loadError.message);
            return;
          }
          if (!company) return;
          setId(company.id);
          setName(company.name ?? "");
          setTradeName(company.trade_name ?? "");
          setSector(company.sector ?? sectors[0]);
          setProvince(company.province ?? provinces[0]);
          setCity(company.city ?? "");
          setAddress(company.address ?? "");
          setWebsite(company.website ?? "");
          setWhatsapp(company.whatsapp ?? "");
          setDescription(company.description ?? "");
          setServices((company.services ?? []).join(", "));
          setServedProvinces((company.served_provinces ?? []).join(", "));
          setEntityType(company.entity_type ?? "");
          setEmployees(company.employees ?? "");
          setFoundedYear(company.founded_year ? String(company.founded_year) : "");
        });
    });
  }, []);

  async function save(event: FormEvent) {
    event.preventDefault();
    setSaved(false);
    setError("");

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setError("Inicie sessão para editar o perfil.");
      return;
    }

    const payload = {
      owner_id: userData.user.id,
      name: name.trim(),
      trade_name: tradeName.trim() || null,
      sector,
      province,
      city: city.trim() || null,
      address: address.trim() || null,
      website: website.trim() || null,
      whatsapp: whatsapp.trim() || null,
      description: description.trim(),
      services: services.split(",").map((item) => item.trim()).filter(Boolean),
      served_provinces: servedProvinces.split(",").map((item) => item.trim()).filter(Boolean),
      entity_type: entityType.trim() || null,
      employees: employees.trim() || null,
      founded_year: foundedYear ? Number(foundedYear) : null,
    };

    const result = id
      ? await supabase.from("companies").update(payload).eq("id", id).select().single()
      : await supabase.from("companies").insert(payload).select().single();

    if (result.error) {
      setError(result.error.message);
      return;
    }

    setId(result.data.id);
    setSaved(true);
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <div>
        <p className="text-xs font-bold uppercase tracking-[.16em] text-[#0f766e]">Empresa</p>
        <h1 className="mt-2 text-3xl font-bold text-[#102a43]">Perfil da empresa</h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          Construa uma ficha empresarial completa. Estes dados serão a base do diretório, matching e verificação.
        </p>
      </div>

      <form onSubmit={save} className="mt-8 space-y-7 rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
        <section>
          <h2 className="font-bold text-[#102a43]">Identidade</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="field-label">Nome legal<input required value={name} onChange={(event) => setName(event.target.value)} className="field" /></label>
            <label className="field-label">Nome comercial<input value={tradeName} onChange={(event) => setTradeName(event.target.value)} className="field" /></label>
            <label className="field-label">Tipo de entidade<input value={entityType} onChange={(event) => setEntityType(event.target.value)} placeholder="Ex.: Lda, SA, empresário em nome individual" className="field" /></label>
            <label className="field-label">Ano de constituição<input type="number" min="1900" max={new Date().getFullYear()} value={foundedYear} onChange={(event) => setFoundedYear(event.target.value)} className="field" /></label>
          </div>
        </section>

        <section>
          <h2 className="font-bold text-[#102a43]">Atividade</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="field-label">Sector<select className="field" value={sector} onChange={(event) => setSector(event.target.value)}>{sectors.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label className="field-label">Província principal<select className="field" value={province} onChange={(event) => setProvince(event.target.value)}>{provinces.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label className="field-label sm:col-span-2">Províncias onde atua<input value={servedProvinces} onChange={(event) => setServedProvinces(event.target.value)} placeholder="Ex.: Maputo, Gaza, Sofala" className="field" /></label>
            <label className="field-label sm:col-span-2">Serviços e produtos<input value={services} onChange={(event) => setServices(event.target.value)} placeholder="Separe por vírgulas" className="field" /></label>
            <label className="field-label sm:col-span-2">Descrição<textarea required value={description} onChange={(event) => setDescription(event.target.value)} className="field min-h-32" /></label>
          </div>
        </section>

        <section>
          <h2 className="font-bold text-[#102a43]">Localização e contacto</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="field-label">Cidade<input value={city} onChange={(event) => setCity(event.target.value)} className="field" /></label>
            <label className="field-label">Morada<input value={address} onChange={(event) => setAddress(event.target.value)} className="field" /></label>
            <label className="field-label">Website<input type="url" value={website} onChange={(event) => setWebsite(event.target.value)} placeholder="https://" className="field" /></label>
            <label className="field-label">WhatsApp<input value={whatsapp} onChange={(event) => setWhatsapp(event.target.value)} className="field" /></label>
            <label className="field-label">Email da conta<input type="email" value={email} readOnly className="field bg-slate-50" /></label>
            <label className="field-label">Dimensão<input value={employees} onChange={(event) => setEmployees(event.target.value)} placeholder="Ex.: 11–50 colaboradores" className="field" /></label>
          </div>
        </section>

        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        {saved && <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">Perfil guardado.</p>}

        <div className="flex justify-end">
          <button className="rounded-lg bg-[#0f766e] px-5 py-3 font-semibold text-white">Guardar perfil</button>
        </div>
      </form>
    </main>
  );
}

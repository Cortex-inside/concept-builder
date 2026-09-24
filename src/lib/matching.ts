import type { Company, RequestRow } from "./data";

export type Breakdown = { key: string; label: string; weight: number; score: number };
export type Match = { company: Company; total: number; breakdown: Breakdown[] };

const norm = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

const sizeRank: Record<string, number> = { "1-5": 1, "6-25": 2, "26-50": 3, "51-200": 4, "200+": 5 };

/**
 * Deterministic matching. Weights per technical plan:
 * Categoria 25 · Serviço 20 · Localização 15 · Capacidade 15 · Experiência 10 ·
 * Disponibilidade 5 · Verificação 5 · Histórico 5
 */
export function scoreCompany(req: RequestRow, c: Company, lang: "pt" | "en" = "pt"): Match {
  const L = (pt: string, en: string) => (lang === "pt" ? pt : en);

  const category = req.sector_id && c.sector_id === req.sector_id ? 1 : req.sector_id ? 0 : 0.5;

  let service = 0;
  const words = norm(`${req.service ?? ""} ${req.title}`)
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 3);
  const hay = norm(`${c.services.join(" ")} ${c.description ?? ""}`);
  if (words.length) {
    const hits = words.filter((w) => hay.includes(w.slice(0, Math.max(4, w.length - 2)))).length;
    service = Math.min(1, hits / Math.min(words.length, 3));
  }

  let location = 0.3;
  if (req.province) {
    if (c.province === req.province) location = 1;
    else if (c.served_provinces.includes(req.province)) location = 0.8;
    else location = 0;
  }

  const rank = sizeRank[c.employees ?? ""] ?? 2;
  const reqRank = sizeRank[req.company_size ?? ""] ?? 2;
  const capacity = Math.min(1, 0.4 + (rank / Math.max(reqRank, 1)) * 0.3);

  const years = c.founded_year ? new Date().getFullYear() - c.founded_year : 0;
  const experience = Math.min(1, years / 10) * 0.7 + (c.verif_experience ? 0.3 : 0);

  const availability = c.whatsapp || c.phone ? 1 : 0.5;
  const verification =
    [c.verif_contact, c.verif_company, c.verif_service, c.verif_experience].filter(Boolean).length / 4;
  const history = c.plan !== "free" ? 1 : 0.5;

  const breakdown: Breakdown[] = [
    { key: "category", label: L("Categoria", "Category"), weight: 25, score: category },
    { key: "service", label: L("Serviço", "Service"), weight: 20, score: service },
    { key: "location", label: L("Localização", "Location"), weight: 15, score: location },
    { key: "capacity", label: L("Capacidade", "Capacity"), weight: 15, score: capacity },
    { key: "experience", label: L("Experiência", "Experience"), weight: 10, score: experience },
    { key: "availability", label: L("Disponibilidade", "Availability"), weight: 5, score: availability },
    { key: "verification", label: L("Verificação", "Verification"), weight: 5, score: verification },
    { key: "history", label: L("Histórico", "History"), weight: 5, score: history },
  ];
  const total = Math.round(breakdown.reduce((a, b) => a + b.weight * b.score, 0));
  return { company: c, total, breakdown };
}

export function rankCompanies(req: RequestRow, companies: Company[], lang: "pt" | "en") {
  return companies
    .filter((c) => c.owner_id !== req.buyer_id)
    .map((c) => scoreCompany(req, c, lang))
    .sort((a, b) => b.total - a.total);
}

import type { Database } from "@/integrations/supabase/types";

export type Company = Database["public"]["Tables"]["companies"]["Row"];
export type Sector = Database["public"]["Tables"]["sectors"]["Row"];
export type RequestRow = Database["public"]["Tables"]["requests"]["Row"];
export type Proposal = Database["public"]["Tables"]["proposals"]["Row"];

export const PROVINCES = [
  "Maputo Cidade",
  "Maputo Província",
  "Gaza",
  "Inhambane",
  "Sofala",
  "Manica",
  "Tete",
  "Zambézia",
  "Nampula",
  "Cabo Delgado",
  "Niassa",
] as const;

export const EMPLOYEE_RANGES = ["1-5", "6-25", "26-50", "51-200", "200+"];

export const PLANS = [
  {
    id: "free",
    name: "Free",
    price: "0 MT",
    items: ["Perfil básico", "Contactos e localização", "Categorias e serviços", "Avaliações", "Aparecer nas pesquisas"],
  },
  {
    id: "business",
    name: "Business",
    price: "1.500 MT/mês",
    items: ["Portfólio", "Mais serviços", "Documentos", "Analytics", "Leads e oportunidades", "Destaque nas pesquisas"],
  },
  {
    id: "professional",
    name: "Professional",
    price: "4.000 MT/mês",
    items: ["Matching", "RFQs ilimitados", "CRM", "Gestão de propostas", "Analytics avançado"],
  },
  {
    id: "corporate",
    name: "Corporate",
    price: "Sob consulta",
    items: ["Procurement", "Inteligência de mercado", "API", "Relatórios", "Múltiplos utilizadores"],
  },
];

export const slugify = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const waLink = (n: string) => `https://wa.me/${n.replace(/[^0-9]/g, "")}`;

export const initials = (s: string) =>
  s
    .split(/\s+/)
    .filter((w) => /^[A-Za-zÀ-ú]/.test(w))
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");

export const verifCount = (c: Company) =>
  [c.verif_contact, c.verif_company, c.verif_service, c.verif_experience].filter(Boolean).length;

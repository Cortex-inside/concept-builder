export const sectors = ["Construção e Engenharia", "Tecnologia e Serviços", "Consultoria", "Logística e Transportes", "Indústria e Fornecimento", "Energia e Equipamentos", "Agronegócio", "Saúde", "Finanças e Seguros", "Outros"];
export const provinces = ["Maputo", "Maputo Cidade", "Gaza", "Inhambane", "Sofala", "Manica", "Tete", "Zambézia", "Nampula", "Cabo Delgado", "Niassa"];

export type Company = {
  id: string; owner_id?: string; name: string; trade_name?: string | null; slug?: string | null;
  sector: string; province: string; city?: string | null; address?: string | null; description: string;
  services: string[]; served_provinces?: string[]; website?: string | null; email?: string | null;
  phone?: string | null; whatsapp?: string | null; entity_type?: string | null; employees?: string | null;
  founded_year?: number | null; nuit?: string | null; verified: boolean;
  verification_status?: "unverified" | "pending" | "verified" | "rejected";
  verification_submitted_at?: string | null; verification_reviewed_at?: string | null;
};
export type Request = { id: string; title: string; sector: string; province: string; budget?: string | null; status: string; description: string; proposals?: number; };
export type Proposal = { id: string; request_id: string; supplier_id: string; amount?: number | null; currency?: string | null; delivery_days?: number | null; status: string; notes?: string | null; };

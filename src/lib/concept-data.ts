export const sectors = ["Construção", "Tecnologia", "Logística", "Consultoria", "Energia", "Agronegócio"];
export const provinces = ["Maputo", "Maputo Cidade", "Gaza", "Inhambane", "Sofala", "Manica", "Tete", "Zambézia", "Nampula", "Cabo Delgado", "Niassa"];

export type Company = {
  id: string;
  name: string;
  sector: string;
  province: string;
  description: string;
  verified: boolean;
  services: string[];
  email?: string | null;
  phone?: string | null;
};

export type Request = {
  id: string;
  title: string;
  sector: string;
  province: string;
  budget?: string | null;
  status: string;
  description: string;
  proposals?: number;
};

export type Proposal = {
  id: string;
  request_id: string;
  supplier_id: string;
  amount?: number | null;
  currency?: string | null;
  delivery_days?: number | null;
  status: string;
  notes?: string | null;
};

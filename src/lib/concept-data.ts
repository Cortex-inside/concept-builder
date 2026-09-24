export type Company = {
  id: string;
  name: string;
  sector: string;
  province: string;
  description: string;
  verified: boolean;
  services: string[];
  email: string;
  phone: string;
};

export const sectors = ["Construção", "Tecnologia", "Logística", "Consultoria", "Energia", "Agronegócio"];
export const provinces = ["Maputo", "Maputo Cidade", "Gaza", "Inhambane", "Sofala", "Manica", "Tete", "Zambézia", "Nampula", "Cabo Delgado", "Niassa"];

export const companies: Company[] = [
  { id: "alpha", name: "Alpha Engenharia & Construção", sector: "Construção", province: "Maputo Cidade", description: "Projetos de engenharia, construção civil e manutenção de instalações.", verified: true, services: ["Construção civil", "Fiscalização", "Manutenção"], email: "comercial@alpha.co.mz", phone: "+258 84 000 0001" },
  { id: "techhub", name: "TechHub Moçambique", sector: "Tecnologia", province: "Maputo Cidade", description: "Software empresarial, integração de sistemas e transformação digital.", verified: true, services: ["Software", "Cloud", "Integrações"], email: "hello@techhub.co.mz", phone: "+258 84 000 0002" },
  { id: "logix", name: "Logix Supply & Logistics", sector: "Logística", province: "Maputo", description: "Transporte, armazenagem e gestão de cadeia de abastecimento.", verified: true, services: ["Transporte", "Armazenagem", "Frete"], email: "sales@logix.co.mz", phone: "+258 84 000 0003" },
  { id: "greenpower", name: "GreenPower Solutions", sector: "Energia", province: "Sofala", description: "Soluções solares e eficiência energética para empresas.", verified: false, services: ["Solar", "Eficiência energética", "Consultoria"], email: "info@greenpower.co.mz", phone: "+258 84 000 0004" },
  { id: "agroplus", name: "AgroPlus", sector: "Agronegócio", province: "Nampula", description: "Fornecimento e processamento de produtos agrícolas.", verified: true, services: ["Produção", "Processamento", "Distribuição"], email: "contact@agroplus.co.mz", phone: "+258 84 000 0005" },
  { id: "advisory", name: "Moz Advisory Partners", sector: "Consultoria", province: "Maputo Cidade", description: "Consultoria de gestão, procurement e desenvolvimento empresarial.", verified: false, services: ["Gestão", "Procurement", "Estratégia"], email: "team@mozadvisory.co.mz", phone: "+258 84 000 0006" },
];

export type Request = {
  id: string;
  title: string;
  sector: string;
  province: string;
  budget: string;
  status: "Aberto" | "Em análise" | "Fechado";
  description: string;
  proposals: number;
};

export const requests: Request[] = [
  { id: "req-1", title: "Construção de armazém logístico", sector: "Construção", province: "Maputo", budget: "5–8 M MZN", status: "Aberto", description: "Construção e entrega de um armazém com 1.500 m².", proposals: 4 },
  { id: "req-2", title: "Sistema de gestão empresarial", sector: "Tecnologia", province: "Maputo Cidade", budget: "800 mil–1,5 M MZN", status: "Em análise", description: "Implementação de ERP para operações e finanças.", proposals: 3 },
  { id: "req-3", title: "Transporte de carga nacional", sector: "Logística", province: "Sofala", budget: "Sob consulta", status: "Aberto", description: "Serviço recorrente de transporte entre centros de distribuição.", proposals: 2 },
];

export const plans = [
  { name: "Grátis", price: "0 MZN", description: "Para começar a explorar a rede.", features: ["Perfil básico", "Pesquisa de empresas", "Até 2 pedidos/mês"] },
  { name: "Profissional", price: "1.500 MZN/mês", description: "Para empresas que compram ou vendem com frequência.", features: ["Perfil verificado", "Pedidos ilimitados", "Convites a fornecedores", "Comparação de propostas"] },
  { name: "Empresarial", price: "Sob consulta", description: "Para equipas e operações de procurement.", features: ["Tudo do Profissional", "Múltiplos utilizadores", "Suporte dedicado", "Relatórios"] },
];

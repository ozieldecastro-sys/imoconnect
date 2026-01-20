
export enum LeadType {
  COMPRAR = 'COMPRAR',
  ALUGAR = 'ALUGAR',
  VENDER = 'VENDER',
  ANUNCIAR = 'ANUNCIAR'
}

export enum LeadCategory {
  OPORTUNIDADE = 'OPORTUNIDADE',
  QUALIFICADO = 'QUALIFICADO',
  PRIORITARIO = 'PRIORITARIO'
}

export enum LeadStatus {
  NOVO = 'NOVO',
  EM_ATENDIMENTO = 'EM_ATENDIMENTO',
  VISITA_REALIZADA = 'VISITA_REALIZADA',
  PROPOSTA_ENVIADA = 'PROPOSTA_ENVIADA',
  FECHADO = 'FECHADO',
  PERDIDO = 'PERDIDO'
}

export type BrokerPlan = 'FREE' | 'PRO';

export interface Lead {
  id: string;
  type: LeadType;
  category: LeadCategory;
  status: LeadStatus;
  score: number;
  createdAt: string;
  exclusiveUntil: string;
  formData: Record<string, string>;
  scoreReasoning?: string;
  customerName: string;
  customerPhone: string;
  preco_lead: number;
  exclusividade_horas: number;
  status_distribuicao: "Disponível" | "Ativado";
  versao_preco: "lançamento";
  isActivated: boolean;
}

export interface FormQuestion {
  id: string;
  label: string;
  type: 'text' | 'select';
  options?: string[];
}

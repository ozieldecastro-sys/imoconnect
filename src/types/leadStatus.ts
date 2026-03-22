// src/types/leadStatus.ts

export type LeadStatus =
  | "novo"
  | "oportunidade"
  | "negociando"
  | "vendido"
  | "proposta_futura"
  | "nao_interessado";

// Labels amigáveis para UI
export const LEAD_STATUS_LABEL: Record<LeadStatus, string> = {
  novo: "Novo",
  oportunidade: "Oportunidade",
  negociando: "Negociando",
  vendido: "Vendido",
  proposta_futura: "Proposta futura",
  nao_interessado: "Não interessado",
};

// Ordem de prioridade (usaremos depois)
export const LEAD_STATUS_ORDER: LeadStatus[] = [
  "novo",
  "oportunidade",
  "negociando",
  "proposta_futura",
  "vendido",
  "nao_interessado",
];

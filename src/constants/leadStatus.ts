export const LEAD_STATUS = {
  NOVO: "novo",
  OPORTUNIDADE: "oportunidade",
  NEGOCIANDO: "negociando",
  VENDIDO: "vendido",
  DESCARTADO: "descartado",
} as const;

export const LEAD_STATUS_LIST = Object.values(LEAD_STATUS);

export type LeadStatus = typeof LEAD_STATUS[keyof typeof LEAD_STATUS];

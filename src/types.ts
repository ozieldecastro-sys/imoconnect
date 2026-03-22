export enum LeadStatus {
  DISPONIVEL = "disponivel",
  BLOQUEADO = "bloqueado",
  ATENDIDO = "atendido",
  FINALIZADO_INATIVO = "finalizado_inativo"
}

export enum LeadCategory {
  GRATUITO = "gratuito",
  BASICO = "basico",
  PREMIUM = "premium"
}

export type LeadType =
  | "comprar"
  | "alugar"
  | "vender"
  | "anunciar";

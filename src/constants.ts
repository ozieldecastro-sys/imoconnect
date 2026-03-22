// src/constants.ts

export type LeadStatus =
  | 'novo'
  | 'oportunidade'
  | 'negociando'
  | 'vendido'
  | 'perdido';

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  novo: 'Novo',
  oportunidade: 'Oportunidade',
  negociando: 'Negociando',
  vendido: 'Vendido',
  perdido: 'Perdido',
};

// fallback seguro para dados antigos ou inconsistentes
export function normalizeLeadStatus(status: any): LeadStatus {
  if (!status) return 'novo';

  const value = status.toString().toLowerCase();

  if (value.includes('oportun')) return 'oportunidade';
  if (value.includes('negoci')) return 'negociando';
  if (value.includes('vend')) return 'vendido';
  if (value.includes('perd')) return 'perdido';

  return 'novo';
}

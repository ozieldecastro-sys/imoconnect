export function normalizeLeadStatus(status?: string): LeadStatus {
  if (!status) return LEAD_STATUS.NOVO;

  const normalized = status.toLowerCase().trim();

  if (LEAD_STATUS_LIST.includes(normalized as LeadStatus)) {
    return normalized as LeadStatus;
  }

  return LEAD_STATUS.NOVO;
}
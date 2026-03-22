// =============================
// EXPORTA TODAS AS CLOUD FUNCTIONS
// =============================

// =============================
// LEADS
// =============================
export { criarLead } from "./criarLead";
export { buscarLeadsDisponiveis } from "./buscarLeadsDisponiveis";
export { assumirInteresse } from "./assumirInteresse";
export { buscarTodosLeads } from "./buscarTodosLeads";

// =============================
// CICLO DE LEADS
// =============================
export { criarNovoCiclo } from "./criarNovoCiclo";
export { encerrarInteresse } from "./encerrarInteresse";

// =============================
// ENQUETE / REATIVAÇÃO
// =============================
export { enviarEnqueteLead } from "./enviarEnqueteLead";
export { webhookResponderEnquete } from "./webhookResponderEnquete";
export { receberWebhookWhatsApp } from "./receberWebhookWhatsApp";
export { normalizarCamposEnquete } from "./normalizarCamposEnquete";

// =============================
// EXPIRAÇÃO AUTOMÁTICA
// =============================
export { expirarLeads } from "./expirarLeads";

// =============================
// FINANCEIRO
// =============================
export { adicionarCredito } from "./adicionarCredito";
export { obterExtratoFinanceiro } from "./obterExtratoFinanceiro";

// =============================
// USUÁRIOS
// =============================
export { loginCorretor } from "./loginCorretor";

// =============================
// RANKING
// =============================
export { gerarRankingDiario } from "./gerarRankingDiario";
export { rankearLeadsPool } from "./rankearLeadsPool";
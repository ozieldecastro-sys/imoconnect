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
export { normalizarLeadsAntigos } from "./normalizarLeadsAntigos";
export { buscarMeusLeads } from "./buscarMeusLeads";
export { obterLeadPorId } from "./obterLeadPorId";
export { atualizarStatusCRM } from "./atualizarStatusCRM";

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
export { expirarPlanosVencidos } from "./expirarPlanosVencidos";

// =============================
// FINANCEIRO
// =============================
export { adicionarCredito } from "./adicionarCredito";
export { obterExtratoFinanceiro } from "./obterExtratoFinanceiro";

// =============================
// USUÁRIOS / PLANOS / PAGAMENTOS
// =============================
export { loginCorretor } from "./loginCorretor";
export { obterPerfilCorretor } from "./obterPerfilCorretor";
export { upgradePlanoCorretor } from "./upgradePlanoCorretor";
export { criarCheckoutProAsaasSandbox } from "./criarCheckoutProAsaasSandbox";
export { receberWebhookAsaasSandbox } from "./receberWebhookAsaasSandbox";

// =============================
// RANKING
// =============================
export { gerarRankingDiario } from "./gerarRankingDiario";
export { rankearLeadsPool } from "./rankearLeadsPool";
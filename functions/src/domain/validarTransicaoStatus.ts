type OrigemAcao = "DASHBOARD" | "SCHEDULER" | "SISTEMA";

interface ValidarTransicaoParams {
  statusAtual: string;
  statusNovo: string;
  origem: OrigemAcao;
  corretorAtual?: string | null;
  corretorSolicitante?: string | null;
}

export function validarTransicaoStatus({
  statusAtual,
  statusNovo,
  origem,
  corretorAtual = null,
  corretorSolicitante = null,
}: ValidarTransicaoParams): void {

  // 🔒 REGRA 1: Lead vendido é estado final absoluto
  if (statusAtual === "vendido") {
    throw new Error("Lead vendido não permite mudança de status.");
  }

  /**
   * OPORTUNIDADE → EM_ATENDIMENTO
   * Somente via DASHBOARD (ação humana)
   */
  if (
    statusAtual === "oportunidade" &&
    statusNovo === "em_atendimento" &&
    origem === "DASHBOARD"
  ) {
    return;
  }

  /**
   * EM_ATENDIMENTO → OPORTUNIDADE
   * Somente via SCHEDULER (expiração automática)
   */
  if (
    statusAtual === "em_atendimento" &&
    statusNovo === "oportunidade" &&
    origem === "SCHEDULER"
  ) {
    return;
  }

  /**
   * EM_ATENDIMENTO → VENDIDO
   * Somente via DASHBOARD
   * Somente pelo corretor que está com o lead
   */
  if (
    statusAtual === "em_atendimento" &&
    statusNovo === "vendido" &&
    origem === "DASHBOARD"
  ) {
    if (!corretorAtual || corretorAtual !== corretorSolicitante) {
      throw new Error("Somente o corretor atual pode marcar como vendido.");
    }
    return;
  }

  /**
   * Qualquer outra transição é inválida
   */
  throw new Error(
    `Transição inválida: ${statusAtual} → ${statusNovo} (${origem})`
  );
}

import { onCall, HttpsError } from "firebase-functions/v2/https";
import { db, admin } from "./firebase";

export const assumirInteresse = onCall(
  { region: "us-central1" },
  async (request) => {
    const { leadId, corretorId } = request.data || {};

    if (!leadId || !corretorId) {
      throw new HttpsError(
        "invalid-argument",
        "leadId e corretorId são obrigatórios"
      );
    }

    const corretorRef = db.collection("usuarios").doc(corretorId);
    const leadRef = db.collection("leads").doc(leadId);
    const leadsDisponiveisRef = db.collection("leadsDisponiveis").doc(leadId);

    const agora = admin.firestore.Timestamp.now();

    const resposta = await db.runTransaction(async (transaction) => {
      const corretorSnap = await transaction.get(corretorRef);
      const leadSnap = await transaction.get(leadRef);

      if (!corretorSnap.exists) {
        throw new HttpsError("permission-denied", "Corretor inválido");
      }

      if (!leadSnap.exists) {
        throw new HttpsError("not-found", "Lead não encontrado");
      }

      const corretor = corretorSnap.data() || {};
      const leadAtual = leadSnap.data() || {};

      /* ==========================================
         VALIDAÇÃO CORRETOR
      ========================================== */

      if (!corretor.ativo) {
        throw new HttpsError("permission-denied", "Corretor inativo");
      }

      const plano = (corretor.plano || "BASIC").toUpperCase();
      const nivelLead = leadAtual.nivelLead || "Oportunidade";

      /* ==========================================
         REGRA DE PLANO (RO-15)
      ========================================== */

      if (plano === "BASIC" && nivelLead !== "Oportunidade") {
        throw new HttpsError(
          "permission-denied",
          "Seu plano permite apenas leads Oportunidade"
        );
      }

      /* ==========================================
         LEAD DISPONÍVEL?
      ========================================== */

      if (leadAtual.status !== "disponivel") {
        return {
          sucesso: false,
          mensagem: "Lead indisponível",
          corretorAtual: leadAtual.corretorAtual ?? null,
          expiresAt: leadAtual.expiresAt ?? null,
        };
      }

      /* ==========================================
         RO-05 BLOQUEIO PERMANENTE
      ========================================== */

      const corretoresBloqueados = leadAtual.corretoresBloqueados || [];

      if (corretoresBloqueados.includes(corretorId)) {
        throw new HttpsError(
          "permission-denied",
          "Você já atendeu este lead anteriormente"
        );
      }

      /* ==========================================
         FINANCEIRO
      ========================================== */

      const precoLead = leadAtual.precoLead ?? 0;
      const saldoAtual = corretor.saldoAtual ?? 0;
      const totalDebitado = corretor.totalDebitado ?? 0;

      let saldoPosterior = saldoAtual;

      if (plano !== "ADMIN") {
        if (saldoAtual < precoLead) {
          throw new HttpsError(
            "failed-precondition",
            "Saldo insuficiente"
          );
        }

        saldoPosterior = saldoAtual - precoLead;

        transaction.update(corretorRef, {
          saldoAtual: saldoPosterior,
          totalDebitado: totalDebitado + precoLead,
          leadsRecebidos: (corretor.leadsRecebidos || 0) + 1,
          atualizadoEm: agora,
        });

        const transacaoRef = db.collection("transacoes").doc();

        transaction.set(transacaoRef, {
          tipo: "debito",
          corretorId,
          leadId,
          valor: precoLead,
          saldoAntes: saldoAtual,
          saldoDepois: saldoPosterior,
          descricao: "Débito por assumir lead",
          criadoEm: agora,
        });
      } else {
        // ADMIN não paga
        transaction.update(corretorRef, {
          leadsRecebidos: (corretor.leadsRecebidos || 0) + 1,
          atualizadoEm: agora,
        });
      }

      /* ==========================================
         EXCLUSIVIDADE
      ========================================== */

      let horasExclusividade = 24;
      if (plano === "PRO") horasExclusividade = 48;

      const expiresAt = admin.firestore.Timestamp.fromMillis(
        agora.toMillis() + horasExclusividade * 60 * 60 * 1000
      );

      /* ==========================================
         UPDATE LEAD
      ========================================== */

      transaction.update(leadRef, {
        status: "em_atendimento",
        corretorAtual: corretorId,
        assumedAt: agora,
        expiresAt: expiresAt,
        atualizadoEm: agora,
      });

      /* ==========================================
         REMOVE DO POOL
      ========================================== */

      transaction.delete(leadsDisponiveisRef);

      return {
        sucesso: true,
        mensagem: "Lead assumido",
        saldoRestante: saldoPosterior,
        precoPago: plano === "ADMIN" ? 0 : precoLead,
        expiresAt,
      };
    });

    return resposta;
  }
);
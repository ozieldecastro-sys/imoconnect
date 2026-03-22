import { onCall, HttpsError } from "firebase-functions/v2/https";
import { db, admin } from "./firebase";

/**
 * FUNÇÃO: responderEnqueteLead
 * Processa resposta da enquete enviada ao cliente.
 * 
 * SIM → reinicia ciclo do lead e volta ao pool
 * NÃO → encerra lead definitivamente
 */

export const responderEnqueteLead = onCall(
  { region: "us-central1" },
  async (request) => {

    try {

      const { leadId, resposta } = request.data || {};

      if (!leadId || !resposta) {
        throw new HttpsError(
          "invalid-argument",
          "leadId e resposta são obrigatórios."
        );
      }

      const leadRef = db.collection("leads").doc(leadId);
      const leadSnap = await leadRef.get();

      if (!leadSnap.exists) {
        throw new HttpsError("not-found", "Lead não encontrado.");
      }

      const leadData = leadSnap.data() || {};

      if (!leadData.enqueteEnviada || leadData.status !== "aguardando_enquete") {
        throw new HttpsError(
          "failed-precondition",
          "Lead não está aguardando enquete."
        );
      }

      const agora = admin.firestore.Timestamp.now();

      let novoStatus: string;

      const respostaNormalizada = resposta.toUpperCase();

      if (respostaNormalizada === "SIM") {
        novoStatus = "disponivel";
      }
      else if (respostaNormalizada === "NÃO" || respostaNormalizada === "NAO") {
        novoStatus = "encerrado";
      }
      else {
        throw new HttpsError(
          "invalid-argument",
          "Resposta inválida. Use SIM ou NÃO."
        );
      }

      const batch = db.batch();

      /* =====================================
         ATUALIZAR LEAD
      ===================================== */

      batch.update(leadRef, {

        status: novoStatus,

        enqueteRespondida: true,
        enqueteResposta: respostaNormalizada,

        enqueteEnviada: false,
        enqueteEnviadaAt: null,

        claimedAt: null,
        expiresAt: null,

        updatedAt: agora,
      });

      /* =====================================
         SE CLIENTE CONFIRMOU INTERESSE
      ===================================== */

      if (novoStatus === "disponivel") {

        const poolRef = db.collection("leadsDisponiveis").doc(leadId);

        batch.set(poolRef, {
          prioridadePool: leadData.prioridadePool || 0,
          createdAt: agora,
        });

      }

      /* =====================================
         HISTÓRICO
      ===================================== */

      const historicoRef = leadRef.collection("historico").doc();

      batch.set(historicoRef, {

        tipo: "resposta_enquete",

        resposta: respostaNormalizada,

        statusAnterior: leadData.status,
        statusAtual: novoStatus,

        createdAt: agora,
      });

      await batch.commit();

      return {
        sucesso: true,
        novoStatus,
      };

    } catch (error: any) {

      console.error("responderEnqueteLead error:", error);

      if (error instanceof HttpsError) throw error;

      throw new HttpsError(
        "internal",
        error.message || "Erro interno ao processar enquete."
      );

    }

  }
);
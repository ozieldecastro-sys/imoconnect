import { onCall, HttpsError } from "firebase-functions/v2/https";
import { db, admin } from "./firebase";

export const encerrarAtendimento = onCall(
  { region: "us-central1" },
  async (request) => {

    try {

      const { leadId, corretorId, resultado } = request.data || {};

      if (!leadId || !corretorId || !resultado) {
        throw new HttpsError(
          "invalid-argument",
          "leadId, corretorId e resultado são obrigatórios"
        );
      }

      const resultadosValidos = [
        "cliente_comprou",
        "cliente_desistiu",
        "nao_consegui_contato",
      ];

      if (!resultadosValidos.includes(resultado)) {
        throw new HttpsError(
          "invalid-argument",
          "Resultado inválido"
        );
      }

      /* ==========================================
         BUSCAR LEAD
      ========================================== */

      const leadRef = db.collection("leads").doc(leadId);
      const leadSnap = await leadRef.get();

      if (!leadSnap.exists) {
        throw new HttpsError("not-found", "Lead não encontrado");
      }

      const lead = leadSnap.data();

      /* ==========================================
         VALIDAR DONO DO LEAD
      ========================================== */

      if (lead?.corretorId !== corretorId) {
        throw new HttpsError(
          "permission-denied",
          "Este corretor não possui este lead"
        );
      }

      /* ==========================================
         BLOQUEIO RO-05
      ========================================== */

      const corretoresBloqueados = lead?.corretoresBloqueados || [];

      if (!corretoresBloqueados.includes(corretorId)) {
        corretoresBloqueados.push(corretorId);
      }

      /* ==========================================
         HISTÓRICO
      ========================================== */

      const historico = lead?.historico || [];

      historico.push({
        tipo: "atendimento_encerrado",
        resultado,
        corretorId,
        data: admin.firestore.Timestamp.now(),
      });

      /* ==========================================
         ENVIAR PARA QUARENTENA
      ========================================== */

      const quarentenaAte = admin.firestore.Timestamp.fromMillis(
        Date.now() + 1000 * 60 * 60 * 24 * 3
      ); // 3 dias

      /* ==========================================
         ATUALIZAR LEAD
      ========================================== */

      await leadRef.update({

        status: "quarentena",

        resultadoUltimoAtendimento: resultado,

        corretorId: null,
        claimedAt: null,
        expiresAt: null,

        corretoresBloqueados,

        quarentenaAte,

        historico,

        atualizadoEm: admin.firestore.Timestamp.now(),

      });

      return {
        sucesso: true,
        mensagem: "Atendimento encerrado com sucesso",
      };

    } catch (error: any) {

      console.error("❌ ERRO encerrarAtendimento:", error);

      throw new HttpsError(
        "internal",
        error.message || "Erro ao encerrar atendimento"
      );

    }

  }
);
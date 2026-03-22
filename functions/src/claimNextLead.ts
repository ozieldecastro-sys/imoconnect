import { onCall, HttpsError } from "firebase-functions/v2/https";
import { db, admin } from "./firebase";
import { FieldValue } from "firebase-admin/firestore";

export const claimNextLead = onCall(
  { region: "us-central1" },
  async (request) => {

    const { corretorId } = request.data;

    if (!corretorId) {
      throw new HttpsError("invalid-argument", "corretorId obrigatório");
    }

    const agora = admin.firestore.Timestamp.now();

    const expiracao = admin.firestore.Timestamp.fromMillis(
      agora.toMillis() + (30 * 60 * 1000) // 30 minutos
    );

    const corretorRef = db.collection("usuarios").doc(corretorId);

    return await db.runTransaction(async (transaction) => {

      // ================================
      // 1️⃣ Validar corretor
      // ================================

      const corretorSnap = await transaction.get(corretorRef);

      if (!corretorSnap.exists) {
        throw new HttpsError("not-found", "Corretor não encontrado");
      }

      const corretor = corretorSnap.data();

      if (corretor?.tipoUsuario !== "corretor") {
        throw new HttpsError("permission-denied", "Usuário não é corretor");
      }

      if (!corretor?.ativo) {
        throw new HttpsError("permission-denied", "Corretor inativo");
      }

      // ================================
      // 2️⃣ Verificar leads ativos
      // ================================

      const ativosQuery = await db
        .collection("leads")
        .where("corretorId", "==", corretorId)
        .get();

      let ativos = 0;

      ativosQuery.forEach((doc) => {
        const lead = doc.data();

        if (lead.expiresAt && lead.expiresAt.toMillis() > agora.toMillis()) {
          ativos++;
        }
      });

      if (ativos >= 3) {
        throw new HttpsError(
          "failed-precondition",
          "Corretor já possui 3 leads ativos"
        );
      }

      // ================================
      // 3️⃣ Buscar leads disponíveis
      // ================================

      const leadsQuery = await db
        .collection("leads")
        .where("status", "==", "disponivel")
        .orderBy("prioridadePool", "desc")
        .orderBy("createdAt", "asc")
        .limit(10)
        .get();

      if (leadsQuery.empty) {
        throw new HttpsError("not-found", "Nenhum lead disponível");
      }

      let leadEscolhido: any = null;
      let leadRef: any = null;

      for (const doc of leadsQuery.docs) {

        const lead = doc.data();
        const bloqueados = lead.corretoresBloqueados || [];

        // RO-05 bloqueio permanente
        if (bloqueados.includes(corretorId)) {
          continue;
        }

        // exclusividade ativa
        if (lead.expiresAt && lead.expiresAt.toMillis() > agora.toMillis()) {
          continue;
        }

        leadEscolhido = lead;
        leadRef = doc.ref;
        break;

      }

      if (!leadEscolhido || !leadRef) {
        throw new HttpsError("not-found", "Nenhum lead elegível para este corretor");
      }

      // ================================
      // 4️⃣ Claim do lead
      // ================================

      transaction.update(leadRef, {
        corretorId: corretorId,
        claimedAt: agora,
        expiresAt: expiracao,
        updatedAt: agora
      });

      // ================================
      // 5️⃣ Atualizar métricas
      // ================================

      transaction.update(corretorRef, {
        leadsRecebidos: FieldValue.increment(1),
        ultimoLeadRecebido: agora
      });

      // ================================
      // 6️⃣ Retornar lead
      // ================================

      return {
        leadId: leadRef.id,
        ...leadEscolhido
      };

    });

  }
);
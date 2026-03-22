import { onSchedule } from "firebase-functions/v2/scheduler";
import * as admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

/**
 * 📊 Gera ranking diário de corretores
 * baseado no histórico de leads assumidos
 */
export const gerarRankingDiario = onSchedule(
  {
    schedule: "15 1 * * *",
    timeZone: "America/Sao_Paulo",
    region: "us-central1",
  },
  async () => {
    console.log("📊 Gerando ranking diário...");

    const leadsSnapshot = await db.collection("leads").get();

    if (leadsSnapshot.empty) {
      console.log("Nenhum lead encontrado");
      return;
    }

    const ranking: Record<string, number> = {};

    for (const leadDoc of leadsSnapshot.docs) {
      const historicoSnap = await leadDoc.ref
        .collection("historico")
        .get();

      historicoSnap.docs.forEach((h) => {
        const data = h.data();

        // Conta apenas eventos de lead assumido
        if (data.evento !== "lead_assumido") return;

        const corretorId = data.corretorId;

        if (!corretorId) return;

        ranking[corretorId] = (ranking[corretorId] || 0) + 1;
      });
    }

    await db
      .collection("metricas")
      .doc("rankingDiario")
      .set(
        {
          ranking,
          atualizadoEm: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

    console.log("✅ Ranking diário atualizado");
  }
);
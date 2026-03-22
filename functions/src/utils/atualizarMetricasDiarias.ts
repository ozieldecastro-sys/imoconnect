import { onSchedule } from "firebase-functions/v2/scheduler";
import * as admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

function getDataISO(date: Date): string {
  const ano = date.getFullYear();
  const mes = String(date.getMonth() + 1).padStart(2, "0");
  const dia = String(date.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

/**
 * 📊 Atualiza métricas diárias
 * Executa todos os dias às 01:00 (America/Sao_Paulo)
 */
export const atualizarMetricasDiarias = onSchedule(
  {
    schedule: "0 1 * * *", // 01:00
    timeZone: "America/Sao_Paulo",
    region: "us-central1",
  },
  async (): Promise<void> => {
    const ontem = new Date();
    ontem.setDate(ontem.getDate() - 1);
    const dataReferencia = getDataISO(ontem);

    const historicosSnap = await db
      .collectionGroup("historico")
      .where("timestamp", ">=", new Date(`${dataReferencia}T00:00:00`))
      .where("timestamp", "<=", new Date(`${dataReferencia}T23:59:59`))
      .get();

    if (historicosSnap.empty) return;

    const agregados: Record<
      string,
      {
        corretorId: string;
        leadsAssumidos: number;
        leadsVendidos: number;
        leadsLiberados: number;
      }
    > = {};

    historicosSnap.docs.forEach((doc) => {
      const data = doc.data();
      const corretorId = data.corretorId;
      if (!corretorId) return;

      if (!agregados[corretorId]) {
        agregados[corretorId] = {
          corretorId,
          leadsAssumidos: 0,
          leadsVendidos: 0,
          leadsLiberados: 0,
        };
      }

      switch (data.tipoAcao) {
        case "ASSUMIDO_POR_CORRETOR":
          agregados[corretorId].leadsAssumidos++;
          break;
        case "MARCADO_COMO_VENDIDO":
          agregados[corretorId].leadsVendidos++;
          break;
        case "LIBERADO_POR_EXPIRACAO":
          agregados[corretorId].leadsLiberados++;
          break;
      }
    });

    const batch = db.batch();

    Object.values(agregados).forEach((m) => {
      const ref = db
        .collection("metricas_diarias")
        .doc(dataReferencia)
        .collection("corretores")
        .doc(m.corretorId);

      batch.set(
        ref,
        {
          ...m,
          data: dataReferencia,
          atualizadoEm:
            admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    });

    await batch.commit();
  }
);
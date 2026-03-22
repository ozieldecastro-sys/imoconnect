import { onSchedule } from "firebase-functions/v2/scheduler";
import { admin, db } from "./firebase";

export const expirarLeads = onSchedule(
  {
    schedule: "every 5 minutes",
    timeZone: "America/Sao_Paulo",
    region: "us-central1",
  },
  async () => {

    const agora = admin.firestore.Timestamp.now();

    console.log("====================================");
    console.log("⏰ CRON EXPIRAR LEADS EXECUTADO");
    console.log("Horário atual:", agora.toDate().toISOString());

    try {

      const snapshot = await db
        .collection("leads")
        .where("status", "==", "assumido")
        .where("expiresAt", "<=", agora)
        .limit(50)
        .get();

      console.log("Leads encontrados para expirar:", snapshot.size);

      if (snapshot.empty) {
        console.log("✅ Nenhum lead para expirar.");
        console.log("====================================");
        return;
      }

      const batch = db.batch();

      snapshot.docs.forEach((doc) => {

        const data = doc.data();
        const corretorAnterior = data.corretorId || null;

        if (!corretorAnterior) {
          console.log("⚠️ Lead sem corretor, ignorado:", doc.id);
          return;
        }

        console.log("🔁 Expirando lead:", doc.id);
        console.log("Corretor anterior:", corretorAnterior);

        const quarentenaEndsAt = admin.firestore.Timestamp.fromMillis(
          agora.toMillis() + 6 * 24 * 60 * 60 * 1000
        );

        const updateData: any = {

          status: "quarentena",

          corretorId: null,
          claimedAt: null,
          expiresAt: null,

          quarentenaAt: agora,
          quarentenaEndsAt,

          updatedAt: agora,

          corretoresBloqueados:
            admin.firestore.FieldValue.arrayUnion(corretorAnterior),

          ciclo: data.ciclo || 1,
        };

        batch.update(doc.ref, updateData);

        /* =========================================
           REMOVER DO POOL OTIMIZADO
        ========================================= */

        const poolRef = db.collection("leadsDisponiveis").doc(doc.id);
        batch.delete(poolRef);

        /* =========================================
           HISTÓRICO
        ========================================= */

        const historicoRef = doc.ref.collection("historico").doc();

        batch.set(historicoRef, {
          tipo: "expiracao",
          descricao: "Exclusividade expirada automaticamente",
          corretorId: corretorAnterior,
          createdAt: agora,
        });

      });

      await batch.commit();

      console.log("🚀 Leads enviados para quarentena com sucesso.");
      console.log("====================================");

    } catch (error) {

      console.error("❌ ERRO NA EXPIRAÇÃO:", error);
      console.log("====================================");

    }

  }
);
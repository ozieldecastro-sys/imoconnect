import { onCall, HttpsError } from "firebase-functions/v2/https";
import { db, admin } from "./firebase";

/* =====================================================
   FUNÇÃO: RANQUEAR LEADS DO POOL
   Atualiza prioridadePool dos leads disponíveis
===================================================== */

export const rankearLeadsPool = onCall(
  { region: "us-central1" },
  async () => {

    const agora = admin.firestore.Timestamp.now();

    try {

      const snapshot = await db
        .collection("leads")
        .where("status", "==", "disponivel")
        .get();

      const batch = db.batch();

      snapshot.docs.forEach((doc) => {

        const lead = doc.data();

        const scoreLead = lead.scoreLead ?? 0;
        const precoLead = lead.precoLead ?? 0;

        const createdAt = lead.createdAt;

        let horasNoPool = 0;

        if (createdAt) {

          const diffMs =
            agora.toMillis() - createdAt.toMillis();

          horasNoPool = diffMs / (1000 * 60 * 60);

        }

        const prioridadePool =
          scoreLead +
          precoLead +
          horasNoPool * 2;

        batch.update(doc.ref, {
          prioridadePool,
          prioridadeAtualizadaEm: agora,
        });

      });

      await batch.commit();

      return {
        sucesso: true,
        leadsProcessados: snapshot.size,
      };

    } catch (error) {

      console.error("Erro ao ranquear leads:", error);

      throw new HttpsError(
        "internal",
        "Erro ao calcular prioridade dos leads"
      );

    }

  }
);
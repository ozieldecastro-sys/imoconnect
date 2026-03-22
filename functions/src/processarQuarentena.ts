import { onSchedule } from "firebase-functions/v2/scheduler";
import { admin, db } from "./firebase";

export const processarQuarentena = onSchedule(
  {
    schedule: "every 10 minutes",
    timeZone: "America/Sao_Paulo",
    region: "us-central1",
  },
  async () => {

    const agora = admin.firestore.Timestamp.now();

    console.log("====================================");
    console.log("🧊 PROCESSANDO QUARENTENA DE LEADS");
    console.log("Horário atual:", agora.toDate().toISOString());

    try {

      const snapshot = await db
        .collection("leads")
        .where("status", "==", "quarentena")
        .where("quarentenaEndsAt", "<=", agora)
        .limit(50)
        .get();

      console.log("Leads encontrados para processar:", snapshot.size);

      if (snapshot.empty) {
        console.log("✅ Nenhum lead saindo da quarentena.");
        console.log("====================================");
        return;
      }

      const batch = db.batch();

      snapshot.docs.forEach((doc) => {

        console.log("📩 Lead pronto para enquete:", doc.id);

        batch.update(doc.ref, {

          status: "aguardando_enquete",

          enqueteEnviada: false,
          enqueteRespondida: false,
          enqueteEnviadaAt: null,

          updatedAt: agora,
        });

        // registrar histórico
        const historicoRef = doc.ref.collection("historico").doc();

        batch.set(historicoRef, {
          tipo: "saida_quarentena",
          descricao: "Lead liberado da quarentena para revalidação",
          createdAt: agora,
        });

      });

      await batch.commit();

      console.log("🚀 Leads movidos para aguardando_enquete.");
      console.log("====================================");

    } catch (error) {

      console.error("❌ ERRO AO PROCESSAR QUARENTENA:", error);
      console.log("====================================");

    }

  }
);
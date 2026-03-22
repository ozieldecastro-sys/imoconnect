import { onCall, HttpsError } from "firebase-functions/v2/https";
import { admin, db } from "./firebase";

export const registrarHistoricoLead = onCall(
  { region: "us-central1" },
  async (request) => {
    const { leadId, evento, corretorId, dados } = request.data || {};

    if (!leadId) {
      throw new HttpsError("invalid-argument", "leadId é obrigatório");
    }

    if (!evento) {
      throw new HttpsError("invalid-argument", "evento é obrigatório");
    }

    const leadRef = db.collection("leads").doc(leadId);
    const leadSnap = await leadRef.get();

    if (!leadSnap.exists) {
      throw new HttpsError("not-found", "Lead não encontrado");
    }

    const historicoRef = leadRef.collection("historico").doc();

    await historicoRef.set({
      evento,
      corretorId: corretorId || null,
      dados: dados || null,
      criadoEm: admin.firestore.Timestamp.now(),
    });

    return {
      sucesso: true,
      eventoRegistrado: evento,
    };
  }
);
import { onCall } from "firebase-functions/v2/https";
import { db } from "./firebase";

export const buscarTodosLeads = onCall(
  { region: "us-central1" },
  async () => {
    try {
      const snapshot = await db.collection("leads").get();

      const leads: any[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();

        leads.push({
          id: doc.id,
          ...data,
        });
      });

      console.log("Total de leads na base:", leads.length);

      return {
        sucesso: true,
        total: leads.length,
        leads,
      };
    } catch (error: any) {
      console.error("Erro ao buscar leads:", error);

      return {
        sucesso: false,
        erro: error.message,
      };
    }
  }
);
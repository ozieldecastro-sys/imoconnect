import { onCall, HttpsError } from "firebase-functions/v2/https";
import { admin, db } from "../firebase";

/**
 * Libera leads cuja exclusividade expirou ou que não estão vendidos
 * Apenas administradores podem executar manualmente
 */
export const liberarLeads = onCall(async (request) => {
  const { auth } = request;

  if (!auth) {
    throw new HttpsError("unauthenticated", "Usuário não autenticado.");
  }

  if (!auth.token.admin) {
    throw new HttpsError("permission-denied", "Apenas administradores podem liberar leads.");
  }

  const agora = admin.firestore.Timestamp.now();

  // Filtra apenas leads que não estão vendidos e com lock expirado
  const snapshot = await db
    .collection("leads")
    .where("status", "!=", "vendido")
    .where("lockUntil", "<=", agora)
    .get();

  if (snapshot.empty) {
    return { liberados: 0 };
  }

  const batch = db.batch();

  snapshot.docs.forEach((doc) => {
    batch.update(doc.ref, {
      status: "oportunidade",
      corretorAtual: null,
      lockUntil: null,
      atualizadoEm: agora,
    });
  });

  await batch.commit();

  console.log(`✅ Leads liberados manualmente: ${snapshot.size}`);

  return { liberados: snapshot.size };
});

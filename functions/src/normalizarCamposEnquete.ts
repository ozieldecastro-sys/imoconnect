import { onRequest } from "firebase-functions/v2/https";
import { db, admin } from "./firebase";

function normalizarResposta(valor: unknown): "SIM" | "NAO" | null {
  const texto = String(valor || "")
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (texto === "SIM") return "SIM";
  if (texto === "NAO") return "NAO";

  return null;
}

export const normalizarCamposEnquete = onRequest(async (_req, res) => {
  try {
    const snapshot = await db.collection("leads").get();

    if (snapshot.empty) {
      res.status(200).json({
        success: true,
        message: "Nenhum lead encontrado",
        totalAtualizados: 0,
      });
      return;
    }

    const batch = db.batch();
    let totalAtualizados = 0;
    const agora = admin.firestore.Timestamp.now();

    snapshot.docs.forEach((doc) => {
      const data = doc.data();

      const enqueteEnviadaAt =
        data.enqueteEnviadaAt ||
        data.enqueteEnviadaEm ||
        null;

      const respostaNormalizada = normalizarResposta(data.enqueteResposta);

      const enqueteRespondida = Boolean(
        data.enqueteRespondida || respostaNormalizada
      );

      const enqueteEnviada = Boolean(
        data.enqueteEnviada ||
        enqueteEnviadaAt ||
        data.status === "aguardando_enquete"
      );

      const tentativasEnquete = Number(data.tentativasEnquete || 0);

      const ultimaTentativaEnqueteAt =
        data.ultimaTentativaEnqueteAt ||
        enqueteEnviadaAt ||
        null;

      batch.update(doc.ref, {
        enqueteEnviada,
        enqueteEnviadaAt,
        enqueteRespondida,
        enqueteResposta: respostaNormalizada,
        tentativasEnquete,
        ultimaTentativaEnqueteAt,
        atualizadoEm: agora,
        updatedAt: agora,
        enqueteEnviadaEm: admin.firestore.FieldValue.delete(),
      });

      totalAtualizados += 1;
    });

    await batch.commit();

    res.status(200).json({
      success: true,
      totalAtualizados,
    });
    return;
  } catch (error) {
    console.error("Erro ao normalizar campos da enquete:", error);
    res.status(500).json({ error: "Erro interno" });
    return;
  }
});
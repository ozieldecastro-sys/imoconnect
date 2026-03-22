import { onRequest } from "firebase-functions/v2/https";
import { db, admin } from "./firebase";

function normalizarMensagem(mensagem: string): "SIM" | "NAO" | null {
  const texto = String(mensagem || "")
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (texto === "SIM") return "SIM";
  if (texto === "NAO") return "NAO";

  return null;
}

export const webhookResponderEnquete = onRequest(async (req, res) => {
  try {
    const { leadId, mensagem } = req.body;

    if (!leadId || !mensagem) {
      res.status(400).json({ error: "leadId e mensagem são obrigatórios" });
      return;
    }

    const resposta = normalizarMensagem(mensagem);

    if (!resposta) {
      res.status(400).json({ error: "Resposta inválida. Use SIM ou NAO." });
      return;
    }

    const leadRef = db.collection("leads").doc(leadId);
    const doc = await leadRef.get();

    if (!doc.exists) {
      res.status(404).json({ error: "Lead não encontrado" });
      return;
    }

    const agora = admin.firestore.Timestamp.now();

    if (resposta === "SIM") {
      await leadRef.update({
        status: "disponivel",
        corretorId: null,
        claimedAt: null,
        expiresAt: null,
        enqueteRespondida: true,
        enqueteResposta: "SIM",
        atualizadoEm: agora,
        updatedAt: agora,
        enqueteEnviadaEm: admin.firestore.FieldValue.delete(),
      });

      res.status(200).json({
        success: true,
        novoStatus: "disponivel",
      });
      return;
    }

    await leadRef.update({
      status: "sem_interesse",
      corretorId: null,
      claimedAt: null,
      expiresAt: null,
      enqueteRespondida: true,
      enqueteResposta: "NAO",
      atualizadoEm: agora,
      updatedAt: agora,
      enqueteEnviadaEm: admin.firestore.FieldValue.delete(),
    });

    res.status(200).json({
      success: true,
      novoStatus: "sem_interesse",
    });
    return;
  } catch (error) {
    console.error("Erro no webhookResponderEnquete:", error);
    res.status(500).json({ error: "Erro interno" });
    return;
  }
});
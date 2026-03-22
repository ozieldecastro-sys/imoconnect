import { onRequest } from "firebase-functions/v2/https";
import { db, admin } from "./firebase";

export const enviarEnqueteLead = onRequest(async (req, res) => {
  try {
    const { leadId } = req.body;

    if (!leadId) {
      res.status(400).json({ error: "leadId é obrigatório" });
      return;
    }

    const leadRef = db.collection("leads").doc(leadId);
    const doc = await leadRef.get();

    if (!doc.exists) {
      res.status(404).json({ error: "Lead não encontrado" });
      return;
    }

    const lead = doc.data();
    const telefone = String(lead?.telefone || "").trim();

    if (!telefone) {
      res.status(400).json({ error: "Lead sem telefone" });
      return;
    }

    const agora = admin.firestore.Timestamp.now();
    const tentativasAtuais = Number(lead?.tentativasEnquete || 0);

    const mensagem = `Olá! Você ainda tem interesse em imóvel?\n\nResponda:\nSIM ou NÃO`;

    await leadRef.update({
      status: "aguardando_enquete",
      enqueteEnviada: true,
      enqueteEnviadaAt: agora,
      enqueteRespondida: false,
      enqueteResposta: null,
      tentativasEnquete: tentativasAtuais + 1,
      ultimaTentativaEnqueteAt: agora,
      atualizadoEm: agora,
      updatedAt: agora,
      enqueteEnviadaEm: admin.firestore.FieldValue.delete(),
    });

    res.status(200).json({
      success: true,
      modo: "manual",
      leadId,
      telefone,
      mensagem,
    });
    return;
  } catch (error) {
    console.error("Erro ao preparar enquete manual:", error);
    res.status(500).json({ error: "Erro interno" });
    return;
  }
});
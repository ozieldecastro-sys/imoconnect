import { onRequest } from "firebase-functions/v2/https";
import { db } from "./firebase";

function normalizarTelefone(telefone: string): string {
  return telefone.replace(/\D/g, "");
}

export const receberWebhookWhatsApp = onRequest(async (req, res) => {
  try {
    const body = req.body;

    console.log("Webhook recebido:", JSON.stringify(body));

    let mensagem = body?.text?.message;
    let telefone = body?.phone;

    if (!mensagem || !telefone) {
      res.status(400).json({ error: "Dados inválidos" });
      return;
    }

    mensagem = mensagem.trim().toUpperCase();
    telefone = normalizarTelefone(String(telefone));

    const snapshot = await db.collection("leads").get();

    let leadEncontrado: any = null;

    snapshot.forEach((doc) => {
      const data = doc.data();
      const telefoneBanco = normalizarTelefone(String(data.telefone || ""));

      if (telefoneBanco === telefone) {
        leadEncontrado = { id: doc.id };
      }
    });

    if (!leadEncontrado) {
      res.status(200).json({ message: "Lead não encontrado" });
      return;
    }

    const leadId = leadEncontrado.id;

    if (mensagem === "SIM" || mensagem === "NÃO") {
      await fetch(
        "https://us-central1-imoconnect-9d71c.cloudfunctions.net/webhookResponderEnquete",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            leadId,
            mensagem,
          }),
        }
      );
    }

    res.status(200).json({ success: true });
    return;

  } catch (error) {
    console.error("Erro webhook WhatsApp:", error);
    res.status(500).json({ error: "Erro interno" });
    return;
  }
});
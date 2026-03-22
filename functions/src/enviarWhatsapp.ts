import axios from "axios";

/**
 * ENVIO DE MENSAGEM WHATSAPP
 * Integração com Evolution API
 */

export async function enviarWhatsapp(
  telefone: string,
  mensagem: string
) {

  const url = "https://SEU_SERVIDOR_EVOLUTION/message/sendText";

  const payload = {

    number: telefone,
    textMessage: {
      text: mensagem
    }

  };

  const headers = {

    "Content-Type": "application/json",
    "apikey": "SUA_API_KEY"

  };

  try {

    const response = await axios.post(url, payload, { headers });

    console.log("Mensagem enviada:", response.data);

    return true;

  } catch (error: any) {

    console.error("Erro ao enviar WhatsApp:", error.message);

    return false;

  }

}
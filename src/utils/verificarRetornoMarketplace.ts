import { httpsCallable } from "firebase/functions";
import { functions } from "../firebase";

/**
 * Verifica se lead pode retornar ao marketplace
 */

export async function verificarRetornoMarketplace(
  leadId: string
) {

  try {

    const fn = httpsCallable(
      functions,
      "verificarRetornoMarketplace"
    );

    const response: any = await fn({
      leadId,
    });

    return response.data;

  } catch (error) {

    console.error(
      "Erro ao verificar retorno ao marketplace:",
      error
    );

    throw error;

  }

}
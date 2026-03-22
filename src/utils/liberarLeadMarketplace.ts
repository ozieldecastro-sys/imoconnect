import { httpsCallable } from "firebase/functions";
import { functions } from "../firebase";

/**
 * Solicita ao backend liberação do lead para marketplace
 */

export async function liberarLeadMarketplace(
  leadId: string
) {

  try {

    const fn = httpsCallable(
      functions,
      "liberarLeadMarketplace"
    );

    const response: any = await fn({
      leadId,
    });

    return response.data;

  } catch (error) {

    console.error(
      "Erro ao liberar lead para marketplace:",
      error
    );

    throw error;

  }

}
import { httpsCallable } from "firebase/functions";
import { functions } from "../firebase";

/**
 * Solicita cálculo do score comportamental do lead
 */

export async function calcularScoreLead(leadId: string) {

  try {

    const fn = httpsCallable(
      functions,
      "calcularScoreLead"
    );

    const response: any = await fn({
      leadId,
    });

    return response.data;

  } catch (error) {

    console.error(
      "Erro ao calcular score do lead:",
      error
    );

    throw error;

  }

}
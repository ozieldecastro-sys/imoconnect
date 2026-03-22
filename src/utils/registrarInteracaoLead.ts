import { httpsCallable } from "firebase/functions";
import { functions } from "../firebase";

/**
 * C7 — Registra nova interação do lead
 */

export async function registrarInteracaoLead(leadId: string) {

  try {

    const fn = httpsCallable(functions, "registrarInteracaoLead");

    const response: any = await fn({
      leadId,
    });

    return response.data;

  } catch (error) {

    console.error("Erro ao registrar interação do lead:", error);
    throw error;

  }

}
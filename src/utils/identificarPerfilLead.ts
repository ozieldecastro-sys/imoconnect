import { httpsCallable } from "firebase/functions";
import { functions } from "../firebase";

/**
 * Solicita ao backend identificação do perfil do lead
 */

export async function identificarPerfilLead(leadId: string) {

  try {

    const fn = httpsCallable(
      functions,
      "identificarPerfilLead"
    );

    const response: any = await fn({
      leadId,
    });

    return response.data;

  } catch (error) {

    console.error(
      "Erro ao identificar perfil do lead:",
      error
    );

    throw error;

  }

}
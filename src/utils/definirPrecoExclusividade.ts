import { httpsCallable } from "firebase/functions";
import { functions } from "../firebase";

/**
 * Solicita ao backend definição de preço e exclusividade
 */

export async function definirPrecoExclusividade(leadId: string) {

  try {

    const fn = httpsCallable(
      functions,
      "definirPrecoExclusividade"
    );

    const response: any = await fn({
      leadId,
    });

    return response.data;

  } catch (error) {

    console.error(
      "Erro ao definir preço e exclusividade:",
      error
    );

    throw error;

  }

}
import { httpsCallable } from "firebase/functions";
import { functions } from "../firebase";

/**
 * Solicita ao backend geração de relatórios do sistema
 */

export async function gerarRelatorios() {

  try {

    const fn = httpsCallable(
      functions,
      "gerarRelatorios"
    );

    const response: any = await fn({});

    return response.data;

  } catch (error) {

    console.error(
      "Erro ao gerar relatórios:",
      error
    );

    throw error;

  }

}
import { httpsCallable } from "firebase/functions";
import { functions } from "../firebase";

type Resultado =
  | "cliente_comprou"
  | "cliente_desistiu"
  | "nao_consegui_contato";

export async function finalizarAtendimento(
  leadId: string,
  corretorId: string,
  resultado: Resultado
) {

  try {

    const fn = httpsCallable(functions, "encerrarAtendimento");

    const response: any = await fn({
      leadId,
      corretorId,
      resultado,
    });

    return response.data;

  } catch (error) {

    console.error("Erro ao finalizar atendimento:", error);
    throw error;

  }

}
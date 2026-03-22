import { httpsCallable } from "firebase/functions";
import { functions } from "../firebase";

export async function reativarLead(leadId: string) {

  try {

    const fn = httpsCallable(functions, "tentarReativacaoLead");

    const response: any = await fn({
      leadId,
    });

    return response.data;

  } catch (error) {

    console.error("Erro ao tentar reativar lead:", error);
    throw error;

  }

}
import { httpsCallable } from "firebase/functions";
import { functions } from "../firebase";

export async function assumirLead(
  leadId: string,
  corretorId: string
) {

  try {

    const fn = httpsCallable(functions, "assumirInteresse");

    const response: any = await fn({
      leadId,
      corretorId,
    });

    return response.data;

  } catch (error) {

    console.error("Erro ao assumir lead:", error);
    throw error;

  }

}
import { httpsCallable } from "firebase/functions";
import { functions } from "../firebase";

export async function liberarLead(
  leadId: string,
  quarantineDays = 7
) {

  try {

    const fn = httpsCallable(functions, "liberarLead");

    const response: any = await fn({
      leadId,
      quarantineDays,
    });

    return response.data;

  } catch (error) {

    console.error("Erro ao liberar lead:", error);
    throw error;

  }

}
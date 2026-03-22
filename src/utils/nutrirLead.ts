import { httpsCallable } from "firebase/functions";
import { functions } from "../firebase";

export async function nutrirLead(leadId: string) {

  try {

    const fn = httpsCallable(functions, "processarNutricaoLead");

    const response: any = await fn({
      leadId,
    });

    return response.data;

  } catch (error) {

    console.error("Erro ao nutrir lead:", error);
    throw error;

  }

}
import { httpsCallable } from "firebase/functions";
import { functions } from "../firebase";

interface CriarNovoCicloParams {
  leadId: string;
  tipo: string;
}

interface CriarNovoCicloResponse {
  sucesso: boolean;
  cicloId: string;
}

export async function criarNovoCiclo({
  leadId,
  tipo,
}: CriarNovoCicloParams): Promise<CriarNovoCicloResponse> {

  if (!leadId || !tipo) {
    throw new Error("leadId e tipo são obrigatórios.");
  }

  try {
    const criarNovoCicloCall = httpsCallable(functions, "criarNovoCiclo");

    const response = await criarNovoCicloCall({
      leadId,
      tipo,
    });

    return response.data as CriarNovoCicloResponse;

  } catch (error: any) {
    console.error("Erro ao chamar criarNovoCiclo:", error);
    throw error;
  }
}

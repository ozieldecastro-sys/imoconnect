import { httpsCallable } from "firebase/functions";
import { functions } from "../firebase";

export interface CriarLeadPayload {
  nome: string;
  telefone: string;
  tipo: "compra" | "aluguel" | "venda" | "anunciar";
  valor: number;
  prazo: "imediato" | "curto" | "planejando" | "pesquisando";
  cidade: string;
  bairro: string;
  endereco?: string | null;
  formaPagamento?: string | null;
  tipoImovel?: string | null;
  documentacao?: string | null;
  numQuartos?: string | null;
  areaImovel?: string | null;
  observacoes?: string | null;
}

export async function criarLead(dados: CriarLeadPayload) {
  try {
    const criarLeadFunction = httpsCallable(functions, "criarLead");
    const response = await criarLeadFunction(dados);

    return response.data;
  } catch (error: any) {
    console.error("Erro ao criar lead:", error);
    throw error;
  }
}
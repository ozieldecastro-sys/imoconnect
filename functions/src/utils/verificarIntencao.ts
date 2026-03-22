import { db } from "../firebase";

interface Intencao {
  tipo: string;
  objetivo?: string;
  bairro?: string;
  faixaPreco?: string;
}

/**
 * Verifica se já existe uma intenção ativa de um lead para determinado telefone
 * Considera apenas leads disponíveis ou em atendimento
 */
export async function existeIntencaoAtiva(
  telefone: string,
  intencao: Intencao
): Promise<boolean> {
  const queryRef = db
    .collection("leads")
    .where("telefone", "==", telefone)
    .where("intencao.tipo", "==", intencao.tipo)
    .where("intencao.objetivo", "==", intencao.objetivo || "")
    .where("status", "in", ["disponivel", "em_atendimento"]);

  const snapshot = await queryRef.get();

  return snapshot.size > 0;
}

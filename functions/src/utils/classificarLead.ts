export type CategoriaLead = "oportunidade" | "qualificado" | "prioritario";

export interface IntencaoLead {
  urgencia?: boolean;
  contatoImediato?: boolean;
  faixaPreco?: number;
  bairro?: string;
}

export function classificarLead(intencao: IntencaoLead): {
  categoria: CategoriaLead;
  preco: number;
} {
  // 🔴 Lead Prioritário
  if (intencao.urgencia === true || intencao.contatoImediato === true) {
    return { categoria: "prioritario", preco: 39.9 };
  }

  // 🟡 Lead Qualificado
  if (intencao.faixaPreco && intencao.bairro) {
    return { categoria: "qualificado", preco: 14.9 };
  }

  // 🟢 Lead em Oportunidade
  return { categoria: "oportunidade", preco: 4.9 };
}

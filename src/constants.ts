
import { LeadType, FormQuestion } from './types';

export const FORM_QUESTIONS: Record<LeadType, FormQuestion[]> = {
  [LeadType.COMPRAR]: [
    { id: 'imovel_tipo', label: 'Tipo de imóvel', type: 'select', options: ['Apartamento', 'Casa de bairro', 'Casa em condomínio', 'Terreno', 'Imóvel na planta'] },
    { id: 'localizacao', label: 'Cidade ou bairro desejado', type: 'text' },
    { id: 'faixa_valor', label: 'Faixa de valor de compra', type: 'select', options: ['Até 200 mil', '200 a 350 mil', '350 a 600 mil', 'Acima de 600 mil'] },
    { id: 'forma_pagamento', label: 'Forma de compra', type: 'select', options: ['Financiamento', 'À vista', 'FGTS + financiamento', 'Ainda não defini'] },
    { id: 'prazo', label: 'Prazo para compra', type: 'select', options: ['Até 30 dias', '1 a 3 meses', '3 a 6 meses', 'Apenas pesquisando'] },
  ],
  [LeadType.ALUGAR]: [
    { id: 'imovel_tipo', label: 'Tipo de imóvel', type: 'select', options: ['Apartamento', 'Casa', 'Ponto comercial', 'Kitnet'] },
    { id: 'localizacao', label: 'Cidade ou bairro desejado', type: 'text' },
    { id: 'valor_max', label: 'Valor máximo de aluguel', type: 'select', options: ['Até 1.000', '1.000 a 1.500', '1.500 a 2.500', 'Acima de 2.500'] },
    { id: 'prazo_mudanca', label: 'Quando pretende se mudar', type: 'select', options: ['Imediatamente', 'Até 30 dias', '30 a 60 dias', 'Sem prazo'] },
    { id: 'situacao_atual', label: 'Situação atual', type: 'select', options: ['Já preciso sair', 'Moro de aluguel', 'Moro com família', 'Apenas pesquisando'] },
  ],
  [LeadType.VENDER]: [
    { id: 'imovel_tipo', label: 'Tipo de imóvel', type: 'select', options: ['Casa', 'Apartamento', 'Terreno', 'Comercial'] },
    { id: 'localizacao', label: 'Localização do imóvel (cidade/bairro)', type: 'text' },
    { id: 'documentacao', label: 'Situação documental', type: 'select', options: ['Regularizado', 'Falta algo', 'Não sei'] },
    { id: 'valor_definido', label: 'Valor definido?', type: 'select', options: ['Sim', 'Tenho uma base', 'Não faço ideia'] },
    { id: 'motivo_venda', label: 'Motivo da venda', type: 'select', options: ['Preciso do dinheiro', 'Troca de imóvel', 'Investimento', 'Apenas avaliando'] },
  ],
  [LeadType.ANUNCIAR]: [
    { id: 'imovel_tipo', label: 'Tipo de imóvel', type: 'select', options: ['Casa', 'Apartamento', 'Comercial', 'Terreno'] },
    { id: 'localizacao', label: 'Localização do imóvel', type: 'text' },
    { id: 'disponibilidade', label: 'Disponibilidade', type: 'select', options: ['Imediato', 'Até 30 dias', 'Ainda ocupado'] },
    { id: 'valor_aluguel', label: 'Valor de aluguel definido?', type: 'select', options: ['Sim', 'Tenho uma ideia', 'Preciso de orientação'] },
    { id: 'servico_desejado', label: 'Tipo de serviço desejado', type: 'select', options: ['Apenas divulgação', 'Intermediação', 'Administração completa'] },
  ],
};

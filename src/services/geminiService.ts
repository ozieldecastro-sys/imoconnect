
import { GoogleGenAI, Type } from "@google/genai";
import { LeadType, LeadCategory } from "../types";

// Initialize the GoogleGenAI client with the API key from environment variables.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const qualifyLead = async (type: LeadType, formData: Record<string, string>): Promise<{ category: LeadCategory; score: number; reasoning: string }> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Você é o sistema de qualificação inteligente da ImoConnect. Sua tarefa é analisar um formulário de ${type} e calcular um score de 0 a 100.

REGRAS DE PONTUAÇÃO:
1. PRAZO:
   - Imediato (até 3 meses/30 dias/60 dias): +30 pontos
   - Médio prazo (3 a 6 meses): +20 pontos
   - Longo prazo (mais de 6 meses/apenas pesquisando): +5 pontos

2. VALOR:
   - Valor definido e compatível com mercado: +30 pontos
   - Valor aproximado/faixa clara: +20 pontos
   - Ainda não definiu valor: +5 pontos

3. DECISÃO:
   - Já tomou decisão/Pronto para avançar/Motivo claro: +20 pontos
   - Em avaliação/Definindo: +10 pontos
   - Apenas pesquisando: +5 pontos

4. CONTATO:
   - Se o lead informou dados válidos (assuma +10 para este processamento).

CLASSIFICAÇÃO:
- Score 0 a 40: OPORTUNIDADE
- Score 41 a 70: QUALIFICADO
- Score 71 a 100: PRIORITARIO

DADOS DO FORMULÁRIO:
${Object.entries(formData).map(([k, v]) => `${k}: ${v}`).join('\n')}

Retorne o JSON conforme o schema.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER, description: "O score final calculado (0-100)" },
            category: { type: Type.STRING, description: "A classificação (OPORTUNIDADE, QUALIFICADO, PRIORITARIO)" },
            reasoning: { type: Type.STRING, description: "Explicação breve da pontuação." },
          },
          required: ["score", "category", "reasoning"],
        },
      },
    });

    // Directly access the .text property on the GenerateContentResponse object.
    const result = JSON.parse(response.text);
    const categoryMap: Record<string, LeadCategory> = {
      'PRIORITARIO': LeadCategory.PRIORITARIO,
      'QUALIFICADO': LeadCategory.QUALIFICADO,
      'OPORTUNIDADE': LeadCategory.OPORTUNIDADE,
    };
    
    return {
      category: categoryMap[result.category] || LeadCategory.OPORTUNIDADE,
      score: result.score || 0,
      reasoning: result.reasoning
    };
  } catch (error) {
    console.error("Erro na qualificação via AI:", error);
    return {
      category: LeadCategory.OPORTUNIDADE,
      score: 10,
      reasoning: "Falha na análise automática. Score mínimo atribuído."
    };
  }
};

import { onCall, HttpsError } from "firebase-functions/v2/https";
import { admin, db } from "./firebase";

export const criarLead = onCall(
  { region: "us-central1" },
  async (request) => {
    try {
      const data = request.data;

      const {
        nome,
        telefone,
        tipo,
        valor,
        prazo,
        cidade,
        bairro,
      } = data || {};

      if (!nome || !telefone || !cidade || !bairro || !tipo || valor == null || !prazo) {
        throw new HttpsError("invalid-argument", "Campos obrigatórios ausentes");
      }

      /* ==========================================
         SCORE
      ========================================== */

      const pontuacaoTipo: Record<string, number> = {
        compra: 30,
        aluguel: 20,
        venda: 15,
        anunciar: 10,
      };

      const pontuacaoPrazo: Record<string, number> = {
        imediato: 50,
        curto: 25,
        planejando: 10,
        pesquisando: 5,
      };

      let categoriaValor = "";
      let pontuacaoValor = 0;

      if (valor <= 264000) {
        categoriaValor = "mcmv";
        pontuacaoValor = 5;
      } else if (valor <= 1000000) {
        categoriaValor = "medio";
        pontuacaoValor = 10;
      } else {
        categoriaValor = "alto";
        pontuacaoValor = 15;
      }

      const score =
        pontuacaoTipo[tipo] +
        pontuacaoPrazo[prazo] +
        pontuacaoValor;

      const prioridadePool = score + 30;

      let nivelLead = "Oportunidade";
      if (score >= 80) nivelLead = "Prioritário";
      else if (score >= 60) nivelLead = "Qualificado";

      let precoLead = 7;
      if (score >= 80) precoLead = 30;
      else if (score >= 60) precoLead = 15;

      const agora = admin.firestore.Timestamp.now();

      /* ==========================================
         CRIA LEAD (NÃO ENTRA NO POOL AINDA)
      ========================================== */

      const leadRef = await db.collection("leads").add({
        nome,
        telefone,
        tipo,
        valor,
        prazo,
        cidade,
        bairro,

        categoriaValor,
        score,
        prioridadePool,
        nivelLead,
        precoLead,

        status: "aguardando_enquete",
        enqueteEnviada: false,
        tentativasEnquete: 0,

        interesseEncerrado: false,

        corretorId: null,
        claimedAt: null,
        expiresAt: null,

        quarentenaAt: null,
        quarentenaEndsAt: null,

        corretoresBloqueados: [],

        createdAt: agora,
        updatedAt: agora,
      });

      console.log("✅ Lead criado:", leadRef.id);

      return {
        sucesso: true,
        leadId: leadRef.id,
        score,
        nivelLead,
        precoLead,
      };

    } catch (error: any) {
      console.error("❌ Erro criarLead:", error);

      throw new HttpsError(
        "internal",
        error?.message || "Erro ao criar lead"
      );
    }
  }
);
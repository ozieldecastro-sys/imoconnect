import { onCall, HttpsError } from "firebase-functions/v2/https";
import { db, admin } from "./firebase";

export const criarNovoCiclo = onCall(
  { region: "us-central1" },
  async (request) => {

    try {

      // 🔒 Verifica autenticação
      if (!request.auth) {
        throw new HttpsError(
          "unauthenticated",
          "Usuário não autenticado."
        );
      }

      // 🔒 Verifica se é admin
      if (!request.auth.token.admin) {
        throw new HttpsError(
          "permission-denied",
          "Apenas administradores podem criar um novo ciclo."
        );
      }

      const { leadId, tipo } = request.data;

      if (!leadId || !tipo) {
        throw new HttpsError(
          "invalid-argument",
          "leadId e tipo são obrigatórios."
        );
      }

      const agora = admin.firestore.Timestamp.now();

      const leadRef = db.collection("leads").doc(leadId);
      const leadSnap = await leadRef.get();

      if (!leadSnap.exists) {
        throw new HttpsError(
          "not-found",
          "Lead não encontrado."
        );
      }

      const leadData = leadSnap.data() as any;

      const cicloAtual = leadData.ciclo || 1;
      const novoCiclo = cicloAtual + 1;

      const batch = db.batch();

      // 📊 cria registro de ciclo
      const cicloRef = db.collection("ciclos").doc();

      batch.set(cicloRef, {
        leadId,
        tipo,
        numeroCiclo: novoCiclo,
        criadoPor: request.auth.uid,
        ativo: true,
        createdAt: agora,
        updatedAt: agora
      });

      // 🔁 atualiza o lead para novo ciclo
      batch.update(leadRef, {

        ciclo: novoCiclo,

        status: "disponivel",

        corretorId: null,
        claimedAt: null,
        expiresAt: null,

        enqueteRespondida: false,
        enqueteEnviada: false,

        quarentenaAt: null,
        quarentenaEndsAt: null,

        updatedAt: agora
      });

      // 🚀 RECOLOCA NO POOL OTIMIZADO
      const leadDisponivelRef = db.collection("leadsDisponiveis").doc(leadId);

      batch.set(leadDisponivelRef, {

        leadId,

        nome: leadData.nome || null,
        telefone: leadData.telefone || null,

        cidade: leadData.cidade || null,
        bairro: leadData.bairro || null,

        nivelLead: leadData.nivelLead || "Oportunidade",
        precoLead: leadData.precoLead || 0,
        prioridadePool: leadData.prioridadePool || 0,

        createdAt: agora

      });

      // 📜 histórico
      const historicoRef = leadRef.collection("historico").doc();

      batch.set(historicoRef, {
        tipo: "novo_ciclo",
        descricao: `Novo ciclo iniciado (${novoCiclo})`,
        createdAt: agora
      });

      await batch.commit();

      return {
        sucesso: true,
        ciclo: novoCiclo,
        cicloId: cicloRef.id
      };

    } catch (error: any) {

      console.error("Erro em criarNovoCiclo:", error);

      throw new HttpsError(
        "internal",
        error.message || "Erro interno ao criar ciclo."
      );

    }

  }
);
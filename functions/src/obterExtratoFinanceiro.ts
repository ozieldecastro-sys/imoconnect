import { onCall, HttpsError } from "firebase-functions/v2/https";
import { db } from "./firebase";

export const obterExtratoFinanceiro = onCall(
  { region: "us-central1" },
  async (request) => {
    try {
      const { corretorId } = request.data || {};

      if (!corretorId) {
        throw new HttpsError("invalid-argument", "corretorId é obrigatório");
      }

      const userRef = db.collection("usuarios").doc(corretorId);
      const userSnap = await userRef.get();

      if (!userSnap.exists) {
        throw new HttpsError("not-found", "Usuário não encontrado");
      }

      const userData = userSnap.data() || {};

      let transacoesSnap;

      try {
        transacoesSnap = await db
          .collection("transacoes")
          .where("corretorId", "==", corretorId)
          .orderBy("createdAt", "asc")
          .limit(500)
          .get();
      } catch (erroOrderBy) {
        console.warn(
          "⚠️ Falha ao consultar transações com orderBy(createdAt). Tentando sem orderBy...",
          erroOrderBy
        );

        transacoesSnap = await db
          .collection("transacoes")
          .where("corretorId", "==", corretorId)
          .limit(500)
          .get();
      }

      const transacoes = transacoesSnap.docs.map((doc) => {
        const data = doc.data() || {};

        const dataTransacao =
          data.createdAt || data.criadoEm || data.data || null;

        let createdAt = null;

        if (dataTransacao && typeof dataTransacao.toMillis === "function") {
          createdAt = dataTransacao.toMillis();
        }

        return {
          id: doc.id,
          tipo: data.tipo || null,
          valor: typeof data.valor === "number" ? data.valor : 0,
          saldoAnterior:
            typeof data.saldoAnterior === "number" ? data.saldoAnterior : null,
          saldoPosterior:
            typeof data.saldoPosterior === "number" ? data.saldoPosterior : null,
          descricao: data.descricao || null,
          createdAt,
        };
      });

      transacoes.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));

      let totalCreditado = 0;
      let totalDebitado = 0;

      transacoes.forEach((t) => {
        if (t.tipo === "credito") totalCreditado += t.valor;
        if (t.tipo === "debito") totalDebitado += t.valor;
      });

      const saldoAtual =
        typeof userData.saldoAtual === "number"
          ? userData.saldoAtual
          : typeof userData.saldo === "number"
          ? userData.saldo
          : 0;

      return {
        success: true,
        saldoAtual,
        totalCreditado,
        totalDebitado,
        transacoes,
      };
    } catch (error: any) {
      console.error("❌ ERRO obterExtratoFinanceiro:", error);

      throw new HttpsError(
        "internal",
        error?.message || "Erro ao obter extrato financeiro"
      );
    }
  }
);
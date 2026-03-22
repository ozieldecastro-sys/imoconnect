import { onCall, HttpsError } from "firebase-functions/v2/https";
import { db, admin } from "./firebase";

export const adicionarCredito = onCall(
  { region: "us-central1" },
  async (request) => {
    try {
      const { corretorId, valor } = request.data;

      if (!corretorId || valor === undefined) {
        throw new HttpsError("invalid-argument", "corretorId e valor são obrigatórios");
      }

      const valorNumerico = Number(valor);

      if (isNaN(valorNumerico) || valorNumerico <= 0) {
        throw new HttpsError("invalid-argument", "Valor inválido para crédito");
      }

      const corretorRef = db.collection("usuarios").doc(corretorId);

      const resultado = await db.runTransaction(async (transaction) => {
        const corretorSnap = await transaction.get(corretorRef);

        if (!corretorSnap.exists) {
          throw new HttpsError("not-found", "Corretor não encontrado");
        }

        const saldoAtual = corretorSnap.data()?.saldoAtual || 0;
        const novoSaldo = saldoAtual + valorNumerico;

        transaction.update(corretorRef, {
          saldoAtual: novoSaldo,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        const transacaoRef = db.collection("transacoes").doc();

        transaction.set(transacaoRef, {
          corretorId,
          tipo: "credito",
          valor: valorNumerico,
          saldoAnterior: saldoAtual,
          saldoPosterior: novoSaldo,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        return novoSaldo;
      });

      return {
        sucesso: true,
        mensagem: `Saldo atualizado com sucesso`,
        saldoAtual: resultado,
      };
    } catch (error) {
      console.error("Erro adicionarCredito:", error);

      if (error instanceof HttpsError) {
        throw error;
      }

      throw new HttpsError(
        "internal",
        "Erro interno ao adicionar crédito"
      );
    }
  }
);
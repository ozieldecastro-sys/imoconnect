import { onCall, HttpsError } from "firebase-functions/v2/https";
import { db } from "./firebase";

interface LoginData {
  email: string;
  senha: string;
}

export const loginCorretor = onCall(
  { region: "us-central1" },
  async (request) => {
    try {
      const { data } = request;
      const { email, senha } = (data || {}) as LoginData;

      if (!email || !senha) {
        throw new HttpsError(
          "invalid-argument",
          "Email e senha são obrigatórios."
        );
      }

      const querySnapshot = await db
        .collection("usuarios")
        .where("email", "==", email)
        .where("senha", "==", senha)
        .limit(1)
        .get();

      if (querySnapshot.empty) {
        throw new HttpsError(
          "not-found",
          "Usuário não cadastrado no sistema."
        );
      }

      const doc = querySnapshot.docs[0];
      const usuario = doc.data() || {};

      if (usuario.ativo === false) {
        throw new HttpsError(
          "permission-denied",
          "Usuário inativo no sistema."
        );
      }

      const tipoUsuario = (usuario.tipoUsuario || "corretor")
        .toString()
        .toLowerCase();

      const plano =
        tipoUsuario === "admin"
          ? "ADMIN"
          : (usuario.plano || "BASIC").toString().toUpperCase();

      return {
        sucesso: true,
        message: "Login realizado com sucesso",
        corretor: {
          id: doc.id,
          nome: usuario.nome || "",
          email: usuario.email || email,
          ativo: usuario.ativo !== false,
          plano,
          tipoUsuario,
        },
      };
    } catch (error: any) {
      console.error("❌ ERRO loginCorretor:", error);

      if (error instanceof HttpsError) {
        throw error;
      }

      throw new HttpsError(
        "internal",
        error?.message || "Erro desconhecido."
      );
    }
  }
);
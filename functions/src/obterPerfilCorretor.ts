import { onCall, HttpsError } from "firebase-functions/v2/https";
import { db, admin } from "./firebase";

interface ObterPerfilData {
  corretorId: string;
}

export const obterPerfilCorretor = onCall(
  { region: "us-central1" },
  async (request) => {
    try {
      const { data } = request;
      const { corretorId } = (data || {}) as ObterPerfilData;

      if (!corretorId || !corretorId.trim()) {
        throw new HttpsError(
          "invalid-argument",
          "corretorId é obrigatório."
        );
      }

      const usuarioRef = db.collection("usuarios").doc(corretorId.trim());
      const usuarioSnap = await usuarioRef.get();

      if (!usuarioSnap.exists) {
        throw new HttpsError("not-found", "Corretor não encontrado.");
      }

      const usuario = usuarioSnap.data() || {};

      if (usuario.ativo === false) {
        throw new HttpsError(
          "permission-denied",
          "Usuário inativo no sistema."
        );
      }

      const tipoUsuario = (usuario.tipoUsuario || "corretor")
        .toString()
        .toLowerCase();

      let plano =
        tipoUsuario === "admin"
          ? "ADMIN"
          : (usuario.plano || "BASIC").toString().toUpperCase();

      let planoStatus = (usuario.planoStatus || "ativo").toString().toLowerCase();
      let planoIniciadoEm = usuario.planoIniciadoEm || null;
      let planoExpiraEm = usuario.planoExpiraEm || null;
      let planoOrigem = usuario.planoOrigem || null;
      const ultimoPagamentoPlanoEm = usuario.ultimoPagamentoPlanoEm || null;

      if (tipoUsuario !== "admin" && plano === "PRO" && planoExpiraEm) {
        const agora = admin.firestore.Timestamp.now();
        const expirou =
          typeof planoExpiraEm.toMillis === "function" &&
          planoExpiraEm.toMillis() <= agora.toMillis();

        if (expirou) {
          await usuarioRef.update({
            plano: "BASIC",
            planoStatus: "vencido",
            atualizadoEm: agora,
          });

          plano = "BASIC";
          planoStatus = "vencido";
        }
      }

      return {
        sucesso: true,
        message: "Perfil carregado com sucesso.",
        corretor: {
          id: usuarioSnap.id,
          nome: usuario.nome || "",
          email: usuario.email || "",
          ativo: usuario.ativo !== false,
          plano,
          tipoUsuario,
          planoStatus,
          planoIniciadoEm,
          planoExpiraEm,
          planoOrigem,
          ultimoPagamentoPlanoEm,
        },
      };
    } catch (error: any) {
      console.error("❌ ERRO obterPerfilCorretor:", error);

      if (error instanceof HttpsError) {
        throw error;
      }

      throw new HttpsError(
        "internal",
        error?.message || "Erro desconhecido ao buscar perfil."
      );
    }
  }
);
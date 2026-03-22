import { onCall, HttpsError } from "firebase-functions/v2/https";
import { db, admin } from "./firebase";

export const buscarLeadsDisponiveis = onCall(
  { region: "us-central1" },
  async (request) => {
    try {
      const { corretorId } = request.data || {};

      if (!corretorId) {
        throw new HttpsError("invalid-argument", "corretorId é obrigatório");
      }

      /* ==========================================
         VALIDAR CORRETOR
      ========================================== */

      const corretorSnap = await db.collection("usuarios").doc(corretorId).get();

      if (!corretorSnap.exists) {
        throw new HttpsError("permission-denied", "Corretor inválido");
      }

      const corretor = corretorSnap.data();

      if (!corretor?.ativo) {
        throw new HttpsError("permission-denied", "Corretor inativo");
      }

      const plano = (corretor.plano || "FREE").toUpperCase();
      const agora = admin.firestore.Timestamp.now();

      /* ==========================================
         BUSCAR LEADS DIRETO DA COLEÇÃO PRINCIPAL
      ========================================== */

      const snapshot = await db
        .collection("leads")
        .where("status", "==", "disponivel")
        .limit(100)
        .get();

      const leadsFiltrados: Record<string, any>[] = [];

      for (const doc of snapshot.docs) {
        const leadData = doc.data() || {};
        const leadId = doc.id;

        /* ==========================================
           FILTROS BÁSICOS
        ========================================== */

        if (leadData.interesseEncerrado === true) continue;

        const lead: Record<string, any> = {
          id: leadId,
          ...leadData,
        };

        const corretoresBloqueados = Array.isArray(lead.corretoresBloqueados)
          ? lead.corretoresBloqueados
          : [];

        /* ==========================================
           RO-05 — BLOQUEIO PERMANENTE
        ========================================== */

        if (corretoresBloqueados.includes(corretorId)) {
          continue;
        }

        /* ==========================================
           EXCLUSIVIDADE / LOCK
        ========================================== */

        if (
          lead.lockUntil &&
          typeof lead.lockUntil.toMillis === "function" &&
          lead.lockUntil.toMillis() > agora.toMillis()
        ) {
          continue;
        }

        if (
          lead.expiresAt &&
          typeof lead.expiresAt.toMillis === "function" &&
          lead.expiresAt.toMillis() > agora.toMillis()
        ) {
          continue;
        }

        /* ==========================================
           QUARENTENA
        ========================================== */

        if (
          lead.quarentenaEndsAt &&
          typeof lead.quarentenaEndsAt.toMillis === "function" &&
          lead.quarentenaEndsAt.toMillis() > agora.toMillis()
        ) {
          continue;
        }

        /* ==========================================
           REGRA DE PLANO
        ========================================== */

        const nivelLead = (lead.nivelLead || "Oportunidade").toString();

        if (plano === "FREE") {
          const niveisPermitidos = ["Oportunidade", "Lead em Oportunidade", "Oportunidade"];

          if (!niveisPermitidos.includes(nivelLead)) {
            leadsFiltrados.push({
              id: lead.id,
              nome: lead.nome || "Lead",
              telefone: lead.telefone || "",
              status: lead.status || "disponivel",
              nivelLead,
              bloqueado: true,
              mensagem: "Disponível apenas para plano PRO",
            });
            continue;
          }
        }

        leadsFiltrados.push(lead);
      }

      /* ==========================================
         ORDENAR POR PRIORIDADE
      ========================================== */

      leadsFiltrados.sort((a, b) => {
        const prioridadeA =
          typeof a.prioridadePool === "number" ? a.prioridadePool : 0;
        const prioridadeB =
          typeof b.prioridadePool === "number" ? b.prioridadePool : 0;

        if (prioridadeB !== prioridadeA) {
          return prioridadeB - prioridadeA;
        }

        const dataA =
          typeof a.createdAt?.toMillis === "function"
            ? a.createdAt.toMillis()
            : typeof a.criadoEm?.toMillis === "function"
            ? a.criadoEm.toMillis()
            : 0;

        const dataB =
          typeof b.createdAt?.toMillis === "function"
            ? b.createdAt.toMillis()
            : typeof b.criadoEm?.toMillis === "function"
            ? b.criadoEm.toMillis()
            : 0;

        return dataB - dataA;
      });

      return {
        sucesso: true,
        total: leadsFiltrados.length,
        leads: leadsFiltrados,
      };
    } catch (error: any) {
      console.error("❌ ERRO buscarLeadsDisponiveis:", error);

      throw new HttpsError(
        "internal",
        error?.message || "Erro ao buscar leads"
      );
    }
  }
);
import * as functions from "firebase-functions";
import { db } from "../firebase";
import { calcularScoreLead } from "../utils/calcularScoreLead";
import { definirPrecoExclusividade } from "../utils/definirPrecoExclusividade";
import { identificarPerfilLead } from "../utils/identificarPerfilLead";
import { liberarLeadMarketplace } from "../utils/liberarLeadMarketplace";
import { nutrirLead } from "../utils/nutrirLead";
import { gerarRelatorios } from "../utils/gerarRelatorios";
import { collection, getDocs } from "firebase/firestore";

// -------------------------
// Trigger C1–C8 → C9
// -------------------------
export const leadCapturado = functions.firestore
  .document("leads/{leadId}")
  .onCreate(async (snap, context) => {
    const lead = snap.data();
    if (!lead) return;

    lead.interactionCount = lead.interactionCount || 0;
    lead.hasChangedIntent = lead.hasChangedIntent || false;
    lead.isRecurringProfile = lead.isRecurringProfile || false;

    await calcularScoreLead(lead);
  });

// -------------------------
// Trigger C9 → C10 + C11
// -------------------------
export const leadAtualizado = functions.firestore
  .document("leads/{leadId}")
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    if (!after) return;

    const mudouInteracao = before?.interactionCount !== after?.interactionCount;
    const mudouData = before?.lastInteractionAt?.toMillis() !== after?.lastInteractionAt?.toMillis();

    if (mudouInteracao || mudouData) {
      const score = await calcularScoreLead(after);
      await definirPrecoExclusividade({ ...after, behaviorScore: score });
      await identificarPerfilLead({ ...after, behaviorScore: score });
    }
  });

// -------------------------
// Trigger C12 — Marketplace
// -------------------------
export const liberarLead = functions.firestore
  .document("leads/{leadId}")
  .onUpdate(async (change, context) => {
    const lead = change.after.data();
    if (!lead) return;

    if (lead.leadPrice && lead.profileScore && !lead.assignedTo) {
      const availableBrokers = ["Broker1", "Broker2", "Broker3"];
      await liberarLeadMarketplace(lead.id, availableBrokers);
    }
  });

// -------------------------
// Job C13 — Pós-atendimento / Nutrição
// (compatível com firebase-functions 7.x)
// -------------------------
export const jobNutrirLeads = functions.pubsub
  .topic("jobNutrirLeads") // cria um tópico Pub/Sub chamado "jobNutrirLeads"
  .onPublish(async (message) => {
    const leadsRef = collection(db, "leads");
    const snapshot = await getDocs(leadsRef);

    for (const docSnap of snapshot.docs) {
      const lead = docSnap.data();
      if (lead.postStatus !== "archived") {
        await nutrirLead(lead);
      }
    }
  });

// -------------------------
// Job C14 — Relatórios diários
// -------------------------
export const jobRelatoriosDiarios = functions.pubsub
  .topic("jobRelatoriosDiarios") // cria um tópico Pub/Sub chamado "jobRelatoriosDiarios"
  .onPublish(async (message) => {
    const relatorio = await gerarRelatorios();
    console.log("Relatório diário:", relatorio);
  });

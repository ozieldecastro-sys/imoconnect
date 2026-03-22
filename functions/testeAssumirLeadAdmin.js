/**
 * Script local para testar a função de assumir lead
 * Executa direto no Node.js usando Firebase Admin
 */

const admin = require("firebase-admin");
const path = require("path");

// 🔐 Caminho da chave Admin (já existente no projeto)
const serviceAccount = require(path.resolve(
  __dirname,
  "./imoconnect-9d71c-firebase-adminsdk-fbsvc-d509c17099.json"
));

// 🔥 Inicializa Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// =======================
// CONFIGURAÇÕES DE TESTE
// =======================

// 👉 ID DO LEAD NO FIRESTORE (copie de um documento real)
const leadId = "leadTeste001";

// 👉 ID do corretor que está tentando assumir
const corretorId = "corretor_teste_001";

// Exclusividade: 24h em ms
const EXCLUSIVIDADE_MS = 24 * 60 * 60 * 1000;

async function assumirLead() {
  try {
    console.log("🔍 Buscando lead:", leadId);

    const leadRef = db.collection("leads").doc(leadId);
    const leadSnap = await leadRef.get();

    if (!leadSnap.exists) {
      console.log("❌ Lead não encontrado.");
      return;
    }

    const lead = leadSnap.data();
    const agora = Date.now();

    // =========================
    // REGRA 1: Lead em atendimento
    // =========================
    if (
      lead.status === "Em atendimento" &&
      lead.exclusividadeAte &&
      lead.exclusividadeAte.toMillis() > agora
    ) {
      console.log("⛔ Lead já está em atendimento dentro da exclusividade.");
      return;
    }

    // =========================
    // REGRA 2: Quarentena
    // =========================
    if (
      lead.corretoresAtendidos &&
      Array.isArray(lead.corretoresAtendidos) &&
      lead.corretoresAtendidos.includes(corretorId)
    ) {
      console.log("⛔ Este corretor já atendeu esse lead anteriormente.");
      return;
    }

    // =========================
    // ASSUMIR LEAD
    // =========================
    const exclusividadeAte = admin.firestore.Timestamp.fromMillis(
      agora + EXCLUSIVIDADE_MS
    );

    await leadRef.update({
      status: "Em atendimento",
      corretorAtual: corretorId,
      exclusividadeInicio: admin.firestore.Timestamp.fromMillis(agora),
      exclusividadeAte: exclusividadeAte,
      corretoresAtendidos: admin.firestore.FieldValue.arrayUnion(corretorId),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log("✅ Lead assumido com sucesso!");
    console.log("👤 Corretor:", corretorId);
    console.log("⏳ Exclusividade até:", exclusividadeAte.toDate());
  } catch (error) {
    console.error("🔥 Erro ao assumir lead:", error);
  }
}

// EXECUTA
assumirLead();

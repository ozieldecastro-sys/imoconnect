const admin = require("firebase-admin");

// 🔥 Conecta no Auth Emulator
process.env.FIREBASE_AUTH_EMULATOR_HOST = "127.0.0.1:9100";

admin.initializeApp({
  projectId: "imoconnect-9d71c",
});

async function run() {
  const uid = "yC6Z6wfqpX8jsPlKBA4bQfHWLW39";

  await admin.auth().setCustomUserClaims(uid, {
    admin: true,
  });

  console.log("✅ Claim admin definida com sucesso!");
}

run().catch((err) => {
  console.error("❌ Erro ao definir claim:", err);
});

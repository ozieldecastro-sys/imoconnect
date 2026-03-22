const admin = require("firebase-admin");

process.env.FIREBASE_AUTH_EMULATOR_HOST = "localhost:9100";

admin.initializeApp({
  projectId: "imoconnect-9d71c",
});

async function setAdmin() {
  const uid = "uM7MQMOKoqd0bSa0k16MaZQIqw1p";

  try {
    await admin.auth().setCustomUserClaims(uid, { admin: true });
    console.log("✅ Usuário definido como ADMIN no EMULADOR!");
    process.exit();
  } catch (error) {
    console.error("❌ Erro:", error);
    process.exit(1);
  }
}

setAdmin();

import * as admin from "firebase-admin";

// Inicialização segura (evita múltiplas instâncias)
if (!admin.apps.length) {
  admin.initializeApp();
}

// Instância do Firestore
const db = admin.firestore();

// (Opcional, mas recomendado)
// Garante consistência de timestamps
db.settings({
  ignoreUndefinedProperties: true,
});

export { admin, db };
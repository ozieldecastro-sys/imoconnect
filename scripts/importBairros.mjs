import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import fs from "fs";

// Importando a chave de forma dinâmica
const serviceAccount = JSON.parse(fs.readFileSync("./serviceAccountKey.json", "utf-8"));

// Inicializa Firebase Admin
initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

// Lê o JSON de bairros
const bairros = JSON.parse(fs.readFileSync("./bairros.json", "utf-8"));

async function importarBairros() {
  for (const bairro of bairros) {
    const docRef = db.collection("bairros").doc();
    await docRef.set(bairro);
    console.log(`Importado: ${bairro.cidade} - ${bairro.nome}`);
  }
  console.log("Todos os bairros foram importados com sucesso!");
}

importarBairros().catch(console.error);

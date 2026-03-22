// src/firebase.ts

import { initializeApp } from "firebase/app";
import { getFunctions, httpsCallable } from "firebase/functions";
import { getFirestore } from "firebase/firestore";

/* =====================================================
   🔐 CONFIGURAÇÃO OFICIAL DO PROJETO
===================================================== */

const firebaseConfig = {
  apiKey: "AIzaSyBmWT1U7EDook02hspLHKIeIUvxqN6rvJg",
  authDomain: "imoconnect-9d71c.firebaseapp.com",
  projectId: "imoconnect-9d71c",
  storageBucket: "imoconnect-9d71c.firebasestorage.app",
  messagingSenderId: "808329915206",
  appId: "1:808329915206:web:f5a44a26cd0d30e4651347",
};

/* =====================================================
   🚀 INICIALIZAÇÃO DO APP
===================================================== */

const app = initializeApp(firebaseConfig);

/* =====================================================
   🔥 SERVIÇOS FIREBASE
===================================================== */

export const db = getFirestore(app);

// Região das Cloud Functions
export const functions = getFunctions(app, "us-central1");

/* =====================================================
   📞 CALLABLE FUNCTIONS PADRONIZADAS
===================================================== */

// Criar lead (formulário público)
export const criarLeadCall = httpsCallable(
  functions,
  "criarLead"
);

// Corretor assumir lead
export const assumirInteresseCall = httpsCallable(
  functions,
  "assumirInteresse"
);

// Adicionar crédito na carteira do corretor
export const adicionarCreditoCall = httpsCallable(
  functions,
  "adicionarCredito"
);

// Obter extrato financeiro
export const obterExtratoFinanceiroCall = httpsCallable(
  functions,
  "obterExtratoFinanceiro"
);
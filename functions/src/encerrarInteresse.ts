import { onCall, HttpsError } from "firebase-functions/v2/https";

/*
=====================================================
FUNÇÃO DESCONTINUADA
=====================================================

Este endpoint fazia parte da arquitetura antiga
baseada na coleção "interesses".

O sistema atual utiliza apenas a coleção "leads"
com controle de exclusividade via:

- corretorId
- claimedAt
- expiresAt
- quarentena

Esta função foi desativada para evitar uso acidental.

=====================================================
*/

export const encerrarInteresse = onCall(
  { region: "us-central1" },
  async () => {
    throw new HttpsError(
      "failed-precondition",
      "Função encerrarInteresse desativada na nova arquitetura do ImoConnect."
    );
  }
);
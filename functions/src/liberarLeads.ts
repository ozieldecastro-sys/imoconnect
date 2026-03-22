import { onCall, HttpsError } from "firebase-functions/v2/https";

/*
=====================================================
FUNÇÃO DESCONTINUADA
=====================================================

Esta função fazia parte da arquitetura antiga
baseada em lockUntil e corretorAtual.

O sistema atual utiliza:

- corretorId
- claimedAt
- expiresAt
- quarentena
- quarentenaEndsAt

Fluxo atual:

expirarLeads.ts
→ envia para quarentena

liberarLeadsQuarentena.ts
→ retorna ao pool

Esta função foi desativada para evitar uso acidental.
=====================================================
*/

export const liberarLeads = onCall(
  { region: "us-central1" },
  async () => {
    throw new HttpsError(
      "failed-precondition",
      "Função liberarLeads desativada na nova arquitetura do ImoConnect."
    );
  }
);
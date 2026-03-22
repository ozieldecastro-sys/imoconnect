import { onSchedule } from "firebase-functions/v2/scheduler";

/*
=====================================================
FUNÇÃO DESCONTINUADA
=====================================================

Esta função fazia parte da arquitetura antiga do
ImoConnect que utilizava o campo:

- exclusivoAte

Na arquitetura atual utilizamos:

- expiresAt
- quarentenaAt
- quarentenaEndsAt

Fluxo oficial do sistema:

em_atendimento
→ expirarLeads.ts
→ status: quarentena
→ liberarLeadsQuarentena.ts
→ status: disponivel

Esta função foi desativada para evitar conflito
com a nova arquitetura.
=====================================================
*/

export const liberarLeadsExpirados = onSchedule(
  {
    schedule: "every 24 hours",
    region: "us-central1",
  },
  async () => {
    console.log("Função liberarLeadsExpirados desativada.");
  }
);
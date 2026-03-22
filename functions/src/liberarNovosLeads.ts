import { onSchedule } from "firebase-functions/v2/scheduler";

/*
=====================================================
FUNÇÃO DESCONTINUADA
=====================================================

Esta função liberava leads com status "novo".

Na arquitetura atual do ImoConnect o lead já nasce
diretamente como:

status: "disponivel"

Fluxo oficial:

disponivel
→ em_atendimento
→ quarentena
→ disponivel

Portanto esta função não é mais necessária.
=====================================================
*/

export const liberarNovosLeads = onSchedule(
  {
    schedule: "every 24 hours",
    region: "us-central1",
  },
  async () => {
    console.log("Função liberarNovosLeads desativada.");
  }
);
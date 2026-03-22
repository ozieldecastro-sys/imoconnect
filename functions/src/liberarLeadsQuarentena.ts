import { onSchedule } from "firebase-functions/v2/scheduler";

/*
=====================================================
FUNÇÃO DESCONTINUADA — NÃO UTILIZAR
=====================================================

A função liberarLeadsQuarentena fazia a liberação direta
dos leads da quarentena para o pool de distribuição.

Arquitetura ANTIGA:
quarentena
↓
liberarLeadsQuarentena
↓
disponivel

A arquitetura atual do ImoConnect evoluiu para um fluxo
mais seguro de revalidação do interesse do cliente.

Arquitetura ATUAL:
quarentena
↓
processarQuarentena.ts
↓
aguardando_enquete
↓
(envio de enquete / revalidação do lead)
↓
disponivel

Esta função foi mantida apenas para:

1. evitar erro de deploy caso ainda esteja exportada
2. documentar a mudança arquitetural
3. impedir execução acidental da lógica antiga

⚠️ IMPORTANTE
Esta função NÃO deve modificar dados no Firestore.

A lógica correta de saída da quarentena está em:

processarQuarentena.ts
=====================================================
*/

export const liberarLeadsQuarentena = onSchedule(
  {
    schedule: "every 24 hours",
    region: "us-central1",
  },
  async () => {
    console.log("====================================");
    console.log("⚠️ FUNÇÃO DESATIVADA");
    console.log("liberarLeadsQuarentena não é mais utilizada.");
    console.log("Fluxo atual controlado por processarQuarentena.ts");
    console.log("Nenhuma ação foi executada.");
    console.log("====================================");
  }
);
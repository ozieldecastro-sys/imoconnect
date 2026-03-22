import { db, admin } from "../firebase";

type StatusFinal =
  | "vendido"
  | "negociando"
  | "proposta_futura"
  | "nao_interessado";

function calcularLock(status: StatusFinal) {
  const agora = admin.firestore.Timestamp.now();

  if (status === "negociando") {
    return admin.firestore.Timestamp.fromMillis(
      agora.toMillis() + 48 * 60 * 60 * 1000 // 48h
    );
  }

  if (status === "proposta_futura") {
    return admin.firestore.Timestamp.fromMillis(
      agora.toMillis() + 7 * 24 * 60 * 60 * 1000 // 7 dias
    );
  }

  // vendido ou não interessado → não volta
  return null;
}

export async function finalizarAtendimento(
  leadId: string,
  corretorId: string,
  statusFinal: StatusFinal
) {
  const ref = db.collection("leads").doc(leadId);
  const lockUntil = calcularLock(statusFinal);
  const agora = admin.firestore.Timestamp.now();

  // Atualiza o lead
  await ref.update({
    status: statusFinal,
    corretorAtual: null,
    lockUntil,
    atualizadoEm: agora,
    // histórico como array de eventos
    historico: admin.firestore.FieldValue.arrayUnion({
      finalizadoPor: corretorId,
      finalizadoEm: agora,
      statusFinal,
    }),
  });
}

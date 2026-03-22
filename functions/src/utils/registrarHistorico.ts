import { admin, db } from "../firebase";

/**
 * Tipos de ações possíveis no histórico do lead
 * (base para métricas, auditoria e monetização)
 */
export type TipoAcaoHistorico =
  | "ASSUMIDO_POR_CORRETOR"
  | "LIBERADO_POR_EXPIRACAO"
  | "MARCADO_COMO_VENDIDO"
  | "STATUS_ALTERADO_PELO_SISTEMA";

/**
 * Registra uma ação no histórico do lead
 * REGRA: histórico nunca é editado nem apagado
 */
interface RegistrarHistoricoParams {
  leadId: string;
  tipoAcao: TipoAcaoHistorico;
  statusAnterior?: string | null;
  statusNovo?: string | null;
  corretorId?: string | null;
  origem: "DASHBOARD" | "SCHEDULER" | "SISTEMA";
  detalhes?: Record<string, any>;
}

export async function registrarHistorico({
  leadId,
  tipoAcao,
  statusAnterior = null,
  statusNovo = null,
  corretorId = null,
  origem,
  detalhes = {},
}: RegistrarHistoricoParams): Promise<void> {
  const historicoRef = db
    .collection("leads")
    .doc(leadId)
    .collection("historico");

  await historicoRef.add({
    leadId, // redundância estratégica para métricas
    tipoAcao,
    statusAnterior,
    statusNovo,
    corretorId,
    origem,
    detalhes,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
  });
}

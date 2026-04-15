import type { CSSProperties } from "react";
import type { Lead, Corretor } from "./dashboardUtils";
import {
  formatMoeda,
  mascararNome,
  mascararTelefone,
  podeVerCompleto,
  getNivelStyles,
  getStatusLabel,
  getStatusStyles,
  getFaixaValor,
  getTipoInteresse,
  formatTimeAgoFromLead,
  formatCountdown,
  getPrecoPorPlano,
  getPrecoOriginalPorNivel,
  getPlano,
  getTextoComissaoPorNivel,
  calcularComissaoProvavel,
  calcularRoiPotencial,
  calcularValorEstimado,
  getInformacoesCliente,
} from "./dashboardUtils";

type LeadCardProps = {
  lead: Lead;
  corretor: Corretor | null;
  onAssumir: (leadId: string) => void;
  onEnviarEnquete: (leadId: string) => void;
};

function getUrgenciaTexto(prazo?: string) {
  const valor = String(prazo || "").toLowerCase();

  if (valor === "imediato") return "Cliente com urgência imediata";
  if (valor === "30_dias") return "Cliente quer avançar em até 30 dias";
  if (valor === "60_dias") return "Cliente planejando curto prazo";
  if (valor === "90_dias") return "Cliente em fase de planejamento";
  if (valor === "pesquisando") return "Cliente em fase de pesquisa";

  return "";
}

function getNivelBarra(nivel?: string) {
  switch ((nivel || "").toLowerCase()) {
    case "oportunidade":
      return 34;
    case "qualificado":
    case "quente":
      return 68;
    case "prioritario":
    case "prioritário":
    case "pronto":
      return 100;
    default:
      return 34;
  }
}

function getResumoOperacionalPorPlano(plano: string) {
  if (plano === "PRO") {
    return {
      exclusividade: "96h",
      capacidade: "até 10 ativos",
      texto: "Mais tempo e mais capacidade para conduzir o atendimento.",
    };
  }

  return {
    exclusividade: "48h",
    capacidade: "1 ativo",
    texto: "Modelo de entrada com operação mais enxuta.",
  };
}

export default function LeadCard({
  lead,
  corretor,
  onAssumir,
  onEnviarEnquete,
}: LeadCardProps) {
  const nivel = getNivelStyles(lead.nivelLead);
  const status = getStatusStyles(lead.status);
  const podeVer = podeVerCompleto(lead, corretor);

  const plano = getPlano(corretor);
  const precoPlano = getPrecoPorPlano(lead.nivelLead, plano);
  const precoOriginal = getPrecoOriginalPorNivel(lead.nivelLead);
  const economiaPro =
    precoOriginal !== null && precoPlano !== null ? precoOriginal - precoPlano : 0;

  const comissaoProvavel = calcularComissaoProvavel(lead);
  const roiPotencial = calcularRoiPotencial(lead, plano);
  const valorEstimado = calcularValorEstimado(lead);
  const informacoesCliente = getInformacoesCliente(lead);
  const mostrarDadosFinanceiros = plano === "PRO";

  const urgenciaTexto = getUrgenciaTexto(lead.prazo);
  const nivelBarra = getNivelBarra(lead.nivelLead);
  const resumoPlano = getResumoOperacionalPorPlano(plano);

  const styles = {
    card: {
      background: "linear-gradient(180deg, #ffffff 0%, #fbfdff 100%)",
      borderRadius: 18,
      padding: 14,
      boxShadow: "0 10px 24px rgba(15, 23, 42, 0.06)",
      border: "1px solid #e8eef6",
      display: "flex",
      flexDirection: "column",
      gap: 10,
      position: "relative",
      overflow: "hidden",
    } as CSSProperties,

    glow: {
      position: "absolute",
      top: -52,
      right: -52,
      width: 110,
      height: 110,
      borderRadius: "50%",
      background: "rgba(59,130,246,0.04)",
      filter: "blur(16px)",
      pointerEvents: "none",
    } as CSSProperties,

    topRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 8,
      flexWrap: "wrap",
      position: "relative",
      zIndex: 1,
    } as CSSProperties,

    badgeRow: {
      display: "flex",
      gap: 6,
      flexWrap: "wrap",
      alignItems: "center",
    } as CSSProperties,

    badge: {
      padding: "5px 10px",
      borderRadius: 999,
      fontSize: 11,
      fontWeight: 800,
      whiteSpace: "nowrap",
      letterSpacing: "0.01em",
      lineHeight: 1,
    } as CSSProperties,

    identityBlock: {
      display: "grid",
      gap: 2,
      position: "relative",
      zIndex: 1,
    } as CSSProperties,

    nome: {
      fontSize: 17,
      fontWeight: 900,
      color: "#0f172a",
      lineHeight: 1.05,
      letterSpacing: "-0.03em",
      margin: 0,
    } as CSSProperties,

    subtitle: {
      fontSize: 11,
      color: "#64748b",
      fontWeight: 600,
      lineHeight: 1.3,
      display: "flex",
      gap: 6,
      flexWrap: "wrap",
      alignItems: "center",
    } as CSSProperties,

    divider: {
      height: 1,
      background:
        "linear-gradient(90deg, #e2e8f0 0%, rgba(226,232,240,0.18) 100%)",
      margin: "2px 0 0 0",
    } as CSSProperties,

    nivelWrap: {
      display: "grid",
      gap: 5,
      position: "relative",
      zIndex: 1,
    } as CSSProperties,

    nivelHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 8,
    } as CSSProperties,

    nivelText: {
      fontSize: 10,
      color: "#64748b",
      fontWeight: 800,
      letterSpacing: "0.01em",
      lineHeight: 1.2,
    } as CSSProperties,

    barraBg: {
      width: "100%",
      height: 7,
      borderRadius: 999,
      backgroundColor: "#edf2f7",
      overflow: "hidden",
    } as CSSProperties,

    barraFill: {
      height: "100%",
      borderRadius: 999,
      background:
        "linear-gradient(90deg, #60a5fa 0%, #f59e0b 50%, #ef4444 100%)",
      transition: "width 0.3s ease",
      boxShadow: "0 2px 8px rgba(245, 158, 11, 0.14)",
    } as CSSProperties,

    metaGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 8,
    } as CSSProperties,

    metaCard: {
      backgroundColor: "#f8fbff",
      border: "1px solid #e5edf7",
      borderRadius: 11,
      padding: "8px 10px",
      display: "grid",
      gap: 2,
    } as CSSProperties,

    metaLabel: {
      fontSize: 9,
      color: "#64748b",
      fontWeight: 800,
      textTransform: "uppercase",
      letterSpacing: "0.08em",
      lineHeight: 1.1,
    } as CSSProperties,

    metaValue: {
      fontSize: 12,
      color: "#0f172a",
      fontWeight: 700,
      lineHeight: 1.2,
      wordBreak: "break-word",
    } as CSSProperties,

    urgenciaBox: {
      background: "linear-gradient(135deg, #fff7ed 0%, #ffffff 100%)",
      border: "1px solid #fdba74",
      color: "#9a3412",
      borderRadius: 11,
      padding: "8px 10px",
      fontSize: 11,
      fontWeight: 800,
      lineHeight: 1.25,
      boxShadow: "0 4px 10px rgba(249, 115, 22, 0.05)",
      position: "relative",
      zIndex: 1,
    } as CSSProperties,

    destaqueGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 8,
    } as CSSProperties,

    destaqueCard: {
      borderRadius: 12,
      padding: "9px 10px",
      minHeight: 66,
      display: "grid",
      gap: 4,
      alignContent: "center",
      boxShadow: "0 4px 12px rgba(15, 23, 42, 0.03)",
    } as CSSProperties,

    destaqueLabel: {
      fontSize: 10,
      fontWeight: 800,
      lineHeight: 1.15,
    } as CSSProperties,

    destaqueValue: {
      fontSize: 20,
      fontWeight: 900,
      letterSpacing: "-0.04em",
      lineHeight: 1,
      marginTop: 1,
    } as CSSProperties,

    destaqueSub: {
      fontSize: 10,
      fontWeight: 700,
      lineHeight: 1.15,
      marginTop: 0,
    } as CSSProperties,

    lockedBox: {
      fontSize: 11,
      color: "#7c3aed",
      fontWeight: 900,
      lineHeight: 1.25,
      marginTop: 2,
    } as CSSProperties,

    slimInfoCard: {
      backgroundColor: "#ffffff",
      border: "1px solid #e5edf7",
      borderRadius: 12,
      padding: "9px 11px",
      display: "grid",
      gap: 4,
      position: "relative",
      zIndex: 1,
    } as CSSProperties,

    infoTitle: {
      fontSize: 9,
      color: "#475569",
      fontWeight: 900,
      textTransform: "uppercase",
      letterSpacing: "0.08em",
      lineHeight: 1.1,
    } as CSSProperties,

    valorEstimadoValue: {
      fontSize: 17,
      fontWeight: 900,
      color: "#0f172a",
      lineHeight: 1,
    } as CSSProperties,

    tagsWrap: {
      display: "flex",
      gap: 6,
      flexWrap: "wrap",
      alignItems: "center",
    } as CSSProperties,

    tag: {
      backgroundColor: "#f8fafc",
      border: "1px solid #dbeafe",
      color: "#1e3a8a",
      borderRadius: 999,
      padding: "5px 8px",
      fontSize: 10,
      fontWeight: 800,
      lineHeight: 1,
    } as CSSProperties,

    emptyInfoText: {
      fontSize: 11,
      color: "#64748b",
      fontWeight: 600,
      lineHeight: 1.25,
    } as CSSProperties,

    proHint: {
      backgroundColor: "#fff7ed",
      border: "1px solid #fdba74",
      color: "#9a3412",
      borderRadius: 11,
      padding: "8px 10px",
      fontSize: 10,
      fontWeight: 800,
      lineHeight: 1.35,
      position: "relative",
      zIndex: 1,
    } as CSSProperties,

    precoBox: {
      background: "linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)",
      borderRadius: 13,
      padding: "10px 11px",
      border: "1px solid #e2e8f0",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 10,
      flexWrap: "wrap",
      position: "relative",
      zIndex: 1,
    } as CSSProperties,

    precoInfo: {
      display: "grid",
      gap: 2,
    } as CSSProperties,

    precoLabel: {
      fontSize: 9,
      color: "#64748b",
      fontWeight: 900,
      textTransform: "uppercase",
      letterSpacing: "0.08em",
      lineHeight: 1.1,
    } as CSSProperties,

    precoAntigo: {
      fontSize: 11,
      textDecoration: "line-through",
      color: "#94a3b8",
      fontWeight: 800,
      lineHeight: 1.1,
    } as CSSProperties,

    preco: {
      fontSize: 24,
      fontWeight: 900,
      color: "#0f172a",
      lineHeight: 1,
      letterSpacing: "-0.04em",
    } as CSSProperties,

    precoSub: {
      fontSize: 10,
      color: "#64748b",
      marginTop: 2,
      fontWeight: 700,
      lineHeight: 1.2,
    } as CSSProperties,

    button: {
      padding: "12px 18px",
      borderRadius: 12,
      border: "none",
      background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
      color: "#fff",
      fontWeight: 900,
      cursor: "pointer",
      fontSize: 13,
      boxShadow: "0 12px 24px rgba(37, 99, 235, 0.22)",
      minWidth: 148,
      lineHeight: 1,
      letterSpacing: "0.01em",
    } as CSSProperties,

    buttonSecondary: {
      padding: "10px 14px",
      borderRadius: 11,
      border: "1px solid #cbd5f5",
      backgroundColor: "#eef2ff",
      color: "#3730a3",
      fontWeight: 900,
      cursor: "pointer",
      fontSize: 12,
      lineHeight: 1,
    } as CSSProperties,
  };

  return (
    <div style={styles.card}>
      <div style={styles.glow} />

      <div style={styles.topRow}>
        <div style={styles.badgeRow}>
          <span
            style={{
              ...styles.badge,
              backgroundColor: nivel.bg,
              color: nivel.color,
              border: nivel.border,
            }}
          >
            {nivel.label}
          </span>

          <span
            style={{
              ...styles.badge,
              backgroundColor: status.bg,
              color: status.color,
              border: status.border,
            }}
          >
            {getStatusLabel(lead.status)}
          </span>
        </div>
      </div>

      <div style={styles.identityBlock}>
        <div style={styles.nome}>
          {podeVer ? lead.nome : mascararNome(lead.nome)}
        </div>

        <div style={styles.subtitle}>
          <span>{podeVer ? lead.telefone : mascararTelefone(lead.telefone)}</span>
          <span>•</span>
          <span>
            {lead.bairro || "—"} - {lead.cidade || "—"}
          </span>
        </div>
      </div>

      <div style={styles.divider} />

      <div style={styles.nivelWrap}>
        <div style={styles.nivelHeader}>
          <span style={styles.nivelText}>Nível de aquecimento</span>
          <span style={styles.nivelText}>{nivel.label}</span>
        </div>

        <div style={styles.barraBg}>
          <div
            style={{
              ...styles.barraFill,
              width: `${nivelBarra}%`,
            }}
          />
        </div>
      </div>

      <div style={styles.metaGrid}>
        <div style={styles.metaCard}>
          <div style={styles.metaLabel}>Tipo de interesse</div>
          <div style={styles.metaValue}>{getTipoInteresse(lead)}</div>
        </div>

        <div style={styles.metaCard}>
          <div style={styles.metaLabel}>Faixa de valor</div>
          <div style={styles.metaValue}>{getFaixaValor(lead)}</div>
        </div>

        <div style={styles.metaCard}>
          <div style={styles.metaLabel}>Entrou no sistema</div>
          <div style={styles.metaValue}>{formatTimeAgoFromLead(lead)}</div>
        </div>

        <div style={styles.metaCard}>
          <div style={styles.metaLabel}>Exclusividade</div>
          <div style={styles.metaValue}>
            {lead.expiresAt ? formatCountdown(lead.expiresAt) : "—"}
          </div>
        </div>
      </div>

      {urgenciaTexto && <div style={styles.urgenciaBox}>🔥 {urgenciaTexto}</div>}

      <div style={styles.slimInfoCard}>
        <div style={styles.infoTitle}>Resumo do seu plano</div>
        <div style={styles.tagsWrap}>
          <span style={styles.tag}>Exclusividade: {resumoPlano.exclusividade}</span>
          <span style={styles.tag}>Capacidade: {resumoPlano.capacidade}</span>
        </div>
        <div style={styles.emptyInfoText}>{resumoPlano.texto}</div>
      </div>

      <div style={styles.destaqueGrid}>
        <div
          style={{
            ...styles.destaqueCard,
            background: "linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)",
            border: "1px solid #bbf7d0",
          }}
        >
          <div style={{ ...styles.destaqueLabel, color: "#166534" }}>
            💰 {getTextoComissaoPorNivel(lead.nivelLead)}
          </div>

          {mostrarDadosFinanceiros ? (
            <>
              <div style={{ ...styles.destaqueValue, color: "#16a34a" }}>
                {formatMoeda(comissaoProvavel)}
              </div>
              <div style={{ ...styles.destaqueSub, color: "#166534" }}>
                ganho potencial
              </div>
            </>
          ) : (
            <div style={styles.lockedBox}>🔒 Disponível no PRO</div>
          )}
        </div>

        <div
          style={{
            ...styles.destaqueCard,
            background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)",
            border: "1px solid #bfdbfe",
          }}
        >
          <div style={{ ...styles.destaqueLabel, color: "#1d4ed8" }}>
            📈 Retorno potencial
          </div>

          {mostrarDadosFinanceiros ? (
            <>
              <div style={{ ...styles.destaqueValue, color: "#2563eb" }}>
                {roiPotencial > 0 ? `${roiPotencial.toFixed(0)}x` : "—"}
              </div>
              <div style={{ ...styles.destaqueSub, color: "#1d4ed8" }}>
                sobre o investimento
              </div>
            </>
          ) : (
            <div style={styles.lockedBox}>🔒 Disponível no PRO</div>
          )}
        </div>
      </div>

      <div style={styles.slimInfoCard}>
        <div style={styles.infoTitle}>Valor estimado do imóvel</div>
        <div style={styles.valorEstimadoValue}>
          {valorEstimado > 0 ? formatMoeda(valorEstimado) : "—"}
        </div>
      </div>

      <div style={styles.slimInfoCard}>
        <div style={styles.infoTitle}>Informações do cliente</div>

        {informacoesCliente.length > 0 ? (
          <div style={styles.tagsWrap}>
            {informacoesCliente.map((item, index) => (
              <span key={`${item}-${index}`} style={styles.tag}>
                {item}
              </span>
            ))}
          </div>
        ) : (
          <div style={styles.emptyInfoText}>
            Informações complementares disponíveis após assumir.
          </div>
        )}
      </div>

      {plano === "BASIC" && (
        <div style={styles.proHint}>
          Com o PRO você ganha 96h de exclusividade, pode manter até 10 leads ativos
          e melhora sua condição comercial por lead.
        </div>
      )}

      <div style={styles.precoBox}>
        <div style={styles.precoInfo}>
          <div style={styles.precoLabel}>Investimento para assumir este lead</div>

          {precoOriginal !== null && (
            <div style={styles.precoAntigo}>{formatMoeda(precoOriginal)}</div>
          )}

          <div style={styles.preco}>{formatMoeda(precoPlano)}</div>

          <div style={styles.precoSub}>
            {plano === "PRO"
              ? "Valor com benefício PRO"
              : `Economia no PRO: ${formatMoeda(economiaPro > 0 ? economiaPro : 0)}`}
          </div>
        </div>

        {lead.status === "disponivel" && (
          <button style={styles.button} onClick={() => onAssumir(lead.id)}>
            Assumir agora
          </button>
        )}
      </div>

      {lead.status === "aguardando_enquete" && (
        <button
          style={styles.buttonSecondary}
          onClick={() => onEnviarEnquete(lead.id)}
        >
          Enviar Enquete
        </button>
      )}
    </div>
  );
}
import type { CSSProperties } from "react";

type UpgradeBannerProps = {
  visivel: boolean;
  economiaTotal: number;
  onAbrirUpgrade: () => void;
  formatMoeda: (valor?: number | string) => string;
};

export default function UpgradeBanner({
  visivel,
  economiaTotal,
  onAbrirUpgrade,
  formatMoeda,
}: UpgradeBannerProps) {
  if (!visivel) return null;

  const styles = {
    banner: {
      background: "linear-gradient(135deg, #fff7ed 0%, #ffffff 100%)",
      border: "1px solid #fdba74",
      borderRadius: 18,
      padding: 18,
      marginBottom: 18,
      boxShadow: "0 12px 28px rgba(15, 23, 42, 0.05)",
    } as CSSProperties,

    title: {
      margin: 0,
      fontSize: 20,
      fontWeight: 800,
      color: "#9a3412",
      letterSpacing: "-0.02em",
    } as CSSProperties,

    text: {
      margin: "10px 0 0 0",
      color: "#7c2d12",
      fontSize: 14,
      lineHeight: 1.7,
    } as CSSProperties,

    subgrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
      gap: 10,
      marginTop: 14,
    } as CSSProperties,

    pill: {
      borderRadius: 14,
      backgroundColor: "#fffaf5",
      border: "1px solid #fed7aa",
      padding: "10px 12px",
      color: "#9a3412",
      fontSize: 12,
      fontWeight: 700,
      lineHeight: 1.45,
    } as CSSProperties,

    button: {
      marginTop: 14,
      padding: "11px 14px",
      borderRadius: 12,
      border: "none",
      backgroundColor: "#ea580c",
      color: "#ffffff",
      fontWeight: 700,
      cursor: "pointer",
      fontSize: 14,
    } as CSSProperties,
  };

  return (
    <div style={styles.banner}>
      <h3 style={styles.title}>Amplie sua operação com o Plano PRO</h3>

      <p style={styles.text}>
        No BASIC você já acompanha o mercado, mas opera com mais restrições.
        Com o PRO, você ganha <strong>96 horas de exclusividade</strong>, pode
        manter <strong>até 10 leads ativos ao mesmo tempo</strong> e ainda melhora
        sua condição comercial por lead. Economia potencial nesta vitrine:{" "}
        <strong>{formatMoeda(economiaTotal)}</strong>.
      </p>

      <div style={styles.subgrid}>
        <div style={styles.pill}>BASIC: 48h e até 1 lead ativo</div>
        <div style={styles.pill}>PRO: 96h e até 10 leads ativos</div>
        <div style={styles.pill}>Mais tempo para conduzir e converter</div>
      </div>

      <button style={styles.button} onClick={onAbrirUpgrade}>
        Ver vantagens do Plano PRO
      </button>
    </div>
  );
}
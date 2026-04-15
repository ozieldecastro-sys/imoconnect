import type { CSSProperties } from "react";
import type { Corretor } from "./dashboardUtils";
import { getPlano, isAdmin } from "./dashboardUtils";

type DashboardHeroProps = {
  corretor: Corretor | null;
  onAdicionarSaldo: () => void;
  onAbrirMeusLeads: () => void;
  onAbrirExtrato: () => void;
  onLogout: () => void;
};

export default function DashboardHero({
  corretor,
  onAdicionarSaldo,
  onAbrirMeusLeads,
  onAbrirExtrato,
  onLogout,
}: DashboardHeroProps) {
  const styles = {
    hero: {
      background:
        "linear-gradient(135deg, #0f172a 0%, #1e3a8a 55%, #2563eb 100%)",
      color: "#ffffff",
      borderRadius: 24,
      padding: 28,
      boxShadow: "0 20px 50px rgba(15, 23, 42, 0.22)",
      marginBottom: 22,
      overflow: "hidden",
      position: "relative",
    } as CSSProperties,
    heroGlow: {
      position: "absolute",
      width: 220,
      height: 220,
      borderRadius: "50%",
      background: "rgba(255,255,255,0.10)",
      top: -60,
      right: -30,
      filter: "blur(8px)",
    } as CSSProperties,
    heroGrid: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: 18,
      flexWrap: "wrap",
      position: "relative",
      zIndex: 2,
    } as CSSProperties,
    heroTitle: {
      margin: 0,
      fontSize: 30,
      lineHeight: 1.1,
      fontWeight: 800,
      letterSpacing: "-0.02em",
    } as CSSProperties,
    heroSubtitle: {
      margin: "12px 0 0 0",
      color: "rgba(255,255,255,0.82)",
      maxWidth: 680,
      lineHeight: 1.6,
      fontSize: 15,
    } as CSSProperties,
    heroMetaRow: {
      display: "flex",
      gap: 10,
      flexWrap: "wrap",
      marginTop: 18,
    } as CSSProperties,
    heroTag: {
      background: "rgba(255,255,255,0.14)",
      border: "1px solid rgba(255,255,255,0.18)",
      color: "#ffffff",
      padding: "8px 12px",
      borderRadius: 999,
      fontSize: 13,
      fontWeight: 600,
      backdropFilter: "blur(8px)",
    } as CSSProperties,
    heroActions: {
      display: "flex",
      gap: 10,
      flexWrap: "wrap",
      alignItems: "center",
    } as CSSProperties,
    primaryButton: {
      padding: "11px 16px",
      backgroundColor: "#ffffff",
      color: "#0f172a",
      border: "none",
      borderRadius: 12,
      cursor: "pointer",
      fontWeight: 700,
      fontSize: 14,
      boxShadow: "0 10px 24px rgba(15, 23, 42, 0.12)",
    } as CSSProperties,
    secondaryHeroButton: {
      padding: "11px 16px",
      backgroundColor: "rgba(255,255,255,0.14)",
      color: "#ffffff",
      border: "1px solid rgba(255,255,255,0.18)",
      borderRadius: 12,
      cursor: "pointer",
      fontWeight: 700,
      fontSize: 14,
      backdropFilter: "blur(8px)",
    } as CSSProperties,
    dangerHeroButton: {
      padding: "11px 16px",
      backgroundColor: "rgba(239,68,68,0.18)",
      color: "#ffffff",
      border: "1px solid rgba(254,202,202,0.28)",
      borderRadius: 12,
      cursor: "pointer",
      fontWeight: 700,
      fontSize: 14,
      backdropFilter: "blur(8px)",
    } as CSSProperties,
  };

  return (
    <section style={styles.hero}>
      <div style={styles.heroGlow} />

      <div style={styles.heroGrid}>
        <div>
          <h1 style={styles.heroTitle}>ImoConnect • Dashboard Comercial</h1>

          <p style={styles.heroSubtitle}>
            Painel de leads com foco em velocidade comercial, decisão mais clara
            e melhor aproveitamento das oportunidades dentro da plataforma.
          </p>

          {corretor && (
            <div style={styles.heroMetaRow}>
              <span style={styles.heroTag}>Corretor: {corretor.nome}</span>
              <span style={styles.heroTag}>Plano: {getPlano(corretor)}</span>
              <span style={styles.heroTag}>
                Perfil: {isAdmin(corretor) ? "ADMIN" : "CORRETOR"}
              </span>
            </div>
          )}
        </div>

        <div style={styles.heroActions}>
          <button onClick={onAdicionarSaldo} style={styles.primaryButton}>
            + Adicionar R$ 200
          </button>

          <button onClick={onAbrirMeusLeads} style={styles.secondaryHeroButton}>
            Meus Leads
          </button>

          <button onClick={onAbrirExtrato} style={styles.secondaryHeroButton}>
            Ver extrato
          </button>

          <button onClick={onLogout} style={styles.dangerHeroButton}>
            Sair
          </button>
        </div>
      </div>
    </section>
  );
}
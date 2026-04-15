import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
} from "react";
import { httpsCallable } from "firebase/functions";
import { functions, obterExtratoFinanceiroCall } from "../firebase";
import { useNavigate } from "react-router-dom";

import DashboardHero from "../components/dashboard/DashboardHero";
import DashboardKPIs from "../components/dashboard/DashboardKPIs";
import LeadCard from "../components/dashboard/LeadCard";
import LeadFilters from "../components/dashboard/LeadFilters";
import UpgradeBanner from "../components/dashboard/UpgradeBanner";

import {
  type Lead,
  type Corretor,
  type ExtratoFinanceiro,
  type EnviarEnqueteResponse,
  type WebhookRespostaResponse,
  formatDateTime,
  formatMoeda,
  getPlano,
} from "../components/dashboard/dashboardUtils";

const URL_ENVIAR_ENQUETE =
  "https://us-central1-imoconnect-9d71c.cloudfunctions.net/enviarEnqueteLead";

const URL_WEBHOOK_RESPONDER =
  "https://us-central1-imoconnect-9d71c.cloudfunctions.net/webhookResponderEnquete";

type PerfilCorretorResponse = {
  sucesso: boolean;
  message: string;
  corretor: Corretor & {
    planoStatus?: string;
    planoIniciadoEm?: any;
    planoExpiraEm?: any;
    planoOrigem?: string;
    ultimoPagamentoPlanoEm?: any;
  };
};

function styles() {
  return {
    page: {
      minHeight: "100vh",
      background:
        "linear-gradient(180deg, #eaf2ff 0%, #f8fafc 220px, #f8fafc 100%)",
      padding: "24px 40px 44px 40px",
      fontFamily:
        'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      boxSizing: "border-box",
    } as CSSProperties,

    wrapper: {
      maxWidth: 1180,
      margin: "0 auto",
      width: "100%",
    } as CSSProperties,

    sectionHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 12,
      flexWrap: "wrap",
      marginBottom: 20,
    } as CSSProperties,

    sectionTitle: {
      margin: 0,
      fontSize: 26,
      color: "#0f172a",
      fontWeight: 900,
      letterSpacing: "-0.03em",
      lineHeight: 1.05,
    } as CSSProperties,

    leadGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
      gap: 22,
      alignItems: "start",
    } as CSSProperties,

    emptyState: {
      backgroundColor: "#ffffff",
      borderRadius: 20,
      padding: 28,
      border: "1px solid #e2e8f0",
      boxShadow: "0 10px 28px rgba(15, 23, 42, 0.05)",
      textAlign: "center",
      color: "#475569",
    } as CSSProperties,

    overlay: {
      position: "fixed",
      inset: 0,
      backgroundColor: "rgba(15, 23, 42, 0.55)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999,
      padding: 20,
      backdropFilter: "blur(4px)",
    } as CSSProperties,

    modal: {
      backgroundColor: "#ffffff",
      width: "100%",
      maxWidth: 920,
      maxHeight: "90vh",
      overflowY: "auto",
      borderRadius: 24,
      padding: 24,
      boxShadow: "0 24px 60px rgba(15, 23, 42, 0.25)",
      border: "1px solid #e2e8f0",
    } as CSSProperties,

    modalTitle: {
      marginTop: 0,
      marginBottom: 16,
      color: "#0f172a",
      fontSize: 24,
      fontWeight: 800,
      letterSpacing: "-0.02em",
    } as CSSProperties,

    modalFooter: {
      marginTop: 20,
      display: "flex",
      gap: 10,
      flexWrap: "wrap",
    } as CSSProperties,

    input: {
      width: "100%",
      padding: 12,
      borderRadius: 12,
      border: "1px solid #cbd5e1",
      backgroundColor: "#ffffff",
      fontSize: 14,
      color: "#0f172a",
      outline: "none",
      boxSizing: "border-box",
    } as CSSProperties,

    textarea: {
      width: "100%",
      padding: 12,
      borderRadius: 12,
      border: "1px solid #cbd5e1",
      resize: "vertical",
      fontSize: 14,
      color: "#0f172a",
      outline: "none",
      boxSizing: "border-box",
    } as CSSProperties,

    infoSection: {
      border: "1px solid #e2e8f0",
      borderRadius: 16,
      padding: 14,
      backgroundColor: "#fcfdff",
    } as CSSProperties,

    infoTitle: {
      margin: "0 0 12px 0",
      color: "#0f172a",
      fontSize: 15,
      fontWeight: 800,
    } as CSSProperties,

    infoGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 10,
    } as CSSProperties,

    infoItem: {
      backgroundColor: "#ffffff",
      border: "1px solid #eef2f7",
      borderRadius: 12,
      padding: "10px 12px",
    } as CSSProperties,

    infoLabel: {
      fontSize: 12,
      color: "#64748b",
      marginBottom: 4,
      fontWeight: 700,
    } as CSSProperties,

    infoValue: {
      fontSize: 14,
      color: "#0f172a",
      fontWeight: 600,
      lineHeight: 1.4,
      wordBreak: "break-word",
    } as CSSProperties,

    kpiCard: {
      backgroundColor: "#ffffff",
      borderRadius: 18,
      padding: 18,
      border: "1px solid #e2e8f0",
      boxShadow: "0 10px 28px rgba(15, 23, 42, 0.05)",
    } as CSSProperties,

    kpiLabel: {
      fontSize: 13,
      color: "#64748b",
      marginBottom: 8,
      fontWeight: 600,
    } as CSSProperties,

    kpiValue: {
      fontSize: 28,
      fontWeight: 800,
      color: "#0f172a",
      lineHeight: 1.1,
    } as CSSProperties,

    actionPrimary: {
      padding: "12px 14px",
      backgroundColor: "#2563eb",
      color: "#ffffff",
      border: "none",
      borderRadius: 12,
      cursor: "pointer",
      fontWeight: 700,
      fontSize: 14,
      boxShadow: "0 10px 20px rgba(37,99,235,0.18)",
    } as CSSProperties,

    actionSuccess: {
      padding: "12px 14px",
      backgroundColor: "#10b981",
      color: "#ffffff",
      border: "none",
      borderRadius: 12,
      cursor: "pointer",
      fontWeight: 700,
      fontSize: 14,
      boxShadow: "0 10px 20px rgba(16,185,129,0.18)",
    } as CSSProperties,

    actionDisabled: {
      padding: "12px 14px",
      backgroundColor: "#e2e8f0",
      color: "#64748b",
      border: "none",
      borderRadius: 12,
      cursor: "not-allowed",
      fontWeight: 700,
      fontSize: 14,
    } as CSSProperties,

    upgradeModal: {
      background:
        "linear-gradient(180deg, #ffffff 0%, #f8fbff 62%, #eef6ff 100%)",
      width: "100%",
      maxWidth: 620,
      borderRadius: 24,
      padding: 22,
      boxShadow: "0 28px 80px rgba(15, 23, 42, 0.28)",
      border: "1px solid #dbeafe",
      position: "relative",
      overflow: "hidden",
    } as CSSProperties,

    upgradeBadge: {
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      padding: "6px 12px",
      borderRadius: 999,
      backgroundColor: "#dbeafe",
      color: "#1d4ed8",
      fontSize: 11,
      fontWeight: 800,
      marginBottom: 12,
    } as CSSProperties,

    upgradeText: {
      color: "#475569",
      lineHeight: 1.65,
      fontSize: 14,
      marginTop: 0,
      marginBottom: 0,
    } as CSSProperties,

    upgradeGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 10,
      marginTop: 16,
    } as CSSProperties,

    upgradeCard: {
      backgroundColor: "#ffffff",
      border: "1px solid #dbeafe",
      borderRadius: 14,
      padding: 12,
      boxShadow: "0 8px 20px rgba(37,99,235,0.05)",
      minHeight: 94,
    } as CSSProperties,

    upgradeCardTitle: {
      margin: 0,
      color: "#0f172a",
      fontSize: 14,
      fontWeight: 800,
      lineHeight: 1.35,
    } as CSSProperties,

    upgradeCardText: {
      margin: "5px 0 0 0",
      color: "#475569",
      fontSize: 12,
      lineHeight: 1.5,
    } as CSSProperties,

    planoCard: {
      marginTop: 18,
      marginBottom: 18,
      background:
        "linear-gradient(135deg, #0f172a 0%, #111827 45%, #1d4ed8 100%)",
      border: "1px solid rgba(96, 165, 250, 0.28)",
      borderRadius: 26,
      padding: 22,
      boxShadow: "0 20px 48px rgba(15, 23, 42, 0.18)",
      position: "relative",
      overflow: "hidden",
    } as CSSProperties,

    planoGlow: {
      position: "absolute",
      right: -40,
      top: -40,
      width: 180,
      height: 180,
      borderRadius: "999px",
      background: "rgba(255,255,255,0.08)",
      filter: "blur(8px)",
      pointerEvents: "none",
    } as CSSProperties,

    planoLinha: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 12,
      flexWrap: "wrap",
      position: "relative",
      zIndex: 1,
    } as CSSProperties,

    planoTag: {
      display: "inline-flex",
      alignItems: "center",
      padding: "7px 12px",
      borderRadius: 999,
      backgroundColor: "rgba(255,255,255,0.14)",
      color: "#dbeafe",
      fontSize: 12,
      fontWeight: 800,
      backdropFilter: "blur(6px)",
    } as CSSProperties,

    planoTitulo: {
      margin: 0,
      color: "#ffffff",
      fontSize: 24,
      fontWeight: 900,
      letterSpacing: "-0.03em",
      lineHeight: 1.05,
    } as CSSProperties,

    planoTexto: {
      margin: "8px 0 0 0",
      color: "#dbeafe",
      fontSize: 14,
      lineHeight: 1.75,
      maxWidth: 760,
    } as CSSProperties,

    planoResumoGrid: {
      marginTop: 18,
      display: "grid",
      gridTemplateColumns: "1.1fr 0.9fr",
      gap: 16,
      position: "relative",
      zIndex: 1,
    } as CSSProperties,

    planoResumoCard: {
      backgroundColor: "rgba(255,255,255,0.08)",
      border: "1px solid rgba(255,255,255,0.12)",
      borderRadius: 18,
      padding: 16,
      backdropFilter: "blur(8px)",
    } as CSSProperties,

    planoResumoLabel: {
      fontSize: 12,
      color: "#bfdbfe",
      marginBottom: 6,
      fontWeight: 800,
      textTransform: "uppercase",
      letterSpacing: "0.08em",
    } as CSSProperties,

    planoResumoValor: {
      fontSize: 18,
      color: "#ffffff",
      fontWeight: 800,
      lineHeight: 1.35,
    } as CSSProperties,

    planoMiniGrid: {
      marginTop: 16,
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
      gap: 12,
      position: "relative",
      zIndex: 1,
    } as CSSProperties,

    planoMiniCard: {
      backgroundColor: "rgba(255,255,255,0.08)",
      border: "1px solid rgba(255,255,255,0.12)",
      borderRadius: 16,
      padding: 14,
      backdropFilter: "blur(8px)",
    } as CSSProperties,

    planoMiniLabel: {
      fontSize: 11,
      color: "#bfdbfe",
      marginBottom: 6,
      fontWeight: 800,
      textTransform: "uppercase",
      letterSpacing: "0.08em",
    } as CSSProperties,

    planoMiniValue: {
      fontSize: 14,
      color: "#ffffff",
      fontWeight: 700,
      lineHeight: 1.45,
    } as CSSProperties,

    planoBeneficiosGrid: {
      marginTop: 16,
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
      gap: 12,
      position: "relative",
      zIndex: 1,
    } as CSSProperties,

    planoBeneficioCard: {
      backgroundColor: "#ffffff",
      border: "1px solid #dbeafe",
      borderRadius: 18,
      padding: 14,
      boxShadow: "0 10px 24px rgba(15, 23, 42, 0.08)",
    } as CSSProperties,

    planoBeneficioTitulo: {
      margin: 0,
      color: "#0f172a",
      fontSize: 14,
      fontWeight: 800,
      lineHeight: 1.35,
    } as CSSProperties,

    planoBeneficioTexto: {
      margin: "6px 0 0 0",
      color: "#475569",
      fontSize: 13,
      lineHeight: 1.6,
    } as CSSProperties,

    planoAviso: {
      marginTop: 14,
      padding: "14px 16px",
      borderRadius: 16,
      backgroundColor: "rgba(255,255,255,0.10)",
      border: "1px solid rgba(255,255,255,0.12)",
      color: "#e2e8f0",
      fontSize: 13,
      lineHeight: 1.7,
      position: "relative",
      zIndex: 1,
    } as CSSProperties,
  };
}

function extrairMensagemErro(error: any): string {
  return (
    error?.message ||
    error?.details ||
    error?.data?.message ||
    error?.data?.error ||
    "Erro ao assumir lead."
  );
}

function isErroLimitePlanoBasic(error: any, corretor: Corretor | null): boolean {
  if (getPlano(corretor) !== "BASIC") return false;

  const mensagem = extrairMensagemErro(error).toLowerCase();

  return (
    mensagem.includes("limite") ||
    mensagem.includes("lead ativo") ||
    mensagem.includes("1 lead") ||
    mensagem.includes("upgrade") ||
    mensagem.includes("plano") ||
    mensagem.includes("basic") ||
    mensagem.includes("básico")
  );
}

function formatarTimestampData(valor: any): string {
  if (!valor) return "—";

  try {
    if (typeof valor?.toDate === "function") {
      return valor.toDate().toLocaleDateString("pt-BR");
    }

    if (typeof valor?.seconds === "number") {
      return new Date(valor.seconds * 1000).toLocaleDateString("pt-BR");
    }

    const data = new Date(valor);
    if (!Number.isNaN(data.getTime())) {
      return data.toLocaleDateString("pt-BR");
    }

    return "—";
  } catch {
    return "—";
  }
}

function calcularDiasRestantes(valor: any): number | null {
  try {
    let dataFinal: Date | null = null;

    if (typeof valor?.toDate === "function") {
      dataFinal = valor.toDate();
    } else if (typeof valor?.seconds === "number") {
      dataFinal = new Date(valor.seconds * 1000);
    } else if (valor) {
      const data = new Date(valor);
      if (!Number.isNaN(data.getTime())) {
        dataFinal = data;
      }
    }

    if (!dataFinal) return null;

    const agora = new Date();
    const diferencaMs = dataFinal.getTime() - agora.getTime();
    const dias = Math.ceil(diferencaMs / (1000 * 60 * 60 * 24));

    return dias;
  } catch {
    return null;
  }
}

function montarCorretorBase(usuarioLocal: any): Corretor {
  return {
    id: usuarioLocal?.id || "",
    nome: usuarioLocal?.nome || "Usuário",
    email: usuarioLocal?.email,
    plano: usuarioLocal?.plano || "BASIC",
    tipoUsuario: usuarioLocal?.tipoUsuario || "corretor",
    tipo: usuarioLocal?.tipo,
    ativo: usuarioLocal?.ativo,
  };
}

function formatarStatusPlano(status: string) {
  const valor = (status || "").toLowerCase();

  if (valor === "ativo") return "Ativo";
  if (valor === "vencido") return "Vencido";
  if (valor === "pendente") return "Pendente";
  if (valor === "cancelado") return "Cancelado";

  return status || "Ativo";
}

function getMensagemRenovacao(diasRestantes: number | null) {
  if (diasRestantes === null) {
    return "Sua operação premium está ativa. Antes do vencimento, a renovação poderá ser validada dentro do fluxo do plano.";
  }

  if (diasRestantes <= 0) {
    return "A vigência do seu plano está no limite. Recomendamos validar sua renovação para manter a operação premium sem interrupções.";
  }

  if (diasRestantes <= 15) {
    return "Sua vigência entra em fase final em breve. Vale se organizar para renovar com antecedência e manter seus benefícios premium.";
  }

  if (diasRestantes <= 45) {
    return "Seu plano segue ativo e saudável. Ainda assim, já vale acompanhar sua janela de renovação para não perder continuidade operacional.";
  }

  return "Seu plano premium está ativo e com boa folga de vigência. Sua operação segue liberada com mais capacidade, exclusividade e força comercial.";
}

export default function Dashboard() {
  const css = styles();
  const navigate = useNavigate();

  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [sincronizandoUsuario, setSincronizandoUsuario] = useState(false);
  const [corretor, setCorretor] = useState<Corretor | null>(null);
  const [saldoAtual, setSaldoAtual] = useState<number>(0);
  const [processandoLeadId, setProcessandoLeadId] = useState<string | null>(null);

  const [planoStatusAtual, setPlanoStatusAtual] = useState<string>("");
  const [planoIniciadoEmAtual, setPlanoIniciadoEmAtual] = useState<any>(null);
  const [planoExpiraEmAtual, setPlanoExpiraEmAtual] = useState<any>(null);

  const [filtroBusca, setFiltroBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const [filtroNivel, setFiltroNivel] = useState("");

  const [modalEnqueteAberto, setModalEnqueteAberto] = useState(false);
  const [telefoneEnquete, setTelefoneEnquete] = useState("");
  const [mensagemEnquete, setMensagemEnquete] = useState("");
  const [leadEnqueteId, setLeadEnqueteId] = useState("");

  const [modalExtratoAberto, setModalExtratoAberto] = useState(false);
  const [carregandoExtrato, setCarregandoExtrato] = useState(false);
  const [extrato, setExtrato] = useState<ExtratoFinanceiro>({
    saldoAtual: 0,
    totalCreditado: 0,
    totalDebitado: 0,
    transacoes: [],
  });

  const [modalUpgradeAberto, setModalUpgradeAberto] = useState(false);
  const [mensagemUpgrade, setMensagemUpgrade] = useState(
    "Você atingiu o limite operacional do seu plano BASIC."
  );

  const sincronizarCorretor = useCallback(
    async (forcarLoading = false) => {
      const stored = localStorage.getItem("corretor");

      if (!stored) {
        navigate("/login");
        return null;
      }

      if (forcarLoading) {
        setLoading(true);
      }

      setSincronizandoUsuario(true);

      try {
        const usuarioLocal = JSON.parse(stored);

        if (!usuarioLocal) {
          navigate("/login");
          return null;
        }

        const usuarioBase = montarCorretorBase(usuarioLocal);

        setCorretor(usuarioBase);
        setPlanoStatusAtual(usuarioLocal.planoStatus || "");
        setPlanoIniciadoEmAtual(usuarioLocal.planoIniciadoEm || null);
        setPlanoExpiraEmAtual(usuarioLocal.planoExpiraEm || null);

        if (!usuarioBase.id) {
          return usuarioBase;
        }

        try {
          const obterPerfilCorretor = httpsCallable(functions, "obterPerfilCorretor");
          const response = await obterPerfilCorretor({
            corretorId: usuarioBase.id,
          });

          const data = response.data as PerfilCorretorResponse;
          const usuarioBanco = data?.corretor;

          if (data?.sucesso && usuarioBanco) {
            const usuarioCompleto: Corretor = {
              id: usuarioBase.id,
              nome: usuarioBanco.nome || usuarioBase.nome || "Usuário",
              email: usuarioBanco.email || usuarioBase.email,
              plano: usuarioBanco.plano || usuarioBase.plano || "BASIC",
              tipoUsuario:
                usuarioBanco.tipoUsuario || usuarioBase.tipoUsuario || "corretor",
              tipo: (usuarioBanco as any).tipo || usuarioBase.tipo,
              ativo: usuarioBanco.ativo,
            };

            setCorretor(usuarioCompleto);
            setPlanoStatusAtual(usuarioBanco.planoStatus || "");
            setPlanoIniciadoEmAtual(usuarioBanco.planoIniciadoEm || null);
            setPlanoExpiraEmAtual(usuarioBanco.planoExpiraEm || null);

            localStorage.setItem(
              "corretor",
              JSON.stringify({
                ...usuarioCompleto,
                planoStatus: usuarioBanco.planoStatus || "",
                planoIniciadoEm: usuarioBanco.planoIniciadoEm || null,
                planoExpiraEm: usuarioBanco.planoExpiraEm || null,
                planoOrigem: usuarioBanco.planoOrigem || null,
                ultimoPagamentoPlanoEm: usuarioBanco.ultimoPagamentoPlanoEm || null,
              })
            );

            return usuarioCompleto;
          }
        } catch (erroPerfil) {
          console.error(
            "Erro ao buscar perfil do corretor via function. Mantendo dados locais:",
            erroPerfil
          );
        }

        return usuarioBase;
      } catch (error) {
        console.error("Erro ao ler usuário do localStorage:", error);
        navigate("/login");
        return null;
      } finally {
        setSincronizandoUsuario(false);
        if (forcarLoading) {
          setLoading(false);
        }
      }
    },
    [navigate]
  );

  useEffect(() => {
    sincronizarCorretor(true);
  }, [sincronizarCorretor]);

  useEffect(() => {
    function sincronizarAoVoltarParaAba() {
      sincronizarCorretor(false);
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        sincronizarCorretor(false);
      }
    }

    function handleStorage(event: StorageEvent) {
      if (event.key === "corretor") {
        sincronizarCorretor(false);
      }
    }

    const intervalo = window.setInterval(() => {
      sincronizarCorretor(false);
    }, 15000);

    window.addEventListener("focus", sincronizarAoVoltarParaAba);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.clearInterval(intervalo);
      window.removeEventListener("focus", sincronizarAoVoltarParaAba);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("storage", handleStorage);
    };
  }, [sincronizarCorretor]);

  async function fetchLeads(corretorId: string) {
    try {
      setLoading(true);

      const buscarLeads = httpsCallable(functions, "buscarLeadsDisponiveis");
      const response: any = await buscarLeads({ corretorId });
      const data: Lead[] = response.data.leads || [];

      setLeads(data);
    } catch (error) {
      console.error("Erro ao buscar leads:", error);
      alert("Erro ao buscar leads. Veja o console.");
    } finally {
      setLoading(false);
    }
  }

  async function buscarExtrato(abrirModal = false) {
    try {
      if (!corretor?.id) return;

      setCarregandoExtrato(true);

      const resultado: any = await obterExtratoFinanceiroCall({
        corretorId: corretor.id,
      });

      const data = resultado.data || {};

      setSaldoAtual(data.saldoAtual ?? 0);

      setExtrato({
        saldoAtual: data.saldoAtual ?? 0,
        totalCreditado: data.totalCreditado ?? 0,
        totalDebitado: data.totalDebitado ?? 0,
        transacoes: Array.isArray(data.transacoes) ? data.transacoes : [],
      });

      if (abrirModal) {
        setModalExtratoAberto(true);
      }
    } catch (error: any) {
      console.error("Erro ao buscar extrato:", error);

      if (abrirModal) {
        alert("Erro ao abrir extrato. Veja o console.");
      }
    } finally {
      setCarregandoExtrato(false);
    }
  }

  useEffect(() => {
    if (corretor?.id) {
      fetchLeads(corretor.id);
      buscarExtrato(false);
    } else {
      setLoading(false);
    }
  }, [corretor?.id]);

  async function assumirLead(leadId: string) {
    try {
      setProcessandoLeadId(leadId);

      const assumirInteresse = httpsCallable(functions, "assumirInteresse");
      await assumirInteresse({ leadId, corretorId: corretor?.id });

      alert("Lead assumido com sucesso!");

      if (corretor?.id) {
        await fetchLeads(corretor.id);
        await buscarExtrato(false);
        await sincronizarCorretor(false);
      }
    } catch (error: any) {
      const mensagemErro = extrairMensagemErro(error);

      if (isErroLimitePlanoBasic(error, corretor)) {
        setMensagemUpgrade(
          mensagemErro || "Você já atingiu o limite de 1 lead ativo no plano BASIC."
        );
        setModalUpgradeAberto(true);
        return;
      }

      alert("Erro ao assumir lead: " + mensagemErro);
    } finally {
      setProcessandoLeadId(null);
    }
  }

  async function adicionarSaldo() {
    try {
      if (!corretor?.id) return;

      const adicionarCredito = httpsCallable(functions, "adicionarCredito");
      const response: any = await adicionarCredito({
        corretorId: corretor.id,
        valor: 200,
      });

      alert(response.data.mensagem);
      await buscarExtrato(false);
      await sincronizarCorretor(false);
    } catch (error: any) {
      alert("Erro ao adicionar saldo: " + error.message);
    }
  }

  async function abrirExtrato() {
    await buscarExtrato(true);
  }

  async function prepararEnquetePorLeadId(leadId: string) {
    const lead = leads.find((item) => item.id === leadId);
    if (!lead) {
      alert("Lead não encontrado.");
      return;
    }

    try {
      setProcessandoLeadId(lead.id);

      const response = await fetch(URL_ENVIAR_ENQUETE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          leadId: lead.id,
        }),
      });

      const data: EnviarEnqueteResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Erro ao preparar enquete.");
      }

      setLeadEnqueteId(lead.id);
      setTelefoneEnquete(String(data.telefone || lead.telefone || ""));
      setMensagemEnquete(data.mensagem || "");
      setModalEnqueteAberto(true);

      if (corretor?.id) {
        await fetchLeads(corretor.id);
      }
    } catch (error: any) {
      console.error("Erro ao preparar enquete:", error);
      alert("Erro ao preparar enquete: " + (error.message || "Erro desconhecido"));
    } finally {
      setProcessandoLeadId(null);
    }
  }

  async function responderEnqueteLead(leadId: string, resposta: "SIM" | "NAO") {
    try {
      const confirmar = window.confirm(
        `Confirma registrar a resposta "${resposta}" para este lead?`
      );

      if (!confirmar) return;

      setProcessandoLeadId(leadId);

      const response = await fetch(URL_WEBHOOK_RESPONDER, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          leadId,
          mensagem: resposta,
        }),
      });

      const result: WebhookRespostaResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Erro ao processar resposta da enquete.");
      }

      alert("Status atualizado: " + (result.novoStatus || "atualizado"));

      if (corretor?.id) {
        await fetchLeads(corretor.id);
      }
    } catch (error: any) {
      console.error("Erro ao responder enquete:", error);
      alert("Erro ao processar enquete: " + (error.message || "Veja console."));
    } finally {
      setProcessandoLeadId(null);
    }
  }

  function copiarMensagemEnquete() {
    if (!mensagemEnquete) return;

    navigator.clipboard
      .writeText(mensagemEnquete)
      .then(() => {
        alert("Mensagem copiada com sucesso!");
      })
      .catch(() => {
        alert("Não foi possível copiar a mensagem.");
      });
  }

  function abrirWhatsAppEnquete() {
    if (!telefoneEnquete) {
      alert("Telefone não encontrado para este lead.");
      return;
    }

    const telefoneLimpo = telefoneEnquete.replace(/\D/g, "");
    const texto = encodeURIComponent(mensagemEnquete || "");
    const url = `https://wa.me/55${telefoneLimpo}?text=${texto}`;

    window.open(url, "_blank");
  }

  function handleLogout() {
    localStorage.removeItem("corretor");
    navigate("/login");
  }

  const leadsFiltrados = useMemo(() => {
    return leads.filter((lead) => {
      const busca = filtroBusca.trim().toLowerCase();

      const matchBusca =
        !busca ||
        (lead.nome || "").toLowerCase().includes(busca) ||
        (lead.bairro || "").toLowerCase().includes(busca) ||
        (lead.cidade || "").toLowerCase().includes(busca) ||
        (lead.tipoInteresse || "").toLowerCase().includes(busca) ||
        (lead.tipo || "").toLowerCase().includes(busca);

      const matchStatus = !filtroStatus || lead.status === filtroStatus;
      const matchNivel =
        !filtroNivel ||
        (lead.nivelLead || "").toLowerCase() === filtroNivel.toLowerCase();

      return matchBusca && matchStatus && matchNivel;
    });
  }, [leads, filtroBusca, filtroStatus, filtroNivel]);

  const totalLeads = leadsFiltrados.length;

  const leadsDisponiveis = useMemo(() => {
    return leadsFiltrados.filter((lead) => lead.status === "disponivel").length;
  }, [leadsFiltrados]);

  const leadsQuentes = useMemo(() => {
    return leadsFiltrados.filter(
      (lead) =>
        (lead.nivelLead || "").toLowerCase() === "qualificado" ||
        (lead.nivelLead || "").toLowerCase() === "quente"
    ).length;
  }, [leadsFiltrados]);

  const leadsProntos = useMemo(() => {
    return leadsFiltrados.filter(
      (lead) =>
        (lead.nivelLead || "").toLowerCase() === "prioritario" ||
        (lead.nivelLead || "").toLowerCase() === "prioritário" ||
        (lead.nivelLead || "").toLowerCase() === "pronto"
    ).length;
  }, [leadsFiltrados]);

  const economiaTotalPro = useMemo(() => {
    return leadsFiltrados.reduce((acc, lead) => {
      const nivel = (lead.nivelLead || "").toLowerCase();

      if (nivel === "oportunidade") return acc + 3;
      if (nivel === "qualificado" || nivel === "quente") return acc + 10;
      if (nivel === "prioritario" || nivel === "prioritário" || nivel === "pronto") {
        return acc + 20;
      }

      return acc;
    }, 0);
  }, [leadsFiltrados]);

  const diasRestantesPlano = useMemo(() => {
    return calcularDiasRestantes(planoExpiraEmAtual);
  }, [planoExpiraEmAtual]);

  const mostrarCardPlanoPro =
    (corretor?.plano || "BASIC").toUpperCase() === "PRO" && !!planoExpiraEmAtual;

  const statusPlanoFormatado = useMemo(() => {
    return formatarStatusPlano(planoStatusAtual || "ativo");
  }, [planoStatusAtual]);

  const mensagemRenovacao = useMemo(() => {
    return getMensagemRenovacao(diasRestantesPlano);
  }, [diasRestantesPlano]);

  if (loading) {
    return (
      <div style={css.page}>
        <div style={css.wrapper}>
          <div style={css.emptyState}>
            <p style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>
              Carregando leads...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={css.page}>
      <div style={css.wrapper}>
        <DashboardHero
          corretor={corretor}
          onAdicionarSaldo={adicionarSaldo}
          onAbrirMeusLeads={() => navigate("/meus-leads")}
          onAbrirExtrato={abrirExtrato}
          onLogout={handleLogout}
        />

        {sincronizandoUsuario && (
          <div
            style={{
              marginBottom: 16,
              padding: "12px 14px",
              borderRadius: 14,
              border: "1px solid #dbeafe",
              backgroundColor: "#eff6ff",
              color: "#1d4ed8",
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            Atualizando informações da sua conta...
          </div>
        )}

        {mostrarCardPlanoPro && (
          <div style={css.planoCard}>
            <div style={css.planoGlow} />

            <div style={css.planoLinha}>
              <div>
                <div style={css.planoTag}>Plano PRO anual ativo</div>
                <h3 style={css.planoTitulo}>
                  Sua operação premium está liberada
                </h3>
                <p style={css.planoTexto}>
                  Você já opera no nível mais forte do corretor dentro da plataforma,
                  com mais capacidade operacional, 48 horas de exclusividade e melhor
                  custo por lead para trabalhar conversão com mais margem.
                </p>
              </div>

              <button
                onClick={() => navigate("/planos")}
                style={css.actionPrimary}
              >
                Ver detalhes do plano
              </button>
            </div>

            <div style={css.planoResumoGrid}>
              <div style={css.planoResumoCard}>
                <div style={css.planoResumoLabel}>Status da assinatura</div>
                <div style={css.planoResumoValor}>{statusPlanoFormatado}</div>

                <div
                  style={{
                    marginTop: 12,
                    height: 1,
                    backgroundColor: "rgba(255,255,255,0.12)",
                  }}
                />

                <div style={{ marginTop: 12 }}>
                  <div style={css.planoResumoLabel}>Resumo estratégico</div>
                  <div style={css.planoResumoValor}>
                    Operação ampliada com prioridade comercial e mais tempo para
                    abordagem e fechamento.
                  </div>
                </div>
              </div>

              <div style={css.planoResumoCard}>
                <div style={css.planoResumoLabel}>Vigência atual</div>
                <div style={css.planoResumoValor}>
                  {formatarTimestampData(planoIniciadoEmAtual)} até{" "}
                  {formatarTimestampData(planoExpiraEmAtual)}
                </div>

                <div
                  style={{
                    marginTop: 12,
                    height: 1,
                    backgroundColor: "rgba(255,255,255,0.12)",
                  }}
                />

                <div style={{ marginTop: 12 }}>
                  <div style={css.planoResumoLabel}>Tempo restante</div>
                  <div style={css.planoResumoValor}>
                    {diasRestantesPlano !== null
                      ? `${diasRestantesPlano} dia(s)`
                      : "—"}
                  </div>
                </div>
              </div>
            </div>

            <div style={css.planoMiniGrid}>
              <div style={css.planoMiniCard}>
                <div style={css.planoMiniLabel}>Leads liberados</div>
                <div style={css.planoMiniValue}>
                  Lead em Oportunidade, Lead Quente e Lead Pronto
                </div>
              </div>

              <div style={css.planoMiniCard}>
                <div style={css.planoMiniLabel}>Exclusividade</div>
                <div style={css.planoMiniValue}>48 horas por lead assumido</div>
              </div>

              <div style={css.planoMiniCard}>
                <div style={css.planoMiniLabel}>Capacidade operacional</div>
                <div style={css.planoMiniValue}>Até 10 leads ativos simultaneamente</div>
              </div>

              <div style={css.planoMiniCard}>
                <div style={css.planoMiniLabel}>Posicionamento</div>
                <div style={css.planoMiniValue}>
                  Melhor janela para disputar leads mais valiosos
                </div>
              </div>
            </div>

            <div style={css.planoBeneficiosGrid}>
              <div style={css.planoBeneficioCard}>
                <h4 style={css.planoBeneficioTitulo}>Mais velocidade comercial</h4>
                <p style={css.planoBeneficioTexto}>
                  Seu tempo de resposta fica mais protegido com vigência de exclusividade
                  maior para trabalhar cada oportunidade com calma e estratégia.
                </p>
              </div>

              <div style={css.planoBeneficioCard}>
                <h4 style={css.planoBeneficioTitulo}>Melhor custo por lead</h4>
                <p style={css.planoBeneficioTexto}>
                  O plano premium foi desenhado para dar mais eficiência financeira e
                  melhorar a relação entre aquisição, atendimento e fechamento.
                </p>
              </div>

              <div style={css.planoBeneficioCard}>
                <h4 style={css.planoBeneficioTitulo}>Operação mais forte</h4>
                <p style={css.planoBeneficioTexto}>
                  Você ganha liberdade para ampliar carteira ativa e trabalhar múltiplas
                  frentes sem o travamento do plano de entrada.
                </p>
              </div>
            </div>

            <div style={css.planoAviso}>{mensagemRenovacao}</div>
          </div>
        )}

        <UpgradeBanner
          visivel={getPlano(corretor) === "BASIC"}
          economiaTotal={economiaTotalPro}
          onAbrirUpgrade={() => {
            setMensagemUpgrade(
              "Faça upgrade para o Plano PRO anual e amplie sua operação dentro da plataforma."
            );
            setModalUpgradeAberto(true);
          }}
          formatMoeda={formatMoeda}
        />

        <DashboardKPIs
          totalLeads={totalLeads}
          leadsDisponiveis={leadsDisponiveis}
          leadsQuentes={leadsQuentes}
          leadsProntos={leadsProntos}
          saldoAtual={saldoAtual}
          formatMoeda={formatMoeda}
        />

        <LeadFilters
          filtroBusca={filtroBusca}
          setFiltroBusca={setFiltroBusca}
          filtroStatus={filtroStatus}
          setFiltroStatus={setFiltroStatus}
          filtroNivel={filtroNivel}
          setFiltroNivel={setFiltroNivel}
        />

        <div style={css.sectionHeader}>
          <div>
            <h2 style={css.sectionTitle}>Oportunidades prontas para atendimento</h2>
          </div>
        </div>

        {leadsFiltrados.length === 0 ? (
          <div style={css.emptyState}>
            <p style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#0f172a" }}>
              Nenhum lead encontrado.
            </p>
            <p style={{ margin: "8px 0 0 0" }}>
              Quando houver leads disponíveis, eles aparecerão aqui.
            </p>
          </div>
        ) : (
          <div style={css.leadGrid}>
            {leadsFiltrados.map((lead) => (
              <LeadCard
                key={lead.id}
                lead={lead}
                corretor={corretor}
                onAssumir={assumirLead}
                onEnviarEnquete={prepararEnquetePorLeadId}
              />
            ))}
          </div>
        )}
      </div>

      {modalEnqueteAberto && (
        <div style={css.overlay}>
          <div
            style={{
              ...css.modal,
              maxWidth: 760,
            }}
          >
            <h3 style={css.modalTitle}>Enquete preparada com sucesso</h3>

            <p style={{ color: "#475569", marginTop: 0 }}>
              Copie a mensagem ou abra diretamente no WhatsApp para enviar ao cliente.
            </p>

            <div style={{ marginBottom: 14 }}>
              <label
                style={{
                  display: "block",
                  marginBottom: 8,
                  color: "#334155",
                  fontWeight: 700,
                  fontSize: 14,
                }}
              >
                Lead ID
              </label>
              <input type="text" value={leadEnqueteId} readOnly style={css.input} />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label
                style={{
                  display: "block",
                  marginBottom: 8,
                  color: "#334155",
                  fontWeight: 700,
                  fontSize: 14,
                }}
              >
                Telefone
              </label>
              <input type="text" value={telefoneEnquete} readOnly style={css.input} />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label
                style={{
                  display: "block",
                  marginBottom: 8,
                  color: "#334155",
                  fontWeight: 700,
                  fontSize: 14,
                }}
              >
                Mensagem
              </label>
              <textarea
                value={mensagemEnquete}
                readOnly
                rows={8}
                style={css.textarea}
              />
            </div>

            <div style={css.modalFooter}>
              <button onClick={copiarMensagemEnquete} style={css.actionPrimary}>
                Copiar mensagem
              </button>

              <button onClick={abrirWhatsAppEnquete} style={css.actionSuccess}>
                Abrir WhatsApp
              </button>

              <button
                onClick={() => setModalEnqueteAberto(false)}
                style={{
                  ...css.actionDisabled,
                  cursor: "pointer",
                }}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {modalExtratoAberto && (
        <div style={css.overlay}>
          <div style={css.modal}>
            <h3 style={css.modalTitle}>Extrato financeiro</h3>

            {carregandoExtrato ? (
              <p style={{ color: "#475569" }}>Carregando extrato...</p>
            ) : (
              <>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: 14,
                    marginBottom: 22,
                  }}
                >
                  <div
                    style={{
                      ...css.kpiCard,
                      marginBottom: 0,
                      backgroundColor: "#eff6ff",
                      border: "1px solid #bfdbfe",
                    }}
                  >
                    <div style={css.kpiLabel}>Saldo atual</div>
                    <div style={{ ...css.kpiValue, color: "#1d4ed8" }}>
                      {formatMoeda(extrato.saldoAtual)}
                    </div>
                  </div>

                  <div
                    style={{
                      ...css.kpiCard,
                      marginBottom: 0,
                      backgroundColor: "#ecfdf5",
                      border: "1px solid #a7f3d0",
                    }}
                  >
                    <div style={css.kpiLabel}>Total creditado</div>
                    <div style={{ ...css.kpiValue, color: "#059669" }}>
                      {formatMoeda(extrato.totalCreditado)}
                    </div>
                  </div>

                  <div
                    style={{
                      ...css.kpiCard,
                      marginBottom: 0,
                      backgroundColor: "#fef2f2",
                      border: "1px solid #fecaca",
                    }}
                  >
                    <div style={css.kpiLabel}>Total debitado</div>
                    <div style={{ ...css.kpiValue, color: "#dc2626" }}>
                      {formatMoeda(extrato.totalDebitado)}
                    </div>
                  </div>
                </div>

                <div style={css.infoSection}>
                  <h4 style={{ ...css.infoTitle, marginBottom: 14 }}>Transações</h4>

                  {extrato.transacoes.length === 0 ? (
                    <div style={css.emptyState}>
                      <p style={{ margin: 0 }}>Nenhuma transação encontrada.</p>
                    </div>
                  ) : (
                    <div style={{ display: "grid", gap: 12 }}>
                      {extrato.transacoes.map((transacao: any, index: number) => {
                        const isCredito = transacao.tipo === "credito";

                        return (
                          <div
                            key={transacao.id || index}
                            style={{
                              backgroundColor: "#ffffff",
                              border: "1px solid #e2e8f0",
                              borderRadius: 16,
                              padding: 16,
                              boxShadow: "0 8px 20px rgba(15, 23, 42, 0.04)",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                gap: 12,
                                flexWrap: "wrap",
                                marginBottom: 10,
                              }}
                            >
                              <strong
                                style={{
                                  color: "#0f172a",
                                  fontSize: 15,
                                }}
                              >
                                {transacao.descricao || "Transação"}
                              </strong>

                              <span
                                style={{
                                  fontWeight: 800,
                                  color: isCredito ? "#059669" : "#dc2626",
                                  fontSize: 15,
                                }}
                              >
                                {isCredito ? "+" : "-"} {formatMoeda(transacao.valor)}
                              </span>
                            </div>

                            <div style={css.infoGrid}>
                              <div style={css.infoItem}>
                                <div style={css.infoLabel}>Tipo</div>
                                <div style={css.infoValue}>{transacao.tipo || "—"}</div>
                              </div>

                              <div style={css.infoItem}>
                                <div style={css.infoLabel}>Data</div>
                                <div style={css.infoValue}>
                                  {formatDateTime(transacao.criadoEm)}
                                </div>
                              </div>

                              <div style={css.infoItem}>
                                <div style={css.infoLabel}>Saldo antes</div>
                                <div style={css.infoValue}>
                                  {formatMoeda(transacao.saldoAntes)}
                                </div>
                              </div>

                              <div style={css.infoItem}>
                                <div style={css.infoLabel}>Saldo depois</div>
                                <div style={css.infoValue}>
                                  {formatMoeda(transacao.saldoDepois)}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            )}

            <div style={css.modalFooter}>
              <button
                onClick={() => setModalExtratoAberto(false)}
                style={{
                  ...css.actionDisabled,
                  cursor: "pointer",
                }}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {modalUpgradeAberto && (
        <div style={css.overlay}>
          <div style={css.upgradeModal}>
            <div style={css.upgradeBadge}>Plano BASIC no limite operacional</div>

            <h3 style={{ ...css.modalTitle, fontSize: 24, marginBottom: 10 }}>
              Desbloqueie uma operação mais forte com o Plano PRO
            </h3>

            <p style={css.upgradeText}>{mensagemUpgrade}</p>

            <p style={{ ...css.upgradeText, marginTop: 10 }}>
              No plano BASIC você mantém até <strong>1 lead ativo</strong>. Com o
              <strong> Plano PRO anual</strong>, você amplia sua capacidade comercial e
              ganha mais força dentro da plataforma.
            </p>

            <div style={{ ...css.infoSection, marginTop: 14 }}>
              <h4 style={css.infoTitle}>Vigência do plano</h4>
              <div style={css.infoValue}>
                Assinatura anual com validade de 12 meses a partir da ativação.
              </div>
            </div>

            <div style={css.upgradeGrid}>
              <div style={css.upgradeCard}>
                <h4 style={css.upgradeCardTitle}>Até 10 leads ativos</h4>
                <p style={css.upgradeCardText}>
                  Atenda mais oportunidades ao mesmo tempo.
                </p>
              </div>

              <div style={css.upgradeCard}>
                <h4 style={css.upgradeCardTitle}>48h de exclusividade</h4>
                <p style={css.upgradeCardText}>
                  Mais tempo para abordagem e fechamento.
                </p>
              </div>

              <div style={css.upgradeCard}>
                <h4 style={css.upgradeCardTitle}>Melhor custo por lead</h4>
                <p style={css.upgradeCardText}>
                  Mais eficiência financeira na operação.
                </p>
              </div>

              <div style={css.upgradeCard}>
                <h4 style={css.upgradeCardTitle}>Mais força comercial</h4>
                <p style={css.upgradeCardText}>
                  Mais liberdade para crescer e converter.
                </p>
              </div>
            </div>

            <div style={{ ...css.modalFooter, marginTop: 16 }}>
              <button
                onClick={() => window.open("https://wa.me/558788550592", "_blank")}
                style={css.actionSuccess}
              >
                Falar no WhatsApp
              </button>

              <button
                onClick={() => navigate("/planos")}
                style={css.actionPrimary}
              >
                Ver plano PRO
              </button>

              <button
                onClick={() => setModalUpgradeAberto(false)}
                style={{
                  ...css.actionDisabled,
                  cursor: "pointer",
                }}
              >
                Continuar no BASIC
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
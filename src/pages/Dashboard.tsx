import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { httpsCallable } from "firebase/functions";
import { doc, getDoc } from "firebase/firestore";
import { functions, obterExtratoFinanceiroCall, db } from "../firebase";
import { useNavigate } from "react-router-dom";

type FirestoreDateLike =
  | { toDate?: () => Date; toMillis?: () => number }
  | { seconds?: number; nanoseconds?: number }
  | { _seconds?: number; _nanoseconds?: number }
  | null
  | undefined;

type Lead = {
  id: string;
  nome?: string;
  telefone?: string;
  status?: string;
  categoria?: string;
  categoriaValor?: string;
  cidade?: string;
  bairro?: string;
  tipo?: string;
  tipoInteresse?: string;
  tipoImovel?: string;
  objetivo?: string;
  nivelLead?: string;
  score?: number;
  precoLead?: number;
  valor?: number | string;
  origem?: string;
  prazo?: string;
  urgencia?: string;
  orcamento?: string;

  profissao?: string;
  renda?: string | number;
  observacoes?: string;
  motivoMudanca?: string;
  situacaoAtual?: string;
  detalhesInteresse?: string;
  quartos?: string | number;
  entradaDisponivel?: string;
  financiamentoAprovado?: string;
  fgts?: string;
  preferenciaImovel?: string;
  mensagemCliente?: string;

  corretorId?: string | null;
  corretorAtual?: string | null;

  createdAt?: FirestoreDateLike;
  criadoEm?: FirestoreDateLike;
  updatedAt?: FirestoreDateLike;
  atualizadoEm?: FirestoreDateLike;
  assumedAt?: FirestoreDateLike | null;
  expiresAt?: FirestoreDateLike | null;
  lockUntil?: FirestoreDateLike | null;

  enqueteEnviada?: boolean;
  enqueteEnviadaAt?: FirestoreDateLike;
  enqueteRespondida?: boolean;
  enqueteResposta?: "SIM" | "NAO" | null;
  tentativasEnquete?: number;
  ultimaTentativaEnqueteAt?: FirestoreDateLike;
};

type Corretor = {
  id: string;
  nome: string;
  email?: string;
  tipo?: string;
  tipoUsuario?: string;
  ativo?: boolean;
  plano?: "BASIC" | "PRO" | "ADMIN" | string;
};

type EnviarEnqueteResponse = {
  success?: boolean;
  telefone?: string;
  mensagem?: string;
  leadId?: string;
  status?: string;
  error?: string;
};

type WebhookRespostaResponse = {
  success?: boolean;
  novoStatus?: string;
  tentativas?: number;
  error?: string;
};

type Transacao = {
  id?: string;
  tipo?: "credito" | "debito" | string;
  valor?: number;
  descricao?: string;
  criadoEm?: FirestoreDateLike;
  saldoAntes?: number;
  saldoDepois?: number;
};

type ExtratoFinanceiro = {
  saldoAtual: number;
  totalCreditado: number;
  totalDebitado: number;
  transacoes: Transacao[];
};

const URL_ENVIAR_ENQUETE =
  "https://us-central1-imoconnect-9d71c.cloudfunctions.net/enviarEnqueteLead";

const URL_WEBHOOK_RESPONDER =
  "https://us-central1-imoconnect-9d71c.cloudfunctions.net/webhookResponderEnquete";

function getDateFromFirestore(value?: FirestoreDateLike): Date | null {
  if (!value) return null;

  if (typeof (value as any).toDate === "function") {
    return (value as any).toDate();
  }

  if (typeof (value as any).seconds === "number") {
    return new Date((value as any).seconds * 1000);
  }

  if (typeof (value as any)._seconds === "number") {
    return new Date((value as any)._seconds * 1000);
  }

  return null;
}

function getLeadCreatedDate(lead: Lead): Date | null {
  return getDateFromFirestore(lead.createdAt) || getDateFromFirestore(lead.criadoEm) || null;
}

function formatDateTime(value?: FirestoreDateLike): string {
  const date = getDateFromFirestore(value);
  if (!date) return "—";
  return date.toLocaleString("pt-BR");
}

function formatLeadCreatedDate(lead: Lead): string {
  const date = getLeadCreatedDate(lead);
  if (!date) return "—";
  return date.toLocaleString("pt-BR");
}

function formatTimeAgoFromLead(lead: Lead): string {
  const date = getLeadCreatedDate(lead);
  if (!date) return "—";

  const now = Date.now();
  const time = date.getTime();
  const diffMs = now - time;

  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return "agora";
  if (minutes < 60) return `${minutes} min atrás`;
  if (hours < 24) return `${hours} h atrás`;
  return `${days} d atrás`;
}

function formatCountdown(value?: FirestoreDateLike): string {
  const date = getDateFromFirestore(value);
  if (!date) return "—";

  const now = Date.now();
  const time = date.getTime();
  const diffMs = time - now;

  if (diffMs <= 0) return "Expirado";

  const hours = Math.floor(diffMs / 3600000);
  const minutes = Math.floor((diffMs % 3600000) / 60000);

  return `${hours}h ${minutes}m`;
}

function formatMoeda(valor?: number | string) {
  if (valor === undefined || valor === null || valor === "") return "—";

  const numero =
    typeof valor === "number"
      ? valor
      : Number(String(valor).replace(/[^\d.,-]/g, "").replace(",", "."));

  if (Number.isNaN(numero)) return String(valor);

  return numero.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function mascararNome(nome?: string) {
  if (!nome) return "—";

  const partes = nome.trim().split(" ").filter(Boolean);

  if (partes.length === 0) return "—";

  return partes
    .map((parte) => {
      if (parte.length <= 2) return `${parte[0] || ""}*`;
      if (parte.length <= 4) return `${parte.slice(0, 2)}**`;
      return `${parte.slice(0, 3)}*****`;
    })
    .join(" ");
}

function mascararTelefone(telefone?: string | number) {
  if (!telefone && telefone !== 0) return "—";

  const t = String(telefone).replace(/\D/g, "");
  if (!t) return "—";

  if (t.length <= 5) return `${t.slice(0, 2)}***`;
  return `${t.slice(0, 5)}*****`;
}

function mascararTexto(texto?: string | number) {
  if (texto === undefined || texto === null || texto === "") return "—";
  return "***************";
}

function getPlano(corretor: Corretor | null) {
  return (corretor?.plano || "BASIC").toString().toUpperCase();
}

function isAdmin(corretor: Corretor | null) {
  return (corretor?.tipoUsuario || corretor?.tipo || "").toString().toLowerCase() === "admin";
}

function isLeadOwner(lead: Lead, corretor: Corretor | null) {
  if (!corretor?.id) return false;
  return lead.corretorAtual === corretor.id || lead.corretorId === corretor.id;
}

function podeVerCompleto(lead: Lead, corretor: Corretor | null) {
  return isAdmin(corretor) || isLeadOwner(lead, corretor);
}

function getTipoInteresse(lead: Lead) {
  return lead.tipo || lead.tipoInteresse || lead.objetivo || "—";
}

function getFaixaValor(lead: Lead) {
  if (lead.orcamento) return lead.orcamento;
  if (lead.categoriaValor) return lead.categoriaValor;
  if (lead.valor !== undefined && lead.valor !== null && lead.valor !== "") {
    return formatMoeda(lead.valor);
  }
  return "—";
}

function getStatusLabel(status?: string) {
  switch (status) {
    case "disponivel":
      return "Disponível";
    case "aguardando_enquete":
      return "Aguardando enquete";
    case "sem_interesse":
      return "Sem interesse";
    case "em_atendimento":
      return "Em atendimento";
    case "quarentena":
      return "Quarentena";
    default:
      return status || "Sem status";
  }
}

function getStatusStyles(status?: string) {
  switch (status) {
    case "disponivel":
      return {
        bg: "#ecfdf5",
        color: "#047857",
        border: "1px solid #a7f3d0",
      };
    case "aguardando_enquete":
      return {
        bg: "#fffbeb",
        color: "#b45309",
        border: "1px solid #fcd34d",
      };
    case "sem_interesse":
      return {
        bg: "#fef2f2",
        color: "#b91c1c",
        border: "1px solid #fecaca",
      };
    case "em_atendimento":
      return {
        bg: "#eff6ff",
        color: "#1d4ed8",
        border: "1px solid #bfdbfe",
      };
    case "quarentena":
      return {
        bg: "#f5f3ff",
        color: "#7c3aed",
        border: "1px solid #ddd6fe",
      };
    default:
      return {
        bg: "#f8fafc",
        color: "#475569",
        border: "1px solid #e2e8f0",
      };
  }
}

function getNivelStyles(nivel?: string) {
  switch ((nivel || "").toLowerCase()) {
    case "oportunidade":
      return {
        label: "Lead em Oportunidade",
        bg: "#eff6ff",
        color: "#1d4ed8",
        border: "1px solid #bfdbfe",
      };

    case "qualificado":
      return {
        label: "Lead Quente",
        bg: "#fffbeb",
        color: "#b45309",
        border: "1px solid #fcd34d",
      };

    case "prioritario":
    case "prioritário":
      return {
        label: "Lead Pronto",
        bg: "#fef2f2",
        color: "#b91c1c",
        border: "1px solid #fecaca",
      };

    default:
      return {
        label: "Lead",
        bg: "#f8fafc",
        color: "#475569",
        border: "1px solid #e2e8f0",
      };
  }
}

function getPrecoOriginalPorNivel(nivel?: string): number | null {
  switch ((nivel || "").toLowerCase()) {
    case "oportunidade":
      return 10;
    case "qualificado":
      return 25;
    case "prioritario":
    case "prioritário":
      return 50;
    default:
      return null;
  }
}

function styles() {
  return {
    page: {
      minHeight: "100vh",
      background:
        "linear-gradient(180deg, #eaf2ff 0%, #f8fafc 220px, #f8fafc 100%)",
      padding: "24px 20px 40px 20px",
      fontFamily:
        'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    } as CSSProperties,
    wrapper: {
      maxWidth: 1320,
      margin: "0 auto",
    } as CSSProperties,
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
      maxWidth: 640,
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
    kpiGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
      gap: 14,
      marginBottom: 22,
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
    kpiNote: {
      marginTop: 8,
      color: "#475569",
      fontSize: 13,
    } as CSSProperties,
    sectionHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 12,
      flexWrap: "wrap",
      marginBottom: 16,
    } as CSSProperties,
    sectionTitle: {
      margin: 0,
      fontSize: 22,
      color: "#0f172a",
      fontWeight: 800,
      letterSpacing: "-0.02em",
    } as CSSProperties,
    sectionDescription: {
      margin: "6px 0 0 0",
      color: "#64748b",
      fontSize: 14,
    } as CSSProperties,
    leadGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
      gap: 18,
    } as CSSProperties,
    leadCard: {
      backgroundColor: "#ffffff",
      borderRadius: 22,
      padding: 20,
      border: "1px solid #e2e8f0",
      boxShadow: "0 14px 34px rgba(15, 23, 42, 0.06)",
      display: "flex",
      flexDirection: "column",
      gap: 16,
    } as CSSProperties,
    leadHeader: {
      display: "flex",
      justifyContent: "space-between",
      gap: 12,
      alignItems: "flex-start",
      flexWrap: "wrap",
    } as CSSProperties,
    leadName: {
      margin: 0,
      color: "#0f172a",
      fontSize: 20,
      fontWeight: 800,
      letterSpacing: "-0.02em",
    } as CSSProperties,
    leadPhone: {
      margin: "6px 0 0 0",
      color: "#64748b",
      fontSize: 14,
    } as CSSProperties,
    badgeRow: {
      display: "flex",
      gap: 8,
      flexWrap: "wrap",
      justifyContent: "flex-end",
      alignItems: "center",
    } as CSSProperties,
    badge: {
      padding: "7px 11px",
      borderRadius: 999,
      fontSize: 12,
      fontWeight: 700,
      whiteSpace: "nowrap",
    } as CSSProperties,
    priceCard: {
      background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)",
      border: "1px solid #dbeafe",
      borderRadius: 16,
      padding: 14,
      display: "flex",
      justifyContent: "space-between",
      gap: 14,
      alignItems: "center",
      flexWrap: "wrap",
    } as CSSProperties,
    priceLabel: {
      color: "#64748b",
      fontSize: 13,
      fontWeight: 600,
      marginBottom: 4,
    } as CSSProperties,
    priceValue: {
      color: "#0f172a",
      fontSize: 24,
      fontWeight: 800,
      lineHeight: 1.1,
    } as CSSProperties,
    priceSub: {
      color: "#475569",
      fontSize: 13,
    } as CSSProperties,
    oldPrice: {
      color: "#94a3b8",
      fontSize: 16,
      fontWeight: 700,
      textDecoration: "line-through",
      marginBottom: 4,
    } as CSSProperties,
    unlockBox: {
      backgroundColor: "#fff7ed",
      border: "1px solid #fdba74",
      color: "#9a3412",
      borderRadius: 14,
      padding: "10px 12px",
      fontSize: 13,
      fontWeight: 700,
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
    actionsRow: {
      display: "flex",
      gap: 10,
      flexWrap: "wrap",
      marginTop: 2,
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
    actionWarning: {
      padding: "12px 14px",
      backgroundColor: "#f59e0b",
      color: "#ffffff",
      border: "none",
      borderRadius: 12,
      cursor: "pointer",
      fontWeight: 700,
      fontSize: 14,
      boxShadow: "0 10px 20px rgba(245,158,11,0.18)",
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
    actionDanger: {
      padding: "12px 14px",
      backgroundColor: "#ef4444",
      color: "#ffffff",
      border: "none",
      borderRadius: 12,
      cursor: "pointer",
      fontWeight: 700,
      fontSize: 14,
      boxShadow: "0 10px 20px rgba(239,68,68,0.16)",
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
  };
}

export default function Dashboard() {
  const css = styles();

  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [corretor, setCorretor] = useState<Corretor | null>(null);
  const [saldoAtual, setSaldoAtual] = useState<number | null>(null);
  const [processandoLeadId, setProcessandoLeadId] = useState<string | null>(null);

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

  const navigate = useNavigate();

  useEffect(() => {
    async function carregarUsuarioReal() {
      const stored = localStorage.getItem("corretor");

      if (!stored) {
        navigate("/login");
        return;
      }

      try {
        const usuarioLocal = JSON.parse(stored);

        if (!usuarioLocal) {
          navigate("/login");
          return;
        }

        const usuarioBase: Corretor = {
          id: usuarioLocal.id || "",
          nome: usuarioLocal.nome || "Usuário",
          email: usuarioLocal.email,
          plano: usuarioLocal.plano || "BASIC",
          tipoUsuario: usuarioLocal.tipoUsuario || "corretor",
          tipo: usuarioLocal.tipo,
          ativo: usuarioLocal.ativo,
        };

        setCorretor(usuarioBase);

        if (!usuarioBase.id) {
          console.warn("Usuário local sem id. Mantendo dados locais.");
          return;
        }

        try {
          const usuarioRef = doc(db, "usuarios", usuarioBase.id);
          const usuarioSnap = await getDoc(usuarioRef);

          if (usuarioSnap.exists()) {
            const usuarioBanco = usuarioSnap.data();

            const usuarioCompleto: Corretor = {
              id: usuarioBase.id,
              nome: usuarioBanco.nome || usuarioBase.nome || "Usuário",
              email: usuarioBanco.email || usuarioBase.email,
              plano: usuarioBanco.plano || usuarioBase.plano || "BASIC",
              tipoUsuario: usuarioBanco.tipoUsuario || usuarioBase.tipoUsuario || "corretor",
              tipo: usuarioBanco.tipo || usuarioBase.tipo,
              ativo: usuarioBanco.ativo,
            };

            setCorretor(usuarioCompleto);
            localStorage.setItem("corretor", JSON.stringify(usuarioCompleto));
          } else {
            console.warn("Usuário não encontrado no Firestore. Mantendo dados locais.");
          }
        } catch (erroBanco) {
          console.error("Erro ao buscar usuário no Firestore. Mantendo dados locais:", erroBanco);
        }
      } catch (error) {
        console.error("Erro ao ler usuário do localStorage:", error);
        navigate("/login");
      }
    }

    carregarUsuarioReal();
  }, [navigate]);

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

  useEffect(() => {
    if (corretor?.id) {
      fetchLeads(corretor.id);
      buscarExtrato(false);
    } else {
      setLoading(false);
    }
  }, [corretor]);

  async function assumirLead(leadId: string) {
    try {
      setProcessandoLeadId(leadId);

      const assumirInteresse = httpsCallable(functions, "assumirInteresse");
      await assumirInteresse({ leadId, corretorId: corretor?.id });

      alert("Lead assumido com sucesso!");

      if (corretor?.id) {
        await fetchLeads(corretor.id);
      }

      await buscarExtrato(false);
    } catch (error: any) {
      alert("Erro ao assumir lead: " + error.message);
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
    } catch (error: any) {
      alert("Erro ao adicionar saldo: " + error.message);
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
      setSaldoAtual(null);

      if (abrirModal) {
        alert("Erro ao abrir extrato. Veja o console.");
      }
    } finally {
      setCarregandoExtrato(false);
    }
  }

  async function abrirExtrato() {
    await buscarExtrato(true);
  }

  async function prepararEnquete(lead: Lead) {
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

  function renderNome(lead: Lead) {
    return podeVerCompleto(lead, corretor) ? lead.nome || "—" : mascararNome(lead.nome);
  }

  function renderTelefone(lead: Lead) {
    return podeVerCompleto(lead, corretor)
      ? String(lead.telefone || "—")
      : mascararTelefone(lead.telefone);
  }

  function renderCampoSensivel(lead: Lead, valor?: string | number) {
    return podeVerCompleto(lead, corretor) ? (valor || "—") : mascararTexto(valor);
  }

  function showCampoPro() {
    return getPlano(corretor) === "PRO" || isAdmin(corretor);
  }

  function isLeadBloqueadoParaBasic(lead: Lead) {
    return (
      getPlano(corretor) === "BASIC" &&
      !isAdmin(corretor) &&
      (lead.nivelLead || "").toLowerCase() !== "oportunidade"
    );
  }

  const metricas = useMemo(() => {
    const disponiveis = leads.filter((lead) => lead.status === "disponivel").length;
    const emAtendimento = leads.filter((lead) => lead.status === "em_atendimento").length;
    const aguardandoEnquete = leads.filter(
      (lead) => lead.status === "aguardando_enquete"
    ).length;

    return {
      disponiveis,
      emAtendimento,
      aguardandoEnquete,
    };
  }, [leads]);

  if (loading) {
    return (
      <div style={css.page}>
        <div style={css.wrapper}>
          <div style={css.emptyState}>
            <p style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Carregando leads...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={css.page}>
      <div style={css.wrapper}>
        <section style={css.hero}>
          <div style={css.heroGlow} />
          <div style={css.heroGrid}>
            <div>
              <h1 style={css.heroTitle}>ImoConnect • Dashboard Comercial</h1>
              <p style={css.heroSubtitle}>
                Painel de operação de leads com visão comercial, controle financeiro e
                acompanhamento de enquete. Tudo centralizado em uma experiência mais
                profissional.
              </p>

              {corretor && (
                <div style={css.heroMetaRow}>
                  <span style={css.heroTag}>Corretor: {corretor.nome}</span>
                  <span style={css.heroTag}>Plano: {getPlano(corretor)}</span>
                  <span style={css.heroTag}>
                    Perfil: {isAdmin(corretor) ? "ADMIN" : "CORRETOR"}
                  </span>
                </div>
              )}
            </div>

            <div style={css.heroActions}>
              <button onClick={adicionarSaldo} style={css.primaryButton}>
                + Adicionar R$ 200
              </button>

              <button onClick={abrirExtrato} style={css.secondaryHeroButton}>
                Ver extrato
              </button>

              <button onClick={handleLogout} style={css.dangerHeroButton}>
                Sair
              </button>
            </div>
          </div>
        </section>

        <section style={css.kpiGrid}>
          <div style={css.kpiCard}>
            <div style={css.kpiLabel}>Saldo atual</div>
            <div style={css.kpiValue}>
              {saldoAtual !== null ? formatMoeda(saldoAtual) : "—"}
            </div>
            <div style={css.kpiNote}>Saldo disponível para assumir novos leads.</div>
          </div>

          <div style={css.kpiCard}>
            <div style={css.kpiLabel}>Leads disponíveis</div>
            <div style={css.kpiValue}>{metricas.disponiveis}</div>
            <div style={css.kpiNote}>Leads prontos para distribuição neste momento.</div>
          </div>

          <div style={css.kpiCard}>
            <div style={css.kpiLabel}>Em atendimento</div>
            <div style={css.kpiValue}>{metricas.emAtendimento}</div>
            <div style={css.kpiNote}>Leads atualmente sob responsabilidade de corretor.</div>
          </div>

          <div style={css.kpiCard}>
            <div style={css.kpiLabel}>Aguardando enquete</div>
            <div style={css.kpiValue}>{metricas.aguardandoEnquete}</div>
            <div style={css.kpiNote}>Leads pendentes de resposta do cliente.</div>
          </div>
        </section>

        <div style={css.sectionHeader}>
          <div>
            <h2 style={css.sectionTitle}>Leads do pool</h2>
            <p style={css.sectionDescription}>
              Visualização comercial com dados públicos, perfil do cliente e ações de
              atendimento.
            </p>
          </div>
        </div>

        {leads.length === 0 ? (
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
            {leads.map((lead) => {
              const isDisponivel = lead.status === "disponivel";
              const aguardandoEnquete = lead.status === "aguardando_enquete";
              const processando = processandoLeadId === lead.id;
              const completo = podeVerCompleto(lead, corretor);
              const pro = showCampoPro();
              const statusStyle = getStatusStyles(lead.status);
              const nivelStyle = getNivelStyles(lead.nivelLead);
              const bloqueadoBasic = isLeadBloqueadoParaBasic(lead);
              const precoOriginal = getPrecoOriginalPorNivel(lead.nivelLead);

              return (
                <div key={lead.id} style={css.leadCard}>
                  <div style={css.leadHeader}>
                    <div>
                      <h3 style={css.leadName}>{renderNome(lead)}</h3>
                      <p style={css.leadPhone}>{renderTelefone(lead)}</p>
                    </div>

                    <div style={css.badgeRow}>
                      <span
                        style={{
                          ...css.badge,
                          backgroundColor: nivelStyle.bg,
                          color: nivelStyle.color,
                          border: nivelStyle.border,
                        }}
                      >
                        {nivelStyle.label}
                      </span>

                      <span
                        style={{
                          ...css.badge,
                          backgroundColor: statusStyle.bg,
                          color: statusStyle.color,
                          border: statusStyle.border,
                        }}
                      >
                        {getStatusLabel(lead.status)}
                      </span>
                    </div>
                  </div>

                  <div style={css.priceCard}>
                    <div>
                      <div style={css.priceLabel}>Oferta do lead</div>

                      {precoOriginal !== null && (
                        <div style={css.oldPrice}>{formatMoeda(precoOriginal)}</div>
                      )}

                      <div style={css.priceValue}>
                        {typeof lead.precoLead === "number"
                          ? formatMoeda(lead.precoLead)
                          : "—"}
                      </div>

                      <div style={css.priceSub}>
                        {lead.nivelLead ? nivelStyle.label : "Lead"} • {getTipoInteresse(lead)}
                      </div>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <div style={css.priceLabel}>Expiração / janela</div>
                      <div
                        style={{
                          ...css.priceValue,
                          fontSize: 20,
                        }}
                      >
                        {formatCountdown(lead.expiresAt || lead.lockUntil)}
                      </div>
                      <div style={css.priceSub}>{formatTimeAgoFromLead(lead)}</div>
                    </div>
                  </div>

                  {!completo && (
                    <div style={css.unlockBox}>
                      Informações completas liberadas após assumir o lead.
                    </div>
                  )}

                  <div style={css.infoSection}>
                    <h4 style={css.infoTitle}>Resumo do lead</h4>
                    <div style={css.infoGrid}>
                      <div style={css.infoItem}>
                        <div style={css.infoLabel}>Cidade</div>
                        <div style={css.infoValue}>{lead.cidade || "—"}</div>
                      </div>

                      <div style={css.infoItem}>
                        <div style={css.infoLabel}>Bairro</div>
                        <div style={css.infoValue}>{lead.bairro || "—"}</div>
                      </div>

                      <div style={css.infoItem}>
                        <div style={css.infoLabel}>Tipo de interesse</div>
                        <div style={css.infoValue}>{getTipoInteresse(lead)}</div>
                      </div>

                      <div style={css.infoItem}>
                        <div style={css.infoLabel}>Tipo de imóvel</div>
                        <div style={css.infoValue}>{lead.tipoImovel || "—"}</div>
                      </div>

                      <div style={css.infoItem}>
                        <div style={css.infoLabel}>Faixa de valor</div>
                        <div style={css.infoValue}>{getFaixaValor(lead)}</div>
                      </div>

                      <div style={css.infoItem}>
                        <div style={css.infoLabel}>Criado em</div>
                        <div style={css.infoValue}>{formatLeadCreatedDate(lead)}</div>
                      </div>

                      {pro ? (
                        <>
                          <div style={css.infoItem}>
                            <div style={css.infoLabel}>Nível do lead</div>
                            <div style={css.infoValue}>{nivelStyle.label}</div>
                          </div>

                          <div style={css.infoItem}>
                            <div style={css.infoLabel}>Origem</div>
                            <div style={css.infoValue}>{lead.origem || "—"}</div>
                          </div>

                          <div style={css.infoItem}>
                            <div style={css.infoLabel}>Prazo / urgência</div>
                            <div style={css.infoValue}>
                              {lead.prazo || lead.urgencia || "—"}
                            </div>
                          </div>

                          <div style={css.infoItem}>
                            <div style={css.infoLabel}>Atualizado em</div>
                            <div style={css.infoValue}>
                              {formatDateTime(lead.updatedAt || lead.atualizadoEm)}
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div style={css.infoItem}>
                            <div style={css.infoLabel}>Nível do lead</div>
                            <div style={css.infoValue}>{nivelStyle.label}</div>
                          </div>

                          <div style={css.infoItem}>
                            <div style={css.infoLabel}>Atualizado em</div>
                            <div style={css.infoValue}>
                              {formatDateTime(lead.updatedAt || lead.atualizadoEm)}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div style={css.infoSection}>
                    <h4 style={css.infoTitle}>Perfil do cliente</h4>
                    <div style={css.infoGrid}>
                      <div style={css.infoItem}>
                        <div style={css.infoLabel}>Profissão</div>
                        <div style={css.infoValue}>
                          {renderCampoSensivel(lead, lead.profissao)}
                        </div>
                      </div>

                      <div style={css.infoItem}>
                        <div style={css.infoLabel}>Renda</div>
                        <div style={css.infoValue}>
                          {renderCampoSensivel(
                            lead,
                            typeof lead.renda === "number"
                              ? formatMoeda(lead.renda)
                              : lead.renda
                          )}
                        </div>
                      </div>

                      <div style={css.infoItem}>
                        <div style={css.infoLabel}>Situação atual</div>
                        <div style={css.infoValue}>
                          {renderCampoSensivel(lead, lead.situacaoAtual)}
                        </div>
                      </div>

                      <div style={css.infoItem}>
                        <div style={css.infoLabel}>Motivo da mudança</div>
                        <div style={css.infoValue}>
                          {renderCampoSensivel(lead, lead.motivoMudanca)}
                        </div>
                      </div>

                      <div style={css.infoItem}>
                        <div style={css.infoLabel}>Detalhes do interesse</div>
                        <div style={css.infoValue}>
                          {renderCampoSensivel(lead, lead.detalhesInteresse)}
                        </div>
                      </div>

                      <div style={css.infoItem}>
                        <div style={css.infoLabel}>Preferência do imóvel</div>
                        <div style={css.infoValue}>
                          {renderCampoSensivel(lead, lead.preferenciaImovel)}
                        </div>
                      </div>

                      <div style={css.infoItem}>
                        <div style={css.infoLabel}>Quartos</div>
                        <div style={css.infoValue}>
                          {renderCampoSensivel(lead, lead.quartos)}
                        </div>
                      </div>

                      <div style={css.infoItem}>
                        <div style={css.infoLabel}>Entrada disponível</div>
                        <div style={css.infoValue}>
                          {renderCampoSensivel(lead, lead.entradaDisponivel)}
                        </div>
                      </div>

                      <div style={css.infoItem}>
                        <div style={css.infoLabel}>Financiamento aprovado</div>
                        <div style={css.infoValue}>
                          {renderCampoSensivel(lead, lead.financiamentoAprovado)}
                        </div>
                      </div>

                      <div style={css.infoItem}>
                        <div style={css.infoLabel}>FGTS</div>
                        <div style={css.infoValue}>
                          {renderCampoSensivel(lead, lead.fgts)}
                        </div>
                      </div>

                      <div style={css.infoItem}>
                        <div style={css.infoLabel}>Observações</div>
                        <div style={css.infoValue}>
                          {renderCampoSensivel(lead, lead.observacoes)}
                        </div>
                      </div>

                      <div style={css.infoItem}>
                        <div style={css.infoLabel}>Mensagem do cliente</div>
                        <div style={css.infoValue}>
                          {renderCampoSensivel(lead, lead.mensagemCliente)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {(completo || isAdmin(corretor)) && (
                    <div style={css.infoSection}>
                      <h4 style={css.infoTitle}>Enquete</h4>
                      <div style={css.infoGrid}>
                        <div style={css.infoItem}>
                          <div style={css.infoLabel}>Enquete enviada</div>
                          <div style={css.infoValue}>
                            {lead.enqueteEnviada ? "Sim" : "Não"}
                          </div>
                        </div>

                        <div style={css.infoItem}>
                          <div style={css.infoLabel}>Enviada em</div>
                          <div style={css.infoValue}>
                            {formatDateTime(lead.enqueteEnviadaAt)}
                          </div>
                        </div>

                        <div style={css.infoItem}>
                          <div style={css.infoLabel}>Respondida</div>
                          <div style={css.infoValue}>
                            {lead.enqueteRespondida ? "Sim" : "Não"}
                          </div>
                        </div>

                        <div style={css.infoItem}>
                          <div style={css.infoLabel}>Resposta</div>
                          <div style={css.infoValue}>{lead.enqueteResposta || "—"}</div>
                        </div>

                        <div style={css.infoItem}>
                          <div style={css.infoLabel}>Tentativas</div>
                          <div style={css.infoValue}>{lead.tentativasEnquete ?? 0}</div>
                        </div>

                        <div style={css.infoItem}>
                          <div style={css.infoLabel}>Última tentativa</div>
                          <div style={css.infoValue}>
                            {formatDateTime(lead.ultimaTentativaEnqueteAt)}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div style={css.actionsRow}>
                    {isDisponivel && !isLeadOwner(lead, corretor) && (
                      <>
                        {bloqueadoBasic ? (
                          <button
                            onClick={() => setModalUpgradeAberto(true)}
                            style={{
                              ...css.actionDisabled,
                              cursor: "pointer",
                              backgroundColor: "#fff7ed",
                              border: "1px solid #fdba74",
                              color: "#9a3412",
                            }}
                          >
                            🔒 Disponível no plano PRO
                          </button>
                        ) : (
                          <button
                            onClick={() => assumirLead(lead.id)}
                            disabled={processando}
                            style={{
                              ...css.actionPrimary,
                              backgroundColor: processando ? "#94a3b8" : "#2563eb",
                              cursor: processando ? "not-allowed" : "pointer",
                              boxShadow: processando
                                ? "none"
                                : "0 10px 20px rgba(37,99,235,0.18)",
                            }}
                          >
                            Assumir lead
                          </button>
                        )}
                      </>
                    )}

                    {isDisponivel && (
                      <button
                        onClick={() => prepararEnquete(lead)}
                        disabled={processando}
                        style={{
                          ...css.actionWarning,
                          backgroundColor: processando ? "#94a3b8" : "#f59e0b",
                          cursor: processando ? "not-allowed" : "pointer",
                          boxShadow: processando
                            ? "none"
                            : "0 10px 20px rgba(245,158,11,0.18)",
                        }}
                      >
                        Preparar enquete
                      </button>
                    )}

                    {aguardandoEnquete && (
                      <>
                        <button
                          onClick={() => responderEnqueteLead(lead.id, "SIM")}
                          disabled={processando}
                          style={{
                            ...css.actionSuccess,
                            backgroundColor: processando ? "#94a3b8" : "#10b981",
                            cursor: processando ? "not-allowed" : "pointer",
                            boxShadow: processando
                              ? "none"
                              : "0 10px 20px rgba(16,185,129,0.18)",
                          }}
                        >
                          Cliente respondeu SIM
                        </button>

                        <button
                          onClick={() => responderEnqueteLead(lead.id, "NAO")}
                          disabled={processando}
                          style={{
                            ...css.actionDanger,
                            backgroundColor: processando ? "#94a3b8" : "#ef4444",
                            cursor: processando ? "not-allowed" : "pointer",
                            boxShadow: processando
                              ? "none"
                              : "0 10px 20px rgba(239,68,68,0.16)",
                          }}
                        >
                          Cliente respondeu NÃO
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
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
                      {extrato.transacoes.map((transacao, index) => {
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
          <div
            style={{
              ...css.modal,
              maxWidth: 560,
            }}
          >
            <h3 style={css.modalTitle}>Desbloqueie o Plano PRO</h3>

            <p style={{ color: "#475569", lineHeight: 1.7, marginTop: 0 }}>
              Faça upgrade para o <strong>Plano PRO</strong> e tenha acesso a leads com
              mais potencial de fechamento e mais informações para conversão.
            </p>

            <div style={{ ...css.infoSection, marginTop: 16 }}>
              <h4 style={css.infoTitle}>No Plano PRO você desbloqueia:</h4>

              <div style={{ display: "grid", gap: 10 }}>
                <div style={css.infoItem}>
                  <div style={css.infoValue}>• Leads Quentes e Leads Prontos</div>
                </div>
                <div style={css.infoItem}>
                  <div style={css.infoValue}>• Mais informações do cliente</div>
                </div>
                <div style={css.infoItem}>
                  <div style={css.infoValue}>• 48h de exclusividade por lead</div>
                </div>
                <div style={css.infoItem}>
                  <div style={css.infoValue}>• Prioridade na distribuição</div>
                </div>
                <div style={css.infoItem}>
                  <div style={css.infoValue}>• Maior chance de fechamento</div>
                </div>
              </div>
            </div>

            <div style={css.modalFooter}>
              <button
                onClick={() => window.open("https://wa.me/558788550592", "_blank")}
                style={css.actionSuccess}
              >
                Falar no WhatsApp
              </button>

              <button
                onClick={() => {
                  alert("Em breve: ativação automática do Plano PRO.");
                }}
                style={css.actionPrimary}
              >
                Fazer upgrade
              </button>

              <button
                onClick={() => setModalUpgradeAberto(false)}
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
    </div>
  );
}
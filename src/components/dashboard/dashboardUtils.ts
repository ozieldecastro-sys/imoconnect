export type FirestoreDateLike =
  | { toDate?: () => Date; toMillis?: () => number }
  | { seconds?: number; nanoseconds?: number }
  | { _seconds?: number; _nanoseconds?: number }
  | null
  | undefined;

export type Corretor = {
  id: string;
  nome: string;
  email?: string;
  tipo?: string;
  tipoUsuario?: string;
  ativo?: boolean;
  plano?: "BASIC" | "PRO" | "ADMIN" | string;
};

export type Lead = {
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
  finalidade?: string;
  area?: string | number;
  faixaValor?: string;
  valorPretendidoAluguel?: number | string | null;
  subtipoInteresse?: string;

  profissao?: string;
  renda?: string | number;
  observacoes?: string;
  motivoMudanca?: string;
  situacaoAtual?: string;
  detalhesInteresse?: string;
  quartos?: string | number;
  entradaDisponivel?: string | number;
  financiamentoAprovado?: string;
  formaPagamento?: string;
  fgts?: string;
  preferenciaImovel?: string;
  mensagemCliente?: string;

  pretendeUsarFgts?: string | null;
  jaFezAnaliseCredito?: string | null;
  faixaRenda?: string | null;
  garantiaLocaticia?: string | null;
  quantidadeMoradores?: string | number | null;
  possuiPet?: string | null;
  imovelQuitado?: string | null;
  aceitaFinanciamentoComprador?: string | null;
  motivoVenda?: string | null;
  aceitaCaucao?: string | null;
  aceitaSeguroFianca?: string | null;
  imovelOcupado?: string | null;

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

export type Transacao = {
  id?: string;
  tipo?: "credito" | "debito" | string;
  valor?: number;
  descricao?: string;
  criadoEm?: FirestoreDateLike;
  saldoAntes?: number;
  saldoDepois?: number;
};

export type ExtratoFinanceiro = {
  saldoAtual: number;
  totalCreditado: number;
  totalDebitado: number;
  transacoes: Transacao[];
};

export type EnviarEnqueteResponse = {
  success?: boolean;
  telefone?: string;
  mensagem?: string;
  leadId?: string;
  status?: string;
  error?: string;
};

export type WebhookRespostaResponse = {
  success?: boolean;
  novoStatus?: string;
  tentativas?: number;
  error?: string;
};

export function getDateFromFirestore(value?: FirestoreDateLike): Date | null {
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

export function getLeadCreatedDate(lead: Lead): Date | null {
  return (
    getDateFromFirestore(lead.createdAt) ||
    getDateFromFirestore(lead.criadoEm) ||
    null
  );
}

export function formatDateTime(value?: FirestoreDateLike): string {
  const date = getDateFromFirestore(value);
  if (!date) return "—";
  return date.toLocaleString("pt-BR");
}

export function formatLeadCreatedDate(lead: Lead): string {
  const date = getLeadCreatedDate(lead);
  if (!date) return "—";
  return date.toLocaleString("pt-BR");
}

export function formatTimeAgoFromLead(lead: Lead): string {
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

export function formatCountdown(value?: FirestoreDateLike): string {
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

export function formatMoeda(valor?: number | string) {
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

function formatValorCurto(valor: number): string {
  if (valor >= 1000000) {
    const emMilhoes = valor / 1000000;
    if (Number.isInteger(emMilhoes)) {
      return `R$ ${emMilhoes} milhão`;
    }
    return `R$ ${emMilhoes.toLocaleString("pt-BR", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    })} milhões`;
  }

  const emMil = Math.round(valor / 1000);
  return `R$ ${emMil.toLocaleString("pt-BR")} mil`;
}

function formatFaixaValorTexto(faixa?: string): string | null {
  const valor = String(faixa || "").trim().toLowerCase();
  if (!valor) return null;

  const mapa: Record<string, string> = {
    "0_150": "Até R$ 150 mil",
    "100_200": "Entre R$ 100 mil e R$ 200 mil",
    "150_300": "Entre R$ 150 mil e R$ 300 mil",
    "200_300": "Entre R$ 200 mil e R$ 300 mil",
    "250_400": "Entre R$ 250 mil e R$ 400 mil",
    "300_500": "Entre R$ 300 mil e R$ 500 mil",
    "400_600": "Entre R$ 400 mil e R$ 600 mil",
    "500_800": "Entre R$ 500 mil e R$ 800 mil",
    "800_1000": "Entre R$ 800 mil e R$ 1 milhão",
    "1000_plus": "Acima de R$ 1 milhão",
    "1000_": "Acima de R$ 1 milhão",
    "1000+": "Acima de R$ 1 milhão",
  };

  if (mapa[valor]) return mapa[valor];

  const matchIntervalo = valor.match(/^(\d+)[_-](\d+)$/);
  if (matchIntervalo) {
    const inicio = Number(matchIntervalo[1]) * 1000;
    const fim = Number(matchIntervalo[2]) * 1000;

    if (!Number.isNaN(inicio) && !Number.isNaN(fim)) {
      return `Entre ${formatValorCurto(inicio)} e ${formatValorCurto(fim)}`;
    }
  }

  const matchAcima = valor.match(/^(\d+)\s*(plus|\+)$/);
  if (matchAcima) {
    const inicio = Number(matchAcima[1]) * 1000;
    if (!Number.isNaN(inicio)) {
      return `Acima de ${formatValorCurto(inicio)}`;
    }
  }

  return null;
}

function normalizarNumero(valor?: string | number | null): number {
  if (valor === undefined || valor === null || valor === "") return 0;

  if (typeof valor === "number") return valor;

  const numero = Number(
    String(valor).replace(/[^\d.,-]/g, "").replace(",", ".")
  );

  return Number.isNaN(numero) ? 0 : numero;
}

function parseFaixaAluguel(valor?: string | number | null): {
  tipo: "unico" | "faixa" | null;
  minimo?: number;
  maximo?: number;
  valor?: number;
} {
  if (valor === undefined || valor === null || valor === "") {
    return { tipo: null };
  }

  if (typeof valor === "number") {
    if (valor > 0 && valor < 100000) {
      return { tipo: "unico", valor };
    }
    return { tipo: null };
  }

  const texto = String(valor).trim().toLowerCase();
  if (!texto) return { tipo: null };

  const matchFaixa = texto.match(/^(\d+)\s*[_-]\s*(\d+)$/);
  if (matchFaixa) {
    const minimo = Number(matchFaixa[1]);
    const maximo = Number(matchFaixa[2]);

    if (
      !Number.isNaN(minimo) &&
      !Number.isNaN(maximo) &&
      minimo > 0 &&
      maximo > 0 &&
      minimo < 100000 &&
      maximo < 100000
    ) {
      return { tipo: "faixa", minimo, maximo };
    }
  }

  const numero = normalizarNumero(texto);
  if (numero > 0 && numero < 100000) {
    return { tipo: "unico", valor: numero };
  }

  return { tipo: null };
}

function formatFaixaAluguel(valor?: string | number | null): string | null {
  const parsed = parseFaixaAluguel(valor);

  if (parsed.tipo === "unico" && parsed.valor) {
    return `${formatMoeda(parsed.valor)}/mês`;
  }

  if (
    parsed.tipo === "faixa" &&
    parsed.minimo !== undefined &&
    parsed.maximo !== undefined
  ) {
    return `Entre ${formatMoeda(parsed.minimo)} e ${formatMoeda(parsed.maximo)}/mês`;
  }

  return null;
}

function getValorEstimadoAluguel(lead: Lead): number {
  const fontes = [
    lead.valorPretendidoAluguel,
    lead.orcamento,
    lead.faixaValor,
    lead.categoriaValor,
  ];

  for (const fonte of fontes) {
    const parsed = parseFaixaAluguel(fonte);

    if (parsed.tipo === "unico" && parsed.valor) {
      return parsed.valor;
    }

    if (
      parsed.tipo === "faixa" &&
      parsed.minimo !== undefined &&
      parsed.maximo !== undefined
    ) {
      return Math.round((parsed.minimo + parsed.maximo) / 2);
    }
  }

  return 1200;
}

export function mascararNome(nome?: string) {
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

export function mascararTelefone(telefone?: string | number) {
  if (!telefone && telefone !== 0) return "—";

  const t = String(telefone).replace(/\D/g, "");
  if (!t) return "—";

  if (t.length <= 5) return `${t.slice(0, 2)}***`;
  return `${t.slice(0, 5)}*****`;
}

export function mascararTexto(texto?: string | number) {
  if (texto === undefined || texto === null || texto === "") return "—";
  return "***************";
}

export function getPlano(corretor: Corretor | null) {
  return (corretor?.plano || "BASIC").toString().toUpperCase();
}

export function isAdmin(corretor: Corretor | null) {
  return (
    (corretor?.tipoUsuario || corretor?.tipo || "").toString().toLowerCase() ===
    "admin"
  );
}

export function isLeadOwner(lead: Lead, corretor: Corretor | null) {
  if (!corretor?.id) return false;
  return lead.corretorAtual === corretor.id || lead.corretorId === corretor.id;
}

export function podeVerCompleto(lead: Lead, corretor: Corretor | null) {
  return isAdmin(corretor) || isLeadOwner(lead, corretor);
}

export function getTipoInteresse(lead: Lead) {
  return lead.tipo || lead.tipoInteresse || lead.objetivo || "—";
}

export function getFaixaValor(lead: Lead) {
  const tipo = String(lead.tipoInteresse || lead.tipo || "").toLowerCase();

  const ehCompraOuVenda = tipo === "compra" || tipo === "venda";
  const ehAluguelOuCaptacao =
    tipo === "aluguel" ||
    tipo === "anunciar" ||
    tipo === "anunciar para alugar" ||
    tipo === "anunciar_para_alugar" ||
    tipo === "captacao" ||
    tipo === "captação" ||
    tipo === "captacao_locacao" ||
    tipo === "captação_locação";

  if (ehAluguelOuCaptacao) {
    const aluguelFormatado =
      formatFaixaAluguel(lead.valorPretendidoAluguel) ||
      formatFaixaAluguel(lead.orcamento) ||
      formatFaixaAluguel(lead.faixaValor) ||
      formatFaixaAluguel(lead.categoriaValor);

    if (aluguelFormatado) return aluguelFormatado;

    if (lead.orcamento) return String(lead.orcamento);
    if (lead.faixaValor) return String(lead.faixaValor);
    if (lead.categoriaValor) return String(lead.categoriaValor);
    return "—";
  }

  if (ehCompraOuVenda) {
    const textoOrcamento = formatFaixaValorTexto(lead.orcamento);
    if (textoOrcamento) return textoOrcamento;

    const textoFaixaValor = formatFaixaValorTexto(lead.faixaValor);
    if (textoFaixaValor) return textoFaixaValor;

    const textoCategoria = formatFaixaValorTexto(lead.categoriaValor);
    if (textoCategoria) return textoCategoria;

    if (lead.orcamento) return String(lead.orcamento);
    if (lead.faixaValor) return String(lead.faixaValor);
    if (lead.categoriaValor) return String(lead.categoriaValor);

    if (lead.valor !== undefined && lead.valor !== null && lead.valor !== "") {
      return formatMoeda(lead.valor);
    }

    return "—";
  }

  const textoOrcamento = formatFaixaValorTexto(lead.orcamento);
  if (textoOrcamento) return textoOrcamento;

  const textoFaixaValor = formatFaixaValorTexto(lead.faixaValor);
  if (textoFaixaValor) return textoFaixaValor;

  const textoCategoria = formatFaixaValorTexto(lead.categoriaValor);
  if (textoCategoria) return textoCategoria;

  if (lead.orcamento) return String(lead.orcamento);
  if (lead.faixaValor) return String(lead.faixaValor);
  if (lead.categoriaValor) return String(lead.categoriaValor);

  if (lead.valor !== undefined && lead.valor !== null && lead.valor !== "") {
    return formatMoeda(lead.valor);
  }

  return "—";
}

export function getStatusLabel(status?: string) {
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

export function getStatusStyles(status?: string) {
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

export function getNivelStyles(nivel?: string) {
  switch ((nivel || "").toLowerCase()) {
    case "oportunidade":
      return {
        label: "Lead em Oportunidade",
        bg: "#eff6ff",
        color: "#1d4ed8",
        border: "1px solid #bfdbfe",
      };

    case "qualificado":
    case "quente":
      return {
        label: "Lead Quente",
        bg: "#fffbeb",
        color: "#b45309",
        border: "1px solid #fcd34d",
      };

    case "prioritario":
    case "prioritário":
    case "pronto":
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

export function getPrecoOriginalPorNivel(nivel?: string): number | null {
  switch ((nivel || "").toLowerCase()) {
    case "oportunidade":
      return 10;
    case "qualificado":
    case "quente":
      return 25;
    case "prioritario":
    case "prioritário":
    case "pronto":
      return 50;
    default:
      return null;
  }
}

export function getPrecoPorPlano(nivel?: string, plano?: string): number | null {
  const planoUpper = (plano || "BASIC").toUpperCase();

  switch ((nivel || "").toLowerCase()) {
    case "oportunidade":
      return planoUpper === "PRO" ? 7 : 10;

    case "qualificado":
    case "quente":
      return planoUpper === "PRO" ? 15 : 25;

    case "prioritario":
    case "prioritário":
    case "pronto":
      return planoUpper === "PRO" ? 30 : 50;

    default:
      return null;
  }
}

function mapFaixaValorParaNumero(faixaValor?: string): number {
  const faixa = String(faixaValor || "").toLowerCase();

  if (faixa.includes("100_200")) return 150000;
  if (faixa.includes("200_300")) return 250000;
  if (faixa.includes("300_500")) return 400000;
  if (faixa.includes("500_800")) return 650000;
  if (faixa.includes("800_1000")) return 900000;
  if (faixa.includes("1000_plus")) return 1300000;
  if (faixa.includes("1000_")) return 1300000;
  if (faixa.includes("2,5") || faixa.includes("2.5")) return 2500000;
  if (faixa.includes("4 milh")) return 4000000;

  return 300000;
}

export function getTextoComissaoPorNivel(nivel?: string) {
  switch ((nivel || "").toLowerCase()) {
    case "oportunidade":
      return "Comissão média";
    case "qualificado":
    case "quente":
      return "Comissão estimada";
    case "prioritario":
    case "prioritário":
    case "pronto":
      return "Comissão provável";
    default:
      return "Comissão estimada";
  }
}

export function calcularValorEstimado(lead: Lead): number {
  const tipo = String(lead.tipoInteresse || lead.tipo || "").toLowerCase();

  if (tipo === "compra" || tipo === "venda") {
    return mapFaixaValorParaNumero(
      lead.faixaValor || lead.categoriaValor || lead.orcamento
    );
  }

  if (
    tipo === "aluguel" ||
    tipo === "anunciar" ||
    tipo === "anunciar para alugar" ||
    tipo === "captacao" ||
    tipo === "captação" ||
    tipo === "captacao_locacao" ||
    tipo === "captação_locação"
  ) {
    return getValorEstimadoAluguel(lead);
  }

  return 0;
}

export function calcularComissaoProvavel(lead: Lead): number {
  const tipo = String(lead.tipoInteresse || lead.tipo || "").toLowerCase();

  if (tipo === "compra" || tipo === "venda") {
    const valorBase = calcularValorEstimado(lead);
    return valorBase * 0.05;
  }

  if (
    tipo === "aluguel" ||
    tipo === "anunciar" ||
    tipo === "anunciar para alugar" ||
    tipo === "captacao" ||
    tipo === "captação" ||
    tipo === "captacao_locacao" ||
    tipo === "captação_locação"
  ) {
    const aluguelBase = calcularValorEstimado(lead);
    return aluguelBase;
  }

  return 0;
}

export function calcularRoiPotencial(lead: Lead, plano?: string): number {
  const comissao = calcularComissaoProvavel(lead);
  const preco = getPrecoPorPlano(lead.nivelLead, plano) || lead.precoLead || 0;

  if (!comissao || !preco) return 0;

  return comissao / preco;
}

export function getInformacoesCliente(lead: Lead): string[] {
  const info: string[] = [];

  if (lead.tipoInteresse === "compra") {
    if (lead.formaPagamento === "financiamento") {
      info.push("Vai financiar");
    }

    if (lead.pretendeUsarFgts === "sim") {
      info.push("Usa FGTS");
    }

    if (lead.entradaDisponivel) {
      info.push("Possui entrada");
    }

    if (lead.jaFezAnaliseCredito === "sim") {
      info.push("Crédito aprovado");
    }

    if (lead.prazo === "imediato") {
      info.push("Compra imediata");
    }

    if (lead.faixaRenda) {
      info.push("Renda compatível");
    }
  }

  if (lead.tipoInteresse === "aluguel") {
    if (lead.faixaRenda) {
      info.push("Renda comprovável");
    }

    if (lead.garantiaLocaticia) {
      info.push("Possui garantia");
    }

    if (lead.quantidadeMoradores) {
      info.push("Já definiu moradores");
    }

    if (lead.possuiPet === "sim") {
      info.push("Possui pet");
    }
  }

  if (lead.tipoInteresse === "venda") {
    if (lead.imovelQuitado === "sim") {
      info.push("Imóvel quitado");
    }

    if (lead.aceitaFinanciamentoComprador === "sim") {
      info.push("Aceita financiamento");
    }

    if (lead.motivoVenda) {
      info.push("Motivado para vender");
    }
  }

  if (
    lead.tipoInteresse === "anunciar_para_alugar" ||
    lead.tipoInteresse === "anunciar" ||
    lead.tipoInteresse === "anunciar para alugar"
  ) {
    if (lead.valorPretendidoAluguel) {
      info.push("Já definiu valor");
    }

    if (lead.aceitaCaucao === "sim") {
      info.push("Aceita caução");
    }

    if (lead.aceitaSeguroFianca === "sim") {
      info.push("Aceita seguro fiança");
    }

    if (lead.imovelOcupado === "sim") {
      info.push("Imóvel ocupado");
    }
  }

  return info;
}
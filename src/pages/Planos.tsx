import { useMemo, useState } from "react";

type PlanoAtual = "BASIC" | "PRO" | "ADMIN";
type CheckoutStatus = "idle" | "loading" | "success" | "error";
type FormaPagamento = "avista" | "parcelado12x";

type CorretorSalvo = {
  id?: string;
  nome?: string;
  email?: string;
  plano?: string;
  cpf?: string;
  telefone?: string;
  celular?: string;
};

type CheckoutResult = {
  success?: boolean;
  ambiente?: string;
  checkoutId?: string;
  checkoutUrl?: string;
  formaPagamento?: string;
  valorExibicao?: string;
  meioPagamentoDisponivel?: string;
  message?: string;
  error?: unknown;
};

type CheckoutResponse = {
  success?: boolean;
  ambiente?: string;
  checkoutId?: string;
  checkoutUrl?: string;
  message?: string;
  error?: unknown;
  result?: CheckoutResult;
};

function apenasNumeros(valor: string | undefined | null) {
  return String(valor || "").replace(/\D/g, "");
}

function extrairMensagemErro(erro: unknown): string {
  if (!erro) {
    return "Não foi possível iniciar o checkout agora.";
  }

  if (typeof erro === "string") {
    return erro;
  }

  if (erro instanceof Error) {
    return erro.message || "Erro inesperado ao iniciar o checkout.";
  }

  if (typeof erro === "object") {
    const e = erro as Record<string, unknown>;

    if (typeof e.message === "string" && e.message.trim()) {
      return e.message;
    }

    if (typeof e.error === "string" && e.error.trim()) {
      return e.error;
    }

    if (typeof e.details === "string" && e.details.trim()) {
      return e.details;
    }

    if (typeof e.msg === "string" && e.msg.trim()) {
      return e.msg;
    }

    if (typeof e.description === "string" && e.description.trim()) {
      return e.description;
    }

    if (
      e.error &&
      typeof e.error === "object" &&
      e.error !== null &&
      typeof (e.error as Record<string, unknown>).message === "string"
    ) {
      return String((e.error as Record<string, unknown>).message);
    }

    if (
      e.result &&
      typeof e.result === "object" &&
      e.result !== null &&
      typeof (e.result as Record<string, unknown>).message === "string"
    ) {
      return String((e.result as Record<string, unknown>).message);
    }

    try {
      return JSON.stringify(erro, null, 2);
    } catch {
      return "Erro inesperado ao iniciar o checkout.";
    }
  }

  return "Erro inesperado ao iniciar o checkout.";
}

function Planos() {
  const [checkoutStatus, setCheckoutStatus] = useState<CheckoutStatus>("idle");
  const [checkoutMensagem, setCheckoutMensagem] = useState("");
  const [checkoutUrlGerada, setCheckoutUrlGerada] = useState("");
  const [formaPagamentoSelecionada, setFormaPagamentoSelecionada] =
    useState<FormaPagamento>("avista");

  const corretorSalvo = useMemo<CorretorSalvo | null>(() => {
    try {
      const raw = localStorage.getItem("corretor");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const planoAtual: PlanoAtual = (() => {
    const plano = String(corretorSalvo?.plano || "BASIC").toUpperCase();
    if (plano === "PRO") return "PRO";
    if (plano === "ADMIN") return "ADMIN";
    return "BASIC";
  })();

  const nomeCorretor = corretorSalvo?.nome || "Corretor";
  const corretorId = corretorSalvo?.id || "";

  const comparativo = [
    {
      criterio: "Faixa de atuação",
      basic: "Entrada no sistema com operação mais enxuta",
      pro: "Operação ampliada para trabalhar oportunidades mais fortes",
    },
    {
      criterio: "Níveis de lead",
      basic: "Lead em Oportunidade",
      pro: "Lead em Oportunidade, Lead Quente e Lead Pronto",
    },
    {
      criterio: "Exclusividade",
      basic: "24 horas por lead",
      pro: "48 horas por lead",
    },
    {
      criterio: "Capacidade operacional",
      basic: "Modelo de entrada",
      pro: "Até 10 leads ativos com mais liberdade comercial",
    },
    {
      criterio: "Poder de decisão",
      basic: "Visão mais limitada",
      pro: "Mais contexto para decidir e agir mais rápido",
    },
  ];

  function handleVoltar() {
    window.history.back();
  }

  function getTextoBotaoPrincipal() {
    if (checkoutEmAndamento) {
      return "Preparando checkout...";
    }

    return "👑 Ativar PRO";
  }

  async function iniciarCheckoutPro() {
    if (!corretorId) {
      setCheckoutStatus("error");
      setCheckoutMensagem(
        "Não foi possível identificar o corretor logado. Saia e entre novamente na plataforma."
      );
      return;
    }

    try {
      setCheckoutStatus("loading");
      setCheckoutMensagem("Preparando seu checkout seguro do Plano PRO...");
      setCheckoutUrlGerada("");

      const enderecoFixo = {
        address: "Rua da Esperanca",
        addressNumber: "86",
        complement: "Apto 501",
        postalCode: "56309664",
        province: "Centro",
        city: "2611101",
      };

      const payload = {
        data: {
          corretorId,
          plano: "PRO_ANUAL",
          formaPagamento: formaPagamentoSelecionada,

          address: enderecoFixo.address,
          addressNumber: enderecoFixo.addressNumber,
          complement: enderecoFixo.complement,
          postalCode: enderecoFixo.postalCode,
          province: enderecoFixo.province,
          city: enderecoFixo.city,

          endereco: {
            address: enderecoFixo.address,
            addressNumber: enderecoFixo.addressNumber,
            complement: enderecoFixo.complement,
            postalCode: enderecoFixo.postalCode,
            province: enderecoFixo.province,
            city: enderecoFixo.city,
          },

          customerData: {
            name: nomeCorretor,
            email: corretorSalvo?.email || "corretor1@teste.com",
            cpfCnpj: apenasNumeros(corretorSalvo?.cpf) || "62868776060",
            phone:
              apenasNumeros(corretorSalvo?.telefone) ||
              apenasNumeros(corretorSalvo?.celular) ||
              "87991345678",
            address: enderecoFixo.address,
            addressNumber: enderecoFixo.addressNumber,
            complement: enderecoFixo.complement,
            postalCode: enderecoFixo.postalCode,
            province: enderecoFixo.province,
            city: enderecoFixo.city,
          },
        },
      };

      const response = await fetch(
        "https://us-central1-imoconnect-9d71c.cloudfunctions.net/criarCheckoutProAsaasSandbox",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const textoBruto = await response.text();

      let responseData: CheckoutResponse | null = null;

      try {
        responseData = textoBruto ? (JSON.parse(textoBruto) as CheckoutResponse) : null;
      } catch {
        responseData = null;
      }

      const resultadoFinal: CheckoutResult = responseData?.result ?? {
        success: responseData?.success,
        ambiente: responseData?.ambiente,
        checkoutId: responseData?.checkoutId,
        checkoutUrl: responseData?.checkoutUrl,
        message: responseData?.message,
        error: responseData?.error,
      };

      if (!response.ok) {
        const mensagemErro =
          extrairMensagemErro(responseData) ||
          extrairMensagemErro(textoBruto) ||
          `Falha ao gerar checkout. HTTP ${response.status}.`;

        throw new Error(mensagemErro);
      }

      if (!resultadoFinal?.success) {
        const mensagemErro =
          extrairMensagemErro(resultadoFinal) ||
          extrairMensagemErro(responseData) ||
          "A function respondeu, mas indicou falha ao gerar o checkout.";

        throw new Error(mensagemErro);
      }

      if (!resultadoFinal?.checkoutUrl) {
        throw new Error(
          "A function respondeu com sucesso, mas não retornou a URL do checkout."
        );
      }

      setCheckoutStatus("success");
      setCheckoutMensagem(
        resultadoFinal.message ||
          "Checkout gerado com sucesso. Abrimos a página de pagamento em uma nova aba."
      );
      setCheckoutUrlGerada(resultadoFinal.checkoutUrl);

      window.open(resultadoFinal.checkoutUrl, "_blank", "noopener,noreferrer");
    } catch (erro) {
      console.error("[Planos] Erro ao iniciar checkout:", erro);

      setCheckoutStatus("error");
      setCheckoutMensagem(extrairMensagemErro(erro));
      setCheckoutUrlGerada("");
    }
  }

  const jaTemPlanoAvancado = planoAtual === "PRO" || planoAtual === "ADMIN";
  const checkoutEmAndamento = checkoutStatus === "loading";

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={handleVoltar}
            className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            ← Voltar
          </button>
        </div>

        <div className="mb-6 overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-blue-900 shadow-xl">
          <div className="grid gap-6 px-6 py-8 lg:grid-cols-[1.35fr_0.85fr] lg:px-8">
            <div className="text-white">
              <div className="inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-blue-100 backdrop-blur">
                👑 Planos ImoConnect
              </div>

              <h1 className="mt-5 max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl">
                Cresça com mais acesso, mais exclusividade e mais chance de conversão
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-200 sm:text-base">
                O PRO foi pensado para o corretor que quer operar com mais
                amplitude, mais velocidade comercial e melhor posição para
                disputar oportunidades mais valiosas dentro da plataforma.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                {!jaTemPlanoAvancado ? (
                  <button
                    onClick={iniciarCheckoutPro}
                    disabled={checkoutEmAndamento}
                    className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-bold text-slate-900 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {getTextoBotaoPrincipal()}
                  </button>
                ) : (
                  <div className="inline-flex items-center justify-center rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-bold text-white">
                    Você já está no plano PRO
                  </div>
                )}
              </div>

              {!jaTemPlanoAvancado && checkoutStatus !== "idle" && (
                <div
                  className={`mt-4 max-w-2xl rounded-2xl border px-4 py-3 text-sm shadow-sm ${
                    checkoutStatus === "success"
                      ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-50"
                      : checkoutStatus === "error"
                      ? "border-rose-400/40 bg-rose-500/15 text-rose-50"
                      : "border-blue-300/30 bg-white/10 text-blue-50"
                  }`}
                >
                  <div className="font-semibold">
                    {checkoutStatus === "loading" && "Iniciando pagamento"}
                    {checkoutStatus === "success" && "Checkout liberado"}
                    {checkoutStatus === "error" &&
                      "Não foi possível abrir o checkout"}
                  </div>

                  <div className="mt-1 whitespace-pre-wrap break-words leading-6">
                    {checkoutMensagem}
                  </div>

                  {checkoutStatus === "success" && checkoutUrlGerada && (
                    <div className="mt-3">
                      <a
                        href={checkoutUrlGerada}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center rounded-xl bg-white px-4 py-2 text-sm font-bold text-slate-900 transition hover:bg-slate-100"
                      >
                        Abrir checkout novamente
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="rounded-3xl bg-white/10 p-6 text-white ring-1 ring-white/10 backdrop-blur">
              <p className="text-sm font-medium text-blue-100">
                Conta atual de {nomeCorretor}
              </p>

              <h2 className="mt-2 text-3xl font-bold">{planoAtual}</h2>

              <p className="mt-3 text-sm leading-6 text-slate-200">
                {planoAtual === "BASIC" &&
                  "Você já opera no sistema, mas ainda está no plano de entrada. O PRO amplia seu alcance comercial e sua capacidade operacional."}
                {planoAtual === "PRO" &&
                  "Você já está no plano ideal para operar com mais amplitude, mais velocidade e mais exclusividade."}
                {planoAtual === "ADMIN" &&
                  "Seu perfil possui acesso superior. Esta tela funciona apenas como referência comercial da estrutura dos planos."}
              </p>

              {!jaTemPlanoAvancado && (
                <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                  <p className="text-xs uppercase tracking-wide text-blue-100">
                    Escolha sua condição de pagamento
                  </p>

                  <div className="mt-3 space-y-3">
                    <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 transition hover:bg-white/10">
                      <input
                        type="radio"
                        name="formaPagamento"
                        checked={formaPagamentoSelecionada === "avista"}
                        onChange={() => setFormaPagamentoSelecionada("avista")}
                        className="mt-1"
                      />
                      <div>
                        <p className="text-base font-bold text-white">À vista</p>
                        <p className="text-sm text-slate-200">
                          R$ 990,00 no plano anual PRO
                        </p>
                      </div>
                    </label>

                    <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 transition hover:bg-white/10">
                      <input
                        type="radio"
                        name="formaPagamento"
                        checked={formaPagamentoSelecionada === "parcelado12x"}
                        onChange={() => setFormaPagamentoSelecionada("parcelado12x")}
                        className="mt-1"
                      />
                      <div>
                        <p className="text-base font-bold text-white">
                          Parcelado no cartão
                        </p>
                        <p className="text-sm text-slate-200">
                          Parcelamento disponível em até 12x de R$ 99,00
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {jaTemPlanoAvancado && (
                <div className="mt-5 rounded-2xl bg-white/10 p-4">
                  <p className="text-xs uppercase tracking-wide text-blue-100">
                    Seu momento no sistema
                  </p>
                  <p className="mt-2 text-sm font-medium text-white">
                    Hoje você já opera em posição mais forte para disputar leads
                    melhores, com mais tempo de exclusividade e melhor capacidade
                    de atendimento.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mb-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                  🔓 BASIC
                </div>

                <h2 className="mt-4 text-2xl font-bold text-slate-900">
                  Plano BASIC
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  A porta de entrada para começar a operar dentro da plataforma
                  com estrutura mais simples.
                </p>
              </div>

              <div className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                {planoAtual === "BASIC" ? "Seu plano hoje" : "Disponível"}
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-500">
                Faixa de acesso
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                Lead em Oportunidade
              </p>
              <p className="mt-2 text-sm text-slate-600">
                Operação de entrada com menor barreira e menor complexidade.
              </p>
            </div>

            <div className="mt-6 space-y-3">
              <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                ✅ Visualiza os leads disponíveis no sistema
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                ✅ Assume Lead em Oportunidade
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                ✅ Exclusividade de 24 horas por lead
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                ✅ Modelo ideal para iniciar operação
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                ✅ Visão mais limitada para decisão comercial
              </div>
            </div>
          </div>

          <div className="relative rounded-3xl bg-white p-6 shadow-xl ring-2 ring-blue-600">
            <div className="absolute right-5 top-5 rounded-full bg-blue-600 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
              Mais recomendado
            </div>

            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
                  ⚡ PRO
                </div>

                <h2 className="mt-4 text-2xl font-bold text-slate-900">
                  Plano PRO
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  O plano ideal para o corretor que quer operar com mais acesso,
                  mais velocidade e mais resultado.
                </p>
              </div>

              <div className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                {planoAtual === "PRO" || planoAtual === "ADMIN"
                  ? "Seu plano hoje"
                  : "Upgrade"}
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-blue-50 p-5 ring-1 ring-blue-100">
                <p className="text-sm font-semibold text-blue-700">
                  Faixa de acesso
                </p>
                <p className="mt-2 text-2xl font-bold text-slate-900">
                  Todos os níveis
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Lead em Oportunidade, Lead Quente e Lead Pronto.
                </p>
              </div>

              <div className="rounded-2xl bg-slate-900 p-5 text-white">
                <p className="text-sm font-semibold text-blue-200">
                  Exclusividade
                </p>
                <p className="mt-2 text-2xl font-bold">48h</p>
                <p className="mt-2 text-sm leading-6 text-slate-200">
                  Mais tempo para abordar, negociar e converter.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                ✅ Assume Lead em Oportunidade, Lead Quente e Lead Pronto
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                ✅ Exclusividade de 48 horas por lead
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                ✅ Mais contexto comercial para decidir melhor
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                ✅ Melhor posição para disputar leads mais valiosos
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                ✅ Estrutura ideal para escalar atendimento e fechamento
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-gradient-to-r from-slate-950 to-slate-800 p-5 text-white">
              <p className="text-sm font-semibold text-blue-200">
                Por que o PRO entrega mais resultado?
              </p>
              <p className="mt-2 text-sm leading-7 text-slate-200">
                Porque amplia acesso, aumenta exclusividade e melhora sua
                capacidade de decisão comercial. Na prática, isso coloca o
                corretor em melhor posição para agir antes da concorrência e
                trabalhar melhor cada oportunidade.
              </p>
            </div>

            {!jaTemPlanoAvancado && (
              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-semibold text-slate-500">
                  Assinatura anual
                </p>

                {formaPagamentoSelecionada === "avista" ? (
                  <>
                    <p className="mt-2 text-3xl font-bold text-slate-900">
                      R$ 990,00
                    </p>
                    <p className="mt-2 text-sm text-slate-600">
                      Pagamento à vista no plano anual PRO
                    </p>
                  </>
                ) : (
                  <>
                    <p className="mt-2 text-3xl font-bold text-slate-900">
                      Até 12x de R$ 99,00
                    </p>
                    <p className="mt-2 text-sm text-slate-600">
                      Parcelamento disponível no cartão no plano anual PRO
                    </p>
                  </>
                )}
              </div>
            )}

            <div className="mt-6">
              {jaTemPlanoAvancado ? (
                <button
                  disabled
                  className="inline-flex w-full items-center justify-center rounded-2xl bg-emerald-600 px-5 py-4 text-sm font-bold text-white opacity-90"
                >
                  Você já está no plano PRO
                </button>
              ) : (
                <button
                  onClick={iniciarCheckoutPro}
                  disabled={checkoutEmAndamento}
                  className="inline-flex w-full items-center justify-center rounded-2xl bg-blue-600 px-5 py-4 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {getTextoBotaoPrincipal()}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="mb-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="mb-5">
            <h3 className="text-xl font-bold text-slate-900">
              Comparativo direto
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              Veja lado a lado o ganho estratégico de sair do BASIC para o PRO.
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <div className="hidden grid-cols-3 bg-slate-100 text-sm font-bold text-slate-800 md:grid">
              <div className="border-r border-slate-200 p-4">Critério</div>
              <div className="border-r border-slate-200 p-4">BASIC</div>
              <div className="p-4">PRO</div>
            </div>

            <div className="md:hidden">
              {comparativo.map((item) => (
                <div
                  key={item.criterio}
                  className="border-t border-slate-200 p-4 first:border-t-0"
                >
                  <p className="font-bold text-slate-900">{item.criterio}</p>
                  <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Basic
                  </p>
                  <p className="mt-1 text-sm text-slate-700">{item.basic}</p>
                  <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-blue-600">
                    Pro
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-800">
                    {item.pro}
                  </p>
                </div>
              ))}
            </div>

            <div className="hidden md:block">
              {comparativo.map((item) => (
                <div
                  key={item.criterio}
                  className="grid grid-cols-3 border-t border-slate-200"
                >
                  <div className="bg-white p-4 font-semibold text-slate-900">
                    {item.criterio}
                  </div>
                  <div className="bg-white p-4 text-sm text-slate-700">
                    {item.basic}
                  </div>
                  <div className="bg-blue-50 p-4 text-sm font-medium text-slate-800">
                    {item.pro}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <h3 className="text-xl font-bold text-slate-900">
                Resumo estratégico
              </h3>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                O BASIC coloca você na operação. O PRO coloca você em posição
                comercial mais forte para abordar melhor, disputar mais rápido e
                converter com mais qualidade.
              </p>
            </div>

            {!jaTemPlanoAvancado ? (
              <button
                onClick={iniciarCheckoutPro}
                disabled={checkoutEmAndamento}
                className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-4 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {checkoutEmAndamento ? "Gerando checkout..." : "👑 Ativar PRO"}
              </button>
            ) : (
              <div className="rounded-2xl bg-emerald-50 px-5 py-4 text-sm font-semibold text-emerald-700">
                Sua operação já está no nível premium
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Planos;
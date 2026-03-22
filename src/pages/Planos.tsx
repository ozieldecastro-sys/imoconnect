import { useMemo } from "react";

type PlanoAtual = "BASIC" | "PRO" | "ADMIN";

function Planos() {
  const corretorSalvo = useMemo(() => {
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
  const whatsappUpgrade = "https://wa.me/558788550592";

  const recursos = [
    {
      categoria: "Tipos de lead",
      basic: "Acesso para assumir apenas Lead em Oportunidade",
      pro: "Acesso para assumir Lead em Oportunidade, Lead Quente e Lead Pronto",
    },
    {
      categoria: "Exclusividade",
      basic: "24 horas de exclusividade por lead assumido",
      pro: "48 horas de exclusividade por lead assumido",
    },
    {
      categoria: "Visualização de dados",
      basic: "Dados mais limitados do lead",
      pro: "Mais contexto e visão ampliada dos dados do lead",
    },
    {
      categoria: "Prioridade comercial",
      basic: "Entrada no sistema com acesso inicial",
      pro: "Posicionamento comercial mais forte para operar leads de maior valor",
    },
    {
      categoria: "Potencial de conversão",
      basic: "Foco em volume inicial e operação básica",
      pro: "Foco em velocidade, qualidade e maior chance de fechamento",
    },
  ];

  function handleVoltar() {
    window.history.back();
  }

  function handleUpgrade() {
    const mensagem = encodeURIComponent(
      `Olá! Quero fazer upgrade do meu plano no ImoConnect.\n\nNome: ${nomeCorretor}\nPlano atual: ${planoAtual}\nInteresse: Upgrade para PRO`
    );

    window.open(`${whatsappUpgrade}?text=${mensagem}`, "_blank");
  }

  function renderStatusBadge(plano: "BASIC" | "PRO") {
    const isAtual =
      planoAtual === "ADMIN" ? plano === "PRO" : planoAtual === plano;

    if (planoAtual === "ADMIN" && plano === "BASIC") {
      return (
        <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          <span>🔒</span>
          ADMIN tem acesso superior
        </span>
      );
    }

    if (isAtual) {
      return (
        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
          <span>✅</span>
          Plano atual
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
        <span>⭐</span>
        Disponível para upgrade
      </span>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
              <span>👑</span>
              Planos ImoConnect
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Escolha o plano ideal para escalar seus resultados
            </h1>

            <p className="mt-2 max-w-3xl text-sm text-slate-600 sm:text-base">
              O plano PRO foi pensado para o corretor que quer operar com mais
              velocidade, acessar leads mais valiosos e aumentar a chance de
              fechamento.
            </p>
          </div>

          <button
            onClick={handleVoltar}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            <span>←</span>
            Voltar
          </button>
        </div>

        <div className="mb-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-blue-900 p-6 text-white shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-medium text-blue-100">
                Conta atual de {nomeCorretor}
              </p>
              <h2 className="mt-1 text-2xl font-bold">
                Seu plano atual: {planoAtual}
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-slate-200">
                {planoAtual === "BASIC" &&
                  "Você já pode operar no sistema, mas ainda está limitado aos leads de entrada. O upgrade libera acesso comercial mais forte."}
                {planoAtual === "PRO" &&
                  "Você já está no nível ideal para operar com mais força comercial, maior exclusividade e acesso ampliado aos leads."}
                {planoAtual === "ADMIN" &&
                  "Seu perfil tem acesso superior aos recursos da plataforma. Esta página segue útil como referência comercial dos planos."}
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 px-5 py-4 backdrop-blur">
              <p className="text-xs uppercase tracking-wide text-blue-100">
                Objetivo desta tela
              </p>
              <p className="mt-1 text-sm font-medium text-white">
                Deixar clara a diferença entre operar no básico e crescer com o
                PRO
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                  <span>🔓</span>
                  Plano BASIC
                </div>

                <h3 className="text-2xl font-bold text-slate-900">BASIC</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Ideal para entrada no sistema e operação inicial.
                </p>
              </div>

              {renderStatusBadge("BASIC")}
            </div>

            <div className="mb-6 rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200">
              <p className="text-sm font-medium text-slate-600">
                Perfil do plano
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                Indicado para quem está começando na plataforma e quer validar a
                operação com menor complexidade.
              </p>
            </div>

            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-slate-700">
                <span className="mt-0.5">✅</span>
                Pode visualizar os leads disponíveis no sistema
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-700">
                <span className="mt-0.5">✅</span>
                Pode assumir apenas Lead em Oportunidade
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-700">
                <span className="mt-0.5">✅</span>
                Exclusividade de 24 horas
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-700">
                <span className="mt-0.5">✅</span>
                Acesso inicial para operação comercial
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-700">
                <span className="mt-0.5">✅</span>
                Visualização mais limitada dos dados do lead
              </li>
            </ul>
          </div>

          <div className="relative overflow-hidden rounded-3xl border-2 border-blue-600 bg-white p-6 shadow-lg">
            <div className="absolute right-4 top-4 rounded-full bg-blue-600 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
              Mais recomendado
            </div>

            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
                  <span>⚡</span>
                  Plano PRO
                </div>

                <h3 className="text-2xl font-bold text-slate-900">PRO</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Para o corretor que quer mais velocidade, acesso e resultado.
                </p>
              </div>

              {renderStatusBadge("PRO")}
            </div>

            <div className="mb-6 rounded-2xl bg-blue-50 p-5 ring-1 ring-blue-100">
              <p className="text-sm font-medium text-blue-700">
                Perfil do plano
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                Indicado para quem quer operar com maior força comercial,
                aproveitar leads de maior valor e ter mais espaço para
                conversão.
              </p>
            </div>

            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-slate-700">
                <span className="mt-0.5">✅</span>
                Pode assumir Lead em Oportunidade, Lead Quente e Lead Pronto
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-700">
                <span className="mt-0.5">✅</span>
                Exclusividade de 48 horas por lead
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-700">
                <span className="mt-0.5">✅</span>
                Mais contexto comercial para tomar decisão melhor
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-700">
                <span className="mt-0.5">✅</span>
                Melhor posição para operar leads mais valiosos
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-700">
                <span className="mt-0.5">✅</span>
                Plano pensado para escalar atendimento e conversão
              </li>
            </ul>

            <div className="mt-6 rounded-2xl bg-slate-900 p-5 text-white">
              <p className="text-sm font-semibold text-blue-200">
                Por que o PRO converte melhor?
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-200">
                Porque ele aumenta acesso, tempo de exclusividade e capacidade
                de decisão comercial. Na prática, isso dá ao corretor mais
                chance de trabalhar leads melhores antes da concorrência.
              </p>
            </div>

            <div className="mt-6">
              {planoAtual === "PRO" || planoAtual === "ADMIN" ? (
                <button
                  disabled
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-4 text-sm font-bold text-white opacity-90"
                >
                  <span>✅</span>
                  {planoAtual === "ADMIN"
                    ? "Seu perfil já está acima do PRO"
                    : "Você já está no plano PRO"}
                </button>
              ) : (
                <button
                  onClick={handleUpgrade}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-4 text-sm font-bold text-white transition hover:bg-blue-700"
                >
                  <span>👑</span>
                  Quero fazer upgrade para PRO
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-xl font-bold text-slate-900">
            Comparativo direto
          </h2>

          <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
            <div className="grid grid-cols-1 border-b border-slate-200 bg-slate-100 text-sm font-bold text-slate-800 md:grid-cols-3">
              <div className="p-4">Critério</div>
              <div className="p-4">BASIC</div>
              <div className="p-4">PRO</div>
            </div>

            {recursos.map((item) => (
              <div
                key={item.categoria}
                className="grid grid-cols-1 border-b border-slate-200 last:border-b-0 md:grid-cols-3"
              >
                <div className="bg-white p-4 font-semibold text-slate-900">
                  {item.categoria}
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

        <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Resumo estratégico
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                O BASIC coloca você no jogo. O PRO coloca você em posição de
                competir melhor pelos resultados.
              </p>
            </div>

            {planoAtual === "BASIC" ? (
              <button
                onClick={handleUpgrade}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-4 text-sm font-bold text-white transition hover:bg-slate-800"
              >
                <span>👑</span>
                Falar agora sobre upgrade PRO
              </button>
            ) : (
              <div className="rounded-2xl bg-emerald-50 px-5 py-4 text-sm font-semibold text-emerald-700">
                Seu plano atual já permite operação avançada
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Planos;
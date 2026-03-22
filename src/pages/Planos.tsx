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
      basic: "Assume apenas Lead em Oportunidade",
      pro: "Assume Lead em Oportunidade, Lead Quente e Lead Pronto",
    },
    {
      categoria: "Exclusividade",
      basic: "24 horas por lead assumido",
      pro: "48 horas por lead assumido",
    },
    {
      categoria: "Visualização",
      basic: "Dados mais limitados",
      pro: "Mais contexto e visão comercial ampliada",
    },
    {
      categoria: "Potencial comercial",
      basic: "Operação de entrada",
      pro: "Operação com mais força e chance de fechamento",
    },
    {
      categoria: "Posicionamento",
      basic: "Base inicial dentro da plataforma",
      pro: "Maior poder de atuação sobre leads mais valiosos",
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

  function renderBadge(plano: "BASIC" | "PRO") {
    const isAtual =
      planoAtual === "ADMIN" ? plano === "PRO" : planoAtual === plano;

    if (planoAtual === "ADMIN" && plano === "BASIC") {
      return (
        <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          🔒 Acesso superior
        </span>
      );
    }

    if (isAtual) {
      return (
        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
          ✅ Plano atual
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
        ⭐ Disponível para upgrade
      </span>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-blue-900 shadow-xl">
          <div className="grid gap-8 px-6 py-8 lg:grid-cols-[1.4fr_0.9fr] lg:px-8">
            <div className="text-white">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-blue-100 backdrop-blur">
                👑 Planos ImoConnect
              </div>

              <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
                Cresça com mais acesso, mais exclusividade e mais chance de conversão
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-200 sm:text-base">
                O plano PRO foi desenhado para o corretor que quer operar com
                mais força comercial, trabalhar leads de maior valor e aumentar
                seu potencial de resultado dentro da plataforma.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={handleUpgrade}
                  className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-bold text-slate-900 transition hover:bg-slate-100"
                >
                  Quero fazer upgrade para PRO
                </button>

                <button
                  onClick={handleVoltar}
                  className="inline-flex items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  ← Voltar
                </button>
              </div>
            </div>

            <div className="rounded-3xl bg-white/10 p-6 text-white ring-1 ring-white/10 backdrop-blur">
              <p className="text-sm font-medium text-blue-100">
                Conta atual de {nomeCorretor}
              </p>

              <h2 className="mt-2 text-2xl font-bold">
                Plano atual: {planoAtual}
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-200">
                {planoAtual === "BASIC" &&
                  "Você já está dentro da operação, mas ainda limitado aos leads de entrada. O PRO libera acesso comercial mais forte."}
                {planoAtual === "PRO" &&
                  "Você já está no plano mais indicado para operar com mais velocidade, amplitude e exclusividade."}
                {planoAtual === "ADMIN" &&
                  "Seu perfil possui acesso superior. Esta página funciona como referência comercial dos planos."}
              </p>

              <div className="mt-5 rounded-2xl bg-white/10 p-4">
                <p className="text-xs uppercase tracking-wide text-blue-100">
                  Objetivo desta tela
                </p>
                <p className="mt-2 text-sm font-medium text-white">
                  Mostrar de forma clara por que o PRO gera melhor posicionamento comercial
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                  🔓 BASIC
                </div>
                <h3 className="mt-4 text-2xl font-bold text-slate-900">
                  Plano BASIC
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Entrada oficial na plataforma para começar a operar com menor complexidade.
                </p>
              </div>

              {renderBadge("BASIC")}
            </div>

            <div className="mb-6 rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200">
              <p className="text-sm font-semibold text-slate-800">
                Ideal para
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Corretores que estão começando dentro do ImoConnect e querem validar a operação inicial.
              </p>
            </div>

            <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-sm font-semibold text-slate-500">
                Faixa de acesso
              </p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                Lead em Oportunidade
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Operação de entrada com menor barreira e menor complexidade.
              </p>
            </div>

            <ul className="space-y-3">
              <li className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                ✅ Visualiza os leads disponíveis no sistema
              </li>
              <li className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                ✅ Assume apenas Lead em Oportunidade
              </li>
              <li className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                ✅ Exclusividade de 24 horas
              </li>
              <li className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                ✅ Operação comercial inicial
              </li>
              <li className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                ✅ Dados mais limitados do lead
              </li>
            </ul>
          </div>

          <div className="relative overflow-hidden rounded-3xl bg-white p-6 shadow-xl ring-2 ring-blue-600">
            <div className="absolute right-5 top-5 rounded-full bg-blue-600 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
              Mais recomendado
            </div>

            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
                  ⚡ PRO
                </div>
                <h3 className="mt-4 text-2xl font-bold text-slate-900">
                  Plano PRO
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  O plano ideal para o corretor que quer mais velocidade, alcance e resultado.
                </p>
              </div>

              {renderBadge("PRO")}
            </div>

            <div className="mb-6 grid gap-4 md:grid-cols-2">
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

            <ul className="space-y-3">
              <li className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                ✅ Assume Lead em Oportunidade, Lead Quente e Lead Pronto
              </li>
              <li className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                ✅ Exclusividade de 48 horas por lead
              </li>
              <li className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                ✅ Mais contexto comercial para decidir melhor
              </li>
              <li className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                ✅ Melhor posição para operar leads mais valiosos
              </li>
              <li className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                ✅ Estrutura ideal para escalar atendimento e fechamento
              </li>
            </ul>

            <div className="mt-6 rounded-2xl bg-gradient-to-r from-slate-950 to-slate-800 p-5 text-white">
              <p className="text-sm font-semibold text-blue-200">
                Por que o PRO vende melhor?
              </p>
              <p className="mt-2 text-sm leading-7 text-slate-200">
                Porque ele amplia acesso, aumenta exclusividade e melhora a capacidade
                de decisão comercial. Na prática, isso coloca o corretor em melhor
                posição para agir antes da concorrência.
              </p>
            </div>

            <div className="mt-6">
              {planoAtual === "PRO" || planoAtual === "ADMIN" ? (
                <button
                  disabled
                  className="inline-flex w-full items-center justify-center rounded-2xl bg-emerald-600 px-5 py-4 text-sm font-bold text-white opacity-90"
                >
                  {planoAtual === "ADMIN"
                    ? "Seu perfil já está acima do PRO"
                    : "Você já está no plano PRO"}
                </button>
              ) : (
                <button
                  onClick={handleUpgrade}
                  className="inline-flex w-full items-center justify-center rounded-2xl bg-blue-600 px-5 py-4 text-sm font-bold text-white transition hover:bg-blue-700"
                >
                  👑 Quero fazer upgrade para PRO
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Comparativo direto
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Veja lado a lado o ganho estratégico de sair do BASIC para o PRO.
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <div className="grid grid-cols-1 bg-slate-100 text-sm font-bold text-slate-800 md:grid-cols-3">
              <div className="border-b border-slate-200 p-4 md:border-b-0 md:border-r">
                Critério
              </div>
              <div className="border-b border-slate-200 p-4 md:border-b-0 md:border-r">
                BASIC
              </div>
              <div className="p-4">PRO</div>
            </div>

            {recursos.map((item) => (
              <div
                key={item.categoria}
                className="grid grid-cols-1 border-t border-slate-200 md:grid-cols-3"
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
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                O BASIC coloca você na operação. O PRO coloca você em uma posição
                comercial muito mais forte para disputar, abordar e converter melhor.
              </p>
            </div>

            {planoAtual === "BASIC" ? (
              <button
                onClick={handleUpgrade}
                className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-4 text-sm font-bold text-white transition hover:bg-slate-800"
              >
                👑 Falar agora sobre upgrade PRO
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
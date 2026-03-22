import { useEffect, useMemo, useState } from "react";
import { httpsCallable } from "firebase/functions";
import { functions } from "../firebase";
import { useNavigate } from "react-router-dom";

type Transacao = {
  id: string;
  tipo: "credito" | "debito";
  valor: number;
  descricao: string;
  createdAt?: any;
};

export default function Extrato() {
  const [saldo, setSaldo] = useState(0);
  const [totalCreditado, setTotalCreditado] = useState(0);
  const [totalDebitado, setTotalDebitado] = useState(0);
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const corretorNome = useMemo(() => {
    try {
      const stored = localStorage.getItem("corretor");
      if (!stored) return "Corretor";
      const corretor = JSON.parse(stored);
      return corretor?.nome || "Corretor";
    } catch {
      return "Corretor";
    }
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("corretor");

    if (!stored) {
      navigate("/login");
      return;
    }

    const corretor = JSON.parse(stored);
    carregarExtrato(corretor.id);
  }, [navigate]);

  async function carregarExtrato(corretorId: string) {
    try {
      const obterExtrato = httpsCallable(functions, "obterExtratoFinanceiro");
      const response: any = await obterExtrato({ corretorId });
      const data = response.data;

      setSaldo(Number(data.saldoAtual || 0));
      setTotalCreditado(Number(data.totalCreditado || 0));
      setTotalDebitado(Number(data.totalDebitado || 0));
      setTransacoes(data.transacoes || []);
    } catch (error) {
      console.error("Erro ao carregar extrato:", error);
      alert("Erro ao carregar extrato.");
    } finally {
      setLoading(false);
    }
  }

  function formatarData(timestamp: any) {
    if (!timestamp) return "—";

    try {
      if (typeof timestamp === "number") {
        return new Date(timestamp).toLocaleString("pt-BR");
      }

      if (timestamp?._seconds) {
        return new Date(timestamp._seconds * 1000).toLocaleString("pt-BR");
      }

      if (typeof timestamp === "string") {
        return new Date(timestamp).toLocaleString("pt-BR");
      }

      return "—";
    } catch {
      return "—";
    }
  }

  function formatarMoeda(valor: number) {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <div className="rounded-3xl bg-white px-6 py-5 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200">
          Carregando extrato...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-900 shadow-xl">
          <div className="grid gap-8 px-6 py-8 lg:grid-cols-[1.3fr_0.8fr] lg:px-8">
            <div className="text-white">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-emerald-100 backdrop-blur">
                💰 Extrato Financeiro
              </div>

              <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
                Controle financeiro claro para acompanhar sua operação
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-200 sm:text-base">
                Veja seu saldo atual, acompanhe créditos e débitos e tenha visão
                completa das movimentações que impactam sua atuação dentro do ImoConnect.
              </p>

              <div className="mt-6">
                <button
                  onClick={() => navigate("/")}
                  className="inline-flex items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  ← Voltar para o dashboard
                </button>
              </div>
            </div>

            <div className="rounded-3xl bg-white/10 p-6 text-white ring-1 ring-white/10 backdrop-blur">
              <p className="text-sm font-medium text-emerald-100">
                Conta de {corretorNome}
              </p>
              <p className="mt-2 text-sm text-slate-200">
                Visão consolidada do seu financeiro na plataforma
              </p>

              <div className="mt-5 rounded-2xl bg-white/10 p-5">
                <p className="text-sm font-medium text-emerald-100">Saldo atual</p>
                <h2 className="mt-2 text-3xl font-bold">
                  {formatarMoeda(saldo)}
                </h2>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm font-medium text-slate-500">Saldo atual</p>
            <h3 className="mt-3 text-3xl font-bold text-slate-900">
              {formatarMoeda(saldo)}
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Valor disponível para operar na plataforma.
            </p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm font-medium text-slate-500">Total creditado</p>
            <h3 className="mt-3 text-3xl font-bold text-emerald-600">
              {formatarMoeda(totalCreditado)}
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Soma de todas as entradas registradas.
            </p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm font-medium text-slate-500">Total debitado</p>
            <h3 className="mt-3 text-3xl font-bold text-red-600">
              {formatarMoeda(totalDebitado)}
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Soma de todos os débitos vinculados à operação.
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Histórico de transações
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Acompanhe entradas e saídas que movimentaram seu saldo.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
              {transacoes.length} transaç{transacoes.length === 1 ? "ão" : "ões"}
            </div>
          </div>

          {transacoes.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
              <p className="text-lg font-semibold text-slate-700">
                Nenhuma transação encontrada
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Assim que houver movimentações, elas aparecerão aqui.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {transacoes.map((t) => (
                <div
                  key={t.id}
                  className="rounded-3xl border border-slate-200 bg-slate-50 p-5 transition hover:bg-white"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                            t.tipo === "credito"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {t.tipo === "credito" ? "CRÉDITO" : "DÉBITO"}
                        </span>

                        <span className="text-xs font-medium text-slate-500">
                          {formatarData(t.createdAt)}
                        </span>
                      </div>

                      <h3 className="mt-3 text-lg font-bold text-slate-900">
                        {t.descricao || "Transação"}
                      </h3>

                      <p className="mt-1 text-sm text-slate-600">
                        Movimentação registrada no extrato financeiro da conta.
                      </p>
                    </div>

                    <div className="shrink-0">
                      <div
                        className={`rounded-2xl px-4 py-3 text-right ${
                          t.tipo === "credito"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        <p className="text-xs font-semibold uppercase tracking-wide">
                          Valor
                        </p>
                        <p className="mt-1 text-xl font-bold">
                          {t.tipo === "credito" ? "+" : "-"} {formatarMoeda(t.valor)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
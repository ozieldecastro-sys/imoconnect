import { useEffect, useState } from "react";
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
      console.log("TRANSACOES:", data.transacoes);

      setSaldo(data.saldoAtual || 0);
      setTotalCreditado(data.totalCreditado || 0);
      setTotalDebitado(data.totalDebitado || 0);
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
      // Caso venha como número
      if (typeof timestamp === "number") {
        return new Date(timestamp).toLocaleString("pt-BR");
      }

      // Caso venha como objeto {_seconds, _nanoseconds}
      if (timestamp._seconds) {
        return new Date(timestamp._seconds * 1000).toLocaleString("pt-BR");
      }

      // Caso venha como string
      if (typeof timestamp === "string") {
        return new Date(timestamp).toLocaleString("pt-BR");
      }

      return "—";
    } catch {
      return "—";
    }
  }

  if (loading) return <p>Carregando extrato...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h2>💰 Extrato Financeiro</h2>

      <button
        onClick={() => navigate("/")}
        style={{
          marginBottom: 20,
          padding: "6px 12px",
          backgroundColor: "#6b7280",
          color: "white",
          border: "none",
          borderRadius: 6,
          cursor: "pointer",
        }}
      >
        ← Voltar
      </button>

      <div
        style={{
          background: "#f3f4f6",
          padding: 20,
          borderRadius: 10,
          marginBottom: 20,
        }}
      >
        <h1 style={{ margin: 0 }}>R$ {saldo}</h1>
        <p>Saldo Atual</p>

        <div style={{ display: "flex", gap: 20, marginTop: 10 }}>
          <p style={{ color: "green" }}>
            + R$ {totalCreditado} creditado
          </p>
          <p style={{ color: "red" }}>
            - R$ {totalDebitado} debitado
          </p>
        </div>
      </div>

      <h3>📋 Transações</h3>

      {transacoes.length === 0 && <p>Nenhuma transação encontrada.</p>}

      {transacoes.map((t) => (
        <div
          key={t.id}
          style={{
            border: "1px solid #ddd",
            padding: 12,
            borderRadius: 8,
            marginBottom: 10,
          }}
        >
          <p><strong>{t.descricao || "Transação"}</strong></p>
          <p>Data: {formatarData(t.createdAt)}</p>
          <p
            style={{
              color: t.tipo === "credito" ? "green" : "red",
              fontWeight: "bold",
            }}
          >
            {t.tipo === "credito" ? "+" : "-"} R$ {t.valor}
          </p>
        </div>
      ))}
    </div>
  );
}
import { useEffect, useState } from "react";
import { db, functions } from "../firebase";
import { collection, query, where, getDocs, DocumentData } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";

type TipoLead = "compra" | "aluguel" | "venda" | "anunciar";
type PrazoLead = "imediato" | "curto" | "planejando" | "pesquisando";

export default function CaptureLead() {
  const [tipo, setTipo] = useState<TipoLead | "">("");
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [valorReal, setValorReal] = useState<number | null>(null);
  const [valorInput, setValorInput] = useState("");
  const [cidade, setCidade] = useState<"Juazeiro" | "Petrolina" | "">("");
  const [bairro, setBairro] = useState("");
  const [bairrosDisponiveis, setBairrosDisponiveis] = useState<DocumentData[]>([]);
  const [endereco, setEndereco] = useState("");
  const [prazo, setPrazo] = useState<PrazoLead | "">("");
  const [formaPagamento, setFormaPagamento] = useState("");
  const [tipoImovel, setTipoImovel] = useState("");
  const [documentacao, setDocumentacao] = useState("");
  const [numQuartos, setNumQuartos] = useState("");
  const [areaImovel, setAreaImovel] = useState("");
  const [observacoes, setObservacoes] = useState("");

  useEffect(() => {
    if (!cidade) {
      setBairrosDisponiveis([]);
      return;
    }

    const fetchBairros = async () => {
      const q = query(collection(db, "bairros"), where("cidade", "==", cidade));
      const snapshot = await getDocs(q);
      const lista: DocumentData[] = [];
      snapshot.forEach((doc) => lista.push(doc.data()));
      setBairrosDisponiveis(lista);
    };

    fetchBairros();
  }, [cidade]);

  const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let apenasNumeros = e.target.value.replace(/\D/g, "");
    if (!apenasNumeros) {
      setValorInput("");
      setValorReal(null);
      return;
    }

    const valorNumero = parseInt(apenasNumeros, 10) / 100;
    setValorReal(valorNumero);

    const valorFormatado = valorNumero.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

    setValorInput(valorFormatado);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nome || !telefone || !tipo || !cidade || !bairro) {
      alert("Preencha todos os campos obrigatórios!");
      return;
    }

    const leadData = {
      nome,
      telefone,
      tipo,
      valor: valorReal || 0,
      prazo: prazo || "pesquisando",
      cidade,
      bairro,
      endereco: endereco || null,
      formaPagamento: formaPagamento || null,
      tipoImovel: tipoImovel || null,
      documentacao: documentacao || null,
      numQuartos: numQuartos || null,
      areaImovel: areaImovel || null,
      observacoes: observacoes || null,
    };

    try {
      const criarLeadFunction = httpsCallable(functions, "criarLead");
      await criarLeadFunction(leadData);

      alert("Interesse enviado com sucesso!");

      // Reset
      setNome("");
      setTelefone("");
      setValorInput("");
      setValorReal(null);
      setCidade("");
      setBairro("");
      setEndereco("");
      setPrazo("");
      setFormaPagamento("");
      setTipoImovel("");
      setDocumentacao("");
      setNumQuartos("");
      setAreaImovel("");
      setObservacoes("");
      setTipo("");
    } catch (err) {
      console.error("Erro ao chamar function:", err);
      alert("Erro ao enviar interesse!");
    }
  };

  const blocoStyle: React.CSSProperties = {
    border: "1px solid #e2e8f0",
    padding: "24px",
    marginBottom: "24px",
    borderRadius: "12px",
    backgroundColor: "#ffffff",
    boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    marginBottom: "6px",
    fontWeight: 600,
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px",
    marginBottom: "16px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    boxSizing: "border-box",
  };

  const buttonStyle: React.CSSProperties = {
    width: "100%",
    padding: "16px",
    backgroundColor: "#1e40af",
    color: "#ffffff",
    border: "none",
    borderRadius: "10px",
    fontWeight: "bold",
    fontSize: "16px",
    cursor: "pointer",
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: "720px", margin: "40px auto" }}>
      <h2 style={{ textAlign: "center", marginBottom: "32px", fontSize: "28px" }}>
        Cadastro de Interesse
      </h2>

      <div style={blocoStyle}>
        <h3 style={{ marginBottom: "20px" }}>Informações do Cliente</h3>

        <label style={labelStyle}>Nome</label>
        <input value={nome} onChange={(e) => setNome(e.target.value)} style={inputStyle} required />

        <label style={labelStyle}>Telefone</label>
        <input value={telefone} onChange={(e) => setTelefone(e.target.value)} style={inputStyle} required />

        <label style={labelStyle}>Valor Pretendido</label>
        <input value={valorInput} onChange={handleValorChange} style={inputStyle} />

        <label style={labelStyle}>Tipo de Interesse</label>
        <select value={tipo} onChange={(e) => setTipo(e.target.value as TipoLead)} style={inputStyle} required>
          <option value="">Selecione</option>
          <option value="compra">Comprar</option>
          <option value="aluguel">Alugar</option>
          <option value="venda">Vender</option>
          <option value="anunciar">Anunciar Imóvel</option>
        </select>

        <label style={labelStyle}>Prazo</label>
        <select value={prazo} onChange={(e) => setPrazo(e.target.value as PrazoLead)} style={inputStyle}>
          <option value="">Selecione</option>
          <option value="imediato">Até 30 dias</option>
          <option value="curto">Até 6 meses</option>
          <option value="planejando">Acima de 6 meses</option>
          <option value="pesquisando">Pesquisando</option>
        </select>

        <label style={labelStyle}>Cidade</label>
        <select value={cidade} onChange={(e) => setCidade(e.target.value as any)} style={inputStyle} required>
          <option value="">Selecione</option>
          <option value="Juazeiro">Juazeiro</option>
          <option value="Petrolina">Petrolina</option>
        </select>

        <label style={labelStyle}>Bairro</label>
        <select value={bairro} onChange={(e) => setBairro(e.target.value)} style={inputStyle} required disabled={!cidade}>
          <option value="">Selecione</option>
          {bairrosDisponiveis.map((b) => (
            <option key={b.nome} value={b.nome}>
              {b.nome}
            </option>
          ))}
        </select>
      </div>

      <button type="submit" style={buttonStyle}>
        Enviar Interesse
      </button>
    </form>
  );
}
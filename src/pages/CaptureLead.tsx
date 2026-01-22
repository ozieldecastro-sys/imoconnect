// src/pages/CaptureLead.tsx
import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

export default function CaptureLead() {
  // Estados dos campos do formulário
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cidade, setCidade] = useState("");
  const [tipoImovel, setTipoImovel] = useState("");
  const [mensagem, setMensagem] = useState("");

  // Função para enviar lead
  const enviarLead = async () => {
    if (!nome || !telefone || !cidade || !tipoImovel) {
      setMensagem("Por favor, preencha todos os campos.");
      return;
    }

    try {
      await addDoc(collection(db, "leads"), {
        nome,
        telefone,
        cidade,
        tipoImovel,
        status: "Novo",
        criadoEm: serverTimestamp(),
      });
      setMensagem("Obrigado! Em breve entraremos em contato.");
      // Limpar campos
      setNome("");
      setTelefone("");
      setCidade("");
      setTipoImovel("");
    } catch (error) {
      console.error(error);
      setMensagem("Erro ao enviar lead. Tente novamente.");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "2rem auto", padding: "1rem", border: "1px solid #ccc", borderRadius: "8px" }}>
      <h2 style={{ textAlign: "center", marginBottom: "1rem" }}>Cadastre seu lead</h2>
      <input
        placeholder="Nome"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        style={{ display: "block", marginBottom: "1rem", width: "100%", padding: "0.5rem" }}
      />
      <input
        placeholder="Telefone"
        value={telefone}
        onChange={(e) => setTelefone(e.target.value)}
        style={{ display: "block", marginBottom: "1rem", width: "100%", padding: "0.5rem" }}
      />
      <input
        placeholder="Cidade"
        value={cidade}
        onChange={(e) => setCidade(e.target.value)}
        style={{ display: "block", marginBottom: "1rem", width: "100%", padding: "0.5rem" }}
      />
      <input
        placeholder="Tipo de Imóvel"
        value={tipoImovel}
        onChange={(e) => setTipoImovel(e.target.value)}
        style={{ display: "block", marginBottom: "1rem", width: "100%", padding: "0.5rem" }}
      />
      <button
        onClick={enviarLead}
        style={{ width: "100%", padding: "0.5rem", backgroundColor: "#4CAF50", color: "#fff", border: "none", borderRadius: "4px" }}
      >
        Quero atendimento
      </button>
      {mensagem && <p style={{ marginTop: "1rem", textAlign: "center" }}>{mensagem}</p>}
    </div>
  );
}

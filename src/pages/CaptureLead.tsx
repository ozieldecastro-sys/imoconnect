import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

export default function CaptureLead() {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cidade, setCidade] = useState("");
  const [tipoInteresse, setTipoInteresse] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    await addDoc(collection(db, "leads"), {
      nome,
      telefone,
      cidade,
      tipoInteresse,
      status: "novo",
      createdAt: serverTimestamp()
    });

    alert("Lead enviado com sucesso!");
    setNome("");
    setTelefone("");
    setCidade("");
    setTipoInteresse("");
  }

  return (
    <form onSubmit={handleSubmit}>
      <input placeholder="Nome" value={nome} onChange={e => setNome(e.target.value)} />
      <input placeholder="Telefone" value={telefone} onChange={e => setTelefone(e.target.value)} />
      <input placeholder="Cidade" value={cidade} onChange={e => setCidade(e.target.value)} />
      <input placeholder="Interesse" value={tipoInteresse} onChange={e => setTipoInteresse(e.target.value)} />
      <button type="submit">Enviar</button>
    </form>
  );
}


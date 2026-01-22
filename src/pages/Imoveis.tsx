// src/pages/Imoveis.tsx
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

interface Imovel {
  id: string;
  titulo: string;
  cidade: string;
  tipoImovel: string;
  preco: string;
  fotoUrl?: string;
}

export default function Imoveis() {
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [filtroCidade, setFiltroCidade] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");

  useEffect(() => {
    const fetchImoveis = async () => {
      const querySnapshot = await getDocs(collection(db, "imoveis"));
      const lista: Imovel[] = [];
      querySnapshot.forEach((doc) => {
        lista.push({ id: doc.id, ...(doc.data() as Imovel) });
      });
      setImoveis(lista);
    };
    fetchImoveis();
  }, []);

  // Aplicar filtros
  const imoveisFiltrados = imoveis.filter(
    (i) =>
      (filtroCidade ? i.cidade.toLowerCase().includes(filtroCidade.toLowerCase()) : true) &&
      (filtroTipo ? i.tipoImovel.toLowerCase().includes(filtroTipo.toLowerCase()) : true)
  );

  return (
    <div style={{ maxWidth: "800px", margin: "2rem auto", padding: "1rem" }}>
      <h2 style={{ textAlign: "center", marginBottom: "1rem" }}>Lista de Imóveis</h2>

      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
        <input
          placeholder="Filtrar por cidade"
          value={filtroCidade}
          onChange={(e) => setFiltroCidade(e.target.value)}
          style={{ flex: 1, padding: "0.5rem" }}
        />
        <input
          placeholder="Filtrar por tipo"
          value={filtroTipo}
          onChange={(e) => setFiltroTipo(e.target.value)}
          style={{ flex: 1, padding: "0.5rem" }}
        />
      </div>

      <div style={{ display: "grid", gap: "1rem" }}>
        {imoveisFiltrados.map((imovel) => (
          <div key={imovel.id} style={{ border: "1px solid #ccc", borderRadius: "8px", padding: "1rem" }}>
            {imovel.fotoUrl && (
              <img src={imovel.fotoUrl} alt={imovel.titulo} style={{ width: "100%", borderRadius: "4px", marginBottom: "0.5rem" }} />
            )}
            <h3>{imovel.titulo}</h3>
            <p>
              Cidade: {imovel.cidade} | Tipo: {imovel.tipoImovel}
            </p>
            <p>Preço: {imovel.preco}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

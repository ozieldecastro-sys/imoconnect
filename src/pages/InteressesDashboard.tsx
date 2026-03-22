import React, { useState, useEffect } from "react";
import { collection, query, onSnapshot } from "firebase/firestore";
import { db, auth, functions } from "../firebase"; // firebase.ts configurado
import { httpsCallable } from "firebase/functions";
import { onAuthStateChanged, User } from "firebase/auth";

type Interesse = {
  id: string;
  leadId: string;
  tipo: string;
  status: "disponivel" | "em_atendimento" | "encerrado" | "expirado";
  corretorId: string | null;
  exclusivoAte: any;
  createdAt: any;
};

const InteressesDashboard: React.FC = () => {
  const [interesses, setInteresses] = useState<Interesse[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  // Monitora login do corretor
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  // Carrega interesses em tempo real
  useEffect(() => {
    const q = query(collection(db, "interesses"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lista: Interesse[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Interesse, "id">),
      }));
      setInteresses(lista);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAssumir = async (interesseId: string) => {
    const assumirInteresse = httpsCallable(functions, "assumirInteresse");
    try {
      await assumirInteresse({ interesseId });
      alert("Interesse assumido com sucesso!");
    } catch (err: any) {
      alert(err.message || "Erro ao assumir interesse");
    }
  };

  const handleEncerrar = async (interesseId: string) => {
    if (!user) return alert("Você precisa estar logado");

    const encerrarInteresse = httpsCallable(functions, "encerrarInteresse");
    try {
      await encerrarInteresse({ interesseId });
      alert("Interesse encerrado com sucesso!");
    } catch (err: any) {
      alert(err.message || "Erro ao encerrar interesse");
    }
  };

  if (loading) return <div>Carregando...</div>;
  if (!user) return <div>Por favor, faça login para acessar o Dashboard</div>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Dashboard de Interesses</h1>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Lead ID</th>
            <th>Tipo</th>
            <th>Status</th>
            <th>Corretor</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {interesses.map((i) => (
            <tr key={i.id} style={{ borderBottom: "1px solid #ccc" }}>
              <td>{i.leadId}</td>
              <td>{i.tipo}</td>
              <td>{i.status}</td>
              <td>{i.corretorId || "-"}</td>
              <td>
                {i.status === "disponivel" && (
                  <button onClick={() => handleAssumir(i.id)}>Assumir</button>
                )}
                {i.status === "em_atendimento" &&
                  i.corretorId === user.uid && (
                    <button onClick={() => handleEncerrar(i.id)}>
                      Encerrar
                    </button>
                  )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InteressesDashboard;

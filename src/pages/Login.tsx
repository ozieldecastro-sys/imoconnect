import { useState, useEffect } from "react";
import { httpsCallable } from "firebase/functions";
import { functions } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  // Verifica se já existe sessão salva
  useEffect(() => {
    const corretor = localStorage.getItem("corretor");
    if (corretor) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleLogin = async () => {
    setMsg("");

    try {
      const login = httpsCallable(functions, "loginCorretor");
      const res = await login({ email, senha });
      const data = res.data;

      if (data.sucesso) {
        localStorage.setItem("corretor", JSON.stringify(data.corretor));
        setMsg(data.message);
        setTimeout(() => navigate("/dashboard"), 500);
      }
    } catch (error: any) {
      setMsg(error?.message || "Erro ao logar");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", padding: "20px", border: "1px solid #ddd", borderRadius: "8px", boxShadow: "0 2px 6px rgba(0,0,0,0.1)" }}>
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Login Corretor</h2>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        style={{ width: "100%", marginBottom: "10px", padding: "10px", fontSize: "14px" }}
      />

      <input
        type="password"
        placeholder="Senha"
        value={senha}
        onChange={e => setSenha(e.target.value)}
        style={{ width: "100%", marginBottom: "10px", padding: "10px", fontSize: "14px" }}
      />

      <button
        onClick={handleLogin}
        style={{ width: "100%", padding: "12px", fontSize: "16px", backgroundColor: "#4CAF50", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
      >
        Entrar
      </button>

      {msg && <p style={{ marginTop: "15px", textAlign: "center", color: msg.includes("sucesso") ? "green" : "red" }}>{msg}</p>}
    </div>
  );
}

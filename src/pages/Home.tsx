import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5" }}>
      
      {/* Header */}
      <header style={{
        background: "#0d47a1",
        padding: "16px",
        color: "#fff",
        textAlign: "center"
      }}>
        <h1 style={{ margin: 0 }}>ImoConnect</h1>
        <p style={{ margin: 0, fontSize: "14px" }}>
          Conectando pessoas a oportunidades imobiliárias
        </p>
      </header>

      {/* Conteúdo */}
      <main style={{
        padding: "24px",
        display: "grid",
        gap: "16px",
        maxWidth: "480px",
        margin: "0 auto"
      }}>

        <Link to="/quero-comprar" style={cardStyle}>
          🏠 Quero Comprar um Imóvel
        </Link>

        <Link to="/quero-alugar" style={cardStyle}>
          🔑 Quero Alugar um Imóvel
        </Link>

        <Link to="/quero-vender" style={cardStyle}>
          📈 Quero Vender meu Imóvel
        </Link>

        <Link to="/anunciar" style={cardStyle}>
          📝 Anunciar Imóvel para Aluguel
        </Link>

      </main>

      {/* Rodapé */}
      <footer style={{
        textAlign: "center",
        fontSize: "12px",
        padding: "16px",
        color: "#666"
      }}>
        © {new Date().getFullYear()} ImoConnect
      </footer>
    </div>
  );
}

const cardStyle = {
  background: "#fff",
  padding: "18px",
  borderRadius: "10px",
  textDecoration: "none",
  color: "#0d47a1",
  fontWeight: 600,
  boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
  textAlign: "center" as const
};

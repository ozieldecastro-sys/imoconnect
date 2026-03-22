import Extrato from "./pages/Extrato";
import { obterExtratoFinanceiroCall } from "./firebase";
import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import CaptureLead from "./pages/CaptureLead";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <Routes>
      {/* 🔐 Login */}
      <Route
        path="/login"
        element={!user ? <Login /> : <Navigate to="/" />}
      />

      {/* 🏠 Dashboard */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
<Route
  path="/extrato"
  element={
    <ProtectedRoute>
      <Extrato />
    </ProtectedRoute>
  }
/>
      {/* 📥 Captura de Lead */}
      <Route
        path="/capturar"
        element={
          <ProtectedRoute>
            <CaptureLead />
          </ProtectedRoute>
        }
      />

      {/* 🔄 Rota desconhecida redireciona */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import CaptureLead from "./pages/CaptureLead";
import Login from "./pages/Login";
import Extrato from "./pages/Extrato";
import Planos from "./pages/Planos";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-700">
        Carregando...
      </div>
    );
  }

  return (
    <Routes>
      {/* 🔐 Login */}
      <Route
        path="/login"
        element={!user ? <Login /> : <Navigate to="/" replace />}
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

      {/* 🏠 Compatibilidade com /dashboard */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* 💰 Extrato */}
      <Route
        path="/extrato"
        element={
          <ProtectedRoute>
            <Extrato />
          </ProtectedRoute>
        }
      />

      {/* 📦 Planos */}
      <Route
        path="/planos"
        element={
          <ProtectedRoute>
            <Planos />
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
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
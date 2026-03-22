import { createContext, useContext, useEffect, useState } from "react";

interface UsuarioSistema {
  id: string;
  nome: string;
  email: string;
  perfil: string;
}

interface AuthContextType {
  usuario: UsuarioSistema | null;
  loading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  usuario: null,
  loading: true,
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {

  const [usuario, setUsuario] = useState<UsuarioSistema | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const usuarioLocal = localStorage.getItem("corretor");

    if (usuarioLocal) {
      try {
        const parsed = JSON.parse(usuarioLocal);
        setUsuario(parsed);
      } catch {
        setUsuario(null);
      }
    }

    setLoading(false);

  }, []);

  function logout() {

    localStorage.removeItem("corretor");
    setUsuario(null);

  }

  return (
    <AuthContext.Provider value={{ usuario, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
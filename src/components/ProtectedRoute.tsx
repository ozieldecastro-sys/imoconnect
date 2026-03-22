import { ReactNode } from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const corretor = localStorage.getItem("corretor");

  if (!corretor) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

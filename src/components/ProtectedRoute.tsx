import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";


interface ProtectedRouteProps {
  allowed: "proprietario" | "cliente";
  children: React.ReactNode;
}

export function ProtectedRoute({ allowed, children }: ProtectedRouteProps) {
// ...existing code...

  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && (!user || user.user_type !== allowed)) {
      navigate("/login");
    }
  }, [user, allowed, loading, navigate]);

  if (loading) return <div className="p-8 text-center">Carregando...</div>;
  if (!user || user.user_type !== allowed) return null;
  return <>{children}</>;
}

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useNavigate } from "react-router-dom";

interface ProtectedRouteProps {
  allowed: "proprietario" | "cliente";
  children: React.ReactNode;
}

export function ProtectedRoute({ allowed, children }: ProtectedRouteProps) {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function checkAuth() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("user_type")
        .eq("id", user.id)
        .single();
      if (!profile || profile.user_type !== allowed) {
        navigate("/login");
        return;
      }
      setAuthorized(true);
    }
    checkAuth().finally(() => setLoading(false));
  }, [allowed, navigate]);

  if (loading) return <div className="p-8 text-center">Carregando...</div>;
  if (!authorized) return null;
  return <>{children}</>;
}

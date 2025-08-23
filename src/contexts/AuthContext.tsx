import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface AuthUser {
  id: string;
  email: string;
  user_type: "proprietario" | "cliente";
}

interface AuthContextType {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  async function checkUser() {
    const { data, error } = await supabase.auth.getUser();
    if (data?.user) {
      // Adapte aqui se precisar do user_type, por exemplo buscando do banco
      setUser({
        id: data.user.id,
        email: data.user.email ?? "",
        user_type: (data.user.user_metadata?.user_type ?? "cliente") as "proprietario" | "cliente"
      });
      localStorage.setItem('auth_user', JSON.stringify({
        id: data.user.id,
        email: data.user.email ?? "",
        user_type: (data.user.user_metadata?.user_type ?? "cliente") as "proprietario" | "cliente"
      }));
    } else {
      setUser(null);
      localStorage.removeItem('auth_user');
    }
    setLoading(false);
  }
  checkUser();
}, []);

  // Salva usuário no localStorage sempre que mudar
  useEffect(() => {
    if (user) {
      localStorage.setItem('auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('auth_user');
    }
  }, [user]);

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('auth_user');
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
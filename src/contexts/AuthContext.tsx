import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface AuthUser {
  id: string;
  email: string;
  user_type: "proprietario" | "cliente";
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      setLoading(true);
      const {
        data: { user: supaUser },
      } = await supabase.auth.getUser();
      if (!supaUser) {
        setUser(null);
        setLoading(false);
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("user_type")
        .eq("id", supaUser.id)
        .single();
      if (!profile) {
        setUser(null);
        setLoading(false);
        return;
      }
      const userType = profile.user_type === "proprietario" ? "proprietario" : "cliente";
      setUser({ id: supaUser.id, email: supaUser.email, user_type: userType });
      setLoading(false);
    }
    fetchUser();
    // Listen to auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        supabase
          .from("profiles")
          .select("user_type")
          .eq("id", session.user.id)
          .single()
          .then(({ data: profile }) => {
            if (profile) {
              const userType = profile.user_type === "proprietario" ? "proprietario" : "cliente";
              setUser({ id: session.user.id, email: session.user.email!, user_type: userType });
            }
          });
      } else {
        setUser(null);
      }
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) {
      setUser(null);
      setLoading(false);
      throw error;
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("user_type")
      .eq("id", data.user.id)
      .single();
    if (!profile) {
      setUser(null);
      setLoading(false);
      throw new Error("Perfil não encontrado");
    }
    const userType = profile.user_type === "proprietario" ? "proprietario" : "cliente";
    setUser({ id: data.user.id, email: data.user.email!, user_type: userType });
    setLoading(false);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}

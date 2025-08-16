import { createContext, useContext, useEffect, useRef, useState } from "react";
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
  const bootstrappedRef = useRef<Set<string>>(new Set());
  const isInitializedRef = useRef(false);

  // Força logout e limpa storage do Supabase
  const forceLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    bootstrappedRef.current.clear();
    try {
      localStorage.removeItem('supabase.auth.token');
      localStorage.removeItem('sb-' + import.meta.env.VITE_SUPABASE_ANON_KEY + '-auth-token');
      sessionStorage.removeItem('supabase.auth.token');
    } catch {}
  };

  // Bootstrap pós-login: ajusta perfil e cria recursos iniciais conforme metadata do usuário
  const bootstrapAfterLogin = async (supaUser: { id: string; email?: string | null; user_metadata?: any }) => {
    if (!supaUser || bootstrappedRef.current.has(supaUser.id)) {
      console.log("🚫 Bootstrap pulado - já executado para:", supaUser?.id);
      return;
    }

    console.log("🚀 Iniciando bootstrap para:", supaUser.id);
    bootstrappedRef.current.add(supaUser.id);
    
    const md = (supaUser.user_metadata || {}) as any;
    const sb: any = supabase;

    try {
      if (md?.user_type === "proprietario") {
        // 1) Atualiza perfil com dados do proprietário (idempotente)
        await supabase
          .from("profiles")
          .update({
            user_type: "proprietario",
            user_name: md.user_name || null,
            email: supaUser.email || null,
            phone: md.phone || null,
            business_name: md.business_name || null,
            cnpj: md.cnpj || null,
            address: md.address || null,
            city: md.city || null,
            state: md.state || null,
            cep: md.cep || null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", supaUser.id);

        // 2) Garante barbearia 1:1 por proprietário via RPC idempotente
        let shopId: string | undefined;
        const { data: rpcData, error: rpcErr } = await (supabase as any).rpc("ensure_barbershop_for_owner", {
          p_owner_id: supaUser.id,
          p_business_name: md.business_name || "Minha Barbearia",
        });
        if (!rpcErr && rpcData && (rpcData.id || typeof rpcData === "string")) {
          shopId = (rpcData.id as string) || (rpcData as string);
        } else {
          // fallback: tenta localizar existente
          const { data: existingShop } = await supabase
            .from("barbershops")
            .select("id")
            .eq("owner_id", supaUser.id)
            .maybeSingle();
          shopId = existingShop?.id as string | undefined;
        }

        if (shopId) {
          // Seed schedule if empty usando cliente sem tipagem
          const { data: schedAny, error: schedErr } = await sb
            .from("salon_schedule")
            .select("id")
            .eq("barbershop_id", shopId)
            .limit(1);

          if (!schedErr && (!schedAny || schedAny.length === 0)) {
            const days = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
            const rows = days.map((day: string) => ({ day, active: true, open: "09:00", close: "18:00", barbershop_id: shopId }));
            await supabase.from("salon_schedule").insert(rows);
          }

          // Adiciona o proprietário como barbeiro na tabela barbers se ainda não existir
          const { data: existingBarber, error: barberErr } = await supabase
            .from("barbers")
            .select("id")
            .eq("user_id", supaUser.id)
            .eq("barbershop_id", shopId)
            .maybeSingle();
          if (!existingBarber && !barberErr) {
            await supabase.from("barbers").insert({
              user_id: supaUser.id,
              name: md.user_name || null,
              phone: md.phone || null,
              is_active: true,
              barbershop_id: shopId,
            });
          }

          // Seed buffer setting se ausente
          const { data: bufAny, error: bufErr } = await sb
            .from("business_settings")
            .select("id")
            .eq("barbershop_id", shopId)
            .eq("setting_key", "buffer_minutes")
            .limit(1);

          if (!bufErr && (!bufAny || bufAny.length === 0)) {
            await supabase.from("business_settings").insert({
              user_id: supaUser.id,
              barbershop_id: shopId,
              setting_key: "buffer_minutes",
              setting_value: { value: 10 },
            });
          }
        }
      } else if (md?.user_type === "cliente") {
        // Atualiza perfil básico como cliente (sem atrelar a uma barbearia específica)
        await supabase
          .from("profiles")
          .update({
            user_type: "cliente",
            user_name: md.user_name || null,
            email: supaUser.email || null,
            phone: md.phone || null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", supaUser.id);
      }
      console.log("✅ Bootstrap concluído para:", supaUser.id);
    } catch (error) {
      console.error("❌ Erro no bootstrap:", error);
      // Remove da lista para permitir retry
      bootstrappedRef.current.delete(supaUser.id);
    }
  };

  // Função para processar usuário autenticado
  const processAuthenticatedUser = async (supaUser: any) => {
    console.log("👤 Processando usuário autenticado:", supaUser.id);
    
    try {
      // Bootstrap se necessário
      await bootstrapAfterLogin(supaUser);
      
      // Busca perfil com retry
      let { data: profile } = await supabase
        .from("profiles")
        .select("user_type")
        .eq("id", supaUser.id)
        .maybeSingle();
        
      if (!profile) {
        console.log("⏳ Perfil não encontrado, aguardando...");
        await new Promise((r) => setTimeout(r, 500));
        ({ data: profile } = await supabase
          .from("profiles")
          .select("user_type")
          .eq("id", supaUser.id)
          .maybeSingle());
      }
      
      if (!profile) {
        console.log("❌ Perfil ainda não encontrado após retry");
        setUser(null);
        setLoading(false);
        return;
      }
      
      const userType = profile.user_type === "proprietario" ? "proprietario" : "cliente";
      console.log("✅ Definindo usuário:", { id: supaUser.id, userType });
      
      setUser({ 
        id: supaUser.id, 
        email: supaUser.email!, 
        user_type: userType 
      });
      
    } catch (error) {
      console.error("❌ Erro ao processar usuário:", error);
      setUser(null);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    console.log("🔄 AuthContext useEffect - Iniciando");
    
    let isMounted = true;
    
    const initializeAuth = async () => {
      if (isInitializedRef.current) return;
      isInitializedRef.current = true;
      
      try {
        setLoading(true);
        
        // Setup listener primeiro
        console.log("👂 Configurando listener de auth changes");
        const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (!isMounted) return;
          
          console.log("🔔 Auth state changed:", { event, hasSession: !!session });
          
          if (session?.user) {
            await processAuthenticatedUser(session.user);
          } else {
            console.log("🚪 Logout detectado");
            setUser(null);
            bootstrappedRef.current.clear();
            setLoading(false);
          }
        });
        
        // Depois verifica se já tem usuário
        console.log("👤 Verificando usuário atual");
        const { data, error } = await supabase.auth.getUser();
        
        if (!isMounted) return;
        
        if (error || !data?.user) {
          console.log("❌ Nenhum usuário encontrado ou erro:", error?.message);
          await forceLogout();
          setLoading(false);
          return;
        }
        
        // Se tem usuário, processa
        await processAuthenticatedUser(data.user);
        
        // Cleanup function
        return () => {
          console.log("🧹 Limpando listener");
          listener?.subscription.unsubscribe();
        };
        
      } catch (error) {
        console.error("❌ Erro na inicialização:", error);
        if (isMounted) {
          setUser(null);
          setLoading(false);
        }
      }
    };
    
    const cleanup = initializeAuth();
    
    return () => {
      isMounted = false;
      cleanup?.then(cleanupFn => cleanupFn?.());
    };
  }, []);

  const login = async (email: string, password: string) => {
    console.log("🚀 LOGIN - Iniciando para:", email);
    setLoading(true);
    
    try {
      console.log("📡 Chamando signInWithPassword...");
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      console.log("📊 Resultado:", { hasData: !!data, hasUser: !!data?.user, error: error?.message });
      
      if (error) {
        console.error("❌ Erro do Supabase:", error);
        setUser(null);
        setLoading(false);
        throw error;
      }
      
      console.log("✅ Login iniciado - aguardando processamento via listener");
      // O listener vai processar e setar loading(false)
      
    } catch (error) {
      console.error("❌ ERRO GERAL no login:", error);
      setUser(null);
      setLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    console.log("🚪 Fazendo logout");
    await supabase.auth.signOut();
    setUser(null);
    bootstrappedRef.current.clear();
    setLoading(false);
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
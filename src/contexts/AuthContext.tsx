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
  const bootstrappedRef = useRef(false);

  // Força logout e limpa storage do Supabase
  const forceLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    bootstrappedRef.current = false;
    try {
      localStorage.removeItem('supabase.auth.token');
      localStorage.removeItem('sb-' + import.meta.env.VITE_SUPABASE_ANON_KEY + '-auth-token');
      sessionStorage.removeItem('supabase.auth.token');
    } catch {}
  };

  // Bootstrap pós-login: ajusta perfil e cria recursos iniciais conforme metadata do usuário
  const bootstrapAfterLogin = async (supaUser: { id: string; email?: string | null; user_metadata?: any }) => {
    if (!supaUser) return;
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
    } catch {
      // não bloquear login por erro de bootstrap
    }
  };

  useEffect(() => {
    async function fetchUser() {
      setLoading(true);
      const { data, error } = await supabase.auth.getUser();
      const supaUser = data?.user;
      if (error || !supaUser) {
        await forceLogout();
        setLoading(false);
        return;
      }

      // Bootstrap pós login (idempotente, evitar duplicidade)
      if (!bootstrappedRef.current) {
        await bootstrapAfterLogin(supaUser);
        bootstrappedRef.current = true;
      }

      // Busca perfil com resiliência (talvez o trigger ainda não preencheu)
      let { data: profile } = await supabase
        .from("profiles")
        .select("user_type")
        .eq("id", supaUser.id)
        .maybeSingle();
      if (!profile) {
        await new Promise((r) => setTimeout(r, 300));
        ({ data: profile } = await supabase
          .from("profiles")
          .select("user_type")
          .eq("id", supaUser.id)
          .maybeSingle());
      }
      if (!profile) {
        setUser(null);
        setLoading(false);
        return;
      }
      const userType = profile.user_type === "proprietario" ? "proprietario" : "cliente";
      setUser({ id: supaUser.id, email: supaUser.email!, user_type: userType });
      setLoading(false);
    }
    fetchUser();
    // Listen to auth changes
    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        if (!bootstrappedRef.current) {
          await bootstrapAfterLogin(session.user);
          bootstrappedRef.current = true;
        }
        supabase
          .from("profiles")
          .select("user_type")
          .eq("id", session.user.id)
          .maybeSingle()
          .then(async ({ data: profile, error }) => {
            if (error) {
              await forceLogout();
              return;
            }
            if (profile) {
              const userType = profile.user_type === "proprietario" ? "proprietario" : "cliente";
              setUser({ id: session.user!.id, email: session.user!.email!, user_type: userType });
            } else {
              setUser(null);
            }
          });
      } else {
        setUser(null);
        bootstrappedRef.current = false;
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

    // Bootstrap e definição do tipo após login
    if (!bootstrappedRef.current) {
      await bootstrapAfterLogin(data.user);
      bootstrappedRef.current = true;
    }

    let { data: profile } = await supabase
      .from("profiles")
      .select("user_type")
      .eq("id", data.user.id)
      .maybeSingle();
    if (!profile) {
      await new Promise((r) => setTimeout(r, 300));
      ({ data: profile } = await supabase
        .from("profiles")
        .select("user_type")
        .eq("id", data.user.id)
        .maybeSingle());
    }
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
    bootstrappedRef.current = false;
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

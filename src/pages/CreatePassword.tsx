import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function CreatePassword() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasRecoverySession, setHasRecoverySession] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setHasRecoverySession(!!data.session);
    })();
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setHasRecoverySession(!!session);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function handleCreatePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!password) return;
    setLoading(true);

    // This requires that the user arrived via the password recovery link (session present)
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      toast({ title: "Erro ao criar senha", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    toast({ title: "Senha criada com sucesso", description: "Você já pode acessar a plataforma!" });
    setLoading(false);
    navigate("/login");
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Criar Senha</CardTitle>
        </CardHeader>
        <CardContent>
          {!hasRecoverySession && (
            <div className="text-sm text-muted-foreground mb-4">
              Abra este link a partir do e-mail de recuperação enviado para você.
            </div>
          )}
          <form onSubmit={handleCreatePassword} className="space-y-4">
            <Input
              type="password"
              placeholder="Digite sua nova senha"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={8}
            />
            <Button type="submit" className="w-full" disabled={loading || !hasRecoverySession}>
              {loading ? "Salvando..." : "Criar Senha"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function CreatePassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const token = searchParams.get("token");

  async function handleCreatePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!password || !token) return;
    setLoading(true);

    // Atualiza a senha do usuário convidado
    const { error } = await supabase.auth.admin.updateUserById(token, { password });
    if (error) {
      toast({
        title: "Erro ao criar senha",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // Atualiza status do cliente na tabela clients
    await (supabase as any).from("clients").update({ status: "active" }).eq("user_id", token);

    toast({
      title: "Senha criada com sucesso",
      description: "Você já pode acessar a plataforma!",
    });
    setLoading(false);
    navigate("/dashboard");
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Criar Senha</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreatePassword} className="space-y-4">
            <Input
              type="password"
              placeholder="Digite sua nova senha"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={8}
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Salvando..." : "Criar Senha"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

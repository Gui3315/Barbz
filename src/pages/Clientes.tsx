import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Database } from "@/lib/supabaseTypes";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/layout";

export default function Clientes() {
  const [clientes, setClientes] = useState<Database["public"]["Tables"]["clients"]["Row"][]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchClientes() {
      setLoading(true);
      const { data, error } = await supabase.from("clients").select("*");
      if (!error && data) setClientes(data);
      setLoading(false);
    }
    fetchClientes();
  }, []);

  const filtered = clientes.filter(c => {
    const s = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(s) ||
      (c.phone || "").toLowerCase().includes(s) ||
      (c.email || "").toLowerCase().includes(s)
    );
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="header-text flex items-center gap-2"><Users className="h-6 w-6" />Clientes</h1>
          <Input
            placeholder="Buscar por nome, telefone ou e-mail..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="max-w-xs"
          />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Lista de Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-blue-500">Carregando...</div>
            ) : filtered.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">Nenhum cliente encontrado.</div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-secondary">
                    <th className="text-left py-2 px-4">Nome</th>
                    <th className="text-left py-2 px-4">Telefone</th>
                    <th className="text-left py-2 px-4">E-mail</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(cliente => (
                    <tr key={cliente.id} className="border-t">
                      <td className="py-3 px-4">{cliente.name}</td>
                      <td className="py-3 px-4">{cliente.phone}</td>
                      <td className="py-3 px-4">{cliente.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

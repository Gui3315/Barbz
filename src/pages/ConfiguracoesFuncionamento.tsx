import { useEffect, useState } from "react";
import { salonSchedule } from "@/config/salonSchedule";
import { Database } from "@/lib/supabaseTypes";
import { supabase } from "@/lib/supabaseClient";
type SalonDay = Database["public"]["Tables"]["salon_schedule"]["Row"];
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const diasSemana = ["segunda", "terca", "quarta", "quinta", "sexta", "sabado", "domingo"];

export default function ConfiguracoesFuncionamento() {
  const [schedule, setSchedule] = useState<SalonDay[]>(salonSchedule);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Buscar configuração do Supabase ao carregar
  useEffect(() => {
    async function fetchSchedule() {
      setLoading(true);
      const { data, error } = await supabase
        .from("salon_schedule")
        .select("*");
      if (error) {
        setError("Erro ao buscar configuração do salão.");
        setLoading(false);
        return;
      }
      if (data && data.length > 0) {
        // Ordena por dias da semana
        const ordered = diasSemana.map(day => data.find((d: any) => d.day === day)).filter(Boolean);
        setSchedule(ordered as SalonDay[]);
      }
      setLoading(false);
    }
    fetchSchedule();
  }, []);
  const handleToggleDay = (index: number) => {
    const newSchedule = [...schedule];
    newSchedule[index].active = !newSchedule[index].active;
    setSchedule(newSchedule);
  };

  const handleChangeTime = (index: number, field: "open" | "close", value: string) => {
    const newSchedule = [...schedule];
    newSchedule[index][field] = value;
    setSchedule(newSchedule);
  };

  // Validação antes de salvar
  function validateSchedule(sched: SalonDay[]) {
    for (const dia of sched) {
      if (dia.active) {
        if (!dia.open || !dia.close) return "Preencha todos os horários.";
        if (dia.open >= dia.close) return `Horário inválido em ${dia.day}.`;
      }
    }
    if (!sched.some(d => d.active)) return "Ative pelo menos um dia.";
    return "";
  }

  // Salvar no Supabase
  const handleSave = async () => {
    setLoading(true);
    setSuccess("");
    setError("");
    const validation = validateSchedule(schedule);
    if (validation) {
      setError(validation);
      setLoading(false);
      return;
    }
    // Remove todos e insere novo (mock simples)
    const { error: delError } = await supabase.from("salon_schedule").delete().neq("id", 0);
    if (delError) {
      setError("Erro ao limpar configuração antiga.");
      setLoading(false);
      return;
    }
    const { error: insError } = await supabase.from("salon_schedule").insert(schedule);
    if (insError) {
      setError("Erro ao salvar configuração.");
      setLoading(false);
      return;
    }
    setSuccess("Configuração salva com sucesso!");
    setLoading(false);
  };

  return (
    <Card className="max-w-2xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Configuração de Funcionamento do Salão</CardTitle>
      </CardHeader>
      <CardContent>
        {loading && <div className="mb-4 text-blue-500">Carregando...</div>}
        {error && <div className="mb-4 text-red-500">{error}</div>}
        {success && <div className="mb-4 text-green-500">{success}</div>}
        <div className="space-y-4">
          {(!schedule || schedule.length === 0) && (
            <div className="text-center text-muted-foreground py-8">Nenhuma configuração encontrada.</div>
          )}
          {schedule && schedule.length > 0 && schedule.map((dia, idx) => (
            <div key={dia.day} className="flex items-center gap-4 border-b pb-2">
              <label className="font-medium w-24 capitalize">{dia.day}</label>
              <input
                type="checkbox"
                checked={dia.active}
                onChange={() => handleToggleDay(idx)}
                className="mr-2"
              />
              <span className="mr-2">Ativo</span>
              <input
                type="time"
                value={dia.open}
                disabled={!dia.active}
                onChange={e => handleChangeTime(idx, "open", e.target.value)}
                className="border rounded px-2 py-1"
              />
              <span className="mx-2">até</span>
              <input
                type="time"
                value={dia.close}
                disabled={!dia.active}
                onChange={e => handleChangeTime(idx, "close", e.target.value)}
                className="border rounded px-2 py-1"
              />
            </div>
          ))}
        </div>
        <Button className="mt-6 w-full btn-primary" onClick={handleSave} disabled={loading}>Salvar Configuração</Button>
      </CardContent>
    </Card>
  );
}

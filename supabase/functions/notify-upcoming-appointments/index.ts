import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

serve(async (req) => {
    console.log("Função chamada!", { method: req.method, headers: [...req.headers] });
  // 1. Buscar todas as barbearias e antecedência
  const { data: barbershops, error: barbershopError } = await supabase
    .from("barbershops")
    .select("id, notify_client_hours_before")

  if (barbershopError) {
    console.error("Erro na função:", barbershopError);
    return new Response(JSON.stringify({ error: barbershopError.message }), { status: 500 });
}

  const now = new Date();

  for (const shop of barbershops ?? []) {
    const hours = shop.notify_client_hours_before ?? 2;
    const notifyWindowStart = new Date(now.getTime() + hours * 60 * 60 * 1000);
    const notifyWindowEnd = new Date(notifyWindowStart.getTime() + 15 * 60 * 1000);

    // 2. Buscar agendamentos futuros que ainda não foram notificados
    const { data: appointments, error: appointmentsError } = await supabase
      .from("appointments")
      .select("id, client_id, start_at, notified_client")
      .eq("barbershop_id", shop.id)
      .eq("status", "confirmed")
      .eq("notified_client", false)
      .gte("start_at", notifyWindowStart.toISOString())
      .lt("start_at", notifyWindowEnd.toISOString());

    if (appointmentsError) continue;

    for (const apt of appointments ?? []) {
      // 3. Chamar a send-push para o cliente
      await fetch(Deno.env.get("SEND_PUSH_URL")!, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!}`
        },
        body: JSON.stringify({
          userId: apt.client_id,
          title: "Lembrete de agendamento",
          body: `Seu agendamento começa em ${hours} horas!`
        })
      });

      // 4. Marcar como notificado
      await supabase
        .from("appointments")
        .update({ notified_client: true })
        .eq("id", apt.id);
    }
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200 });
});
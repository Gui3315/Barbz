
import { DashboardLayout } from "@/components/dashboard/layout";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar as CalendarIcon, Clock, Plus, User } from "lucide-react";
import { useEffect, useState } from "react";
import { format, addMinutes } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
// ...existing code...

// Types for appointments, barbers, and services
interface Appointment {
  id: string;
  start_at: string;
  end_at: string;
  status: string;
  total_price: number;
  notes?: string;
  client: { name: string };
  service: { name: string };
  barber: { name: string };
}

interface Client {
  id: string;
  name: string;
}

interface Barber {
  id: string;
  name: string;
  // outros campos ignorados
}

interface Service {
  id: string;
  name: string;
  duration_minutes: number;
  price: string;
}

import { salonSchedule, generateTimeSlots } from "@/config/salonSchedule";

export default function Agendamentos() {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedBarber, setSelectedBarber] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [clientId, setClientId] = useState<string | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Dados reais do banco
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  // Horários disponíveis para o barbeiro/serviço/data selecionados
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [loadingTimes, setLoadingTimes] = useState(false);
  // Função para gerar horários disponíveis considerando agendamentos existentes
  useEffect(() => {
    const fetchAvailableTimes = async () => {
      setLoadingTimes(true);
      setAvailableTimes([]);
      if (!selectedDate || !selectedBarber || !selectedService) {
        setLoadingTimes(false);
        return;
      }
      // Buscar duração do serviço
      const service = services.find(s => s.id === selectedService);
      const duration = service ? service.duration_minutes : 30;
      // Gerar slots possíveis do dia
      const diasSemana = ["domingo", "segunda", "terca", "quarta", "quinta", "sexta", "sabado"];
      const diaSelecionado = diasSemana[selectedDate.getDay()];
      const configDia = salonSchedule.find(d => d.day === diaSelecionado);
      if (!configDia || !configDia.active) {
        setAvailableTimes([]);
        setLoadingTimes(false);
        return;
      }
      const slots = generateTimeSlots(configDia.open, configDia.close);
      // Buscar agendamentos do barbeiro para o dia
      const year = selectedDate.getUTCFullYear();
      const month = String(selectedDate.getUTCMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getUTCDate()).padStart(2, '0');
      const startUTC = `${year}-${month}-${day}T00:00:00+00:00`;
      const nextDay = new Date(Date.UTC(year, Number(month) - 1, Number(day) + 1));
      const nextYear = nextDay.getUTCFullYear();
      const nextMonth = String(nextDay.getUTCMonth() + 1).padStart(2, '0');
      const nextDayStr = String(nextDay.getUTCDate()).padStart(2, '0');
      const endUTC = `${nextYear}-${nextMonth}-${nextDayStr}T00:00:00+00:00`;
      const { data: dayAppointments, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('barber_id', selectedBarber)
        .gte('start_at', startUTC)
        .lt('start_at', endUTC)
        .in('status', ['confirmed', 'pending']);
      if (error) {
        setAvailableTimes(slots);
        setLoadingTimes(false);
        return;
      }
      // Marcar horários ocupados
      const occupied: Set<string> = new Set();
      (dayAppointments || []).forEach((appt: any) => {
        const apptStart = new Date(appt.start_at);
        const apptEnd = appt.end_at ? new Date(appt.end_at) : new Date(apptStart.getTime() + duration * 60000);
        slots.forEach((slot) => {
          // slot: 'HH:mm'. Usar timezone local (não UTC) para comparar corretamente
          const [h, m] = slot.split(":");
          // new Date(ano, mes, dia, hora, minuto) => local time
          const slotDate = new Date(year, Number(month) - 1, Number(day), Number(h), Number(m));
          if (slotDate >= apptStart && slotDate < apptEnd) {
            occupied.add(slot);
          }
        });
      });
      // Filtrar slots disponíveis
      const available = slots.filter(slot => !occupied.has(slot));
      setAvailableTimes(available);
      setLoadingTimes(false);
    };
    fetchAvailableTimes();
  }, [selectedDate, selectedBarber, selectedService, services]);

  // Buscar dados do Supabase

useEffect(() => {
  const fetchData = async () => {
    setLoading(true);
    // Buscar barbeiros
    const { data: barbersData } = await supabase.from('barbers').select('*');
    setBarbers((barbersData || []).map((b: any) => ({ id: b.id, name: b.name })));
    // Buscar serviços
    const { data: servicesData } = await supabase.from('services').select('*');
    setServices((servicesData || []).map((s: any) => ({ id: s.id, name: s.name, duration_minutes: s.duration_minutes, price: s.price })));
    // Buscar clientes
    const { data: clientsData } = await supabase.from('clients').select('id, name');
    setClients(clientsData || []);

    // Buscar barbershop_id do usuário logado
    const user = supabase.auth.getUser ? (await supabase.auth.getUser()).data.user : null;
    let barbershopId = null;
    if (user) {
      const { data: barbershop } = await supabase
        .from('barbershops')
        .select('id')
        .eq('owner_id', user.id)
        .single();
      if (barbershop) {
        barbershopId = barbershop.id;
      }
    }

    // Buscar agendamentos do dia via função RPC (resolve RLS)
    let appointmentsData = [];
    if (barbershopId && selectedDate) {
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const startDate = `${year}-${month}-${day}T00:00:00`;
      const endDate = `${year}-${month}-${day}T23:59:59`;
      const { data, error } = await supabase.rpc('get_appointments_with_clients', {
        p_barbershop_id: barbershopId,
        p_start_date: startDate,
        p_end_date: endDate
      });
      if (error) {
        setAppointments([]);
        setLoading(false);
        return;
      }
      appointmentsData = data || [];
    }
    // Mapear para o formato esperado pelo componente
    setAppointments(
      (appointmentsData || []).map((a: any) => ({
        id: a.appointment_id,
        start_at: a.start_at,
        end_at: a.end_at,
        status: a.status,
        total_price: a.total_price,
        notes: a.notes,
        client: { name: a.client_name },
        service: { name: a.service_name },
        barber: { name: a.barber_name },
      }))
    );
    setLoading(false);
  };
  fetchData();
}, [selectedDate]);

  const resetNewAppointment = () => {
    setSelectedBarber(null);
    setSelectedService(null);
    setSelectedTime(null);
    setClientId(null);
  };

  const handleCreateAppointment = async () => {
    if (!clientId || !selectedBarber || !selectedService || !selectedTime || !selectedDate) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }
    // Buscar usuário logado
    const user = supabase.auth.getUser ? (await supabase.auth.getUser()).data.user : null;
    const user_id = user?.id || null;
    if (!user_id) {
      toast({
        title: "Usuário não autenticado",
        description: "Faça login para criar agendamentos.",
        variant: "destructive"
      });
      return;
    }
    // Montar start_at (data + hora escolhida) com offset UTC-3
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const start_at = `${dateStr}T${selectedTime}:00-03:00`;
    // Calcular end_at com base na duração do serviço
    const service = services.find(s => s.id === selectedService);
    const duration = service ? service.duration_minutes : 30;
    const total_price = service ? Number(service.price) : 0;
    const [h, m] = selectedTime.split(":");
    const endDate = new Date(selectedDate);
    endDate.setHours(Number(h), Number(m) + duration, 0, 0);
    const end_at = format(endDate, "yyyy-MM-dd'T'HH:mm:ssXXX");
    // Buscar barbershop_id na tabela barbershops onde owner_id = user_id
    let barbershop_id = null;
    if (user_id) {
      const { data: barbershopData } = await supabase.from('barbershops').select('id').eq('owner_id', user_id).single();
      barbershop_id = barbershopData?.id || null;
    }
    // Chamar a função RPC create_appointment
    const { error } = await supabase.rpc('create_appointment', {
      p_barbershop_id: barbershop_id,
      p_start_at: start_at,
      p_service_ids: [selectedService],
      p_client_id: clientId,
      p_barber_id: selectedBarber,
      p_notes: null,
    });
    if (error) {
      toast({
        title: "Erro ao criar agendamento",
        description: error?.message || 'Erro ao criar agendamento',
        variant: "destructive"
      });
      return;
    }
    toast({
      title: "Agendamento criado",
      description: `Agendamento criado com sucesso.`,
    });
    setSheetOpen(false);
    resetNewAppointment();
    // Refetch agendamentos do dia selecionado
    if (selectedDate) {
      const year = selectedDate.getUTCFullYear();
      const month = String(selectedDate.getUTCMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getUTCDate()).padStart(2, '0');
      const startUTC = `${year}-${month}-${day}T00:00:00+00:00`;
      const nextDay = new Date(Date.UTC(year, Number(month) - 1, Number(day) + 1));
      const nextYear = nextDay.getUTCFullYear();
      const nextMonth = String(nextDay.getUTCMonth() + 1).padStart(2, '0');
      const nextDayStr = String(nextDay.getUTCDate()).padStart(2, '0');
      const endUTC = `${nextYear}-${nextMonth}-${nextDayStr}T00:00:00+00:00`;
      const { data: appointmentsData } = await supabase
        .from('appointments')
        .select('*')
        .gte('start_at', startUTC)
        .lt('start_at', endUTC);
      // Buscar appointment_services para os appointments do dia
      const appointmentIds = (appointmentsData || []).map((a: any) => a.id);
      let appointmentServicesData: any[] = [];
      if (appointmentIds.length > 0) {
        const { data: asData } = await supabase
          .from('appointment_services')
          .select('appointment_id, service_id')
          .in('appointment_id', appointmentIds);
        appointmentServicesData = asData || [];
      }
      // Buscar clientes, barbeiros, serviços
      const { data: barbersData } = await supabase.from('barbers').select('*');
      const { data: servicesData } = await supabase.from('services').select('*');
      const { data: clientsData } = await supabase.from('clients').select('id, name');
      setAppointments(
        (appointmentsData || []).map((a: any) => {
          const appService = appointmentServicesData.find((as) => as.appointment_id === a.id);
          const service = appService ? servicesData?.find((s: any) => s.id === appService.service_id) : null;
          return {
            ...a,
            client: clientsData?.find((c: any) => c.id === a.client_id) || null,
            service: service || null,
            barber: barbersData?.find((b: any) => b.id === a.barber_id) || null,
          };
        })
      );
    }
  };

  // Filtro por barbeiro
  const [barberFilter, setBarberFilter] = useState<string>('all');
  // Filtrar agendamentos por data e barbeiro
  const filteredAppointments = appointments.filter(appointment => {
    if (!selectedDate) return true;
    // start_at pode ser string ISO, comparar só a data (yyyy-MM-dd)
    const apptDate = appointment.start_at ? appointment.start_at.slice(0, 10) : '';
    const selected = format(selectedDate, "yyyy-MM-dd");
    const matchesDate = apptDate === selected;
    const matchesBarber = barberFilter === 'all' || (appointment.barber && appointment.barber.name && barbers.find(b => b.id === barberFilter && b.name === appointment.barber.name));
    return matchesDate && matchesBarber;
  });
  const confirmedAppointments = filteredAppointments.filter(a => a.status === "confirmed" || a.status === null);
  const pendingAppointments: Appointment[] = [];

  // Atualizar status do agendamento
  const handleConfirmAppointment = async (id: string) => {
    const { error } = await supabase.from('appointments').update({ status: 'confirmed' }).eq('id', id);
    if (!error) {
      setAppointments(appointments.map(appointment => appointment.id === id ? { ...appointment, status: 'confirmed' } : appointment));
      toast({
        title: "Agendamento confirmado",
        description: "O agendamento foi confirmado com sucesso."
      });
    }
  };

  const handleCancelAppointment = async (id: string) => {
    const { error } = await supabase.from('appointments').delete().eq('id', id);
    if (!error) {
      setAppointments(appointments.filter(appointment => appointment.id !== id));
      toast({
        title: "Agendamento cancelado",
        description: "O agendamento foi cancelado com sucesso."
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="header-text">Agendamentos</h1>
            <div>
              <label className="text-sm font-medium mr-2">Barbeiro:</label>
              <select
                className="pl-2 pr-8 py-1 border rounded"
                value={barberFilter}
                onChange={e => setBarberFilter(e.target.value)}
              >
                <option value="all">Todos</option>
                {barbers.map(barber => (
                  <option key={barber.id} value={barber.id}>{barber.name}</option>
                ))}
              </select>
            </div>
          </div>
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button className="btn-primary gap-2">
                <Plus size={16} />
                Novo Agendamento
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:w-[540px] overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Novo Agendamento</SheetTitle>
              </SheetHeader>
              <div className="space-y-5 mt-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Cliente</label>
                  <div className="relative">
                    <select
                      className="pl-3 pr-8 py-2 border rounded w-full"
                      value={clientId || ''}
                      onChange={e => setClientId(e.target.value)}
                    >
                      <option value="">Selecione o cliente</option>
                      {clients.map(client => (
                        <option key={client.id} value={client.id}>{client.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Data</label>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border pointer-events-auto"
                    locale={ptBR}
                    disabled={{ before: new Date() }}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Barbeiro</label>
                  <div className="grid grid-cols-3 gap-2">
                    {barbers.map((barber) => (
                      <Button
                        key={barber.id}
                        type="button"
                        variant={selectedBarber === barber.id ? "default" : "outline"}
                        onClick={() => setSelectedBarber(barber.id)}
                        className="justify-start h-auto py-2"
                      >
                        {barber.name}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Serviço</label>
                  <div className="grid grid-cols-2 gap-2">
                    {services.map((service) => (
                      <Button
                        key={service.id}
                        type="button"
                        variant={selectedService === service.id ? "default" : "outline"}
                        onClick={() => setSelectedService(service.id)}
                        className="h-auto flex flex-col items-start p-3"
                      >
                        <span>{service.name}</span>
                        <div className="flex justify-between w-full mt-1">
                          <span className="text-xs opacity-80">
                            {service.duration_minutes} min
                          </span>
                          <span className="text-xs opacity-80">
                            R$ {Number(service.price).toFixed(2)}
                          </span>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Horário</label>
                  <div className="grid grid-cols-4 gap-2 min-h-10">
                    {loadingTimes ? (
                      <span className="col-span-4 text-muted-foreground">Carregando horários...</span>
                    ) : availableTimes.length === 0 ? (
                      <span className="col-span-4 text-muted-foreground">Nenhum horário disponível</span>
                    ) : (
                      availableTimes.map((time) => (
                        <Button
                          key={time}
                          type="button"
                          variant={selectedTime === time ? "default" : "outline"}
                          onClick={() => setSelectedTime(time)}
                          className="py-1"
                        >
                          {time}
                        </Button>
                      ))
                    )}
                  </div>
                </div>

                <Button 
                  className="w-full mt-6 btn-primary"
                  disabled={!selectedBarber || !selectedService || !selectedTime || !clientId}
                  onClick={handleCreateAppointment}
                >
                  Confirmar Agendamento
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="col-span-1 md:col-span-2 barber-card">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center">
                <CalendarIcon className="mr-2 h-5 w-5" />
                <span>{selectedDate ? format(selectedDate, "dd 'de' MMMM", { locale: ptBR }) : "Hoje"}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Carregando...</div>
              ) : (
                filteredAppointments.length === 0 ? (
                  <div className="text-center py-8">
                    <p>Nenhum agendamento encontrado para esta data.</p>
                  </div>
                ) : (
                filteredAppointments.map((appointment, idx) => (
                  <div
                    key={appointment.id}
                    className={`p-3 border rounded-md flex items-center justify-between ${
                      appointment.status === 'pending' ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200'
                    }${idx !== 0 ? ' mt-3' : ''}`}
                  >
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-barber flex items-center justify-center text-white">
                        {appointment.client?.name
                          ? appointment.client.name.split(' ').map((name: string) => name[0]).join('')
                          : 'C'}
                      </div>
                      <div className="ml-3">
                        <div className="font-medium">{appointment.client?.name || 'Cliente'}</div>
                        <div className="text-sm text-muted-foreground">{appointment.service?.name || 'Serviço selecionado'}</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="text-right mr-4">
                        <div className="flex items-center">
                          <Clock size={14} className="mr-1" />
                          {/* Exibe horário formatado */}
                          <span>{appointment.start_at ? new Date(appointment.start_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '--:--'}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {appointment.barber?.name || 'Barbeiro'}
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Detalhes</Button>
                    </div>
                  </div>
                ))
                )
              )}
            </CardContent>
          </Card>

          <Card className="barber-card">
            <CardHeader className="pb-3">
              <CardTitle>Calendário</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border pointer-events-auto"
                locale={ptBR}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

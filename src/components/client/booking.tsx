import { useEffect, useMemo, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Helpers de horário
const SLOT_GRID_MINUTES = 30; // grade visual fixa de 30 min

// CORREÇÃO: Função para garantir data correta sem alterar timezone
function getBrazilianDate(date: Date) {
  // Não alterar o timezone, apenas extrair a data
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getLocalOffsetTimestamp(dateObj: Date, timeStr: string) {
  // CORREÇÃO: Usar horário brasileiro fixo (UTC-3)
  const [y, m, d] = dateObj.toISOString().split("T")[0].split("-");
  const [hh, mm] = timeStr.split(":");
  
  // Usar offset fixo do Brasil (UTC-3)
  return `${y}-${m}-${d}T${hh}:${mm}:00-03:00`;
}

// COMPONENTES REUTILIZÁVEIS
export function ServiceStep({ services, selectedService, setSelectedService, handleBack, handleNext }: any) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Escolha o serviço</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {services.map((service: any) => (
          <div
            key={service.id}
            className={`border rounded-md p-4 cursor-pointer transition-all ${
              selectedService === service.id ? "border-barber-gold bg-barber-gold/5" : ""
            }`}
            onClick={() => setSelectedService(service.id)}
          >
            <div className="flex justify-between">
              <h4 className="font-medium">{service.name}</h4>
              {selectedService === service.id && (
                <CheckCircle className="h-5 w-5 text-barber-gold" />
              )}
            </div>
            <div className="mt-2 text-sm text-muted-foreground">{service.description}</div>
            <div className="mt-2 flex justify-between text-sm">
              <span className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-4 w-4" />
                {service.duration_minutes} minutos
              </span>
              <span className="font-medium">R$ {Number(service.price).toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between">
        {handleBack && (
          <Button variant="outline" onClick={handleBack}>
            Voltar
          </Button>
        )}
        <Button onClick={handleNext} disabled={!selectedService} className="btn-primary">
          Próximo passo
        </Button>
      </div>
    </div>
  );
}

export function ProfessionalStep({ barbers, selectedBarber, setSelectedBarber, handleNext }: any) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Escolha o profissional</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {barbers.map((barber: any) => (
          <div
            key={barber.id}
            className={`border rounded-md p-4 cursor-pointer transition-all ${
              barber.is_active === false ? "opacity-50 cursor-not-allowed" : ""
            } ${selectedBarber === barber.id ? "border-barber-gold bg-barber-gold/5" : ""}`}
            onClick={() => barber.is_active !== false && setSelectedBarber(barber.id)}
          >
            <div className="flex justify-between">
              <h4 className="font-medium">{barber.name}</h4>
              {selectedBarber === barber.id && (
                <CheckCircle className="h-5 w-5 text-barber-gold" />
              )}
            </div>
            <div className="mt-2 text-sm">
              <span className={`${barber.is_active !== false ? "text-green-500" : "text-red-500"}`}>
                {barber.is_active !== false ? "Disponível" : "Indisponível"}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-end">
        <Button onClick={handleNext} disabled={!selectedBarber} className="btn-primary">
          Próximo passo
        </Button>
      </div>
    </div>
  );
}

export function AvailableBarbersStep({ 
  availableBarbers, 
  selectedBarber, 
  setSelectedBarber, 
  handleBack, 
  handleNext, 
  selectedTime 
}: any) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Barbeiros disponíveis às {selectedTime}</h3>
      {availableBarbers.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Nenhum barbeiro disponível neste horário.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {availableBarbers.map((barber: any) => (
            <div
              key={barber.id}
              className={`border rounded-md p-4 cursor-pointer transition-all ${
                selectedBarber === barber.id ? "border-barber-gold bg-barber-gold/5" : ""
              }`}
              onClick={() => setSelectedBarber(barber.id)}
            >
              <div className="flex justify-between">
                <h4 className="font-medium">{barber.name}</h4>
                {selectedBarber === barber.id && (
                  <CheckCircle className="h-5 w-5 text-barber-gold" />
                )}
              </div>
              <div className="mt-2 text-sm text-green-500">
                Disponível
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="flex justify-between">
        <Button variant="outline" onClick={handleBack}>
          Voltar
        </Button>
        <Button onClick={handleNext} disabled={!selectedBarber || availableBarbers.length === 0} className="btn-primary">
          Próximo passo
        </Button>
      </div>
    </div>
  );
}

export function ServiceDateTimeStep({ date, setDate, selectedTime, setSelectedTime, handleBack, handleNext, availableSlots, loadingSlots }: any) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Escolha a data e horário</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="mb-2 font-medium">Selecione a data</h4>
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="border rounded-md p-3 pointer-events-auto"
            disabled={{ before: new Date() }}
          />
        </div>
        <div>
          <h4 className="mb-2 font-medium">Selecione o horário</h4>
          <div className="grid grid-cols-3 gap-2 min-h-10">
            {loadingSlots ? (
              <span className="col-span-3 text-muted-foreground">Carregando horários...</span>
            ) : availableSlots && availableSlots.length > 0 ? (
              availableSlots.map((time: string) => (
                <Button
                  key={time}
                  variant="outline"
                  className={`${selectedTime === time ? "border-barber-gold bg-barber-gold/5" : ""}`}
                  onClick={() => setSelectedTime(time)}
                >
                  {time}
                </Button>
              ))
            ) : (
              <span className="col-span-3 text-muted-foreground">Fechado</span>
            )}
          </div>
        </div>
      </div>
      <div className="flex justify-between">
        {handleBack && (
          <Button variant="outline" onClick={handleBack}>
            Voltar
          </Button>
        )}
        <Button onClick={handleNext} disabled={!selectedTime} className="btn-primary">
          Próximo passo
        </Button>
      </div>
    </div>
  );
}

export function ConfirmStep({ selectedService, selectedBarber, date, selectedTime, services, barbers, handleBack, handleConfirm }: any) {
  const serviceObj = services.find((s: any) => s.id === selectedService);
  const barberObj = selectedBarber ? barbers.find((b: any) => b.id === selectedBarber) : null;
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Confirme seu agendamento</h3>
      <div className="border rounded-md p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium text-muted-foreground">Serviço</h4>
            <p>{serviceObj?.name}</p>
            <p className="text-xs text-muted-foreground">{serviceObj?.description}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-muted-foreground">Profissional</h4>
            <p>{barberObj ? barberObj.name : selectedBarber === null ? "A definir" : ""}</p>
            {selectedBarber === null && (
              <p className="text-xs text-muted-foreground">(Será escolhido pela barbearia)</p>
            )}
          </div>
          <div>
            <h4 className="text-sm font-medium text-muted-foreground">Data</h4>
            <p>{date?.toLocaleDateString("pt-BR")}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-muted-foreground">Horário</h4>
            <p>{selectedTime}</p>
          </div>
        </div>
        <Separator />
        <div>
          <h4 className="text-sm font-medium text-muted-foreground">Valor</h4>
          <p className="text-lg font-medium">R$ {Number(serviceObj?.price ?? 0).toFixed(2)}</p>
        </div>
      </div>
      <div className="flex justify-between">
        <Button variant="outline" onClick={handleBack}>
          Voltar
        </Button>
        <Button onClick={handleConfirm} className="btn-primary">
          Confirmar agendamento
        </Button>
      </div>
    </div>
  );
}

// COMPONENTE PRINCIPAL
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { CalendarIcon, User } from "lucide-react";

type ClientBookingProps = {
  onBookingComplete?: () => void;
};

import type { Database } from "@/lib/supabaseTypes";

type Barber = Database["public"]["Tables"]["barbers"]["Row"];
type Service = Database["public"]["Tables"]["services"]["Row"];
type Barbershop = Database["public"]["Tables"]["barbershops"]["Row"];

export default function ClientBooking({ onBookingComplete }: ClientBookingProps) {
  const { toast } = useToast();
  const [bookingMethod, setBookingMethod] = useState<"time" | "professional">("time");
  const [progressValue, setProgressValue] = useState(0);
  const [step, setStep] = useState(1);

  // Escolha de barbearia (cliente pode ter várias favoritas; aqui listamos todas por enquanto)
  const [shops, setShops] = useState<Barbershop[]>([]);
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);

  // Dados carregados da barbearia
  const [services, setServices] = useState<Service[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);

  // Estados para agendar por horário
  const [selectedServiceHorario, setSelectedServiceHorario] = useState<string | null>(null);
  const [dateHorario, setDateHorario] = useState<Date | null>(null);
  const [selectedTimeHorario, setSelectedTimeHorario] = useState<string | null>(null);
  const [selectedBarberHorario, setSelectedBarberHorario] = useState<string | null>(null);
  const [availableBarbersAtTime, setAvailableBarbersAtTime] = useState<Barber[]>([]);
  const [availableSlotsHorario, setAvailableSlotsHorario] = useState<string[]>([]);
  const [loadingSlotsHorario, setLoadingSlotsHorario] = useState(false);

  // Estados para agendar por profissional
  const [selectedBarberProfissional, setSelectedBarberProfissional] = useState<string | null>(null);
  const [selectedServiceProfissional, setSelectedServiceProfissional] = useState<string | null>(null);
  const [dateProfissional, setDateProfissional] = useState<Date | null>(null);
  const [selectedTimeProfissional, setSelectedTimeProfissional] = useState<string | null>(null);
  const [availableSlotsProfissional, setAvailableSlotsProfissional] = useState<string[]>([]);
  const [loadingSlotsProfissional, setLoadingSlotsProfissional] = useState(false);

  // Resetar steps ao trocar método de agendamento
  useEffect(() => {
    setStep(1);
    // Reset estados do método anterior
    if (bookingMethod === "time") {
      setSelectedBarberProfissional(null);
      setSelectedServiceProfissional(null);
      setDateProfissional(null);
      setSelectedTimeProfissional(null);
    } else {
      setSelectedServiceHorario(null);
      setDateHorario(null);
      setSelectedTimeHorario(null);
      setSelectedBarberHorario(null);
      setAvailableBarbersAtTime([]);
    }
  }, [bookingMethod]);

  // Resetar barbeiro selecionado quando horário mudar
  useEffect(() => {
    setSelectedBarberHorario(null);
    setAvailableBarbersAtTime([]);
  }, [selectedTimeHorario]);

  // Progresso simples
  useEffect(() => {
    const totalSteps = bookingMethod === "time" ? 4 : 4; // Ambos agora têm 4 steps
    setProgressValue(((step - 1) / (totalSteps - 1)) * 100);
  }, [bookingMethod, step]);

  // Carrega barbearias (RPC list_barbershops)
  useEffect(() => {
    (async () => {
      const { data, error } = await (supabase as any).rpc("list_barbershops", { p_search: null });
      if (!error && Array.isArray(data)) {
        setShops(data as any);
        if (!selectedShopId && data.length > 0) setSelectedShopId(data[0].id);
      }
    })();
  }, []);

  // Carrega serviços e barbeiros da barbearia
  useEffect(() => {
    if (!selectedShopId) return;
    (async () => {
      const [{ data: svc }, { data: barb }] = await Promise.all([
        supabase.from("services").select("*").eq("barbershop_id", selectedShopId).eq("is_active", true),
        supabase.from("barbers").select("*").eq("barbershop_id", selectedShopId).eq("is_active", true),
      ]);
      setServices((svc || []) as any);
      setBarbers((barb || []) as any);
    })();
  }, [selectedShopId]);

  // Calcular intervalo baseado na duração do serviço
  const getServiceDuration = (serviceId: string | null) => {
    if (!serviceId) return 0;
    const service = services.find(s => s.id === serviceId);
    return service?.duration_minutes || 0;
  };
  // Mantido para compat se algo dependia do nome antigo
  const getSlotStepMinutes = (serviceId: string | null) => SLOT_GRID_MINUTES;

  // Buscar barbeiros disponíveis em um horário específico
  const fetchAvailableBarbersAtTime = async (time: string) => {
    if (!selectedShopId || !dateHorario || !selectedServiceHorario || !time) return;
    
    // CORREÇÃO: Usar data simples sem conversão
    const isoDate = getBrazilianDate(dateHorario);
    
    const serviceDuration = getServiceDuration(selectedServiceHorario) || SLOT_GRID_MINUTES;
    const availableBarbers: Barber[] = [];
    for (const barber of barbers) {
      const { data, error } = await (supabase as any).rpc("get_available_time_slots", {
        p_date: isoDate,
        p_barber_id: barber.id,
        p_step_minutes: SLOT_GRID_MINUTES,
        p_service_duration_minutes: serviceDuration
      });
      if (!error && Array.isArray(data)) {
        const hasSlot = data.some((slot: any) => slot.slot_time.substring(0, 5) === time && slot.is_available);
        if (hasSlot) availableBarbers.push(barber);
      }
    }
    setAvailableBarbersAtTime(availableBarbers);
  };

  // Buscar barbeiros quando horário for selecionado
  useEffect(() => {
    if (selectedTimeHorario && bookingMethod === "time") {
      fetchAvailableBarbersAtTime(selectedTimeHorario);
    }
  }, [selectedTimeHorario, selectedShopId, dateHorario, selectedServiceHorario, barbers, bookingMethod]);

  // Função para recarregar slots
  const refetchSlotsHorario = useCallback(async () => {
    if (!selectedShopId || !dateHorario || !selectedServiceHorario || barbers.length === 0) {
      setAvailableSlotsHorario([]);
      return;
    }
    setLoadingSlotsHorario(true);
    
    // CORREÇÃO: Usar data simples sem conversão
    const isoDate = getBrazilianDate(dateHorario);
    
    const serviceDuration = getServiceDuration(selectedServiceHorario) || SLOT_GRID_MINUTES;
    
    const allSlots = new Set<string>();
    for (const barber of barbers) {
      const { data, error } = await (supabase as any).rpc("get_available_time_slots", {
        p_date: isoDate,
        p_barber_id: barber.id,
        p_step_minutes: SLOT_GRID_MINUTES,
        p_service_duration_minutes: serviceDuration
      });
      
      
      if (!error && Array.isArray(data)) {
        data.forEach((slot: any) => {
          if (slot.is_available) allSlots.add(slot.slot_time.substring(0,5));
        });
      }
    }
    const slotsArray = Array.from(allSlots).sort();
    setAvailableSlotsHorario(slotsArray);
    setLoadingSlotsHorario(false);
  }, [selectedShopId, dateHorario, selectedServiceHorario, barbers]);

  // Buscar horários disponíveis quando dados chave mudarem
  useEffect(() => {
    const fetchSlots = async () => {
      if (!selectedShopId || !dateHorario || !selectedServiceHorario || barbers.length === 0) {
        setAvailableSlotsHorario([]);
        return;
      }
      setLoadingSlotsHorario(true);
      
      // CORREÇÃO: Usar data simples sem conversão
      const isoDate = getBrazilianDate(dateHorario);
      
      const serviceDuration = getServiceDuration(selectedServiceHorario) || SLOT_GRID_MINUTES;
      
      const allSlots = new Set<string>();
      for (const barber of barbers) {
        const { data, error } = await (supabase as any).rpc("get_available_time_slots", {
          p_date: isoDate,
          p_barber_id: barber.id,
          p_step_minutes: SLOT_GRID_MINUTES,
          p_service_duration_minutes: serviceDuration
        });
        
        if (!error && Array.isArray(data)) {
          data.forEach((slot: any) => {
            if (slot.is_available) allSlots.add(slot.slot_time.substring(0,5));
          });
        }
      }
      const slotsArray = Array.from(allSlots).sort();
      setAvailableSlotsHorario(slotsArray);
      setLoadingSlotsHorario(false);
    };
    fetchSlots();
  }, [selectedShopId, dateHorario, selectedServiceHorario, barbers]);

  // Função para recarregar slots profissional
  const refetchSlotsProfissional = useCallback(async () => {
    if (!selectedShopId || !dateProfissional || !selectedServiceProfissional || !selectedBarberProfissional) {
      setAvailableSlotsProfissional([]);
      return;
    }
    setLoadingSlotsProfissional(true);
    
    // CORREÇÃO: Usar data simples sem conversão
    const isoDate = getBrazilianDate(dateProfissional);
    
    const serviceDuration = getServiceDuration(selectedServiceProfissional) || SLOT_GRID_MINUTES;
    
    
    const { data, error } = await (supabase as any).rpc("get_available_time_slots", {
      p_date: isoDate,
      p_barber_id: selectedBarberProfissional,
      p_step_minutes: SLOT_GRID_MINUTES,
      p_service_duration_minutes: serviceDuration
    });
    
    if (!error && Array.isArray(data)) {
      const slots = data.filter((slot: any) => slot.is_available).map((slot: any) => slot.slot_time.substring(0,5));
      setAvailableSlotsProfissional(slots);
    } else {
      setAvailableSlotsProfissional([]);
    }
    setLoadingSlotsProfissional(false);
  }, [selectedShopId, dateProfissional, selectedServiceProfissional, selectedBarberProfissional]);

  // Buscar horários disponíveis para método profissional
  useEffect(() => {
    const fetchSlots = async () => {
      if (!selectedShopId || !dateProfissional || !selectedServiceProfissional || !selectedBarberProfissional) {
        setAvailableSlotsProfissional([]);
        return;
      }
      setLoadingSlotsProfissional(true);
      
      // CORREÇÃO: Usar data simples sem conversão
      const isoDate = getBrazilianDate(dateProfissional);
      
      const serviceDuration = getServiceDuration(selectedServiceProfissional) || SLOT_GRID_MINUTES;
      
      
      const { data, error } = await (supabase as any).rpc("get_available_time_slots", {
        p_date: isoDate,
        p_barber_id: selectedBarberProfissional,
        p_step_minutes: SLOT_GRID_MINUTES,
        p_service_duration_minutes: serviceDuration
      });
      
      if (!error && Array.isArray(data)) {
        const slots = data.filter((slot: any) => slot.is_available).map((slot: any) => slot.slot_time.substring(0,5));
        setAvailableSlotsProfissional(slots);
      } else {
        setAvailableSlotsProfissional([]);
      }
      setLoadingSlotsProfissional(false);
    };
    fetchSlots();
  }, [selectedShopId, dateProfissional, selectedServiceProfissional, selectedBarberProfissional]);

  // Handlers para navegação de etapas
  // Horário
  const handleNextHorario = () => setStep((prev) => prev + 1);
  const handleBackHorario = () => setStep((prev) => prev - 1);
  const handleConfirmHorario = async () => {
    if (!selectedShopId || !selectedServiceHorario || !dateHorario || !selectedTimeHorario || !selectedBarberHorario) return;
    const startISO = getLocalOffsetTimestamp(dateHorario, selectedTimeHorario);
    const { data, error } = await (supabase as any).rpc("create_appointment", {
      p_barbershop_id: selectedShopId,
      p_client_id: null,
      p_barber_id: selectedBarberHorario,
      p_start_at: startISO,
      p_service_ids: [selectedServiceHorario],
      p_notes: null,
    });
    
    
    if (error) {
      toast({ title: "Erro ao agendar", description: error.message, variant: "destructive" });
      return;
    }
    
    toast({ title: "Agendamento criado!" });
    
    // Recarregar slots para remover horário recém usado
    setSelectedTimeHorario(null);
    setAvailableBarbersAtTime([]);
    
    // Recarregar slots após um pequeno delay para garantir que o agendamento foi salvo
    setTimeout(async () => {
      // Aguardar um pouco mais para garantir que o banco foi atualizado
      await new Promise(resolve => setTimeout(resolve, 500));
      await refetchSlotsHorario();
    }, 1000);
    
    onBookingComplete?.();
    setStep(1);
    setSelectedServiceHorario(null);
    setDateHorario(null);
    setSelectedBarberHorario(null);
  };
  // Profissional
  const handleNextProfissional = () => setStep((prev) => prev + 1);
  const handleBackProfissional = () => setStep((prev) => prev - 1);
  const handleConfirmProfissional = async () => {
    if (!selectedShopId || !selectedServiceProfissional || !dateProfissional || !selectedTimeProfissional || !selectedBarberProfissional) return;
    const startISO = getLocalOffsetTimestamp(dateProfissional, selectedTimeProfissional);
    const { data, error } = await (supabase as any).rpc("create_appointment", {
      p_barbershop_id: selectedShopId,
      p_client_id: null,
      p_barber_id: selectedBarberProfissional,
      p_start_at: startISO,
      p_service_ids: [selectedServiceProfissional],
      p_notes: null,
    });
    
    
    if (error) {
      toast({ title: "Erro ao agendar", description: error.message, variant: "destructive" });
      return;
    }
    
    toast({ title: "Agendamento criado!" });
    
    // Limpar seleção e recarregar slots
    setSelectedTimeProfissional(null);
    
    // Recarregar slots após um pequeno delay para garantir que o agendamento foi salvo
    setTimeout(async () => {
      // Aguardar um pouco mais para garantir que o banco foi atualizado
      await new Promise(resolve => setTimeout(resolve, 500));
      await refetchSlotsProfissional();
    }, 1000);
    
    onBookingComplete?.();
    setStep(1);
    setSelectedBarberProfissional(null);
    setSelectedServiceProfissional(null);
    setDateProfissional(null);
  };

  return (
    <div className="space-y-6">
      <Card className="barber-card">
        <CardHeader>
          <CardTitle>Faça seu agendamento</CardTitle>
          <CardDescription>Selecione uma barbearia</CardDescription>
          <div className="max-w-sm">
            <Select value={selectedShopId ?? undefined} onValueChange={(v) => setSelectedShopId(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a barbearia" />
              </SelectTrigger>
              <SelectContent>
                {shops.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Tabs defaultValue={bookingMethod} onValueChange={(value) => setBookingMethod(value as "time" | "professional")}>
            <TabsList className="grid w-full grid-cols-2 mb-2 mt-2">
              <TabsTrigger value="time" className="flex items-center gap-1">
                <CalendarIcon className="h-4 w-4" />
                Agendar por horário
              </TabsTrigger>
              <TabsTrigger value="professional" className="flex items-center gap-1">
                <User className="h-4 w-4" />
                Agendar por profissional
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Progress value={progressValue} className="mt-2" />
        </CardHeader>
        <CardContent>
          {bookingMethod === "time" ? (
            <>
              {step === 1 && (
                <ServiceStep
                  services={services}
                  selectedService={selectedServiceHorario}
                  setSelectedService={setSelectedServiceHorario}
                  handleNext={handleNextHorario}
                />
              )}
              {step === 2 && (
                <ServiceDateTimeStep
                  date={dateHorario}
                  setDate={setDateHorario}
                  selectedTime={selectedTimeHorario}
                  setSelectedTime={setSelectedTimeHorario}
                  availableSlots={availableSlotsHorario}
                  loadingSlots={loadingSlotsHorario}
                  handleBack={handleBackHorario}
                  handleNext={handleNextHorario}
                />
              )}
              {step === 3 && (
                <AvailableBarbersStep
                  availableBarbers={availableBarbersAtTime}
                  selectedBarber={selectedBarberHorario}
                  setSelectedBarber={setSelectedBarberHorario}
                  selectedTime={selectedTimeHorario}
                  handleBack={handleBackHorario}
                  handleNext={handleNextHorario}
                />
              )}
              {step === 4 && (
                <ConfirmStep
                  selectedService={selectedServiceHorario}
                  selectedBarber={selectedBarberHorario}
                  date={dateHorario}
                  selectedTime={selectedTimeHorario}
                  services={services}
                  barbers={barbers}
                  handleBack={handleBackHorario}
                  handleConfirm={handleConfirmHorario}
                />
              )}
            </>
          ) : (
            <>
              {step === 1 && (
                <ProfessionalStep
                  barbers={barbers}
                  selectedBarber={selectedBarberProfissional}
                  setSelectedBarber={setSelectedBarberProfissional}
                  handleNext={handleNextProfissional}
                />
              )}
              {step === 2 && (
                <ServiceStep
                  services={services}
                  selectedService={selectedServiceProfissional}
                  setSelectedService={setSelectedServiceProfissional}
                  handleBack={handleBackProfissional}
                  handleNext={handleNextProfissional}
                />
              )}
              {step === 3 && (
                <ServiceDateTimeStep
                  date={dateProfissional}
                  setDate={setDateProfissional}
                  selectedTime={selectedTimeProfissional}
                  setSelectedTime={setSelectedTimeProfissional}
                  availableSlots={availableSlotsProfissional}
                  loadingSlots={loadingSlotsProfissional}
                  handleBack={handleBackProfissional}
                  handleNext={handleNextProfissional}
                />
              )}
              {step === 4 && (
                <ConfirmStep
                  selectedService={selectedServiceProfissional}
                  selectedBarber={selectedBarberProfissional}
                  date={dateProfissional}
                  selectedTime={selectedTimeProfissional}
                  services={services}
                  barbers={barbers}
                  handleBack={handleBackProfissional}
                  handleConfirm={handleConfirmProfissional}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { 
  Card, 
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle 
} from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { 
  CheckCircle, 
  Clock 
} from "lucide-react";


// Mock data for services
import { initialProducts } from "@/pages/Produtos";
const services = initialProducts.filter(p => p.type === "service");
// Mock data for barbers
const barbers = [
  { id: 1, name: "Elias", availability: true },
  { id: 2, name: "Pedro", availability: true },
  { id: 3, name: "Carlos", availability: false },
  { id: 4, name: "André", availability: true },
];
// Horários dinâmicos conforme funcionamento do salão
import { salonSchedule, generateTimeSlots } from "@/config/salonSchedule";

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
              selectedService === service.id ? 'border-barber-gold bg-barber-gold/5' : ''
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
                {service.duration} minutos
              </span>
              <span className="font-medium">R$ {service.price.toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between">
        {handleBack && (
          <Button variant="outline" onClick={handleBack}>Voltar</Button>
        )}
        <Button onClick={handleNext} disabled={!selectedService} className="btn-primary">Próximo passo</Button>
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
              !barber.availability ? 'opacity-50 cursor-not-allowed' : ''
            } ${selectedBarber === barber.id ? 'border-barber-gold bg-barber-gold/5' : ''}`}
            onClick={() => barber.availability && setSelectedBarber(barber.id)}
          >
            <div className="flex justify-between">
              <h4 className="font-medium">{barber.name}</h4>
              {selectedBarber === barber.id && (
                <CheckCircle className="h-5 w-5 text-barber-gold" />
              )}
            </div>
            <div className="mt-2 text-sm">
              <span className={`${barber.availability ? 'text-green-500' : 'text-red-500'}`}>
                {barber.availability ? 'Disponível' : 'Indisponível para esta data'}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-end">
        <Button onClick={handleNext} disabled={!selectedBarber} className="btn-primary">Próximo passo</Button>
      </div>
    </div>
  );
}

export function ServiceDateTimeStep({ date, setDate, selectedTime, setSelectedTime, handleBack, handleNext }: any) {
  // Descobre o dia da semana selecionado
  const diasSemana = ["domingo", "segunda", "terca", "quarta", "quinta", "sexta", "sabado"];
  const diaSelecionado = date ? diasSemana[date.getDay()] : null;
  const configDia = salonSchedule.find(d => d.day === diaSelecionado);
  const slots = configDia && configDia.active ? generateTimeSlots(configDia.open, configDia.close) : [];
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
          <div className="grid grid-cols-3 gap-2">
            {configDia && configDia.active ? (
              slots.map(time => (
                <Button
                  key={time}
                  variant="outline"
                  className={`${selectedTime === time ? 'border-barber-gold bg-barber-gold/5' : ''}`}
                  onClick={() => setSelectedTime(time)}
                >
                  {time}
                </Button>
              ))
            ) : (
              <span className="col-span-3 text-muted-foreground">Salão fechado</span>
            )}
          </div>
        </div>
      </div>
      <div className="flex justify-between">
        {handleBack && (
          <Button variant="outline" onClick={handleBack}>Voltar</Button>
        )}
        <Button onClick={handleNext} disabled={!selectedTime} className="btn-primary">Próximo passo</Button>
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
            <p>{barberObj ? barberObj.name : (selectedBarber === null ? 'A definir' : '')}</p>
            {selectedBarber === null && (
              <p className="text-xs text-muted-foreground">(Será escolhido pela barbearia)</p>
            )}
          </div>
          <div>
            <h4 className="text-sm font-medium text-muted-foreground">Data</h4>
            <p>{date?.toLocaleDateString('pt-BR')}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-muted-foreground">Horário</h4>
            <p>{selectedTime}</p>
          </div>
        </div>
        <Separator />
        <div>
          <h4 className="text-sm font-medium text-muted-foreground">Valor</h4>
          <p className="text-lg font-medium">R$ {serviceObj?.price?.toFixed(2)}</p>
        </div>
      </div>
      <div className="flex justify-between">
        <Button variant="outline" onClick={handleBack}>Voltar</Button>
        <Button onClick={handleConfirm} className="btn-primary">Confirmar agendamento</Button>
      </div>
    </div>
  );
}

// COMPONENTE PRINCIPAL
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { CalendarIcon, User, Star } from "lucide-react";

type ClientBookingProps = {
  onBookingComplete?: () => void;
};

export default function ClientBooking({ onBookingComplete }: ClientBookingProps) {
  const [bookingMethod, setBookingMethod] = useState<"time" | "professional">("time");
  const [progressValue, setProgressValue] = useState(0);
  const [step, setStep] = useState(1);
  // Estados para agendar por horário
  const [selectedServiceHorario, setSelectedServiceHorario] = useState<number | null>(null);
  const [dateHorario, setDateHorario] = useState<Date | null>(null);
  const [selectedTimeHorario, setSelectedTimeHorario] = useState<string | null>(null);
  // Estados para agendar por profissional
  const [selectedBarberProfissional, setSelectedBarberProfissional] = useState<number | null>(null);
  const [selectedServiceProfissional, setSelectedServiceProfissional] = useState<number | null>(null);
  const [dateProfissional, setDateProfissional] = useState<Date | null>(null);
  const [selectedTimeProfissional, setSelectedTimeProfissional] = useState<string | null>(null);
  // Handlers para navegação de etapas
  // Horário
  const handleNextHorario = () => setStep((prev) => prev + 1);
  const handleBackHorario = () => setStep((prev) => prev - 1);
  const handleConfirmHorario = () => {
    alert('Agendamento por horário confirmado!');
    if (onBookingComplete) onBookingComplete();
    setStep(1);
    setSelectedServiceHorario(null);
    setDateHorario(null);
    setSelectedTimeHorario(null);
  };
  // Profissional
  const handleNextProfissional = () => setStep((prev) => prev + 1);
  const handleBackProfissional = () => setStep((prev) => prev - 1);
  const handleConfirmProfissional = () => {
    alert('Agendamento por profissional confirmado!');
    if (onBookingComplete) onBookingComplete();
    setStep(1);
    setSelectedBarberProfissional(null);
    setSelectedServiceProfissional(null);
    setDateProfissional(null);
    setSelectedTimeProfissional(null);
  };

  return (
    <div className="space-y-6">
      <Card className="barber-card">
        <CardHeader>
          <CardTitle>Faça seu agendamento</CardTitle>
          <Tabs defaultValue={bookingMethod} onValueChange={(value) => setBookingMethod(value as "time" | "professional")}> 
            <TabsList className="grid w-full grid-cols-2 mb-2">
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
                  handleBack={handleBackHorario}
                  handleNext={handleNextHorario}
                />
              )}
              {step === 3 && (
                <ConfirmStep
                  selectedService={selectedServiceHorario}
                  selectedBarber={null}
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

import { useState } from "react";
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
  Clock, 
  User, 
  Calendar as CalendarIcon, 
  Star,
  ShoppingBag 
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClientCommand } from "./command";

// Mock data for services
const services = [
  { id: 1, name: "Corte de Cabelo", duration: "30 min", price: "R$ 50,00" },
  { id: 2, name: "Barba", duration: "20 min", price: "R$ 30,00" },
  { id: 3, name: "Corte + Barba", duration: "50 min", price: "R$ 70,00" },
  { id: 4, name: "Acabamentos", duration: "15 min", price: "R$ 20,00" },
  { id: 5, name: "Sobrancelha", duration: "15 min", price: "R$ 15,00" },
];

// Mock data for barbers
const barbers = [
  { id: 1, name: "João", availability: true },
  { id: 2, name: "Pedro", availability: true },
  { id: 3, name: "Carlos", availability: false },
  { id: 4, name: "André", availability: true },
];

// Mock data for time slots
const timeSlots = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00"
];

// Type for appointments
interface Appointment {
  id: number;
  service: string;
  barber: string;
  date: string;
  time: string;
  status: 'confirmado' | 'pendente';
  price: string;
  commandId?: string;
}

export function ClientBooking() {
  const { toast } = useToast();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [selectedBarber, setSelectedBarber] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [bookingMethod, setBookingMethod] = useState<"time" | "professional">("time");
  const [isVipClient] = useState(true); // Mock VIP status
  const [suggestedService] = useState(services[2]); // Mock suggested service based on history
  const [activeClientTab, setActiveClientTab] = useState<"bookings" | "command">("bookings");
  
  // State for storing appointments
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: 1,
      service: "Corte de Cabelo",
      barber: "João",
      date: "25/04/2025",
      time: "09:30",
      status: "confirmado",
      price: "R$ 50,00",
      commandId: "cmd-1234"
    },
    {
      id: 2,
      service: "Barba",
      barber: "Pedro",
      date: "15/05/2025",
      time: "14:00",
      status: "pendente",
      price: "R$ 30,00"
    }
  ]);
  
  const progressValue = (step / 4) * 100;
  
  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    }
  };
  
  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };
  
  const handleConfirm = () => {
    // Create a new appointment
    const selectedServiceData = services.find(s => s.id === selectedService);
    const selectedBarberData = barbers.find(b => b.id === selectedBarber);
    
    if (date && selectedServiceData && (bookingMethod === "professional" ? selectedBarberData : true) && selectedTime) {
      const newAppointment: Appointment = {
        id: appointments.length + 1,
        service: selectedServiceData.name,
        barber: bookingMethod === "professional" ? selectedBarberData!.name : "A definir",
        date: date.toLocaleDateString('pt-BR'),
        time: selectedTime,
        status: 'pendente',
        price: selectedServiceData.price
      };
      
      // Add the new appointment to state
      setAppointments([...appointments, newAppointment]);
      
      toast({
        title: "Agendamento confirmado!",
        description: "Seu agendamento foi realizado com sucesso.",
        duration: 5000,
      });
      
      // Reset form and go back to step 1
      setStep(1);
      setSelectedService(null);
      setSelectedBarber(null);
      setSelectedTime(null);
      setDate(new Date());
    }
  };
  
  return (
    <div className="space-y-6">
      <Card className="barber-card">
        <CardHeader>
          <CardTitle>Faça seu agendamento</CardTitle>
          <Tabs defaultValue="time" onValueChange={(value) => setBookingMethod(value as "time" | "professional")}>
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
          {isVipClient && step === 1 && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-md">
              <h3 className="text-amber-700 font-medium flex items-center gap-2">
                <Star className="h-5 w-5 text-amber-500" />
                Sugestão para você
              </h3>
              <p className="text-sm text-amber-700 mt-1">
                Com base no seu histórico, recomendamos:
              </p>
              <div className="mt-2 p-3 bg-white rounded border border-amber-200 cursor-pointer hover:bg-amber-50 transition-colors"
                onClick={() => setSelectedService(suggestedService.id)}>
                <div className="flex justify-between">
                  <span className="font-medium">{suggestedService.name}</span>
                  <span>{suggestedService.price}</span>
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Duração: {suggestedService.duration}
                </div>
              </div>
            </div>
          )}

          {bookingMethod === "time" ? (
            <>
              {step === 1 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium">Escolha o serviço</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {services.map(service => (
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
                        <div className="mt-2 flex justify-between text-sm">
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            {service.duration}
                          </span>
                          <span className="font-medium">{service.price}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-end">
                    <Button 
                      onClick={handleNext}
                      disabled={!selectedService} 
                      className="btn-primary"
                    >
                      Próximo passo
                    </Button>
                  </div>
                </div>
              )}
              
              {step === 2 && (
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
                        {timeSlots.map(time => (
                          <Button
                            key={time}
                            variant="outline"
                            className={`${
                              selectedTime === time ? 'border-barber-gold bg-barber-gold/5' : ''
                            }`}
                            onClick={() => setSelectedTime(time)}
                          >
                            {time}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <Button variant="outline" onClick={handleBack}>
                      Voltar
                    </Button>
                    <Button 
                      onClick={handleNext}
                      disabled={!selectedTime} 
                      className="btn-primary"
                    >
                      Próximo passo
                    </Button>
                  </div>
                </div>
              )}
              
              {step === 3 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium">Confirme seu agendamento</h3>
                  
                  <div className="border rounded-md p-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Serviço</h4>
                        <p>{services.find(s => s.id === selectedService)?.name}</p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Profissional</h4>
                        <p>A definir</p>
                        <p className="text-xs text-muted-foreground">(Será escolhido pela barbearia)</p>
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
                      <p className="text-lg font-medium">
                        {services.find(s => s.id === selectedService)?.price}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <Button variant="outline" onClick={handleBack}>
                      Voltar
                    </Button>
                    <Button 
                      onClick={handleConfirm} 
                      className="btn-primary"
                    >
                      Confirmar agendamento
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            // Professional booking flow
            <>
              {step === 1 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium">Escolha o profissional</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {barbers.map(barber => (
                      <div 
                        key={barber.id} 
                        className={`border rounded-md p-4 cursor-pointer transition-all ${
                          !barber.availability ? 'opacity-50 cursor-not-allowed' : ''
                        } ${
                          selectedBarber === barber.id ? 'border-barber-gold bg-barber-gold/5' : ''
                        }`}
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
                    <Button 
                      onClick={handleNext}
                      disabled={!selectedBarber} 
                      className="btn-primary"
                    >
                      Próximo passo
                    </Button>
                  </div>
                </div>
              )}
              
              {step === 2 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium">Escolha o serviço</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {services.map(service => (
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
                        <div className="mt-2 flex justify-between text-sm">
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            {service.duration}
                          </span>
                          <span className="font-medium">{service.price}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-between">
                    <Button variant="outline" onClick={handleBack}>
                      Voltar
                    </Button>
                    <Button 
                      onClick={handleNext}
                      disabled={!selectedService} 
                      className="btn-primary"
                    >
                      Próximo passo
                    </Button>
                  </div>
                </div>
              )}
              
              {step === 3 && (
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
                        {timeSlots.map(time => (
                          <Button
                            key={time}
                            variant="outline"
                            className={`${
                              selectedTime === time ? 'border-barber-gold bg-barber-gold/5' : ''
                            }`}
                            onClick={() => setSelectedTime(time)}
                          >
                            {time}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <Button variant="outline" onClick={handleBack}>
                      Voltar
                    </Button>
                    <Button 
                      onClick={handleNext}
                      disabled={!selectedTime} 
                      className="btn-primary"
                    >
                      Próximo passo
                    </Button>
                  </div>
                </div>
              )}
              
              {step === 4 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium">Confirme seu agendamento</h3>
                  
                  <div className="border rounded-md p-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Serviço</h4>
                        <p>{services.find(s => s.id === selectedService)?.name}</p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Profissional</h4>
                        <p>{barbers.find(b => b.id === selectedBarber)?.name}</p>
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
                      <p className="text-lg font-medium">
                        {services.find(s => s.id === selectedService)?.price}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <Button variant="outline" onClick={handleBack}>
                      Voltar
                    </Button>
                    <Button 
                      onClick={handleConfirm} 
                      className="btn-primary"
                    >
                      Confirmar agendamento
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
      
      <Card className="barber-card">
        <CardHeader className="pb-3">
          <Tabs defaultValue="bookings" onValueChange={(value) => setActiveClientTab(value as "bookings" | "command")}>
            <div className="flex justify-between items-center">
              <TabsList>
                <TabsTrigger value="bookings" className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Meus agendamentos
                </TabsTrigger>
                <TabsTrigger value="command" className="flex items-center gap-1">
                  <ShoppingBag className="h-4 w-4" />
                  Comanda Digital
                </TabsTrigger>
              </TabsList>
            </div>
          </Tabs>
        </CardHeader>
        <CardContent>
          <TabsContent value="bookings" className="mt-0">
            <div className="divide-y">
              {appointments.map((appointment) => (
                <div key={appointment.id} className="py-4">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-medium">{appointment.service}</h3>
                      <p className="text-sm text-muted-foreground">Com {appointment.barber} • {appointment.time}</p>
                      {appointment.commandId && (
                        <div className="mt-1">
                          <span className="text-xs px-2 py-1 bg-amber-100 text-amber-800 rounded-full flex items-center w-fit">
                            <ShoppingBag className="h-3 w-3 mr-1" />
                            Comanda #{appointment.commandId.substring(4, 8).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{appointment.date}</p>
                      <p className={`text-sm ${appointment.status === 'confirmado' ? 'text-green-500' : 'text-amber-500'}`}>
                        {appointment.status === 'confirmado' ? 'Confirmado' : 'Pendente'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {appointments.length === 0 && (
                <div className="py-4 text-center text-muted-foreground">
                  Você não possui agendamentos.
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="command" className="mt-0">
            <ClientCommand 
              clientId="client-123"
              clientName="Rodrigo"
              appointmentId="app-123"
            />
          </TabsContent>
        </CardContent>
      </Card>
    </div>
  );
}


import { DashboardLayout } from "@/components/dashboard/layout";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar as CalendarIcon, Clock, Plus, User } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

// Types for appointments
interface Appointment {
  id: number;
  clientName: string;
  service: string;
  time: string;
  duration: number;
  barber: string;
  status: "confirmed" | "pending";
  date: string;
}

// Mocked barbers
const barbers = [
  { id: 1, name: "João Barber" },
  { id: 2, name: "Pedro Barbeiro" },
  { id: 3, name: "Marcos Silva" },
];

// Horários dinâmicos conforme funcionamento do salão
import { salonSchedule, generateTimeSlots } from "@/config/salonSchedule";

// Available services
import { initialProducts } from "./Produtos";
// Sincroniza serviços com Produtos.tsx
const services = initialProducts.filter(p => p.type === "service");

export default function Agendamentos() {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedBarber, setSelectedBarber] = useState<number | null>(null);
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [clientName, setClientName] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  
  // State for appointments
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: 1,
      clientName: "Carlos Silva",
      service: "Corte + Barba",
      time: "10:00",
      duration: 45,
      barber: "João Barber",
      status: "confirmed",
      date: format(new Date(), "dd/MM/yyyy")
    },
    {
      id: 2,
      clientName: "Roberto Almeida",
      service: "Corte Degradê",
      time: "11:30",
      duration: 30,
      barber: "Pedro Barbeiro",
      status: "confirmed",
      date: format(new Date(), "dd/MM/yyyy")
    },
    {
      id: 3,
      clientName: "Lucas Mendes",
      service: "Barba Completa",
      time: "13:15",
      duration: 20,
      barber: "João Barber",
      status: "pending",
      date: format(new Date(), "dd/MM/yyyy")
    },
  ]);
  
  const resetNewAppointment = () => {
    setSelectedBarber(null);
    setSelectedService(null);
    setSelectedTime(null);
    setClientName("");
  };

  const handleCreateAppointment = () => {
    // Validate form
    if (!clientName || !selectedBarber || !selectedService || !selectedTime || !selectedDate) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }
    
    // Get selected service and barber details
    const serviceData = services.find(s => s.id === selectedService);
    const barberData = barbers.find(b => b.id === selectedBarber);
    
    if (!serviceData || !barberData) return;
    
    // Create new appointment
    const newAppointment: Appointment = {
      id: appointments.length + 1,
      clientName,
      service: serviceData.name,
      time: selectedTime,
      duration: serviceData.duration,
      barber: barberData.name,
      status: "pending",
      date: format(selectedDate, "dd/MM/yyyy")
    };
    
    // Add appointment to the list
    setAppointments([...appointments, newAppointment]);
    
    // Show success message
    toast({
      title: "Agendamento criado",
      description: `Agendamento para ${clientName} foi criado com sucesso.`,
    });
    
    // Close sheet and reset form
    setSheetOpen(false);
    resetNewAppointment();
  };
  
  // Filter appointments by the selected date
  const filteredAppointments = appointments.filter(appointment => {
    if (!selectedDate) return true;
    return appointment.date === format(selectedDate, "dd/MM/yyyy");
  });
  
  const confirmedAppointments = filteredAppointments.filter(a => a.status === "confirmed");
  const pendingAppointments = filteredAppointments.filter(a => a.status === "pending");
  
  // Handle appointment status change
  const handleConfirmAppointment = (id: number) => {
    setAppointments(appointments.map(appointment => {
      if (appointment.id === id) {
        return {...appointment, status: "confirmed"};
      }
      return appointment;
    }));
    
    toast({
      title: "Agendamento confirmado",
      description: "O agendamento foi confirmado com sucesso."
    });
  };
  
  const handleCancelAppointment = (id: number) => {
    setAppointments(appointments.filter(appointment => appointment.id !== id));
    
    toast({
      title: "Agendamento cancelado",
      description: "O agendamento foi cancelado com sucesso."
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="header-text">Agendamentos</h1>
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
                    <Input 
                      type="text" 
                      placeholder="Nome do cliente" 
                      className="pl-10"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                    />
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
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
                            {service.duration} min
                          </span>
                          <span className="text-xs opacity-80">
                            R$ {service.price.toFixed(2)}
                          </span>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Horário</label>
                  <div className="grid grid-cols-4 gap-2">
                    {(() => {
                      // Descobre o dia da semana selecionado
                      const diasSemana = ["domingo", "segunda", "terca", "quarta", "quinta", "sexta", "sabado"];
                      const diaSelecionado = selectedDate ? diasSemana[selectedDate.getDay()] : null;
                      const configDia = salonSchedule.find(d => d.day === diaSelecionado);
                      if (!configDia || !configDia.active) return <span className="col-span-4 text-muted-foreground">Salão fechado</span>;
                      const slots = generateTimeSlots(configDia.open, configDia.close);
                      return slots.map((time) => (
                        <Button
                          key={time}
                          type="button"
                          variant={selectedTime === time ? "default" : "outline"}
                          onClick={() => setSelectedTime(time)}
                          className="py-1"
                        >
                          {time}
                        </Button>
                      ));
                    })()}
                  </div>
                </div>

                <Button 
                  className="w-full mt-6 btn-primary"
                  disabled={!selectedBarber || !selectedService || !selectedTime || !clientName}
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
              <Tabs defaultValue="all">
                <TabsList className="mb-4">
                  <TabsTrigger value="all">Todos</TabsTrigger>
                  <TabsTrigger value="confirmed">Confirmados</TabsTrigger>
                  <TabsTrigger value="pending">Pendentes</TabsTrigger>
                </TabsList>
                
                <TabsContent value="all" className="space-y-3">
                  {filteredAppointments.length === 0 ? (
                    <div className="text-center py-8">
                      <p>Nenhum agendamento encontrado para esta data.</p>
                    </div>
                  ) : (
                    filteredAppointments.map((appointment) => (
                      <div 
                        key={appointment.id}
                        className={`p-3 border rounded-md flex items-center justify-between ${
                          appointment.status === 'pending' ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200'
                        }`}
                      >
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-barber flex items-center justify-center text-white">
                            {appointment.clientName.split(' ').map(name => name[0]).join('')}
                          </div>
                          <div className="ml-3">
                            <div className="font-medium">{appointment.clientName}</div>
                            <div className="text-sm text-muted-foreground">{appointment.service}</div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <div className="text-right mr-4">
                            <div className="flex items-center">
                              <Clock size={14} className="mr-1" />
                              <span>{appointment.time}</span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {appointment.barber}
                            </div>
                          </div>
                          <Button variant="outline" size="sm">Detalhes</Button>
                        </div>
                      </div>
                    ))
                  )}
                </TabsContent>
                
                <TabsContent value="confirmed" className="space-y-3">
                  {confirmedAppointments.length === 0 ? (
                    <div className="text-center py-8">
                      <p>Nenhum agendamento confirmado para esta data.</p>
                    </div>
                  ) : (
                    confirmedAppointments.map((appointment) => (
                      <div 
                        key={appointment.id}
                        className="p-3 border rounded-md bg-green-50 border-green-200 flex items-center justify-between"
                      >
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-barber flex items-center justify-center text-white">
                            {appointment.clientName.split(' ').map(name => name[0]).join('')}
                          </div>
                          <div className="ml-3">
                            <div className="font-medium">{appointment.clientName}</div>
                            <div className="text-sm text-muted-foreground">{appointment.service}</div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <div className="text-right mr-4">
                            <div className="flex items-center">
                              <Clock size={14} className="mr-1" />
                              <span>{appointment.time}</span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {appointment.barber}
                            </div>
                          </div>
                          <Button variant="outline" size="sm">Detalhes</Button>
                        </div>
                      </div>
                    ))
                  )}
                </TabsContent>
                
                <TabsContent value="pending" className="space-y-3">
                  {pendingAppointments.length === 0 ? (
                    <div className="text-center py-8">
                      <p>Nenhum agendamento pendente para esta data.</p>
                    </div>
                  ) : (
                    pendingAppointments.map((appointment) => (
                      <div 
                        key={appointment.id}
                        className="p-3 border rounded-md bg-amber-50 border-amber-200 flex items-center justify-between"
                      >
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-barber flex items-center justify-center text-white">
                            {appointment.clientName.split(' ').map(name => name[0]).join('')}
                          </div>
                          <div className="ml-3">
                            <div className="font-medium">{appointment.clientName}</div>
                            <div className="text-sm text-muted-foreground">{appointment.service}</div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <div className="text-right mr-4">
                            <div className="flex items-center">
                              <Clock size={14} className="mr-1" />
                              <span>{appointment.time}</span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {appointment.barber}
                            </div>
                          </div>
                          <div className="space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="border-green-500 text-green-500 hover:bg-green-50"
                              onClick={() => handleConfirmAppointment(appointment.id)}
                            >
                              Confirmar
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="border-red-500 text-red-500 hover:bg-red-50"
                              onClick={() => handleCancelAppointment(appointment.id)}
                            >
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </TabsContent>
              </Tabs>
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

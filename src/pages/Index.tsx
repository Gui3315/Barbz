
import { DashboardLayout } from "@/components/dashboard/layout";
import { Header } from "@/components/dashboard/header";
import { QuickStats } from "@/components/dashboard/quick-stats";
import { TodayAppointments } from "@/components/dashboard/today-appointments";
import { FinancialSummary } from "@/components/dashboard/financial-summary";
import { PerformanceStats } from "@/components/dashboard/performance-stats";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Dados dos barbeiros virão do backend

// Horários fixos (pode vir do backend se necessário)
const timeSlots = ["12:00", "12:10", "12:20", "12:30", "12:40", "12:50", "13:00", "13:10", "13:20", "13:30", "13:40"];

const Index = () => {
  const currentDate = new Date();
  const [selectedDate, setSelectedDate] = useState(currentDate);
  const [barbers, setBarbers] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/barbers").then(res => res.json()),
      fetch("/api/appointments?date=" + format(selectedDate, "yyyy-MM-dd")).then(res => res.json())
    ])
      .then(([barbersData, appointmentsData]) => {
        setBarbers(barbersData);
        setAppointments(appointmentsData);
        setLoading(false);
      })
      .catch((err) => {
        setError("Erro ao buscar dados do backend");
        setLoading(false);
      });
  }, [selectedDate]);

  const formattedDate = format(selectedDate, "EEEE, dd MMM. yyyy", { locale: ptBR });
  const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

  if (loading) return <div>Carregando...</div>;
  if (error) return <div>{error}</div>;

  return (
    <DashboardLayout>
      <Header 
        title="Dashboard" 
        subtitle={capitalizedDate} 
      />
      <div className="mb-6">
        <QuickStats />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="barber-card">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold">{capitalizedDate}</h2>
                <Button className="btn-primary gap-2">
                  <Plus size={16} />
                  Novo
                </Button>
              </div>
              <div className="border rounded-md overflow-hidden">
                {/* Barber headers */}
                <div className="grid grid-cols-4 border-b">
                  {barbers.map(barber => (
                    <div key={barber.id} className="border-r p-3 text-center">
                      <div className="flex flex-col items-center">
                        <Avatar className="h-12 w-12 mb-2">
                          <AvatarImage src={barber.avatar} alt={barber.name} />
                          <AvatarFallback>{barber.name?.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        <p className="font-medium">{barber.name}</p>
                        <p className="text-sm text-muted-foreground">Próximo {barber.nextAppointment}</p>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Time slots grid */}
                <div className="relative">
                  {timeSlots.map((time, index) => (
                    <div key={time} className="grid grid-cols-4">
                      <div className="border-r p-3 text-right text-sm text-muted-foreground w-20">
                        {time}
                      </div>
                      {/* Empty slots for each barber */}
                      <div className="border-r h-10 border-b"></div>
                      <div className="border-r h-10 border-b"></div>
                      <div className="h-10 border-b"></div>
                      {/* Mark current time */}
                      {time === "12:50" && (
                        <div className="absolute left-0 right-0 border-t border-red-500 z-10" style={{ top: `${(index + 1) * 40}px` }}></div>
                      )}
                    </div>
                  ))}
                  {/* Appointment blocks */}
                  {appointments.map((appointment) => {
                    const startIndex = timeSlots.findIndex(time => time === appointment.startTime);
                    const endIndex = timeSlots.findIndex(time => time === appointment.endTime);
                    const barberIndex = appointment.barberId;
                    const duration = endIndex - startIndex;
                    return (
                      <div 
                        key={appointment.id}
                        className="absolute bg-barber-gold/20 border-l-4 border-barber-gold p-2 rounded-r-md"
                        style={{
                          top: `${startIndex * 40 + 80}px`, // 80px offset for the header
                          height: `${duration * 40}px`,
                          left: `${(barberIndex) * 25}%`, // Position based on barber column
                          width: "calc(25% - 10px)" // Width of one column
                        }}
                      >
                        <div className="text-sm font-medium">{appointment.clientName}</div>
                        <div className="text-xs">{appointment.service}</div>
                        <div className="text-xs text-muted-foreground">
                          {appointment.startTime} - {appointment.endTime}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="mt-6">
            <TodayAppointments />
          </div>
          <div className="mt-6">
            <FinancialSummary />
          </div>
        </div>
        <div>
          <PerformanceStats />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;

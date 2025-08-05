
import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, Clock, MoreHorizontal } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface Appointment {
  id: string;
  clientName: string;
  service: string;
  time: string;
  status: "pending" | "completed" | "canceled";
  isVip?: boolean;
}

const mockAppointments: Appointment[] = [
  {
    id: "1",
    clientName: "Carlos Silva",
    service: "Corte + Barba",
    time: "09:00",
    status: "completed",
  },
  {
    id: "2",
    clientName: "André Santos",
    service: "Corte Degradê",
    time: "10:30",
    status: "completed",
    isVip: true,
  },
  {
    id: "3",
    clientName: "Rafael Mendes",
    service: "Barba",
    time: "13:00",
    status: "pending",
  },
  {
    id: "4",
    clientName: "Marcos Oliveira",
    service: "Corte Social",
    time: "14:30",
    status: "pending",
  },
  {
    id: "5",
    clientName: "Lucas Pereira",
    service: "Corte + Barba + Sobrancelha",
    time: "16:00",
    status: "pending",
    isVip: true,
  },
];

export function TodayAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);

  const completeAppointment = (id: string) => {
    setAppointments(appointments.map(app => 
      app.id === id ? { ...app, status: "completed" } : app
    ));
  };

  const cancelAppointment = (id: string) => {
    setAppointments(appointments.map(app => 
      app.id === id ? { ...app, status: "canceled" } : app
    ));
  };

  return (
    <Card className="barber-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Agendamentos de hoje</CardTitle>
        <Button variant="outline" size="sm" asChild>
          <Link to="/agendamentos">
            Ver todos
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <div
              key={appointment.id}
              className={`flex items-center justify-between p-3 rounded-md transition-colors ${
                appointment.status === "completed" 
                  ? "bg-muted/50"
                  : appointment.status === "canceled"
                  ? "bg-destructive/10"
                  : "bg-white dark:bg-barber-light/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar>
                    <AvatarFallback className="bg-secondary text-primary">
                      {appointment.clientName.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  {appointment.isVip && (
                    <div className="absolute -top-1 -right-1 bg-barber-gold text-white rounded-full p-0.5">
                      <Star className="h-3 w-3" />
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{appointment.clientName}</p>
                    {appointment.isVip && (
                      <Badge variant="outline" className="text-[10px] h-4 bg-barber-gold/10 text-barber-gold border-barber-gold">
                        VIP
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-muted-foreground">{appointment.service}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex items-center text-sm">
                  <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                  <span>{appointment.time}</span>
                </div>
                
                {appointment.status === "pending" ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => completeAppointment(appointment.id)}
                        className="flex items-center gap-2"
                      >
                        <Check className="h-4 w-4" />
                        <span>Concluir</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => cancelAppointment(appointment.id)}
                        className="text-destructive flex items-center gap-2"
                      >
                        <X className="h-4 w-4" />
                        <span>Cancelar</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Badge variant={appointment.status === "completed" ? "secondary" : "destructive"} className="text-xs">
                    {appointment.status === "completed" ? "Concluído" : "Cancelado"}
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Adicionando o componente Star que estava faltando
function Star(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

// Adicionando o componente X que estava faltando
function X(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

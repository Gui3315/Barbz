
import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Clock, File, Filter, Search, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface ActivityLog {
  id: number;
  timestamp: Date;
  user: string;
  action: string;
  category: "user" | "appointment" | "financial" | "system";
  details: string;
}

// Initial activity logs
const initialLogs: ActivityLog[] = [
  {
    id: 1,
    timestamp: new Date(2025, 3, 16, 9, 30),
    user: "João",
    action: "Agendamento criado",
    category: "appointment",
    details: "Agendou Carlos Silva para corte de cabelo às 14:00"
  },
  {
    id: 2,
    timestamp: new Date(2025, 3, 16, 10, 15),
    user: "Maria",
    action: "Transação registrada",
    category: "financial",
    details: "Pagamento: R$ 55,00 - Corte + Barba"
  },
  {
    id: 3,
    timestamp: new Date(2025, 3, 16, 11, 5),
    user: "Pedro",
    action: "Cliente criado",
    category: "user",
    details: "Adicionou novo cliente: Lucas Mendes"
  },
  {
    id: 4,
    timestamp: new Date(2025, 3, 16, 12, 20),
    user: "Sistema",
    action: "Backup automático",
    category: "system",
    details: "Backup diário realizado com sucesso"
  },
  {
    id: 5,
    timestamp: new Date(2025, 3, 16, 14, 30),
    user: "João",
    action: "Agendamento concluído",
    category: "appointment",
    details: "Finalizou o atendimento de Carlos Silva"
  },
  {
    id: 6,
    timestamp: new Date(2025, 3, 15, 9, 10),
    user: "Maria",
    action: "Pontos adicionados",
    category: "user",
    details: "Adicionou 5 pontos para André Santos"
  },
  {
    id: 7,
    timestamp: new Date(2025, 3, 15, 11, 45),
    user: "Pedro",
    action: "Transação registrada",
    category: "financial",
    details: "Saída: R$ 120,00 - Compra de produtos"
  },
];

export default function LogsAtividades() {
  const [searchTerm, setSearchTerm] = useState("");
  const [logs, setLogs] = useState<ActivityLog[]>(initialLogs);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  
  // Filter logs based on search term, date, and category
  const filteredLogs = logs.filter(log => {
    // Search by user, action or details
    const matchesSearch = 
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by date (year, month, day)
    const matchesDate = selectedDate ? 
      log.timestamp.getFullYear() === selectedDate.getFullYear() &&
      log.timestamp.getMonth() === selectedDate.getMonth() &&
      log.timestamp.getDate() === selectedDate.getDate()
      : true;
    
    // Filter by category
    const matchesCategory = categoryFilter === "all" || log.category === categoryFilter;
    
    return matchesSearch && matchesDate && matchesCategory;
  });
  
  // Sort logs by timestamp (newest first)
  const sortedLogs = [...filteredLogs].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  
  // Get the formatted date
  const formattedDate = selectedDate 
    ? format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
    : "Todos os dias";
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="header-text">Logs de Atividades</h1>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar logs..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button 
              variant="outline"
              className="gap-2"
              onClick={() => setSelectedDate(new Date())}
            >
              <CalendarIcon size={16} />
              Hoje
            </Button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Filters sidebar */}
          <div className="w-full md:w-64 space-y-6">
            <Card className="barber-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center">
                  <Filter className="mr-2 h-4 w-4" />
                  Filtros
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Data</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !selectedDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? (
                          format(selectedDate, "dd/MM/yyyy", { locale: ptBR })
                        ) : (
                          <span>Selecione uma data</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        initialFocus
                        className="p-3 pointer-events-auto"
                        locale={ptBR}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Categoria</label>
                  <Select
                    value={categoryFilter}
                    onValueChange={setCategoryFilter}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Todas categorias" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas categorias</SelectItem>
                      <SelectItem value="appointment">Agendamentos</SelectItem>
                      <SelectItem value="financial">Financeiro</SelectItem>
                      <SelectItem value="user">Usuários</SelectItem>
                      <SelectItem value="system">Sistema</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
            
            <Card className="barber-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center">
                  <File className="mr-2 h-4 w-4" />
                  Exportar
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Formato</label>
                  <Select defaultValue="pdf">
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione o formato" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="xlsx">Excel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button className="w-full">Exportar Logs</Button>
              </CardContent>
            </Card>
          </div>
          
          {/* Main content */}
          <div className="flex-1">
            <Card className="barber-card">
              <CardHeader className="pb-3 flex flex-row justify-between items-center">
                <CardTitle>
                  <div className="flex items-baseline gap-2">
                    <span>Atividades</span>
                    <span className="text-sm font-normal text-muted-foreground">
                      {formattedDate}
                    </span>
                  </div>
                </CardTitle>
                <Badge variant="outline" className="font-normal">
                  {sortedLogs.length} registros
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sortedLogs.length === 0 ? (
                    <div className="text-center py-8">
                      <p>Nenhum log de atividade encontrado.</p>
                    </div>
                  ) : (
                    sortedLogs.map((log) => (
                      <ActivityLogItem key={log.id} log={log} />
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function ActivityLogItem({ log }: { log: ActivityLog }) {
  const getIconByCategory = () => {
    switch(log.category) {
      case "appointment":
        return <CalendarIcon className="h-5 w-5" />;
      case "financial":
        return (
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        );
      case "user":
        return <User className="h-5 w-5" />;
      case "system":
        return (
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <rect width="16" height="20" x="4" y="2" rx="2" />
            <path d="M9 22v-4h6v4" />
            <path d="M8 6h.01" />
            <path d="M16 6h.01" />
            <path d="M12 9v3" />
            <path d="M10 12h4" />
          </svg>
        );
      default:
        return <File className="h-5 w-5" />;
    }
  };
  
  const getCategoryColor = () => {
    switch(log.category) {
      case "appointment":
        return "bg-blue-100 text-blue-700";
      case "financial":
        return "bg-green-100 text-green-700";
      case "user":
        return "bg-purple-100 text-purple-700";
      case "system":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-secondary text-foreground";
    }
  };
  
  return (
    <div className="flex gap-3 p-3 rounded-lg hover:bg-secondary/20 transition-colors">
      <div className={`p-2 rounded-md ${getCategoryColor()}`}>
        {getIconByCategory()}
      </div>
      
      <div className="flex-1">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-1">
          <div className="font-medium">{log.action}</div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="h-3.5 w-3.5 mr-1" />
            {format(log.timestamp, "dd/MM/yyyy HH:mm")}
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground mb-1">{log.details}</p>
        
        <div className="flex items-center text-xs">
          <User className="h-3 w-3 mr-1" />
          <span>{log.user}</span>
        </div>
      </div>
    </div>
  );
}

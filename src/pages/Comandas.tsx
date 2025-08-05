
import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, ShoppingBag, Calendar, Clock, CheckCircle } from "lucide-react";
import { Command, CommandItem } from "@/components/client/command";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

// Mock data for commands
const initialCommands = [
  {
    id: "cmd-1234",
    clientId: "client-1",
    clientName: "João Silva",
    appointmentId: "app-1",
    items: [
      { id: "beer-1", name: "Heineken", price: 10.0, category: "beers", quantity: 2 },
      { id: "coffee-1", name: "Espresso", price: 4.0, category: "coffee", quantity: 1 }
    ],
    total: 24.0,
    status: 'open' as const,
    createdAt: new Date(),
  },
  {
    id: "cmd-5678",
    clientId: "client-2",
    clientName: "Maria Oliveira",
    appointmentId: "app-2",
    items: [
      { id: "soda-1", name: "Coca Cola", price: 5.0, category: "sodas", quantity: 1 },
      { id: "water-1", name: "Água sem gás", price: 3.0, category: "water", quantity: 1 }
    ],
    total: 8.0,
    status: 'closed' as const,
    createdAt: new Date(Date.now() - 3600000),
    closedAt: new Date(),
  }
];

// Mock data for clients
const clients = [
  { id: "client-1", name: "João Silva", phone: "(11) 98765-4321" },
  { id: "client-2", name: "Maria Oliveira", phone: "(11) 91234-5678" },
  { id: "client-3", name: "Pedro Santos", phone: "(11) 99876-5432" },
];

// Mock data for appointments
const appointments = [
  { 
    id: "app-1", 
    clientId: "client-1", 
    clientName: "João Silva",
    service: "Corte + Barba",
    time: "10:30",
    date: new Date().toLocaleDateString('pt-BR')
  },
  { 
    id: "app-2", 
    clientId: "client-2", 
    clientName: "Maria Oliveira",
    service: "Corte Feminino",
    time: "11:00",
    date: new Date().toLocaleDateString('pt-BR')
  },
];

export default function Comandas() {
  const { toast } = useToast();
  const [commands, setCommands] = useState(initialCommands);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"open" | "closed" | "all">("open");
  const [selectedCommand, setSelectedCommand] = useState<typeof initialCommands[0] | null>(null);
  const [clientCommandDialogOpen, setClientCommandDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<typeof appointments[0] | null>(null);
  const [newCommandDialogOpen, setNewCommandDialogOpen] = useState(false);
  
  const filteredCommands = commands
    .filter(command => {
      if (activeTab === "open") return command.status === "open";
      if (activeTab === "closed") return command.status === "closed" || command.status === "paid";
      return true;
    })
    .filter(command => 
      command.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      command.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  
  const handleCloseCommand = (commandId: string) => {
    setCommands(prev => prev.map(cmd => {
      if (cmd.id === commandId) {
        return {
          ...cmd,
          status: 'closed' as const,
          closedAt: new Date()
        };
      }
      return cmd;
    }));
    
    toast({
      title: "Comanda fechada",
      description: "A comanda foi fechada com sucesso e o cliente foi notificado."
    });
  };
  
  const handlePayCommand = (commandId: string) => {
    setCommands(prev => {
      return prev.map(cmd => {
        if (cmd.id === commandId) {
          if (cmd.status === "open") {
            // If open, first close it then mark as paid
            return {
              ...cmd,
              status: 'paid' as const,
              closedAt: new Date()
            };
          } else {
            // If already closed, just mark as paid
            return {
              ...cmd,
              status: 'paid' as const
            };
          }
        }
        return cmd;
      });
    });
    
    toast({
      title: "Pagamento registrado",
      description: "O pagamento foi registrado com sucesso."
    });
  };
  
  const handleCommandUpdate = (updatedCommand: any) => {
    setCommands(prev => prev.map(cmd => {
      if (cmd.id === updatedCommand.id) {
        return updatedCommand;
      }
      return cmd;
    }));
  };
  
  const handleCreateNewCommand = () => {
    if (!selectedAppointment) return;
    
    const newCommand = {
      id: `cmd-${Date.now().toString().substring(6)}`,
      clientId: selectedAppointment.clientId,
      clientName: selectedAppointment.clientName,
      appointmentId: selectedAppointment.id,
      items: [],
      total: 0,
      status: 'open' as const,
      createdAt: new Date(),
    };
    
    setCommands([...commands, newCommand]);
    setNewCommandDialogOpen(false);
    
    toast({
      title: "Comanda criada",
      description: `Nova comanda criada para ${selectedAppointment.clientName}.`
    });
  };
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="header-text">Comandas Digitais</h1>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button 
              className="btn-primary gap-2 whitespace-nowrap"
              onClick={() => setNewCommandDialogOpen(true)}
            >
              <Plus size={16} />
              Nova Comanda
            </Button>
          </div>
        </div>

        <Card className="barber-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Lista de Comandas</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs 
              defaultValue="open"
              onValueChange={(value) => setActiveTab(value as "open" | "closed" | "all")}
            >
              <TabsList className="mb-4">
                <TabsTrigger value="open">Abertas</TabsTrigger>
                <TabsTrigger value="closed">Fechadas</TabsTrigger>
                <TabsTrigger value="all">Todas</TabsTrigger>
              </TabsList>
              
              <TabsContent value="open" className="space-y-4">
                {filteredCommands.length === 0 ? (
                  <div className="text-center py-8">
                    <p>Nenhuma comanda aberta encontrada.</p>
                  </div>
                ) : (
                  filteredCommands.map((command) => (
                    <CommandCard 
                      key={command.id} 
                      command={command}
                      onOpenDetails={() => {
                        setSelectedCommand(command);
                        setClientCommandDialogOpen(true);
                      }}
                      onCloseCommand={handleCloseCommand}
                      onPayCommand={handlePayCommand}
                    />
                  ))
                )}
              </TabsContent>
              
              <TabsContent value="closed" className="space-y-4">
                {filteredCommands.length === 0 ? (
                  <div className="text-center py-8">
                    <p>Nenhuma comanda fechada encontrada.</p>
                  </div>
                ) : (
                  filteredCommands.map((command) => (
                    <CommandCard 
                      key={command.id} 
                      command={command}
                      onOpenDetails={() => {
                        setSelectedCommand(command);
                        setClientCommandDialogOpen(true);
                      }}
                      onCloseCommand={handleCloseCommand}
                      onPayCommand={handlePayCommand}
                    />
                  ))
                )}
              </TabsContent>
              
              <TabsContent value="all" className="space-y-4">
                {filteredCommands.length === 0 ? (
                  <div className="text-center py-8">
                    <p>Nenhuma comanda encontrada.</p>
                  </div>
                ) : (
                  filteredCommands.map((command) => (
                    <CommandCard 
                      key={command.id} 
                      command={command}
                      onOpenDetails={() => {
                        setSelectedCommand(command);
                        setClientCommandDialogOpen(true);
                      }}
                      onCloseCommand={handleCloseCommand}
                      onPayCommand={handlePayCommand}
                    />
                  ))
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      
      {/* Dialog for viewing and editing command details */}
      <Dialog open={clientCommandDialogOpen} onOpenChange={setClientCommandDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex justify-between">
              <div>Comanda #{selectedCommand?.id.substring(4, 8).toUpperCase()}</div>
              <Badge variant={selectedCommand?.status === 'open' ? 'default' : selectedCommand?.status === 'closed' ? 'secondary' : 'outline'}>
                {selectedCommand?.status === 'open' ? 'Aberta' : selectedCommand?.status === 'closed' ? 'Fechada' : 'Paga'}
              </Badge>
            </DialogTitle>
            <DialogDescription>
              Cliente: {selectedCommand?.clientName}
            </DialogDescription>
          </DialogHeader>
          
          {selectedCommand && (
            <div className="py-4">
              {selectedCommand.items.length === 0 ? (
                <div className="text-center py-4">
                  <p>Esta comanda não possui itens.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="border rounded-md divide-y">
                    {selectedCommand.items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center p-3">
                        <div>
                          <span>{item.name}</span>
                          <p className="text-sm text-muted-foreground">
                            R$ {item.price.toFixed(2)} x {item.quantity}
                          </p>
                        </div>
                        <div className="font-medium">
                          R$ {(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    ))}
                    
                    <div className="p-3 bg-muted/20">
                      <div className="flex justify-between items-center">
                        <span className="font-bold">Total:</span>
                        <span className="font-bold">R$ {selectedCommand.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>
                      Aberta em: {selectedCommand.createdAt.toLocaleString('pt-BR')}
                      {selectedCommand.closedAt && ` • Fechada em: ${selectedCommand.closedAt.toLocaleString('pt-BR')}`}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <div className="flex justify-between w-full">
              <Button variant="outline" onClick={() => setClientCommandDialogOpen(false)}>
                Fechar
              </Button>
              
              <div className="space-x-2">
                {selectedCommand?.status === 'open' && (
                  <Button onClick={() => {
                    handleCloseCommand(selectedCommand.id);
                    setClientCommandDialogOpen(false);
                  }}>
                    Fechar Comanda
                  </Button>
                )}
                
                {(selectedCommand?.status === 'closed' || selectedCommand?.status === 'open') && (
                  <Button 
                    className="btn-primary"
                    onClick={() => {
                      handlePayCommand(selectedCommand.id);
                      setClientCommandDialogOpen(false);
                    }}
                  >
                    Registrar Pagamento
                  </Button>
                )}
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog for creating a new command */}
      <Dialog open={newCommandDialogOpen} onOpenChange={setNewCommandDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Nova Comanda</DialogTitle>
            <DialogDescription>
              Selecione um agendamento para criar uma nova comanda.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <h3 className="mb-3 font-medium">Agendamentos de Hoje:</h3>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {appointments.map((appointment) => (
                <div 
                  key={appointment.id}
                  className={`border rounded-md p-3 cursor-pointer hover:bg-secondary/10 transition ${
                    selectedAppointment?.id === appointment.id ? 'border-barber-gold bg-barber-gold/5' : ''
                  }`}
                  onClick={() => setSelectedAppointment(appointment)}
                >
                  <div className="flex justify-between">
                    <div>
                      <h4 className="font-medium">{appointment.clientName}</h4>
                      <div className="text-sm text-muted-foreground">
                        {appointment.service}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>{appointment.date}</span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{appointment.time}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {appointments.length === 0 && (
                <div className="text-center py-4">
                  <p>Nenhum agendamento encontrado para hoje.</p>
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewCommandDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              className="btn-primary" 
              disabled={!selectedAppointment}
              onClick={handleCreateNewCommand}
            >
              Criar Comanda
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

interface CommandCardProps {
  command: {
    id: string;
    clientId: string;
    clientName: string;
    appointmentId?: string;
    items: CommandItem[];
    total: number;
    status: 'open' | 'closed' | 'paid';
    createdAt: Date;
    closedAt?: Date;
  };
  onOpenDetails: () => void;
  onCloseCommand: (id: string) => void;
  onPayCommand: (id: string) => void;
}

function CommandCard({ command, onOpenDetails, onCloseCommand, onPayCommand }: CommandCardProps) {
  return (
    <div 
      className="border rounded-md p-4 hover:bg-secondary/10 transition cursor-pointer"
      onClick={onOpenDetails}
    >
      <div className="flex justify-between">
        <div className="flex gap-3">
          <div className="p-2 rounded-md bg-secondary">
            <ShoppingBag className="h-5 w-5" />
          </div>
          
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-medium">{command.clientName}</h3>
              <Badge variant={command.status === 'open' ? 'default' : command.status === 'closed' ? 'secondary' : 'outline'}>
                {command.status === 'open' ? 'Aberta' : command.status === 'closed' ? 'Fechada' : 'Paga'}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              #{command.id.substring(4, 8).toUpperCase()} • {command.items.length} itens
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="font-bold">R$ {command.total.toFixed(2)}</div>
          <div className="flex mt-2 space-x-2">
            {command.status === 'open' && (
              <Button 
                variant="outline" 
                size="sm"
                className="text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  onCloseCommand(command.id);
                }}
              >
                Fechar
              </Button>
            )}
            
            {(command.status === 'closed' || command.status === 'open') && (
              <Button 
                size="sm"
                className="text-xs btn-primary"
                onClick={(e) => {
                  e.stopPropagation();
                  onPayCommand(command.id);
                }}
              >
                Pago
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

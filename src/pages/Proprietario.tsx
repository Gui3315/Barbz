import { useState } from "react";
import { v4 as uuidv4 } from 'uuid';
import { supabase } from "@/lib/supabaseClient";
// ATENÇÃO: inviteUserByEmail só funciona com chave de serviço (backend ou ambiente seguro)
import { DashboardLayout } from "@/components/dashboard/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, Star, Calendar, DollarSign, List, Grid, Clock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Client {
  id: number;
  name: string;
  phone: string;
  email: string;
  lastVisit: string;
  visits: number;
  loyaltyPoints: number;
  spent: number;
  preferences: string;
}

const initialClients: Client[] = [];

export default function Proprietario() {
  const { toast } = useToast();
  
  // Estado para barbershop_id do proprietário
  const [barbershopId, setBarbershopId] = useState<string>("");

  // Função para criar barbearia e vincular ao perfil do proprietário
  async function handleCreateBarbershop(nome: string, ownerId: string) {
    const newBarbershopId = uuidv4();
    // 1. Cria barbearia
    const { error: barbershopError } = await (supabase as any).from('barbershops').insert({
      id: newBarbershopId,
      name: nome,
      owner_id: ownerId,
    });
    if (barbershopError) {
      toast({ title: "Erro ao criar barbearia", description: barbershopError.message, variant: "destructive" });
      return;
    }
    // 2. Atualiza perfil do proprietário
    const { error: profileError } = await (supabase as any).from('profiles').update({ barbershop_id: newBarbershopId }).eq('id', ownerId);
    if (profileError) {
      toast({ title: "Erro ao vincular perfil", description: profileError.message, variant: "destructive" });
      return;
    }
    setBarbershopId(newBarbershopId);
    toast({ title: "Barbearia criada", description: "Barbearia vinculada ao seu perfil." });
  }

  const [searchTerm, setSearchTerm] = useState("");
  const [clients, setClients] = useState<Client[]>(initialClients);
  // Função para buscar dados paralelamente e mapear para Client
  async function carregarDados() {
    try {
      if (!barbershopId) return;
      const [clientesRes] = await Promise.all([
        (supabase as any).from('clients').select('*').eq('barbershop_id', barbershopId),
        // Adicione outras queries aqui se necessário
      ]);
      if (clientesRes.error) throw clientesRes.error;
      if (clientesRes.data) {
        setClients(clientesRes.data.map((c: any) => ({
          id: c.id,
          name: c.name,
          phone: c.phone,
          email: c.email,
          lastVisit: c.last_visit_date || "",
          visits: c.total_visits || 0,
          loyaltyPoints: c.loyalty_points || 0,
          spent: c.spent || 0,
          preferences: typeof c.preferences === "string" ? c.preferences : "",
        })));
      }
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
    }
  }
  const [newClientDialogOpen, setNewClientDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"card" | "list">("card");
  const [bookingMode, setBookingMode] = useState<"time" | "barber">("time");
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [suggestedService, setSuggestedService] = useState("");
  const [newClient, setNewClient] = useState({
    name: "",
    phone: "",
    email: "",
    preferences: ""
  });

  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.includes(searchTerm) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const vipClients = filteredClients.filter(client => client.visits >= 10);
  const regularClients = filteredClients.filter(client => client.visits < 10);

  const updateNewClientField = (field: string, value: string) => {
    setNewClient({
      ...newClient,
      [field]: value
    });
  };

  // Máscara de telefone (XX) XXXXX-XXXX
  function formatPhone(value: string) {
    const digits = value.replace(/\D/g, '');
    let formatted = '';
    if (digits.length > 0) formatted += '(' + digits.substring(0, 2);
    if (digits.length > 2) formatted += ') ' + digits.substring(2, 7);
    if (digits.length > 7) formatted += '-' + digits.substring(7, 11);
    return formatted;
  }

  async function handleAddClient() {
    const phoneDigits = newClient.phone.replace(/\D/g, '');
    if (phoneDigits.length !== 11) {
      toast({
        title: "Telefone inválido",
        description: "Informe um telefone válido no formato (XX) XXXXX-XXXX",
        variant: "destructive",
      });
      return;
    }
    if (!newClient.name || !newClient.phone || !newClient.email) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome, telefone e e-mail são obrigatórios.",
        variant: "destructive",
      });
      return;
    }
    // Validação simples de e-mail
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newClient.email)) {
      toast({
        title: "E-mail inválido",
        description: "Informe um e-mail válido.",
        variant: "destructive",
      });
      return;
    }

    // 1. Convidar usuário pelo Supabase (Invite User)
    const { data: inviteData, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(newClient.email);

    if (inviteError || !inviteData?.user) {
      toast({
        title: "Erro ao convidar usuário",
        description: inviteError?.message || "Não foi possível enviar o convite.",
        variant: "destructive",
      });
      return;
    }

    // 2. Salvar dados na tabela clients
    const { error: clientError } = await (supabase as any).from('clients').insert({
      name: newClient.name,
      phone: newClient.phone,
      email: newClient.email,
      preferences: newClient.preferences,
      is_invitation: true,
      status: 'pending_password',
      user_id: inviteData.user.id,
      barbershop_id: barbershopId,
    });

    if (clientError) {
      toast({
        title: "Erro ao salvar cliente",
        description: clientError.message,
        variant: "destructive",
      });
      return;
    }

    setNewClient({
      name: "",
      phone: "",
      email: "",
      preferences: ""
    });
    setNewClientDialogOpen(false);

    toast({
      title: "Convite enviado",
      description: `${newClient.name} foi convidado e receberá um e-mail para criar a senha.`,
    });
    // Atualiza lista de clientes após cadastro
    carregarDados();
  }

  const openBookingDialog = (client: Client) => {
    setSelectedClient(client);

    if (client.visits >= 10) {
      if (client.preferences.toLowerCase().includes('degradê')) {
        setSuggestedService("Corte Degradê");
      } else if (client.preferences.toLowerCase().includes('barba')) {
        setSuggestedService("Barba Completa");
      } else {
        setSuggestedService("Corte + Barba");
      }
    } else {
      setSuggestedService("");
    }

    setBookingDialogOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="header-text">Clientes</h1>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar cliente..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <div className="flex items-center rounded-md border border-input bg-transparent">
            <Button
              variant={viewMode === "card" ? "secondary" : "ghost"}
              size="sm"
              className="rounded-none rounded-l-md"
              onClick={() => setViewMode("card")}
            >
              <Grid size={16} />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="sm"
              className="rounded-none rounded-r-md"
              onClick={() => setViewMode("list")}
            >
              <List size={16} />
            </Button>
          </div>
          <Button 
            className="btn-primary gap-2 whitespace-nowrap"
            onClick={() => setNewClientDialogOpen(true)}
          >
            <Plus size={16} />
            Novo Cliente
          </Button>
          <Button onClick={carregarDados} variant="outline">
            Atualizar lista
          </Button>
        </div>
      </div>
        </div>

        <Card className="barber-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Lista de Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all">
              <TabsList className="mb-4">
                <TabsTrigger value="all">Todos</TabsTrigger>
                <TabsTrigger value="vip">VIP</TabsTrigger>
                <TabsTrigger value="regular">Regulares</TabsTrigger>
              </TabsList>
              
              {viewMode === "card" ? (
                <>
                  <TabsContent value="all" className="space-y-4">
                    {filteredClients.length === 0 ? (
                      <div className="text-center py-8">
                        <p>Nenhum cliente encontrado.</p>
                      </div>
                    ) : (
                      filteredClients.map((client) => (
                        <ClientCard 
                          key={client.id} 
                          client={client} 
                          onSchedule={() => openBookingDialog(client)}
                        />
                      ))
                    )}
                  </TabsContent>
                  
                  <TabsContent value="vip" className="space-y-4">
                    {vipClients.length === 0 ? (
                      <div className="text-center py-8">
                        <p>Nenhum cliente VIP encontrado.</p>
                      </div>
                    ) : (
                      vipClients.map((client) => (
                        <ClientCard 
                          key={client.id} 
                          client={client}
                          onSchedule={() => openBookingDialog(client)}
                        />
                      ))
                    )}
                  </TabsContent>
                  
                  <TabsContent value="regular" className="space-y-4">
                    {regularClients.length === 0 ? (
                      <div className="text-center py-8">
                        <p>Nenhum cliente regular encontrado.</p>
                      </div>
                    ) : (
                      regularClients.map((client) => (
                        <ClientCard 
                          key={client.id} 
                          client={client}
                          onSchedule={() => openBookingDialog(client)}
                        />
                      ))
                    )}
                  </TabsContent>
                </>
              ) : (
                <>
                  <TabsContent value="all">
                    <div className="border rounded-md overflow-hidden">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-secondary">
                            <th className="text-left py-2 px-4">Nome</th>
                            <th className="text-left py-2 px-4">Contato</th>
                            <th className="text-left py-2 px-4">Última visita</th>
                            <th className="text-right py-2 px-4">Visitas</th>
                            <th className="text-right py-2 px-4">Pontos</th>
                            <th className="text-right py-2 px-4">Total gasto</th>
                            <th className="text-right py-2 px-4">Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredClients.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="text-center py-8">
                                Nenhum cliente encontrado.
                              </td>
                            </tr>
                          ) : (
                            filteredClients.map((client) => (
                              <tr key={client.id} className="border-t">
                                <td className="py-3 px-4">
                                  <div className="flex items-center">
                                    <div className="h-8 w-8 rounded-full bg-barber flex items-center justify-center text-white text-sm mr-2">
                                      {client.name.split(' ').map((name) => name[0]).join('')}
                                    </div>
                                    <div>
                                      <div className="font-medium flex items-center">
                                        {client.name}
                                        {client.visits >= 10 && (
                                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-barber-gold text-white">
                                            <Star size={10} className="mr-1" />
                                            VIP
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  <div className="text-sm">{client.phone}</div>
                                  <div className="text-xs text-muted-foreground">{client.email}</div>
                                </td>
                                <td className="py-3 px-4">{client.lastVisit}</td>
                                <td className="py-3 px-4 text-right">{client.visits}</td>
                                <td className="py-3 px-4 text-right">{client.loyaltyPoints}</td>
                                <td className="py-3 px-4 text-right">R$ {client.spent.toFixed(2)}</td>
                                <td className="py-3 px-4">
                                  <div className="flex justify-end gap-2">
                                    <Button variant="outline" size="sm">Ver</Button>
                                    <Button 
                                      className="btn-primary" 
                                      size="sm"
                                      onClick={() => openBookingDialog(client)}
                                    >
                                      Agendar
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="vip">
                    <div className="border rounded-md overflow-hidden">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-secondary">
                            <th className="text-left py-2 px-4">Nome</th>
                            <th className="text-left py-2 px-4">Contato</th>
                            <th className="text-left py-2 px-4">Última visita</th>
                            <th className="text-right py-2 px-4">Visitas</th>
                            <th className="text-right py-2 px-4">Pontos</th>
                            <th className="text-right py-2 px-4">Total gasto</th>
                            <th className="text-right py-2 px-4">Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {vipClients.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="text-center py-8">
                                Nenhum cliente VIP encontrado.
                              </td>
                            </tr>
                          ) : (
                            vipClients.map((client) => (
                              <tr key={client.id} className="border-t">
                                <td className="py-3 px-4">
                                  <div className="flex items-center">
                                    <div className="h-8 w-8 rounded-full bg-barber flex items-center justify-center text-white text-sm mr-2">
                                      {client.name.split(' ').map((name) => name[0]).join('')}
                                    </div>
                                    <div>
                                      <div className="font-medium flex items-center">
                                        {client.name}
                                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-barber-gold text-white">
                                          <Star size={10} className="mr-1" />
                                          VIP
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  <div className="text-sm">{client.phone}</div>
                                  <div className="text-xs text-muted-foreground">{client.email}</div>
                                </td>
                                <td className="py-3 px-4">{client.lastVisit}</td>
                                <td className="py-3 px-4 text-right">{client.visits}</td>
                                <td className="py-3 px-4 text-right">{client.loyaltyPoints}</td>
                                <td className="py-3 px-4 text-right">R$ {client.spent.toFixed(2)}</td>
                                <td className="py-3 px-4">
                                  <div className="flex justify-end gap-2">
                                    <Button variant="outline" size="sm">Ver</Button>
                                    <Button 
                                      className="btn-primary" 
                                      size="sm"
                                      onClick={() => openBookingDialog(client)}
                                    >
                                      Agendar
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="regular">
                    <div className="border rounded-md overflow-hidden">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-secondary">
                            <th className="text-left py-2 px-4">Nome</th>
                            <th className="text-left py-2 px-4">Contato</th>
                            <th className="text-left py-2 px-4">Última visita</th>
                            <th className="text-right py-2 px-4">Visitas</th>
                            <th className="text-right py-2 px-4">Pontos</th>
                            <th className="text-right py-2 px-4">Total gasto</th>
                            <th className="text-right py-2 px-4">Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {regularClients.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="text-center py-8">
                                Nenhum cliente regular encontrado.
                              </td>
                            </tr>
                          ) : (
                            regularClients.map((client) => (
                              <tr key={client.id} className="border-t">
                                <td className="py-3 px-4">
                                  <div className="flex items-center">
                                    <div className="h-8 w-8 rounded-full bg-barber flex items-center justify-center text-white text-sm mr-2">
                                      {client.name.split(' ').map((name) => name[0]).join('')}
                                    </div>
                                    <div className="font-medium">
                                      {client.name}
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  <div className="text-sm">{client.phone}</div>
                                  <div className="text-xs text-muted-foreground">{client.email}</div>
                                </td>
                                <td className="py-3 px-4">{client.lastVisit}</td>
                                <td className="py-3 px-4 text-right">{client.visits}</td>
                                <td className="py-3 px-4 text-right">{client.loyaltyPoints}</td>
                                <td className="py-3 px-4 text-right">R$ {client.spent.toFixed(2)}</td>
                                <td className="py-3 px-4">
                                  <div className="flex justify-end gap-2">
                                    <Button variant="outline" size="sm">Ver</Button>
                                    <Button 
                                      className="btn-primary" 
                                      size="sm"
                                      onClick={() => openBookingDialog(client)}
                                    >
                                      Agendar
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </TabsContent>
                </>
              )}
            </Tabs>
          </CardContent>
        </Card>
      </div>
      
      <Dialog open={newClientDialogOpen} onOpenChange={setNewClientDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Cliente</DialogTitle>
            <DialogDescription>
              Preencha os dados do novo cliente. Campos marcados com * são obrigatórios.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome completo *</Label>
              <Input
                id="name"
                value={newClient.name}
                onChange={(e) => updateNewClientField('name', e.target.value)}
                placeholder="Digite o nome completo"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone *</Label>
              <Input
                type="text"
                placeholder="(XX) XXXXX-XXXX"
                value={newClient.phone}
                onChange={e => updateNewClientField('phone', formatPhone(e.target.value))}
                maxLength={15}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={newClient.email}
                onChange={(e) => updateNewClientField('email', e.target.value)}
                placeholder="email@exemplo.com"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="preferences">Preferências</Label>
              <Textarea
                id="preferences"
                value={newClient.preferences}
                onChange={(e) => updateNewClientField('preferences', e.target.value)}
                placeholder="Preferências do cliente, como estilo de corte, barbeiro preferido, etc."
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewClientDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddClient} className="btn-primary">
              Adicionar Cliente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              Agendar para {selectedClient?.name}
              {selectedClient?.visits >= 10 && (
                <span className="ml-2 inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-barber-gold text-white">
                  <Star size={12} className="mr-1" />
                  VIP
                </span>
              )}
            </DialogTitle>
            <DialogDescription>
              Selecione o modo de agendamento e preencha as informações necessárias.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {suggestedService && (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-md mb-4">
                <p className="font-medium flex items-center">
                  <Star className="h-4 w-4 mr-2 text-amber-500" />
                  Serviço sugerido para você: {suggestedService}
                </p>
                <p className="text-sm mt-1">
                  Baseado no seu histórico e preferências.
                </p>
              </div>
            )}
            
            <div className="space-y-2">
              <Label>Modo de agendamento</Label>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  type="button"
                  variant={bookingMode === "time" ? "default" : "outline"}
                  onClick={() => setBookingMode("time")}
                  className="justify-start h-auto py-4 px-4"
                >
                  <div className="flex flex-col items-start">
                    <div className="flex items-center">
                      <Clock className="mr-2 h-4 w-4" />
                      <span className="font-medium">Por horário</span>
                    </div>
                    <span className="text-xs text-muted-foreground mt-1">
                      Escolha o horário disponível primeiro
                    </span>
                  </div>
                </Button>
                
                <Button
                  type="button"
                  variant={bookingMode === "barber" ? "default" : "outline"}
                  onClick={() => setBookingMode("barber")}
                  className="justify-start h-auto py-4 px-4"
                >
                  <div className="flex flex-col items-start">
                    <div className="flex items-center">
                      <div>
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          width="16" 
                          height="16" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          className="mr-2"
                        >
                          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                          <circle cx="9" cy="7" r="4" />
                          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                      </div>
                      <span className="font-medium">Por profissional</span>
                    </div>
                    <span className="text-xs text-muted-foreground mt-1">
                      Escolha o profissional primeiro
                    </span>
                  </div>
                </Button>
              </div>
            </div>
            
            {bookingMode === "time" ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Data</Label>
                  <Input type="date" className="w-full" />
                </div>
                
                <div className="space-y-2">
                  <Label>Horários disponíveis</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "13:00", "13:30", "14:00", "14:30"].map((time) => (
                      <Button key={time} variant="outline" className="text-sm">
                        {time}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Serviço</Label>
                  <Select>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione o serviço" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="corte">Corte de Cabelo</SelectItem>
                      <SelectItem value="barba">Barba</SelectItem>
                      <SelectItem value="corte-barba">Corte + Barba</SelectItem>
                      <SelectItem value="degrade">Corte Degradê</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Profissional</Label>
                  <Select>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione o profissional" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">João Silva</SelectItem>
                      <SelectItem value="2">Pedro Barbeiro</SelectItem>
                      <SelectItem value="3">Marcos Santos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Serviço</Label>
                  <Select>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione o serviço" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="corte">Corte de Cabelo</SelectItem>
                      <SelectItem value="barba">Barba</SelectItem>
                      <SelectItem value="corte-barba">Corte + Barba</SelectItem>
                      <SelectItem value="degrade">Corte Degradê</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Data</Label>
                  <Input type="date" className="w-full" />
                </div>
                
                <div className="space-y-2">
                  <Label>Horários disponíveis com este profissional</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {["13:00", "13:30", "14:00", "14:30", "15:00", "15:30"].map((time) => (
                      <Button key={time} variant="outline" className="text-sm">
                        {time}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setBookingDialogOpen(false)}>
              Cancelar
            </Button>
            <Button className="btn-primary">
              Confirmar Agendamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

function ClientCard({ client, onSchedule }: { client: Client; onSchedule: () => void }) {
  return (
    <div className="border rounded-md p-4 hover:bg-secondary/20 transition-colors">
      <div className="flex flex-col sm:flex-row justify-between">
        <div className="flex items-start sm:items-center mb-3 sm:mb-0">
          <div className="h-12 w-12 rounded-full bg-barber flex items-center justify-center text-white text-lg">
            {client.name.split(' ').map((name: string) => name[0]).join('')}
          </div>
          <div className="ml-3">
            <div className="font-medium flex items-center">
              {client.name}
              {client.visits >= 10 && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-barber-gold text-white">
                  <Star size={12} className="mr-1" />
                  VIP
                </span>
              )}
            </div>
            <div className="text-sm text-muted-foreground">{client.phone}</div>
            <div className="text-sm text-muted-foreground">{client.email}</div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-4 sm:gap-6 text-sm">
          <div className="flex flex-col items-center">
            <Calendar size={16} className="mb-1 text-muted-foreground" />
            <div className="font-medium">{client.lastVisit}</div>
            <div className="text-xs text-muted-foreground">Última visita</div>
          </div>
          
          <div className="flex flex-col items-center">
            <Star size={16} className="mb-1 text-barber-gold" />
            <div className="font-medium">{client.loyaltyPoints}</div>
            <div className="text-xs text-muted-foreground">Pontos</div>
          </div>
          
          <div className="flex flex-col items-center">
            <DollarSign size={16} className="mb-1 text-green-500" />
            <div className="font-medium">R$ {client.spent.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground">Total gasto</div>
          </div>
        </div>
      </div>
      
      <div className="mt-3 pt-3 border-t text-sm">
        <span className="font-medium">Preferências:</span> {client.preferences}
      </div>
      
      <div className="mt-3 flex justify-end space-x-2">
        <Button variant="outline" size="sm">Ver histórico</Button>
        <Button className="btn-primary" size="sm" onClick={onSchedule}>Agendar</Button>
      </div>
    </div>
  );
}

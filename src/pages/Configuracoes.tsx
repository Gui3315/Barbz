
import { DashboardLayout } from "@/components/dashboard/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Camera, Clock, Paintbrush, Save, User, Wrench, Plus } from "lucide-react";
import { useState } from "react";

export default function Configuracoes() {
  const [barberShopName, setBarberShopName] = useState("BARBZ");
  const [ownerName, setOwnerName] = useState("João Barber");
  const [email, setEmail] = useState("joao@barbz.com");
  const [phone, setPhone] = useState("(11) 99999-9999");
  const [address, setAddress] = useState("Rua dos Barbeiros, 123");
  const [logoUrl, setLogoUrl] = useState("/placeholder.svg");
  
  // Working hours
  const [workingHours, setWorkingHours] = useState([
    { day: "Segunda", open: true, start: "09:00", end: "19:00" },
    { day: "Terça", open: true, start: "09:00", end: "19:00" },
    { day: "Quarta", open: true, start: "09:00", end: "19:00" },
    { day: "Quinta", open: true, start: "09:00", end: "19:00" },
    { day: "Sexta", open: true, start: "09:00", end: "20:00" },
    { day: "Sábado", open: true, start: "09:00", end: "18:00" },
    { day: "Domingo", open: false, start: "09:00", end: "18:00" }
  ]);
  
  // Service settings
  const [services, setServices] = useState([
    { id: 1, name: "Corte Simples", duration: 30, price: 35, active: true },
    { id: 2, name: "Corte Degradê", duration: 30, price: 40, active: true },
    { id: 3, name: "Barba Completa", duration: 20, price: 25, active: true },
    { id: 4, name: "Corte + Barba", duration: 45, price: 55, active: true },
    { id: 5, name: "Sobrancelha", duration: 15, price: 15, active: true },
  ]);
  
  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: true,
    appointmentReminders: true,
    marketingEmails: false,
    loyaltyUpdates: true,
    birthdayMessages: true,
  });
  
  // Theme settings
  const [themeSettings, setThemeSettings] = useState({
    darkMode: false,
    primaryColor: "#d4af37",
    accentColor: "#b87333",
  });
  
  const updateWorkingHours = (index: number, field: keyof typeof workingHours[0], value: any) => {
    const newWorkingHours = [...workingHours];
    newWorkingHours[index] = { ...newWorkingHours[index], [field]: value };
    setWorkingHours(newWorkingHours);
  };
  
  const toggleNotificationSetting = (key: keyof typeof notificationSettings) => {
    setNotificationSettings({
      ...notificationSettings,
      [key]: !notificationSettings[key]
    });
  };
  
  const updateService = (serviceId: number, field: string, value: any) => {
    setServices(services.map(service => 
      service.id === serviceId ? { ...service, [field]: value } : service
    ));
  };
  
  const handleSaveSettings = () => {
    alert("Configurações salvas com sucesso!");
  };
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="header-text">Configurações</h1>
          <Button className="btn-primary gap-2" onClick={handleSaveSettings}>
            <Save size={16} />
            Salvar Alterações
          </Button>
        </div>
        
        <Tabs defaultValue="profile">
          <TabsList className="mb-6">
            <TabsTrigger value="profile" className="gap-2">
              <User size={16} />
              Perfil
            </TabsTrigger>
            <TabsTrigger value="hours" className="gap-2">
              <Clock size={16} />
              Horários
            </TabsTrigger>
            <TabsTrigger value="services" className="gap-2">
              <Wrench size={16} />
              Serviços
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Wrench size={16} />
              Notificações
            </TabsTrigger>
            <TabsTrigger value="appearance" className="gap-2">
              <Paintbrush size={16} />
              Aparência
            </TabsTrigger>
          </TabsList>
          
          {/* Profile Settings */}
          <TabsContent value="profile">
            <Card className="barber-card">
              <CardHeader>
                <CardTitle>Informações da Barbearia</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="w-full md:w-2/3 space-y-4">
                    <div>
                      <Label htmlFor="barberShopName">Nome da Barbearia</Label>
                      <Input 
                        id="barberShopName" 
                        value={barberShopName} 
                        onChange={(e) => setBarberShopName(e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="ownerName">Nome do Proprietário</Label>
                      <Input 
                        id="ownerName" 
                        value={ownerName} 
                        onChange={(e) => setOwnerName(e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        type="email"
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="phone">Telefone</Label>
                      <Input 
                        id="phone" 
                        value={phone} 
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="address">Endereço</Label>
                      <Input 
                        id="address" 
                        value={address} 
                        onChange={(e) => setAddress(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="w-full md:w-1/3">
                    <div>
                      <Label>Logo da Barbearia</Label>
                      <div className="mt-2 border-2 border-dashed rounded-md p-6 flex flex-col items-center">
                        <img 
                          src={logoUrl} 
                          alt="Logo da barbearia" 
                          className="w-32 h-32 object-contain mb-4"
                        />
                        <Button variant="outline" className="gap-2">
                          <Camera size={16} />
                          Alterar Logo
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Hours Settings */}
          <TabsContent value="hours">
            <Card className="barber-card">
              <CardHeader>
                <CardTitle>Horário de Funcionamento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {workingHours.map((day, index) => (
                    <div key={day.day} className="grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id={`open-${day.day}`} 
                            checked={day.open}
                            onCheckedChange={(checked) => updateWorkingHours(index, 'open', Boolean(checked))}
                          />
                          <Label htmlFor={`open-${day.day}`}>{day.day}</Label>
                        </div>
                      </div>
                      
                      <div className="col-span-9">
                        {day.open ? (
                          <div className="flex items-center gap-2">
                            <Input
                              type="time"
                              value={day.start}
                              onChange={(e) => updateWorkingHours(index, 'start', e.target.value)}
                              className="w-32"
                            />
                            <span>às</span>
                            <Input
                              type="time"
                              value={day.end}
                              onChange={(e) => updateWorkingHours(index, 'end', e.target.value)}
                              className="w-32"
                            />
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Fechado</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Services Settings */}
          <TabsContent value="services">
            <Card className="barber-card">
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>Serviços</span>
                  <Button size="sm" className="btn-primary gap-2">
                    <Plus size={16} />
                    Novo Serviço
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-8 gap-4 font-medium border-b pb-2">
                    <div className="col-span-3">Nome</div>
                    <div className="col-span-1">Duração (min)</div>
                    <div className="col-span-2">Preço (R$)</div>
                    <div className="col-span-1">Status</div>
                    <div className="col-span-1"></div>
                  </div>
                  
                  {services.map(service => (
                    <div key={service.id} className="grid grid-cols-8 gap-4 items-center">
                      <div className="col-span-3">
                        <Input 
                          value={service.name}
                          onChange={(e) => updateService(service.id, 'name', e.target.value)}
                        />
                      </div>
                      <div className="col-span-1">
                        <Input 
                          type="number"
                          value={service.duration}
                          onChange={(e) => updateService(service.id, 'duration', parseInt(e.target.value))}
                        />
                      </div>
                      <div className="col-span-2">
                        <Input 
                          type="number"
                          value={service.price}
                          onChange={(e) => updateService(service.id, 'price', parseFloat(e.target.value))}
                        />
                      </div>
                      <div className="col-span-1 flex items-center">
                        <Switch 
                          checked={service.active}
                          onCheckedChange={(checked) => updateService(service.id, 'active', checked)}
                        />
                      </div>
                      <div className="col-span-1">
                        <Button variant="outline" size="sm">Editar</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Notification Settings */}
          <TabsContent value="notifications">
            <Card className="barber-card">
              <CardHeader>
                <CardTitle>Configurações de Notificações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Notificações por Email</h3>
                      <p className="text-sm text-muted-foreground">Receba atualizações por email</p>
                    </div>
                    <Switch 
                      checked={notificationSettings.emailNotifications}
                      onCheckedChange={() => toggleNotificationSetting('emailNotifications')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Notificações por SMS</h3>
                      <p className="text-sm text-muted-foreground">Receba atualizações por SMS</p>
                    </div>
                    <Switch 
                      checked={notificationSettings.smsNotifications}
                      onCheckedChange={() => toggleNotificationSetting('smsNotifications')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Lembretes de Agendamentos</h3>
                      <p className="text-sm text-muted-foreground">Notificações para clientes sobre agendamentos</p>
                    </div>
                    <Switch 
                      checked={notificationSettings.appointmentReminders}
                      onCheckedChange={() => toggleNotificationSetting('appointmentReminders')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Emails de Marketing</h3>
                      <p className="text-sm text-muted-foreground">Enviar promoções e novidades por email</p>
                    </div>
                    <Switch 
                      checked={notificationSettings.marketingEmails}
                      onCheckedChange={() => toggleNotificationSetting('marketingEmails')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Atualizações de Fidelidade</h3>
                      <p className="text-sm text-muted-foreground">Notificações sobre pontos e recompensas</p>
                    </div>
                    <Switch 
                      checked={notificationSettings.loyaltyUpdates}
                      onCheckedChange={() => toggleNotificationSetting('loyaltyUpdates')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Mensagens de Aniversário</h3>
                      <p className="text-sm text-muted-foreground">Enviar mensagens de parabéns no aniversário dos clientes</p>
                    </div>
                    <Switch 
                      checked={notificationSettings.birthdayMessages}
                      onCheckedChange={() => toggleNotificationSetting('birthdayMessages')}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Appearance Settings */}
          <TabsContent value="appearance">
            <Card className="barber-card">
              <CardHeader>
                <CardTitle>Configurações de Aparência</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Modo Escuro</h3>
                      <p className="text-sm text-muted-foreground">Ativar tema escuro para a interface</p>
                    </div>
                    <Switch 
                      checked={themeSettings.darkMode}
                      onCheckedChange={(checked) => setThemeSettings({...themeSettings, darkMode: checked})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="primaryColor">Cor Primária</Label>
                    <div className="flex items-center gap-4">
                      <div 
                        className="h-8 w-8 rounded-full border"
                        style={{ backgroundColor: themeSettings.primaryColor }}
                      ></div>
                      <Input
                        id="primaryColor"
                        type="text"
                        value={themeSettings.primaryColor}
                        onChange={(e) => setThemeSettings({...themeSettings, primaryColor: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="accentColor">Cor de Destaque</Label>
                    <div className="flex items-center gap-4">
                      <div 
                        className="h-8 w-8 rounded-full border"
                        style={{ backgroundColor: themeSettings.accentColor }}
                      ></div>
                      <Input
                        id="accentColor"
                        type="text"
                        value={themeSettings.accentColor}
                        onChange={(e) => setThemeSettings({...themeSettings, accentColor: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="pt-4">
                  <h3 className="font-medium mb-2">Visualização</h3>
                  <div className="border rounded-md p-4 bg-white">
                    <div className="flex items-center gap-4">
                      <div 
                        className="h-10 w-10 rounded-md" 
                        style={{ backgroundColor: themeSettings.primaryColor }}
                      >
                      </div>
                      <div 
                        className="h-10 w-10 rounded-md"
                        style={{ backgroundColor: themeSettings.accentColor }}
                      >
                      </div>
                      <Button className="btn-primary">Botão Primário</Button>
                      <Button variant="outline">Botão Secundário</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

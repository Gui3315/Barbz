
import { useState } from "react";
import { 
  Card, 
  CardContent,
  CardHeader,
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Camera, Calendar as CalendarIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export function ClientProfile() {
  const { toast } = useToast();
  
  // User profile state
  const [profile, setProfile] = useState({
    name: "Rodrigo Silva",
    email: "rodrigo.silva@email.com",
    phone: "(11) 98765-4321",
    birthdate: new Date("1990-06-15"),
    address: "Rua das Flores, 123 - São Paulo, SP",
    preferences: "Corte degradê, atendimento com João",
    photoUrl: "/placeholder.svg"
  });
  
  // Form state
  const [formData, setFormData] = useState({ ...profile });
  const [isEditing, setIsEditing] = useState(false);
  
  // Update form field
  const updateField = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Save profile changes
  const saveChanges = () => {
    setProfile(formData);
    setIsEditing(false);
    
    toast({
      title: "Perfil atualizado",
      description: "Suas informações foram salvas com sucesso.",
      duration: 3000,
    });
  };
  
  // Cancel editing
  const cancelEditing = () => {
    setFormData({ ...profile });
    setIsEditing(false);
  };
  
  return (
    <div className="space-y-6">
      <Card className="barber-card">
        <CardHeader>
          <CardTitle>Meu Perfil</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Profile Photo */}
          <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
            <div className="w-32 h-32 relative rounded-full overflow-hidden border-2 border-barber-gold">
              <img
                src={formData.photoUrl}
                alt={formData.name}
                className="w-full h-full object-cover"
              />
              {isEditing && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <Button size="sm" variant="outline" className="bg-white text-black">
                    <Camera className="mr-2 h-4 w-4" />
                    Alterar
                  </Button>
                </div>
              )}
            </div>
            
            <div className="flex-1 space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">{profile.name}</h2>
                {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)}>
                    Editar perfil
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={cancelEditing}>
                      Cancelar
                    </Button>
                    <Button className="btn-primary" onClick={saveChanges}>
                      Salvar
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                {/* Form fields */}
                <div className="space-y-1">
                  <Label htmlFor="name">Nome completo</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="birthdate">Data de nascimento</Label>
                  {isEditing ? (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.birthdate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.birthdate ? (
                            format(formData.birthdate, "dd/MM/yyyy", { locale: ptBR })
                          ) : (
                            <span>Selecione uma data</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={formData.birthdate}
                          onSelect={(date) => updateField('birthdate', date)}
                          initialFocus
                          disabled={{ after: new Date() }}
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  ) : (
                    <Input
                      value={format(formData.birthdate, "dd/MM/yyyy", { locale: ptBR })}
                      disabled
                    />
                  )}
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="address">Endereço</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => updateField('address', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="preferences">Preferências</Label>
                  <Input
                    id="preferences"
                    value={formData.preferences}
                    onChange={(e) => updateField('preferences', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="barber-card">
        <CardHeader>
          <CardTitle>Histórico</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="font-medium">Total de visitas</h3>
                <p className="text-2xl font-bold">12</p>
              </div>
              <div>
                <h3 className="font-medium">Última visita</h3>
                <p className="text-2xl font-bold">10/04/2025</p>
              </div>
              <div>
                <h3 className="font-medium">Serviços preferidos</h3>
                <p>Corte degradê (8x)</p>
              </div>
            </div>
            
            <h3 className="font-medium">Últimas visitas</h3>
            <div className="divide-y">
              <div className="py-3">
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium">Corte degradê</p>
                    <p className="text-sm text-muted-foreground">Atendido por João</p>
                  </div>
                  <p>10/04/2025</p>
                </div>
              </div>
              <div className="py-3">
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium">Barba</p>
                    <p className="text-sm text-muted-foreground">Atendido por Pedro</p>
                  </div>
                  <p>25/03/2025</p>
                </div>
              </div>
              <div className="py-3">
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium">Corte + Barba</p>
                    <p className="text-sm text-muted-foreground">Atendido por João</p>
                  </div>
                  <p>10/03/2025</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

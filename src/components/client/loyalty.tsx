
import { useState } from "react";
import { 
  Card, 
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Gift, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

// Mock data for rewards
const rewardItems = [
  {
    id: 1,
    name: "Corte Grátis",
    image: "/placeholder.svg",
    description: "Um corte de cabelo completo gratuito",
    pointsRequired: 50
  },
  {
    id: 2,
    name: "Barba Grátis",
    image: "/placeholder.svg",
    description: "Uma barba completa gratuita",
    pointsRequired: 30
  },
  {
    id: 3,
    name: "Kit Barba",
    image: "/placeholder.svg",
    description: "Kit com produtos para cuidados com a barba",
    pointsRequired: 80
  },
  {
    id: 4,
    name: "Combo Premium",
    image: "/placeholder.svg",
    description: "Corte + Barba + Sobrancelha",
    pointsRequired: 100
  },
  {
    id: 5,
    name: "Desconto de 50%",
    image: "/placeholder.svg",
    description: "Desconto de 50% em qualquer serviço",
    pointsRequired: 40
  }
];

// Mock data for barbers
const barbers = [
  { id: 1, name: "João" },
  { id: 2, name: "Pedro" },
  { id: 3, name: "Carlos" },
  { id: 4, name: "André" }
];

// Mock data for time slots
const timeSlots = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00"
];

export function ClientLoyalty() {
  const { toast } = useToast();
  
  // Loyalty program state
  const [userPoints, setUserPoints] = useState(45);
  const [userLevel, setUserLevel] = useState("Prata");
  const [nextLevel, setNextLevel] = useState("Ouro");
  const [pointsToNextLevel, setPointsToNextLevel] = useState(106);
  const [progress, setProgress] = useState(30);
  
  // Reward redemption dialog
  const [redeemDialogOpen, setRedeemDialogOpen] = useState(false);
  const [selectedReward, setSelectedReward] = useState<any>(null);
  
  // Scheduling redeemed reward
  const [schedulingDialogOpen, setSchedulingDialogOpen] = useState(false);
  const [schedulingDate, setSchedulingDate] = useState<Date | undefined>(new Date());
  const [schedulingBarber, setSchedulingBarber] = useState<string>("");
  const [schedulingTime, setSchedulingTime] = useState<string>("");
  
  // Redemption history
  const [redeemedRewards, setRedeemedRewards] = useState([
    {
      id: 1,
      reward: "Desconto de 50%",
      date: "15/03/2025",
      pointsUsed: 40,
      status: "Utilizado"
    }
  ]);

  // Handle reward redemption
  const handleOpenRedeemDialog = (reward: any) => {
    setSelectedReward(reward);
    setRedeemDialogOpen(true);
  };
  
  const handleRedeemReward = () => {
    if (selectedReward && userPoints >= selectedReward.pointsRequired) {
      // For services that need scheduling, open scheduling dialog
      if (["Corte Grátis", "Barba Grátis", "Combo Premium"].includes(selectedReward.name)) {
        setRedeemDialogOpen(false);
        setSchedulingDialogOpen(true);
      } else {
        // For physical rewards or discounts
        const newRedemption = {
          id: redeemedRewards.length + 1,
          reward: selectedReward.name,
          date: new Date().toLocaleDateString('pt-BR'),
          pointsUsed: selectedReward.pointsRequired,
          status: "Disponível"
        };
        
        setRedeemedRewards([...redeemedRewards, newRedemption]);
        setUserPoints(userPoints - selectedReward.pointsRequired);
        
        toast({
          title: "Recompensa resgatada!",
          description: `Você resgatou ${selectedReward.name} por ${selectedReward.pointsRequired} pontos.`,
          duration: 5000,
        });
        
        setRedeemDialogOpen(false);
      }
    }
  };
  
  // Handle scheduling a redeemed service
  const handleScheduleService = () => {
    if (schedulingDate && schedulingBarber && schedulingTime && selectedReward) {
      const newRedemption = {
        id: redeemedRewards.length + 1,
        reward: selectedReward.name,
        date: schedulingDate.toLocaleDateString('pt-BR'),
        pointsUsed: selectedReward.pointsRequired,
        status: "Agendado"
      };
      
      setRedeemedRewards([...redeemedRewards, newRedemption]);
      setUserPoints(userPoints - selectedReward.pointsRequired);
      
      toast({
        title: "Serviço agendado!",
        description: `${selectedReward.name} foi agendado para ${schedulingDate.toLocaleDateString('pt-BR')} às ${schedulingTime} com ${schedulingBarber}.`,
        duration: 5000,
      });
      
      // Reset and close dialogs
      setSchedulingDialogOpen(false);
      setSchedulingDate(new Date());
      setSchedulingBarber("");
      setSchedulingTime("");
    }
  };
  
  return (
    <div className="space-y-6">
      <Card className="barber-card">
        <CardHeader className="pb-3">
          <CardTitle>Meu Programa de Fidelidade</CardTitle>
          <CardDescription>Acumule pontos e troque por recompensas exclusivas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="flex flex-col items-center p-4 border rounded-md space-y-2">
                <div className="text-4xl font-bold text-barber-gold flex items-center">
                  {userPoints} <Star className="h-6 w-6 ml-1" />
                </div>
                <p className="text-sm text-muted-foreground">Pontos disponíveis</p>
              </div>
              
              <div className="flex-1 p-4 border rounded-md space-y-2">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Nível atual</p>
                    <h3 className="text-xl font-bold text-barber-gold">{userLevel}</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Próximo nível</p>
                    <h3 className="text-xl font-bold">{nextLevel}</h3>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{userPoints} pontos</span>
                    <span>{pointsToNextLevel} pontos</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <p className="text-sm text-muted-foreground">{pointsToNextLevel - userPoints} pontos para atingir o próximo nível</p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-4">Benefícios do Nível Atual</h3>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span>Acúmulo de pontos (1 ponto por R$ 8 gastos)</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span>5% de desconto em produtos</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-4">Como acumular mais pontos?</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Agende e compareça aos seus serviços</li>
                <li>Compre produtos na loja</li>
                <li>Indique amigos para a barbearia</li>
                <li>Compartilhe sua experiência nas redes sociais</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="barber-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center">
            <Gift className="h-5 w-5 mr-2 text-barber-gold" />
            Resgatar Recompensas
          </CardTitle>
          <CardDescription>
            Troque seus pontos por recompensas exclusivas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {rewardItems.map((reward) => {
              const canRedeem = userPoints >= reward.pointsRequired;
              
              return (
                <div 
                  key={reward.id} 
                  className={`border rounded-md overflow-hidden hover:shadow-md transition-shadow ${
                    !canRedeem ? 'opacity-60' : ''
                  }`}
                >
                  <img 
                    src={reward.image} 
                    alt={reward.name} 
                    className="w-full h-32 object-cover"
                  />
                  <div className="p-3">
                    <h3 className="font-medium">{reward.name}</h3>
                    <p className="text-sm text-muted-foreground">{reward.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1 text-barber-gold">
                        <Star className="h-4 w-4" />
                        <span className="font-medium">{reward.pointsRequired} pontos</span>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        disabled={!canRedeem}
                        onClick={() => handleOpenRedeemDialog(reward)}
                      >
                        Resgatar
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      
      <Card className="barber-card">
        <CardHeader className="pb-3">
          <CardTitle>Histórico de Resgates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {redeemedRewards.map((item) => (
              <div key={item.id} className="py-3">
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium">{item.reward}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.pointsUsed} pontos utilizados
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{item.date}</p>
                    <p className={`text-sm ${
                      item.status === 'Utilizado' ? 'text-muted-foreground' : 'text-green-500'
                    }`}>
                      {item.status}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            {redeemedRewards.length === 0 && (
              <div className="py-4 text-center text-muted-foreground">
                Você ainda não resgatou nenhuma recompensa.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Redeem confirmation dialog */}
      <Dialog open={redeemDialogOpen} onOpenChange={setRedeemDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Resgatar recompensa</DialogTitle>
            <DialogDescription>
              Confirme o resgate da recompensa selecionada.
            </DialogDescription>
          </DialogHeader>
          
          {selectedReward && (
            <div className="space-y-4 py-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded overflow-hidden">
                  <img 
                    src={selectedReward.image} 
                    alt={selectedReward.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-medium">{selectedReward.name}</h4>
                  <p className="text-sm text-muted-foreground">{selectedReward.description}</p>
                </div>
              </div>
              
              <div className="p-3 bg-muted rounded-md">
                <div className="flex justify-between">
                  <span>Pontos necessários:</span>
                  <span className="font-medium">{selectedReward.pointsRequired}</span>
                </div>
                <div className="flex justify-between">
                  <span>Seus pontos:</span>
                  <span className="font-medium">{userPoints}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pontos restantes:</span>
                  <span className="font-medium">{userPoints - selectedReward.pointsRequired}</span>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setRedeemDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleRedeemReward}
              className="btn-primary"
            >
              Confirmar resgate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Service scheduling dialog */}
      <Dialog open={schedulingDialogOpen} onOpenChange={setSchedulingDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Agendar serviço resgatado</DialogTitle>
            <DialogDescription>
              {selectedReward && `Agende seu ${selectedReward.name} resgatado com ${selectedReward.pointsRequired} pontos.`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h4 className="font-medium">Selecione a data</h4>
              <Calendar
                mode="single"
                selected={schedulingDate}
                onSelect={setSchedulingDate}
                className="border rounded-md p-3 pointer-events-auto mx-auto"
                disabled={{ before: new Date() }}
              />
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Selecione o profissional</h4>
              <Select value={schedulingBarber} onValueChange={setSchedulingBarber}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um barbeiro" />
                </SelectTrigger>
                <SelectContent>
                  {barbers.map(barber => (
                    <SelectItem key={barber.id} value={barber.name}>
                      {barber.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Selecione o horário</h4>
              <div className="grid grid-cols-4 gap-2">
                {timeSlots.map(time => (
                  <Button
                    key={time}
                    variant="outline"
                    className={`${schedulingTime === time ? 'border-barber-gold bg-barber-gold/5' : ''}`}
                    onClick={() => setSchedulingTime(time)}
                  >
                    {time}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setSchedulingDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleScheduleService}
              className="btn-primary"
              disabled={!schedulingDate || !schedulingBarber || !schedulingTime}
            >
              Confirmar agendamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

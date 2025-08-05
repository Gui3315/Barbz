
import { DashboardLayout } from "@/components/dashboard/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Gift, Plus, Search, Star, Trophy, Users, Edit, Trash } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Types for client and rewards
interface LoyaltyClient {
  id: number;
  name: string;
  loyaltyPoints: number;
  level: string;
  visits: number;
  lastVisit: string;
}

interface Reward {
  id: number;
  name: string;
  image: string;
  description: string;
  pointsRequired: number;
}

// Mock data for loyalty program
const loyaltyLevels = [
  {
    name: "Bronze",
    minPoints: 0,
    maxPoints: 50,
    color: "#CD7F32",
    benefits: ["Acúmulo de pontos (1 ponto por R$ 10 gastos)"]
  },
  {
    name: "Prata",
    minPoints: 51,
    maxPoints: 150,
    color: "#C0C0C0",
    benefits: ["Acúmulo de pontos (1 ponto por R$ 8 gastos)", "5% de desconto em produtos"]
  },
  {
    name: "Ouro",
    minPoints: 151,
    maxPoints: 300,
    color: "#d4af37",
    benefits: [
      "Acúmulo de pontos (1 ponto por R$ 5 gastos)", 
      "10% de desconto em produtos", 
      "Prioridade no agendamento"
    ]
  },
  {
    name: "Platina",
    minPoints: 301,
    maxPoints: 600,
    color: "#E5E4E2",
    benefits: [
      "Acúmulo de pontos (1 ponto por R$ 3 gastos)", 
      "15% de desconto em produtos", 
      "Prioridade no agendamento",
      "Um serviço gratuito após 5 visitas"
    ]
  },
  {
    name: "Diamante",
    minPoints: 601,
    maxPoints: null,
    color: "#b9f2ff",
    benefits: [
      "Acúmulo de pontos (1 ponto por R$ 2 gastos)", 
      "20% de desconto em produtos", 
      "Máxima prioridade no agendamento",
      "Um serviço gratuito após 3 visitas",
      "Acesso a eventos exclusivos"
    ]
  }
];

// Initial rewards data
const initialRewards: Reward[] = [
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
  },
  {
    id: 6,
    name: "Experiência VIP",
    image: "/placeholder.svg",
    description: "Atendimento exclusivo com bebidas e petiscos inclusos",
    pointsRequired: 120
  }
];

// Initial clients data
const initialClients: LoyaltyClient[] = [
  {
    id: 1,
    name: "Carlos Silva",
    loyaltyPoints: 35,
    level: "Bronze",
    visits: 12,
    lastVisit: "15/03/2023"
  },
  {
    id: 2,
    name: "Roberto Almeida",
    loyaltyPoints: 68,
    level: "Prata",
    visits: 15,
    lastVisit: "28/02/2023"
  },
  {
    id: 3,
    name: "Lucas Mendes",
    loyaltyPoints: 120,
    level: "Prata",
    visits: 22,
    lastVisit: "10/03/2023"
  },
  {
    id: 4,
    name: "Fernando Costa",
    loyaltyPoints: 45,
    level: "Bronze",
    visits: 9,
    lastVisit: "05/03/2023"
  },
  {
    id: 5,
    name: "André Santos",
    loyaltyPoints: 205,
    level: "Ouro",
    visits: 35,
    lastVisit: "20/03/2023"
  }
];

export default function Fidelidade() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [rewards, setRewards] = useState<Reward[]>(initialRewards);
  const [clients, setClients] = useState<LoyaltyClient[]>(initialClients);
  
  // Dialog states
  const [rewardDialogOpen, setRewardDialogOpen] = useState(false);
  const [pointsDialogOpen, setPointsDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<LoyaltyClient | null>(null);
  const [pointsToAdd, setPointsToAdd] = useState<string>("10");
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  
  // New reward state
  const [newReward, setNewReward] = useState<Omit<Reward, "id">>({
    name: "",
    image: "/placeholder.svg",
    description: "",
    pointsRequired: 50
  });
  
  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const getLoyaltyLevelColor = (level: string) => {
    const levelObj = loyaltyLevels.find(l => l.name === level);
    return levelObj ? levelObj.color : "#000000";
  };
  
  const getProgressForLevel = (points: number, level: string) => {
    const levelObj = loyaltyLevels.find(l => l.name === level);
    if (!levelObj) return 0;
    
    const nextLevelIndex = loyaltyLevels.findIndex(l => l.name === level) + 1;
    
    if (nextLevelIndex >= loyaltyLevels.length) {
      return 100; // Already at max level
    }
    
    const nextLevel = loyaltyLevels[nextLevelIndex];
    const pointsInCurrentLevel = points - levelObj.minPoints;
    const pointsRequiredForNextLevel = nextLevel.minPoints - levelObj.minPoints;
    
    return Math.min(100, (pointsInCurrentLevel / pointsRequiredForNextLevel) * 100);
  };
  
  // Calculate the loyalty level based on points
  const calculateLoyaltyLevel = (points: number) => {
    for (let i = loyaltyLevels.length - 1; i >= 0; i--) {
      if (points >= loyaltyLevels[i].minPoints) {
        return loyaltyLevels[i].name;
      }
    }
    return loyaltyLevels[0].name; // Default to lowest level
  };
  
  // Handle adding points to a client
  const handleOpenAddPointsDialog = (client: LoyaltyClient) => {
    setSelectedClient(client);
    setPointsToAdd("10");
    setPointsDialogOpen(true);
  };
  
  const handleAddPoints = () => {
    if (!selectedClient || isNaN(parseInt(pointsToAdd))) return;
    
    const points = parseInt(pointsToAdd);
    const newPoints = selectedClient.loyaltyPoints + points;
    
    // Calculate new loyalty level
    const newLevel = calculateLoyaltyLevel(newPoints);
    
    // Update client with new points and potentially new level
    setClients(clients.map(client => {
      if (client.id === selectedClient.id) {
        return {
          ...client,
          loyaltyPoints: newPoints,
          level: newLevel
        };
      }
      return client;
    }));
    
    // Show success message
    toast({
      title: "Pontos adicionados",
      description: `${points} pontos foram adicionados para ${selectedClient.name}.`,
      duration: 3000,
    });
    
    // Close dialog
    setPointsDialogOpen(false);
  };
  
  // Handle reward CRUD operations
  const openRewardDialog = (reward: Reward | null = null) => {
    if (reward) {
      // Edit existing reward
      setEditingReward(reward);
      setNewReward({
        name: reward.name,
        image: reward.image,
        description: reward.description,
        pointsRequired: reward.pointsRequired
      });
    } else {
      // Create new reward
      setEditingReward(null);
      setNewReward({
        name: "",
        image: "/placeholder.svg",
        description: "",
        pointsRequired: 50
      });
    }
    setRewardDialogOpen(true);
  };
  
  const handleSaveReward = () => {
    if (!newReward.name) {
      toast({
        title: "Campo obrigatório",
        description: "O nome da recompensa é obrigatório.",
        variant: "destructive"
      });
      return;
    }
    
    if (editingReward) {
      // Update existing reward
      setRewards(rewards.map(r => 
        r.id === editingReward.id 
          ? { ...newReward, id: editingReward.id } 
          : r
      ));
      
      toast({
        title: "Recompensa atualizada",
        description: `A recompensa ${newReward.name} foi atualizada com sucesso.`,
      });
    } else {
      // Create new reward
      const id = Math.max(...rewards.map(r => r.id), 0) + 1;
      setRewards([...rewards, { ...newReward, id }]);
      
      toast({
        title: "Recompensa criada",
        description: `A recompensa ${newReward.name} foi criada com sucesso.`,
      });
    }
    
    setRewardDialogOpen(false);
  };
  
  const handleDeleteReward = (id: number) => {
    setRewards(rewards.filter(r => r.id !== id));
    
    toast({
      title: "Recompensa excluída",
      description: "A recompensa foi excluída com sucesso.",
    });
  };
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="header-text">Programa de Fidelidade</h1>
          <Button 
            className="btn-primary gap-2"
            onClick={() => openRewardDialog()}
          >
            <Plus size={16} />
            Nova Recompensa
          </Button>
        </div>
        
        {/* Loyalty Program Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="barber-card md:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Níveis do Programa</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {loyaltyLevels.map((level, index) => (
                  <div key={level.name} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div 
                        className="h-6 w-6 rounded-full" 
                        style={{ background: level.color }}
                      ></div>
                      <h3 className="font-medium">{level.name}</h3>
                      <span className="text-sm text-muted-foreground">
                        {level.minPoints} - {level.maxPoints ?? "∞"} pontos
                      </span>
                    </div>
                    <div className="pl-8">
                      <ul className="list-disc space-y-1 text-sm">
                        {level.benefits.map((benefit, i) => (
                          <li key={i}>{benefit}</li>
                        ))}
                      </ul>
                    </div>
                    {index < loyaltyLevels.length - 1 && (
                      <div className="h-8 w-0.5 bg-border mx-auto"></div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card className="barber-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Trophy className="h-5 w-5 mr-2 text-barber-gold" />
                Estatísticas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 p-3 border rounded-md">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Clientes no Programa</h3>
                  <span className="text-xl font-bold">{clients.length}</span>
                </div>
              </div>
              
              <div className="space-y-2 p-3 border rounded-md">
                <h3 className="font-medium mb-3">Distribuição por Nível</h3>
                <div className="space-y-3">
                  {loyaltyLevels.map(level => {
                    const clientsInLevel = clients.filter(c => c.level === level.name).length;
                    const percentage = (clientsInLevel / clients.length) * 100;
                    
                    return (
                      <div key={level.name} className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span style={{ color: level.color }} className="font-medium">{level.name}</span>
                          <span>{clientsInLevel} ({percentage.toFixed(0)}%)</span>
                        </div>
                        <Progress value={percentage} />
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div className="space-y-2 p-3 border rounded-md">
                <h3 className="font-medium">Total de Pontos Distribuídos</h3>
                <span className="text-xl font-bold">{clients.reduce((sum, client) => sum + client.loyaltyPoints, 0)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Rewards Section */}
        <Card className="barber-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <Gift className="h-5 w-5 mr-2 text-barber-red" />
              Recompensas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {rewards.map((reward) => (
                <div key={reward.id} className="border rounded-md overflow-hidden hover:shadow-md transition-shadow">
                  <div className="relative">
                    <img 
                      src={reward.image} 
                      alt={reward.name} 
                      className="w-full h-32 object-cover"
                    />
                    <div className="absolute top-2 right-2 flex gap-1">
                      <Button 
                        size="icon"
                        variant="outline"
                        className="h-8 w-8 rounded-full bg-white"
                        onClick={() => openRewardDialog(reward)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="icon"
                        variant="outline"
                        className="h-8 w-8 rounded-full bg-white text-red-500 hover:text-red-600"
                        onClick={() => handleDeleteReward(reward.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium">{reward.name}</h3>
                    <p className="text-sm text-muted-foreground">{reward.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1 text-barber-gold">
                        <Star className="h-4 w-4" />
                        <span className="font-medium">{reward.pointsRequired} pontos</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Clients in Loyalty Program */}
        <Card className="barber-card">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <CardTitle className="text-lg flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Clientes no Programa
              </CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Buscar cliente..." 
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b">
                    <th className="pb-2">Cliente</th>
                    <th className="pb-2">Nível</th>
                    <th className="pb-2">Pontos</th>
                    <th className="pb-2">Visitas</th>
                    <th className="pb-2">Última Visita</th>
                    <th className="pb-2">Progresso</th>
                    <th className="pb-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClients.map((client) => (
                    <tr key={client.id} className="border-b last:border-0">
                      <td className="py-3">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-barber flex items-center justify-center text-white">
                            {client.name.split(' ').map(name => name[0]).join('')}
                          </div>
                          <span className="ml-2">{client.name}</span>
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-1">
                          <div 
                            className="h-3 w-3 rounded-full" 
                            style={{ background: getLoyaltyLevelColor(client.level) }}
                          ></div>
                          <span>{client.level}</span>
                        </div>
                      </td>
                      <td className="py-3">{client.loyaltyPoints} pontos</td>
                      <td className="py-3">{client.visits} visitas</td>
                      <td className="py-3">{client.lastVisit}</td>
                      <td className="py-3 w-40">
                        <Progress 
                          value={getProgressForLevel(client.loyaltyPoints, client.level)} 
                          className="h-2"
                        />
                      </td>
                      <td className="py-3">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleOpenAddPointsDialog(client)}
                        >
                          Adicionar Pontos
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Add Points Dialog */}
      <Dialog open={pointsDialogOpen} onOpenChange={setPointsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Adicionar Pontos de Fidelidade</DialogTitle>
            <DialogDescription>
              {selectedClient && `Adicione pontos para ${selectedClient.name}.`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="points">Quantidade de Pontos</Label>
                <Input
                  id="points"
                  type="number"
                  value={pointsToAdd}
                  onChange={(e) => setPointsToAdd(e.target.value)}
                  min="1"
                />
              </div>
              
              {selectedClient && (
                <div className="p-3 bg-muted rounded-md">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-sm text-muted-foreground">Pontos atuais</span>
                      <p className="font-medium">{selectedClient.loyaltyPoints}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Novos pontos</span>
                      <p className="font-medium">{selectedClient.loyaltyPoints + parseInt(pointsToAdd || "0")}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Nível atual</span>
                      <p className="font-medium">{selectedClient.level}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Novo nível</span>
                      <p className="font-medium">
                        {calculateLoyaltyLevel(selectedClient.loyaltyPoints + parseInt(pointsToAdd || "0"))}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setPointsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddPoints} className="btn-primary">
              Adicionar Pontos
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Reward Edit/Create Dialog */}
      <Dialog open={rewardDialogOpen} onOpenChange={setRewardDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingReward ? 'Editar Recompensa' : 'Nova Recompensa'}
            </DialogTitle>
            <DialogDescription>
              {editingReward 
                ? 'Edite os detalhes da recompensa existente.' 
                : 'Crie uma nova recompensa para o programa de fidelidade.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Recompensa *</Label>
              <Input
                id="name"
                value={newReward.name}
                onChange={(e) => setNewReward({...newReward, name: e.target.value})}
                placeholder="Ex: Corte Grátis"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Input
                id="description"
                value={newReward.description}
                onChange={(e) => setNewReward({...newReward, description: e.target.value})}
                placeholder="Descreva a recompensa"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="points">Pontos Necessários</Label>
              <Input
                id="points"
                type="number"
                value={newReward.pointsRequired.toString()}
                onChange={(e) => setNewReward({...newReward, pointsRequired: parseInt(e.target.value) || 0})}
                min="1"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="image">Imagem (URL)</Label>
              <Input
                id="image"
                value={newReward.image}
                onChange={(e) => setNewReward({...newReward, image: e.target.value})}
                placeholder="/placeholder.svg"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setRewardDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveReward} className="btn-primary">
              {editingReward ? 'Salvar Alterações' : 'Criar Recompensa'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

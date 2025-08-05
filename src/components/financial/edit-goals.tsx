
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export interface FinancialGoal {
  id: string;
  category: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  period: string;
}

interface EditGoalsProps {
  goals: FinancialGoal[];
  onGoalsUpdate: (goals: FinancialGoal[]) => void;
}

export function EditGoals({ goals, onGoalsUpdate }: EditGoalsProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    category: "",
    description: "",
    targetAmount: "",
    currentAmount: "",
    period: "monthly"
  });

  const handleOpenDialog = (goalId?: string) => {
    if (goalId) {
      const goal = goals.find(g => g.id === goalId);
      if (goal) {
        setSelectedGoalId(goalId);
        setFormData({
          category: goal.category,
          description: goal.description,
          targetAmount: goal.targetAmount.toString(),
          currentAmount: goal.currentAmount.toString(),
          period: goal.period
        });
      }
    } else {
      // New goal
      setSelectedGoalId(null);
      setFormData({
        category: "revenue",
        description: "",
        targetAmount: "",
        currentAmount: "0",
        period: "monthly"
      });
    }
    setOpen(true);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    // Validate
    if (!formData.description || !formData.targetAmount) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const targetAmount = parseFloat(formData.targetAmount);
    const currentAmount = parseFloat(formData.currentAmount || "0");
    
    if (isNaN(targetAmount) || targetAmount <= 0) {
      toast({
        title: "Valor inválido",
        description: "O valor da meta deve ser um número positivo.",
        variant: "destructive",
      });
      return;
    }

    if (isNaN(currentAmount) || currentAmount < 0) {
      toast({
        title: "Valor atual inválido",
        description: "O valor atual deve ser um número não negativo.",
        variant: "destructive",
      });
      return;
    }

    if (selectedGoalId) {
      // Update existing goal
      const updatedGoals = goals.map(goal => {
        if (goal.id === selectedGoalId) {
          return {
            ...goal,
            category: formData.category,
            description: formData.description,
            targetAmount,
            currentAmount,
            period: formData.period
          };
        }
        return goal;
      });
      
      onGoalsUpdate(updatedGoals);
      
      toast({
        title: "Meta atualizada",
        description: "A meta foi atualizada com sucesso."
      });
    } else {
      // Add new goal
      const newGoal: FinancialGoal = {
        id: Date.now().toString(),
        category: formData.category,
        description: formData.description,
        targetAmount,
        currentAmount,
        period: formData.period
      };
      
      onGoalsUpdate([...goals, newGoal]);
      
      toast({
        title: "Meta adicionada",
        description: "Nova meta foi adicionada com sucesso."
      });
    }
    
    setOpen(false);
  };

  const handleDelete = () => {
    if (selectedGoalId) {
      const updatedGoals = goals.filter(goal => goal.id !== selectedGoalId);
      onGoalsUpdate(updatedGoals);
      
      toast({
        title: "Meta removida",
        description: "A meta foi removida com sucesso."
      });
      
      setOpen(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Metas Financeiras</h3>
        <Button size="sm" onClick={() => handleOpenDialog()}>
          Adicionar Meta
        </Button>
      </div>

      {goals.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          Nenhuma meta financeira definida. Clique em "Adicionar Meta" para começar.
        </div>
      ) : (
        <div className="space-y-3">
          {goals.map(goal => (
            <div 
              key={goal.id} 
              className="border rounded-lg p-4 hover:bg-secondary/10 transition cursor-pointer"
              onClick={() => handleOpenDialog(goal.id)}
            >
              <div className="flex justify-between">
                <div>
                  <span className={`inline-block px-2 py-1 text-xs rounded ${
                    goal.category === 'revenue' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {goal.category === 'revenue' ? 'Receita' : 'Despesa'}
                  </span>
                  <div className="font-medium mt-1">{goal.description}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">
                    {goal.period === 'monthly' ? 'Mensal' : 
                      goal.period === 'quarterly' ? 'Trimestral' : 
                      goal.period === 'yearly' ? 'Anual' : 'Personalizado'}
                  </div>
                  <div className="font-medium">
                    R$ {goal.currentAmount.toFixed(2)} / R$ {goal.targetAmount.toFixed(2)}
                  </div>
                </div>
              </div>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${goal.category === 'revenue' ? 'bg-green-500' : 'bg-red-500'}`}
                  style={{ 
                    width: `${Math.min(100, (goal.currentAmount / goal.targetAmount) * 100)}%` 
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{selectedGoalId ? "Editar Meta" : "Nova Meta"}</DialogTitle>
            <DialogDescription>
              {selectedGoalId 
                ? "Atualize os detalhes da meta financeira" 
                : "Adicione uma nova meta financeira para acompanhar seu progresso"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Categoria
              </Label>
              <div className="col-span-3">
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleChange('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="revenue">Receita</SelectItem>
                    <SelectItem value="expense">Despesa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Descrição*
              </Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                className="col-span-3"
                placeholder="Ex: Faturamento mensal"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="target" className="text-right">
                Meta (R$)*
              </Label>
              <Input
                id="target"
                type="number"
                min="0"
                step="0.01"
                value={formData.targetAmount}
                onChange={(e) => handleChange('targetAmount', e.target.value)}
                className="col-span-3"
                placeholder="0,00"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="current" className="text-right">
                Valor Atual (R$)
              </Label>
              <Input
                id="current"
                type="number"
                min="0"
                step="0.01"
                value={formData.currentAmount}
                onChange={(e) => handleChange('currentAmount', e.target.value)}
                className="col-span-3"
                placeholder="0,00"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="period" className="text-right">
                Período
              </Label>
              <div className="col-span-3">
                <Select
                  value={formData.period}
                  onValueChange={(value) => handleChange('period', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Mensal</SelectItem>
                    <SelectItem value="quarterly">Trimestral</SelectItem>
                    <SelectItem value="yearly">Anual</SelectItem>
                    <SelectItem value="custom">Personalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <DialogFooter className="flex justify-between">
            {selectedGoalId && (
              <Button 
                variant="destructive" 
                onClick={handleDelete}
              >
                Excluir
              </Button>
            )}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave}>
                {selectedGoalId ? "Salvar" : "Adicionar"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

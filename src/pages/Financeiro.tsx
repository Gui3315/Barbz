
import { useState, useRef } from "react";
import { DashboardLayout } from "@/components/dashboard/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart2, 
  CalendarIcon, 
  DollarSign, 
  Download, 
  FileUp, 
  FileDown, 
  Plus, 
  BarChart3, 
  Filter,
  Calendar as CalendarIcon2,
  Edit,
  Trash2,
  ChevronDown
} from "lucide-react";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer
} from "recharts";
import html2canvas from "html2canvas";
import { 
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink
} from "@/components/ui/navigation-menu";

interface Transaction {
  id: number;
  date: Date;
  description: string;
  amount: number;
  type: "income" | "expense";
  category: string;
}

const initialTransactions: Transaction[] = [
  {
    id: 1,
    date: new Date(2025, 3, 16),
    description: "Corte + Barba - Carlos Silva",
    amount: 55.00,
    type: "income",
    category: "Serviços"
  },
  {
    id: 2,
    date: new Date(2025, 3, 15),
    description: "Corte Degradê - André Santos",
    amount: 40.00,
    type: "income",
    category: "Serviços"
  },
  {
    id: 3,
    date: new Date(2025, 3, 14),
    description: "Venda Pomada - Lucas Mendes",
    amount: 45.00,
    type: "income",
    category: "Produtos"
  },
  {
    id: 4,
    date: new Date(2025, 3, 13),
    description: "Aluguel",
    amount: 1800.00,
    type: "expense",
    category: "Aluguel"
  },
  {
    id: 5,
    date: new Date(2025, 3, 12),
    description: "Produtos para estoque",
    amount: 650.00,
    type: "expense",
    category: "Estoque"
  },
  {
    id: 6,
    date: new Date(2025, 3, 11),
    description: "Conta de luz",
    amount: 230.00,
    type: "expense",
    category: "Utilidades"
  },
  {
    id: 7,
    date: new Date(2025, 3, 10),
    description: "Barba - Fernando Costa",
    amount: 25.00,
    type: "income",
    category: "Serviços"
  }
];

const planningData = [
  {
    name: "Jan",
    plan: 12000,
    real: 10800
  },
  {
    name: "Fev",
    plan: 12000,
    real: 11500
  },
  {
    name: "Mar",
    plan: 12000,
    real: 12200
  },
  {
    name: "Abr",
    plan: 14000,
    real: 13800
  },
  {
    name: "Mai",
    plan: 14000,
    real: 0
  },
  {
    name: "Jun",
    plan: 14000,
    real: 0
  },
  {
    name: "Jul",
    plan: 15000,
    real: 0
  },
  {
    name: "Ago",
    plan: 15000,
    real: 0
  },
  {
    name: "Set",
    plan: 15000,
    real: 0
  },
  {
    name: "Out",
    plan: 16000,
    real: 0
  },
  {
    name: "Nov",
    plan: 18000,
    real: 0
  },
  {
    name: "Dez",
    plan: 20000,
    real: 0
  }
];

export default function Financeiro() {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [newTransactionOpen, setNewTransactionOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [editTransactionOpen, setEditTransactionOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [showPlanning, setShowPlanning] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date())
  });
  const chartRef = useRef<HTMLDivElement>(null);
  
  const [newTransaction, setNewTransaction] = useState<{
    description: string;
    amount: string;
    type: "income" | "expense";
    category: string;
    date: Date;
  }>({
    description: "",
    amount: "",
    type: "income",
    category: "",
    date: new Date(),
  });
  
  const updateNewTransactionField = (
    field: string,
    value: string | Date | "income" | "expense"
  ) => {
    setNewTransaction({
      ...newTransaction,
      [field]: value
    });
  };
  
  const filteredTransactions = transactions.filter(
    (transaction) => 
      transaction.date >= dateRange.from && 
      transaction.date <= dateRange.to
  );
  
  const incomeTotal = filteredTransactions
    .filter(t => t.type === "income")
    .reduce((acc, curr) => acc + curr.amount, 0);
  
  const expenseTotal = filteredTransactions
    .filter(t => t.type === "expense")
    .reduce((acc, curr) => acc + curr.amount, 0);
  
  const balance = incomeTotal - expenseTotal;

  const handleAddTransaction = () => {
    if (!newTransaction.description || !newTransaction.amount || !newTransaction.category) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }
    
    const transaction: Transaction = {
      id: transactions.length + 1,
      date: newTransaction.date,
      description: newTransaction.description,
      amount: parseFloat(newTransaction.amount),
      type: newTransaction.type,
      category: newTransaction.category
    };
    
    setTransactions([transaction, ...transactions]);
    
    setNewTransaction({
      description: "",
      amount: "",
      type: "income",
      category: "",
      date: new Date(),
    });
    setNewTransactionOpen(false);
    
    toast({
      title: "Transação adicionada",
      description: "A transação foi adicionada com sucesso.",
    });
  };

  const handleEditTransaction = () => {
    if (!selectedTransaction) return;
    
    const updatedTransactions = transactions.map(t => {
      if (t.id === selectedTransaction.id) {
        return {
          ...selectedTransaction,
          description: newTransaction.description || selectedTransaction.description,
          amount: parseFloat(newTransaction.amount) || selectedTransaction.amount,
          type: newTransaction.type || selectedTransaction.type,
          category: newTransaction.category || selectedTransaction.category,
          date: newTransaction.date || selectedTransaction.date
        };
      }
      return t;
    });
    
    setTransactions(updatedTransactions);
    setEditTransactionOpen(false);
    setSelectedTransaction(null);
    
    toast({
      title: "Transação atualizada",
      description: "A transação foi atualizada com sucesso.",
    });
  };
  
  const handleDeleteTransaction = () => {
    if (!selectedTransaction) return;
    
    const updatedTransactions = transactions.filter(
      t => t.id !== selectedTransaction.id
    );
    
    setTransactions(updatedTransactions);
    setDeleteConfirmOpen(false);
    setSelectedTransaction(null);
    
    toast({
      title: "Transação excluída",
      description: "A transação foi excluída com sucesso.",
    });
  };
  
  const openEditDialog = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setNewTransaction({
      description: transaction.description,
      amount: transaction.amount.toString(),
      type: transaction.type,
      category: transaction.category,
      date: transaction.date
    });
    setEditTransactionOpen(true);
  };
  
  const openDeleteDialog = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setDeleteConfirmOpen(true);
  };
  
  const handleExportToPng = () => {
    if (chartRef.current) {
      html2canvas(chartRef.current).then(canvas => {
        const link = document.createElement("a");
        link.download = `financeiro_${format(dateRange.from, "dd-MM-yyyy")}_a_${format(dateRange.to, "dd-MM-yyyy")}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
        
        toast({
          title: "Exportação concluída",
          description: "Os dados foram exportados como PNG com sucesso.",
        });
        
        setExportDialogOpen(false);
      });
    }
  };
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="header-text">Financeiro</h1>
            <p className="text-muted-foreground">
              {format(dateRange.from, "dd 'de' MMMM", { locale: ptBR })} - {format(dateRange.to, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="h-10 gap-1 px-4">
                    <Button variant="outline" className="gap-2 border-none p-0 shadow-none">
                      <BarChart2 size={16} />
                      Planejamento
                    </Button>
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="p-3 min-w-[400px]">
                    <Card className="border-none shadow-none">
                      <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Planejamento Mensal</CardTitle>
                        <Button variant="outline" size="sm">
                          Editar metas
                        </Button>
                      </CardHeader>
                      <CardContent>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={planningData}
                              margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <Tooltip formatter={(value) => [`R$ ${value}`, ""]} />
                              <Legend />
                              <Bar dataKey="plan" name="Planejado" fill="#8884d8" />
                              <Bar dataKey="real" name="Realizado" fill="#82ca9d" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                        
                        <div className="mt-6 space-y-3">
                          <div className="flex justify-between text-sm">
                            <span>Meta do mês</span>
                            <span className="font-medium">R$ 14.000,00</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Realizado</span>
                            <span className="font-medium">R$ 13.800,00</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>% Alcançado</span>
                            <span className="font-medium">98.57%</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
            <Button 
              variant="outline"
              className="gap-2"
              onClick={() => setExportDialogOpen(true)}
            >
              <Download size={16} />
              Exportar
            </Button>
            <Button 
              className="btn-primary gap-2"
              onClick={() => setNewTransactionOpen(true)}
            >
              <Plus size={16} />
              Nova Transação
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="barber-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Entradas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                R$ {incomeTotal.toFixed(2)}
              </div>
            </CardContent>
          </Card>
          
          <Card className="barber-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Saídas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                R$ {expenseTotal.toFixed(2)}
              </div>
            </CardContent>
          </Card>
          
          <Card className="barber-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Saldo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${
                balance >= 0 ? "text-green-600" : "text-red-600"
              }`}>
                R$ {balance.toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="barber-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Transações</CardTitle>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    <span>Filtrar</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={(range) => {
                      if (range?.from && range?.to) {
                        setDateRange({ from: range.from, to: range.to });
                      }
                    }}
                    initialFocus
                    className="p-3 pointer-events-auto"
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all">
                <TabsList className="mb-4">
                  <TabsTrigger value="all">Todas</TabsTrigger>
                  <TabsTrigger value="income">Entradas</TabsTrigger>
                  <TabsTrigger value="expense">Saídas</TabsTrigger>
                </TabsList>
                
                <TabsContent value="all" className="space-y-4">
                  <div ref={chartRef}>
                    {filteredTransactions.length === 0 ? (
                      <div className="text-center py-8">
                        <p>Nenhuma transação encontrada.</p>
                      </div>
                    ) : (
                      filteredTransactions.map((transaction) => (
                        <TransactionItem 
                          key={transaction.id} 
                          transaction={transaction} 
                          onEdit={() => openEditDialog(transaction)}
                          onDelete={() => openDeleteDialog(transaction)}
                        />
                      ))
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="income" className="space-y-4">
                  {filteredTransactions.filter(t => t.type === "income").length === 0 ? (
                    <div className="text-center py-8">
                      <p>Nenhuma entrada encontrada.</p>
                    </div>
                  ) : (
                    filteredTransactions
                      .filter(t => t.type === "income")
                      .map((transaction) => (
                        <TransactionItem 
                          key={transaction.id} 
                          transaction={transaction} 
                          onEdit={() => openEditDialog(transaction)}
                          onDelete={() => openDeleteDialog(transaction)}
                        />
                      ))
                  )}
                </TabsContent>
                
                <TabsContent value="expense" className="space-y-4">
                  {filteredTransactions.filter(t => t.type === "expense").length === 0 ? (
                    <div className="text-center py-8">
                      <p>Nenhuma saída encontrada.</p>
                    </div>
                  ) : (
                    filteredTransactions
                      .filter(t => t.type === "expense")
                      .map((transaction) => (
                        <TransactionItem 
                          key={transaction.id} 
                          transaction={transaction} 
                          onEdit={() => openEditDialog(transaction)}
                          onDelete={() => openDeleteDialog(transaction)}
                        />
                      ))
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Dialog open={newTransactionOpen} onOpenChange={setNewTransactionOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Nova Transação</DialogTitle>
            <DialogDescription>
              Preencha os detalhes da transação. Campos marcados com * são obrigatórios.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex gap-4 mb-4">
              <Button
                type="button"
                variant={newTransaction.type === "income" ? "default" : "outline"}
                className={`w-1/2 ${newTransaction.type === "income" ? "bg-green-600 hover:bg-green-700" : ""}`}
                onClick={() => updateNewTransactionField('type', 'income')}
              >
                <FileUp className="mr-2 h-4 w-4" />
                Entrada
              </Button>
              
              <Button
                type="button"
                variant={newTransaction.type === "expense" ? "default" : "outline"}
                className={`w-1/2 ${newTransaction.type === "expense" ? "bg-red-600 hover:bg-red-700" : ""}`}
                onClick={() => updateNewTransactionField('type', 'expense')}
              >
                <FileDown className="mr-2 h-4 w-4" />
                Saída
              </Button>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Descrição *</Label>
              <Input
                id="description"
                value={newTransaction.description}
                onChange={(e) => updateNewTransactionField('description', e.target.value)}
                placeholder="Digite a descrição"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="amount">Valor (R$) *</Label>
              <Input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                value={newTransaction.amount}
                onChange={(e) => updateNewTransactionField('amount', e.target.value)}
                placeholder="0,00"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Categoria *</Label>
              {newTransaction.type === "income" ? (
                <Select
                  value={newTransaction.category}
                  onValueChange={(value) => updateNewTransactionField('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Serviços">Serviços</SelectItem>
                    <SelectItem value="Produtos">Produtos</SelectItem>
                    <SelectItem value="VIP">Programa VIP</SelectItem>
                    <SelectItem value="Outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Select
                  value={newTransaction.category}
                  onValueChange={(value) => updateNewTransactionField('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Aluguel">Aluguel</SelectItem>
                    <SelectItem value="Estoque">Estoque</SelectItem>
                    <SelectItem value="Utilidades">Utilidades</SelectItem>
                    <SelectItem value="Salários">Salários</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="date">Data</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !newTransaction.date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newTransaction.date ? (
                      format(newTransaction.date, "dd/MM/yyyy", { locale: ptBR })
                    ) : (
                      <span>Selecione uma data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={newTransaction.date}
                    onSelect={(date) => date && updateNewTransactionField('date', date)}
                    initialFocus
                    className="p-3 pointer-events-auto"
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewTransactionOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleAddTransaction} 
              className={newTransaction.type === "income" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
            >
              Adicionar Transação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={editTransactionOpen} onOpenChange={setEditTransactionOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Transação</DialogTitle>
            <DialogDescription>
              Atualize os detalhes da transação. Campos marcados com * são obrigatórios.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex gap-4 mb-4">
              <Button
                type="button"
                variant={newTransaction.type === "income" ? "default" : "outline"}
                className={`w-1/2 ${newTransaction.type === "income" ? "bg-green-600 hover:bg-green-700" : ""}`}
                onClick={() => updateNewTransactionField('type', 'income')}
              >
                <FileUp className="mr-2 h-4 w-4" />
                Entrada
              </Button>
              
              <Button
                type="button"
                variant={newTransaction.type === "expense" ? "default" : "outline"}
                className={`w-1/2 ${newTransaction.type === "expense" ? "bg-red-600 hover:bg-red-700" : ""}`}
                onClick={() => updateNewTransactionField('type', 'expense')}
              >
                <FileDown className="mr-2 h-4 w-4" />
                Saída
              </Button>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-description">Descrição *</Label>
              <Input
                id="edit-description"
                value={newTransaction.description}
                onChange={(e) => updateNewTransactionField('description', e.target.value)}
                placeholder="Digite a descrição"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-amount">Valor (R$) *</Label>
              <Input
                id="edit-amount"
                type="number"
                min="0"
                step="0.01"
                value={newTransaction.amount}
                onChange={(e) => updateNewTransactionField('amount', e.target.value)}
                placeholder="0,00"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-category">Categoria *</Label>
              {newTransaction.type === "income" ? (
                <Select
                  value={newTransaction.category}
                  onValueChange={(value) => updateNewTransactionField('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Serviços">Serviços</SelectItem>
                    <SelectItem value="Produtos">Produtos</SelectItem>
                    <SelectItem value="VIP">Programa VIP</SelectItem>
                    <SelectItem value="Outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Select
                  value={newTransaction.category}
                  onValueChange={(value) => updateNewTransactionField('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Aluguel">Aluguel</SelectItem>
                    <SelectItem value="Estoque">Estoque</SelectItem>
                    <SelectItem value="Utilidades">Utilidades</SelectItem>
                    <SelectItem value="Salários">Salários</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-date">Data</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !newTransaction.date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newTransaction.date ? (
                      format(newTransaction.date, "dd/MM/yyyy", { locale: ptBR })
                    ) : (
                      <span>Selecione uma data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={newTransaction.date}
                    onSelect={(date) => date && updateNewTransactionField('date', date)}
                    initialFocus
                    className="p-3 pointer-events-auto"
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTransactionOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleEditTransaction} 
              className="btn-primary"
            >
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          
          {selectedTransaction && (
            <div className="py-4">
              <p><span className="font-medium">Descrição:</span> {selectedTransaction.description}</p>
              <p><span className="font-medium">Valor:</span> R$ {selectedTransaction.amount.toFixed(2)}</p>
              <p><span className="font-medium">Data:</span> {format(selectedTransaction.date, "dd/MM/yyyy", { locale: ptBR })}</p>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Cancelar
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeleteTransaction}
            >
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Exportar Dados</DialogTitle>
            <DialogDescription>
              Selecione o período e formato de exportação.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Período</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">Data inicial</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal"
                        )}
                      >
                        <CalendarIcon2 className="mr-2 h-4 w-4" />
                        {format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dateRange.from}
                        onSelect={(date) => date && setDateRange({ ...dateRange, from: date })}
                        initialFocus
                        className="p-3 pointer-events-auto"
                        locale={ptBR}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-xs">Data final</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal"
                        )}
                      >
                        <CalendarIcon2 className="mr-2 h-4 w-4" />
                        {format(dateRange.to, "dd/MM/yyyy", { locale: ptBR })}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dateRange.to}
                        onSelect={(date) => date && setDateRange({ ...dateRange, to: date })}
                        initialFocus
                        className="p-3 pointer-events-auto"
                        locale={ptBR}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Formato de exportação</Label>
              <Select defaultValue="png">
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o formato" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="png">Imagem (PNG)</SelectItem>
                  <SelectItem value="pdf">Documento (PDF)</SelectItem>
                  <SelectItem value="xlsx">Planilha Excel (XLSX)</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Conteúdo para exportação</Label>
              <Select defaultValue="all">
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o conteúdo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as transações</SelectItem>
                  <SelectItem value="income">Apenas entradas</SelectItem>
                  <SelectItem value="expense">Apenas saídas</SelectItem>
                  <SelectItem value="summary">Apenas resumo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setExportDialogOpen(false)}>
              Cancelar
            </Button>
            <Button className="btn-primary gap-2" onClick={handleExportToPng}>
              <Download size={16} />
              Exportar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

function TransactionItem({ 
  transaction, 
  onEdit, 
  onDelete 
}: { 
  transaction: Transaction; 
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b last:border-0">
      <div className="flex items-center">
        <div className={`p-2 rounded-md mr-3 ${
          transaction.type === "income" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
        }`}>
          {transaction.type === "income" ? (
            <FileUp className="h-5 w-5" />
          ) : (
            <FileDown className="h-5 w-5" />
          )}
        </div>
        
        <div>
          <p className="font-medium">{transaction.description}</p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{format(transaction.date, "dd/MM/yyyy", { locale: ptBR })}</span>
            <span>•</span>
            <span>{transaction.category}</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <div className={`text-right ${
          transaction.type === "income" ? "text-green-600" : "text-red-600"
        }`}>
          <p className="font-bold">
            {transaction.type === "income" ? "+" : "-"} R$ {transaction.amount.toFixed(2)}
          </p>
        </div>
        
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

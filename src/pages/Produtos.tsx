import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, Tag, Package, Scissors, Beer, Coffee, Droplet, Zap, Pizza } from "lucide-react";
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

interface Product {
  id: number;
  name: string;
  type: "product" | "service";
  price: number;
  description: string;
  stock?: number;
  duration?: number; // for services, in minutes
  category?: string; // for product categorization
}

const initialProducts: Product[] = [
  // Services
  {
    id: 1,
    name: "Corte Simples",
    type: "service",
    price: 35.00,
    description: "Corte de cabelo tradicional",
    duration: 30
  },
  {
    id: 2,
    name: "Corte Degradê",
    type: "service",
    price: 40.00,
    description: "Corte degradê com máquina e tesoura",
    duration: 30
  },
  {
    id: 3,
    name: "Barba Completa",
    type: "service",
    price: 25.00,
    description: "Serviço completo de barba com toalha quente",
    duration: 20
  },
  {
    id: 4,
    name: "Corte + Barba",
    type: "service",
    price: 55.00,
    description: "Combo de corte e barba",
    duration: 45
  },
  
  // Products - Hair
  {
    id: 5,
    name: "Pomada Modeladora",
    type: "product",
    price: 45.00,
    description: "Pomada modeladora para cabelo, fixação forte",
    stock: 12,
    category: "hair"
  },
  {
    id: 6,
    name: "Shampoo Barba",
    type: "product",
    price: 35.00,
    description: "Shampoo especial para barba",
    stock: 8,
    category: "hair"
  },
  
  // Beverages - Beer
  {
    id: 7,
    name: "Heineken",
    type: "product",
    price: 10.00,
    description: "Cerveja Heineken Long Neck 330ml",
    stock: 24,
    category: "beer"
  },
  {
    id: 8,
    name: "Stella Artois",
    type: "product",
    price: 11.00,
    description: "Cerveja Stella Artois Long Neck 330ml",
    stock: 24,
    category: "beer"
  },
  {
    id: 9,
    name: "Corona",
    type: "product",
    price: 12.00,
    description: "Cerveja Corona Long Neck 330ml",
    stock: 24,
    category: "beer"
  },
  
  // Beverages - Soft Drinks
  {
    id: 10,
    name: "Coca-Cola",
    type: "product",
    price: 5.00,
    description: "Refrigerante Coca-Cola Lata 350ml",
    stock: 30,
    category: "soda"
  },
  {
    id: 11,
    name: "Pepsi",
    type: "product",
    price: 5.00,
    description: "Refrigerante Pepsi Lata 350ml",
    stock: 30,
    category: "soda"
  },
  {
    id: 12,
    name: "Guaraná Antarctica",
    type: "product",
    price: 5.00,
    description: "Refrigerante Guaraná Antarctica Lata 350ml",
    stock: 30,
    category: "soda"
  },
  
  // Water
  {
    id: 13,
    name: "Água Mineral",
    type: "product",
    price: 3.00,
    description: "Água Mineral sem Gás 500ml",
    stock: 48,
    category: "water"
  },
  {
    id: 14,
    name: "Água Mineral com Gás",
    type: "product",
    price: 4.00,
    description: "Água Mineral com Gás 500ml",
    stock: 24,
    category: "water"
  },
  
  // Coffee
  {
    id: 15,
    name: "Café Espresso",
    type: "product",
    price: 4.00,
    description: "Café Espresso 50ml",
    stock: 100,
    category: "coffee"
  },
  {
    id: 16,
    name: "Café Cappuccino",
    type: "product",
    price: 7.00,
    description: "Café Cappuccino 180ml",
    stock: 50,
    category: "coffee"
  },
  
  // Energy Drinks
  {
    id: 17,
    name: "Red Bull",
    type: "product",
    price: 15.00,
    description: "Energético Red Bull Lata 250ml",
    stock: 24,
    category: "energy"
  },
  {
    id: 18,
    name: "Monster",
    type: "product",
    price: 14.00,
    description: "Energético Monster Lata 473ml",
    stock: 24,
    category: "energy"
  }
];

export default function Produtos() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [newItemDialogOpen, setNewItemDialogOpen] = useState(false);
  const [editItemDialogOpen, setEditItemDialogOpen] = useState(false);
  const [sellProductDialogOpen, setSellProductDialogOpen] = useState(false);
  const [scheduleServiceDialogOpen, setScheduleServiceDialogOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState<"all" | "products" | "services" | "beverages">("all");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  const [newItem, setNewItem] = useState<{
    name: string;
    type: "product" | "service";
    price: string;
    description: string;
    stock?: string;
    duration?: string;
    category?: string;
  }>({
    name: "",
    type: "service",
    price: "",
    description: "",
    stock: "",
    duration: "30",
    category: "",
  });
  
  const getFilteredProducts = () => {
    let filtered = products;
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by tab
    if (currentTab === "services") {
      return filtered.filter(product => product.type === "service");
    } else if (currentTab === "products") {
      return filtered.filter(product => 
        product.type === "product" && 
        (!product.category || (product.category && !["beer", "soda", "water", "coffee", "energy"].includes(product.category)))
      );
    } else if (currentTab === "beverages") {
      return filtered.filter(product => 
        product.type === "product" && 
        product.category && 
        ["beer", "soda", "water", "coffee", "energy"].includes(product.category)
      );
    } else {
      return filtered;
    }
  };
  
  const filteredProducts = getFilteredProducts();
  
  const updateNewItemField = (field: string, value: string) => {
    setNewItem({
      ...newItem,
      [field]: value
    });
  };
  
  const handleEditItem = () => {
    if (!selectedProduct) return;
    
    if (!newItem.name || !newItem.price) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome e preço são obrigatórios.",
        variant: "destructive",
      });
      return;
    }
    
    const updatedProducts = products.map(prod => {
      if (prod.id === selectedProduct.id) {
        return {
          ...prod,
          name: newItem.name,
          price: parseFloat(newItem.price),
          description: newItem.description || "",
          ...(prod.type === "product" && newItem.stock ? { stock: parseInt(newItem.stock) } : {}),
          ...(prod.type === "service" && newItem.duration ? { duration: parseInt(newItem.duration) } : {}),
          ...(prod.type === "product" && newItem.category ? { category: newItem.category } : {})
        };
      }
      return prod;
    });
    
    setProducts(updatedProducts);
    setEditItemDialogOpen(false);
    setSelectedProduct(null);
    
    toast({
      title: "Item atualizado",
      description: `${newItem.name} foi atualizado com sucesso.`,
    });
  };
  
  const handleSellProduct = () => {
    if (!selectedProduct) return;
    
    const quantity = parseInt(newItem.stock || "1");
    
    if (isNaN(quantity) || quantity <= 0) {
      toast({
        title: "Quantidade inválida",
        description: "Por favor, insira uma quantidade válida.",
        variant: "destructive",
      });
      return;
    }
    
    const updatedProducts = products.map(prod => {
      if (prod.id === selectedProduct.id && prod.stock !== undefined) {
        const newStock = prod.stock - quantity;
        
        if (newStock < 0) {
          toast({
            title: "Estoque insuficiente",
            description: `Estoque atual: ${prod.stock} unidades.`,
            variant: "destructive",
          });
          return prod;
        }
        
        return {
          ...prod,
          stock: newStock
        };
      }
      return prod;
    });
    
    setProducts(updatedProducts);
    setSellProductDialogOpen(false);
    setSelectedProduct(null);
    
    toast({
      title: "Venda realizada",
      description: `${quantity} unidade(s) de ${selectedProduct.name} vendida(s).`,
    });
  };
  
  const handleScheduleService = () => {
    if (!selectedProduct) return;
    
    setScheduleServiceDialogOpen(false);
    setSelectedProduct(null);
    
    toast({
      title: "Serviço agendado",
      description: `Agendamento para ${selectedProduct.name} foi criado.`,
    });
  };
  
  const openEditDialog = (product: Product) => {
    setSelectedProduct(product);
    setNewItem({
      name: product.name,
      type: product.type,
      price: product.price.toString(),
      description: product.description,
      stock: product.stock?.toString() || "",
      duration: product.duration?.toString() || "30",
      category: product.category || "",
    });
    setEditItemDialogOpen(true);
  };
  
  const openSellDialog = (product: Product) => {
    setSelectedProduct(product);
    setNewItem({
      ...newItem,
      stock: "1"
    });
    setSellProductDialogOpen(true);
  };
  
  const openScheduleDialog = (product: Product) => {
    setSelectedProduct(product);
    setScheduleServiceDialogOpen(true);
  };
  
  const handleAddItem = () => {
    if (!newItem.name || !newItem.price) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome e preço são obrigatórios.",
        variant: "destructive",
      });
      return;
    }
    
    const product: Product = {
      id: products.length + 1,
      name: newItem.name,
      type: newItem.type,
      price: parseFloat(newItem.price),
      description: newItem.description || "",
    };
    
    if (newItem.type === "product") {
      if (newItem.stock) {
        product.stock = parseInt(newItem.stock);
      }
      if (newItem.category) {
        product.category = newItem.category;
      }
    }
    
    if (newItem.type === "service" && newItem.duration) {
      product.duration = parseInt(newItem.duration);
    }
    
    setProducts([...products, product]);
    
    setNewItem({
      name: "",
      type: "service",
      price: "",
      description: "",
      stock: "",
      duration: "30",
      category: "",
    });
    setNewItemDialogOpen(false);
    
    toast({
      title: `${newItem.type === "product" ? "Produto" : "Serviço"} adicionado`,
      description: `${newItem.name} foi adicionado com sucesso.`,
    });
  };

  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case "beer": return <Beer className="h-5 w-5" />;
      case "soda": return <Pizza className="h-5 w-5" />;
      case "water": return <Droplet className="h-5 w-5" />;
      case "coffee": return <Coffee className="h-5 w-5" />;
      case "energy": return <Zap className="h-5 w-5" />;
      default: return <Package className="h-5 w-5" />;
    }
  };
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="header-text">Produtos e Serviços</h1>
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
              onClick={() => setNewItemDialogOpen(true)}
            >
              <Plus size={16} />
              Novo Item
            </Button>
          </div>
        </div>

        <Card className="barber-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Catálogo</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs 
              defaultValue="all"
              onValueChange={(value) => setCurrentTab(value as "all" | "products" | "services" | "beverages")}
            >
              <TabsList className="mb-4">
                <TabsTrigger value="all">Todos</TabsTrigger>
                <TabsTrigger value="services">Serviços</TabsTrigger>
                <TabsTrigger value="products">Produtos</TabsTrigger>
                <TabsTrigger value="beverages">Bebidas</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="space-y-4">
                {filteredProducts.length === 0 ? (
                  <div className="text-center py-8">
                    <p>Nenhum item encontrado.</p>
                  </div>
                ) : (
                  filteredProducts.map((product) => (
                    <ItemCard 
                      key={product.id} 
                      item={product} 
                      onEdit={openEditDialog}
                      onSell={openSellDialog}
                      onSchedule={openScheduleDialog}
                      categoryIcon={getCategoryIcon(product.category)}
                    />
                  ))
                )}
              </TabsContent>
              
              <TabsContent value="services" className="space-y-4">
                {filteredProducts.length === 0 ? (
                  <div className="text-center py-8">
                    <p>Nenhum serviço encontrado.</p>
                  </div>
                ) : (
                  filteredProducts.map((product) => (
                    <ItemCard 
                      key={product.id} 
                      item={product} 
                      onEdit={openEditDialog}
                      onSell={openSellDialog}
                      onSchedule={openScheduleDialog}
                      categoryIcon={getCategoryIcon(product.category)}
                    />
                  ))
                )}
              </TabsContent>
              
              <TabsContent value="products" className="space-y-4">
                {filteredProducts.length === 0 ? (
                  <div className="text-center py-8">
                    <p>Nenhum produto encontrado.</p>
                  </div>
                ) : (
                  filteredProducts.map((product) => (
                    <ItemCard 
                      key={product.id} 
                      item={product} 
                      onEdit={openEditDialog}
                      onSell={openSellDialog}
                      onSchedule={openScheduleDialog}
                      categoryIcon={getCategoryIcon(product.category)}
                    />
                  ))
                )}
              </TabsContent>
              
              <TabsContent value="beverages" className="space-y-4">
                {filteredProducts.length === 0 ? (
                  <div className="text-center py-8">
                    <p>Nenhuma bebida encontrada.</p>
                  </div>
                ) : (
                  filteredProducts.map((product) => (
                    <ItemCard 
                      key={product.id} 
                      item={product} 
                      onEdit={openEditDialog}
                      onSell={openSellDialog}
                      onSchedule={openScheduleDialog}
                      categoryIcon={getCategoryIcon(product.category)}
                    />
                  ))
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      
      <Dialog open={newItemDialogOpen} onOpenChange={setNewItemDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Item</DialogTitle>
            <DialogDescription>
              Preencha os dados do novo produto ou serviço. Campos marcados com * são obrigatórios.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex gap-4 mb-4">
              <Button
                type="button"
                variant={newItem.type === "service" ? "default" : "outline"}
                className="w-1/2"
                onClick={() => updateNewItemField('type', 'service')}
              >
                <Scissors className="mr-2 h-4 w-4" />
                Serviço
              </Button>
              
              <Button
                type="button"
                variant={newItem.type === "product" ? "default" : "outline"}
                className="w-1/2"
                onClick={() => updateNewItemField('type', 'product')}
              >
                <Package className="mr-2 h-4 w-4" />
                Produto
              </Button>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={newItem.name}
                onChange={(e) => updateNewItemField('name', e.target.value)}
                placeholder="Digite o nome"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="price">Preço (R$) *</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={newItem.price}
                onChange={(e) => updateNewItemField('price', e.target.value)}
                placeholder="0,00"
              />
            </div>
            
            {newItem.type === "service" ? (
              <div className="space-y-2">
                <Label htmlFor="duration">Duração (minutos) *</Label>
                <Input
                  id="duration"
                  type="number"
                  min="5"
                  step="5"
                  value={newItem.duration}
                  onChange={(e) => updateNewItemField('duration', e.target.value)}
                  placeholder="30"
                />
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="stock">Estoque</Label>
                  <Input
                    id="stock"
                    type="number"
                    min="0"
                    value={newItem.stock}
                    onChange={(e) => updateNewItemField('stock', e.target.value)}
                    placeholder="Quantidade em estoque"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Select
                    value={newItem.category}
                    onValueChange={(value) => updateNewItemField('category', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Produtos gerais</SelectItem>
                      <SelectItem value="beer">Cervejas</SelectItem>
                      <SelectItem value="soda">Refrigerantes</SelectItem>
                      <SelectItem value="water">Água</SelectItem>
                      <SelectItem value="coffee">Café</SelectItem>
                      <SelectItem value="energy">Energéticos</SelectItem>
                      <SelectItem value="hair">Produtos para cabelo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={newItem.description}
                onChange={(e) => updateNewItemField('description', e.target.value)}
                placeholder="Descrição do item"
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewItemDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddItem} className="btn-primary">
              Adicionar Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={editItemDialogOpen} onOpenChange={setEditItemDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Item</DialogTitle>
            <DialogDescription>
              Edite os dados do produto ou serviço. Campos marcados com * são obrigatórios.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex gap-4 mb-4">
              <Button
                type="button"
                variant={newItem.type === "service" ? "default" : "outline"}
                className="w-1/2"
                disabled
              >
                <Scissors className="mr-2 h-4 w-4" />
                Serviço
              </Button>
              
              <Button
                type="button"
                variant={newItem.type === "product" ? "default" : "outline"}
                className="w-1/2"
                disabled
              >
                <Package className="mr-2 h-4 w-4" />
                Produto
              </Button>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nome *</Label>
              <Input
                id="edit-name"
                value={newItem.name}
                onChange={(e) => updateNewItemField('name', e.target.value)}
                placeholder="Digite o nome"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-price">Preço (R$) *</Label>
              <Input
                id="edit-price"
                type="number"
                min="0"
                step="0.01"
                value={newItem.price}
                onChange={(e) => updateNewItemField('price', e.target.value)}
                placeholder="0,00"
              />
            </div>
            
            {newItem.type === "service" ? (
              <div className="space-y-2">
                <Label htmlFor="edit-duration">Duração (minutos) *</Label>
                <Input
                  id="edit-duration"
                  type="number"
                  min="5"
                  step="5"
                  value={newItem.duration}
                  onChange={(e) => updateNewItemField('duration', e.target.value)}
                  placeholder="30"
                />
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="edit-stock">Estoque</Label>
                  <Input
                    id="edit-stock"
                    type="number"
                    min="0"
                    value={newItem.stock}
                    onChange={(e) => updateNewItemField('stock', e.target.value)}
                    placeholder="Quantidade em estoque"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-category">Categoria</Label>
                  <Select
                    value={newItem.category}
                    onValueChange={(value) => updateNewItemField('category', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Produtos gerais</SelectItem>
                      <SelectItem value="beer">Cervejas</SelectItem>
                      <SelectItem value="soda">Refrigerantes</SelectItem>
                      <SelectItem value="water">Água</SelectItem>
                      <SelectItem value="coffee">Café</SelectItem>
                      <SelectItem value="energy">Energéticos</SelectItem>
                      <SelectItem value="hair">Produtos para cabelo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="edit-description">Descrição</Label>
              <Textarea
                id="edit-description"
                value={newItem.description}
                onChange={(e) => updateNewItemField('description', e.target.value)}
                placeholder="Descrição do item"
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditItemDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditItem} className="btn-primary">
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={sellProductDialogOpen} onOpenChange={setSellProductDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Vender Produto</DialogTitle>
            <DialogDescription>
              Insira a quantidade de unidades para vender.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="p-4 border rounded-md">
              <div className="font-medium">{selectedProduct?.name}</div>
              <div className="text-sm text-muted-foreground mt-1">{selectedProduct?.description}</div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm font-medium">Preço: </span>
                <span>R$ {selectedProduct?.price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-sm font-medium">Estoque disponível: </span>
                <span>{selectedProduct?.stock} unidades</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantidade</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                max={selectedProduct?.stock}
                value={newItem.stock}
                onChange={(e) => updateNewItemField('stock', e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setSellProductDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSellProduct} className="btn-primary">
              Confirmar Venda
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={scheduleServiceDialogOpen} onOpenChange={setScheduleServiceDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Agendar Serviço</DialogTitle>
            <DialogDescription>
              Confirme o serviço para agendar.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="p-4 border rounded-md">
              <div className="font-medium">{selectedProduct?.name}</div>
              <div className="text-sm text-muted-foreground mt-1">{selectedProduct?.description}</div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm font-medium">Preço: </span>
                <span>R$ {selectedProduct?.price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-sm font-medium">Duração: </span>
                <span>{selectedProduct?.duration} minutos</span>
              </div>
            </div>
            
            <div className="text-center text-sm">
              <p>Clique em "Agendar" para ir para a tela de agendamentos</p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setScheduleServiceDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleScheduleService} className="btn-primary">
              Agendar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

interface ItemCardProps {
  item: Product;
  onEdit: (item: Product) => void;
  onSell: (item: Product) => void;
  onSchedule: (item: Product) => void;
  categoryIcon: React.ReactNode;
}

function ItemCard({ 
  item, 
  onEdit, 
  onSell, 
  onSchedule,
  categoryIcon
}: ItemCardProps) {
  return (
    <div className="border rounded-md p-4 hover:bg-secondary/20 transition-colors">
      <div className="flex justify-between">
        <div>
          <div className="flex items-center">
            <div className={`p-2 rounded-md mr-3 ${
              item.type === "service" ? 'bg-blue-100 text-blue-700' : 
              item.category === "beer" ? 'bg-yellow-100 text-yellow-700' :
              item.category === "soda" ? 'bg-red-100 text-red-700' :
              item.category === "water" ? 'bg-blue-100 text-blue-700' :
              item.category === "coffee" ? 'bg-amber-100 text-amber-700' :
              item.category === "energy" ? 'bg-purple-100 text-purple-700' :
              'bg-amber-100 text-amber-700'
            }`}>
              {item.type === "service" ? (
                <Scissors className="h-5 w-5" />
              ) : categoryIcon}
            </div>
            
            <div>
              <h3 className="font-medium">{item.name}</h3>
              <div className="flex items-center">
                <Tag size={14} className="mr-1 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {item.type === "service" ? "Serviço" : 
                   item.category === "beer" ? "Cervejas" :
                   item.category === "soda" ? "Refrigerantes" :
                   item.category === "water" ? "Água" :
                   item.category === "coffee" ? "Café" :
                   item.category === "energy" ? "Energéticos" :
                   "Produto"}
                </span>
              </div>
            </div>
          </div>
          
          <p className="text-sm mt-2">{item.description}</p>
          
          {item.type === "service" && item.duration && (
            <div className="mt-2 text-sm">
              <span className="font-medium">Duração:</span> {item.duration} minutos
            </div>
          )}
          
          {item.type === "product" && item.stock !== undefined && (
            <div className="mt-2 text-sm">
              <span className="font-medium">Estoque:</span> {item.stock} unidades
            </div>
          )}
        </div>
        
        <div className="text-right">
          <div className="text-lg font-bold">
            R$ {item.price.toFixed(2)}
          </div>
          
          <div className="mt-4 space-x-2">
            <Button variant="outline" size="sm" onClick={() => onEdit(item)}>
              Editar
            </Button>
            {item.type === "service" ? (
              <Button className="btn-primary" size="sm" onClick={() => onSchedule(item)}>
                Agendar
              </Button>
            ) : (
              <Button className="btn-primary" size="sm" onClick={() => onSell(item)}>
                Vender
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

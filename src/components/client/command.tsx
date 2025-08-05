
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Pizza, Beer, Coffee, Droplet, Zap, Plus, Minus, ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface CommandItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
}

export interface Command {
  id: string;
  clientId: string;
  clientName: string;
  appointmentId?: string;
  items: CommandItem[];
  total: number;
  status: 'open' | 'closed' | 'paid';
  createdAt: Date;
  closedAt?: Date;
}

interface ClientCommandProps {
  clientId: string;
  clientName: string;
  appointmentId?: string;
  onCommandUpdate?: (command: Command) => void;
  highlightCommand?: boolean;
}

const productCategories = [
  {
    name: "Bebidas",
    icon: <Pizza className="h-5 w-5" />,
    products: [
      { id: "soda-1", name: "Coca Cola", price: 5.0, category: "sodas" },
      { id: "soda-2", name: "Pepsi", price: 5.0, category: "sodas" },
      { id: "soda-3", name: "Guaraná", price: 5.0, category: "sodas" },
    ]
  },
  {
    name: "Cervejas",
    icon: <Beer className="h-5 w-5" />,
    products: [
      { id: "beer-1", name: "Heineken", price: 10.0, category: "beers" },
      { id: "beer-2", name: "Original", price: 9.0, category: "beers" },
      { id: "beer-3", name: "Brahma", price: 8.0, category: "beers" },
    ]
  },
  {
    name: "Café",
    icon: <Coffee className="h-5 w-5" />,
    products: [
      { id: "coffee-1", name: "Espresso", price: 4.0, category: "coffee" },
      { id: "coffee-2", name: "Cappuccino", price: 7.0, category: "coffee" },
    ]
  },
  {
    name: "Água",
    icon: <Droplet className="h-5 w-5" />,
    products: [
      { id: "water-1", name: "Água sem gás", price: 3.0, category: "water" },
      { id: "water-2", name: "Água com gás", price: 4.0, category: "water" },
    ]
  },
  {
    name: "Energético",
    icon: <Zap className="h-5 w-5" />,
    products: [
      { id: "energy-1", name: "Red Bull", price: 15.0, category: "energy" },
      { id: "energy-2", name: "Monster", price: 14.0, category: "energy" },
    ]
  },
];

export function ClientCommand({ clientId, clientName, appointmentId, onCommandUpdate, highlightCommand = false }: ClientCommandProps) {
  const { toast } = useToast();
  const [command, setCommand] = useState<Command>({
    id: `cmd-${Date.now()}`,
    clientId,
    clientName,
    appointmentId,
    items: [],
    total: 0,
    status: 'open',
    createdAt: new Date()
  });
  
  const handleAddItem = (product: { id: string; name: string; price: number; category: string }) => {
    setCommand(prev => {
      // Check if the item is already in the command
      const existingItemIndex = prev.items.findIndex(item => item.id === product.id);
      
      let updatedItems = [...prev.items];
      if (existingItemIndex >= 0) {
        // Increment existing item quantity
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + 1
        };
      } else {
        // Add new item
        updatedItems.push({
          ...product,
          quantity: 1
        });
      }
      
      // Calculate total
      const total = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      const updatedCommand = {
        ...prev,
        items: updatedItems,
        total
      };
      
      if (onCommandUpdate) {
        onCommandUpdate(updatedCommand);
      }
      
      toast({
        title: "Produto adicionado",
        description: `${product.name} adicionado à comanda.`,
      });
      
      return updatedCommand;
    });
  };
  
  const handleRemoveItem = (itemId: string) => {
    setCommand(prev => {
      const existingItemIndex = prev.items.findIndex(item => item.id === itemId);
      
      if (existingItemIndex < 0) return prev;
      
      let updatedItems = [...prev.items];
      if (updatedItems[existingItemIndex].quantity > 1) {
        // Decrement quantity
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity - 1
        };
      } else {
        // Remove item completely
        updatedItems = updatedItems.filter(item => item.id !== itemId);
      }
      
      // Calculate total
      const total = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      const updatedCommand = {
        ...prev,
        items: updatedItems,
        total
      };
      
      if (onCommandUpdate) {
        onCommandUpdate(updatedCommand);
      }
      
      return updatedCommand;
    });
  };
  
  const getCommandReport = () => {
    const report = {
      commandId: command.id,
      clientName: command.clientName,
      date: command.createdAt.toLocaleString('pt-BR'),
      items: command.items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity
      })),
      total: command.total
    };
    
    return report;
  };
  
  return (
    <div className="space-y-6">
      <Card className={`barber-card ${highlightCommand ? 'border-2 border-barber-gold' : ''}`}>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Comanda Digital
              <Badge variant={command.status === 'open' ? 'default' : command.status === 'closed' ? 'secondary' : 'outline'}>
                {command.status === 'open' ? 'Aberta' : command.status === 'closed' ? 'Fechada' : 'Paga'}
              </Badge>
            </CardTitle>
            <div className="text-xl font-bold">
              #{command.id.substring(4, 8).toUpperCase()}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="mb-3 font-medium">Adicionar produtos:</h3>
              
              <div className="space-y-4">
                {productCategories.map((category) => (
                  <div key={category.name} className="border rounded-md p-3">
                    <div className="flex items-center gap-2 mb-2">
                      {category.icon}
                      <h4 className="font-medium">{category.name}</h4>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {category.products.map((product) => (
                        <div 
                          key={product.id} 
                          className="flex justify-between items-center border rounded p-2 hover:bg-secondary/10 transition cursor-pointer"
                          onClick={() => handleAddItem(product)}
                        >
                          <span>{product.name}</span>
                          <div className="flex items-center gap-1">
                            <span className="font-medium">R$ {product.price.toFixed(2)}</span>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {command.items.length > 0 && (
              <div>
                <h3 className="mb-3 font-medium">Itens na comanda:</h3>
                <div className="border rounded-md divide-y">
                  {command.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-3">
                      <div>
                        <span className="font-medium">{item.name}</span>
                        <p className="text-sm text-muted-foreground">
                          R$ {item.price.toFixed(2)} x {item.quantity}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium mr-2">
                          R$ {(item.price * item.quantity).toFixed(2)}
                        </span>
                        <div className="flex items-center">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-7 w-7" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveItem(item.id);
                            }}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="mx-1">{item.quantity}</span>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddItem({
                                id: item.id,
                                name: item.name,
                                price: item.price,
                                category: item.category
                              });
                            }}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <div className="p-3 bg-muted/20">
                    <div className="flex justify-between items-center">
                      <span className="font-bold">Total:</span>
                      <span className="font-bold">R$ {command.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {command.total > 0 && (
              <div className="mt-4 p-4 border rounded-md bg-blue-50">
                <h4 className="font-bold text-blue-700 mb-2">Relatório da Comanda</h4>
                <div className="text-sm space-y-1">
                  <div><strong>ID:</strong> #{command.id.substring(4, 8).toUpperCase()}</div>
                  <div><strong>Cliente:</strong> {command.clientName}</div>
                  <div><strong>Data:</strong> {command.createdAt.toLocaleString('pt-BR')}</div>
                  <div><strong>Total:</strong> R$ {command.total.toFixed(2)}</div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

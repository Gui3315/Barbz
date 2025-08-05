
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useIsMobile } from "@/hooks/use-mobile";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const isMobile = useIsMobile();
  
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div>
        <h1 className="header-text">{title}</h1>
        {subtitle && (
          <p className="text-muted-foreground">{subtitle}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              size="icon"
              className="relative"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-0.5 right-0.5 w-2.5 h-2.5 bg-barber-red rounded-full border-2 border-white" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Notificações</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex flex-col items-start gap-1">
              <span className="font-medium">Novo agendamento</span>
              <span className="text-sm text-muted-foreground">Carlos Silva - Hoje, 14:30</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex flex-col items-start gap-1">
              <span className="font-medium">Aniversário de cliente</span>
              <span className="text-sm text-muted-foreground">Pedro Alves faz aniversário hoje</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-center">Ver todas</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Button className="btn-primary">
          Novo agendamento
        </Button>
      </div>
    </div>
  );
}

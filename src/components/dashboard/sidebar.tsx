
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Users,
  DollarSign,
  Settings,
  BarChart2,
  Menu,
  X,
  MessageSquare,
  Bell,
  Star,
  Package,
  FileText,
  Clock
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const navItems = [
  {
    title: "Agendamentos",
    icon: <Calendar className="h-5 w-5" />,
    href: "/agendamentos",
  },
  {
    title: "Meu Estabelecimento",
    icon: <Package className="h-5 w-5" />,
    href: "/Meuestabelecimento",
  },
  {
    title: "Financeiro",
    icon: <DollarSign className="h-5 w-5" />,
    href: "/financeiro",
  },
  {
    title: "Mensagens",
    icon: <MessageSquare className="h-5 w-5" />,
    href: "/mensagens",
  },
  {
    title: "Fidelidade",
    icon: <Star className="h-5 w-5" />,
    href: "/fidelidade",
  },
  {
    title: "Funcionamento",
    icon: <Clock className="h-5 w-5" />,
    href: "/funcionamento",
  },
  {
    title: "Configurações",
    icon: <Settings className="h-5 w-5" />,
    href: "/configuracoes",
  },
  {
    title: "Logs de Atividades",
    icon: <FileText className="h-5 w-5" />,
    href: "/logs-atividades",
  },
];

export function Sidebar() {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {isMobile && (
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-50"
        >
          <Menu className="h-6 w-6" />
        </Button>
      )}
      <div
        className={cn(
          "fixed h-full bg-white dark:bg-barber-DEFAULT border-r border-border transition-all duration-300 z-40",
          isMobile ? (isOpen ? "left-0" : "-left-64") : "left-0",
          "shadow-barber flex flex-col w-64"
        )}
      >
        {isMobile && (
          <Button
            size="icon"
            onClick={toggleSidebar}
            className="absolute top-4 right-4"
          >
            <X className="h-5 w-5" />
          </Button>
        )}
        <div className="p-6">
          <Logo />
        </div>
        <div className="px-3 flex-1">
          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "nav-item",
                  location.pathname === item.href && "active"
                )}
                onClick={() => isMobile && setIsOpen(false)}
              >
                {item.icon}
                <span className="ml-3">{item.title}</span>
              </Link>
            ))}
          </nav>
        </div>
        <div className="p-4 border-t border-border flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-barber-light flex items-center justify-center text-white">
              JD
            </div>
            <div className="ml-2">
              <p className="text-sm font-medium">João Barber</p>
              <p className="text-xs text-muted-foreground">Proprietário</p>
            </div>
          </div>
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
        </div>
      </div>
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}

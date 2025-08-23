
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/logo";
import { supabase } from "@/lib/supabaseClient";
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
  Clock,
  Scissors,
  ScissorsIcon,
  ScissorsLineDashed,
  ScissorsSquare
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const navItems = [
  {
    title: "Agendamentos",
    icon: <Calendar className="h-5 w-5" />,
    href: "/agendamentos",
  },
  {
    title: "Minha Barbearia",
    icon: <Scissors className="h-5 w-5" />,
    href: "/Meuestabelecimento",
  },
  {
    title: "Configurações",
    icon: <Settings className="h-5 w-5" />,
    href: "/configuracoes",
  },
];

export function Sidebar() {

  const location = useLocation();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  const [userName, setUserName] = useState<string>("");
  const [userRole, setUserRole] = useState<string>("");
  const [logoUrl, setLogoUrl] = useState<string>("");

  useEffect(() => {
    async function fetchProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("user_name, user_type, logo_url")
        .eq("id", user.id)
        .single();
      if (profile) {
        setUserName(profile.user_name || "Usuário");
        setUserRole(profile.user_type || "");
        setLogoUrl(profile.logo_url || "");
      }
    }
    fetchProfile();
  }, []);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {isMobile && !isOpen && (
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
        <div className="p-4 border-t border-border flex items-center">
          <div className="flex items-center">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="Logo do usuário"
                className="w-8 h-8 rounded-full object-cover bg-barber-light"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-barber-light flex items-center justify-center text-white">
                {userName ? userName.split(" ").map(n => n[0]).join("").slice(0,2).toUpperCase() : "U"}
              </div>
            )}
            <div className="ml-2">
              <p className="text-sm font-medium">{userName || "Usuário"}</p>
              <p className="text-xs text-muted-foreground">{userRole && userRole.toLowerCase() === "proprietario" ? "Proprietário" : userRole}</p>
            </div>
          </div>
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

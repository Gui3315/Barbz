
import { ReactNode } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Calendar, User, BarChart3, Settings, LogOut } from "lucide-react";
import { Logo } from "@/components/ui/logo";

interface DashboardLayoutProps {
  children: ReactNode;
}

interface ClientLayoutProps {
  children: ReactNode
}

export function ClientLayout({ children }: ClientLayoutProps) {
  return <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-amber-50/20">{children}</div>
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  // Não exibir header customizado em /login ou / (landing)
  const hideHeader = location.pathname === "/login" || location.pathname === "/";

  const handleLogout = async () => {
    await logout();
    navigate("/landing");
  };

      return (
        <div className="h-screen flex flex-col bg-background">
      <div className="flex h-screen bg-background">
        <div className="flex flex-col h-full">
          <Sidebar />
        </div>
        <main
          className={cn(
            "flex-1 overflow-y-auto p-4 sm:p-6 transition-all",
            isMobile ? "ml-0" : "ml-64"
          )}
        >
          <div className="flex justify-end items-start w-full">
            <Button
              variant="outline"
              onClick={handleLogout}
              className="bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-all mt-4 mr-4"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
        </div>
  );
}

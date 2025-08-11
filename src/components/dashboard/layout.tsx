
import { ReactNode } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  // Não exibir botão de sair em /login ou / (landing)
  const hideLogout = location.pathname === "/login" || location.pathname === "/";

  const handleLogout = async () => {
    await logout();
    navigate("/landing");
  };

  return (
    <div className="h-screen flex bg-background">
      <Sidebar />
      <main 
        className={cn(
          "flex-1 overflow-y-auto p-4 sm:p-6 transition-all",
          isMobile ? "ml-0" : "ml-64"
        )}
      >
        <div className="max-w-6xl mx-auto">
          {!hideLogout && (
            <div className="mb-4 flex justify-end">
              <div className="bg-white/80 border border-gray-200 rounded-lg shadow px-3 py-2 flex items-center">
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  Sair
                </Button>
              </div>
            </div>
          )}
          {children}
        </div>
      </main>
    </div>
  );
}

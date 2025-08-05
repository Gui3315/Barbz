
import { ReactNode } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const isMobile = useIsMobile();
  
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
          {children}
        </div>
      </main>
    </div>
  );
}

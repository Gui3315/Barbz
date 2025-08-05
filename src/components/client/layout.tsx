
import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Logo } from "@/components/ui/logo";

interface ClientLayoutProps {
  children: ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white dark:bg-barber-DEFAULT shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/">
            <Logo />
          </Link>
        </div>
      </header>
      
      <main>
        {children}
      </main>
      
      <footer className="border-t mt-12 py-6 bg-white dark:bg-barber-DEFAULT">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <Logo />
              <p className="text-sm text-muted-foreground mt-2">
                © 2025 BarberApp. Todos os direitos reservados.
              </p>
            </div>
            
            <div className="flex space-x-4">
              <Link to="#" className="text-sm text-muted-foreground hover:text-barber-gold">
                Termos de Uso
              </Link>
              <Link to="#" className="text-sm text-muted-foreground hover:text-barber-gold">
                Política de Privacidade
              </Link>
              <Link to="#" className="text-sm text-muted-foreground hover:text-barber-gold">
                Ajuda
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}


import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="w-full max-w-md text-center space-y-6">
        <Logo size="lg" className="mx-auto" />
        <div>
          <h1 className="text-4xl font-bold mb-4 text-barber-DEFAULT">404</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Página não encontrada
          </p>
          <Button asChild className="btn-primary">
            <a href="/">Voltar ao início</a>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;

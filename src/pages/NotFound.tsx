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
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      {/* Header */}
      <header className="bg-white/100 backdrop-blur-md border-b border-slate-200/60 py-2 px-0 sticky top-0 z-50 w-full">
        <div className="w-full flex flex-row items-center gap-1 sm:gap-2 pl-5 md:pl-8 lg:pl-12">
          <Logo className="h-8 sm:h-10 mr-1" />
        </div>
      </header>

      {/* 404 Section */}
      <section className="flex flex-1 items-center justify-center px-4">
        <div className="w-full max-w-md text-center space-y-8">
          <div>
            <h1 className="text-7xl md:text-8xl font-black tracking-tight leading-tight bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent mb-4">
              404
            </h1>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              Página não encontrada
            </h2>
            <p className="text-lg md:text-xl text-slate-300 mb-8">
              O endereço acessado não existe ou foi removido.
            </p>
          </div>
          <Button asChild className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-500/25 px-6 py-3 text-lg font-semibold">
            <a href="/">Voltar ao início</a>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default NotFound;
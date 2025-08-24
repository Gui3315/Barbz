
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/AuthContext";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { registerSW } from 'virtual:pwa-register';
import { useEffect } from 'react';
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Landing from "./pages/Landing";
import Agendamentos from "./pages/Agendamentos";
import Configuracoes from "./pages/Configuracoes";
import Cliente from "./pages/Cliente";
import Produtos from "./pages/Meuestabelecimento";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import CreatePassword from "./pages/CreatePassword";


const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
  const updateSW = registerSW({
    onNeedRefresh() {
      updateSW(true); // Atualiza imediatamente sem perguntar
    },
    onOfflineReady() {},
  });
}, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/agendamentos" element={<ProtectedRoute allowed="proprietario"><Agendamentos /></ProtectedRoute>} />
              <Route path="/login" element={<Login />} />
              <Route path="/agendamentos" element={<Agendamentos />} />
              <Route path="/Meuestabelecimento" element={<Produtos />} />
              <Route path="/configuracoes" element={<Configuracoes />} />
              <Route path="/cliente" element={<ProtectedRoute allowed="cliente"><Cliente /></ProtectedRoute>} />
              <Route path="/createpassword" element={<CreatePassword />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;

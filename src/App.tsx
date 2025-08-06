
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Landing from "./pages/Landing";
import Agendamentos from "./pages/Agendamentos";
import Clientes from "./pages/Proprietario";
import Financeiro from "./pages/Financeiro";
import Mensagens from "./pages/Mensagens";
import Fidelidade from "./pages/Fidelidade";
import Configuracoes from "./pages/Configuracoes";
import Cliente from "./pages/Cliente";
import Produtos from "./pages/Produtos";
import Comandas from "./pages/Comandas";
import LogsAtividades from "./pages/LogsAtividades";
import Proprietario from "./pages/Proprietario";
import { ProtectedRoute } from "@/components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/agendamentos" element={<Agendamentos />} />
          {/* Removido /clientes, dashboard do proprietário acessível apenas por /areadoproprietario */}
          <Route path="/financeiro" element={<Financeiro />} />
          <Route path="/produtos" element={<Produtos />} />
          <Route path="/comandas" element={<Comandas />} />
          <Route path="/mensagens" element={<Mensagens />} />
          <Route path="/fidelidade" element={<Fidelidade />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
          <Route path="/logs-atividades" element={<LogsAtividades />} />
          <Route path="/cliente" element={<Cliente />} />
          <Route path="/proprietario" element={<ProtectedRoute allowed="proprietario"><Proprietario /></ProtectedRoute>} />
          <Route path="/areadoproprietario" element={<ProtectedRoute allowed="proprietario"><Proprietario /></ProtectedRoute>} />
          <Route path="/cliente" element={<ProtectedRoute allowed="cliente"><Cliente /></ProtectedRoute>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

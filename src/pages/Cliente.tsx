
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Link } from "react-router-dom";
import { ClientLayout } from "@/components/client/layout";
import ClientBooking from "@/components/client/booking";
import { ClientLoyalty } from "@/components/client/loyalty";
import { ClientProfile } from "@/components/client/profile";
import { ClientCommand } from "@/components/client/command";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, User, Star, ShoppingBag } from "lucide-react";

export default function Cliente() {
  const [activeTab, setActiveTab] = useState("agendamento");
  const [hasCommand, setHasCommand] = useState(false);
  const [commandId, setCommandId] = useState(`cmd-${Date.now()}`);
  const [clientData, setClientData] = useState<any>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchClientAndProfile() {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setClientData(null);
        setProfileData(null);
        setLoading(false);
        return;
      }
      const [{ data: client }, { data: profile }] = await Promise.all([
        supabase.from("clients").select("*").eq("user_id", user.id).single(),
        supabase.from("profiles").select("user_name").eq("id", user.id).single(),
      ]);
      setClientData(client || null);
      setProfileData(profile || null);
      setLoading(false);
    }
    fetchClientAndProfile();
  }, []);

  return (
    <ClientLayout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">
            {loading
              ? "Carregando..."
              : profileData && profileData.user_name
                ? `Olá, ${profileData.user_name}!`
                : "Olá!"}
          </h1>
          <Link 
            to="/landing" 
            className="text-sm text-muted-foreground hover:text-barber-gold transition-colors"
          >
            Sair
          </Link>
        </div>

        {hasCommand && clientData && (
          <div className="my-6">
            <ClientCommand 
              clientId={clientData.id} 
              clientName={clientData.name} 
              highlightCommand={true}
            />
          </div>
        )}

        <Tabs 
          defaultValue="agendamento"
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="w-full grid grid-cols-4">
            <TabsTrigger value="agendamento" className="flex gap-2 items-center">
              <Calendar size={16} />
              <span>Agendamento</span>
            </TabsTrigger>
            <TabsTrigger value="fidelidade" className="flex gap-2 items-center">
              <Star size={16} />
              <span>Fidelidade</span>
            </TabsTrigger>
            <TabsTrigger value="produtos" className="flex gap-2 items-center">
              <ShoppingBag size={16} />
              <span>Produtos</span>
            </TabsTrigger>
            <TabsTrigger value="perfil" className="flex gap-2 items-center">
              <User size={16} />
              <span>Perfil</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="agendamento">
            <ClientBooking onBookingComplete={() => {
              setHasCommand(true);
              setCommandId(`cmd-${Date.now()}`);
            }} />
          </TabsContent>

          <TabsContent value="fidelidade">
            <ClientLoyalty />
          </TabsContent>

          <TabsContent value="produtos">
            {!hasCommand ? (
              <div className="text-center py-8 space-y-4">
                <p>Você precisa ter um agendamento para adicionar produtos.</p>
                <p className="text-sm text-muted-foreground">
                  Faça um agendamento para criar uma comanda digital e adicionar produtos.
                </p>
              </div>
            ) : (
              clientData && (
                <ClientCommand 
                  clientId={clientData.id} 
                  clientName={clientData.name}
                />
              )
            )}
          </TabsContent>

          <TabsContent value="perfil">
            <ClientProfile />
          </TabsContent>
        </Tabs>
      </div>
    </ClientLayout>
  );
}

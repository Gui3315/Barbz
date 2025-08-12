
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
  // Campos editáveis do perfil do cliente
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");

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
      // Buscar todos os dados relevantes do perfil do cliente
      const [{ data: client, error: clientError }, { data: profile, error: profileError }] = await Promise.all([
        supabase.from("clients").select("*").eq("user_id", user.id).single(),
        supabase.from("profiles").select("id, user_name, email, phone, profile_photo_url").match({ id: user.id, user_type: "cliente" }).single(),
      ]);
      console.log("[CLIENTE] user:", user);
      console.log("[CLIENTE] client:", client, clientError);
      console.log("[CLIENTE] profile:", profile, profileError);
      setClientData(client || null);
      setProfileData(profile || null);
      // Preencher campos editáveis
      setClientName(profile?.user_name || "");
      setClientEmail(profile?.email || "");
      setClientPhone(profile?.phone || "");
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
              : (profileData && typeof profileData === 'object' && ('user_name' in profileData) && profileData.user_name)
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

          <TabsContent value="perfil">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex flex-col items-center">
                {/* Foto de perfil */}
                {profileData && profileData.profile_photo_url ? (
                  <img
                    src={profileData.profile_photo_url}
                    alt="Foto de perfil"
                    className="w-36 h-36 rounded-full object-cover border-2 border-barber-gold mb-4"
                  />
                ) : (
                  <div className="w-36 h-36 rounded-full border-2 border-barber-gold flex items-center justify-center bg-gray-100 mb-4 text-4xl text-gray-400">
                    <span>+</span>
                  </div>
                )}
                {/* Upload de foto de perfil */}
                <label className="block">
                  {/* Usando ref para acessar o input de arquivo de forma segura */}
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    ref={input => (window as any)._profilePhotoInput = input}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setLoading(true);
                      // Buscar id do usuário logado
                      const { data: { user } } = await supabase.auth.getUser();
                      if (!user) {
                        setLoading(false);
                        alert('Usuário não autenticado.');
                        return;
                      }
                      const fileExt = file.name.split('.').pop();
                      const fileName = `profile-photo-${user.id}-${Date.now()}.${fileExt}`;
                      const { data, error } = await supabase.storage
                        .from('profile-photos')
                        .upload(fileName, file, { upsert: true, contentType: file.type });
                      if (error) {
                        alert('Erro ao fazer upload da foto.');
                        setLoading(false);
                        return;
                      }
                      const { data: publicUrlData } = supabase.storage
                        .from('profile-photos')
                        .getPublicUrl(fileName);
                      const publicUrl = publicUrlData?.publicUrl;
                      if (publicUrl) {
                        await supabase.from('profiles').update({ profile_photo_url: publicUrl }).eq('id', user.id);
                        setProfileData((prev: any) => ({ ...prev, profile_photo_url: publicUrl }));
                      }
                      setLoading(false);
                    }}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="px-4 py-2 bg-barber-gold text-white rounded hover:bg-barber-gold-dark transition"
                    onClick={() => {
                      const input = (window as any)._profilePhotoInput as HTMLInputElement | null;
                      input?.click();
                    }}
                    disabled={loading}
                  >
                    {profileData && profileData.profile_photo_url ? 'Alterar foto' : 'Adicionar foto'}
                  </button>
                </label>
              </div>
              <div className="flex-1">
                <div className="space-y-4">
                  <div>
                    <label className="font-semibold" htmlFor="userName">Nome completo</label>
                  <input
                    id="userName"
                    className="input w-full"
                    value={clientName}
                    onChange={e => setClientName(e.target.value)}
                    disabled={loading}
                  />
                  </div>
                  <div>
                    <label className="font-semibold" htmlFor="email">E-mail</label>
                  <input
                    id="email"
                    className="input w-full"
                    value={clientEmail}
                    onChange={e => setClientEmail(e.target.value)}
                    disabled={loading}
                  />
                  </div>
                  <div>
                    <label className="font-semibold" htmlFor="phone">Telefone</label>
                  <input
                    id="phone"
                    className="input w-full"
                    value={clientPhone}
                    onChange={e => setClientPhone(e.target.value)}
                    disabled={loading}
                  />
                  </div>
                  <button
                    className="px-4 py-2 bg-barber-gold text-white rounded hover:bg-barber-gold-dark transition mt-4"
                    disabled={loading}
                    onClick={async () => {
                      if (!profileData) return;
                      setLoading(true);
                      await supabase.from('profiles').update({
                        user_name: clientName,
                        email: clientEmail,
                        phone: clientPhone
                      }).eq('id', profileData.id);
                      setLoading(false);
                      alert('Perfil atualizado com sucesso!');
                    }}
                  >Salvar Alterações</button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </ClientLayout>
  );
}

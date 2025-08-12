import { DashboardLayout } from "@/components/dashboard/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Camera, Clock, Paintbrush, Save, User, Wrench, Plus } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function Configuracoes() {
  async function handleSaveSettings() {
    setLoading(true);
    if (!profileId) return;
    const updates = {
      id: profileId,
      business_name: barberShopName,
      user_name: ownerName,
      email,
      phone,
      address,
      city,
      state,
      cep,
      cnpj,
      logo_url: logoUrl,
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase.from("profiles").upsert(updates);
    setLoading(false);
    if (!error) {
      alert("Informações salvas com sucesso!");
    } else {
      alert("Erro ao salvar informações.");
    }
  }
  const [barberShopName, setBarberShopName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [cep, setCep] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [logoUrl, setLogoUrl] = useState("/placeholder.svg");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileId, setProfileId] = useState<string | null>(null);
  // Fetch profile data from Supabase
  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      setProfileId(user.id);
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, business_name, user_name, phone, email, address, city, state, cep, created_at, updated_at, user_type, cnpj, logo_url")
        .eq("id", user.id)
        .single();
      if (profile) {
        setBarberShopName(profile.business_name || "");
        setOwnerName(profile.user_name || "");
        setEmail(profile.email || "");
        setPhone(profile.phone || "");
        setAddress(profile.address || "");
        setCity(profile.city || "");
        setState(profile.state || "");
        setCep(profile.cep || "");
        setCnpj(profile.cnpj || "");
        setLogoUrl(profile.logo_url || "/placeholder.svg");
      }
      setLoading(false);
    }
    fetchProfile();
  }, []);

  // Função para upload do logo
  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !profileId) return;
    setLoading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `logo-${profileId}-${Date.now()}.${fileExt}`;
    const { data, error } = await supabase.storage
      .from('saloon-logos')
      .upload(fileName, file, { upsert: true, contentType: file.type });
    if (error) {
      alert('Erro ao fazer upload do logo.');
      setLoading(false);
      return;
    }
    // Gerar URL pública
    const { data: publicUrlData } = supabase.storage
      .from('saloon-logos')
      .getPublicUrl(fileName);
    const publicUrl = publicUrlData?.publicUrl;
    if (publicUrl) {
      setLogoUrl(publicUrl);
      // Atualiza logo_url no perfil
      await supabase.from('profiles').update({ logo_url: publicUrl }).eq('id', profileId);
    }
    setLoading(false);
  }

  function handleLogoButtonClick() {
    fileInputRef.current?.click();
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="header-text">Configurações</h1>
          <Button className="btn-primary gap-2" onClick={handleSaveSettings}>
            <Save size={16} />
            Salvar Alterações
          </Button>
        </div>
        <Tabs defaultValue="profile">
          <TabsContent value="profile">
            <Card className="barber-card">
              <CardHeader>
                <CardTitle>Informações da Barbearia</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="w-full md:w-2/3 space-y-4">
                    <div>
                      <Label htmlFor="barberShopName">Nome da Barbearia</Label>
                      <Input 
                        id="barberShopName" 
                        value={barberShopName} 
                        onChange={(e) => setBarberShopName(e.target.value)}
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <Label htmlFor="ownerName">Nome do Proprietário</Label>
                      <Input 
                        id="ownerName" 
                        value={ownerName} 
                        onChange={(e) => setOwnerName(e.target.value)}
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        type="email"
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                      />
                      <Label htmlFor="address">Endereço</Label>
                      <Input 
                        id="address" 
                        value={address} 
                        onChange={(e) => setAddress(e.target.value)}
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <Label htmlFor="city">Cidade</Label>
                      <Input 
                        id="city" 
                        value={city} 
                        onChange={(e) => setCity(e.target.value)}
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">Estado</Label>
                      <Input 
                        id="state" 
                        value={state} 
                        onChange={(e) => setState(e.target.value)}
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <Label htmlFor="cep">CEP</Label>
                      <Input 
                        id="cep" 
                        value={cep} 
                        onChange={(e) => setCep(e.target.value)}
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <Label htmlFor="cnpj">CNPJ</Label>
                      <Input 
                        id="cnpj" 
                        value={cnpj} 
                        onChange={(e) => setCnpj(e.target.value)}
                        disabled={loading}
                      />
                    </div>
                  </div>
                  <div className="w-full md:w-1/3">
                    <div>
                      <Label>Logo da Barbearia</Label>
                      <div className="mt-2 border-2 border-dashed rounded-md p-6 flex flex-col items-center">
                        <img 
                          src={logoUrl} 
                          alt="Logo da barbearia" 
                          className="w-32 h-32 object-contain mb-4"
                        />
                        <input
                          type="file"
                          accept="image/*"
                          ref={fileInputRef}
                          style={{ display: 'none' }}
                          onChange={handleLogoChange}
                          disabled={loading}
                        />
                        <Button variant="outline" className="gap-2" onClick={handleLogoButtonClick} disabled={loading}>
                          <Camera size={16} />
                          Alterar Logo
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
// Fim do componente principal

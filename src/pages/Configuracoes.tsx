"use client"

import type React from "react"

import { DashboardLayout } from "@/components/dashboard/layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Camera, Save, User, Lock } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { supabase } from "@/lib/supabaseClient"

export default function Configuracoes() {
  async function handleSaveSettings() {
    setLoading(true)
    if (!profileId) return
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
      logo_url: logoUrl,
      updated_at: new Date().toISOString(),
    }
    const { error } = await supabase.from("profiles").upsert(updates)
    setLoading(false)
    if (!error) {
      alert("Informações salvas com sucesso!")
    } else {
      alert("Erro ao salvar informações.")
    }
  }
  const [barberShopName, setBarberShopName] = useState("")
  const [ownerName, setOwnerName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")
  const [state, setState] = useState("")
  const [cep, setCep] = useState("")
  const [cnpj, setCnpj] = useState("")
  const [logoUrl, setLogoUrl] = useState("/placeholder.svg")
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [loading, setLoading] = useState(true)
  const [profileId, setProfileId] = useState<string | null>(null)
  // Fetch profile data from Supabase
  useEffect(() => {
    async function fetchProfile() {
      setLoading(true)
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }
      setProfileId(user.id)
      const { data: profile } = await supabase
        .from("profiles")
        .select(
          "id, business_name, user_name, phone, email, address, city, state, cep, created_at, updated_at, user_type, cnpj, logo_url",
        )
        .eq("id", user.id)
        .single()
      if (profile) {
        setBarberShopName(profile.business_name || "")
        setOwnerName(profile.user_name || "")
        setEmail(profile.email || "")
        setPhone(profile.phone || "")
        setAddress(profile.address || "")
        setCity(profile.city || "")
        setState(profile.state || "")
        setCep(profile.cep || "")
        setCnpj(profile.cnpj || "")
        setLogoUrl(profile.logo_url || "/placeholder.svg")
      }
      setLoading(false)
    }
    fetchProfile()
  }, [])

  // Função para upload do logo
  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !profileId) return
    setLoading(true)
    const fileExt = file.name.split(".").pop()
    const fileName = `logo-${profileId}-${Date.now()}.${fileExt}`
    const { data, error } = await supabase.storage
      .from("saloon-logos")
      .upload(fileName, file, { upsert: true, contentType: file.type })
    if (error) {
      alert("Erro ao fazer upload do logo.")
      setLoading(false)
      return
    }
    // Gerar URL pública
    const { data: publicUrlData } = supabase.storage.from("saloon-logos").getPublicUrl(fileName)
    const publicUrl = publicUrlData?.publicUrl
    if (publicUrl) {
      setLogoUrl(publicUrl)
      // Atualiza logo_url no perfil
      await supabase.from("profiles").update({ logo_url: publicUrl }).eq("id", profileId)
    }
    setLoading(false)
  }

  function handleLogoButtonClick() {
    fileInputRef.current?.click()
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-amber-50/20">
        <div className="space-y-6 p-6">
          <div className="backdrop-blur-sm bg-white/80 rounded-2xl border border-white/20 shadow-lg p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 via-blue-600 to-slate-700 bg-clip-text text-transparent">
                Configurações
              </h1>
              <Button
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 gap-2"
                onClick={handleSaveSettings}
                disabled={loading}
              >
                <Save size={16} />
                {loading ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsContent value="profile">
              <div className="backdrop-blur-sm bg-white/80 rounded-2xl border border-white/20 shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-slate-800 via-blue-600 to-slate-700 p-6">
                  <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <User size={20} />
                    Informações da Barbearia
                  </h2>
                </div>

                <div className="p-6 space-y-6">
                  <div className="flex flex-col lg:flex-row gap-8">
                    <div className="flex-1 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="barberShopName" className="text-sm font-medium text-slate-700">
                            Nome da Barbearia
                          </Label>
                          <Input
                            id="barberShopName"
                            value={barberShopName}
                            onChange={(e) => setBarberShopName(e.target.value)}
                            disabled={loading}
                            className="border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="ownerName" className="text-sm font-medium text-slate-700">
                            Nome do Proprietário
                          </Label>
                          <Input
                            id="ownerName"
                            value={ownerName}
                            onChange={(e) => setOwnerName(e.target.value)}
                            disabled={loading}
                            className="border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                            Email
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading}
                            className="border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="phone" className="text-sm font-medium text-slate-700">
                            Telefone
                          </Label>
                          <Input
                            id="phone"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            disabled={loading}
                            className="border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="address" className="text-sm font-medium text-slate-700">
                          Endereço
                        </Label>
                        <Input
                          id="address"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          disabled={loading}
                          className="border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="city" className="text-sm font-medium text-slate-700">
                            Cidade
                          </Label>
                          <Input
                            id="city"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            disabled={loading}
                            className="border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="state" className="text-sm font-medium text-slate-700">
                            Estado
                          </Label>
                          <Input
                            id="state"
                            value={state}
                            onChange={(e) => setState(e.target.value)}
                            disabled={loading}
                            className="border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="cep" className="text-sm font-medium text-slate-700">
                            CEP
                          </Label>
                          <Input
                            id="cep"
                            value={cep}
                            onChange={(e) => setCep(e.target.value)}
                            disabled={loading}
                            className="border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                      <Label htmlFor="cnpj" className="text-sm font-medium text-slate-700 flex items-center gap-1">
                        CNPJ
                        <Lock size={12} className="text-slate-500" />
                      </Label>
                      <Input
                        id="cnpj"
                        value={cnpj}
                        readOnly
                        disabled
                        className="border-slate-200 bg-slate-50 cursor-not-allowed text-slate-600"
                      />
                    </div>
                    </div>

                    <div className="w-full lg:w-80">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-slate-700">Logo da Barbearia</Label>
                        <div className="bg-gradient-to-br from-slate-50 to-blue-50/50 border-2 border-dashed border-slate-300 hover:border-blue-400 rounded-xl p-8 flex flex-col items-center transition-colors duration-300">
                          <div className="relative mb-4">
                            <img
                              src={logoUrl || "/placeholder.svg"}
                              alt="Logo da barbearia"
                              className="w-32 h-32 object-contain rounded-lg shadow-md"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg"></div>
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            style={{ display: "none" }}
                            onChange={handleLogoChange}
                            disabled={loading}
                          />
                          <Button
                            variant="outline"
                            className="gap-2 border-slate-300 hover:border-blue-400 hover:bg-blue-50 transition-colors duration-300 bg-transparent"
                            onClick={handleLogoButtonClick}
                            disabled={loading}
                          >
                            <Camera size={16} />
                            {loading ? "Carregando..." : "Alterar Logo"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  )
}
// Fim do componente principal

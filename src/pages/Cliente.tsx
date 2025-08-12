"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { Link } from "react-router-dom"
import { ClientLayout } from "@/components/client/layout"
import ClientBooking from "@/components/client/booking"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, User, LogOut, Camera, Save } from "lucide-react"

export default function Cliente() {
  const [activeTab, setActiveTab] = useState("agendamento")
  const [clientData, setClientData] = useState<any>(null)
  const [profileData, setProfileData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  // Campos editáveis do perfil do cliente
  const [clientName, setClientName] = useState("")
  const [clientEmail, setClientEmail] = useState("")
  const [clientPhone, setClientPhone] = useState("")

  useEffect(() => {
    async function fetchClientAndProfile() {
      setLoading(true)
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        setClientData(null)
        setProfileData(null)
        setLoading(false)
        return
      }
      // Buscar todos os dados relevantes do perfil do cliente
      const [{ data: client, error: clientError }, { data: profile, error: profileError }] = await Promise.all([
        supabase.from("clients").select("*").eq("user_id", user.id).single(),
        supabase
          .from("profiles")
          .select("id, user_name, email, phone, profile_photo_url")
          .match({ id: user.id, user_type: "cliente" })
          .single(),
      ])
      console.log("[CLIENTE] user:", user)
      console.log("[CLIENTE] client:", client, clientError)
      console.log("[CLIENTE] profile:", profile, profileError)
      setClientData(client || null)
      setProfileData(profile || null)
      // Preencher campos editáveis
      setClientName(profile?.user_name || "")
      setClientEmail(profile?.email || "")
      setClientPhone(profile?.phone || "")
      setLoading(false)
    }
    fetchClientAndProfile()
  }, [])

  return (
    <ClientLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-amber-50/20">
        <div className="container mx-auto py-8 space-y-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-6">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  {loading
                    ? "Carregando..."
                    : profileData &&
                        typeof profileData === "object" &&
                        "user_name" in profileData &&
                        profileData.user_name
                      ? `Olá, ${profileData.user_name}!`
                      : "Olá!"}
                </h1>
                <p className="text-slate-600">Bem-vindo à sua área pessoal</p>
              </div>
              <Link
                to="/"
                className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 group"
              >
                <LogOut size={18} className="group-hover:scale-110 transition-transform" />
                <span className="font-medium">Sair</span>
              </Link>
            </div>
          </div>


          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl overflow-hidden">
            <Tabs defaultValue="agendamento" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full grid grid-cols-2 bg-slate-100/50 p-2 rounded-none">
                <TabsTrigger
                  value="agendamento"
                  className="flex gap-3 items-center py-3 px-6 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-slate-800 transition-all duration-200"
                >
                  <Calendar size={20} />
                  <span className="font-medium">Agendamento</span>
                </TabsTrigger>
                <TabsTrigger
                  value="perfil"
                  className="flex gap-3 items-center py-3 px-6 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-slate-800 transition-all duration-200"
                >
                  <User size={20} />
                  <span className="font-medium">Perfil</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="agendamento" className="p-6">
                <ClientBooking />
              </TabsContent>

              <TabsContent value="perfil" className="p-6">
                <div className="flex flex-col lg:flex-row gap-8">
                  <div className="flex flex-col items-center space-y-6">
                    <div className="relative group">
                      {profileData && profileData.profile_photo_url ? (
                        <img
                          src={profileData.profile_photo_url || "/placeholder.svg"}
                          alt="Foto de perfil"
                          className="w-40 h-40 rounded-2xl object-cover border-4 border-gradient-to-r from-blue-500 to-amber-500 shadow-xl"
                        />
                      ) : (
                        <div className="w-40 h-40 rounded-2xl border-4 border-dashed border-slate-300 flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 shadow-inner">
                          <Camera size={32} className="text-slate-400" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                        <Camera size={24} className="text-white" />
                      </div>
                    </div>

                    <label className="block">
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        ref={(input) => ((window as any)._profilePhotoInput = input)}
                        onChange={async (e) => {
                          const file = e.target.files?.[0]
                          if (!file) return
                          setLoading(true)
                          // Buscar id do usuário logado
                          const {
                            data: { user },
                          } = await supabase.auth.getUser()
                          if (!user) {
                            setLoading(false)
                            alert("Usuário não autenticado.")
                            return
                          }
                          const fileExt = file.name.split(".").pop()
                          const fileName = `profile-photo-${user.id}-${Date.now()}.${fileExt}`
                          const { data, error } = await supabase.storage
                            .from("profile-photos")
                            .upload(fileName, file, { upsert: true, contentType: file.type })
                          if (error) {
                            alert("Erro ao fazer upload da foto.")
                            setLoading(false)
                            return
                          }
                          const { data: publicUrlData } = supabase.storage.from("profile-photos").getPublicUrl(fileName)
                          const publicUrl = publicUrlData?.publicUrl
                          if (publicUrl) {
                            await supabase.from("profiles").update({ profile_photo_url: publicUrl }).eq("id", user.id)
                            setProfileData((prev: any) => ({ ...prev, profile_photo_url: publicUrl }))
                          }
                          setLoading(false)
                        }}
                        disabled={loading}
                      />
                      <button
                        type="button"
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
                        onClick={() => {
                          const input = (window as any)._profilePhotoInput as HTMLInputElement | null
                          input?.click()
                        }}
                        disabled={loading}
                      >
                        <Camera size={18} />
                        {profileData && profileData.profile_photo_url ? "Alterar foto" : "Adicionar foto"}
                      </button>
                    </label>
                  </div>

                  <div className="flex-1 space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700" htmlFor="userName">
                          Nome completo
                        </label>
                        <input
                          id="userName"
                          className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder:text-slate-400"
                          placeholder="Digite seu nome completo"
                          value={clientName}
                          onChange={(e) => setClientName(e.target.value)}
                          disabled={loading}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700" htmlFor="email">
                          E-mail
                        </label>
                        <input
                          id="email"
                          type="email"
                          className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder:text-slate-400"
                          placeholder="Digite seu e-mail"
                          value={clientEmail}
                          onChange={(e) => setClientEmail(e.target.value)}
                          disabled={loading}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700" htmlFor="phone">
                          Telefone
                        </label>
                        <input
                          id="phone"
                          type="tel"
                          className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder:text-slate-400"
                          placeholder="Digite seu telefone"
                          value={clientPhone}
                          onChange={(e) => setClientPhone(e.target.value)}
                          disabled={loading}
                        />
                      </div>
                    </div>

                    <button
                      className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={loading}
                      onClick={async () => {
                        if (!profileData) return
                        setLoading(true)
                        await supabase
                          .from("profiles")
                          .update({
                            user_name: clientName,
                            email: clientEmail,
                            phone: clientPhone,
                          })
                          .eq("id", profileData.id)
                        setLoading(false)
                        alert("Perfil atualizado com sucesso!")
                      }}
                    >
                      <Save size={18} />
                      {loading ? "Salvando..." : "Salvar Alterações"}
                    </button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </ClientLayout>
  )
}

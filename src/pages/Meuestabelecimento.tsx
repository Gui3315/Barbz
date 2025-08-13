  // Máscara para telefone (XX) XXXXX-XXXX
  function maskPhone(value: string) {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .replace(/(-\d{4})\d+?$/, "$1");
  }
"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard/layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabaseClient"
import { useAuth } from "@/contexts/AuthContext"

export default function MeuEstabelecimento() {
  const [fatalError, setFatalError] = useState<string | null>(null)
  const { toast } = useToast()
  const { user } = useAuth()
  const [barbers, setBarbers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [newBarberName, setNewBarberName] = useState("")
  const [newBarberPhone, setNewBarberPhone] = useState("")
  const [newBarberActive, setNewBarberActive] = useState(true)
  const [editId, setEditId] = useState<string | null>(null)
  const [editBarber, setEditBarber] = useState<{ name: string; phone: string; is_active: boolean; lunch_start?: string; lunch_end?: string } | null>(null)
  const [newBarberLunchStart, setNewBarberLunchStart] = useState("")
  const [newBarberLunchEnd, setNewBarberLunchEnd] = useState("")

  // Serviços
  const [services, setServices] = useState<any[]>([])
  const [loadingServices, setLoadingServices] = useState(true)
  const [barbershopId, setBarbershopId] = useState<string | null>(null)
  // Formulário de novo serviço
  const [newService, setNewService] = useState({
    name: "",
    description: "",
    price: "",
    duration_minutes: "",
  })
  const [addingService, setAddingService] = useState(false)
  // Edição de serviço
  const [editServiceId, setEditServiceId] = useState<string | null>(null)
  const [editService, setEditService] = useState<any>(null)
  const [savingService, setSavingService] = useState(false)

  // Handler para adicionar serviço
  const handleAddService = async () => {
    if (!barbershopId) return
    if (!newService.name || !newService.price || !newService.duration_minutes) {
      toast({ title: "Preencha todos os campos obrigatórios", variant: "destructive" })
      return
    }
    setAddingService(true)
    const { error } = await supabase.from("services").insert({
      name: newService.name,
      description: newService.description,
      price: Number(newService.price),
      duration_minutes: Number(newService.duration_minutes),
      barbershop_id: barbershopId,
      user_id: user?.id,
    })
    if (!error) {
      toast({ title: "Serviço cadastrado!" })
      setNewService({ name: "", description: "", price: "", duration_minutes: "" })
      // Atualiza lista
      setLoadingServices(true)
      const { data: servicesData } = await supabase
        .from("services")
        .select("id, name, description, price, duration_minutes, created_at")
        .eq("barbershop_id", barbershopId)
        .order("created_at", { ascending: true })
      setServices(servicesData || [])
      setLoadingServices(false)
    } else {
      toast({ title: "Erro ao cadastrar serviço", description: error.message, variant: "destructive" })
    }
    setAddingService(false)
  }

  // Handler para editar serviço
  const handleEditService = (service: any) => {
    setEditServiceId(service.id)
    setEditService({
      name: service.name,
      description: service.description || "",
      price: service.price,
      duration_minutes: service.duration_minutes,
    })
  }

  // Handler para salvar edição de serviço
  const handleSaveEditService = async (serviceId: string) => {
    if (!editService) return
    setSavingService(true)
    const { error } = await supabase
      .from("services")
      .update({
        name: editService.name,
        description: editService.description,
        price: Number(editService.price),
        duration_minutes: Number(editService.duration_minutes),
      })
      .eq("id", serviceId)
    if (!error) {
      toast({ title: "Serviço atualizado!" })
      setEditServiceId(null)
      setEditService(null)
      setLoadingServices(true)
      const { data: servicesData } = await supabase
        .from("services")
        .select("id, name, description, price, duration_minutes, created_at")
        .eq("barbershop_id", barbershopId)
        .order("created_at", { ascending: true })
      setServices(servicesData || [])
      setLoadingServices(false)
    } else {
      toast({ title: "Erro ao atualizar serviço", description: error.message, variant: "destructive" })
    }
    setSavingService(false)
  }

  // Handler para remover serviço
  const handleRemoveService = async (serviceId: string) => {
    if (!window.confirm("Tem certeza que deseja remover este serviço?")) return
    const { error } = await supabase.from("services").delete().eq("id", serviceId)
    if (!error) {
      toast({ title: "Serviço removido!" })
      setEditServiceId(null)
      setEditService(null)
      setLoadingServices(true)
      const { data: servicesData } = await supabase
        .from("services")
        .select("id, name, description, price, duration_minutes, created_at")
        .eq("barbershop_id", barbershopId)
        .order("created_at", { ascending: true })
      setServices(servicesData || [])
      setLoadingServices(false)
    } else {
      toast({ title: "Erro ao remover serviço", description: error.message, variant: "destructive" })
    }
  }

  // Fetch barbers and services
  useEffect(() => {
    const fetchBarbersAndServices = async () => {
      setLoading(true)
      setLoadingServices(true)
      // Get the owner's barbershop_id
      const { data: shop, error: shopErr } = await supabase
        .from("barbershops")
        .select("id")
        .eq("owner_id", user?.id)
        .maybeSingle()
      if (!shop || shopErr) {
        setBarbers([])
        setServices([])
        setLoading(false)
        setLoadingServices(false)
        setBarbershopId(null)
        return
      }
      setBarbershopId(shop.id)
      // Fetch barbers
      const { data: barbersData } = await supabase
        .from("barbers")
        .select("id, name, phone, is_active, lunch_start, lunch_end, created_at")
        .eq("barbershop_id", shop.id)
        .order("created_at", { ascending: true })
      setBarbers(barbersData || [])
      setLoading(false)
      // Fetch services
      const { data: servicesData } = await supabase
        .from("services")
        .select("id, name, description, price, duration_minutes, created_at")
        .eq("barbershop_id", shop.id)
        .order("created_at", { ascending: true })
      setServices(servicesData || [])
      setLoadingServices(false)
    }
    if (user?.id) fetchBarbersAndServices()
  }, [user])

  // Add new barber
  const handleAddBarber = async () => {
    if (!newBarberName) {
      toast({ title: "Nome obrigatório", variant: "destructive" })
      return
    }
    // Get barbershop_id
    const { data: shop } = await supabase.from("barbershops").select("id").eq("owner_id", user?.id).maybeSingle()
    if (!shop) return
    const { error } = await supabase.from("barbers").insert({
      name: newBarberName,
      phone: newBarberPhone,
      user_id: user?.id,
      barbershop_id: shop.id,
      is_active: newBarberActive,
      lunch_start: newBarberLunchStart || null,
      lunch_end: newBarberLunchEnd || null,
    })
    if (!error) {
      setNewBarberName("")
      setNewBarberPhone("")
      setNewBarberActive(true)
      setNewBarberLunchStart("")
      setNewBarberLunchEnd("")
      toast({ title: "Barbeiro cadastrado!" })
      // Refresh list
      const { data } = await supabase
        .from("barbers")
        .select("id, name, phone, is_active, lunch_start, lunch_end, created_at")
        .eq("barbershop_id", shop.id)
        .order("created_at", { ascending: true })
      setBarbers(data || [])
    } else {
      toast({ title: "Erro ao cadastrar barbeiro", description: error.message, variant: "destructive" })
    }
  }

  // Edit barber
  const handleEditBarber = (barber: any) => {
    setEditId(barber.id)
    setEditBarber({
      name: barber.name,
      phone: barber.phone || "",
      is_active: barber.is_active,
      lunch_start: barber.lunch_start || "",
      lunch_end: barber.lunch_end || "",
    })
  }

  const handleSaveEdit = async (barberId: string) => {
    if (!editBarber) return
    const { error } = await supabase
      .from("barbers")
      .update({
        name: editBarber.name,
        phone: editBarber.phone,
        is_active: editBarber.is_active,
        lunch_start: editBarber.lunch_start || null,
        lunch_end: editBarber.lunch_end || null,
      })
      .eq("id", barberId)
    if (!error) {
      toast({ title: "Barbeiro atualizado!" })
      setEditId(null)
      setEditBarber(null)
      // Refresh list
      const { data: shop } = await supabase.from("barbershops").select("id").eq("owner_id", user?.id).maybeSingle()
      if (shop) {
        const { data } = await supabase
          .from("barbers")
          .select("id, name, phone, is_active, lunch_start, lunch_end, created_at")
          .eq("barbershop_id", shop.id)
          .order("created_at", { ascending: true })
        setBarbers(data || [])
      }
    } else {
      toast({ title: "Erro ao atualizar barbeiro", description: error.message, variant: "destructive" })
    }
  }

  // Remove barber
  const handleRemoveBarber = async (barberId: string) => {
    if (!window.confirm("Tem certeza que deseja remover este barbeiro?")) return
    const { error } = await supabase.from("barbers").delete().eq("id", barberId)
    if (!error) {
      toast({ title: "Barbeiro removido!" })
      setEditId(null)
      setEditBarber(null)
      // Refresh list
      const { data: shop } = await supabase.from("barbershops").select("id").eq("owner_id", user?.id).maybeSingle()
      if (shop) {
      const { data } = await supabase
        .from("barbers")
        .select("id, name, phone, is_active, lunch_start, lunch_end, created_at")
        .eq("barbershop_id", shop.id)
        .order("created_at", { ascending: true })
      setBarbers(data || [])
      }
    } else {
      toast({ title: "Erro ao remover barbeiro", description: error.message, variant: "destructive" })
    }
  }

  // Horários e dias de funcionamento
  const weekDays = [
    { key: "Segunda", label: "Segunda" },
    { key: "Terça", label: "Terça" },
    { key: "Quarta", label: "Quarta" },
    { key: "Quinta", label: "Quinta" },
    { key: "Sexta", label: "Sexta" },
    { key: "Sábado", label: "Sábado" },
    { key: "Domingo", label: "Domingo" },
  ]
  const [schedule, setSchedule] = useState<any>({})
  const [loadingSchedule, setLoadingSchedule] = useState(true)
  const [savingSchedule, setSavingSchedule] = useState(false)

  // Buscar horários ao carregar barbershopId
  useEffect(() => {
    const fetchSchedule = async () => {
      if (!barbershopId) return
      setLoadingSchedule(true)
      const { data } = await supabase
        .from("salon_schedule")
        .select("id, day, open, close, active")
        .eq("barbershop_id", barbershopId)
      const sched: any = {}
      data?.forEach((row: any) => {
        sched[row.day] = {
          id: row.id,
          is_open: row.active,
          open: row.open || "",
          close: row.close || "",
        }
      })
      setSchedule(sched)
      setLoadingSchedule(false)
    }
    if (barbershopId) fetchSchedule()
  }, [barbershopId])

  // Handler para alterar checkbox ou horários
  const handleScheduleChange = (day: string, field: "is_open" | "open" | "close", value: any) => {
    setSchedule((prev: any) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }))
  }

  // Salvar horários
  const handleSaveSchedule = async () => {
    if (!barbershopId) return
    setSavingSchedule(true)
    for (const day of weekDays) {
      const s = schedule[day.key] || {}
      if (s.id) {
        // update
        await supabase
          .from("salon_schedule")
          .update({
            active: !!s.is_open,
            open: s.open || null,
            close: s.close || null,
          })
          .eq("id", s.id)
      } else {
        // insert
        await supabase.from("salon_schedule").insert({
          barbershop_id: barbershopId,
          day: day.key,
          active: !!s.is_open,
          open: s.open || null,
          close: s.close || null,
        })
      }
    }
    toast({ title: "Horários salvos!" })
    setSavingSchedule(false)
  }

  try {
    if (fatalError) {
      return (
        <DashboardLayout>
          <div className="p-8 text-red-600 font-bold">Erro: {fatalError}</div>
        </DashboardLayout>
      )
    }
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-amber-50/20">
          <div className="space-y-8 p-6">
            <div className="backdrop-blur-sm bg-white/80 rounded-2xl border border-white/20 shadow-xl p-6">
              <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-slate-800 via-blue-600 to-amber-600 bg-clip-text text-transparent break-words text-balance leading-tight max-w-[320px] sm:max-w-none">
                Meu Estabelecimento
              </h1>
              <p className="text-slate-600 mt-2">Gerencie barbeiros, serviços e horários de funcionamento</p>
            </div>

            <div className="backdrop-blur-sm bg-white/80 rounded-2xl border border-white/20 shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center"></div>
                  Barbeiros
                </h2>
              </div>
              <div className="p-6">
                <div className="mb-6 grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Nome do barbeiro</label>
                    <Input
                      placeholder="Digite o nome"
                      value={newBarberName}
                      onChange={(e) => setNewBarberName(e.target.value)}
                      className="border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Telefone</label>
                    <Input
                      placeholder="(00) 00000-0000"
                      value={newBarberPhone}
                      onChange={(e) => setNewBarberPhone(maskPhone(e.target.value))}
                      maxLength={15}
                      className="border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Início do almoço</label>
                    <Input
                      type="time"
                      value={newBarberLunchStart || ""}
                      onChange={(e) => setNewBarberLunchStart(e.target.value)}
                      className="border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Fim do almoço</label>
                    <Input
                      type="time"
                      value={newBarberLunchEnd || ""}
                      onChange={(e) => setNewBarberLunchEnd(e.target.value)}
                      className="border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700 p-3 rounded-lg bg-slate-50 border border-slate-200">
                      <input
                        type="checkbox"
                        checked={newBarberActive}
                        onChange={(e) => setNewBarberActive(e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                      />
                      Barbeiro ativo
                    </label>
                  </div>
                  <Button
                    onClick={handleAddBarber}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    Adicionar Barbeiro
                  </Button>
                </div>

                {loading ? (
                  <div className="text-center py-8 text-slate-600">
                    <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                    Carregando barbeiros...
                  </div>
                ) : barbers.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      ✂️
                    </div>
                    Nenhum barbeiro cadastrado ainda.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {barbers.map((barber) => (
                      <div
                        key={barber.id}
                        className="bg-gradient-to-r from-slate-50 to-blue-50/30 rounded-xl border border-slate-200 p-4"
                      >
                        {editId === barber.id ? (
                          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                            <Input
                              value={editBarber?.name || ""}
                              onChange={(e) =>
                                setEditBarber((editBarber) => ({ ...editBarber!, name: e.target.value }))
                              }
                              placeholder="Nome"
                              className="border-slate-200 focus:border-blue-500"
                            />
                            <Input
                              value={editBarber?.phone || ""}
                              onChange={(e) =>
                                setEditBarber((editBarber) => ({ ...editBarber!, phone: e.target.value }))
                              }
                              placeholder="Telefone"
                              className="border-slate-200 focus:border-blue-500"
                            />
                            <Input
                              type="time"
                              value={editBarber?.lunch_start || ""}
                              onChange={(e) =>
                                setEditBarber((editBarber) => ({ ...editBarber!, lunch_start: e.target.value }))
                              }
                              placeholder="Início do almoço"
                              className="border-slate-200 focus:border-blue-500"
                            />
                            <Input
                              type="time"
                              value={editBarber?.lunch_end || ""}
                              onChange={(e) =>
                                setEditBarber((editBarber) => ({ ...editBarber!, lunch_end: e.target.value }))
                              }
                              placeholder="Fim do almoço"
                              className="border-slate-200 focus:border-blue-500"
                            />
                            <label className="flex items-center gap-2 text-sm">
                              <input
                                type="checkbox"
                                checked={!!editBarber?.is_active}
                                onChange={(e) =>
                                  setEditBarber((editBarber) => ({ ...editBarber!, is_active: e.target.checked }))
                                }
                                className="w-4 h-4 text-blue-600 border-slate-300 rounded"
                              />
                              Ativo
                            </label>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleSaveEdit(barber.id)}
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                Salvar
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditId(null)
                                  setEditBarber(null)
                                }}
                                className="border-slate-300 text-slate-600 hover:bg-slate-50"
                              >
                                Cancelar
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="flex flex-row items-center gap-4 w-full">
                              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0">
                                {barber.name.charAt(0).toUpperCase()}
                              </div>
                          <div className="flex flex-col w-full min-w-0">
                            <h3 className="font-semibold text-slate-800 text-base break-words leading-tight w-full min-w-0">
                              {barber.name}
                            </h3>
                            {barber.phone && (
                              <p className="text-sm text-slate-600 break-all w-full min-w-0">{barber.phone}</p>
                            )}
                            {(barber.lunch_start || barber.lunch_end) && (
                              <p className="text-xs text-slate-500 mt-1">
                                Almoço: {barber.lunch_start ? barber.lunch_start.slice(0,5) : '--:--'} às {barber.lunch_end ? barber.lunch_end.slice(0,5) : '--:--'}
                              </p>
                            )}
                          </div>
                            </div>
                            <div className="flex flex-row items-center gap-2 mt-2 sm:mt-0">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  barber.is_active
                                    ? "bg-green-100 text-green-800 border border-green-200"
                                    : "bg-slate-100 text-slate-600 border border-slate-200"
                                }`}
                              >
                                {barber.is_active ? "Ativo" : "Inativo"}
                              </span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditBarber(barber)}
                                className="border-blue-200 text-blue-600 hover:bg-blue-50"
                              >
                                Editar
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleRemoveBarber(barber.id)}
                                className="bg-red-500 hover:bg-red-600"
                              >
                                Remover
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="backdrop-blur-sm bg-white/80 rounded-2xl border border-white/20 shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-amber-600 to-amber-700 p-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center"></div>
                  Horários de Funcionamento
                </h2>
              </div>
              <div className="p-6">
                {loadingSchedule ? (
                  <div className="text-center py-8 text-slate-600">
                    <div className="animate-spin w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                    Carregando horários...
                  </div>
                ) : (
                  <form className="space-y-4">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-slate-200">
                            <th className="text-left py-3 px-4 font-semibold text-slate-700">Dia da Semana</th>
                            <th className="text-center py-3 px-4 font-semibold text-slate-700">Atende</th>
                            <th className="text-center py-3 px-4 font-semibold text-slate-700">Abertura</th>
                            <th className="text-center py-3 px-4 font-semibold text-slate-700">Fechamento</th>
                          </tr>
                        </thead>
                        <tbody>
                          {weekDays.map((day) => (
                            <tr key={day.key} className="border-b border-slate-100 hover:bg-slate-50/50">
                              <td className="py-4 px-4 font-medium text-slate-800">{day.label}</td>
                              <td className="py-4 px-4 text-center">
                                <input
                                  type="checkbox"
                                  checked={!!schedule[day.key]?.is_open}
                                  onChange={(e) => handleScheduleChange(day.key, "is_open", e.target.checked)}
                                  className="w-5 h-5 text-amber-600 border-slate-300 rounded focus:ring-amber-500"
                                />
                              </td>
                              <td className="py-4 px-4">
                                <Input
                                  type="time"
                                  value={schedule[day.key]?.open || ""}
                                  onChange={(e) => handleScheduleChange(day.key, "open", e.target.value)}
                                  disabled={!schedule[day.key]?.is_open}
                                  className="border-slate-200 focus:border-amber-500 focus:ring-amber-500 disabled:bg-slate-50"
                                />
                              </td>
                              <td className="py-4 px-4">
                                <Input
                                  type="time"
                                  value={schedule[day.key]?.close || ""}
                                  onChange={(e) => handleScheduleChange(day.key, "close", e.target.value)}
                                  disabled={!schedule[day.key]?.is_open}
                                  className="border-slate-200 focus:border-amber-500 focus:ring-amber-500 disabled:bg-slate-50"
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="pt-4">
                      <Button
                        onClick={(e) => {
                          e.preventDefault()
                          handleSaveSchedule()
                        }}
                        disabled={savingSchedule}
                        className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        {savingSchedule ? "Salvando..." : "Salvar Horários"}
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </div>

            <div className="backdrop-blur-sm bg-white/80 rounded-2xl border border-white/20 shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-slate-700 to-slate-800 p-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center"></div>
                  Serviços Oferecidos
                </h2>
              </div>
              <div className="p-6">
                <div className="mb-6 grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Nome do serviço</label>
                    <Input
                      placeholder="Ex: Corte masculino"
                      value={newService.name}
                      onChange={(e) => setNewService((s) => ({ ...s, name: e.target.value }))}
                      className="border-slate-200 focus:border-slate-500 focus:ring-slate-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Descrição</label>
                    <Input
                      placeholder="Tipo/Descrição"
                      value={newService.description}
                      onChange={(e) => setNewService((s) => ({ ...s, description: e.target.value }))}
                      className="border-slate-200 focus:border-slate-500 focus:ring-slate-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Valor (R$)</label>
                    <Input
                      placeholder="0,00"
                      type="number"
                      min="0"
                      value={newService.price}
                      onChange={(e) => setNewService((s) => ({ ...s, price: e.target.value }))}
                      className="border-slate-200 focus:border-slate-500 focus:ring-slate-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Duração (min)</label>
                    <Input
                      placeholder="30"
                      type="number"
                      min="1"
                      value={newService.duration_minutes}
                      onChange={(e) => setNewService((s) => ({ ...s, duration_minutes: e.target.value }))}
                      className="border-slate-200 focus:border-slate-500 focus:ring-slate-500"
                    />
                  </div>
                  <Button
                    onClick={handleAddService}
                    disabled={addingService}
                    className="bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    {addingService ? "Adicionando..." : "Adicionar Serviço"}
                  </Button>
                </div>

                {loadingServices ? (
                  <div className="text-center py-8 text-slate-600">
                    <div className="animate-spin w-8 h-8 border-4 border-slate-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                    Carregando serviços...
                  </div>
                ) : services.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      💼
                    </div>
                    Nenhum serviço cadastrado ainda.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="text-left py-3 px-4 font-semibold text-slate-700">Nome</th>
                          <th className="text-left py-3 px-4 font-semibold text-slate-700">Descrição</th>
                          <th className="text-center py-3 px-4 font-semibold text-slate-700">Valor</th>
                          <th className="text-center py-3 px-4 font-semibold text-slate-700">Duração</th>
                          <th className="text-center py-3 px-4 font-semibold text-slate-700">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {services.map((service) => (
                          <tr key={service.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                            {editServiceId === service.id ? (
                              <>
                                <td className="py-4 px-4">
                                  <Input
                                    value={editService?.name || ""}
                                    onChange={(e) => setEditService((s: any) => ({ ...s, name: e.target.value }))}
                                    placeholder="Nome"
                                    className="border-slate-200 focus:border-slate-500"
                                  />
                                </td>
                                <td className="py-4 px-4">
                                  <Input
                                    value={editService?.description || ""}
                                    onChange={(e) =>
                                      setEditService((s: any) => ({ ...s, description: e.target.value }))
                                    }
                                    placeholder="Descrição"
                                    className="border-slate-200 focus:border-slate-500"
                                  />
                                </td>
                                <td className="py-4 px-4">
                                  <Input
                                    type="number"
                                    min="0"
                                    value={editService?.price || ""}
                                    onChange={(e) => setEditService((s: any) => ({ ...s, price: e.target.value }))}
                                    placeholder="Valor"
                                    className="border-slate-200 focus:border-slate-500"
                                  />
                                </td>
                                <td className="py-4 px-4">
                                  <Input
                                    type="number"
                                    min="1"
                                    value={editService?.duration_minutes || ""}
                                    onChange={(e) =>
                                      setEditService((s: any) => ({ ...s, duration_minutes: e.target.value }))
                                    }
                                    placeholder="Duração"
                                    className="border-slate-200 focus:border-slate-500"
                                  />
                                </td>
                                <td className="py-4 px-4">
                                  <div className="flex gap-2 justify-center">
                                    <Button
                                      size="sm"
                                      onClick={() => handleSaveEditService(service.id)}
                                      disabled={savingService}
                                      className="bg-green-600 hover:bg-green-700 text-white"
                                    >
                                      Salvar
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        setEditServiceId(null)
                                        setEditService(null)
                                      }}
                                      className="border-slate-300 text-slate-600 hover:bg-slate-50"
                                    >
                                      Cancelar
                                    </Button>
                                  </div>
                                </td>
                              </>
                            ) : (
                              <>
                                <td className="py-4 px-4 font-medium text-slate-800">{service.name}</td>
                                <td className="py-4 px-4 text-slate-600">{service.description}</td>
                                <td className="py-4 px-4 text-center font-semibold text-green-600">
                                  R$ {Number(service.price).toFixed(2)}
                                </td>
                                <td className="py-4 px-4 text-center text-slate-600">{service.duration_minutes} min</td>
                                <td className="py-4 px-4">
                                  <div className="flex gap-2 justify-center">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleEditService(service)}
                                      className="border-slate-300 text-slate-600 hover:bg-slate-50"
                                    >
                                      Editar
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => handleRemoveService(service.id)}
                                      className="bg-red-500 hover:bg-red-600"
                                    >
                                      Remover
                                    </Button>
                                  </div>
                                </td>
                              </>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  } catch (err: any) {
    setFatalError(err?.message || "Erro desconhecido")
    return null
  }
}

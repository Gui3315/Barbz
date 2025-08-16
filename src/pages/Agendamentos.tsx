"use client"

import { DashboardLayout } from "@/components/dashboard/layout"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { CalendarIcon, Clock, Plus } from "lucide-react"
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue
} from "@/components/ui/select"
import { useEffect, useState } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabaseClient"
// ...existing code...

// Types for appointments, barbers, and services
interface Appointment {
  id: string
  start_at: string
  end_at: string
  status: string
  total_price: number
  notes?: string
  client: { name: string }
  service: { name: string }
  barber: { name: string }
}

interface Client {
  id: string
  name: string
}

interface Barber {
  id: string
  name: string
  // outros campos ignorados
}

interface Service {
  id: string
  name: string
  duration_minutes: number
  price: string
}

import { salonSchedule, generateTimeSlots } from "@/config/salonSchedule"

export default function Agendamentos() {
  const { toast } = useToast()
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [newAppointmentDate, setNewAppointmentDate] = useState<Date | undefined>(new Date())
  const [selectedBarber, setSelectedBarber] = useState<string | null>(null)
  const [selectedService, setSelectedService] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  // Campos para cliente não cadastrado
  const [clientName, setClientName] = useState<string>("")
  const [clientPhone, setClientPhone] = useState<string>("")

  // Máscara automática para telefone
  function formatPhone(value: string) {
    let v = value.replace(/\D/g, "").slice(0, 11)
    if (v.length <= 2) return v
    if (v.length <= 7) return `(${v.slice(0,2)}) ${v.slice(2)}`
    if (v.length <= 11) return `(${v.slice(0,2)}) ${v.slice(2,7)}-${v.slice(7)}`
    return v
  }
  const [sheetOpen, setSheetOpen] = useState(false)

  // Dados reais do banco
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [barbers, setBarbers] = useState<Barber[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [profilesData, setProfilesData] = useState<any[]>([])

  // Horários disponíveis para o barbeiro/serviço/data selecionados
  const [availableTimes, setAvailableTimes] = useState<string[]>([])
  const [loadingTimes, setLoadingTimes] = useState(false)
  // Função para gerar horários disponíveis considerando agendamentos existentes
  useEffect(() => {
  const fetchAvailableTimes = async () => {
    setLoadingTimes(true)
    setAvailableTimes([])
    if (!newAppointmentDate || !selectedBarber || !selectedService) {
        setLoadingTimes(false)
        return
      }
      
      // Buscar barbershop_id
      const user = supabase.auth.getUser ? (await supabase.auth.getUser()).data.user : null
      let barbershopId = null
      if (user) {
        const { data: barbershop } = await supabase.from("barbershops").select("id").eq("owner_id", user.id).single()
        if (barbershop) {
          barbershopId = barbershop.id
        }
      }

      if (!barbershopId) {
        setAvailableTimes([])
        setLoadingTimes(false)
        return
      }

      // Buscar duração do serviço
      const service = services.find((s) => s.id === selectedService)
      const duration = service ? service.duration_minutes : 30
      
      // Buscar configuração do dia da tabela salon_schedule
      const diasSemana = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"]
      const diaSelecionado = diasSemana[newAppointmentDate.getDay()]

      const { data: scheduleData } = await supabase
        .from("salon_schedule")
        .select("open, close, active")
        .eq("barbershop_id", barbershopId)
        .eq("day", diaSelecionado)
        .single()

      if (!scheduleData || !scheduleData.active) {
        setAvailableTimes([])
        setLoadingTimes(false)
        return
      }

      const slots = generateTimeSlots(scheduleData.open, scheduleData.close)

      // Buscar agendamentos do barbeiro para o dia (corrigindo para UTC-3)
      const year = newAppointmentDate.getFullYear()
      const month = String(newAppointmentDate.getMonth() + 1).padStart(2, "0")
      const day = String(newAppointmentDate.getDate()).padStart(2, "0")
      const startUTC = `${year}-${month}-${day}T03:00:00+00:00` // 00:00 BRT = 03:00 UTC
      const nextDay = new Date(newAppointmentDate.getTime() + 24 * 60 * 60 * 1000)
      const nextYear = nextDay.getFullYear()
      const nextMonth = String(nextDay.getMonth() + 1).padStart(2, "0")
      const nextDayStr = String(nextDay.getDate()).padStart(2, "0")
      const endUTC = `${nextYear}-${nextMonth}-${nextDayStr}T02:59:59+00:00`
      const { data: dayAppointments, error } = await supabase
        .from("appointments")
        .select("*")
        .eq("barber_id", selectedBarber)
        .gte("start_at", startUTC)
        .lt("start_at", endUTC)
        .in("status", ["confirmed", "pending"])

      if (error) {
        setAvailableTimes(slots)
        setLoadingTimes(false)
        return
      }
      // Marcar horários ocupados
      const occupied: Set<string> = new Set()
      ;(dayAppointments || []).forEach((appt: any) => {
        const apptStart = new Date(appt.start_at)
        
        // Extrair hora e minuto diretamente (JavaScript já converte automaticamente para timezone local)
        const apptHour = apptStart.getHours().toString().padStart(2, '0')
        const apptMinute = apptStart.getMinutes().toString().padStart(2, '0')
        const apptTimeSlot = `${apptHour}:${apptMinute}`
        
        // Marcar esse horário como ocupado
        occupied.add(apptTimeSlot)
      })

      // Filtrar slots disponíveis considerando duração do serviço
      const available = slots.filter((slot) => {
        if (occupied.has(slot)) return false
        
        const [slotHour, slotMin] = slot.split(":").map(Number)
        const [closeHour, closeMin] = scheduleData.close.split(":").map(Number)
        
        // Calcular horário de fim do serviço
        const slotEndTime = slotHour * 60 + slotMin + duration // em minutos
        const closeTime = closeHour * 60 + closeMin // em minutos
        
        // Verificar se o serviço cabe no horário de funcionamento
        if (slotEndTime > closeTime) return false
        
        // Verificar se há conflito com agendamentos existentes durante toda a duração do serviço
        const slotStartTime = slotHour * 60 + slotMin
        for (let time = slotStartTime; time < slotEndTime; time += 30) { // verificar a cada 30 min
          const checkHour = Math.floor(time / 60).toString().padStart(2, '0')
          const checkMin = (time % 60).toString().padStart(2, '0')
          const checkSlot = `${checkHour}:${checkMin}`
          
          if (occupied.has(checkSlot)) {
            return false // há conflito durante a duração do serviço
          }
        }
        
        return true
      })
      setAvailableTimes(available)
      setLoadingTimes(false)
    }
    fetchAvailableTimes()
  }, [newAppointmentDate, selectedBarber, selectedService, services])

  // Buscar dados do Supabase

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      // Buscar barbeiros
      const { data: barbersData } = await supabase.from("barbers").select("*")
      setBarbers((barbersData || []).map((b: any) => ({ id: b.id, name: b.name })))
      // Buscar serviços
      const { data: servicesData } = await supabase.from("services").select("*")
      setServices(
        (servicesData || []).map((s: any) => ({
          id: s.id,
          name: s.name,
          duration_minutes: s.duration_minutes,
          price: s.price,
        })),
      )


      // Buscar barbershop_id do usuário logado
      const user = supabase.auth.getUser ? (await supabase.auth.getUser()).data.user : null
      let barbershopId = null
      if (user) {
        const { data: barbershop } = await supabase.from("barbershops").select("id").eq("owner_id", user.id).single()
        if (barbershop) {
          barbershopId = barbershop.id
        }
      }

      // Buscar agendamentos do dia via função RPC (resolve RLS)
      let appointmentsData = []
      if (barbershopId && selectedDate) {
        const year = selectedDate.getFullYear()
        const month = String(selectedDate.getMonth() + 1).padStart(2, "0")
        const day = String(selectedDate.getDate()).padStart(2, "0")
        const startDate = `${year}-${month}-${day}T00:00:00`
        const endDate = `${year}-${month}-${day}T23:59:59`
        const { data, error } = await supabase.rpc("get_appointments_with_clients", {
          p_barbershop_id: barbershopId,
          p_start_date: startDate,
          p_end_date: endDate,
        })
        if (error) {
          console.error("Erro ao buscar agendamentos:", error)
          setAppointments([])
          setLoading(false)
          return
        }
        appointmentsData = data || []
        
      }
      // Mapear para o formato esperado pelo componente - usar dados direto da RPC
      setAppointments(
        (appointmentsData || []).map((a: any) => ({
          id: a.id,
          start_at: a.start_at,
          end_at: a.end_at,
          status: a.status,
          total_price: a.total_price,
          notes: a.notes,
          client: { name: a.client_name },
          service: { name: a.service_name },
          barber: { name: a.barber_name },
        }))
      )
      setLoading(false)
    }
    fetchData()
  }, [selectedDate])

  const resetNewAppointment = () => {
    setSelectedBarber(null)
    setSelectedService(null)
    setSelectedTime(null)
    setClientName("")
    setClientPhone("")
    setNewAppointmentDate(new Date())
  }

  const handleCreateAppointment = async () => {
    if (!clientName.trim() || !clientPhone.trim() || !selectedBarber || !selectedService || !selectedTime || !newAppointmentDate) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      })
      return
    }
    // Buscar usuário logado
    const user = supabase.auth.getUser ? (await supabase.auth.getUser()).data.user : null
    const user_id = user?.id || null
    if (!user_id) {
      toast({
        title: "Usuário não autenticado",
        description: "Faça login para criar agendamentos.",
        variant: "destructive",
      })
      return
    }
    // Montar start_at (data + hora escolhida) com offset UTC-3
    const dateStr = format(newAppointmentDate, "yyyy-MM-dd")
    const start_at = `${dateStr}T${selectedTime}:00-03:00`
    // Calcular end_at com base na duração do serviço
    const service = services.find((s) => s.id === selectedService)
    const duration = service ? service.duration_minutes : 30
    const total_price = service ? Number(service.price) : 0
    const [h, m] = selectedTime.split(":")
    const endDate = new Date(newAppointmentDate)
    endDate.setHours(Number(h), Number(m) + duration, 0, 0)
    const end_at = format(endDate, "yyyy-MM-dd'T'HH:mm:ssXXX")
    // Buscar barbershop_id na tabela barbershops onde owner_id = user_id
    let barbershop_id = null
    if (user_id) {
      const { data: barbershopData } = await supabase.from("barbershops").select("id").eq("owner_id", user_id).single()
      barbershop_id = barbershopData?.id || null
    }
    // Inserir appointment para cliente não cadastrado
    const { data: appointmentData, error: appointmentError } = await supabase
      .from("appointments")
      .insert([
        {
          barbershop_id: barbershop_id,
          barber_id: selectedBarber,
          start_at,
          end_at,
          status: "confirmed",
          total_price,
          client_id: null,
          user_id: user_id,
          notes: `Nome: ${clientName} | Telefone: ${clientPhone}`,
        },
      ])
      .select()
      .single()
    if (appointmentError || !appointmentData) {
      toast({
        title: "Erro ao criar agendamento",
        description: appointmentError?.message || "Erro ao criar agendamento",
        variant: "destructive",
      })
      return
    }
    // Inserir na appointment_services com snapshots
    const serviceObj = services.find((s) => s.id === selectedService)
    const { error: asError } = await supabase
      .from("appointment_services")
      .insert([
        {
          appointment_id: appointmentData.id,
          service_id: selectedService,
          duration_minutes_snapshot: serviceObj?.duration_minutes || 30,
          name_snapshot: serviceObj?.name || "",
          price_snapshot: serviceObj ? Number(serviceObj.price) : 0,
        },
      ])
    if (asError) {
      toast({
        title: "Erro ao vincular serviço",
        description: asError?.message || "Erro ao vincular serviço ao agendamento.",
        variant: "destructive",
      })
      return
    }
    toast({
      title: "Agendamento criado",
      description: `Agendamento criado com sucesso.`,
    })
    setSheetOpen(false)
    resetNewAppointment()
    // Refetch usando a mesma lógica do useEffect
    const currentUser = supabase.auth.getUser ? (await supabase.auth.getUser()).data.user : null
    let barbershopId = null
    if (currentUser) {
      const { data: barbershop } = await supabase.from("barbershops").select("id").eq("owner_id", currentUser.id).single()
      if (barbershop) {
        barbershopId = barbershop.id
      }
    }

    if (barbershopId && selectedDate) {
      const year = selectedDate.getFullYear()
      const month = String(selectedDate.getMonth() + 1).padStart(2, "0")
      const day = String(selectedDate.getDate()).padStart(2, "0")
      const startDate = `${year}-${month}-${day}T00:00:00`
      const endDate = `${year}-${month}-${day}T23:59:59`
      const { data } = await supabase.rpc("get_appointments_with_clients", {
        p_barbershop_id: barbershopId,
        p_start_date: startDate,
        p_end_date: endDate,
      })
      
      setAppointments(
        (data || []).map((a: any) => ({
          id: a.id,
          start_at: a.start_at,
          end_at: a.end_at,
          status: a.status,
          total_price: a.total_price,
          notes: a.notes,
          client: { name: a.client_name },
          service: { name: a.service_name },
          barber: { name: a.barber_name },
        }))
      )
    }
  }

  // Filtro por barbeiro
  const [barberFilter, setBarberFilter] = useState<string>("all")
  // Filtrar agendamentos por data e barbeiro
  const filteredAppointments = appointments.filter((appointment) => {
    if (!selectedDate) return true
    // start_at pode ser string ISO, comparar só a data (yyyy-MM-dd)
    const apptDate = appointment.start_at ? appointment.start_at.slice(0, 10) : ""
    const selected = format(selectedDate, "yyyy-MM-dd")
    const matchesDate = apptDate === selected
    const matchesBarber =
      barberFilter === "all" ||
      (appointment.barber &&
        appointment.barber.name &&
        barbers.find((b) => b.id === barberFilter && b.name === appointment.barber.name))
    return matchesDate && matchesBarber
  })
  const confirmedAppointments = filteredAppointments.filter((a) => a.status === "confirmed" || a.status === null)
  const pendingAppointments: Appointment[] = []

  // Atualizar status do agendamento
  const handleConfirmAppointment = async (id: string) => {
    const { error } = await supabase.from("appointments").update({ status: "confirmed" }).eq("id", id)
    if (!error) {
      setAppointments(
        appointments.map((appointment) =>
          appointment.id === id ? { ...appointment, status: "confirmed" } : appointment,
        ),
      )
      toast({
        title: "Agendamento confirmado",
        description: "O agendamento foi confirmado com sucesso.",
      })
    }
  }

  const handleCancelAppointment = async (id: string) => {
    const { error } = await supabase.from("appointments").delete().eq("id", id)
    if (!error) {
      setAppointments(appointments.filter((appointment) => appointment.id !== id))
      toast({
        title: "Agendamento cancelado",
        description: "O agendamento foi cancelado com sucesso.",
      })
    }
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-amber-50/20">
        <div className="space-y-6 p-6">
          <div className="backdrop-blur-sm bg-white/80 rounded-2xl border border-white/20 shadow-lg p-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="flex flex-col gap-3">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 via-blue-600 to-slate-700 bg-clip-text text-transparent">
                  Agendamentos
                </h1>
                <div className="flex items-center gap-3 w-full max-w-xs">
                  <label className="text-sm font-medium text-slate-600">Barbeiro:</label>
                  <Select value={barberFilter} onValueChange={setBarberFilter}>
                    <SelectTrigger className="w-full px-3 py-2 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent className="w-full max-w-xs">
                      <SelectItem value="all">Todos</SelectItem>
                      {barbers.map((barber) => (
                        <SelectItem key={barber.id} value={barber.id}>
                          {barber.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetTrigger asChild>
                  <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 gap-2 px-6 py-3 rounded-xl">
                    <Plus size={16} />
                    Novo Agendamento
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-full sm:w-[540px] overflow-y-auto bg-gradient-to-br from-white via-slate-50/50 to-blue-50/30">
                  <SheetHeader>
                    <SheetTitle className="text-xl font-semibold bg-gradient-to-r from-slate-800 to-blue-600 bg-clip-text text-transparent">
                      Novo Agendamento
                    </SheetTitle>
                  </SheetHeader>
                  <div className="space-y-6 mt-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Nome do Cliente</label>
                      <input
                        type="text"
                        className="w-full px-3 py-3 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                        placeholder="Nome completo"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Telefone do Cliente</label>
                      <input
                        type="tel"
                        className="w-full px-3 py-3 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                        placeholder="(99) 99999-9999"
                        value={clientPhone}
                        onChange={(e) => setClientPhone(formatPhone(e.target.value))}
                        maxLength={15}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Data</label>
                      <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200 shadow-sm p-3">
                        <Calendar
                          mode="single"
                          selected={newAppointmentDate}
                          onSelect={setNewAppointmentDate}
                          className="rounded-md pointer-events-auto"
                          locale={ptBR}
                          disabled={{ before: new Date() }}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Barbeiro</label>
                      <div className="grid grid-cols-3 gap-2">
                        {barbers.map((barber) => (
                          <Button
                            key={barber.id}
                            type="button"
                            variant={selectedBarber === barber.id ? "default" : "outline"}
                            onClick={() => setSelectedBarber(barber.id)}
                        className={`justify-start h-auto py-3 rounded-xl transition-all overflow-hidden ${
                          selectedBarber === barber.id
                            ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg"
                            : "bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-blue-50 hover:border-blue-300"
                        }`}
                        style={{ textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180 }}
                          >
                            {barber.name}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Serviço</label>
                      <div className="grid grid-cols-2 gap-2">
                        {services.map((service) => (
                          <Button
                            key={service.id}
                            type="button"
                            variant={selectedService === service.id ? "default" : "outline"}
                            onClick={() => setSelectedService(service.id)}
                            className={`h-auto flex flex-col items-start p-4 rounded-xl transition-all ${
                              selectedService === service.id
                                ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg"
                                : "bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-amber-50 hover:border-amber-300"
                            }`}
                          >
                            <span className="font-medium">{service.name}</span>
                            <div className="flex justify-between w-full mt-2">
                              <span className="text-xs opacity-80">{service.duration_minutes} min</span>
                              <span className="text-xs opacity-80">R$ {Number(service.price).toFixed(2)}</span>
                            </div>
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Horário</label>
                      <div className="grid grid-cols-4 gap-2 min-h-10">
                        {loadingTimes ? (
                          <span className="col-span-4 text-slate-500 text-center py-4">Carregando horários...</span>
                        ) : availableTimes.length === 0 ? (
                          <span className="col-span-4 text-slate-500 text-center py-4">Nenhum horário disponível</span>
                        ) : (
                          availableTimes.map((time) => (
                            <Button
                              key={time}
                              type="button"
                              variant={selectedTime === time ? "default" : "outline"}
                              onClick={() => setSelectedTime(time)}
                              className={`py-2 rounded-lg transition-all ${
                                selectedTime === time
                                  ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg"
                                  : "bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-green-50 hover:border-green-300"
                              }`}
                            >
                              {time}
                            </Button>
                          ))
                        )}
                      </div>
                    </div>

                    <Button
                      className="w-full mt-6 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 py-3 rounded-xl"
                      disabled={!selectedBarber || !selectedService || !selectedTime || !clientName.trim() || !clientPhone.trim()}
                      onClick={handleCreateAppointment}
                    >
                      Confirmar Agendamento
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="col-span-1 md:col-span-2 backdrop-blur-sm bg-white/80 border border-white/20 shadow-lg rounded-2xl">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-slate-800">
                  <CalendarIcon className="mr-3 h-5 w-5 text-blue-600" />
                  <span className="bg-gradient-to-r from-slate-800 to-blue-600 bg-clip-text text-transparent">
                    {selectedDate ? format(selectedDate, "dd 'de' MMMM", { locale: ptBR }) : "Hoje"}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-slate-500 mt-2">Carregando...</p>
                  </div>
                ) : filteredAppointments.length === 0 ? (
                  <div className="text-center py-12">
                    <CalendarIcon className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">Nenhum agendamento encontrado para esta data.</p>
                  </div>
                ) : (
                  filteredAppointments.map((appointment, idx) => (
                    <div
                      key={appointment.id}
                      className={`p-4 backdrop-blur-sm rounded-xl flex items-center justify-between transition-all hover:shadow-md ${
                        appointment.status === "pending"
                          ? "bg-gradient-to-r from-amber-50/80 to-amber-100/60 border border-amber-200/50"
                          : "bg-gradient-to-r from-green-50/80 to-green-100/60 border border-green-200/50"
                      }${idx !== 0 ? " mt-3" : ""}`}
                    >
                      <div className="flex items-center">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-semibold shadow-lg">
                          {appointment.client?.name && appointment.client.name !== "Cliente não informado"
                            ? appointment.client.name
                                .split(" ")
                                .map((name: string) => name[0])
                                .join("")
                                .substring(0, 2)
                            : "CN"}
                        </div>
                        <div className="ml-4">
                          <div className="font-semibold text-slate-800">{appointment.client?.name || "Cliente não informado"}</div>
                          <div className="text-sm text-slate-600">
                            {appointment.service?.name || "Serviço selecionado"}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="text-right mr-4">
                          <div className="flex items-center text-slate-700">
                            <Clock size={14} className="mr-2 text-blue-600" />
                            <span className="font-medium">
                              {appointment.start_at
                                ? new Date(appointment.start_at).toLocaleTimeString("pt-BR", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : "--:--"}
                            </span>
                          </div>
                          <div className="text-sm text-slate-500 mt-1">{appointment.barber?.name || "Barbeiro"}</div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm bg-white/80 border border-white/20 shadow-lg rounded-2xl">
              <CardHeader className="pb-4">
                <CardTitle className="bg-gradient-to-r from-slate-800 to-blue-600 bg-clip-text text-transparent">
                  Calendário
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md pointer-events-auto"
                  locale={ptBR}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

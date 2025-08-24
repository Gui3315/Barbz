"use client"

import { DashboardLayout } from "@/components/dashboard/layout"
import { getAvailableTimeSlots } from "@/utils/availabilityUtils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { CalendarIcon, Clock, Plus, X, ChevronLeft, ChevronRight, User, Calendar as CalendarIcon2 } from "lucide-react"
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
import { createPortal } from "react-dom"


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
  duration_minutes_snapshot?: number
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

  // Estados para reagendamento (proprietário)
  const [isRescheduling, setIsRescheduling] = useState(false)
  const [reschedulingAppointment, setReschedulingAppointment] = useState(null)
  const [rescheduleDate, setRescheduleDate] = useState("")
  const [rescheduleTime, setRescheduleTime] = useState("")
  const [rescheduleAvailableSlots, setRescheduleAvailableSlots] = useState([])
  const [rescheduleLoading, setRescheduleLoading] = useState(false)

  // Função para gerar horários disponíveis considerando agendamentos existentes
  useEffect(() => {
    const fetchAvailableTimes = async () => {
      setLoadingTimes(true)
      setAvailableTimes([])
      
      if (!newAppointmentDate || !selectedBarber || !selectedService) {
        setLoadingTimes(false)
        return
      }
      
      try {
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

        // Formato da data para a função (YYYY-MM-DD)
        const dateString = format(newAppointmentDate, "yyyy-MM-dd")
        
        // Usar a função unificada do availabilityUtils
        const availableSlots = await getAvailableTimeSlots(
          selectedBarber,
          selectedService,
          dateString,
          barbershopId
        )
        
        setAvailableTimes(availableSlots)
        setLoadingTimes(false)
      } catch (error) {
        console.error("Erro ao buscar horários disponíveis:", error)
        setAvailableTimes([])
        setLoadingTimes(false)
      }
    }
    
    fetchAvailableTimes()
  }, [newAppointmentDate, selectedBarber, selectedService])

  // Buscar dados do Supabase

  useEffect(() => {
  const fetchData = async () => {
    setLoading(true)
    
    // PRIMEIRO: Buscar barbershop_id do usuário logado
    const user = supabase.auth.getUser ? (await supabase.auth.getUser()).data.user : null
    let barbershopId = null
    if (user) {
      const { data: barbershop } = await supabase.from("barbershops").select("id").eq("owner_id", user.id).single()
      if (barbershop) {
        barbershopId = barbershop.id
      }
    }

    // DEPOIS: Buscar barbeiros da barbearia
    let barbersData = []
    if (barbershopId) {
      const { data } = await supabase.from("barbers").select("*").eq("barbershop_id", barbershopId)
      barbersData = data || []
    }
    setBarbers(barbersData.map((b: any) => ({ id: b.id, name: b.name })))

    // DEPOIS: Buscar serviços da barbearia
    let servicesData = []
    if (barbershopId) {
      const { data } = await supabase.from("services").select("*").eq("barbershop_id", barbershopId)
      servicesData = data || []
    }
    setServices(
      servicesData.map((s: any) => ({
        id: s.id,
        name: s.name,
        duration_minutes: s.duration_minutes,
        price: s.price,
      })),
    )


      

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
        console.log('RPC Response:', data) // ← Adicione esta linha
console.log('RPC Error:', error)   // ← Adicione esta linha
        if (error) {
          
          console.error("Erro ao buscar agendamentos:", error)
          setAppointments([])
          setLoading(false)
          return
        }
        appointmentsData = data || []
        
      }
      console.log('appointmentsData:', appointmentsData);
console.log('client_name do primeiro:', appointmentsData[0]?.client_name);
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
        duration_minutes_snapshot: a.duration_minutes_snapshot,
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

  // VALIDAÇÃO ADICIONAL: Verificar se o barbeiro pertence à barbearia
  const selectedBarberObj = barbers.find(b => b.id === selectedBarber)
  if (!selectedBarberObj) {
    toast({
      title: "Erro de validação",
      description: "Barbeiro não encontrado ou não pertence à sua barbearia.",
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

    // Usar a mesma lógica da página de agendamentos
    const createLocalDateTime = (date, time) => {
      const [hours, minutes] = time.split(':');
      const dateTime = new Date(date);
      dateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      return dateTime;
    };

    // Calcular horários usando a mesma lógica
    const service = services.find((s) => s.id === selectedService)
    const duration = service ? service.duration_minutes : 30
    const total_price = service ? Number(service.price) : 0

    const startDateTime = createLocalDateTime(newAppointmentDate, selectedTime);
    const startDateTimeUTC = new Date(startDateTime.getTime() - (3 * 60 * 60 * 1000));
    const start_at = startDateTimeUTC.toISOString();

    const endDateTime = new Date(startDateTimeUTC.getTime() + duration * 60000);
    const end_at = endDateTime.toISOString();

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

  const handleCancelAppointment = async (appointmentId: string) => {
  if (!confirm("Tem certeza que deseja cancelar este agendamento?")) return

  try {
    // Buscar dados do agendamento para pegar client_id e start_at
    const { data: appointment } = await supabase
      .from("appointments")
      .select("client_id, start_at")
      .eq("id", appointmentId)
      .single();

    const { error } = await supabase
      .from("appointments")
      .update({ status: "cancelled" })
      .eq("id", appointmentId);

    if (error) throw error

    alert("Agendamento cancelado com sucesso!")

    // Notificar o cliente
    const clientId = appointment?.client_id;
    const startAtRaw = appointment?.start_at;
    if (clientId && startAtRaw) {
      const dateObj = new Date(startAtRaw);
      const dateStr = dateObj.toISOString().slice(0, 10).split('-').reverse().join('/');
      const timeStr = dateObj.toISOString().slice(11, 16);

      await fetch("https://pygfljhhoqxyzsehvgzz.supabase.co/functions/v1/send-push", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer SEU_TOKEN"
        },
        body: JSON.stringify({
          userId: clientId,
          title: "Agendamento cancelado",
          body: `Seu agendamento para ${dateStr} às ${timeStr} foi cancelado pelo barbeiro.`
        })
      });
    }

    const user = supabase.auth.getUser ? (await supabase.auth.getUser()).data.user : null
    let barbershopId = null
    if (user) {
      const { data: barbershop } = await supabase.from("barbershops").select("id").eq("owner_id", user.id).single()
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
          duration_minutes_snapshot: a.duration_minutes_snapshot,
        }))
      )
    }    
    
  } catch (error) {
    console.error("Erro ao cancelar agendamento:", error)
    alert("Erro ao cancelar agendamento. Tente novamente.")
  }
}

  // Função utilitária para criar datas no fuso correto
  const createLocalDateTime = (date, time) => {
    const dateTimeString = `${date}T${time}:00.000`;
    return new Date(dateTimeString);
  };

  // Gerar datas para os próximos 30 dias
  const getAvailableDates = () => {
    const dates = []
    const today = new Date()
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      dates.push(date.toISOString().split('T')[0])
    }
    
    return dates
  }

  // Função para buscar horários disponíveis para reagendamento
  const fetchAvailableSlotsForReschedule = async (appointmentId, barberId, serviceId, date, barbershopId) => {
    if (!barberId || !serviceId || !date || !barbershopId) {
      console.error("Parâmetros faltando para reagendamento:", { appointmentId, barberId, serviceId, date, barbershopId })
      setRescheduleAvailableSlots([])
      return
    }

    try {
      setRescheduleLoading(true)
      
      // Usar a função unificada do availabilityUtils
      const availableSlots = await getAvailableTimeSlots(
        barberId,
        serviceId,
        date,
        barbershopId
      )
      
      console.log(`Total slots disponíveis para reagendamento:`, availableSlots)
      setRescheduleAvailableSlots(availableSlots)
      
    } catch (error) {
      console.error("Erro ao buscar horários:", error)
      setRescheduleAvailableSlots([])
    } finally {
      setRescheduleLoading(false)
    }
  }

  // Função para iniciar reagendamento
  const startRescheduling = (appointment) => {
    setReschedulingAppointment(appointment)
    setIsRescheduling(true)
    setRescheduleDate("")
    setRescheduleTime("")
    setRescheduleAvailableSlots([])
  }

  // Função para confirmar reagendamento
  const confirmReschedule = async () => {
    if (!reschedulingAppointment || !rescheduleDate || !rescheduleTime) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, selecione uma nova data e horário",
        variant: "destructive",
      })
      return
    }
    
    try {
      setRescheduleLoading(true)
      
      // Buscar duração do serviço
      const { data: appointmentServices } = await supabase
        .from("appointment_services")
        .select("duration_minutes_snapshot")
        .eq("appointment_id", reschedulingAppointment.id)
        .single()
      
      const duration = appointmentServices?.duration_minutes_snapshot || 30
      
      // Criar horários locais e salvar como UTC no banco
      const newStartDateTime = createLocalDateTime(rescheduleDate, rescheduleTime);
      const newStartDateTimeUTC = new Date(newStartDateTime.getTime() - (3 * 60 * 60 * 1000));
      const newEndDateTime = new Date(newStartDateTimeUTC.getTime() + duration * 60000);
      
      // Atualizar o agendamento
      const { error } = await supabase
        .from("appointments")
        .update({
          start_at: newStartDateTimeUTC.toISOString(),
          end_at: newEndDateTime.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq("id", reschedulingAppointment.id)
      
      if (error) throw error
      
      toast({
        title: "Agendamento reagendado",
        description: "Agendamento reagendado com sucesso!",
      })

      // Notificar o cliente sobre o reagendamento
      const clientId = reschedulingAppointment?.client?.id;
      const oldDateObj = new Date(reschedulingAppointment.start_at);
      const oldDateStr = oldDateObj.toISOString().slice(0, 10).split('-').reverse().join('/');
      const oldTimeStr = oldDateObj.toISOString().slice(11, 16);

      const newDateObj = new Date(newStartDateTimeUTC);
      const newDateStr = newDateObj.toISOString().slice(0, 10).split('-').reverse().join('/');
      const newTimeStr = newDateObj.toISOString().slice(11, 16);

      if (clientId) {
        await fetch("https://pygfljhhoqxyzsehvgzz.supabase.co/functions/v1/send-push", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer SEU_TOKEN"
          },
          body: JSON.stringify({
            userId: clientId,
            title: "Horário reagendado",
            body: `Seu agendamento foi reagendado de ${oldDateStr} às ${oldTimeStr} para ${newDateStr} às ${newTimeStr}.`
          })
        });
      }
      
      // Recarregar lista de agendamentos
      const user = supabase.auth.getUser ? (await supabase.auth.getUser()).data.user : null
      let barbershopId = null
      if (user) {
        const { data: barbershop } = await supabase.from("barbershops").select("id").eq("owner_id", user.id).single()
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
          (data || []).map((a) => ({
            id: a.id,
            start_at: a.start_at,
            end_at: a.end_at,
            status: a.status,
            total_price: a.total_price,
            notes: a.notes,
            client: { name: a.client_name },
            service: { name: a.service_name },
            barber: { name: a.barber_name },
            duration_minutes_snapshot: a.duration_minutes_snapshot,
          }))
        )
      }
      
      // Limpar estado de reagendamento
      setIsRescheduling(false)
      setReschedulingAppointment(null)
      setRescheduleDate("")
      setRescheduleTime("")
      setRescheduleAvailableSlots([])
      
    } catch (error) {
      console.error("Erro ao reagendar:", error)
      toast({
        title: "Erro ao reagendar",
        description: "Erro ao reagendar agendamento. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setRescheduleLoading(false)
    }
  }

  // Cancelar reagendamento
  const cancelReschedule = () => {
    setIsRescheduling(false)
    setReschedulingAppointment(null)
    setRescheduleDate("")
    setRescheduleTime("")
    setRescheduleAvailableSlots([])
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
                      <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200 shadow-sm p-3 flex justify-center">
                        <Calendar
                          mode="single"
                          selected={newAppointmentDate}
                          onSelect={setNewAppointmentDate}
                          className="rounded-md pointer-events-auto mx-auto"
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
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {services.map((service) => (
                        <Button
                          key={service.id}
                          type="button"
                          variant={selectedService === service.id ? "default" : "outline"}
                          onClick={() => setSelectedService(service.id)}
                          className={`h-auto flex flex-col items-start p-4 rounded-xl transition-all text-left ${
                            selectedService === service.id
                              ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg"
                              : "bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-amber-50 hover:border-amber-300"
                          }`}
                        >
                          <span className="font-medium text-sm leading-tight">{service.name}</span>
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
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 min-h-10">
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
                        appointment.status === "confirmed"
                        ? "border-green-200 bg-green-50"
                        : appointment.status === "cancelled"
                        ? "border-red-200 bg-red-50"
                        : "border-amber-200 bg-amber-50"
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
                        <div className="flex items-center gap-2">
                          <div className="font-semibold text-slate-800">
                            {appointment.client?.name || "Cliente não informado"}
                          </div>
                          {/* Badge de status */}
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium
                            ${appointment.status === "cancelled"
                              ? "bg-red-100 text-red-700"
                              : appointment.status === "confirmed"
                              ? "bg-green-100 text-green-700"
                              : "bg-amber-100 text-amber-700"
                            }`
                          }>
                            {appointment.status === "cancelled"
                              ? "Cancelado"
                              : appointment.status === "confirmed"
                              ? "Confirmado"
                              : "Pendente"}
                          </span>
                        </div>
                        <div className="text-sm text-slate-600">
                          <div>{appointment.service?.name || "Serviço selecionado"}</div>
                          {appointment.duration_minutes_snapshot && (
                            <span className="text-xs text-slate-500">
                              ({appointment.duration_minutes_snapshot}min)
                            </span>
                          )}
                        </div>
                      </div>
                      </div>
                    <div className="flex flex-col items-end">
                      {/* Botões de ação */}
                      {appointment.status !== "cancelled" && (
                        <div className="flex flex-row gap-2 mb-2">
                          <button
                            onClick={() => startRescheduling(appointment)}
                            className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors duration-200"
                            title="Reagendar"
                          >
                            <CalendarIcon2 size={16} />
                          </button>
                          <button
                            onClick={() => handleCancelAppointment(appointment.id)}
                            className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-200"
                            title="Cancelar agendamento"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      )}
                      <div className="flex flex-col items-end">
                      <div className="flex items-center text-slate-700">
                        <Clock size={14} className="mr-2 text-blue-600" />
                        <span className="font-medium">
                          {appointment.start_at
                            ? appointment.start_at.substring(11, 16)
                            : "--:--"}
                        </span>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="text-sm text-slate-500 mb-2">{appointment.barber?.name || "Barbeiro"}</div>
                        </div>
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
      {/* Modal de Reagendamento */}
        {isRescheduling && reschedulingAppointment && createPortal(
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-slate-800">Reagendar Horário</h3>
                  <button
                    onClick={cancelReschedule}
                    className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>
                
                <div className="space-y-4 mb-6">
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-slate-800 mb-2">Agendamento Atual</h4>
                    <div className="text-sm text-slate-600 space-y-1">
                      <p><strong>Cliente:</strong> {reschedulingAppointment.client?.name}</p>
                      <p><strong>Barbeiro:</strong> {reschedulingAppointment.barber?.name}</p>
                      <p><strong>Serviço:</strong> {reschedulingAppointment.service?.name}</p>
                      <p><strong>Data atual:</strong> {new Date(reschedulingAppointment.start_at.substring(0, 19)).toLocaleDateString('pt-BR')}</p>
                      <p><strong>Horário atual:</strong> {new Date(reschedulingAppointment.start_at.substring(0, 19)).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Nova Data
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
                        {getAvailableDates().map((date) => {
                          const dateObj = new Date(date + 'T00:00:00')
                          const dayName = dateObj.toLocaleDateString('pt-BR', { weekday: 'short' })
                          const dayNumber = dateObj.getDate()
                          const monthName = dateObj.toLocaleDateString('pt-BR', { month: 'short' })
                          
                          return (
                            <button
                              key={date}
                              onClick={() => {
                                setRescheduleDate(date)
                                setRescheduleTime("") // Limpar horário selecionado
                                
                                // Buscar barbershop_id
                                const fetchBarbershopAndSlots = async () => {
                                  const user = supabase.auth.getUser ? (await supabase.auth.getUser()).data.user : null
                                  let barbershopId = null
                                  if (user) {
                                    const { data: barbershop } = await supabase.from("barbershops").select("id").eq("owner_id", user.id).single()
                                    if (barbershop) {
                                      barbershopId = barbershop.id
                                    }
                                  }

                                  if (barbershopId) {
                                    // Buscar service_id do appointment_services
                                    const { data: appointmentService } = await supabase
                                      .from("appointment_services")
                                      .select("service_id")
                                      .eq("appointment_id", reschedulingAppointment.id)
                                      .single()
                                    
                                    if (appointmentService?.service_id) {
                                      // Buscar barber_id do próprio appointment
                                      const barberId = reschedulingAppointment.id ? 
                                        (await supabase.from("appointments").select("barber_id").eq("id", reschedulingAppointment.id).single()).data?.barber_id 
                                        : null

                                      if (barberId) {
                                        fetchAvailableSlotsForReschedule(
                                          reschedulingAppointment.id,
                                          barberId,
                                          appointmentService.service_id,
                                          date,
                                          barbershopId
                                        )
                                      }
                                    }
                                  }
                                }
                                fetchBarbershopAndSlots()
                              }}
                              className={`p-2 border-2 rounded-lg transition-all duration-200 text-center ${
                                rescheduleDate === date
                                  ? "border-blue-500 bg-blue-50"
                                  : "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                              }`}
                            >
                              <div className="text-xs text-slate-600 uppercase">{dayName}</div>
                              <div className="text-sm font-semibold text-slate-800">{dayNumber}</div>
                              <div className="text-xs text-slate-600">{monthName}</div>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                    
                    {rescheduleDate && (
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Novo Horário
                        </label>
                        {rescheduleLoading ? (
                          <div className="text-center py-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="text-slate-600 text-sm mt-2">Buscando horários...</p>
                          </div>
                        ) : rescheduleAvailableSlots.length === 0 ? (
                          <p className="text-slate-600 text-center py-4">
                            Nenhum horário disponível para esta data.
                          </p>
                        ) : (
                          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                            {rescheduleAvailableSlots.map((time) => (
                              <button
                                key={time}
                                onClick={() => setRescheduleTime(time)}
                                className={`p-2 border-2 rounded-lg transition-all duration-200 text-center font-medium ${
                                  rescheduleTime === time
                                    ? "border-green-500 bg-green-50"
                                    : "border-gray-200 hover:border-green-300 hover:bg-green-50"
                                }`}
                              >
                                {time}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={cancelReschedule}
                    className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={confirmReschedule}
                    disabled={!rescheduleDate || !rescheduleTime || rescheduleLoading}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {rescheduleLoading ? "Reagendando..." : "Confirmar Reagendamento"}
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </DashboardLayout>
  )
}

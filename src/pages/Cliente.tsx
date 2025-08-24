"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/lib/supabaseClient"
import { getOccupiedSlots } from "@/utils/availabilityUtils"
import { Send } from "lucide-react";
import { Link } from "react-router-dom"
import { getAvailableTimeSlots, getAvailableBarbersForSlot } from "@/utils/availabilityUtils"
import { ClientLayout } from "@/components/client/layout"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, User, LogOut, Camera, Save, Clock, Scissors, MapPin, CheckCircle, History, ClockIcon, X, ChevronLeft, ChevronRight } from "lucide-react"
import { createPortal } from "react-dom"


// Função para gerar slots de horário baseado no horário de abertura e fechamento
function generateTimeSlots(openTime: string, closeTime: string, intervalMinutes = 30): string[] {
  const slots: string[] = []

  // Converter horários para minutos
  const [openHour, openMin] = openTime.split(":").map(Number)
  const [closeHour, closeMin] = closeTime.split(":").map(Number)

  const openMinutes = openHour * 60 + openMin
  const closeMinutes = closeHour * 60 + closeMin

  // Gerar slots de intervalMinutes em intervalMinutes
  for (let minutes = openMinutes; minutes < closeMinutes; minutes += intervalMinutes) {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60

    const timeString = `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`
    slots.push(timeString)
  }

  return slots
}

// Função utilitária para criar datas no fuso correto
const createLocalDateTime = (date, time) => {
  // Criar data no formato ISO local sem conversão de fuso
  const dateTimeString = `${date}T${time}:00.000`;
  return new Date(dateTimeString);
};

export default function Cliente() {

  // No início do componente Cliente
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  const navigate = useNavigate();
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState("meus-agendamentos")
  const [clientData, setClientData] = useState<any>(null)
  const [profileData, setProfileData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  // Campos editáveis do perfil do cliente
  const [clientName, setClientName] = useState("")
  const [clientEmail, setClientEmail] = useState("")
  const [clientPhone, setClientPhone] = useState("")

  // Estado para agendamento
  const [bookingStep, setBookingStep] = useState("barbershop") // barbershop -> method -> service/barber -> date -> time -> confirm
  const [bookingMethod, setBookingMethod] = useState("") // "by-time" ou "by-barber"
  const [selectedBarbershop, setSelectedBarbershop] = useState<any>(null)
  const [selectedService, setSelectedService] = useState<any>(null)
  const [selectedBarber, setSelectedBarber] = useState<any>(null)
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")
  
  // Dados para as opções
  const [barbershops, setBarbershops] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])
  const [barbers, setBarbers] = useState<any[]>([])
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [availableBarbers, setAvailableBarbers] = useState<any[]>([])
  const [filteredServices, setFilteredServices] = useState<any[]>([])
  const [bookingLoading, setBookingLoading] = useState(false)
  // Estado para aba "Meus Agendamentos"
  const [userAppointments, setUserAppointments] = useState<any[]>([])
  const [appointmentsLoading, setAppointmentsLoading] = useState(false)
  // Estado para reagendamento
  const [isRescheduling, setIsRescheduling] = useState(false)
  const [reschedulingAppointment, setReschedulingAppointment] = useState(null)
  const [rescheduleDate, setRescheduleDate] = useState("")
  const [rescheduleTime, setRescheduleTime] = useState("")
  const [rescheduleAvailableSlots, setRescheduleAvailableSlots] = useState([])
  const [rescheduleLoading, setRescheduleLoading] = useState(false)
  // Estado para carrossel de agendamentos
const [currentAppointmentIndex, setCurrentAppointmentIndex] = useState(0)

  // Função para buscar horários disponíveis para reagendamento
const fetchAvailableSlotsForReschedule = async (appointmentId, barberId, serviceId, date, barbershopId) => {
  if (!barberId || !serviceId || !date || !barbershopId) {
    console.error("Parâmetros faltando para reagendamento:", { appointmentId, barberId, serviceId, date, barbershopId })
    setRescheduleAvailableSlots([])
    return
  }

  try {
    setRescheduleLoading(true)
    
    // 1. Buscar duração do serviço
    const { data: service, error: serviceError } = await supabase
      .from("services")
      .select("duration_minutes")
      .eq("id", serviceId)
      .single()

    if (serviceError || !service) {
      console.error("Erro ao buscar serviço:", serviceError)
      setRescheduleAvailableSlots([])
      return
    }

    const serviceDuration = service.duration_minutes
    console.log(`🔍 REAGENDAMENTO - Serviço: ${serviceDuration} minutos`)

    // 2. Buscar horários ocupados EXCLUINDO o agendamento atual que está sendo reagendado
    const occupied = new Set<string>()
    
    const startUTC = new Date(date + 'T03:00:00.000Z')
    const endUTC = new Date(date + 'T02:59:59.999Z')
    endUTC.setDate(endUTC.getDate() + 1)

    const { data: appointments, error } = await supabase 
      .from("appointments") 
      .select("start_at, end_at, barbershop_id, id") 
      .eq("barber_id", barberId) 
      .gte("start_at", startUTC.toISOString()) 
      .lte("start_at", endUTC.toISOString()) 
      .in("status", ["confirmed", "pending"])
      .neq("id", appointmentId) // EXCLUIR o agendamento atual

    if (appointments && appointments.length > 0) { 
      const filteredAppointments = barbershopId  
        ? appointments.filter(apt => apt.barbershop_id === barbershopId) 
        : appointments 
      
      filteredAppointments.forEach(appointment => { 
        const start = new Date(appointment.start_at)
        const end = new Date(appointment.end_at)
        
        const localStart = new Date(start.getTime() + (3 * 60 * 60 * 1000))
        const localEnd = new Date(end.getTime() + (3 * 60 * 60 * 1000))
        
        const startMinutes = localStart.getHours() * 60 + localStart.getMinutes()
        const endMinutes = localEnd.getHours() * 60 + localEnd.getMinutes()
        
        for (let minutes = startMinutes; minutes < endMinutes; minutes += 30) {
          const hours = Math.floor(minutes / 60)
          const mins = minutes % 60
          const timeStr = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
          occupied.add(timeStr)
        }
      })
    }

    console.log(`🔍 REAGENDAMENTO - Horários ocupados (excluindo atual):`, Array.from(occupied))

    // 3. Buscar horário de funcionamento
    const dayIndex = new Date(date + 'T00:00:00').getDay()
    const weekDays = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
    const selectedDayKey = weekDays[dayIndex]

    const { data: schedule, error: scheduleError } = await supabase
      .from("barber_schedule")
      .select("open, close, active")
      .eq("barber_id", barberId)
      .eq("day", selectedDayKey)
      .single()

    if (scheduleError || !schedule?.active) {
      console.log(`Barbearia fechada no dia ${selectedDayKey}`)
      setRescheduleAvailableSlots([])
      return
    }

    // 4. Buscar dados do barbeiro (horário de almoço)
    const { data: barber } = await supabase
      .from("barbers")
      .select("lunch_start, lunch_end")
      .eq("id", barberId)
      .single()

    // 5. Gerar todos os slots possíveis
    const slots = generateTimeSlots(schedule.open, schedule.close)
    
    // 6. Verificar disponibilidade considerando a duração correta do serviço
    const available = slots.filter((slot) => {
      const [slotH, slotM] = slot.split(':').map(Number)
      const [closeH, closeM] = schedule.close.split(':').map(Number)
      
      const slotMinutes = slotH * 60 + slotM
      const closeMinutes = closeH * 60 + closeM
      const serviceEndMinutes = slotMinutes + serviceDuration
      
      // Verificar se cabe até fechamento
      if (serviceEndMinutes > closeMinutes) {
        return false
      }

      // VERIFICAÇÃO CORRIGIDA: Verificar se TODOS os slots necessários estão livres
      const slotsNeeded = Math.ceil(serviceDuration / 30)
      console.log(`🔍 REAGENDAMENTO - Slot ${slot} precisa de ${slotsNeeded} slots para ${serviceDuration} minutos`)
      
      let currentMinutes = slotMinutes
      for (let i = 0; i < slotsNeeded; i++) {
        const checkHour = Math.floor(currentMinutes / 60)
        const checkMin = currentMinutes % 60
        const checkTimeStr = `${checkHour.toString().padStart(2, '0')}:${checkMin.toString().padStart(2, '0')}`
        
        if (occupied.has(checkTimeStr)) {
          console.log(`❌ REAGENDAMENTO - Slot ${slot} conflito no slot ${i+1}/${slotsNeeded}: ${checkTimeStr}`)
          return false
        }
        
        currentMinutes += 30
      }

      // Verificar horário de almoço
      if (barber?.lunch_start && barber?.lunch_end) {
        const [lunchStartH, lunchStartM] = barber.lunch_start.split(':').map(Number)
        const [lunchEndH, lunchEndM] = barber.lunch_end.split(':').map(Number)
        
        const lunchStartMinutes = lunchStartH * 60 + lunchStartM
        const lunchEndMinutes = lunchEndH * 60 + lunchEndM
        const slotEndMinutes = slotMinutes + serviceDuration
        
        if (!(slotEndMinutes <= lunchStartMinutes || slotMinutes >= lunchEndMinutes)) {
          return false
        }
      }

      // Verificar se é hoje e já passou
      const now = new Date()
      const selectedDateObj = new Date(date + 'T00:00:00')
      const isToday = selectedDateObj.toDateString() === now.toDateString()
      
      if (isToday) {
        const slotTime = new Date(selectedDateObj)
        slotTime.setHours(slotH, slotM, 0, 0)
        
        if (slotTime <= now) {
          return false
        }
      }
      
      console.log(`✅ REAGENDAMENTO - Slot ${slot} DISPONÍVEL`)
      return true
    })
    
    console.log(`Total slots disponíveis para reagendamento:`, available)
    setRescheduleAvailableSlots(available)
    
  } catch (error) {
    console.error("❌ Erro ao buscar horários:", error)
    console.error("Error details:", error.message)
    setRescheduleAvailableSlots([])
  } finally {
    setRescheduleLoading(false)
    console.log("=== FIM FETCH RESCHEDULE ===")
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
    alert("Por favor, selecione uma nova data e horário")
    return
  }
  
  try {
    setRescheduleLoading(true)
    
    // Extrair duração do serviço
    const service = reschedulingAppointment.appointment_services?.[0]
    if (!service) {
      alert("Erro: informações do serviço não encontradas")
      return
    }
    
    // Criar horários locais e salvar como UTC no banco
    const newStartDateTime = createLocalDateTime(rescheduleDate, rescheduleTime);
    const newStartDateTimeUTC = new Date(newStartDateTime.getTime() - (3 * 60 * 60 * 1000));
    const newEndDateTime = new Date(newStartDateTimeUTC.getTime() + service.duration_minutes_snapshot * 60000);
    
    // Verificar conflitos uma última vez
    const { data: conflictCheck } = await supabase
      .from("appointments")
      .select("id")
      .eq("barber_id", reschedulingAppointment.barber_id)
      .neq("id", reschedulingAppointment.id) // Excluir o próprio agendamento
      .or(`and(start_at.lt.${newEndDateTime.toISOString()},end_at.gt.${newStartDateTimeUTC.toISOString()})`)
      .eq("status", "confirmed")
    
    if (conflictCheck && conflictCheck.length > 0) {
      alert("Este horário não está mais disponível. Por favor, escolha outro horário.")
      fetchAvailableSlotsForReschedule(
        reschedulingAppointment.id,
        reschedulingAppointment.barber_id,
        service.service_id || reschedulingAppointment.appointment_services[0]?.id,
        rescheduleDate,
        reschedulingAppointment.barbershop_id
      )
      return
    }
    
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
    
    alert("Agendamento reagendado com sucesso!")

  // Notificar proprietário
  const ownerId = reschedulingAppointment?.barbershops?.owner_id;
  if (ownerId) {
      console.log("Enviando push para o proprietário:", ownerId);
      console.log("Enviando notificação push para reagendamento", ownerId, reschedulingAppointment.id);
    await fetch("https://pygfljhhoqxyzsehvgzz.supabase.co/functions/v1/send-push", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5Z2Zsamhob3F4eXpzZWh2Z3p6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwNTQxNDYsImV4cCI6MjA2OTYzMDE0Nn0.XIyECwK-8Zp39dGpC0Bdy95fCqD7glOdIJ-xUl7Rl5k" // Troque pela sua anon key real
      },
      body: JSON.stringify({
        userId: ownerId,
        title: "Novo reagendamento",
        body: `Cliente ${profileData?.user_name || ""} reagendou um horário.`
      })
    });
  }
    
    // Recarregar lista de agendamentos
    fetchUserAppointments()
    
    // Limpar estado de reagendamento
    setIsRescheduling(false)
    setReschedulingAppointment(null)
    setRescheduleDate("")
    setRescheduleTime("")
    setRescheduleAvailableSlots([])
    
  } catch (error) {
    console.error("Erro ao reagendar:", error)
    alert("Erro ao reagendar agendamento. Tente novamente.")
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

  // Buscar agendamentos do usuário
  const fetchUserAppointments = async () => {
    console.log("=== DEBUG FETCH APPOINTMENTS ===")
    
    const clientId = profileData?.id;
    
    if (!clientId) {
      console.log("❌ Saindo - sem ID do cliente")
      return
    }
    
    try {
      setAppointmentsLoading(true)
      
      console.log("Buscando agendamentos para cliente ID:", clientId)
      
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      const { data, error } = await supabase
      .from("appointments")
      .select(`
        *,
        barbers (name, phone),
        barbershops (name, owner_id, min_hours_before_cancel, min_hours_before_reschedule, profiles:owner_id(logo_url)),
        appointment_services (
          service_id,
          name_snapshot,
          price_snapshot,
          duration_minutes_snapshot
        )
      `)
        .eq("client_id", clientId)
        .gte("start_at", todayStart.toISOString())
        .order("start_at", { ascending: true })

      if (error) throw error;
      
      console.log("Dados retornados:", data);
      setUserAppointments(data || []);
      console.log("=================================")
      
    } catch (error) {
      console.error("Erro ao buscar agendamentos:", error)
      setUserAppointments([]);
    } finally {
      setAppointmentsLoading(false)
    }
  }

// Cancelar agendamento
const cancelAppointment = async (appointmentId: string) => {
  if (!confirm("Tem certeza que deseja cancelar este agendamento?")) return
  
  try {
    const { error } = await supabase
      .from("appointments")
      .update({ status: "cancelled" })
      .eq("id", appointmentId)
    
    if (error) throw error
    
    alert("Agendamento cancelado com sucesso!")
    fetchUserAppointments() // Recarregar lista

  const { data: appointment } = await supabase
  .from("appointments")
  .select("barbershops(owner_id), start_at")
  .eq("id", appointmentId)
  .single();

const ownerId = appointment?.barbershops?.owner_id;
const cancelledDate = new Date(appointment?.start_at);
const cancelledDateStr = cancelledDate.toLocaleDateString('pt-BR');
const cancelledTimeStr = cancelledDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
console.log("reschedulingAppointment.barbershops:", reschedulingAppointment?.barbershops);
if (ownerId) {
  await fetch("https://pygfljhhoqxyzsehvgzz.supabase.co/functions/v1/send-push", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5Z2Zsamhob3F4eXpzZWh2Z3p6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwNTQxNDYsImV4cCI6MjA2OTYzMDE0Nn0.XIyECwK-8Zp39dGpC0Bdy95fCqD7glOdIJ-xUl7Rl5k"
    },
    body: JSON.stringify({
      userId: ownerId,
      title: "Agendamento cancelado",
      body: `Cliente ${profileData?.user_name || ""} cancelou o horário de ${cancelledDateStr} às ${cancelledTimeStr}.`
    })
  });
}
    
  } catch (error) {
    console.error("Erro ao cancelar agendamento:", error)
    alert("Erro ao cancelar agendamento. Tente novamente.")
  }
}

// Função para filtrar serviços baseado no horário selecionado
const filterServicesForTimeSlot = async (timeSlot: string) => {
  console.log("=== FILTRAR SERVIÇOS ===")
  console.log("TimeSlot:", timeSlot)
  console.log("SelectedBarber:", selectedBarber?.name)
  console.log("SelectedBarbershop:", selectedBarbershop?.name)
  console.log("SelectedDate:", selectedDate)
  console.log("Services disponíveis:", services)
  
  if (!selectedBarber || !selectedBarbershop || !selectedDate) {
    console.log("Dados faltando, saindo...")
    return
  }

  const [slotH, slotM] = timeSlot.split(':').map(Number)
  const slotMinutes = slotH * 60 + slotM
  console.log("Slot em minutos:", slotMinutes)

  // Buscar horário de funcionamento
  const dayIndex = new Date(selectedDate + 'T00:00:00').getDay()
  const weekDays = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
  const selectedDayKey = weekDays[dayIndex]
  console.log("Dia da semana:", selectedDayKey)
  
  const { data: schedule } = await supabase
    .from("salon_schedule")
    .select("close")
    .eq("barbershop_id", selectedBarbershop.id)
    .eq("day", selectedDayKey)
    .single()

  console.log("Schedule:", schedule)

  // Primeiro, buscar horários ocupados do barbeiro para a data
  const occupied = await getOccupiedSlots(selectedBarber.id, selectedDate)

  const filtered = services.filter((service) => {
    console.log(`Verificando serviço: ${service.name} (${service.duration_minutes}min)`)
    const serviceEndMinutes = slotMinutes + service.duration_minutes
    console.log(`Termina em: ${serviceEndMinutes} minutos`)

    // Verificar se cabe até o fechamento
    if (schedule?.close) {
      const [closeH, closeM] = schedule.close.split(':').map(Number)
      const closeMinutes = closeH * 60 + closeM
      console.log(`Fechamento: ${closeMinutes} minutos`)
      if (serviceEndMinutes > closeMinutes) {
        console.log(`❌ Não cabe até fechamento (termina ${serviceEndMinutes}, fecha ${closeMinutes})`)
        return false
      }
    }

    // Verificar se conflita com horário de almoço
    if (selectedBarber?.lunch_start && selectedBarber?.lunch_end) {
      const [lunchStartH, lunchStartM] = selectedBarber.lunch_start.split(':').map(Number)
      const [lunchEndH, lunchEndM] = selectedBarber.lunch_end.split(':').map(Number)
      const lunchStartMinutes = lunchStartH * 60 + lunchStartM
      const lunchEndMinutes = lunchEndH * 60 + lunchEndM
      
      const hasOverlap = !(serviceEndMinutes <= lunchStartMinutes || slotMinutes >= lunchEndMinutes)
      
      if (hasOverlap) {
        console.log(`❌ Conflito com horário de almoço`)
        return false
      }
    }

    // NOVO: Verificar se o serviço cabe nos slots livres (ocupados)
    const slotsNeeded = Math.ceil(service.duration_minutes / 30)
    let canFit = true
    let currentMinutes = slotMinutes

    for (let i = 0; i < slotsNeeded; i++) {
      const checkHour = Math.floor(currentMinutes / 60)
      const checkMin = currentMinutes % 60
      const checkTimeStr = `${checkHour.toString().padStart(2,'0')}:${checkMin.toString().padStart(2,'0')}`

      if (occupied.has(checkTimeStr)) {
        console.log(`❌ Não cabe: conflito com agendamento existente em ${checkTimeStr}`)
        canFit = false
        break
      }

      currentMinutes += 30
    }

    if (!canFit) return false

    console.log(`✅ Serviço OK`)
    return true
  })


  console.log("Serviços filtrados:", filtered)
  setFilteredServices(filtered)
  console.log("======================")
}

  // Buscar barbearias
  const fetchBarbershops = async () => {
    try {
      const { data, error } = await supabase
        .from("barbershops")
        .select("id, name, whatsapp_number, whatsapp_message_title, whatsapp_message_text, profiles:owner_id(logo_url)")
        .order("name")
      
      if (error) throw error
      setBarbershops(data || [])
    } catch (error) {
      console.error("Erro ao buscar barbearias:", error)
    }
  }

  // Buscar serviços de uma barbearia
  const fetchServices = async (barbershopId: string) => {
    try {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("barbershop_id", barbershopId)
        .eq("is_active", true)
        .eq("barber_only", false)
        .order("name")
      
      if (error) throw error
      setServices(data || [])
    } catch (error) {
      console.error("Erro ao buscar serviços:", error)
    }
  }

  // Buscar barbeiros de uma barbearia
  const fetchBarbers = async (barbershopId: string) => {
    try {
      const { data, error } = await supabase
        .from("barbers")
        .select("*")
        .eq("barbershop_id", barbershopId)
        .eq("is_active", true)
        .order("name")
      
      if (error) throw error
      setBarbers(data || [])
    } catch (error) {
      console.error("Erro ao buscar barbeiros:", error)
    }
  }

  // Substitua a função fetchAvailableSlots por esta versão corrigida:
const fetchAvailableSlots = async (serviceId: string, date: string) => {
  if (!selectedBarbershop || !serviceId || !date) return
  
  try {
    setBookingLoading(true)
    
    // Se estamos agendando por barbeiro, usar o barbeiro selecionado
    if (bookingMethod === "by-barber" && selectedBarber) {
      const slots = await getAvailableTimeSlots(selectedBarber.id, serviceId, date, selectedBarbershop.id)
      setAvailableSlots(slots)
    } else if (bookingMethod === "by-time") {
      // Para agendamento por horário, vamos buscar todos os slots possíveis
      // considerando TODOS os barbeiros
      
      const allSlotsSet = new Set<string>()
      
      // Buscar slots de todos os barbeiros ativos
      for (const barber of barbers.filter(b => b.is_active)) {
        const barberSlots = await getAvailableTimeSlots(barber.id, serviceId, date, selectedBarbershop.id)
        barberSlots.forEach(slot => allSlotsSet.add(slot))
      }
      
      const allSlots = Array.from(allSlotsSet).sort()
      setAvailableSlots(allSlots)
    }
    
  } catch (error) {
    console.error("Erro ao buscar horários:", error)
    setAvailableSlots([])
  } finally {
    setBookingLoading(false)
  }
}

  // Substitua a função fetchAvailableBarbers por esta versão corrigida:
const fetchAvailableBarbers = async (timeSlot: string) => {
  if (!selectedBarbershop || !selectedDate || !selectedService) return
  
  try {
    setBookingLoading(true)
    
    const availableBarbersList = await getAvailableBarbersForSlot(
      timeSlot, 
      selectedService.id, 
      selectedDate, 
      selectedBarbershop.id
    )
    
    console.log(`Barbeiros disponíveis para ${timeSlot}:`, availableBarbersList.map(b => b.name))
    setAvailableBarbers(availableBarbersList)
    
  } catch (error) {
    console.error("Erro ao buscar barbeiros disponíveis:", error)
    setAvailableBarbers([])
  } finally {
    setBookingLoading(false)
  }
}

// Adicione esta função após fetchAvailableBarbers
const fetchAvailableSlotsForBarber = async (barberId: string, date: string) => {
  if (!selectedBarbershop || !barberId || !date) return
  
  try {
    setBookingLoading(true)
    
    // Para o fluxo por barbeiro, buscar slots do serviço mais curto (30 min)
    const shortestService = services.reduce((min, service) => 
      service.duration_minutes < min.duration_minutes ? service : min
    )
    
    const slots = await getAvailableTimeSlots(barberId, shortestService.id, date, selectedBarbershop.id)
    setAvailableSlots(slots)
    
  } catch (error) {
    console.error("Erro ao buscar horários:", error)
    setAvailableSlots([])
  } finally {
    setBookingLoading(false)
  }
}

  // Confirmar agendamento
  const confirmBooking = async () => {
  console.log("=== DEBUG AGENDAMENTO ===")
  console.log("Barbearia:", selectedBarbershop?.name)
  console.log("Barbeiro:", selectedBarber?.name) 
  console.log("Serviço:", selectedService?.name)
  console.log("Data:", selectedDate)
  console.log("Hora:", selectedTime)
  console.log("Cliente:", clientData?.id)
  console.log("========================")

  if (!selectedBarbershop || !selectedBarber || !selectedService || !selectedDate || !selectedTime) {
  alert("Dados incompletos para o agendamento")
  return
}

if (!clientData?.id && !profileData?.id) {
  alert("Dados do cliente não encontrados. Tente fazer login novamente.")
  return
}

    try {
      setBookingLoading(true)
      
      // Criar datetime local
      const startDateTime = createLocalDateTime(selectedDate, selectedTime);
      // Como o banco espera UTC, mas queremos salvar horário local, 
      // adicionar 3 horas para compensar a conversão automática
      const startDateTimeUTC = new Date(startDateTime.getTime() - (3 * 60 * 60 * 1000));
      const endDateTime = new Date(startDateTimeUTC.getTime() + selectedService.duration_minutes * 60000);

      console.log("=== CORREÇÃO FUSO ===");
      console.log("Horário selecionado:", selectedTime);
      console.log("DateTime local criado:", startDateTime.toLocaleString('pt-BR'));
      console.log("DateTime UTC para salvar:", startDateTimeUTC.toISOString());
      console.log("==================");

      console.log("=== DEBUG HORÁRIOS ===");
      console.log("Data selecionada:", selectedDate);
      console.log("Hora selecionada:", selectedTime);
      console.log("DateTime criado:", startDateTime);
      console.log("ISO String:", startDateTime.toISOString());
      console.log("Hora local:", startDateTime.toLocaleTimeString('pt-BR'));
      console.log("====================");
      
      // Verificar disponibilidade mais uma vez antes de confirmar
      const { data: conflictCheck } = await supabase
        .from("appointments")
        .select("id")
        .eq("barber_id", selectedBarber.id)
        .lte("start_at", endDateTime.toISOString())
        .gte("end_at", startDateTime.toISOString())
        .eq("status", "confirmed");
      
      if (conflictCheck && conflictCheck.length > 0) {
        alert("Este horário não está mais disponível. Por favor, escolha outro horário.");
        // Recarregar os slots disponíveis
        if (bookingMethod === "by-time") {
          fetchAvailableSlots(selectedService.id, selectedDate);
        } else {
          fetchAvailableSlots(selectedService.id, selectedDate);
        }
        return;
      }
      
      // Criar o agendamento
      const { data: appointment, error } = await supabase
        .from("appointments")
        .insert({
          barber_id: selectedBarber.id,
          barbershop_id: selectedBarbershop.id,
          client_id: profileData?.id,
          start_at: startDateTimeUTC.toISOString(),
          end_at: endDateTime.toISOString(),
          status: "confirmed",
          total_price: selectedService.price,
          user_id: profileData?.id
        })
        .select()
        .single()

      if (error) throw error

      // Criar o serviço do agendamento
      await supabase
        .from("appointment_services")
        .insert({
          appointment_id: appointment.id,
          service_id: selectedService.id,
          name_snapshot: selectedService.name,
          price_snapshot: selectedService.price,
          duration_minutes_snapshot: selectedService.duration_minutes
        })

      alert("Agendamento realizado com sucesso!")

    // ...após alert("Agendamento realizado com sucesso!")...

    // Buscar o owner_id da barbearia do agendamento
    const { data: barbershopData } = await supabase
      .from("barbershops")
      .select("owner_id")
      .eq("id", selectedBarbershop.id)
      .single();

    const ownerId = barbershopData?.owner_id;
    if (ownerId) {
      await fetch("https://pygfljhhoqxyzsehvgzz.supabase.co/functions/v1/send-push", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5Z2Zsamhob3F4eXpzZWh2Z3p6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwNTQxNDYsImV4cCI6MjA2OTYzMDE0Nn0.XIyECwK-8Zp39dGpC0Bdy95fCqD7glOdIJ-xUl7Rl5k"
        },
        body: JSON.stringify({
          userId: ownerId,
          title: "Novo agendamento",
          body: `Cliente ${profileData?.user_name || ""} agendou um horário.`
        })
      });
    }

      // Recarregar a lista de agendamentos
      fetchUserAppointments()

      // Reset form
      setBookingStep("barbershop")
      setBookingMethod("")
      setSelectedBarbershop(null)
      setSelectedService(null)
      setSelectedBarber(null)
      setSelectedDate("")
      setSelectedTime("")
      setAvailableSlots([])
      setAvailableBarbers([])

      // Voltar para a aba "Meus Agendamentos" para mostrar o novo agendamento
      setActiveTab("meus-agendamentos")
      
    } catch (error) {
      console.error("Erro ao confirmar agendamento:", error)
      alert("Erro ao realizar agendamento. Tente novamente.")
    } finally {
      setBookingLoading(false)
    }
  }

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

  // Carregar barbearias ao montar o componente
  useEffect(() => {
    fetchBarbershops()
  }, [])

  useEffect(() => {
  let isMounted = true;
  async function fetchClientAndProfile() {
    setLoading(true);
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser();
    if (!user || userError) {
      await supabase.auth.signOut();
      if (isMounted) navigate("/login", { replace: true });
      return;
    }
    
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, user_name, email, phone, profile_photo_url")
      .match({ id: user.id, user_type: "cliente" })
      .single();
      
    if (profileError?.message === "JWT expired") {
      await supabase.auth.signOut();
      if (isMounted) navigate("/login", { replace: true });
      return;
    }
    
    setClientData(null);
    setProfileData(profile || null);
    setClientName(profile?.user_name || "");
    setClientEmail(profile?.email || "");
    setClientPhone(profile?.phone || "");
    setLoading(false);
  }
  fetchClientAndProfile();
  return () => { isMounted = false; };
}, [navigate]);

useEffect(() => {
  if (profileData?.id) {
    fetchUserAppointments();
  }
}, [profileData?.id]);

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
              <button
                type="button"
                onClick={async () => {
                  await logout();
                  navigate("/", { replace: true });
                }}
                className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 group"
              >
                <LogOut size={18} className="group-hover:scale-110 transition-transform" />
                <span className="font-medium">Sair</span>
              </button>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl overflow-hidden">
            <Tabs defaultValue="meus-agendamentos" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full grid grid-cols-3 bg-slate-100/50 p-1 sm:p-2 rounded-none">
                <TabsTrigger
                  value="meus-agendamentos"
                  className="flex flex-col sm:flex-row gap-1 sm:gap-3 items-center py-2 px-1 sm:py-3 sm:px-6 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-slate-800 transition-all duration-200"
                >
                  <ClockIcon size={16} className="sm:size-5" />
                  <span className="font-medium text-xs sm:text-sm text-center">Meus Agendamentos</span>
                </TabsTrigger>                
                <TabsTrigger
                  value="agendamento"
                  className="flex flex-col sm:flex-row gap-1 sm:gap-3 items-center py-2 px-1 sm:py-3 sm:px-6 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-slate-800 transition-all duration-200"
                >
                  <Calendar size={16} className="sm:size-5" />
                  <span className="font-medium text-xs sm:text-sm">Agendamento</span>
                </TabsTrigger>
                <TabsTrigger
                  value="perfil"
                  className="flex flex-col sm:flex-row gap-1 sm:gap-3 items-center py-2 px-1 sm:py-3 sm:px-6 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-slate-800 transition-all duration-200"
                >
                  <User size={16} className="sm:size-5" />
                  <span className="font-medium text-xs sm:text-sm">Perfil</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="meus-agendamentos" className="p-6">
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold text-slate-800">Meus Agendamentos</h2>
                  <p className="text-slate-600">Visualize e gerencie seus próximos horários</p>
                </div>
                </div>
                

                {appointmentsLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-slate-600 mt-4">Carregando seus agendamentos...</p>
                  </div>
                ) : userAppointments.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar size={48} className="mx-auto mb-4 text-slate-400" />
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">Nenhum agendamento encontrado</h3>
                    <p className="text-slate-600 mb-6">Você ainda não possui agendamentos futuros.</p>
                    <button
                      onClick={() => setActiveTab("agendamento")}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      Agendar Horário
                    </button>
                  </div>
                ) : (
                <div className="relative">
                  {/* Navegação do carrossel */}
                  <div className="flex justify-between items-center mb-4">
                    <button
                      onClick={() => setCurrentAppointmentIndex(Math.max(0, currentAppointmentIndex - 1))}
                      disabled={currentAppointmentIndex === 0}
                      className="p-2 rounded-full bg-white border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    
                    <div className="flex gap-2">
                      {userAppointments.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentAppointmentIndex(index)}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            index === currentAppointmentIndex ? 'bg-blue-600' : 'bg-slate-300'
                          }`}
                        />
                      ))}
                    </div>
                    
                    <button
                      onClick={() => setCurrentAppointmentIndex(Math.min(userAppointments.length - 1, currentAppointmentIndex + 1))}
                      disabled={currentAppointmentIndex === userAppointments.length - 1}
                      className="p-2 rounded-full bg-white border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                  
                  {/* Card atual */}
                  <div className="overflow-hidden">
                    {(() => {
                      const appointment = userAppointments[currentAppointmentIndex];
                      const startDate = new Date(appointment.start_at.substring(0, 19))
                      const service = appointment.appointment_services?.[0]
                      const status = appointment.status
                      const isPending = status === "pending"
                      const isConfirmed = status === "confirmed"
                      const isCancelled = status === "cancelled"
                      
                      // Verificar se pode cancelar ou reagendar (até 2 horas antes)
											const now = new Date()
											const diffHours = (startDate.getTime() - now.getTime()) / (1000 * 60 * 60)
											const minCancel = appointment.barbershops?.min_hours_before_cancel ?? 2
											const minReschedule = appointment.barbershops?.min_hours_before_reschedule ?? 2
											const canCancel = !isCancelled && diffHours >= minCancel
											const canReschedule = !isCancelled && diffHours >= minReschedule
                      
                      return (
                        <div
                          key={appointment.id}
                          className={`bg-white rounded-xl border-2 p-4 sm:p-6 shadow-lg transition-all duration-200 w-full ${
                            isCancelled 
                              ? "border-red-200 bg-red-50" 
                              : isConfirmed 
                                ? "border-green-200 bg-green-50" 
                                : "border-amber-200 bg-amber-50"
                          }`}
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-2">
                                {appointment.barbershops?.profiles?.logo_url ? (
                                  <img
                                    src={appointment.barbershops.profiles.logo_url}
                                    alt={appointment.barbershops.name}
                                    className="w-8 h-8 rounded-lg object-cover border border-slate-200 bg-white"
                                  />
                                ) : (
                                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                                    <Scissors className="text-white" size={16} />
                                  </div>
                                )}
                                <span>{appointment.barbershops?.name}</span>
                              </div>
                                <span className={`px-0 py-1 rounded-full text-xs font-medium ${
                                  isCancelled 
                                    ? "bg-red-100 text-red-700"
                                    : isConfirmed 
                                      ? "bg-green-100 text-green-700"
                                      : "bg-amber-100 text-amber-700"
                                }`}>
                                  {isCancelled ? "Cancelado" : isConfirmed ? "Confirmado" : "Pendente"}
                                </span>
                              </div>
                              <p className="text-slate-600">
                                {startDate.toLocaleDateString('pt-BR', { 
                                  weekday: 'long', 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric' 
                                })}
                              </p>
                            </div>
                            
                            <div className="flex gap-2">
															{canReschedule && (
																<button
																	onClick={() => {
																		const service = appointment.appointment_services?.[0]
																		if (!service?.service_id) {
																			alert("Erro: Não foi possível encontrar informações do serviço. Tente atualizar a página.")
																			return
																		}
																		startRescheduling(appointment)
																	}}
																	className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors duration-200"
																	title="Reagendar"
																>
																	<Calendar size={20} />
																</button>
															)}
															{canCancel && (
																<button
																	onClick={() => cancelAppointment(appointment.id)}
																	className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-200"
																	title="Cancelar agendamento"
																>
																	<X size={20} />
																</button>
															)}
														</div>
                          </div>
                          
                          <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-4 text-sm">
                            <div className="space-y-1">
                              <p className="text-slate-500">Horário</p>
                              <p className="font-semibold text-slate-800">
                                {startDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                            
                            <div className="space-y-1">
                              <p className="text-slate-500">Barbeiro</p>
                              <p className="font-semibold text-slate-800">
                                {appointment.barbers?.name || "Não informado"}
                              </p>
                            </div>
                            
                            <div className="space-y-1">
                              <p className="text-slate-500">Serviço</p>
                              <p className="font-semibold text-slate-800">
                                {service?.name_snapshot || "Serviço não informado"}
                              </p>
                            </div>

                            <div className="space-y-1">
                              <p className="font-semibold text-slate-800">Aviso</p>
                              <p className="text-slate-500">Cancelamento: até {appointment.barbershops?.min_hours_before_cancel ?? 2}h antes</p>
                              <p className="text-slate-500">Reagendamento: até {appointment.barbershops?.min_hours_before_reschedule ?? 2}h antes</p>
                            </div>
                          </div>
                          
                          {service && (
                            <div className="mt-4 pt-4 border-t border-slate-200 flex justify-between items-center">
                              <span className="text-slate-600">
                                Duração: {service.duration_minutes_snapshot} min
                              </span>
                              <span className="text-lg font-bold text-green-600">
                                R$ {service.price_snapshot?.toFixed(2)}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>
  )}</TabsContent>

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
              <p><strong>Barbearia:</strong> {reschedulingAppointment.barbershops?.name}</p>
              <p><strong>Barbeiro:</strong> {reschedulingAppointment.barbers?.name}</p>
              <p><strong>Serviço:</strong> {reschedulingAppointment.appointment_services?.[0]?.name_snapshot}</p>
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
                        
                        const service = reschedulingAppointment.appointment_services?.[0]
                        console.log(service)
                        if (service && service.service_id) {
                          fetchAvailableSlotsForReschedule(
                            reschedulingAppointment.id,
                            reschedulingAppointment.barber_id,
                            service.service_id,
                            date,
                            reschedulingAppointment.barbershop_id
                          )
                        } else {
                          console.error("Service_id não encontrado:", service)
                          alert("Erro: ID do serviço não encontrado. Tente novamente.")
                        }
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

              <TabsContent value="agendamento" className="p-6">
                <div className="space-y-6">
                  {/* Header do agendamento */}
                  <div className="text-center space-y-2">
                    <h2 className="text-2xl font-bold text-slate-800">Novo Agendamento</h2>
                    <p className="text-slate-600">Siga os passos para agendar seu horário</p>
                  </div>

                  {/* Progress indicator */}
                  <div className="flex items-center justify-center space-x-4 mb-8">
                    <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
                      bookingStep === "barbershop" ? "bg-blue-100 text-blue-700" : 
                      ["method", "service", "barber", "date", "time", "confirm"].includes(bookingStep) ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                    }`}>
                      <MapPin size={16} />
                      <span>Barbearia</span>
                    </div>
                    <div className="w-8 h-px bg-gray-300"></div>
                    <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
                      bookingStep === "method" ? "bg-blue-100 text-blue-700" : 
                      ["service", "barber", "date", "time", "confirm"].includes(bookingStep) ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                    }`}>
                      <Clock size={16} />
                      <span>Método</span>
                    </div>
                    <div className="w-8 h-px bg-gray-300"></div>
                    <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
                      ["service", "barber"].includes(bookingStep) ? "bg-blue-100 text-blue-700" : 
                      ["date", "time", "confirm"].includes(bookingStep) ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                    }`}>
                      <Scissors size={16} />
                      <span>Serviço/Barbeiro</span>
                    </div>
                    <div className="w-8 h-px bg-gray-300"></div>
                    <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
                      ["date", "time"].includes(bookingStep) ? "bg-blue-100 text-blue-700" : 
                      bookingStep === "confirm" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                    }`}>
                      <Calendar size={16} />
                      <span>Data/Hora</span>
                    </div>
                  </div>

                  {/* Conteúdo dos passos */}
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    {/* Passo 1: Selecionar Barbearia */}
                    {bookingStep === "barbershop" && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4">Escolha a barbearia</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {barbershops.map((shop) => (
                            <button
                              key={shop.id}
                              onClick={() => {
                                setSelectedBarbershop(shop)
                                fetchServices(shop.id)
                                fetchBarbers(shop.id)
                                setBookingStep("method")
                              }}
                              className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 text-left"
                            >
                              <div className="flex items-center space-x-3">
                                {shop.profiles?.logo_url ? (
                                <img
                                  src={shop.profiles.logo_url}
                                  alt={shop.name}
                                  className="w-12 h-12 rounded-lg object-cover border border-slate-200 bg-white"
                                />
                              ) : (
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                                  <Scissors className="text-white" size={20} />
                                </div>
                              )}
                                <div>
                                  <h4 className="font-semibold text-slate-800">{shop.name}</h4>
                                  <p className="text-sm text-slate-600">Clique para selecionar</p>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Passo 2: Escolher método */}
                    {bookingStep === "method" && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4">Como deseja agendar?</h3>
                        <p className="text-sm text-slate-600 mb-6">Barbearia selecionada: <strong>{selectedBarbershop?.name}</strong></p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <button
                            onClick={() => {
                              setBookingMethod("by-time")
                              setBookingStep("service")
                            }}
                            className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200"
                          >
                            <div className="text-center space-y-3">
                              <Clock className="mx-auto text-blue-600" size={32} />
                              <h4 className="font-semibold text-slate-800">Por Horário</h4>
                              <p className="text-sm text-slate-600">Escolha o serviço, depois a data e horário, e veja os barbeiros disponíveis</p>
                            </div>
                          </button>
                          
                          <button
                            onClick={() => {
                              setBookingMethod("by-barber")
                              setBookingStep("barber")
                            }}
                            className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200"
                          >
                            <div className="text-center space-y-3">
                              <User className="mx-auto text-blue-600" size={32} />
                              <h4 className="font-semibold text-slate-800">Por Barbeiro</h4>
                              <p className="text-sm text-slate-600">Escolha o barbeiro, depois a data e horário disponível</p>
                            </div>
                          </button>
                        </div>

                        <button
                          onClick={() => {
                            setBookingStep("barbershop")
                            setSelectedBarbershop(null)
                            setBookingMethod("")
                          }}
                          className="mt-4 px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
                        >
                          ← Voltar
                        </button>
                      </div>
                    )}

                    {/* Passo 3A: Selecionar Serviço (Por horário) */}
                    {bookingStep === "service" && bookingMethod === "by-time" && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4">Escolha o serviço</h3>
                        {selectedBarbershop && (
                          <div className="mt-6 flex flex-col items-center border border-blue-200 rounded-xl p-4 bg-blue-50">
                            <span className="text-slate-700 font-medium mb-2">
                              {selectedBarbershop.whatsapp_message_title || "Não encontrou o serviço que está procurando?"}
                            </span>
                            <span className="text-slate-600 mb-2">
                              {selectedBarbershop.whatsapp_message_text || "Entre em contato pelo WhatsApp!"}
                            </span>
                            {selectedBarbershop.whatsapp_number ? (
                            <a
                              href={`https://wa.me/${selectedBarbershop.whatsapp_number.replace(/\D/g, "")}?text=${encodeURIComponent(selectedBarbershop.whatsapp_message_text || "Olá! Gostaria de saber mais sobre os serviços.")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg shadow transition"
                            >
                              <Send size={20} />
                              {selectedBarbershop.whatsapp_message_title || "Falar no WhatsApp"}
                            </a>
                          ) : (
                            <div className="flex items-center gap-2 px-4 py-2 bg-gray-400 text-white rounded-lg shadow cursor-not-allowed">
                              <Send size={20} />
                              WhatsApp não configurado
                            </div>
                          )}
                          </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {services.filter(service => !service.barber_only).map((service) => (
                            <button
                              key={service.id}
                              onClick={() => {
                                setSelectedService(service)
                                setBookingStep("date")
                              }}
                              className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 text-left"
                            >
                              <div className="space-y-2">
                                <h4 className="font-semibold text-slate-800">{service.name}</h4>
                                {service.description && (
                                  <p className="text-sm text-slate-600">{service.description}</p>
                                )}
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-slate-600">{service.duration_minutes} min</span>
                                  <span className="font-semibold text-green-600">R$ {service.price.toFixed(2)}</span>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>

                        <button
                          onClick={() => setBookingStep("method")}
                          className="mt-4 px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
                        >
                          ← Voltar
                        </button>
                      </div>
                    )}
                      </div>
                    {/* Passo 3B: Selecionar Barbeiro (Por barbeiro) */}
                    {bookingStep === "barber" && bookingMethod === "by-barber" && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4">Escolha o barbeiro</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {barbers.map((barber) => (
                            <button
                              key={barber.id}
                              onClick={() => {
                                setSelectedBarber(barber)
                                setBookingStep("date")
                              }}
                              className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 text-left"
                            >
                              <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center">
                                  <User className="text-white" size={20} />
                                </div>
                                <div>
                                  <h4 className="font-semibold text-slate-800">{barber.name}</h4>
                                  <p className="text-sm text-slate-600">{barber.phone || "Profissional"}</p>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>

                        <button
                          onClick={() => setBookingStep("method")}
                          className="mt-4 px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
                        >
                          ← Voltar
                        </button>
                      </div>
                    )}

                    {/* Passo 4: Selecionar Data */}
                    {bookingStep === "date" && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4">
                          Escolha a data
                          {bookingMethod === "by-time" && selectedService && (
                            <span className="text-sm font-normal text-slate-600 block">
                              Serviço: {selectedService.name} ({selectedService.duration_minutes} min)
                            </span>
                          )}
                          {bookingMethod === "by-barber" && selectedBarber && (
                            <span className="text-sm font-normal text-slate-600 block">
                              Barbeiro: {selectedBarber.name}
                            </span>
                          )}
                        </h3>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                          {getAvailableDates().map((date) => {
                            const dateObj = new Date(date + 'T00:00:00')
                            const dayName = dateObj.toLocaleDateString('pt-BR', { weekday: 'short' })
                            const dayNumber = dateObj.getDate()
                            const monthName = dateObj.toLocaleDateString('pt-BR', { month: 'short' })
                            
                            return (
                              <button
                                key={date}
                                onClick={() => {
                                  setSelectedDate(date)
                                  if (bookingMethod === "by-time") {
                                    fetchAvailableSlots(selectedService.id, date)
                                  } else {
                                    fetchAvailableSlotsForBarber(selectedBarber.id, date)
                                  }
                                  setBookingStep("time")
                                }}
                                className="p-3 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 text-center"
                              >
                                <div className="text-xs text-slate-600 uppercase">{dayName}</div>
                                <div className="text-lg font-semibold text-slate-800">{dayNumber}</div>
                                <div className="text-xs text-slate-600">{monthName}</div>
                              </button>
                            )
                          })}
                        </div>

                        <button
                          onClick={() => {
                            if (bookingMethod === "by-time") {
                              setBookingStep("service")
                            } else {
                              setBookingStep("barber")
                            }
                          }}
                          className="mt-4 px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
                        >
                          ← Voltar
                        </button>
                      </div>
                    )}

                    {/* Passo 5: Selecionar Horário */}
                    {bookingStep === "time" && (
                      <div className="space-y-4">
                        {bookingLoading ? (
                          <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="text-slate-600 mt-2">Buscando horários disponíveis...</p>
                          </div>
                        ) : (
                          <>
                            <h3 className="text-lg font-semibold text-slate-800 mb-4">
                              Escolha o horário
                              <span className="text-sm font-normal text-slate-600 block">
                                Data: {new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR')}
                                {bookingMethod === "by-time" && selectedService && (
                                  <> • Serviço: {selectedService.name}</>
                                )}
                                {bookingMethod === "by-barber" && selectedBarber && (
                                  <> • Barbeiro: {selectedBarber.name}</>
                                )}
                              </span>
                            </h3>
                            
                            {availableSlots.length === 0 ? (
                              <div className="text-center py-8 text-slate-600">
                                <Clock size={32} className="mx-auto mb-2 text-slate-400" />
                                <p>Nenhum horário disponível para esta data.</p>
                                <p className="text-sm">Tente selecionar outra data.</p>
                              </div>
                            ) : (
                              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                {availableSlots.map((time) => (
                                  <button
                                    key={time}
                                    onClick={() => {
                                    setSelectedTime(time)
                                    if (bookingMethod === "by-time") {
                                      fetchAvailableBarbers(time)
                                      setBookingStep("confirm")
                                    } else {
                                      filterServicesForTimeSlot(time)
                                      setBookingStep("service-selection")
                                    }
                                  }}
                                    className="p-3 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 text-center font-medium"
                                  >
                                    {time}
                                  </button>
                                ))}
                              </div>
                            )}
                          </>
                        )}

                        <button
                          onClick={() => setBookingStep("date")}
                          className="mt-4 px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
                        >
                          ← Voltar
                        </button>
                      </div>
                    )}

                    {/* Passo 6A: Selecionar Barbeiro (Por horário) */}
                    {bookingStep === "confirm" && bookingMethod === "by-time" && (
                      <div className="space-y-4">
                        {bookingLoading ? (
                          <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="text-slate-600 mt-2">Buscando barbeiros disponíveis...</p>
                          </div>
                        ) : (
                          <>
                            <h3 className="text-lg font-semibold text-slate-800 mb-4">
                              Escolha o barbeiro
                              <span className="text-sm font-normal text-slate-600 block">
                                {selectedService?.name} • {new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR')} às {selectedTime}
                              </span>
                            </h3>
                            
                            {availableBarbers.length === 0 ? (
                              <div className="text-center py-8 text-slate-600">
                                <User size={32} className="mx-auto mb-2 text-slate-400" />
                                <p>Nenhum barbeiro disponível para este horário.</p>
                                <p className="text-sm">Tente selecionar outro horário.</p>
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                {availableBarbers.map((barber) => (
                                  <button
                                    key={barber.id}
                                    onClick={() => {
                                      setSelectedBarber(barber)
                                    }}
                                    className={`p-4 border-2 rounded-lg transition-all duration-200 text-left ${
                                      selectedBarber?.id === barber.id
                                        ? "border-green-500 bg-green-50"
                                        : "border-gray-200 hover:border-blue-500 hover:bg-blue-50"
                                    }`}
                                  >
                                    <div className="flex items-center space-x-3">
                                      <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center">
                                        <User className="text-white" size={20} />
                                      </div>
                                      <div>
                                        <h4 className="font-semibold text-slate-800">{barber.name}</h4>
                                        <p className="text-sm text-slate-600">{barber.phone || "Profissional"}</p>
                                      </div>
                                      {selectedBarber?.id === barber.id && (
                                        <CheckCircle className="text-green-600 ml-auto" size={20} />
                                      )}
                                    </div>
                                  </button>
                                ))}
                              </div>
                            )}

                            {selectedBarber && (
                              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                                <h4 className="font-semibold text-slate-800 mb-4">Resumo do Agendamento</h4>
                                <div className="space-y-2 text-sm">
                                  <p><strong>Barbearia:</strong> {selectedBarbershop?.name}</p>
                                  <p><strong>Serviço:</strong> {selectedService?.name} ({selectedService?.duration_minutes} min)</p>
                                  <p><strong>Barbeiro:</strong> {selectedBarber.name}</p>
                                  <p><strong>Data:</strong> {new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
                                  <p><strong>Horário:</strong> {selectedTime}</p>
                                  <p><strong>Valor:</strong> R$ {selectedService?.price.toFixed(2)}</p>
                                </div>
                                
                                <button
                                  onClick={confirmBooking}
                                  disabled={bookingLoading}
                                  className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {bookingLoading ? "Confirmando..." : "Confirmar Agendamento"}
                                </button>
                              </div>
                            )}
                          </>
                        )}

                        <button
                          onClick={() => setBookingStep("time")}
                          className="mt-4 px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
                        >
                          ← Voltar
                        </button>
                      </div>
                    )}

                    {/* Passo 6B: Selecionar Serviço (Por barbeiro) */}
                    {bookingStep === "service-selection" && bookingMethod === "by-barber" && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4">
                          Escolha o serviço
                          <span className="text-sm font-normal text-slate-600 block">
                            {selectedBarber?.name} • {new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR')} às {selectedTime}
                          </span>
                        </h3>
                        {selectedBarbershop && (
                        <div className="mt-6 flex flex-col items-center border border-blue-200 rounded-xl p-4 bg-blue-50">
                          <span className="text-slate-700 font-medium mb-2">
                            {selectedBarbershop.whatsapp_message_title || "Não encontrou o serviço que está procurando?"}
                          </span>
                          <span className="text-slate-600 mb-2">
                            {selectedBarbershop.whatsapp_message_text || "Entre em contato pelo WhatsApp!"}
                          </span>
                          {selectedBarbershop.whatsapp_number ? (
                            <a
                              href={`https://wa.me/${selectedBarbershop.whatsapp_number.replace(/\D/g, "")}?text=${encodeURIComponent(selectedBarbershop.whatsapp_message_text || "Olá! Gostaria de saber mais sobre os serviços.")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg shadow transition"
                            >
                              <Send size={20} />
                              {selectedBarbershop.whatsapp_message_title || "Falar no WhatsApp"}
                            </a>
                          ) : (
                            <div className="flex items-center gap-2 px-4 py-2 bg-gray-400 text-white rounded-lg shadow cursor-not-allowed">
                              <Send size={20} />
                              WhatsApp não configurado
                            </div>
                          )}
                        </div>
                      )}
                        {filteredServices.length === 0 ? (
                        <div className="text-center py-8 text-slate-600">
                          <Scissors size={32} className="mx-auto mb-2 text-slate-400" />
                          <p>Nenhum serviço cabe no horário selecionado.</p>
                          <p className="text-sm">Tente selecionar outro horário.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                          {filteredServices.map((service) => (
                            <button
                              key={service.id}
                              onClick={() => {
                                setSelectedService(service)
                              }}
                              className={`p-4 border-2 rounded-lg transition-all duration-200 text-left ${
                                selectedService?.id === service.id
                                  ? "border-green-500 bg-green-50"
                                  : "border-gray-200 hover:border-blue-500 hover:bg-blue-50"
                              }`}
                            >
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-semibold text-slate-800">{service.name}</h4>
                                  {selectedService?.id === service.id && (
                                    <CheckCircle className="text-green-600" size={20} />
                                  )}
                                </div>
                                {service.description && (
                                  <p className="text-sm text-slate-600">{service.description}</p>
                                )}
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-slate-600">{service.duration_minutes} min</span>
                                  <span className="font-semibold text-green-600">R$ {service.price.toFixed(2)}</span>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                        )}
                        {selectedService && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                            <h4 className="font-semibold text-slate-800 mb-4">Resumo do Agendamento</h4>
                            <div className="space-y-2 text-sm">
                              <p><strong>Barbearia:</strong> {selectedBarbershop?.name}</p>
                              <p><strong>Barbeiro:</strong> {selectedBarber?.name}</p>
                              <p><strong>Serviço:</strong> {selectedService.name} ({selectedService.duration_minutes} min)</p>
                              <p><strong>Data:</strong> {new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
                              <p><strong>Horário:</strong> {selectedTime}</p>
                              <p><strong>Valor:</strong> R$ {selectedService.price.toFixed(2)}</p>
                            </div>
                            
                            <button
                              onClick={() => {
                                console.log("Clicou confirmar - Serviço selecionado:", selectedService?.name)
                                confirmBooking()
                              }}
                              disabled={bookingLoading}
                              className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {bookingLoading ? "Confirmando..." : "Confirmar Agendamento"}
                            </button>
                          </div>
                        )}

                        <button
                          onClick={() => setBookingStep("time")}
                          className="mt-4 px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
                        >
                          ← Voltar
                        </button>
                      </div>
                    )}
                  </div>
                
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
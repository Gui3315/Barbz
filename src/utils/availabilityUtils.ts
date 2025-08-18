// utils/availabilityUtils.ts
import { supabase } from "@/lib/supabaseClient"

// Função unificada para buscar horários ocupados de um barbeiro em uma data específica
export async function getOccupiedSlots(barberId: string, date: string): Promise<Set<string>> {
  const occupied = new Set<string>()
  
  try {
    // Criar range UTC correto para o dia selecionado (UTC-3 para BRT)
    const startUTC = new Date(date + 'T03:00:00.000Z') // 00:00 BRT = 03:00 UTC
    const endUTC = new Date(date + 'T02:59:59.999Z')   // 23:59 BRT
    endUTC.setDate(endUTC.getDate() + 1)

    // Buscar agendamentos do barbeiro para este dia
    const { data: appointments, error } = await supabase
      .from("appointments")
      .select("start_at, end_at")
      .eq("barber_id", barberId)
      .gte("start_at", startUTC.toISOString())
      .lte("start_at", endUTC.toISOString())
      .in("status", ["confirmed", "pending"])

    if (error) {
      console.error("Erro ao buscar agendamentos:", error)
      return occupied
    }

    // Marcar horários ocupados
    if (appointments && appointments.length > 0) {
      appointments.forEach(appointment => {
        const start = new Date(appointment.start_at)
        
        // Converter para horário local (BRT - UTC-3)
        const localStart = new Date(start.getTime() + (3 * 60 * 60 * 1000))
        
        // Marcar horário ocupado
        const timeStr = `${localStart.getHours().toString().padStart(2, '0')}:${localStart.getMinutes().toString().padStart(2, '0')}`
        occupied.add(timeStr)
        
        console.log(`Horário ocupado encontrado: ${timeStr} (original: ${start.toISOString()})`)
      })
    }
    
    return occupied
  } catch (error) {
    console.error("Erro na função getOccupiedSlots:", error)
    return occupied
  }
}

    // Função unificada para verificar disponibilidade de horários para um barbeiro
    export async function getAvailableTimeSlots(
      barberId: string, 
      serviceId: string, 
      date: string, 
      barbershopId: string
    ): Promise<string[]> {
      try {
        // Mapeamento de dias da semana
        const weekDays = [
          { key: "sunday", label: "Domingo" },
          { key: "monday", label: "Segunda" },
          { key: "tuesday", label: "Terça" },
          { key: "wednesday", label: "Quarta" },
          { key: "thursday", label: "Quinta" },
          { key: "friday", label: "Sexta" },
          { key: "saturday", label: "Sábado" },
        ]
        
        // 1. Buscar horário de funcionamento
        const dayIndex = new Date(date + 'T00:00:00').getDay()
        const selectedDayKey = weekDays[dayIndex].key
        
        console.log(`Buscando horário para o dia: ${selectedDayKey} (${weekDays[dayIndex].label})`)
        
        const { data: schedule, error: scheduleError } = await supabase
          .from("salon_schedule")
          .select("open, close, active")
          .eq("barbershop_id", barbershopId)
          .eq("day", selectedDayKey)
          .single()

    if (scheduleError || !schedule?.active) {
      console.log(`Barbearia fechada no ${weekDays[dayIndex].label}`)
      return []
    }

    // 2. Buscar duração do serviço
    const { data: service } = await supabase
      .from("services")
      .select("duration_minutes")
      .eq("id", serviceId)
      .single()

    const serviceDuration = service?.duration_minutes || 30

    // 3. Buscar dados do barbeiro (para horário de almoço)
    const { data: barber } = await supabase
      .from("barbers")
      .select("lunch_start, lunch_end")
      .eq("id", barberId)
      .single()

    // 4. Gerar todos os slots possíveis
    const slots = generateTimeSlots(schedule.open, schedule.close)
    
    // 5. Buscar horários ocupados
    const occupied = await getOccupiedSlots(barberId, date)
    
    // 6. Verificar disponibilidade de cada slot
    const available = slots.filter((slot) => {
      const [slotH, slotM] = slot.split(':').map(Number)
      const [closeH, closeM] = schedule.close.split(':').map(Number)
      
      // Verificar se já está ocupado
      if (occupied.has(slot)) {
        console.log(`Slot ${slot} ocupado`)
        return false
      }
      
      // Verificar se o serviço cabe até o fechamento
      const slotMinutes = slotH * 60 + slotM
      const closeMinutes = closeH * 60 + closeM
      const serviceEndMinutes = slotMinutes + serviceDuration
      
      if (serviceEndMinutes > closeMinutes) {
        console.log(`Slot ${slot} não cabe (termina ${serviceEndMinutes}, fecha ${closeMinutes})`)
        return false
      }

      // Verificar se toda a duração está livre
      let currentMinutes = slotMinutes
      const endMinutes = currentMinutes + serviceDuration
      
      while (currentMinutes < endMinutes) {
        const checkHour = Math.floor(currentMinutes / 60)
        const checkMin = currentMinutes % 60
        const checkTimeStr = `${checkHour.toString().padStart(2, '0')}:${checkMin.toString().padStart(2, '0')}`
        
        if (occupied.has(checkTimeStr)) {
          console.log(`Slot ${slot} conflito durante duração em ${checkTimeStr}`)
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
        
        // Verificar se há sobreposição com o horário de almoço
        if (!(slotEndMinutes <= lunchStartMinutes || slotMinutes >= lunchEndMinutes)) {
          console.log(`Slot ${slot} conflito com almoço`)
          return false
        }
      }

      // Verificar se é hoje e se o horário já passou
      const now = new Date()
      const selectedDateObj = new Date(date + 'T00:00:00')
      const isToday = selectedDateObj.toDateString() === now.toDateString()
      
      if (isToday) {
        const slotTime = new Date(selectedDateObj)
        slotTime.setHours(slotH, slotM, 0, 0)
        
        if (slotTime <= now) {
          console.log(`Slot ${slot} já passou (hoje)`)
          return false
        }
      }
      
      console.log(`Slot ${slot} DISPONÍVEL`)
      return true
    })
    
    console.log(`Total slots disponíveis para ${date}:`, available)
    return available
    
  } catch (error) {
    console.error("Erro ao buscar horários disponíveis:", error)
    return []
  }
}

// Função para gerar slots de horário (reutilizada do salonSchedule)
function generateTimeSlots(openTime: string, closeTime: string, intervalMinutes = 30): string[] {
  const slots: string[] = []

  const [openHour, openMin] = openTime.split(":").map(Number)
  const [closeHour, closeMin] = closeTime.split(":").map(Number)

  const openMinutes = openHour * 60 + openMin
  const closeMinutes = closeHour * 60 + closeMin

  for (let minutes = openMinutes; minutes < closeMinutes; minutes += intervalMinutes) {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60

    const timeString = `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`
    slots.push(timeString)
  }

  return slots
}

// Função unificada para buscar barbeiros disponíveis para um horário específico
export async function getAvailableBarbersForSlot(
  timeSlot: string,
  serviceId: string,
  date: string,
  barbershopId: string
): Promise<any[]> {
  try {
    // Buscar todos os barbeiros ativos
    const { data: allBarbers } = await supabase
      .from("barbers")
      .select("*")
      .eq("barbershop_id", barbershopId)
      .eq("is_active", true)

    if (!allBarbers || allBarbers.length === 0) {
      return []
    }

    // Buscar duração do serviço
    const { data: service } = await supabase
      .from("services")
      .select("duration_minutes")
      .eq("id", serviceId)
      .single()

    const serviceDuration = service?.duration_minutes || 30

    const availableBarbers = []

    for (const barber of allBarbers) {
      const availableSlots = await getAvailableTimeSlots(barber.id, serviceId, date, barbershopId)
      
      if (availableSlots.includes(timeSlot)) {
        availableBarbers.push(barber)
      }
    }

    return availableBarbers
  } catch (error) {
    console.error("Erro ao buscar barbeiros disponíveis:", error)
    return []
  }
}
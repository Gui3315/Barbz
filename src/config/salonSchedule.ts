// Configuração dos horários de funcionamento do salão
export const salonSchedule = [
  {
    day: "domingo",
    active: false,
    open: "09:00",
    close: "18:00",
  },
  {
    day: "segunda",
    active: true,
    open: "08:00",
    close: "18:00",
  },
  {
    day: "terca",
    active: true,
    open: "08:00",
    close: "18:00",
  },
  {
    day: "quarta",
    active: true,
    open: "08:00",
    close: "18:00",
  },
  {
    day: "quinta",
    active: true,
    open: "08:00",
    close: "18:00",
  },
  {
    day: "sexta",
    active: true,
    open: "08:00",
    close: "18:00",
  },
  {
    day: "sabado",
    active: true,
    open: "08:00",
    close: "17:00",
  },
]

// Função para gerar slots de horário baseado no horário de abertura e fechamento
export function generateTimeSlots(openTime: string, closeTime: string, intervalMinutes = 30): string[] {
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

// Função auxiliar para verificar se um horário está dentro do funcionamento
export function isTimeSlotAvailable(time: string, day: string): boolean {
  const dayConfig = salonSchedule.find((d) => d.day === day)

  if (!dayConfig || !dayConfig.active) {
    return false
  }

  const [hour, minute] = time.split(":").map(Number)
  const timeMinutes = hour * 60 + minute

  const [openHour, openMin] = dayConfig.open.split(":").map(Number)
  const [closeHour, closeMin] = dayConfig.close.split(":").map(Number)

  const openMinutes = openHour * 60 + openMin
  const closeMinutes = closeHour * 60 + closeMin

  return timeMinutes >= openMinutes && timeMinutes < closeMinutes
}

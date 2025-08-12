"use client"

import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabaseClient"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Helpers de horário
const SLOT_GRID_MINUTES = 30 // grade visual fixa de 30 min

// CORREÇÃO: Função para garantir data correta sem alterar timezone
function getBrazilianDate(date: Date) {
  // Não alterar o timezone, apenas extrair a data
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function getLocalOffsetTimestamp(dateObj: Date, timeStr: string) {
  // CORREÇÃO: Usar horário brasileiro fixo (UTC-3)
  const [y, m, d] = dateObj.toISOString().split("T")[0].split("-")
  const [hh, mm] = timeStr.split(":")

  // Usar offset fixo do Brasil (UTC-3)
  return `${y}-${m}-${d}T${hh}:${mm}:00-03:00`
}

// COMPONENTES REUTILIZÁVEIS
export function ServiceStep({ services, selectedService, setSelectedService, handleBack, handleNext }: any) {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
        Escolha o serviço
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {services.map((service: any) => (
          <div
            key={service.id}
            className={`group relative overflow-hidden backdrop-blur-sm bg-white/80 border-2 rounded-xl p-6 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${
              selectedService === service.id
                ? "border-amber-400 bg-gradient-to-br from-amber-50/80 to-orange-50/80 shadow-lg shadow-amber-100"
                : "border-slate-200 hover:border-slate-300"
            }`}
            onClick={() => setSelectedService(service.id)}
          >
            <div className="flex justify-between items-start">
              <h4 className="font-semibold text-slate-800 group-hover:text-slate-900">{service.name}</h4>
              {selectedService === service.id && <CheckCircle className="h-5 w-5 text-amber-500" />}
            </div>
            <div className="mt-3 text-sm text-slate-600 leading-relaxed">{service.description}</div>
            <div className="mt-4 flex justify-between items-center text-sm">
              <span className="flex items-center gap-2 text-slate-500">
                <Clock className="h-4 w-4" />
                {service.duration_minutes} min
              </span>
              <span className="font-semibold text-lg bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent">
                R$ {Number(service.price).toFixed(2)}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between pt-4">
        {handleBack && (
          <Button
            variant="outline"
            onClick={handleBack}
            className="px-6 py-2 border-slate-300 hover:bg-slate-50 bg-transparent"
          >
            Voltar
          </Button>
        )}
        <Button
          onClick={handleNext}
          disabled={!selectedService}
          className="px-8 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Próximo passo
        </Button>
      </div>
    </div>
  )
}

export function ProfessionalStep({ barbers, selectedBarber, setSelectedBarber, handleNext }: any) {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
        Escolha o profissional
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {barbers.map((barber: any) => (
          <div
            key={barber.id}
            className={`group relative overflow-hidden backdrop-blur-sm bg-white/80 border-2 rounded-xl p-6 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${
              barber.is_active === false ? "opacity-50 cursor-not-allowed" : ""
            } ${
              selectedBarber === barber.id
                ? "border-amber-400 bg-gradient-to-br from-amber-50/80 to-orange-50/80 shadow-lg shadow-amber-100"
                : "border-slate-200 hover:border-slate-300"
            }`}
            onClick={() => barber.is_active !== false && setSelectedBarber(barber.id)}
          >
            <div className="flex justify-between items-start">
              <h4 className="font-semibold text-slate-800 group-hover:text-slate-900">{barber.name}</h4>
              {selectedBarber === barber.id && <CheckCircle className="h-5 w-5 text-amber-500" />}
            </div>
            <div className="mt-3 text-sm">
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                  barber.is_active !== false ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                }`}
              >
                {barber.is_active !== false ? "Disponível" : "Indisponível"}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-end pt-4">
        <Button
          onClick={handleNext}
          disabled={!selectedBarber}
          className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
        >
          Próximo passo
        </Button>
      </div>
    </div>
  )
}

export function AvailableBarbersStep({
  availableBarbers,
  selectedBarber,
  setSelectedBarber,
  handleBack,
  handleNext,
  selectedTime,
}: any) {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
        Barbeiros disponíveis às {selectedTime}
      </h3>
      {availableBarbers.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center">
            <Clock className="h-8 w-8 text-slate-400" />
          </div>
          <p className="text-slate-500 text-lg">Nenhum barbeiro disponível neste horário.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {availableBarbers.map((barber: any) => (
            <div
              key={barber.id}
              className={`group relative overflow-hidden backdrop-blur-sm bg-white/80 border-2 rounded-xl p-6 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${
                selectedBarber === barber.id
                  ? "border-amber-400 bg-gradient-to-br from-amber-50/80 to-orange-50/80 shadow-lg shadow-amber-100"
                  : "border-slate-200 hover:border-slate-300"
              }`}
              onClick={() => setSelectedBarber(barber.id)}
            >
              <div className="flex justify-between items-start">
                <h4 className="font-semibold text-slate-800 group-hover:text-slate-900">{barber.name}</h4>
                {selectedBarber === barber.id && <CheckCircle className="h-5 w-5 text-amber-500" />}
              </div>
              <div className="mt-3 text-sm">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                  Disponível
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="flex justify-between pt-4">
        <Button
          variant="outline"
          onClick={handleBack}
          className="px-6 py-2 border-slate-300 hover:bg-slate-50 bg-transparent"
        >
          Voltar
        </Button>
        <Button
          onClick={handleNext}
          disabled={!selectedBarber || availableBarbers.length === 0}
          className="px-8 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Próximo passo
        </Button>
      </div>
    </div>
  )
}

export function ServiceDateTimeStep({
  date,
  setDate,
  selectedTime,
  setSelectedTime,
  handleBack,
  handleNext,
  availableSlots,
  loadingSlots,
}: any) {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
        Escolha a data e horário
      </h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h4 className="font-medium text-slate-700 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Selecione a data
          </h4>
          <div className="backdrop-blur-sm bg-white/80 border border-slate-200 rounded-xl p-4 shadow-sm">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="pointer-events-auto"
              disabled={{ before: new Date() }}
            />
          </div>
        </div>
        <div className="space-y-4">
          <h4 className="font-medium text-slate-700 flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            Selecione o horário
          </h4>
          <div className="grid grid-cols-3 gap-3 min-h-[200px]">
            {loadingSlots ? (
              <div className="col-span-3 flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-slate-500">Carregando horários...</span>
              </div>
            ) : availableSlots && availableSlots.length > 0 ? (
              availableSlots.map((time: string) => (
                <Button
                  key={time}
                  variant="outline"
                  className={`h-12 transition-all duration-200 ${
                    selectedTime === time
                      ? "border-amber-400 bg-gradient-to-br from-amber-50 to-orange-50 text-amber-700 shadow-md"
                      : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                  onClick={() => setSelectedTime(time)}
                >
                  {time}
                </Button>
              ))
            ) : (
              <div className="col-span-3 text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center">
                  <Clock className="h-8 w-8 text-slate-400" />
                </div>
                <span className="text-slate-500 text-lg">Fechado</span>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex justify-between pt-4">
        {handleBack && (
          <Button
            variant="outline"
            onClick={handleBack}
            className="px-6 py-2 border-slate-300 hover:bg-slate-50 bg-transparent"
          >
            Voltar
          </Button>
        )}
        <Button
          onClick={handleNext}
          disabled={!selectedTime}
          className="px-8 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Próximo passo
        </Button>
      </div>
    </div>
  )
}

export function ConfirmStep({
  selectedService,
  selectedBarber,
  date,
  selectedTime,
  services,
  barbers,
  handleBack,
  handleConfirm,
}: any) {
  const serviceObj = services.find((s: any) => s.id === selectedService)
  const barberObj = selectedBarber ? barbers.find((b: any) => b.id === selectedBarber) : null
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
        Confirme seu agendamento
      </h3>
      <div className="backdrop-blur-sm bg-gradient-to-br from-white/90 to-slate-50/90 border border-slate-200 rounded-xl p-6 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-slate-500 uppercase tracking-wide">Serviço</h4>
            <p className="text-lg font-semibold text-slate-800">{serviceObj?.name}</p>
            <p className="text-sm text-slate-600 leading-relaxed">{serviceObj?.description}</p>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-slate-500 uppercase tracking-wide">Profissional</h4>
            <p className="text-lg font-semibold text-slate-800">
              {barberObj ? barberObj.name : selectedBarber === null ? "A definir" : ""}
            </p>
            {selectedBarber === null && <p className="text-sm text-slate-600">(Será escolhido pela barbearia)</p>}
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-slate-500 uppercase tracking-wide">Data</h4>
            <p className="text-lg font-semibold text-slate-800">{date?.toLocaleDateString("pt-BR")}</p>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-slate-500 uppercase tracking-wide">Horário</h4>
            <p className="text-lg font-semibold text-slate-800">{selectedTime}</p>
          </div>
        </div>
        <Separator className="my-6" />
        <div className="flex justify-between items-center">
          <div>
            <h4 className="text-sm font-medium text-slate-500 uppercase tracking-wide">Valor Total</h4>
            <p className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent">
              R$ {Number(serviceObj?.price ?? 0).toFixed(2)}
            </p>
          </div>
        </div>
      </div>
      <div className="flex justify-between pt-4">
        <Button
          variant="outline"
          onClick={handleBack}
          className="px-6 py-2 border-slate-300 hover:bg-slate-50 bg-transparent"
        >
          Voltar
        </Button>
        <Button
          onClick={handleConfirm}
          className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
        >
          Confirmar agendamento
        </Button>
      </div>
    </div>
  )
}

// COMPONENTE PRINCIPAL
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { CalendarIcon, User } from "lucide-react"

type ClientBookingProps = {
  onBookingComplete?: () => void
}

import type { Database } from "@/lib/supabaseTypes"

type Barber = Database["public"]["Tables"]["barbers"]["Row"]
type Service = Database["public"]["Tables"]["services"]["Row"]
type Barbershop = Database["public"]["Tables"]["barbershops"]["Row"]

export default function ClientBooking({ onBookingComplete }: ClientBookingProps) {
  const { toast } = useToast()
  const [bookingMethod, setBookingMethod] = useState<"time" | "professional">("time")
  const [progressValue, setProgressValue] = useState(0)
  const [step, setStep] = useState(1)

  // Escolha de barbearia (cliente pode ter várias favoritas; aqui listamos todas por enquanto)
  const [shops, setShops] = useState<Barbershop[]>([])
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null)

  // Dados carregados da barbearia
  const [services, setServices] = useState<Service[]>([])
  const [barbers, setBarbers] = useState<Barber[]>([])

  // Estados para agendar por horário
  const [selectedServiceHorario, setSelectedServiceHorario] = useState<string | null>(null)
  const [dateHorario, setDateHorario] = useState<Date | null>(null)
  const [selectedTimeHorario, setSelectedTimeHorario] = useState<string | null>(null)
  const [selectedBarberHorario, setSelectedBarberHorario] = useState<string | null>(null)
  const [availableBarbersAtTime, setAvailableBarbersAtTime] = useState<Barber[]>([])
  const [availableSlotsHorario, setAvailableSlotsHorario] = useState<string[]>([])
  const [loadingSlotsHorario, setLoadingSlotsHorario] = useState(false)

  // Estados para agendar por profissional
  const [selectedBarberProfissional, setSelectedBarberProfissional] = useState<string | null>(null)
  const [selectedServiceProfissional, setSelectedServiceProfissional] = useState<string | null>(null)
  const [dateProfissional, setDateProfissional] = useState<Date | null>(null)
  const [selectedTimeProfissional, setSelectedTimeProfissional] = useState<string | null>(null)
  const [availableSlotsProfissional, setAvailableSlotsProfissional] = useState<string[]>([])
  const [loadingSlotsProfissional, setLoadingSlotsProfissional] = useState(false)

  // Resetar steps ao trocar método de agendamento
  useEffect(() => {
    setStep(1)
    // Reset estados do método anterior
    if (bookingMethod === "time") {
      setSelectedBarberProfissional(null)
      setSelectedServiceProfissional(null)
      setDateProfissional(null)
      setSelectedTimeProfissional(null)
    } else {
      setSelectedServiceHorario(null)
      setDateHorario(null)
      setSelectedTimeHorario(null)
      setSelectedBarberHorario(null)
      setAvailableBarbersAtTime([])
    }
  }, [bookingMethod])

  // Resetar barbeiro selecionado quando horário mudar
  useEffect(() => {
    setSelectedBarberHorario(null)
    setAvailableBarbersAtTime([])
  }, [selectedTimeHorario])

  // Progresso simples
  useEffect(() => {
    const totalSteps = bookingMethod === "time" ? 4 : 4 // Ambos agora têm 4 steps
    setProgressValue(((step - 1) / (totalSteps - 1)) * 100)
  }, [bookingMethod, step])

  // Carrega barbearias (RPC list_barbershops)
  useEffect(() => {
    ;(async () => {
      const { data, error } = await (supabase as any).rpc("list_barbershops", { p_search: null })
      if (!error && Array.isArray(data)) {
        setShops(data as any)
        if (!selectedShopId && data.length > 0) setSelectedShopId(data[0].id)
      }
    })()
  }, [])

  // Carrega serviços e barbeiros da barbearia
  useEffect(() => {
    if (!selectedShopId) return
    ;(async () => {
      const [{ data: svc }, { data: barb }] = await Promise.all([
        supabase.from("services").select("*").eq("barbershop_id", selectedShopId).eq("is_active", true),
        supabase.from("barbers").select("*").eq("barbershop_id", selectedShopId).eq("is_active", true),
      ])
      setServices((svc || []) as any)
      setBarbers((barb || []) as any)
    })()
  }, [selectedShopId])

  // Calcular intervalo baseado na duração do serviço
  const getServiceDuration = (serviceId: string | null) => {
    if (!serviceId) return 0
    const service = services.find((s) => s.id === serviceId)
    return service?.duration_minutes || 0
  }
  // Mantido para compat se algo dependia do nome antigo
  const getSlotStepMinutes = (serviceId: string | null) => SLOT_GRID_MINUTES

  // Buscar barbeiros disponíveis em um horário específico
  const fetchAvailableBarbersAtTime = async (time: string) => {
    if (!selectedShopId || !dateHorario || !selectedServiceHorario || !time) return

    // CORREÇÃO: Usar data simples sem conversão
    const isoDate = getBrazilianDate(dateHorario)

    const serviceDuration = getServiceDuration(selectedServiceHorario) || SLOT_GRID_MINUTES
    const availableBarbers: Barber[] = []
    for (const barber of barbers) {
      const { data, error } = await (supabase as any).rpc("get_available_time_slots", {
        p_date: isoDate,
        p_barber_id: barber.id,
        p_step_minutes: SLOT_GRID_MINUTES,
        p_service_duration_minutes: serviceDuration,
      })
      if (!error && Array.isArray(data)) {
        const hasSlot = data.some((slot: any) => slot.slot_time.substring(0, 5) === time && slot.is_available)
        if (hasSlot) availableBarbers.push(barber)
      }
    }
    setAvailableBarbersAtTime(availableBarbers)
  }

  // Buscar barbeiros quando horário for selecionado
  useEffect(() => {
    if (selectedTimeHorario && bookingMethod === "time") {
      fetchAvailableBarbersAtTime(selectedTimeHorario)
    }
  }, [selectedTimeHorario, selectedShopId, dateHorario, selectedServiceHorario, barbers, bookingMethod])

  // Função para recarregar slots
  const refetchSlotsHorario = useCallback(async () => {
    if (!selectedShopId || !dateHorario || !selectedServiceHorario || barbers.length === 0) {
      setAvailableSlotsHorario([])
      return
    }
    setLoadingSlotsHorario(true)

    // CORREÇÃO: Usar data simples sem conversão
    const isoDate = getBrazilianDate(dateHorario)

    const serviceDuration = getServiceDuration(selectedServiceHorario) || SLOT_GRID_MINUTES

    const allSlots = new Set<string>()
    for (const barber of barbers) {
      const { data, error } = await (supabase as any).rpc("get_available_time_slots", {
        p_date: isoDate,
        p_barber_id: barber.id,
        p_step_minutes: SLOT_GRID_MINUTES,
        p_service_duration_minutes: serviceDuration,
      })

      if (!error && Array.isArray(data)) {
        data.forEach((slot: any) => {
          if (slot.is_available) allSlots.add(slot.slot_time.substring(0, 5))
        })
      }
    }
    const slotsArray = Array.from(allSlots).sort()
    setAvailableSlotsHorario(slotsArray)
    setLoadingSlotsHorario(false)
  }, [selectedShopId, dateHorario, selectedServiceHorario, barbers])

  // Buscar horários disponíveis quando dados chave mudarem
  useEffect(() => {
    const fetchSlots = async () => {
      if (!selectedShopId || !dateHorario || !selectedServiceHorario || barbers.length === 0) {
        setAvailableSlotsHorario([])
        return
      }
      setLoadingSlotsHorario(true)

      // CORREÇÃO: Usar data simples sem conversão
      const isoDate = getBrazilianDate(dateHorario)

      const serviceDuration = getServiceDuration(selectedServiceHorario) || SLOT_GRID_MINUTES

      const allSlots = new Set<string>()
      for (const barber of barbers) {
        const { data, error } = await (supabase as any).rpc("get_available_time_slots", {
          p_date: isoDate,
          p_barber_id: barber.id,
          p_step_minutes: SLOT_GRID_MINUTES,
          p_service_duration_minutes: serviceDuration,
        })

        if (!error && Array.isArray(data)) {
          data.forEach((slot: any) => {
            if (slot.is_available) allSlots.add(slot.slot_time.substring(0, 5))
          })
        }
      }
      const slotsArray = Array.from(allSlots).sort()
      setAvailableSlotsHorario(slotsArray)
      setLoadingSlotsHorario(false)
    }
    fetchSlots()
  }, [selectedShopId, dateHorario, selectedServiceHorario, barbers])

  // Função para recarregar slots profissional
  const refetchSlotsProfissional = useCallback(async () => {
    if (!selectedShopId || !dateProfissional || !selectedServiceProfissional || !selectedBarberProfissional) {
      setAvailableSlotsProfissional([])
      return
    }
    setLoadingSlotsProfissional(true)

    // CORREÇÃO: Usar data simples sem conversão
    const isoDate = getBrazilianDate(dateProfissional)

    const serviceDuration = getServiceDuration(selectedServiceProfissional) || SLOT_GRID_MINUTES

    const { data, error } = await (supabase as any).rpc("get_available_time_slots", {
      p_date: isoDate,
      p_barber_id: selectedBarberProfissional,
      p_step_minutes: SLOT_GRID_MINUTES,
      p_service_duration_minutes: serviceDuration,
    })

    if (!error && Array.isArray(data)) {
      const slots = data.filter((slot: any) => slot.is_available).map((slot: any) => slot.slot_time.substring(0, 5))
      setAvailableSlotsProfissional(slots)
    } else {
      setAvailableSlotsProfissional([])
    }
    setLoadingSlotsProfissional(false)
  }, [selectedShopId, dateProfissional, selectedServiceProfissional, selectedBarberProfissional])

  // Buscar horários disponíveis para método profissional
  useEffect(() => {
    const fetchSlots = async () => {
      if (!selectedShopId || !dateProfissional || !selectedServiceProfissional || !selectedBarberProfissional) {
        setAvailableSlotsProfissional([])
        return
      }
      setLoadingSlotsProfissional(true)

      // CORREÇÃO: Usar data simples sem conversão
      const isoDate = getBrazilianDate(dateProfissional)

      const serviceDuration = getServiceDuration(selectedServiceProfissional) || SLOT_GRID_MINUTES

      const { data, error } = await (supabase as any).rpc("get_available_time_slots", {
        p_date: isoDate,
        p_barber_id: selectedBarberProfissional,
        p_step_minutes: SLOT_GRID_MINUTES,
        p_service_duration_minutes: serviceDuration,
      })

      if (!error && Array.isArray(data)) {
        const slots = data.filter((slot: any) => slot.is_available).map((slot: any) => slot.slot_time.substring(0, 5))
        setAvailableSlotsProfissional(slots)
      } else {
        setAvailableSlotsProfissional([])
      }
      setLoadingSlotsProfissional(false)
    }
    fetchSlots()
  }, [selectedShopId, dateProfissional, selectedServiceProfissional, selectedBarberProfissional])

  // Handlers para navegação de etapas
  // Horário
  const handleNextHorario = () => setStep((prev) => prev + 1)
  const handleBackHorario = () => setStep((prev) => prev - 1)
  const handleConfirmHorario = async () => {
    if (!selectedShopId || !selectedServiceHorario || !dateHorario || !selectedTimeHorario || !selectedBarberHorario)
      return
    const startISO = getLocalOffsetTimestamp(dateHorario, selectedTimeHorario)
    const { data, error } = await (supabase as any).rpc("create_appointment", {
      p_barbershop_id: selectedShopId,
      p_client_id: null,
      p_barber_id: selectedBarberHorario,
      p_start_at: startISO,
      p_service_ids: [selectedServiceHorario],
      p_notes: null,
    })

    if (error) {
      toast({ title: "Erro ao agendar", description: error.message, variant: "destructive" })
      return
    }

    toast({ title: "Agendamento criado!" })

    // Recarregar slots para remover horário recém usado
    setSelectedTimeHorario(null)
    setAvailableBarbersAtTime([])

    // Recarregar slots após um pequeno delay para garantir que o agendamento foi salvo
    setTimeout(async () => {
      // Aguardar um pouco mais para garantir que o banco foi atualizado
      await new Promise((resolve) => setTimeout(resolve, 500))
      await refetchSlotsHorario()
    }, 1000)

    onBookingComplete?.()
    setStep(1)
    setSelectedServiceHorario(null)
    setDateHorario(null)
    setSelectedBarberHorario(null)
  }
  // Profissional
  const handleNextProfissional = () => setStep((prev) => prev + 1)
  const handleBackProfissional = () => setStep((prev) => prev - 1)
  const handleConfirmProfissional = async () => {
    if (
      !selectedShopId ||
      !selectedServiceProfissional ||
      !dateProfissional ||
      !selectedTimeProfissional ||
      !selectedBarberProfissional
    )
      return
    const startISO = getLocalOffsetTimestamp(dateProfissional, selectedTimeProfissional)
    const { data, error } = await (supabase as any).rpc("create_appointment", {
      p_barbershop_id: selectedShopId,
      p_client_id: null,
      p_barber_id: selectedBarberProfissional,
      p_start_at: startISO,
      p_service_ids: [selectedServiceProfissional],
      p_notes: null,
    })

    if (error) {
      toast({ title: "Erro ao agendar", description: error.message, variant: "destructive" })
      return
    }

    toast({ title: "Agendamento criado!" })

    // Limpar seleção e recarregar slots
    setSelectedTimeProfissional(null)

    // Recarregar slots após um pequeno delay para garantir que o agendamento foi salvo
    setTimeout(async () => {
      // Aguardar um pouco mais para garantir que o banco foi atualizado
      await new Promise((resolve) => setTimeout(resolve, 500))
      await refetchSlotsProfissional()
    }, 1000)

    onBookingComplete?.()
    setStep(1)
    setSelectedBarberProfissional(null)
    setSelectedServiceProfissional(null)
    setDateProfissional(null)
  }

  return (
    <div className="space-y-6">
      <Card className="backdrop-blur-sm bg-gradient-to-br from-white/90 to-slate-50/90 border border-slate-200 shadow-xl">
        <CardHeader className="space-y-4">
          <div className="text-center space-y-2">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Faça seu agendamento
            </CardTitle>
            <CardDescription className="text-slate-600">Selecione uma barbearia e escolha seu horário</CardDescription>
          </div>

          <div className="max-w-sm mx-auto">
            <Select value={selectedShopId ?? undefined} onValueChange={(v) => setSelectedShopId(v)}>
              <SelectTrigger className="h-12 bg-white/80 border-slate-200 hover:border-slate-300 transition-colors">
                <SelectValue placeholder="Selecione a barbearia" />
              </SelectTrigger>
              <SelectContent>
                {shops.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Tabs
            defaultValue={bookingMethod}
            onValueChange={(value) => setBookingMethod(value as "time" | "professional")}
          >
            <TabsList className="grid w-full grid-cols-2 mb-4 mt-6 bg-slate-100/80 p-1 rounded-lg">
              <TabsTrigger
                value="time"
                className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200"
              >
                <CalendarIcon className="h-4 w-4" />
                Agendar por horário
              </TabsTrigger>
              <TabsTrigger
                value="professional"
                className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200"
              >
                <User className="h-4 w-4" />
                Agendar por profissional
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="space-y-2">
            <div className="flex justify-between text-sm text-slate-500">
              <span>Progresso</span>
              <span>{Math.round(progressValue)}%</span>
            </div>
            <Progress value={progressValue} className="h-2 bg-slate-100" />
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          {bookingMethod === "time" ? (
            <>
              {step === 1 && (
                <ServiceStep
                  services={services}
                  selectedService={selectedServiceHorario}
                  setSelectedService={setSelectedServiceHorario}
                  handleNext={handleNextHorario}
                />
              )}
              {step === 2 && (
                <ServiceDateTimeStep
                  date={dateHorario}
                  setDate={setDateHorario}
                  selectedTime={selectedTimeHorario}
                  setSelectedTime={setSelectedTimeHorario}
                  availableSlots={availableSlotsHorario}
                  loadingSlots={loadingSlotsHorario}
                  handleBack={handleBackHorario}
                  handleNext={handleNextHorario}
                />
              )}
              {step === 3 && (
                <AvailableBarbersStep
                  availableBarbers={availableBarbersAtTime}
                  selectedBarber={selectedBarberHorario}
                  setSelectedBarber={setSelectedBarberHorario}
                  selectedTime={selectedTimeHorario}
                  handleBack={handleBackHorario}
                  handleNext={handleNextHorario}
                />
              )}
              {step === 4 && (
                <ConfirmStep
                  selectedService={selectedServiceHorario}
                  selectedBarber={selectedBarberHorario}
                  date={dateHorario}
                  selectedTime={selectedTimeHorario}
                  services={services}
                  barbers={barbers}
                  handleBack={handleBackHorario}
                  handleConfirm={handleConfirmHorario}
                />
              )}
            </>
          ) : (
            <>
              {step === 1 && (
                <ProfessionalStep
                  barbers={barbers}
                  selectedBarber={selectedBarberProfissional}
                  setSelectedBarber={setSelectedBarberProfissional}
                  handleNext={handleNextProfissional}
                />
              )}
              {step === 2 && (
                <ServiceStep
                  services={services}
                  selectedService={selectedServiceProfissional}
                  setSelectedService={setSelectedServiceProfissional}
                  handleBack={handleBackProfissional}
                  handleNext={handleNextProfissional}
                />
              )}
              {step === 3 && (
                <ServiceDateTimeStep
                  date={dateProfissional}
                  setDate={setDateProfissional}
                  selectedTime={selectedTimeProfissional}
                  setSelectedTime={setSelectedTimeProfissional}
                  availableSlots={availableSlotsProfissional}
                  loadingSlots={loadingSlotsProfissional}
                  handleBack={handleBackProfissional}
                  handleNext={handleNextProfissional}
                />
              )}
              {step === 4 && (
                <ConfirmStep
                  selectedService={selectedServiceProfissional}
                  selectedBarber={selectedBarberProfissional}
                  date={dateProfissional}
                  selectedTime={selectedTimeProfissional}
                  services={services}
                  barbers={barbers}
                  handleBack={handleBackProfissional}
                  handleConfirm={handleConfirmProfissional}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

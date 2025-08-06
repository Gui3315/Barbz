// Estrutura de funcionamento do salão (mock inicial)
// Cada dia da semana tem ativo/inativo e horários de abertura/fechamento
export type SalonDay = {
  id: number;
  day: string; // "segunda", "terca", ...
  active: boolean;
  open: string; // "09:00"
  close: string; // "18:00"
};

export const salonSchedule: SalonDay[] = [
  { id: 1, day: "segunda", active: true, open: "09:00", close: "18:00" },
  { id: 2, day: "terca", active: true, open: "09:00", close: "18:00" },
  { id: 3, day: "quarta", active: true, open: "09:00", close: "18:00" },
  { id: 4, day: "quinta", active: true, open: "09:00", close: "18:00" },
  { id: 5, day: "sexta", active: true, open: "09:00", close: "18:00" },
  { id: 6, day: "sabado", active: true, open: "09:00", close: "14:00" },
  { id: 7, day: "domingo", active: false, open: "", close: "" },
];

// Função utilitária para gerar time slots de acordo com o horário de funcionamento
type TimeSlotOptions = { interval?: number };
export function generateTimeSlots(open: string, close: string, options: TimeSlotOptions = {}) {
  const interval = options.interval || 30; // minutos
  const slots: string[] = [];
  let [h, m] = open.split(":").map(Number);
  let [hEnd, mEnd] = close.split(":").map(Number);
  let start = h * 60 + m;
  let end = hEnd * 60 + mEnd;
  while (start < end) {
    const hour = Math.floor(start / 60).toString().padStart(2, "0");
    const min = (start % 60).toString().padStart(2, "0");
    slots.push(`${hour}:${min}`);
    start += interval;
  }
  return slots;
}

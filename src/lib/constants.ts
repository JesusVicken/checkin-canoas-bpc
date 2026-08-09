export const TIME_SLOTS = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00',
] as const

export type TimeSlot = typeof TIME_SLOTS[number]

export function getEndTime(startTime: string): string {
  const hour = parseInt(startTime.split(':')[0], 10)
  return `${String(hour + 1).padStart(2, '0')}:00`
}

export const CANOE_TYPE_LABELS: Record<string, string> = {
  V1: 'V1 — Individual',
  V3: 'V3 — 3 Lugares',
  V6: 'V6 — 6 Lugares',
  OC6: 'OC6 — 6 Lugares',
}

export const CANOE_TYPE_EMOJIS: Record<string, string> = {
  V1: '🛶',
  V3: '⛵',
  V6: '🚢',
  OC6: '🚣',
}

export const TIMEZONE = 'America/Sao_Paulo'

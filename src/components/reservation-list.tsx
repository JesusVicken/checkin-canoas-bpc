'use client'

import { useState } from 'react'
import { cancelReservation } from '@/actions/reservations'
import { CANOE_TYPE_EMOJIS } from '@/lib/constants'

interface Reservation {
  id: string
  date: Date | string
  startTime: string
  endTime: string
  canoe: {
    name: string
    type: string
    capacity: number
  }
}

export function ReservationList({ reservations }: { reservations: Reservation[] }) {
  const [cancelling, setCancelling] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  if (reservations.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-8 text-center">
        <p className="text-4xl mb-2">🏖️</p>
        <p className="text-slate-600 font-semibold text-sm">Você não possui nenhuma reserva ativa</p>
        <p className="text-slate-400 text-xs mt-1">Selecione uma canoa acima para agendar seu treino!</p>
      </div>
    )
  }

  async function handleCancel(id: string) {
    setCancelling(id)
    setMessage(null)
    const result = await cancelReservation(id)
    setCancelling(null)
    if (result.error) {
      setMessage(result.error)
    } else {
      setMessage(result.message || 'Cancelado!')
    }
  }

  return (
    <div className="space-y-3">
      {message && (
        <div className="rounded-xl bg-blue-50 border border-blue-200 px-4 py-2.5 text-sm font-semibold text-blue-700">
          ℹ️ {message}
        </div>
      )}
      {reservations.map((r) => {
        const dateStr = typeof r.date === 'string' ? r.date : r.date.toISOString()
        const formattedDate = new Date(dateStr).toLocaleDateString('pt-BR', {
          weekday: 'short',
          day: '2-digit',
          month: '2-digit',
          timeZone: 'UTC',
        })
        const emoji = CANOE_TYPE_EMOJIS[r.canoe.type] || '🛶'

        return (
          <div
            key={r.id}
            className="group flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3.5 shadow-xs transition-all hover:border-blue-300 hover:shadow-md hover:shadow-blue-900/5"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-xl border border-blue-100">
                {emoji}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">
                  {r.canoe.name}
                  <span className="ml-2 text-xs font-normal text-slate-500">
                    ({r.canoe.capacity} {r.canoe.capacity === 1 ? 'lugar' : 'lugares'})
                  </span>
                </p>
                <p className="text-xs font-semibold text-blue-600">
                  📅 {formattedDate} • ⏰ {r.startTime} – {r.endTime}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleCancel(r.id)}
              disabled={cancelling === r.id}
              className="rounded-lg bg-rose-50 border border-rose-200 px-3.5 py-1.5 text-xs font-semibold text-rose-700 transition-all hover:bg-rose-100 hover:text-rose-800 active:scale-95 disabled:opacity-50"
            >
              {cancelling === r.id ? 'Cancelando...' : 'Cancelar'}
            </button>
          </div>
        )
      })}
    </div>
  )
}

'use client'

import { CANOE_TYPE_EMOJIS } from '@/lib/constants'

interface CanoeCardProps {
  id: string
  name: string
  type: string
  capacity: number
  availableSlots: number
  totalSlots: number
  isSelected: boolean
  onSelect: (id: string) => void
}

export function CanoeCard({
  id,
  name,
  type,
  capacity,
  availableSlots,
  isSelected,
  onSelect,
}: CanoeCardProps) {
  const allBooked = availableSlots === 0
  const emoji = CANOE_TYPE_EMOJIS[type] || '🛶'

  return (
    <button
      type="button"
      onClick={() => !allBooked && onSelect(id)}
      disabled={allBooked}
      className={`active-press relative overflow-hidden rounded-2xl border p-3.5 text-left transition-all duration-200 ${
        isSelected
          ? 'border-blue-600 bg-blue-50/90 shadow-md shadow-blue-500/20 ring-2 ring-blue-600 scale-[1.02]'
          : allBooked
          ? 'border-slate-200/60 bg-slate-100/70 opacity-50 cursor-not-allowed'
          : 'border-slate-200/90 bg-white hover:border-blue-400 hover:bg-blue-50/40 hover:shadow-md hover:shadow-blue-900/5'
      }`}
    >
      <div className="relative z-10 flex flex-col justify-between h-full space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-2xl">
            {emoji}
          </span>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-tight ${
              allBooked
                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                allBooked ? 'bg-rose-500' : 'bg-emerald-500'
              }`}
            />
            {allBooked ? 'Lotada' : 'Livre'}
          </span>
        </div>

        <div>
          <h3 className="text-sm font-black text-slate-900 leading-tight">
            {name}
          </h3>
          <p className="text-[11px] font-semibold text-slate-500 mt-0.5">
            {capacity} {capacity === 1 ? 'lugar' : 'lugares'}
          </p>
        </div>
      </div>
    </button>
  )
}

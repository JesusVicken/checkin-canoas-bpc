'use client'

import { TIME_SLOTS } from '@/lib/constants'

interface TimeSlotPickerProps {
  reservedSlots: string[]
  selectedSlot: string | null
  onSelectSlot: (slot: string) => void
}

export function TimeSlotPicker({
  reservedSlots,
  selectedSlot,
  onSelectSlot,
}: TimeSlotPickerProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
          Horários do Dia (Toque para escolher)
        </h3>
        <span className="text-[10px] font-semibold text-slate-400">
          Deslize para ver mais →
        </span>
      </div>

      {/* Horizontal Scrollable Time Pills for Mobile */}
      <div className="flex gap-2 overflow-x-auto pb-2 pt-1 no-scrollbar -mx-2 px-2 scroll-smooth">
        {TIME_SLOTS.map((slot) => {
          const hour = parseInt(slot.split(':')[0], 10)
          const isReserved = reservedSlots.includes(slot)
          const isSelected = selectedSlot === slot
          const endHour = hour + 1

          return (
            <button
              key={slot}
              type="button"
              onClick={() => !isReserved && onSelectSlot(slot)}
              disabled={isReserved}
              className={`active-press flex-shrink-0 relative rounded-2xl px-4 py-3 text-center min-w-[76px] transition-all duration-200 ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 ring-2 ring-blue-600 scale-105'
                  : isReserved
                  ? 'bg-rose-50 text-rose-400 border border-rose-200 cursor-not-allowed line-through opacity-70'
                  : 'bg-white border border-slate-200 text-slate-800 hover:border-blue-400 hover:bg-blue-50 shadow-2xs'
              }`}
            >
              <div className="text-xs font-black">{slot}</div>
              <div className="text-[10px] font-medium opacity-75 mt-0.5">{endHour}:00</div>
              {isReserved && (
                <div className="absolute top-1 right-1">
                  <span className="text-[9px]">🔒</span>
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

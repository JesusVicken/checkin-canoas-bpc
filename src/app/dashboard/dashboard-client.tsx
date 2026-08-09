'use client'

import { useState, useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CanoeCard } from '@/components/canoe-card'
import { TimeSlotPicker } from '@/components/time-slot-picker'
import { BottomNav } from '@/components/bottom-nav'
import { ReservationList } from '@/components/reservation-list'
import { createReservation, type ReservationState } from '@/actions/reservations'
import { TIME_SLOTS, CANOE_TYPE_LABELS, CANOE_TYPE_EMOJIS, getEndTime } from '@/lib/constants'

interface Canoe {
  id: string
  name: string
  type: string
  capacity: number
  active: boolean
}

interface DailyReservation {
  id: string
  canoeId: string
  canoeName: string
  canoeType: string
  canoeCapacity: number
  startTime: string
  endTime: string
  userName: string
  userAvatarUrl?: string | null
}

interface DashboardClientProps {
  canoes: Canoe[]
  reservations: DailyReservation[]
  userReservations: Array<{
    id: string
    date: Date | string
    startTime: string
    endTime: string
    canoe: {
      name: string
      type: string
      capacity: number
    }
  }>
  reservedMap: Record<string, string[]>
  reservedDetails: Record<string, Record<string, { name: string, avatarUrl: string | null }>>
  selectedDate: string
  userId: string
}

export function DashboardClient({
  canoes,
  reservations,
  userReservations,
  reservedMap,
  reservedDetails,
  selectedDate,
  userId,
}: DashboardClientProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'reserve' | 'schedule' | 'all' | 'my-reservations'>('reserve')
  const [filterTime, setFilterTime] = useState<string>('07:00')
  const [selectedCanoe, setSelectedCanoe] = useState<string | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [selectedCanoeType, setSelectedCanoeType] = useState<string>('V1')
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [isAppLoading, setIsAppLoading] = useState(true)
  const [state, formAction, isPending] = useActionState<ReservationState, FormData>(
    createReservation,
    {}
  )

  // Show modal on success
  if (state.success && !showSuccessModal && !isPending) {
    setShowSuccessModal(true)
    // Clear state or handle it so it doesn't loop, but React state might trigger re-renders. 
    // Actually, `useActionState` keeps `state.success` true until next submit. 
    // A simple way is to use useEffect, but for server actions it's tricky.
    // Let's rely on the button click below to clear it.
  }

  useEffect(() => {
    // Show the original background image as a splash/loading screen for 1.5s
    const timer = setTimeout(() => {
      setIsAppLoading(false)
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  const canoesByType = canoes.reduce(
    (acc, canoe) => {
      if (!acc[canoe.type]) acc[canoe.type] = []
      acc[canoe.type].push(canoe)
      return acc
    },
    {} as Record<string, Canoe[]>
  )

  const typeOrder = ['V1', 'V3', 'V6', 'OC6']

  function handleDateChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSelectedCanoe(null)
    setSelectedSlot(null)
    router.push(`/dashboard?date=${e.target.value}`)
  }

  function handleCanoeSelect(id: string) {
    setSelectedCanoe(id === selectedCanoe ? null : id)
    setSelectedSlot(null)
  }

  const selectedCanoeReserved = selectedCanoe
    ? reservedMap[selectedCanoe] || []
    : []

  // Filter canoes for the "Ocupação por Horário" view
  const canoesForFilterTime = canoes.map((canoe) => {
    const isReserved = reservedDetails[canoe.id]?.[filterTime]
    return {
      ...canoe,
      reservedBy: isReserved?.name || null,
      reservedAvatarUrl: isReserved?.avatarUrl || null,
    }
  })

  const freeCanoesAtSlot = canoesForFilterTime.filter((c) => !c.reservedBy)
  const reservedCanoesAtSlot = canoesForFilterTime.filter((c) => c.reservedBy)

  if (isAppLoading) {
    return (
      <div 
        className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black transition-opacity duration-500"
        style={{
          backgroundImage: 'url("/background.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="bg-black/30 backdrop-blur-md rounded-2xl p-4 shadow-xl animate-in zoom-in-95 duration-500">
          <svg className="w-8 h-8 text-white animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5 pb-24 animate-in fade-in duration-500">
      {/* Mobile Top Bar: Date Selector & App Title */}
      <div className="glass-card rounded-3xl p-3.5 flex items-center justify-between shadow-xs bg-white border-2 border-blue-100">
        <div className="flex items-center gap-2.5 w-full">
          <span className="text-2xl">📅</span>
          <div className="flex-1">
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-0.5">🗓️ Toque para mudar a data da reserva:</p>
            <input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              min={new Date().toLocaleDateString('en-CA')}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg text-sm font-black text-slate-900 outline-none cursor-pointer p-1.5 focus:border-blue-500 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Action Notification Message */}
      {state.error && (
        <div className="rounded-2xl bg-rose-50 border border-rose-200 p-3.5 text-xs font-bold text-rose-700 animate-in fade-in shadow-2xs">
          ⚠️ {state.error}
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 shadow-2xl max-w-sm w-full text-center space-y-4 animate-in zoom-in-95">
            <div className="text-4xl">🎉</div>
            <h2 className="text-lg font-black text-slate-900">Reserva Confirmada!</h2>
            <p className="text-sm font-medium text-slate-600 leading-relaxed">
              Sua canoa está garantida. 
              <br/><br/>
              <span className="font-bold text-rose-600">Aviso importante:</span> Se você não for usar a canoa, cancele o agendamento o quanto antes na aba "Minhas Reservas" para liberar a canoa para outros alunos.
            </p>
            <button
              onClick={() => {
                setShowSuccessModal(false)
                setActiveTab('my-reservations')
              }}
              className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl mt-2 active:scale-95 transition-all"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* TAB 1: RESERVAR CANOA */}
      {activeTab === 'reserve' && (
        <div className="space-y-6 animate-in fade-in">
          
          {/* Canoe Type Selector */}
          <div className="space-y-2">
            <h2 className="text-sm font-black text-slate-800 px-1 flex items-center gap-2">
              <span className="bg-blue-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px]">1</span>
              Qual tipo de canoa você quer reservar?
            </h2>
            <div className="grid grid-cols-2 gap-2 mt-3">
              {typeOrder.map((type) => {
                const typedCanoes = canoesByType[type]
                if (!typedCanoes?.length) return null
                
                const isSelected = selectedCanoeType === type
                
                return (
                  <button
                    key={type}
                    onClick={() => setSelectedCanoeType(type)}
                    className={`flex-shrink-0 px-4 py-3 rounded-xl text-xs font-black transition-all ${
                      isSelected 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 scale-105 border-transparent' 
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-xl mb-1">{CANOE_TYPE_EMOJIS[type] || '🛶'}</div>
                    {CANOE_TYPE_LABELS[type] || type}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Render Only Selected Canoe Type */}
          {canoesByType[selectedCanoeType] && (
            <div className="space-y-3">
              <h2 className="text-sm font-black text-slate-800 px-1 flex items-center gap-2 mt-4">
                <span className="bg-blue-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px]">2</span>
                Escolha a canoa disponível:
              </h2>
              
              <div className="flex items-center justify-between px-1 bg-blue-50/50 p-2 rounded-lg border border-blue-100 mb-2">
                <h3 className="text-[11px] font-black text-blue-900 uppercase tracking-widest flex items-center gap-1.5">
                  <span>{CANOE_TYPE_EMOJIS[selectedCanoeType] || '🛶'}</span>
                  <span>{CANOE_TYPE_LABELS[selectedCanoeType] || selectedCanoeType}</span>
                </h3>
                <span className="text-[10px] font-bold text-blue-600">
                  {canoesByType[selectedCanoeType].length} opções
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {canoesByType[selectedCanoeType].map((canoe) => {
                  const reserved = reservedMap[canoe.id] || []
                  const available = TIME_SLOTS.length - reserved.length

                  return (
                    <CanoeCard
                      key={canoe.id}
                      id={canoe.id}
                      name={canoe.name}
                      type={canoe.type}
                      capacity={canoe.capacity}
                      availableSlots={available}
                      totalSlots={TIME_SLOTS.length}
                      isSelected={selectedCanoe === canoe.id}
                      onSelect={handleCanoeSelect}
                    />
                  )
                })}
              </div>
            </div>
          )}

          {/* Time Slot Picker Modal */}
          {selectedCanoe && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
              <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl space-y-6 relative animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Confirmar Horário</span>
                    <h3 className="text-lg font-black text-slate-900 flex items-center gap-1.5 mt-0.5">
                      <span>🛶</span> {canoes.find((c) => c.id === selectedCanoe)?.name}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCanoe(null)
                      setSelectedSlot(null)
                    }}
                    className="rounded-full bg-slate-100 w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-200 hover:text-rose-600 transition-colors"
                  >
                    ✕
                  </button>
                </div>
  
                <TimeSlotPicker
                  reservedSlots={selectedCanoeReserved}
                  selectedSlot={selectedSlot}
                  onSelectSlot={setSelectedSlot}
                />
  
                {selectedSlot && (
                  <form action={formAction} className="pt-2">
                    <input type="hidden" name="canoeId" value={selectedCanoe} />
                    <input type="hidden" name="date" value={selectedDate} />
                    <input type="hidden" name="startTime" value={selectedSlot} />
                    <button
                      type="submit"
                      disabled={isPending}
                      className="active-press w-full rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 py-4 text-sm font-black text-white shadow-xl shadow-blue-600/30 transition-all hover:brightness-105 active:scale-[0.97] disabled:opacity-50"
                    >
                      {isPending ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Processando...
                        </span>
                      ) : (
                        `CONFIRMAR RESERVA — ${selectedSlot}`
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: STATUS POR HORÁRIO */}
      {activeTab === 'schedule' && (
        <div className="space-y-4 animate-in fade-in">
          {/* Horizontal Scroll Time Pills */}
          <div className="glass-card rounded-3xl p-4 space-y-2">
            <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
              Selecione o Horário para Consultar Ocupação
            </h3>
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar -mx-2 px-2">
              {TIME_SLOTS.map((slot) => {
                const isSelected = filterTime === slot
                const reservedCount = canoes.filter(
                  (c) => reservedDetails[c.id]?.[slot]
                ).length

                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setFilterTime(slot)}
                    className={`active-press flex-shrink-0 rounded-2xl px-3.5 py-2.5 text-xs font-extrabold transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 scale-105'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {slot}
                    {reservedCount > 0 && (
                      <span className="ml-1 rounded-full bg-rose-100 px-1.5 py-0.5 text-[9px] text-rose-700">
                        {reservedCount}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Reserved Canoes List */}
          <div className="glass-card rounded-3xl p-4 space-y-3 border border-rose-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                <span>Canoas Reservadas ({reservedCanoesAtSlot.length})</span>
              </h3>
              <span className="text-[11px] font-bold text-rose-600">
                {filterTime}h
              </span>
            </div>

            {reservedCanoesAtSlot.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-3 text-center">
                Nenhuma canoa reservada às {filterTime}h. Todas estão livres! 🟢
              </p>
            ) : (
              <div className="space-y-2">
                {reservedCanoesAtSlot.map((canoe) => (
                  <div
                    key={canoe.id}
                    className="flex items-center justify-between rounded-2xl bg-rose-50/80 border border-rose-200 p-3 shadow-2xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">
                        {CANOE_TYPE_EMOJIS[canoe.type] || '🛶'}
                      </span>
                      <div>
                        <p className="text-xs font-black text-slate-900">
                          {canoe.name}
                        </p>
                        <p className="text-[11px] font-bold text-blue-800 flex items-center gap-1.5">
                          {canoe.reservedAvatarUrl ? (
                            <img src={canoe.reservedAvatarUrl} alt={canoe.reservedBy || ''} className="w-4 h-4 rounded-full object-cover border border-blue-200" />
                          ) : (
                            <span>👤</span>
                          )}
                          {canoe.reservedBy}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-bold bg-rose-100 text-rose-800 px-2 py-1 rounded-lg">
                      {filterTime}–{getEndTime(filterTime)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Available Canoes List */}
          <div className="glass-card rounded-3xl p-4 space-y-3 border border-emerald-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span>Canoas Disponíveis ({freeCanoesAtSlot.length})</span>
              </h3>
              <span className="text-[11px] font-bold text-emerald-600">
                {filterTime}h
              </span>
            </div>

            {freeCanoesAtSlot.length === 0 ? (
              <p className="text-xs text-rose-600 font-bold italic py-3 text-center">
                Todas as canoas estão ocupadas às {filterTime}h! 🔴
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {freeCanoesAtSlot.map((canoe) => (
                  <button
                    key={canoe.id}
                    type="button"
                    onClick={() => {
                      setSelectedCanoe(canoe.id)
                      setSelectedSlot(filterTime)
                      setActiveTab('reserve')
                    }}
                    className="active-press flex items-center justify-between rounded-2xl bg-white border border-slate-200 p-2.5 text-left hover:border-blue-400 hover:bg-blue-50/50 shadow-2xs group"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">
                        {CANOE_TYPE_EMOJIS[canoe.type] || '🛶'}
                      </span>
                      <div>
                        <p className="text-xs font-black text-slate-900 group-hover:text-blue-700">
                          {canoe.name}
                        </p>
                        <p className="text-[10px] font-medium text-slate-500">
                          {canoe.capacity} {canoe.capacity === 1 ? 'lugar' : 'lugares'}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: QUADRO GERAL DO DIA */}
      {activeTab === 'all' && (
        <div className="glass-card rounded-3xl p-4 space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-blue-950 flex items-center gap-1.5">
              <span>📋</span> Agenda Completa ({reservations.length})
            </h3>
          </div>

          {reservations.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-3xl mb-1">🏖️</p>
              <p className="text-xs font-extrabold text-slate-700">Nenhuma reserva nesta data.</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Todas as 17 canoas estão livres!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {reservations.map((res) => (
                <div
                  key={res.id}
                  className="flex items-center justify-between rounded-2xl bg-white border border-slate-200 p-3 shadow-2xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">
                      {CANOE_TYPE_EMOJIS[res.canoeType] || '🛶'}
                    </span>
                    <div>
                      <p className="text-xs font-black text-slate-900">
                        {res.canoeName}
                        <span className="ml-1.5 text-[10px] font-normal text-slate-500">
                          ({res.canoeType})
                        </span>
                      </p>
                      <p className="text-[11px] font-bold text-blue-800 mt-0.5 flex items-center gap-1.5">
                        {res.userAvatarUrl ? (
                          <img src={res.userAvatarUrl} alt={res.userName} className="w-4 h-4 rounded-full object-cover border border-blue-200" />
                        ) : (
                          <span>👤</span>
                        )}
                        {res.userName}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-black text-blue-700 bg-blue-50 px-2.5 py-1 rounded-xl border border-blue-100">
                    {res.startTime}–{res.endTime}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: MINHAS RESERVAS */}
      {activeTab === 'my-reservations' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="px-1">
            <h3 className="text-sm font-extrabold text-blue-950 flex items-center gap-1.5">
              <span>👤</span> Minhas Reservas Confirmadas
            </h3>
          </div>
          <ReservationList reservations={userReservations} />
        </div>
      )}

      {/* Mobile Floating Bottom Navigation Dock */}
      <BottomNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        myReservationsCount={userReservations.length}
      />
    </div>
  )
}

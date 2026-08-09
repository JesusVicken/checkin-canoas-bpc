'use client'

interface BottomNavProps {
  activeTab: 'reserve' | 'schedule' | 'all' | 'my-reservations'
  onSelectTab: (tab: 'reserve' | 'schedule' | 'all' | 'my-reservations') => void
  myReservationsCount: number
}

export function BottomNav({
  activeTab,
  onSelectTab,
  myReservationsCount,
}: BottomNavProps) {
  return (
    <nav className="fixed bottom-3 left-3 right-3 z-50 max-w-md mx-auto mobile-bottom-dock rounded-3xl p-1.5 shadow-2xl">
      <div className="grid grid-cols-4 gap-1 text-center">
        {/* Tab 1: Reservar */}
        <button
          type="button"
          onClick={() => onSelectTab('reserve')}
          className={`active-press flex flex-col items-center justify-center py-2.5 rounded-2xl transition-all ${
            activeTab === 'reserve'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/60'
          }`}
        >
          <span className="text-lg leading-none">🛶</span>
          <span className="text-[10px] font-extrabold mt-1 tracking-tight">Reservar</span>
        </button>

        {/* Tab 2: Status */}
        <button
          type="button"
          onClick={() => onSelectTab('schedule')}
          className={`active-press flex flex-col items-center justify-center py-2.5 rounded-2xl transition-all ${
            activeTab === 'schedule'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/60'
          }`}
        >
          <span className="text-lg leading-none">🔍</span>
          <span className="text-[10px] font-extrabold mt-1 tracking-tight">Status</span>
        </button>

        {/* Tab 3: Quadro */}
        <button
          type="button"
          onClick={() => onSelectTab('all')}
          className={`active-press flex flex-col items-center justify-center py-2.5 rounded-2xl transition-all ${
            activeTab === 'all'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/60'
          }`}
        >
          <span className="text-lg leading-none">📋</span>
          <span className="text-[10px] font-extrabold mt-1 tracking-tight">Quadro</span>
        </button>

        {/* Tab 4: Minhas Reservas */}
        <button
          type="button"
          onClick={() => onSelectTab('my-reservations')}
          className={`active-press relative flex flex-col items-center justify-center py-2.5 rounded-2xl transition-all ${
            activeTab === 'my-reservations'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/60'
          }`}
        >
          <span className="text-lg leading-none">👤</span>
          <span className="text-[10px] font-extrabold mt-1 tracking-tight">Minhas</span>
          {myReservationsCount > 0 && (
            <span
              className={`absolute top-1.5 right-2.5 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-black ${
                activeTab === 'my-reservations'
                  ? 'bg-white text-blue-700'
                  : 'bg-blue-600 text-white shadow-xs'
              }`}
            >
              {myReservationsCount}
            </span>
          )}
        </button>
      </div>
    </nav>
  )
}

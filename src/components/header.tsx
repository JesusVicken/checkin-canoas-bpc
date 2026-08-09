'use client'

import Image from 'next/image'
import { logoutAction } from '@/actions/auth'

export function Header({ userName }: { userName: string }) {
  return (
    <header className="sticky top-0 z-40 glass-header shadow-xs">
      <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-2.5">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="relative h-11 w-11 overflow-hidden rounded-xl border border-blue-200 shadow-xs bg-white p-0.5 flex-shrink-0">
            <Image
              src="/bpcLogo.jpg"
              alt="BPC Canoas Logo"
              fill
              className="object-contain p-0.5 rounded-lg"
              priority
            />
          </div>
          <div>
            <h1 className="text-base font-black tracking-tight text-blue-950 leading-none">
              BPC Canoas
            </h1>
            <p className="text-[11px] font-semibold text-blue-600 mt-0.5">Reservas</p>
          </div>
        </div>

        {/* User Info & Logout */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200/80 px-3 py-1 text-xs font-bold text-blue-900 shadow-2xs">
            <span className="text-xs">👤</span>
            <span className="max-w-[100px] truncate">{userName}</span>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-full bg-white border border-slate-200 px-3 py-1 text-xs font-bold text-slate-600 transition-all hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 active:scale-95 shadow-2xs"
              title="Sair da conta"
            >
              Sair
            </button>
          </form>
        </div>
      </div>
    </header>
  )
}

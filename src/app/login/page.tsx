import { LoginForm } from './login-form'
import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'

export default async function LoginPage() {
  const session = await getSession()
  if (session) redirect('/dashboard')

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6"
      style={{
        backgroundImage: 'url("/hero.jpeg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        colorScheme: 'light',
      }}
    >
      <div className="w-full max-w-sm my-auto space-y-5">
        {/* Main Card */}
        <div
          className="rounded-3xl p-6 sm:p-8 text-center shadow-2xl border border-white/20"
          style={{ background: '#ffffff', color: '#0f172a' }}
        >
          {/* Logo BPC */}
          <div className="flex justify-center mb-4">
            <div className="w-32 h-32 rounded-2xl p-2 bg-white border border-slate-200 shadow-md flex items-center justify-center overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/bpcLogo.jpg"
                alt="Logo BPC Canoas"
                className="w-full h-full object-contain rounded-xl"
              />
            </div>
          </div>

          {/* Title Header */}
          <div className="space-y-1 mb-6">
            <span className="inline-block px-3 py-1 text-[11px] font-black uppercase tracking-widest text-blue-700 bg-blue-50 rounded-full border border-blue-100">
              BRASÍLIA PADDLE CLUB
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight pt-1">
              Reserva de Canoas
            </h1>
            <p className="text-xs font-semibold text-slate-500">
              Agendamento simples e rápido para treinos
            </p>
          </div>

          {/* Form */}
          <LoginForm />
        </div>

        {/* Footer info */}
        <p className="text-center text-xs font-semibold text-blue-200/80">
          Canoas Havaianas & Polinésias
        </p>
      </div>
    </div>
  )
}

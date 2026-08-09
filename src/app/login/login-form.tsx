'use client'

import { useActionState, useState } from 'react'
import { loginAction, registerAction, type AuthState } from '@/actions/auth'

export function LoginForm() {
  const [mode, setMode] = useState<'login' | 'register'>('login')

  const [loginState, loginFormAction, isLoginPending] = useActionState<AuthState, FormData>(
    loginAction,
    {}
  )

  const [registerState, registerFormAction, isRegisterPending] = useActionState<AuthState, FormData>(
    registerAction,
    {}
  )

  const activeState = mode === 'login' ? loginState : registerState
  const isPending = mode === 'login' ? isLoginPending : isRegisterPending

  return (
    <div className="space-y-5">
      {/* Mode Switcher: Entrar | Criar Conta */}
      <div className="relative flex p-1 bg-slate-100/80 backdrop-blur-md rounded-2xl border border-slate-200/60 shadow-inner">
        {/* Animated Background Pill */}
        <div 
          className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-blue-600 rounded-xl shadow-md transition-all duration-300 ease-out ${
            mode === 'login' ? 'left-1' : 'left-[calc(50%+2px)]'
          }`}
        />
        
        <button
          type="button"
          onClick={() => setMode('login')}
          className={`relative z-10 w-1/2 py-2.5 text-xs font-black rounded-xl transition-colors duration-300 ${
            mode === 'login' ? 'text-white' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          🔑 ENTRAR
        </button>
        <button
          type="button"
          onClick={() => setMode('register')}
          className={`relative z-10 w-1/2 py-2.5 text-xs font-black rounded-xl transition-colors duration-300 ${
            mode === 'register' ? 'text-white' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          ✨ CRIAR CONTA
        </button>
      </div>

      {/* Error Message */}
      {activeState.error && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-3.5 text-xs font-bold text-rose-700 animate-in fade-in">
          ⚠️ {activeState.error}
        </div>
      )}

      {/* LOGIN FORM */}
      {mode === 'login' && (
        <form action={loginFormAction} className="space-y-4 text-left animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div>
            <label
              htmlFor="contact"
              className="block text-xs font-extrabold text-slate-700 mb-1.5 uppercase tracking-wide"
            >
              E-mail ou Telefone
            </label>
            <input
              id="contact"
              name="contact"
              type="text"
              required
              placeholder="seu@email.com ou (11) 99999-9999"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
              style={{ background: '#f8fafc', color: '#0f172a' }}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs font-extrabold text-slate-700 mb-1.5 uppercase tracking-wide"
            >
              Sua Senha
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
              style={{ background: '#f8fafc', color: '#0f172a' }}
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 py-3.5 text-sm font-black text-white shadow-lg shadow-blue-600/30 transition-all active:scale-[0.98] disabled:opacity-50 mt-2 uppercase tracking-wider cursor-pointer"
            style={{ backgroundColor: '#2563eb', color: '#ffffff' }}
          >
            {isPending ? 'Validando Acesso...' : 'ENTRAR NO SISTEMA'}
          </button>
        </form>
      )}

      {/* REGISTER FORM */}
      {mode === 'register' && (
        <form action={registerFormAction} className="space-y-3.5 text-left animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div>
            <label
              htmlFor="reg-name"
              className="block text-xs font-extrabold text-slate-700 mb-1 uppercase tracking-wide"
            >
              Nome Completo *
            </label>
            <input
              id="reg-name"
              name="name"
              type="text"
              required
              placeholder="Ex: João Silva"
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
              style={{ background: '#f8fafc', color: '#0f172a' }}
            />
          </div>

          <div>
            <label
              htmlFor="reg-email"
              className="block text-xs font-extrabold text-slate-700 mb-1 uppercase tracking-wide"
            >
              E-mail *
            </label>
            <input
              id="reg-email"
              name="email"
              type="email"
              required
              placeholder="seu@email.com"
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
              style={{ background: '#f8fafc', color: '#0f172a' }}
            />
          </div>

          <div>
            <label
              htmlFor="reg-phone"
              className="block text-xs font-extrabold text-slate-700 mb-1 uppercase tracking-wide"
            >
              Telefone (WhatsApp)
            </label>
            <input
              id="reg-phone"
              name="phone"
              type="tel"
              placeholder="(11) 99999-9999"
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
              style={{ background: '#f8fafc', color: '#0f172a' }}
            />
          </div>

          <div>
            <label
              htmlFor="reg-password"
              className="block text-xs font-extrabold text-slate-700 mb-1 uppercase tracking-wide"
            >
              Crie uma Senha *
            </label>
            <input
              id="reg-password"
              name="password"
              type="password"
              required
              placeholder="Mínimo 4 caracteres"
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
              style={{ background: '#f8fafc', color: '#0f172a' }}
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 py-3.5 text-sm font-black text-white shadow-lg shadow-blue-600/30 transition-all active:scale-[0.98] disabled:opacity-50 mt-2 uppercase tracking-wider cursor-pointer"
            style={{ backgroundColor: '#2563eb', color: '#ffffff' }}
          >
            {isPending ? 'Criando Conta...' : 'CRIAR CONTA & ENTRAR'}
          </button>
        </form>
      )}
    </div>
  )
}

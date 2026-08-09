'use client'

import { useState, useActionState, useEffect } from 'react'
import Image from 'next/image'
import { logoutAction, changePasswordAction, type AuthState } from '@/actions/auth'

interface UserProps {
  name: string
  email: string
  phone: string
  avatarUrl?: string | null
}

export function Header({ user }: { user: UserProps }) {
  const [showProfile, setShowProfile] = useState(false)
  const [showChangePassword, setShowChangePassword] = useState(false)

  const [passwordState, changePasswordFormAction, isChangingPassword] = useActionState<AuthState, FormData>(
    changePasswordAction,
    {}
  )

  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const handleFileUpload = async (file: File) => {
    setIsUploading(true)
    setUploadError(null)

    try {
      const response = await fetch(`/api/avatar/upload?filename=${encodeURIComponent(file.name)}`, {
        method: 'POST',
        body: file,
      })

      const data = await response.json()

      if (!response.ok) {
        setUploadError(data.error || 'Erro ao enviar a imagem.')
      } else {
        // Refresh page to get new avatarUrl
        window.location.reload()
      }
    } catch (err) {
      console.error('File upload error:', err)
      setUploadError('Erro ao enviar a foto.')
    } finally {
      setIsUploading(false)
    }
  }

  // Reset states if modal closes or success
  useEffect(() => {
    if (passwordState.success) {
      setTimeout(() => {
        setShowProfile(false)
        setShowChangePassword(false)
        passwordState.success = false
      }, 2000)
    }
  }, [passwordState.success])

  return (
    <>
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
            <button
              onClick={() => setShowProfile(true)}
              className="flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200/80 p-1 pr-3 text-xs font-bold text-blue-900 shadow-2xs hover:bg-blue-100 transition-colors"
              title="Ver Perfil"
            >
              {user.avatarUrl ? (
                <div className="relative w-6 h-6 rounded-full overflow-hidden border border-blue-200">
                  <Image src={user.avatarUrl} alt="Avatar" fill className="object-cover" />
                </div>
              ) : (
                <span className="w-6 h-6 flex items-center justify-center bg-blue-100 rounded-full text-[10px]">👤</span>
              )}
              <span className="max-w-[80px] truncate">{user.name.split(' ')[0]}</span>
            </button>
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

      {/* Profile Modal */}
      {showProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <span>👤</span> Meu Perfil
              </h2>
              <button
                onClick={() => {
                  setShowProfile(false)
                  setShowChangePassword(false)
                }}
                className="rounded-full bg-slate-100 w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-200 hover:text-rose-600 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Read-only User Data & Avatar Upload */}
            {!showChangePassword && (
              <div className="space-y-4">
                <div className="flex flex-col items-center justify-center space-y-3 mb-2">
                  <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-blue-50 bg-slate-100 shadow-sm flex items-center justify-center">
                    {user.avatarUrl ? (
                      <Image src={user.avatarUrl} alt="Profile" fill className="object-cover" />
                    ) : (
                      <span className="text-4xl">👤</span>
                    )}
                  </div>
                  
                  <div className="flex flex-col items-center gap-2">
                    <label className="cursor-pointer bg-blue-50 text-blue-700 text-[10px] font-extrabold uppercase tracking-widest px-4 py-2 rounded-xl border border-blue-100 hover:bg-blue-100 transition-colors shadow-2xs">
                      {isUploading ? 'Enviando...' : 'Mudar Foto'}
                      <input
                        type="file"
                        accept="image/jpeg, image/png, image/webp"
                        className="hidden"
                        disabled={isUploading}
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            handleFileUpload(e.target.files[0])
                          }
                        }}
                      />
                    </label>
                    {uploadError && <span className="text-[10px] text-rose-500 font-bold">{uploadError}</span>}
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Nome</p>
                  <p className="text-sm font-black text-slate-800">{user.name}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">E-mail</p>
                  <p className="text-sm font-black text-slate-800">{user.email || 'Não informado'}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Telefone / WhatsApp</p>
                  <p className="text-sm font-black text-slate-800">{user.phone || 'Não informado'}</p>
                </div>

                <button
                  onClick={() => setShowChangePassword(true)}
                  className="w-full py-3 mt-4 rounded-xl border-2 border-blue-100 bg-white text-sm font-bold text-blue-600 hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                >
                  <span>🔐</span> Alterar Minha Senha
                </button>
              </div>
            )}

            {/* Change Password Form */}
            {showChangePassword && (
              <form action={changePasswordFormAction} className="space-y-4 animate-in fade-in slide-in-from-right-4">
                {passwordState.error && (
                  <div className="bg-rose-50 text-rose-600 p-3 rounded-xl text-xs font-bold border border-rose-200">
                    ⚠️ {passwordState.error}
                  </div>
                )}
                {passwordState.success && (
                  <div className="bg-emerald-50 text-emerald-700 p-3 rounded-xl text-xs font-bold border border-emerald-200 flex items-center gap-2">
                    <span>✅</span> Senha alterada com sucesso!
                  </div>
                )}

                {!passwordState.success && (
                  <>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        Senha Atual
                      </label>
                      <input
                        type="password"
                        name="currentPassword"
                        required
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-900 bg-slate-50 outline-none transition-all focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        Nova Senha
                      </label>
                      <input
                        type="password"
                        name="newPassword"
                        required
                        minLength={4}
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-900 bg-slate-50 outline-none transition-all focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowChangePassword(false)
                          passwordState.error = undefined
                        }}
                        className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200 transition-colors"
                      >
                        Voltar
                      </button>
                      <button
                        type="submit"
                        disabled={isChangingPassword}
                        className="flex-1 py-3 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        {isChangingPassword ? 'Salvando...' : 'Salvar Nova Senha'}
                      </button>
                    </div>
                  </>
                )}
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}

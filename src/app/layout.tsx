import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'BPC Canoas — App de Reservas',
  description:
    'Reserve sua canoa havaiana ou polinésia. Sistema de agendamento mobile para V1, V3, V6 e OC6.',
  keywords: ['canoa havaiana', 'canoa polinésia', 'reserva', 'V1', 'V6', 'OC6', 'va\'a', 'BPC'],
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'BPC Canoas',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#ffffff',
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-ocean-gradient text-slate-900 selection:bg-blue-600 selection:text-white">
        {children}
      </body>
    </html>
  )
}

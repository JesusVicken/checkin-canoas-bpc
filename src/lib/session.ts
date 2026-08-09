import { cookies } from 'next/headers'

export interface SessionData {
  userId: string
  userName: string
  userEmail?: string | null
  userPhone?: string | null
}

const SESSION_COOKIE = 'bpc-session'

export async function createSession(data: SessionData): Promise<void> {
  const cookieStore = await cookies()
  const value = Buffer.from(JSON.stringify(data)).toString('base64')
  
  cookieStore.set(SESSION_COOKIE, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })
}

export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies()
  const cookie = cookieStore.get(SESSION_COOKIE)
  
  if (!cookie?.value) return null
  
  try {
    const decoded = Buffer.from(cookie.value, 'base64').toString('utf-8')
    return JSON.parse(decoded) as SessionData
  } catch {
    return null
  }
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}

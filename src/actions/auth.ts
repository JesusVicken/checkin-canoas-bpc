'use server'

import { prisma } from '@/lib/db'
import { createSession, destroySession, getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'

export interface AuthState {
  error?: string
  success?: boolean
}

export async function registerAction(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const phone = formData.get('phone') as string
  const password = formData.get('password') as string

  if (!name || !email || !password) {
    return { error: 'Nome, E-mail e Senha são obrigatórios.' }
  }

  if (name.trim().length < 2) {
    return { error: 'Nome deve ter pelo menos 2 caracteres.' }
  }

  if (password.length < 4) {
    return { error: 'A senha deve ter pelo menos 4 caracteres.' }
  }

  const cleanEmail = email.trim().toLowerCase()
  const cleanPhone = phone ? phone.trim() : null

  try {
    // Check if email already registered
    const existingEmail = await prisma.user.findUnique({
      where: { email: cleanEmail },
    })

    if (existingEmail) {
      return { error: 'Este e-mail já está cadastrado. Faça login!' }
    }

    // Check if phone already registered
    if (cleanPhone) {
      const existingPhone = await prisma.user.findFirst({
        where: { phone: cleanPhone },
      })
      if (existingPhone) {
        return { error: 'Este telefone já está cadastrado em outra conta.' }
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user in Neon PostgreSQL
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: cleanEmail,
        phone: cleanPhone,
        password: hashedPassword,
      },
    })

    await createSession({
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      userPhone: user.phone,
    })
  } catch (error) {
    console.error('Registration error:', error)
    return { error: 'Erro ao criar conta. Tente novamente.' }
  }

  redirect('/dashboard')
}

export async function loginAction(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const contact = formData.get('contact') as string
  const password = formData.get('password') as string

  if (!contact || !password) {
    return { error: 'Informe seu contato (E-mail/Telefone) e Senha.' }
  }

  const cleanContact = contact.trim().toLowerCase()

  try {
    // Find user by email, phone, or name
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: cleanContact },
          { phone: contact.trim() },
          { name: { equals: contact.trim(), mode: 'insensitive' } },
        ],
      },
    })

    if (!user) {
      return { error: 'Usuário não encontrado. Verifique seu e-mail/telefone ou crie uma conta.' }
    }

    // If user has a password in DB, verify with bcrypt
    if (user.password) {
      const isValid = await bcrypt.compare(password, user.password)
      if (!isValid) {
        return { error: 'Senha incorreta. Tente novamente.' }
      }
    } else {
      // Legacy user without password - set their password on first login
      const hashedPassword = await bcrypt.hash(password, 10)
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      })
    }

    await createSession({
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      userPhone: user.phone,
    })
  } catch (error) {
    console.error('Login error:', error)
    return { error: 'Erro ao realizar login. Tente novamente.' }
  }

  redirect('/dashboard')
}

export async function logoutAction(): Promise<void> {
  await destroySession()
  redirect('/')
}

export async function changePasswordAction(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const session = await getSession()
  if (!session) {
    return { error: 'Não autorizado. Faça login novamente.' }
  }

  const currentPassword = formData.get('currentPassword') as string
  const newPassword = formData.get('newPassword') as string

  if (!currentPassword || !newPassword) {
    return { error: 'Preencha a senha atual e a nova senha.' }
  }

  if (newPassword.length < 4) {
    return { error: 'A nova senha deve ter pelo menos 4 caracteres.' }
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId }
    })

    if (!user) {
      return { error: 'Usuário não encontrado.' }
    }

    if (user.password) {
      const isValid = await bcrypt.compare(currentPassword, user.password)
      if (!isValid) {
        return { error: 'A senha atual está incorreta.' }
      }
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10)

    await prisma.user.update({
      where: { id: session.userId },
      data: { password: hashedNewPassword }
    })

    return { success: true }
  } catch (error) {
    console.error('Change password error:', error)
    return { error: 'Erro ao alterar senha. Tente novamente.' }
  }
}

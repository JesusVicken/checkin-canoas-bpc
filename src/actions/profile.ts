'use server'

import { put } from '@vercel/blob'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/session'
import { revalidatePath } from 'next/cache'

export async function uploadAvatarAction(prevState: any, formData: FormData) {
  const session = await getSession()
  if (!session) {
    throw new Error('Não autorizado')
  }

  const file = formData.get('avatar') as File
  if (!file || file.size === 0) {
    throw new Error('Nenhuma imagem enviada')
  }

  try {
    const filename = `${session.userId}-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`
    const blob = await put(filename, file, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN
    })

    await prisma.user.update({
      where: { id: session.userId },
      data: { avatarUrl: blob.url }
    })

    revalidatePath('/dashboard')
    
    return { success: true, url: blob.url }
  } catch (error) {
    console.error('Avatar upload error:', error)
    return { error: 'Falha ao enviar a imagem. Verifique a configuração do Vercel Blob.' }
  }
}

import { put } from '@vercel/blob'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/session'

export async function POST(request: Request): Promise<NextResponse> {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado. Faça login novamente.' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const filename = searchParams.get('filename') || 'avatar.jpg'

  if (!request.body) {
    return NextResponse.json({ error: 'Arquivo inválido.' }, { status: 400 })
  }

  try {
    const cleanFilename = `${session.userId}-${Date.now()}-${filename.replace(/[^a-zA-Z0-9.-]/g, '')}`

    // Upload to Vercel Blob using official route handler method
    const blob = await put(cleanFilename, request.body, {
      access: 'public',
    })

    // Update user record in Neon database
    await prisma.user.update({
      where: { id: session.userId },
      data: { avatarUrl: blob.url },
    })

    return NextResponse.json(blob)
  } catch (error) {
    console.error('Avatar upload route error:', error)
    return NextResponse.json({ error: 'Erro ao processar imagem no Vercel Blob.' }, { status: 500 })
  }
}

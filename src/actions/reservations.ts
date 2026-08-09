'use server'

import { prisma } from '@/lib/db'
import { getSession } from '@/lib/session'
import { getEndTime } from '@/lib/constants'
import { revalidatePath } from 'next/cache'

export interface ReservationState {
  error?: string
  success?: boolean
  message?: string
}

export async function createReservation(
  _prevState: ReservationState,
  formData: FormData
): Promise<ReservationState> {
  const session = await getSession()
  if (!session) {
    return { error: 'Você precisa estar logado para reservar.' }
  }

  const canoeId = formData.get('canoeId') as string
  const dateStr = formData.get('date') as string
  const startTime = formData.get('startTime') as string

  if (!canoeId || !dateStr || !startTime) {
    return { error: 'Dados incompletos. Tente novamente.' }
  }

  const date = new Date(dateStr + 'T00:00:00.000Z')
  const endTime = getEndTime(startTime)

  try {
    // Check if canoe is available (anti double-booking)
    const existing = await prisma.reservation.findUnique({
      where: {
        canoeId_date_startTime: {
          canoeId,
          date,
          startTime,
        },
      },
    })

    if (existing && existing.status === 'CONFIRMED') {
      return { error: 'Esta canoa já está reservada para este horário.' }
    }

    // If there's a cancelled reservation, update it; otherwise create new
    if (existing && existing.status === 'CANCELLED') {
      await prisma.reservation.update({
        where: { id: existing.id },
        data: {
          userId: session.userId,
          status: 'CONFIRMED',
          endTime,
        },
      })
    } else {
      await prisma.reservation.create({
        data: {
          canoeId,
          userId: session.userId,
          date,
          startTime,
          endTime,
          status: 'CONFIRMED',
        },
      })
    }

    revalidatePath('/dashboard')
    return { success: true, message: 'Reserva confirmada! 🛶' }
  } catch (error: unknown) {
    // Handle unique constraint violation (double-booking race condition)
    if (
      error instanceof Error &&
      error.message.includes('Unique constraint')
    ) {
      return { error: 'Esta canoa acabou de ser reservada por outra pessoa.' }
    }
    console.error('Reservation error:', error)
    return { error: 'Erro ao criar reserva. Tente novamente.' }
  }
}

export async function cancelReservation(
  reservationId: string
): Promise<ReservationState> {
  const session = await getSession()
  if (!session) {
    return { error: 'Você precisa estar logado.' }
  }

  try {
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
    })

    if (!reservation) {
      return { error: 'Reserva não encontrada.' }
    }

    if (reservation.userId !== session.userId) {
      return { error: 'Você só pode cancelar suas próprias reservas.' }
    }

    await prisma.reservation.update({
      where: { id: reservationId },
      data: { status: 'CANCELLED' },
    })

    revalidatePath('/dashboard')
    return { success: true, message: 'Reserva cancelada.' }
  } catch (error) {
    console.error('Cancel error:', error)
    return { error: 'Erro ao cancelar reserva.' }
  }
}

export async function getAvailability(dateStr: string) {
  const date = new Date(dateStr + 'T00:00:00.000Z')

  const canoes = await prisma.canoe.findMany({
    where: { active: true },
    orderBy: [{ type: 'asc' }, { name: 'asc' }],
  })

  const reservations = await prisma.reservation.findMany({
    where: {
      date,
      status: 'CONFIRMED',
    },
    include: {
      user: { select: { name: true } },
      canoe: { select: { id: true, name: true, type: true, capacity: true } },
    },
    orderBy: [{ startTime: 'asc' }, { canoe: { name: 'asc' } }],
  })

  // Formatted reservations for the daily schedule
  const dailyReservations = reservations.map((r) => ({
    id: r.id,
    canoeId: r.canoeId,
    canoeName: r.canoe.name,
    canoeType: r.canoe.type,
    canoeCapacity: r.canoe.capacity,
    startTime: r.startTime,
    endTime: r.endTime,
    userName: r.user.name,
  }))

  // Map: canoeId -> array of startTimes
  const reservedMap: Record<string, string[]> = {}
  // Map: canoeId -> Record<startTime, userName>
  const reservedDetails: Record<string, Record<string, string>> = {}

  for (const r of reservations) {
    if (!reservedMap[r.canoeId]) {
      reservedMap[r.canoeId] = []
    }
    reservedMap[r.canoeId].push(r.startTime)

    if (!reservedDetails[r.canoeId]) {
      reservedDetails[r.canoeId] = {}
    }
    reservedDetails[r.canoeId][r.startTime] = r.user.name
  }

  return {
    canoes,
    reservations: dailyReservations,
    reservedMap,
    reservedDetails,
  }
}

export async function getUserReservations() {
  const session = await getSession()
  if (!session) return []

  return prisma.reservation.findMany({
    where: {
      userId: session.userId,
      status: 'CONFIRMED',
      date: { gte: new Date(new Date().toISOString().split('T')[0] + 'T00:00:00.000Z') },
    },
    include: {
      canoe: true,
    },
    orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
  })
}

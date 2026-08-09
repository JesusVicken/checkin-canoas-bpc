import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { getAvailability, getUserReservations } from '@/actions/reservations'
import { Header } from '@/components/header'
import { DashboardClient } from './dashboard-client'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>
}) {
  const session = await getSession()
  if (!session) redirect('/login')

  const params = await searchParams
  const today = new Date().toLocaleDateString('en-CA') // YYYY-MM-DD
  const selectedDate = params.date || today

  const { canoes, reservations, reservedMap, reservedDetails } = await getAvailability(selectedDate)
  const userReservations = await getUserReservations()

  return (
    <div className="flex min-h-screen flex-col bg-ocean-gradient">
      <Header userName={session.userName} />

      {/* Mobile App Container max-w-lg */}
      <main className="mx-auto w-full max-w-lg flex-1 px-3.5 py-4">
        <DashboardClient
          canoes={canoes}
          reservations={reservations}
          userReservations={userReservations}
          reservedMap={reservedMap}
          reservedDetails={reservedDetails}
          selectedDate={selectedDate}
          userId={session.userId}
        />
      </main>
    </div>
  )
}

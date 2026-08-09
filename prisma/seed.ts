import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'

const connectionString = process.env.DATABASE_URL!

const adapter = new PrismaNeon({
  connectionString,
})

const prisma = new PrismaClient({ adapter })

interface CanoeDefinition {
  type: 'V1' | 'V3' | 'V6' | 'OC6'
  count: number
  capacity: number
}

const CANOE_INVENTORY: CanoeDefinition[] = [
  { type: 'V1', count: 10, capacity: 1 },
  { type: 'V3', count: 2, capacity: 3 },
  { type: 'V6', count: 1, capacity: 6 },
  { type: 'OC6', count: 4, capacity: 6 },
]

async function main() {
  console.log('🛶 Seeding canoe inventory...')

  // Build expected names list
  const validNames: string[] = []

  for (const { type, count, capacity } of CANOE_INVENTORY) {
    for (let i = 1; i <= count; i++) {
      const name = `${type}-${String(i).padStart(2, '0')}`
      validNames.push(name)
      await prisma.canoe.upsert({
        where: { name },
        update: { type, capacity, active: true },
        create: {
          name,
          type,
          capacity,
          active: true,
        },
      })
      console.log(`  ✅ ${name} (${capacity} lugar${capacity > 1 ? 'es' : ''})`)
    }
  }

  // Deactivate any old canoes not in validNames (e.g. OC2)
  await prisma.canoe.updateMany({
    where: { name: { notIn: validNames } },
    data: { active: false },
  })

  const activeCount = await prisma.canoe.count({ where: { active: true } })
  console.log(`\n🎉 Seed completo! ${activeCount} canoas ativas no inventário.`)
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

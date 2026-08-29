import { prisma } from '../lib/prisma'
import { PrismaClient } from '@prisma/client'

const CLOUD_SQL_URL = 'postgresql://postgres:RI_CloudSql_2026_Pass!@35.200.228.49:5432/recruitmentinstitute'

async function migrateFeesTable(client: PrismaClient, label: string) {
  console.log(`[${label}] Applying columns to 'fees' table...`)
  await client.$executeRawUnsafe(`
    ALTER TABLE fees
    ADD COLUMN IF NOT EXISTS online_fees NUMERIC(10, 2),
    ADD COLUMN IF NOT EXISTS online_discount NUMERIC(10, 2),
    ADD COLUMN IF NOT EXISTS online_final NUMERIC(10, 2),
    ADD COLUMN IF NOT EXISTS offline_fees NUMERIC(10, 2),
    ADD COLUMN IF NOT EXISTS offline_discount NUMERIC(10, 2),
    ADD COLUMN IF NOT EXISTS offline_final NUMERIC(10, 2),
    ADD COLUMN IF NOT EXISTS mode_notes TEXT;
  `)

  // Populate default 50% online and 10% offline discounts for all existing fee rows where base fee is present
  await client.$executeRawUnsafe(`
    UPDATE fees
    SET
      online_fees = COALESCE(online_fees, fees, 10000),
      online_discount = COALESCE(online_discount, ROUND(COALESCE(fees, 10000) * 0.50, 2)),
      online_final = COALESCE(online_final, ROUND(COALESCE(fees, 10000) * 0.50, 2)),
      offline_fees = COALESCE(offline_fees, fees, 10000),
      offline_discount = COALESCE(offline_discount, ROUND(COALESCE(fees, 10000) * 0.10, 2)),
      offline_final = COALESCE(offline_final, ROUND(COALESCE(fees, 10000) * 0.90, 2))
    WHERE online_final IS NULL OR offline_final IS NULL;
  `)

  const count = await client.courseFee.count()
  console.log(`[${label}] Migration completed. Total fee records: ${count}`)
}

import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

async function main() {
  console.log('--- Migrating Local Database ---')
  await migrateFeesTable(prisma, 'LOCAL')

  console.log('--- Migrating Cloud SQL Database ---')
  const cloudPool = new Pool({ connectionString: CLOUD_SQL_URL })
  const cloudAdapter = new PrismaPg(cloudPool)
  const cloudPrisma = new PrismaClient({ adapter: cloudAdapter })
  try {
    await migrateFeesTable(cloudPrisma, 'CLOUD_SQL')
  } finally {
    await cloudPrisma.$disconnect()
    await cloudPool.end()
  }
}

main()
  .catch((e) => {
    console.error('Migration failed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())

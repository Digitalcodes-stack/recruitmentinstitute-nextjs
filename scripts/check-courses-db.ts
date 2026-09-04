import dotenv from 'dotenv'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

dotenv.config()
const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function check() {
  const courses = await prisma.course.findMany()
  console.log('ACTIVE COURSES:', JSON.stringify(courses, null, 2))

  const fees = await prisma.courseFee.findMany({
    include: { category: true }
  })
  console.log('FEES RECORDS:', JSON.stringify(fees, null, 2))
}

check().then(() => prisma.$disconnect())

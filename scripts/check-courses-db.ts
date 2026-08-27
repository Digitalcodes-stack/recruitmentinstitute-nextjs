import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function check() {
  const courses = await prisma.course.findMany()
  console.log('ACTIVE COURSES:', JSON.stringify(courses, null, 2))

  const fees = await prisma.courseFee.findMany({
    include: { category: true }
  })
  console.log('FEES RECORDS:', JSON.stringify(fees, null, 2))
}

check().then(() => prisma.$disconnect())

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const sessions = await prisma.session.findMany({
    select: { id: true, title: true, meetLink: true, batchId: true }
  })
  console.log('Total sessions:', sessions.length)
  sessions.forEach(s => console.log(`Session #${s.id} - ${s.title}: ${s.meetLink}`))
}

main().finally(() => prisma.$disconnect())

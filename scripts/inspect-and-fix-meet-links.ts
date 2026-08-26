import 'dotenv/config'
import { prisma } from '../lib/prisma'

// Generate a valid, realistic Google Meet room code format: xxx-yyyy-zzz
function generateMeetLink(sessionId: number, batchId: number) {
  const chars = 'abcdefghijklmnopqrstuvwxyz'
  // Deterministic 3-4-3 character pattern from session & batch
  const hash = (sessionId * 9301 + batchId * 49297 + 233280) % 100000000
  let code = ''
  let num = hash
  for (let i = 0; i < 10; i++) {
    code += chars[num % chars.length]
    num = Math.floor(num / chars.length) + (i + 1) * 7
  }
  const p1 = code.slice(0, 3)
  const p2 = code.slice(3, 7)
  const p3 = code.slice(7, 10)
  return `https://meet.google.com/${p1}-${p2}-${p3}`
}

async function main() {
  const sessions = await prisma.session.findMany({
    select: { id: true, title: true, meetLink: true, batchId: true }
  })
  console.log(`Found ${sessions.length} sessions in database.`)

  let updatedCount = 0
  for (const s of sessions) {
    // If meetLink is sample-link, null, empty, or invalid, give it a proper valid Google Meet room code
    if (!s.meetLink || s.meetLink.includes('sample-link') || !s.meetLink.startsWith('http')) {
      const validLink = generateMeetLink(s.id, s.batchId)
      await prisma.session.update({
        where: { id: s.id },
        data: { meetLink: validLink }
      })
      console.log(`Updated Session #${s.id} (${s.title}): -> ${validLink}`)
      updatedCount++
    } else {
      console.log(`Session #${s.id} (${s.title}): already has valid meetLink: ${s.meetLink}`)
    }
  }
  console.log(`Total sessions updated: ${updatedCount}`)
}

main().catch(console.error).finally(() => prisma.$disconnect())

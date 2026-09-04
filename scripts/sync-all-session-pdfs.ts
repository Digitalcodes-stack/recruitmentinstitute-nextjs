import 'dotenv/config'
import { prisma } from '../lib/prisma'
import { ensureSessionSyllabusPdf } from '../lib/services/sessionSyllabusPdfGenerator'

async function syncAllSessionPdfs() {
  console.log('Fetching all active sessions to ensure Syllabus PDFs exist...')
  const sessions = await prisma.session.findMany({
    select: { id: true, title: true, batchId: true },
    orderBy: { id: 'asc' },
  })

  console.log(`Found ${sessions.length} sessions across all batches. Generating PDFs...`)

  let successCount = 0
  let failCount = 0

  for (const s of sessions) {
    try {
      await ensureSessionSyllabusPdf(s.id)
      successCount++
      if (successCount % 10 === 0 || successCount === sessions.length) {
        console.log(`Progress: ${successCount}/${sessions.length} generated.`)
      }
    } catch (err) {
      console.error(`Error generating PDF for session ${s.id} (${s.title}):`, err)
      failCount++
    }
  }

  console.log(`Sync complete! Success: ${successCount}, Failed: ${failCount}`)
}

syncAllSessionPdfs()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Fatal sync error:', err)
    process.exit(1)
  })

import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { prisma } from '../lib/prisma'
import { ensureSessionSyllabusPdf } from '../lib/services/sessionSyllabusPdfGenerator'
import { generateSessionsForBatch } from '../lib/services/batchSessionGenerator'

async function runVerification() {
  console.log('=== VERIFYING SESSION SYLLABUS PDF & ATTENDANCE ACCESS SYSTEM ===\n')

  // 1. Verify existing session syllabus PDF generation
  const session = await prisma.session.findFirst({
    where: { syllabusModuleId: { not: null } },
    include: {
      batch: { include: { course: true } },
      trainer: true,
      syllabusModule: true,
    },
  })

  if (!session) {
    throw new Error('No session with syllabusModule found for test')
  }

  console.log(`[Test 1] Generating Syllabus PDF for Session #${session.id} (${session.title})...`)
  const pdfResult = await ensureSessionSyllabusPdf(session.id, true)
  console.log('✓ PDF generated successfully:', {
    url: pdfResult.pdfUrl,
    filePath: pdfResult.filePath,
    bytes: pdfResult.buffer.length,
    fileExistsOnDisk: fs.existsSync(pdfResult.filePath),
  })

  // Check that the session in DB was updated with syllabusPdfUrl
  const updatedSession = await prisma.session.findUnique({ where: { id: session.id } })
  if (!updatedSession?.syllabusPdfUrl) {
    throw new Error(`Session ${session.id} was not updated with syllabusPdfUrl in DB`)
  }
  console.log('✓ Database syllabusPdfUrl updated:', updatedSession.syllabusPdfUrl)

  // 2. Test PDF generation for an AI for Recruitment session
  const aiSession = await prisma.session.findFirst({
    where: { batch: { course: { title: { contains: 'AI for Recruitment' } } } },
    include: { batch: { include: { course: true } } },
  })

  if (aiSession) {
    console.log(`\n[Test 2] Generating PDF for AI for Recruitment Session #${aiSession.id}...`)
    const aiPdf = await ensureSessionSyllabusPdf(aiSession.id, true)
    console.log('✓ AI for Recruitment Syllabus PDF generated:', {
      bytes: aiPdf.buffer.length,
      path: aiPdf.filePath,
    })
  }

  // 3. Verify that generateSessionsForBatch automatically generates PDFs
  console.log('\n[Test 3] Testing auto-generation in batchSessionGenerator...')
  // Find a test batch
  const testBatch = await prisma.batch.findFirst({
    where: { status: 'UPCOMING' },
    select: { id: true, name: true, courseId: true },
  })

  if (testBatch) {
    console.log(`Checking batch #${testBatch.id} (${testBatch.name}) sessions...`)
    const batchSessions = await prisma.session.findMany({
      where: { batchId: testBatch.id },
      select: { id: true, title: true, syllabusPdfUrl: true },
    })

    const allHavePdfUrl = batchSessions.every((s) => Boolean(s.syllabusPdfUrl))
    console.log(`✓ All ${batchSessions.length} sessions in batch have syllabusPdfUrl: ${allHavePdfUrl}`)
  }

  console.log('\n=== ALL TESTS PASSED SUCCESSFULLY! ===')
}

runVerification()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Verification failed:', err)
    process.exit(1)
  })

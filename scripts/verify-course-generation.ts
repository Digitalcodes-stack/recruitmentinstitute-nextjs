import dotenv from 'dotenv'
dotenv.config()

import { generateNextBatch } from '../lib/services/nextBatchGenerator'
import { prisma } from '../lib/prisma'

async function run() {
  console.log('Testing generateNextBatch for Course #29 (AI for Recruitment)...')
  const result = await generateNextBatch(29, {
    classDays: [2, 4], // Tue & Thu
    startTime: '19:00',
    endTime: '21:00',
  })
  console.log('Successfully generated batch:')
  console.log({
    batchId: result.batchId,
    batchName: result.batchName,
    trainerName: result.trainerName,
    startDate: result.startDate,
    sessionsCreated: result.sessionsCreated,
  })
  console.log(`Sessions preview count: ${result.sessionPreview.length}`)
  if (result.sessionPreview.length > 0) {
    console.log('First session:', result.sessionPreview[0])
    console.log('Last session:', result.sessionPreview[result.sessionPreview.length - 1])
  }

  // Clean up test batch so we leave only Cohort 1
  console.log(`Cleaning up test batch ${result.batchId}...`)
  await prisma.session.deleteMany({ where: { batchId: result.batchId } })
  await prisma.batch.delete({ where: { id: result.batchId } })
  console.log('Test batch cleaned up.')
}

run()
  .catch((e) => {
    console.error('Error running test:', e)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

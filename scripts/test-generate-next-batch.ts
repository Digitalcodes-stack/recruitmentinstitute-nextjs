import { generateNextBatch, NoTrainerAvailableError } from '../lib/services/nextBatchGenerator'
import { prisma } from '../lib/prisma'

async function main() {
  const courseId = Number(process.argv[2] ?? 22)
  console.log(`Generating next batch for course #${courseId}...`)
  try {
    const result = await generateNextBatch(courseId)
    console.log('SUCCESS:', JSON.stringify(result, null, 2))
  } catch (err) {
    if (err instanceof NoTrainerAvailableError) {
      console.log('EXPECTED FAILURE (no trainer available):', err.message)
    } else {
      console.error('UNEXPECTED ERROR:', err)
    }
  }
}
main().finally(() => prisma.$disconnect())

import 'dotenv/config'
import { prisma } from '../lib/prisma'

async function main() {
  console.log('Updating trainer bios, quotes, and specializations in database...')

  // 1. Brahmita Nayak
  const brahmita = await prisma.trainer.updateMany({
    where: {
      OR: [
        { email: 'brahmita.nayak@institute.com' },
        { name: { contains: 'Brahmita', mode: 'insensitive' } },
      ],
    },
    data: {
      specialization: 'HR & Soft Skills Specialist',
      bio: 'Senior HR strategist and soft-skills mentor with 15+ years transforming professionals into high-impact talent partners through practical corporate HR operations and behavioral communication mastery.',
    },
  })
  console.log('Updated Brahmita rows:', brahmita.count)

  // 2. Shesha Shhiv Mohanty
  const shesha = await prisma.trainer.updateMany({
    where: {
      OR: [
        { email: 'shesha.mohanty@institute.com' },
        { name: { contains: 'Shesha', mode: 'insensitive' } },
      ],
    },
    data: {
      specialization: 'AI Transformation & Recruitment Specialist',
      bio: 'AI recruitment architect and executive talent intelligence strategist with 16+ years engineering high-velocity sourcing pipelines, automated candidate discovery, and tech recruiting frameworks for global enterprises.',
    },
  })
  console.log('Updated Shesha rows:', shesha.count)
}

main()
  .then(() => {
    console.log('Trainer updates complete.')
    process.exit(0)
  })
  .catch((err) => {
    console.error('Update failed:', err)
    process.exit(1)
  })

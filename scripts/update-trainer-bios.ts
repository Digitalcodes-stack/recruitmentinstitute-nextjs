import 'dotenv/config'
import { prisma } from '../lib/prisma'

async function main() {
  console.log('Updating trainer bios, quotes and specializations in database...')

  // 1. Brahmita Nayak
  const brahmita = await prisma.trainer.updateMany({
    where: {
      OR: [
        { email: 'brahmita.nayak@institute.com' },
        { name: { contains: 'Brahmita', mode: 'insensitive' } },
      ],
    },
    data: {
      specialization: 'Recruitment & HR Transformation Expert',
      bio: 'Talent Acquisition Leader, Recruitment Business Mentor and Corporate & MNC Hiring Specialist with 22+ years empowering professionals and entrepreneurs to build structured, scalable recruitment practices.',
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
      specialization: 'AI Transformation & Recruitment Specialist | Startup & Business Growth Strategist',
      bio: 'AI Business Transformation Consultant, Startup Builder and Growth Strategist bridging the gap between traditional recruitment and AI-powered recruitment.',
    },
  })
  console.log('Updated Shesha rows:', shesha.count)

  // 3. Debabrata Pattanayak
  const debabrata = await prisma.trainer.updateMany({
    where: {
      OR: [
        { email: 'dpattanayak@institute.com' },
        { name: { contains: 'Debabrata', mode: 'insensitive' } },
        { name: { contains: 'Pattanayak', mode: 'insensitive' } },
        { name: { contains: 'Deba', mode: 'insensitive' } },
      ],
    },
    data: {
      specialization: 'Director HR & Talent Acquisition Leader | Recruitment & Leadership Mentor',
      bio: 'Director HR & Talent Acquisition Leader bringing 24+ years of real-world hiring expertise across organizational leadership, people management and corporate recruitment.',
    },
  })
  console.log('Updated Debabrata rows:', debabrata.count)
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

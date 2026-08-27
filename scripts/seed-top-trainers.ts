/**
 * One-off script: creates/updates the two named top trainers with their
 * declared weekly availability (Sat/Sun full day, weekdays 7-11 PM IST).
 * Run: npx tsx scripts/seed-top-trainers.ts
 */
import { prisma } from '../lib/prisma'
import bcrypt from 'bcryptjs'

// Sat/Sun full day (09:00-18:00), weekdays 19:00-23:00
const FULL_DAY_WEEKEND = [0, 6].map((dayOfWeek) => ({ dayOfWeek, startTime: '09:00', endTime: '18:00' }))
const WEEKDAY_EVENING = [1, 2, 3, 4, 5].map((dayOfWeek) => ({ dayOfWeek, startTime: '19:00', endTime: '23:00' }))
const AVAILABILITY = [...FULL_DAY_WEEKEND, ...WEEKDAY_EVENING]

async function main() {
  const password = await bcrypt.hash('Trainer@123', 10)

  const trainerSeeds = [
    {
      name: 'Brahmita Nayak',
      email: 'brahmita.nayak@institute.com',
      phone: '9870001005',
      specialization: 'HR & Soft Skills',
      bio: 'HR and soft-skills trainer with 15+ years of experience, having trained 1000+ professionals across recruitment and corporate HR programs.',
      image: '/assets/images/trainers/brahmita_mam.jpg',
    },
    {
      name: 'Shesha Shhiv Mohanty',
      email: 'shesha.mohanty@institute.com',
      phone: '9870001006',
      specialization: 'AI Transformation & Recruitment',
      bio: 'AI transformation and recruitment trainer with 15+ years of experience, having trained 1000+ professionals across HR tech and talent acquisition.',
      image: '/assets/images/trainers/shesha_sir.jpg',
    },
  ]

  for (const t of trainerSeeds) {
    const trainer = await prisma.trainer.upsert({
      where: { email: t.email },
      update: { name: t.name, phone: t.phone, specialization: t.specialization, bio: t.bio, image: t.image, isActive: true },
      create: { ...t, password, isActive: true },
    })

    await prisma.trainerAvailability.deleteMany({ where: { trainerId: trainer.id } })
    await prisma.trainerAvailability.createMany({
      data: AVAILABILITY.map((slot) => ({ ...slot, trainerId: trainer.id })),
    })

    console.log(`Upserted trainer: ${trainer.name} (id ${trainer.id}) with ${AVAILABILITY.length} availability slots`)
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())

import 'dotenv/config'
import { prisma } from '../lib/prisma'
import bcrypt from 'bcryptjs'

async function check() {
  console.log('--- ADMIN USERS ---')
  const admins = await prisma.adminUser.findMany()
  for (const a of admins) {
    console.log(`Admin ID: ${a.id}, Email: ${a.email}, Active: ${a.isActive}, Role: ${a.role}`)
    console.log(`Password format: length=${a.password.length}, startsWith=$2=${a.password.startsWith('$2')}`)
    // check if it matches Admin@123 or similar standard seed passwords
    const isSeedMatch = await bcrypt.compare('Admin@123', a.password).catch(() => false)
    console.log(`Matches Admin@123: ${isSeedMatch}`)
  }

  console.log('\n--- TRAINER USERS ---')
  const trainers = await prisma.trainer.findMany()
  for (const t of trainers) {
    console.log(`Trainer ID: ${t.id}, Name: ${t.name}, Email: ${t.email}, Active: ${t.isActive}`)
    console.log(`Password format: length=${t.password.length}, startsWith=$2=${t.password.startsWith('$2')}`)
    const matchTrainer123 = await bcrypt.compare('Trainer@123', t.password).catch(() => false)
    console.log(`Matches Trainer@123: ${matchTrainer123}`)
  }

  console.log('\n--- STUDENT USERS ---')
  const students = await prisma.student.findMany({ take: 5 })
  for (const s of students) {
    console.log(`Student ID: ${s.id}, Name: ${s.name}, Email: ${s.email}, Active: ${s.isActive}`)
    console.log(`Password format: length=${s.password.length}, startsWith=$2=${s.password.startsWith('$2')}`)
    const matchStudent123 = await bcrypt.compare('Student@123', s.password).catch(() => false)
    console.log(`Matches Student@123: ${matchStudent123}`)
  }

  console.log('\n--- BATCHES & SESSIONS ---')
  const batches = await prisma.batch.findMany({
    include: {
      trainer: true,
      course: { select: { title: true } },
      enrollments: { include: { student: { select: { name: true, email: true } } } },
      sessions: true,
    },
    take: 5,
  })
  console.log(`Total batches found: ${batches.length}`)
  for (const b of batches) {
    console.log(`Batch ${b.id} (${b.name}): Course=${b.course?.title}, Trainer=${b.trainer?.name} (id=${b.trainerId}), Students=${b.enrollments.length}, Sessions=${b.sessions.length}`)
  }

  console.log('\n--- ASSESSMENTS ---')
  const assessments = await prisma.sessionAssessment.findMany({ take: 3 })
  console.log(`Total session assessments: ${assessments.length}`)
}

check()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })

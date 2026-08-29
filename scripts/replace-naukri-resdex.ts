import { prisma } from '../lib/prisma'

async function main() {
  const r1 = await prisma.$executeRawUnsafe(`UPDATE lms_topics SET title = REPLACE(title, 'Naukri Resdex', 'Job Portal') WHERE title ILIKE '%Naukri Resdex%'`)
  const r2 = await prisma.$executeRawUnsafe(`UPDATE lms_lessons SET title = REPLACE(title, 'Naukri Resdex', 'Job Portal') WHERE title ILIKE '%Naukri Resdex%'`)
  const r3 = await prisma.$executeRawUnsafe(`UPDATE lms_modules SET title = REPLACE(title, 'Naukri Resdex', 'Job Portal'), description = REPLACE(description, 'Naukri Resdex', 'Job Portal') WHERE title ILIKE '%Naukri Resdex%' OR description ILIKE '%Naukri Resdex%'`)
  const r4 = await prisma.$executeRawUnsafe(`UPDATE courses SET description = REPLACE(description, 'Naukri Resdex', 'Job Portal') WHERE description ILIKE '%Naukri Resdex%'`)
  const r5 = await prisma.$executeRawUnsafe(`UPDATE sessions SET title = REPLACE(title, 'Naukri Resdex', 'Job Portal') WHERE title ILIKE '%Naukri Resdex%'`)
  console.log('Database updated successfully:', { lms_topics: r1, lms_lessons: r2, lms_modules: r3, courses: r4, sessions: r5 })
}

main().catch(console.error).finally(() => prisma.$disconnect())

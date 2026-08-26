/**
 * Database Seed Script
 * Creates initial admin user and sample data
 * Usage: npx ts-node scripts/seed.ts
 */

import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'

dotenv.config()

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Seeding database...')

  // Admin user
  const adminPassword = await bcrypt.hash('Admin@123', 12)
  const admin = await prisma.adminUser.upsert({
    where: { email: 'admin@recruitmentinstitute.in' },
    create: {
      name: 'Admin',
      email: 'admin@recruitmentinstitute.in',
      password: adminPassword,
      role: 'ADMIN',
      isActive: true,
    },
    update: {},
  })
  console.log('✅ Admin user created:', admin.email)

  // Course categories
  const categories = [
    { name: 'End-to-End Recruitment', slug: 'end-to-end-recruitment-training' },
    { name: 'HR for Beginners', slug: 'hr-courses-for-beginners' },
    { name: 'HR Entrepreneurship', slug: 'hr-entrepreneurship-program' },
    { name: 'HR Corporate Training', slug: 'hr-corporate-training-course' },
  ]

  for (const cat of categories) {
    await prisma.courseCategory.upsert({
      where: { slug: cat.slug },
      create: cat,
      update: {},
    })
  }
  console.log('✅ Course categories seeded')

  // Sample blog post
  await prisma.blog.upsert({
    where: { slug: 'welcome-to-recruitment-institute-blog' },
    create: {
      title: 'Welcome to Recruitment Institute Blog',
      slug: 'welcome-to-recruitment-institute-blog',
      content: '<p>Welcome to the Recruitment Institute blog! Here you will find expert articles on HR, recruitment strategies, career development, and industry insights.</p><p>Stay tuned for regular updates from our expert trainers and HR professionals.</p>',
      author: 'Recruitment Institute',
      isPublished: true,
      metaTitle: 'Welcome to Recruitment Institute Blog',
      metaDescription: 'Expert articles on HR, recruitment strategies, and career development.',
    },
    update: {},
  })
  console.log('✅ Sample blog post seeded')

  // Sample knowledge item
  await prisma.knowledgeItem.upsert({
    where: { id: 1 },
    create: {
      question: 'What is End-to-End Recruitment?',
      answer: 'End-to-End Recruitment refers to the complete process of hiring — from identifying a vacancy and creating a job description to sourcing candidates, screening, interviewing, making an offer, and onboarding the new employee.',
      addedBy: 'Recruitment Institute',
    },
    update: {},
  })
  console.log('✅ Sample knowledge item seeded')

  console.log('\n🎉 Seeding complete!')
  console.log('\n📋 Admin credentials:')
  console.log('   Email: admin@recruitmentinstitute.in')
  console.log('   Password: Admin@123')
  console.log('\n⚠️  Change the admin password after first login!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())

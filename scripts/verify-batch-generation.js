const dotenv = require('dotenv')
dotenv.config()
const { Pool } = require('pg')
const { PrismaPg } = require('@prisma/adapter-pg')
const { PrismaClient } = require('@prisma/client')

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function check() {
  console.log('--- CHECKING AI FOR RECRUITMENT IN DATABASE ---')

  const category = await prisma.courseCategory.findUnique({
    where: { slug: 'ai-for-recruitment' },
    include: {
      courses: {
        include: {
          modules: {
            orderBy: { sortOrder: 'asc' },
            include: {
              chapters: {
                include: { topics: true },
              },
            },
          },
          batches: {
            include: {
              trainer: true,
              sessions: {
                orderBy: { sessionDate: 'asc' },
              },
            },
          },
        },
      },
      fees: true,
      faqs: true,
    },
  })

  if (!category) {
    console.error('❌ Category not found!')
    return
  }

  console.log('✅ Category:', category.name, '(ID:', category.id, ')')
  console.log('✅ Fees:', category.fees.map(f => `Online: ₹${f.onlineFinal} / Offline: ₹${f.offlineFinal} (Coupon: ${f.couponCode})`))
  console.log('✅ FAQs count:', category.faqs.length)

  const course = category.courses[0]
  if (!course) {
    console.error('❌ Course not found!')
    return
  }

  console.log('✅ Course Title:', course.title, '(ID:', course.id, ')')
  console.log('✅ Duration:', course.duration)
  console.log('✅ Rating:', course.rating, '| Total Students:', course.totalStudents)
  console.log('✅ Modules count:', course.modules.length)

  course.modules.slice(0, 3).forEach((m, idx) => {
    const topics = m.chapters.flatMap(ch => ch.topics.map(t => t.title))
    console.log(`   Module ${idx + 1}: ${m.title} (${topics.length} topics)`)
  })
  console.log(`   ... and ${course.modules.length - 3} more modules`)

  console.log('✅ Batches count:', course.batches.length)
  const batch = course.batches[0]
  if (batch) {
    console.log('   Batch Name:', batch.name)
    console.log('   Trainer:', batch.trainer.name)
    console.log('   Schedule:', batch.schedule)
    console.log('   Sessions count:', batch.sessions.length)
    if (batch.sessions.length > 0) {
      console.log('   First session:', batch.sessions[0].title, 'Date:', batch.sessions[0].sessionDate.toISOString().slice(0, 10))
      console.log('   Meet link:', batch.sessions[0].meetLink)
      console.log('   Topics covered:', batch.sessions[0].topicsJson?.length, 'topics')
    }
  }
}

check()
  .catch(console.error)
  .finally(() => prisma.$disconnect())

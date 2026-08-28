import dotenv from 'dotenv'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient, BatchMode, BatchStatus } from '@prisma/client'

dotenv.config()

const targetDbUrl = process.env.PROD_DATABASE_URL || process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/recruitmentinstitute'
console.log(`🚀 Connecting to: ${targetDbUrl.includes('35.200.228.49') ? 'Cloud SQL Production' : 'Local Database'}`)

const pool = new Pool({ connectionString: targetDbUrl })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

interface FutureBatchBlueprint {
  courseSlug: string
  name: string
  trainerEmail: string
  capacity: number
  mode: BatchMode
  startDate: string // YYYY-MM-DD
  endDate: string // YYYY-MM-DD
  schedule: string
  status: BatchStatus
  sessions: {
    title: string
    dateOffsetDays: number // offset from startDate
    startHour: number
    durationHours: number
  }[]
}

const FUTURE_BATCHES_DATA: FutureBatchBlueprint[] = [
  // 1. Recruitment Career Starter (4 Weeks)
  {
    courseSlug: 'for-freshers',
    name: 'Recruitment Career Starter — Weekend Morning Cohort (Sept 2026)',
    trainerEmail: 'suresh.bansal@institute.com',
    capacity: 30,
    mode: BatchMode.ONLINE,
    startDate: '2026-09-12',
    endDate: '2026-10-11',
    schedule: 'Sat & Sun 10:00 AM – 1:00 PM IST (Live Online)',
    status: BatchStatus.UPCOMING,
    sessions: [
      { title: 'Orientation & Recruitment Lifecycle Fundamentals', dateOffsetDays: 0, startHour: 10, durationHours: 3 },
      { title: 'Job Description Breakdown & Intake Alignment', dateOffsetDays: 1, startHour: 10, durationHours: 3 },
      { title: 'Boolean Logic & Naukri Resdex Practical Lab', dateOffsetDays: 7, startHour: 10, durationHours: 3 },
      { title: 'LinkedIn Talent Sourcing & X-Ray Operators', dateOffsetDays: 8, startHour: 10, durationHours: 3 },
      { title: 'Candidate Screening Calls & Salary Benchmarking', dateOffsetDays: 14, startHour: 10, durationHours: 3 },
      { title: 'Interview Coordination & Feedback Management', dateOffsetDays: 15, startHour: 10, durationHours: 3 },
      { title: 'ATS Resume Review, Mock Interviews & Placement Drive', dateOffsetDays: 21, startHour: 10, durationHours: 3 },
    ],
  },
  {
    courseSlug: 'for-freshers',
    name: 'Recruitment Career Starter — Weekday Evening Fast-Track (Sept 2026)',
    trainerEmail: 'trainerpriya@recruitmentinstitute.com',
    capacity: 25,
    mode: BatchMode.ONLINE,
    startDate: '2026-09-21',
    endDate: '2026-10-20',
    schedule: 'Mon to Thu 7:00 PM – 8:30 PM IST (Live Online)',
    status: BatchStatus.UPCOMING,
    sessions: [
      { title: 'Talent Acquisition Frameworks & JD Analysis', dateOffsetDays: 0, startHour: 19, durationHours: 1.5 },
      { title: 'Naukri Resdex Filters & Active Candidate Search', dateOffsetDays: 1, startHour: 19, durationHours: 1.5 },
      { title: 'LinkedIn Recruiter & Boolean String Building', dateOffsetDays: 2, startHour: 19, durationHours: 1.5 },
      { title: 'Candidate Calling Pitch & Objection Handling', dateOffsetDays: 7, startHour: 19, durationHours: 1.5 },
      { title: 'Mock Interview Simulations & Capstone Submission', dateOffsetDays: 14, startHour: 19, durationHours: 1.5 },
    ],
  },
  {
    courseSlug: 'for-freshers',
    name: 'Recruitment Career Starter — Pune Classroom Immersion (Oct 2026)',
    trainerEmail: 'brahmita.nayak@institute.com',
    capacity: 20,
    mode: BatchMode.OFFLINE,
    startDate: '2026-10-05',
    endDate: '2026-11-04',
    schedule: 'Mon, Wed, Fri 11:00 AM – 1:30 PM IST (Pune Center Classroom)',
    status: BatchStatus.UPCOMING,
    sessions: [
      { title: 'Classroom Onboarding & HR Recruiter Blueprint', dateOffsetDays: 0, startHour: 11, durationHours: 2.5 },
      { title: 'Live Portal Calling Drills & Candidate Engagement', dateOffsetDays: 2, startHour: 11, durationHours: 2.5 },
      { title: 'Boolean & X-Ray Live Sourcing Bootcamp', dateOffsetDays: 7, startHour: 11, durationHours: 2.5 },
    ],
  },

  // 2. Professional Recruitment Specialist (8 Weeks)
  {
    courseSlug: 'for-professionals',
    name: 'Professional Recruitment Specialist — Weekend Intensive Cohort (Sept 2026)',
    trainerEmail: 'suresh.bansal@institute.com',
    capacity: 35,
    mode: BatchMode.ONLINE,
    startDate: '2026-09-13',
    endDate: '2026-11-08',
    schedule: 'Sat & Sun 2:00 PM – 5:30 PM IST (Live Online + Practical Labs)',
    status: BatchStatus.UPCOMING,
    sessions: [
      { title: '360° Full-Lifecycle Recruitment & Stakeholder Intake', dateOffsetDays: 0, startHour: 14, durationHours: 3.5 },
      { title: 'IT Recruitment Deep Dive: Full-Stack, Cloud & AI Stacks', dateOffsetDays: 6, startHour: 14, durationHours: 3.5 },
      { title: 'Non-IT, BFSI & Manufacturing Niche Talent Sourcing', dateOffsetDays: 13, startHour: 14, durationHours: 3.5 },
      { title: 'Structured STAR Interviewing & Evaluation Rubrics', dateOffsetDays: 20, startHour: 14, durationHours: 3.5 },
      { title: 'Compensation Structuring, Offer Negotiation & Buyouts', dateOffsetDays: 27, startHour: 14, durationHours: 3.5 },
      { title: 'Mitigating Counter-Offers & 30-Day Pre-Boarding Protocol', dateOffsetDays: 34, startHour: 14, durationHours: 3.5 },
      { title: 'AI Sourcing Automation, Copilots & ATS Pipelines', dateOffsetDays: 41, startHour: 14, durationHours: 3.5 },
      { title: 'Executive TA MIS Dashboards & Live Capstone Delivery', dateOffsetDays: 48, startHour: 14, durationHours: 3.5 },
    ],
  },
  {
    courseSlug: 'for-professionals',
    name: 'Professional Recruitment Specialist — Weekday Evening Cohort (Sept 2026)',
    trainerEmail: 'shesha.mohanty@institute.com',
    capacity: 25,
    mode: BatchMode.ONLINE,
    startDate: '2026-09-28',
    endDate: '2026-11-23',
    schedule: 'Mon to Thu 8:00 PM – 9:30 PM IST (Live Online)',
    status: BatchStatus.UPCOMING,
    sessions: [
      { title: 'Advanced Requisition Management & Intake Frameworks', dateOffsetDays: 0, startHour: 20, durationHours: 1.5 },
      { title: 'Deep Web & GitHub Tech Sourcing', dateOffsetDays: 7, startHour: 20, durationHours: 1.5 },
      { title: 'STAR Behavioral Interview Masterclass', dateOffsetDays: 14, startHour: 20, durationHours: 1.5 },
      { title: 'AI Automation & Executive MIS Reporting', dateOffsetDays: 21, startHour: 20, durationHours: 1.5 },
    ],
  },
  {
    courseSlug: 'for-professionals',
    name: 'Professional Recruitment Specialist — Pune Hybrid Cohort (Oct 2026)',
    trainerEmail: 'suresh.bansal@institute.com',
    capacity: 20,
    mode: BatchMode.HYBRID,
    startDate: '2026-10-10',
    endDate: '2026-12-05',
    schedule: 'Sat 10:00 AM – 2:00 PM (Pune Center) + Wed 7:30 PM (Online)',
    status: BatchStatus.UPCOMING,
    sessions: [
      { title: 'Pune Center Workshop: Live Requisition Sourcing', dateOffsetDays: 0, startHour: 10, durationHours: 4 },
      { title: 'Virtual Masterclass: IT Architecture & Tech Sourcing', dateOffsetDays: 4, startHour: 19.5, durationHours: 2 },
    ],
  },

  // 3. Advanced Recruitment & TA Masterclass (6 Weeks)
  {
    courseSlug: 'senior-professionals',
    name: 'Advanced Recruitment & TA Masterclass — Executive Weekend Cohort (Sept 2026)',
    trainerEmail: 'priti.shah@institute.com',
    capacity: 25,
    mode: BatchMode.ONLINE,
    startDate: '2026-09-19',
    endDate: '2026-10-31',
    schedule: 'Sat & Sun 10:30 AM – 1:30 PM IST (Executive Virtual Masterclass)',
    status: BatchStatus.UPCOMING,
    sessions: [
      { title: 'Strategic TA Alignment & Workforce Headcount Modeling', dateOffsetDays: 0, startHour: 10.5, durationHours: 3 },
      { title: 'Executive Search, Leadership Mapping & Headhunting', dateOffsetDays: 7, startHour: 10.5, durationHours: 3 },
      { title: 'Building Automated PowerBI / Looker TA Dashboards', dateOffsetDays: 14, startHour: 10.5, durationHours: 3 },
      { title: 'Employer Value Proposition (EVP) & Talent Community Design', dateOffsetDays: 21, startHour: 10.5, durationHours: 3 },
      { title: 'Recruiter Incentive Systems, Team KPIs & Vendor Management', dateOffsetDays: 28, startHour: 10.5, durationHours: 3 },
      { title: 'Enterprise ATS Stack Evaluation & Capstone Review', dateOffsetDays: 35, startHour: 10.5, durationHours: 3 },
    ],
  },
  {
    courseSlug: 'senior-professionals',
    name: 'Advanced Recruitment & TA Masterclass — Evening Leadership Cohort (Oct 2026)',
    trainerEmail: 'vivek.srivastava@institute.com',
    capacity: 20,
    mode: BatchMode.ONLINE,
    startDate: '2026-10-13',
    endDate: '2026-11-24',
    schedule: 'Tue & Thu 7:30 PM – 9:30 PM IST (Executive Virtual Masterclass)',
    status: BatchStatus.UPCOMING,
    sessions: [
      { title: 'Workforce Forecasting & Hiring SLA Architecture', dateOffsetDays: 0, startHour: 19.5, durationHours: 2 },
      { title: 'Leadership Headhunting & Executive Compensation', dateOffsetDays: 7, startHour: 19.5, durationHours: 2 },
    ],
  },

  // 4. Recruitment Business Accelerator (8 Weeks)
  {
    courseSlug: 'entrepreneurship',
    name: 'Recruitment Business Accelerator — Agency Founder Cohort A (Sept 2026)',
    trainerEmail: 'rohit.malhotra@institute.com',
    capacity: 25,
    mode: BatchMode.ONLINE,
    startDate: '2026-09-14',
    endDate: '2026-11-09',
    schedule: 'Mon, Wed, Fri 6:30 PM – 8:30 PM IST (Founder Mastermind)',
    status: BatchStatus.UPCOMING,
    sessions: [
      { title: 'Niche Selection, Agency Business Models & Rate Card Structuring', dateOffsetDays: 0, startHour: 18.5, durationHours: 2 },
      { title: 'Legal Incorporation, GST/MSME & Master Service Agreements (MSAs)', dateOffsetDays: 7, startHour: 18.5, durationHours: 2 },
      { title: 'Agency ATS Setup, Portal Subscriptions & Standard SOPs', dateOffsetDays: 14, startHour: 18.5, durationHours: 2 },
      { title: 'Outbound B2B Client Acquisition: LinkedIn Prospecting & Cold Email', dateOffsetDays: 21, startHour: 18.5, durationHours: 2 },
      { title: 'Closing Corporate Clients & Retainer Contract Negotiation', dateOffsetDays: 28, startHour: 18.5, durationHours: 2 },
      { title: 'High-Velocity Fulfillment Engine & Rapid Invoice Collections', dateOffsetDays: 35, startHour: 18.5, durationHours: 2 },
      { title: 'Hiring Recruiters, Commission Models & AI Copilots', dateOffsetDays: 42, startHour: 18.5, durationHours: 2 },
      { title: 'Working Capital, Invoice Discounting & 12-Month ₹1 Cr Scaling Blueprint', dateOffsetDays: 49, startHour: 18.5, durationHours: 2 },
    ],
  },
  {
    courseSlug: 'entrepreneurship',
    name: 'Recruitment Business Accelerator — Weekend Founder Cohort (Oct 2026)',
    trainerEmail: 'rohit.malhotra@institute.com',
    capacity: 20,
    mode: BatchMode.ONLINE,
    startDate: '2026-10-03',
    endDate: '2026-11-28',
    schedule: 'Sat & Sun 3:00 PM – 6:00 PM IST (Founder Mastermind)',
    status: BatchStatus.UPCOMING,
    sessions: [
      { title: 'Agency Positioning, Market Selection & Legal Setup', dateOffsetDays: 0, startHour: 15, durationHours: 3 },
      { title: 'B2B Client Funnel Architecture & Sales Scripts', dateOffsetDays: 7, startHour: 15, durationHours: 3 },
      { title: 'Client Negotiation, Delivery & Team Scaling', dateOffsetDays: 14, startHour: 15, durationHours: 3 },
    ],
  },

  // 5. Recruitment Business Growth Consulting (3 Months)
  {
    courseSlug: 'business-consulting',
    name: 'Recruitment Business Growth Consulting — Q4 Founder Advisory Circle (Oct 2026)',
    trainerEmail: 'rohit.malhotra@institute.com',
    capacity: 10,
    mode: BatchMode.ONLINE,
    startDate: '2026-10-01',
    endDate: '2026-12-31',
    schedule: 'Weekly 1-on-1 Bespoke Advisory Sessions + Monthly Mastermind',
    status: BatchStatus.UPCOMING,
    sessions: [
      { title: 'Agency Diagnostics, Margins Audit & Account Restructuring', dateOffsetDays: 0, startHour: 16, durationHours: 2 },
      { title: 'High-Ticket Retained Search Positioning & Client Pitch Review', dateOffsetDays: 30, startHour: 16, durationHours: 2 },
      { title: 'Recruitment Automation, Cash Flow DSO & Expansion Review', dateOffsetDays: 60, startHour: 16, durationHours: 2 },
    ],
  },

  // 6. Corporate Recruitment Training (Flexible / Custom)
  {
    courseSlug: 'corporate',
    name: 'Corporate Recruitment Training — Enterprise TA Capability Cohort (Sept 2026)',
    trainerEmail: 'vivek.srivastava@institute.com',
    capacity: 50,
    mode: BatchMode.HYBRID,
    startDate: '2026-09-07',
    endDate: '2026-10-05',
    schedule: 'Custom Enterprise Schedule (On-Premise & Virtual)',
    status: BatchStatus.UPCOMING,
    sessions: [
      { title: 'Corporate Sourcing Audit & Boolean Optimization Workshop', dateOffsetDays: 0, startHour: 10, durationHours: 3 },
      { title: 'Hiring Manager Structured STAR Interviewing Simulation', dateOffsetDays: 7, startHour: 10, durationHours: 3 },
      { title: 'Candidate Experience, Pre-Boarding & AI TA Tools', dateOffsetDays: 14, startHour: 10, durationHours: 3 },
    ],
  },
]

async function main() {
  console.log('🧹 Purging all legacy batches, sessions, and child records...')

  // Step 1: Delete dependent records on Batches
  try { await prisma.attendance.deleteMany({}) } catch {}
  try { await prisma.sessionAssessment.deleteMany({}) } catch {}
  try { await prisma.resource.deleteMany({ where: { sessionId: { not: null } } }) } catch {}
  try { await prisma.session.deleteMany({}) } catch {}
  try { await prisma.assignmentSubmission.deleteMany({}) } catch {}
  try { await prisma.assignment.deleteMany({}) } catch {}
  try { await prisma.certificate.deleteMany({}) } catch {}
  try { await prisma.studentFeeAccount.deleteMany({}) } catch {}
  try { await prisma.enrollment.deleteMany({}) } catch {}
  try { await prisma.batch.deleteMany({}) } catch {}

  // Reset ID sequences for clean IDs
  try {
    await pool.query("SELECT setval(pg_get_serial_sequence('batches', 'id'), 1, false)")
    await pool.query("SELECT setval(pg_get_serial_sequence('sessions', 'id'), 1, false)")
  } catch {}

  console.log('✅ Successfully cleared all legacy batches & sessions.')

  // Step 2: Fetch canonical courses and trainers
  const courses = await prisma.course.findMany({ include: { category: true } })
  const trainers = await prisma.trainer.findMany()

  console.log(`Found ${courses.length} courses and ${trainers.length} trainers.`)

  const courseMap = new Map<string, number>()
  for (const c of courses) {
    courseMap.set(c.category.slug, c.id)
  }

  const trainerMap = new Map<string, number>()
  for (const t of trainers) {
    trainerMap.set(t.email.toLowerCase(), t.id)
  }
  const fallbackTrainerId = trainers[0]?.id || 1

  // Step 3: Create clean future batches with accurate information
  console.log('\n🚀 Creating clean future batches for all 6 canonical courses...')

  for (let i = 0; i < FUTURE_BATCHES_DATA.length; i++) {
    const item = FUTURE_BATCHES_DATA[i]
    const courseId = courseMap.get(item.courseSlug)

    if (!courseId) {
      console.warn(`⚠️ Course with slug ${item.courseSlug} not found in database!`)
      continue
    }

    const trainerId = trainerMap.get(item.trainerEmail.toLowerCase()) || fallbackTrainerId

    const batch = await prisma.batch.create({
      data: {
        name: item.name,
        courseId,
        trainerId,
        capacity: item.capacity,
        mode: item.mode,
        startDate: new Date(item.startDate),
        endDate: new Date(item.endDate),
        schedule: item.schedule,
        status: item.status,
      },
    })

    console.log(`  [${i + 1}/${FUTURE_BATCHES_DATA.length}] ✅ Created: ${batch.name} (ID: ${batch.id}, Start: ${item.startDate}, Mode: ${item.mode})`)

    // Create live sessions for this batch
    for (let sIdx = 0; sIdx < item.sessions.length; sIdx++) {
      const s = item.sessions[sIdx]
      const sessionDate = new Date(new Date(item.startDate).getTime() + s.dateOffsetDays * 86_400_000)
      const startTime = new Date(sessionDate)
      startTime.setHours(Math.floor(s.startHour), (s.startHour % 1) * 60, 0, 0)
      const endTime = new Date(startTime.getTime() + s.durationHours * 3600_000)

      await prisma.session.create({
        data: {
          batchId: batch.id,
          trainerId,
          title: s.title,
          sessionDate,
          startTime,
          endTime,
          meetLink: `https://meet.google.com/rec-${batch.id}-${sIdx + 1}`,
          status: 'UPCOMING',
        },
      })
    }
  }

  const finalBatchCount = await prisma.batch.count()
  const finalSessionCount = await prisma.session.count()
  console.log(`\n🎉 Done! Created ${finalBatchCount} clean future batches with ${finalSessionCount} scheduled live sessions.`)
}

main()
  .catch((e) => {
    console.error('Error recreating future batches:', e)
    process.exit(1)
  })
  .finally(async () => {
    await pool.end()
    await prisma.$disconnect()
  })

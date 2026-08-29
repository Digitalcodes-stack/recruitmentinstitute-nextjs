import dotenv from 'dotenv'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

dotenv.config()

const connectionString = process.env.PROD_DATABASE_URL || process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/recruitmentinstitute'
console.log(`Connecting to database: ${connectionString.includes('35.200.228.49') ? 'Cloud SQL Production' : 'Local Database'}`)
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

interface MasterModule {
  title: string
  description?: string
  chapters: {
    title: string
    topics: string[]
  }[]
}

const MASTER_COURSES_DATA = [
  {
    categorySlug: 'degree_tag',
    categoryName: 'End-to-End Recruitment Training',
    title: 'End-to-End Recruitment Training',
    duration: '3 Months',
    shortDescription: 'Master the complete talent acquisition lifecycle with our industry-accredited End-to-End Recruitment Training. Covers candidate sourcing, Boolean search, portal management, competency-based interviewing, multi-domain hiring (IT, Healthcare, BFSI), and statutory compliance with dedicated placement support.',
    fees: 95000,
    discount: 10000,
    finalTotal: 85000,
    rating: 5.0,
    totalStudents: 5000,
    faqs: [
      { q: 'What is the duration and schedule of the course?', a: 'The course spans 3 Months (12 weeks). Classes are held on weekends (Saturday & Sunday, 2 hours/day) with weekday doubt-clearing sessions and hands-on sourcing labs.' },
      { q: 'What are the prerequisites to join this program?', a: 'There are no strict prerequisites. A bachelor’s degree in any discipline (or final-year students), basic computer literacy, and strong communication skills are sufficient.' },
      { q: 'How is this course different from generic HR management courses?', a: 'Unlike broad theoretical HR courses, this program is 100% focused on Talent Acquisition and Recruitment operations. You spend over 60% of class time actively sourcing, screening, and simulating hiring mandates.' },
      { q: 'Is placement support provided?', a: 'Yes. We provide comprehensive career support including 1-on-1 resume rebuilding, LinkedIn profile optimization, mock recruitment interviews, and direct referrals to our network of 150+ hiring partners.' },
      { q: 'Are flexible installment / EMI options available?', a: 'Yes. The course fee of ₹85,000 can be paid through easy no-cost and low-cost EMI options starting at ₹14,167/month across major credit cards, debit cards, and loan partners.' },
      { q: 'What if I miss a live class?', a: 'All live classes are recorded in HD quality and uploaded to your LMS student portal within 4 hours. You enjoy lifetime access to review recordings at your convenience.' },
      { q: 'Will I get hands-on access to recruitment tools?', a: 'Yes. You will participate in live walkthroughs and practical assignments utilizing LinkedIn Recruiter workflows, Boolean search engines, Naukri simulation frameworks, and ATS tools.' },
      { q: 'Is the certificate recognized by employers?', a: 'Yes. Our certificate is widely acknowledged across corporate HR departments, IT staffing firms, and RPO firms in India and abroad with instant QR-code verification.' },
    ],
    modules: [
      {
        title: 'Module 1: Full-Lifecycle Recruitment Fundamentals & Job Analysis',
        description: 'Understand end-to-end recruitment lifecycle, HR models, intake meetings, and drafting candidate personas.',
        chapters: [
          {
            title: 'Recruitment Models & JD Analysis',
            topics: [
              'Talent Acquisition vs. Traditional Recruitment paradigms',
              'Anatomy of a Job Requisition: Intake meetings, stakeholder alignment & SLAs',
              'Translating business requirements into actionable JDs & competency matrices',
              'Recruiter KPIs, funnels, conversion rates, and pipeline management',
              'Differentiating Corporate HR, Staffing Agencies, RPOs & Executive Search',
            ],
          },
        ],
      },
      {
        title: 'Module 2: Candidate Sourcing, Boolean Search & Social Platforms',
        description: 'Boolean search strings, Google X-Ray, LinkedIn Recruiter, Job Portals, and passive sourcing.',
        chapters: [
          {
            title: 'Advanced Sourcing & Portal Search',
            topics: [
              'Boolean Search logic: AND, OR, NOT, quotation marks, parentheses & wildcards',
              'Google X-Ray Search: Finding unlisted resumes, portfolio links & contact directories',
              'Job Portal Mastery: Advanced filtering on Naukri (IT/Non-IT keywords, CTC, notice periods)',
              'Social & Tech Sourcing: LinkedIn outreach, GitHub commit analysis & Stack Overflow',
              'Email deliverability, personalized cold messaging & drip sequences',
            ],
          },
        ],
      },
      {
        title: 'Module 3: Resume Screening, Assessment & Competency Interviewing',
        description: '30-second resume evaluation, detecting red flags, and competency-based interviewing with STAR.',
        chapters: [
          {
            title: 'Screening & STAR Interviewing',
            topics: [
              'Resume screening frameworks: Keyword matching, career trajectory & pedigree',
              'Initial telephonic screening: Salary expectation, notice period & cultural fit',
              'Interviewing Methodologies: Behavioral, situational & technical screening',
              'The STAR Method (Situation, Task, Action, Result) in candidate assessment',
              'Eliminating unconscious bias and standardizing candidate evaluation scorecards',
            ],
          },
        ],
      },
      {
        title: 'Module 4: Domain-Specific Recruitment (IT, Healthcare & Finance)',
        description: 'Specialized hiring frameworks for IT/Software, Healthcare/Medical, and Banking/Finance (BFSI).',
        chapters: [
          {
            title: 'Domain Hiring Ecosystems',
            topics: [
              'IT Recruitment: Frontend, Backend, Full Stack, Cloud/DevOps, Data Engineering & Cyber',
              'Healthcare Recruitment: Doctors, Nursing staff, Clinical Research & Medical Council checks',
              'BFSI Recruitment: Chartered Accountants (CA), Investment Bankers, Risk Analysts & NISM/CFA',
              'Domain-specific skill matrices and technical screening questions',
            ],
          },
        ],
      },
      {
        title: 'Module 5: Advanced Recruitment Strategies & Employer Branding',
        description: 'Employer Value Proposition (EVP), recruitment marketing, salary negotiation, and counter-offer management.',
        chapters: [
          {
            title: 'Employer Branding & Offer Closures',
            topics: [
              'Employer Branding Fundamentals: Job posts, employee spotlights & career page messaging',
              'Talent Nurturing: Building Warm Talent Pools for high-demand roles',
              'Offer Formulation & Negotiation: Total Rewards breakdown (Fixed, Variable, ESOPs)',
              'Post-Offer Engagement: Pre-boarding touchpoints & first-90-day retention drivers',
            ],
          },
        ],
      },
      {
        title: 'Module 6: Legal Frameworks, Labour Compliance & Ethics',
        description: 'Indian labour laws, Background Verification (BGV), data privacy (DPDP), and recruitment ethics.',
        chapters: [
          {
            title: 'Statutory Compliance & Ethics',
            topics: [
              'Key Indian Labour Laws: Equal Remuneration Act, POSH awareness & Shops & Establishment Act',
              'Background Verification (BGV): Education, employment, criminal records & reference checks',
              'Candidate Data Privacy (DPDP Act compliance) and confidential data handling',
              'Ethical recruitment: Anti-poaching agreements, non-compete clauses & fee ethics',
            ],
          },
        ],
      },
      {
        title: 'Module 7: Capstone Project & Real-World Hiring Simulation',
        description: 'Full-cycle candidate sourcing simulation, portfolio presentation, and final recruiter assessment.',
        chapters: [
          {
            title: 'Full-Cycle Hiring Simulation',
            topics: [
              'Real-world project kickoff: Allocation of enterprise hiring mandates',
              'Sourcing, screening, scheduling, assessment & candidate dossier preparation',
              'Compiling a comprehensive Recruiter Portfolio and capstone presentation',
              'ATS operations, hiring metrics dashboard, and final graduation review',
            ],
          },
        ],
      },
    ],
  },

  {
    categorySlug: 'certification_tag',
    categoryName: 'HR Courses for Beginners',
    title: 'HR Courses for Beginners',
    duration: '6 Weeks',
    shortDescription: 'Kickstart your Human Resources career with our foundational 6-week intensive certificate program. Covers HR operations, entry-level recruitment, resume screening, calling etiquette, portal basics (Naukri & LinkedIn), interview scheduling, and basic documentation.',
    fees: 18000,
    discount: 2000,
    finalTotal: 16000,
    rating: 5.0,
    totalStudents: 3200,
    faqs: [
      { q: 'Do I need an MBA in HR to join this course?', a: 'No. A graduate degree in any discipline or final-year student status is sufficient. Prior HR knowledge is not required.' },
      { q: 'How many hours per week do I need to commit?', a: 'Approximately 6 to 8 hours per week, including live classes and hands-on practice.' },
      { q: 'What job roles can I apply for after completing this course?', a: 'Junior Recruiter, HR Trainee, Talent Acquisition Associate, HR Coordinator, and Sourcing Specialist.' },
      { q: 'Is the course conducted in English?', a: 'Yes, classes are delivered in clear, simple Business English to help you build workplace communication confidence.' },
      { q: 'Are recorded sessions provided if I miss a lecture?', a: 'Yes. All sessions are recorded and made available on the LMS portal within 4 hours.' },
      { q: 'What is the course fee and are there installment options?', a: 'The fee is ₹16,000 (all-inclusive), payable in 2 installments or via zero-cost monthly EMI options starting at ₹2,667/month.' },
    ],
    modules: [
      {
        title: 'Module 1: HR Foundations & the Modern Talent Landscape',
        description: 'Core pillars of Human Resource Management, recruiter responsibilities, and key terminology.',
        chapters: [
          {
            title: 'HR Basics & Hierarchy',
            topics: [
              'Introduction to Corporate HR vs. Staffing vs. HR Operations',
              'The employee lifecycle: Hire to Retire overview',
              'Key HR terms: CTC, Notice Period, In-hand Salary, Gross, SLAs, Requisition',
              'Day-in-the-life of a Junior Recruiter and HR Trainee',
            ],
          },
        ],
      },
      {
        title: 'Module 2: Job Descriptions & Sourcing Fundamentals',
        description: 'Deconstruct JDs, search keywords, and perform candidate searches on Naukri and LinkedIn.',
        chapters: [
          {
            title: 'JD Analysis & Portal Search',
            topics: [
              'Reading and analyzing Job Descriptions (JDs)',
              'Navigating job boards: Job Portal basics, filters, and keyword fields',
              'Basic LinkedIn searching: Utilizing search filters, titles, and location tags',
              'Building structured Google Sheet candidate trackers',
            ],
          },
        ],
      },
      {
        title: 'Module 3: Resume Screening & Calling Etiquette',
        description: 'Apply the 30-second resume evaluation checklist and conduct polite telephonic screening calls.',
        chapters: [
          {
            title: 'Screening & Phone Calling',
            topics: [
              'The 30-second resume scan: Identifying relevant experience, education, and tenure',
              'Telephonic screening scripts and professional phone etiquette',
              'How to verify CTC details, expected compensation, and notice period constraints',
              'Writing clear, professional candidate email invitations and WhatsApp messages',
            ],
          },
        ],
      },
      {
        title: 'Module 4: Interview Coordination & Documentation Basics',
        description: 'Coordinate interview rounds, manage calendars, and audit pre-onboarding document checklists.',
        chapters: [
          {
            title: 'Coordination & Onboarding',
            topics: [
              'Interview scheduling workflows: Coordinating panel calendars & sending meeting invites',
              'Managing candidate dropouts and rescheduling requests',
              'Standard onboarding document checklist: Identity proofs, certificates, payslips & relieving letters',
              'Basic offer letter components and pre-joining check-ins',
            ],
          },
        ],
      },
      {
        title: 'Module 5: Practical Capstone, Resume Rebuilding & Placement Prep',
        description: 'Complete full-cycle fresher hiring simulation, format ATS-friendly resume, and attend mock HR interviews.',
        chapters: [
          {
            title: 'First-Hire Capstone & Career Launch',
            topics: [
              'Full-cycle mini-project: Source, screen, and schedule candidates for an assigned role',
              'Recruiter resume crafting: Highlighting keywords, project work, and certifications',
              'Common HR interview questions and model answers for freshers',
              'Job application strategies on LinkedIn, Naukri, and entry-level job boards',
            ],
          },
        ],
      },
    ],
  },

  {
    categorySlug: 'entrepreneur_tag',
    categoryName: 'HR Entrepreneurship Program',
    title: 'HR Entrepreneurship Program',
    duration: '2 Months',
    shortDescription: 'Launch, operate, and scale your own profitable recruitment consultancy or staffing agency with our 2-month executive masterclass. Covers niche selection, GST/MSME registration, B2B client acquisition, SLA/NDA contracts, 48-hour shortlisting, and cash flow management.',
    fees: 25000,
    discount: 3000,
    finalTotal: 22000,
    rating: 5.0,
    totalStudents: 1800,
    faqs: [
      { q: 'Can I start a recruitment agency from home with minimal capital?', a: 'Yes. Recruitment is a service business that can be operated remotely with a laptop, phone, internet, and basic sourcing subscriptions.' },
      { q: 'Do I need prior recruitment experience to succeed?', a: 'While prior HR/recruitment or B2B sales experience is advantageous, the program provides comprehensive end-to-end guidance.' },
      { q: 'Are legal contract templates included in the course?', a: 'Yes. You receive fully editable, lawyer-vetted Client Service Agreements (SLAs), Non-Disclosure Agreements (NDAs), and Invoicing templates.' },
      { q: 'How long does it typically take to sign the first corporate client?', a: 'By following the outreach methodology in Module 2, most active students sign their first client contract within 30 to 45 days of launch.' },
      { q: 'What is the course fee and installment schedule?', a: 'The fee is ₹22,000 (all-inclusive), payable in 2 installments or via zero-cost monthly EMI options starting at ₹3,667/month.' },
    ],
    modules: [
      {
        title: 'Module 1: Niche Selection, Positioning & Legal Setup',
        description: 'Agency business models, high-margin staffing niches, entity incorporation (LLP/Pvt Ltd), and GST/MSME compliance.',
        chapters: [
          {
            title: 'Niche Strategy & Legal Registration',
            topics: [
              'Market analysis: Identifying high-growth staffing niches (IT, GCCs, BFSI, Healthcare)',
              'Legal company incorporation: Proprietorship vs. LLP vs. Pvt Ltd in India',
              'Tax compliance: GST registration, TDS on recruitment fees (Section 194J) & MSME benefits',
              'Corporate identity: Crafting agency value proposition, service brochure & website',
            ],
          },
        ],
      },
      {
        title: 'Module 2: B2B Client Acquisition & Commercial Contracts',
        description: 'Target CXOs and HR Heads, execute cold outreach campaigns, and negotiate commercial SLAs and NDAs.',
        chapters: [
          {
            title: 'B2B Sales & Commercial SLAs',
            topics: [
              'Prospecting target clients: Building a database of high-growth companies',
              'Proven 3-touch outbound cold outreach scripts: Email, LinkedIn InMail & calling frameworks',
              'Commercial terms: 8.33% vs. 10–12.5% vs. 15% tiers; 30/60-day credit terms',
              'Contract clauses: 90-day replacement guarantee, non-solicitation & exclusivity',
            ],
          },
        ],
      },
      {
        title: 'Module 3: Delivery Excellence & 48-Hour Shortlisting',
        description: 'Implement lean ATS infrastructure, build candidate benches, and deliver candidate dossiers within 48 hours.',
        chapters: [
          {
            title: 'ATS Infrastructure & Bench Sourcing',
            topics: [
              'Setting up lean recruitment tech stack: Low-cost ATS & email automation tools',
              'Talent bench strategy: Pre-sourcing candidates before client mandates are released',
              'Submitting compelling candidate dossiers that maximize shortlist rates',
              'Candidate control: Pre-closing salary expectations & managing notice period buyouts',
            ],
          },
        ],
      },
      {
        title: 'Module 4: Billing, Cash Flow Management & Scaling',
        description: 'Manage client invoicing cycles, GST billing, debt collection, freelancer commission models, and agency scaling.',
        chapters: [
          {
            title: 'Invoicing, Cash Flow & Agency Growth',
            topics: [
              'Invoicing best practices: Tax invoice formats, milestone tracking & GST TDS credits',
              'Managing receivables: Payment reminder sequences, escalations & legal notice triggers',
              'Hiring your first team member: Freelancer models & variable incentive plans',
              'Scaling strategies: Moving to retained search, RPO contracts & international staffing',
            ],
          },
        ],
      },
    ],
  },

  {
    categorySlug: 'corporate_traning_tag',
    categoryName: 'HR Corporate Training Course',
    title: 'HR Corporate Training Course',
    duration: 'Flexible (2–6 Wks)',
    shortDescription: 'Empower your in-house talent acquisition and Human Resources teams with our customized corporate training. Upskills internal recruiters and hiring managers in advanced talent mapping, passive sourcing, structured STAR interviewing, and recruitment analytics.',
    fees: 20000,
    discount: 2500,
    finalTotal: 17500,
    rating: 5.0,
    totalStudents: 2500,
    faqs: [
      { q: 'Can the corporate curriculum be customized for our specific industry?', a: 'Yes. All case studies, sourcing drills, and scorecards are tailored specifically to your industry sector (e.g., IT, Manufacturing, BFSI, Healthcare).' },
      { q: 'Is training conducted on-site or virtually?', a: 'We offer flexible delivery options: interactive on-premise workshops at your corporate facility or live virtual masterclasses.' },
      { q: 'What is the recommended team size per cohort?', a: 'We accommodate cohorts ranging from small specialized teams (5–10 recruiters) up to enterprise-wide batches (50–100+ members).' },
      { q: 'Can we include technical hiring managers in the interview training modules?', a: 'Yes. Module 3 is specifically designed as a joint workshop for recruiters and technical hiring managers.' },
      { q: 'How do you measure the ROI and impact of the corporate training?', a: 'We establish baseline metrics before the program and conduct 30-day and 60-day post-training audits to measure quantitative improvements.' },
    ],
    modules: [
      {
        title: 'Module 1: Talent Acquisition Process Audit & Strategic Alignment',
        description: 'Audit internal hiring bottlenecks, standardize the job intake process, and align on hiring SLAs.',
        chapters: [
          {
            title: 'Recruitment Audit & SLA Alignment',
            topics: [
              'Analyzing internal recruitment funnel metrics: Sourcing-to-Interview, Interview-to-Offer',
              'The Strategic Intake Meeting: Aligning on core competencies, culture fit & timelines',
              'Employer Value Proposition (EVP) audit: Identifying why candidates accept or reject offers',
              'Standardizing Service Level Agreements (SLAs) across business units',
            ],
          },
        ],
      },
      {
        title: 'Module 2: Advanced Sourcing & Direct Talent Pipeline Architecture',
        description: 'Reduce agency dependency by mastering advanced Boolean search, LinkedIn Recruiter, and passive candidate engagement.',
        chapters: [
          {
            title: 'Advanced Direct Sourcing',
            topics: [
              'Complex Boolean string construction for niche corporate roles',
              'Advanced LinkedIn Recruiter seat optimization: Pipeline projects, custom tags & InMail analytics',
              'Niche talent search: GitHub, Stack Overflow, Behance & conference attendee lists',
              'Crafting high-converting corporate outreach messages that achieve >40% response rates',
            ],
          },
        ],
      },
      {
        title: 'Module 3: Structured Interviewing & Objective Selection for Managers',
        description: 'Eliminate unconscious bias, develop role-specific scorecards, and train hiring managers on STAR interviewing.',
        chapters: [
          {
            title: 'Bias-Free Interviewing & Scorecards',
            topics: [
              'Types of cognitive bias in interviews (Halo effect, Confirmation bias) & mitigation',
              'Developing behavioral and situational interview question banks mapped to values',
              'Constructing objective 5-point evaluation scorecards for interview panels',
              'Training interviewers on candidate-friendly communication & employer brand representation',
            ],
          },
        ],
      },
      {
        title: 'Module 4: Recruitment Analytics, Executive Reporting & Retention',
        description: 'Build executive hiring dashboards, track Cost-per-Hire and Quality-of-Hire, and eliminate offer ghosting.',
        chapters: [
          {
            title: 'Recruitment Analytics & Executive Dashboards',
            topics: [
              'Core corporate TA metrics: Time-to-Fill, Offer Acceptance Rate & Sourcing ROI',
              'Designing executive-ready TA dashboards using PowerBI, Tableau, or Looker Studio',
              'Post-offer engagement: Pre-boarding communication cadences & welcome calls',
              'Measuring Quality-of-Hire and first-year employee retention correlations',
            ],
          },
        ],
      },
    ],
  },
]

async function syncMasterCourses() {
  console.log('🚀 Starting Universal Master Course Catalog Synchronization...\n')

  for (const cData of MASTER_COURSES_DATA) {
    console.log(`\n📦 Processing: ${cData.title} (${cData.categorySlug})...`)

    // 1. Ensure Category exists
    let category = await prisma.courseCategory.findFirst({
      where: { slug: cData.categorySlug },
    })

    if (!category) {
      category = await prisma.courseCategory.create({
        data: {
          name: cData.categoryName,
          slug: cData.categorySlug,
        },
      })
      console.log(`  ✅ Created Category: ${category.name} (ID: ${category.id})`)
    } else {
      category = await prisma.courseCategory.update({
        where: { id: category.id },
        data: { name: cData.categoryName },
      })
      console.log(`  ✅ Updated Category: ${category.name} (ID: ${category.id})`)
    }

    // 2. Upsert Course record
    let course = await prisma.course.findFirst({
      where: { categoryId: category.id },
    })

    if (!course) {
      course = await prisma.course.create({
        data: {
          title: cData.title,
          description: cData.shortDescription,
          duration: cData.duration,
          categoryId: category.id,
          totalStudents: cData.totalStudents,
          rating: cData.rating,
        },
      })
      console.log(`  ✅ Created Course: "${course.title}" (ID: ${course.id})`)
    } else {
      course = await prisma.course.update({
        where: { id: course.id },
        data: {
          title: cData.title,
          description: cData.shortDescription,
          duration: cData.duration,
          totalStudents: cData.totalStudents,
          rating: cData.rating,
        },
      })
      console.log(`  ✅ Updated Course: "${course.title}" (ID: ${course.id})`)
    }

    // 3. Upsert CourseFee record
    const existingFee = await prisma.courseFee.findFirst({
      where: { categoryId: category.id },
    })

    if (!existingFee) {
      await prisma.courseFee.create({
        data: {
          courseName: cData.title,
          categoryId: category.id,
          fees: cData.fees,
          discount: cData.discount,
          total: cData.fees,
          feeTotal: cData.fees,
          subtotal: cData.fees,
          finalTotal: cData.finalTotal,
        },
      })
      console.log(`  ✅ Created Fees: ₹${cData.finalTotal} (Base: ₹${cData.fees})`)
    } else {
      await prisma.courseFee.update({
        where: { id: existingFee.id },
        data: {
          courseName: cData.title,
          fees: cData.fees,
          discount: cData.discount,
          total: cData.fees,
          feeTotal: cData.fees,
          subtotal: cData.fees,
          finalTotal: cData.finalTotal,
        },
      })
      console.log(`  ✅ Updated Fees: ₹${cData.finalTotal} (Base: ₹${cData.fees})`)
    }

    // 4. Synchronize FAQs
    await prisma.faq.deleteMany({
      where: { categoryId: category.id },
    })

    for (const faq of cData.faqs) {
      await prisma.faq.create({
        data: {
          question: faq.q,
          answer: faq.a,
          categoryId: category.id,
        },
      })
    }
    console.log(`  ✅ Synced ${cData.faqs.length} FAQs`)

    // 5. Synchronize LMS Modules, Chapters & Topics
    await prisma.module.deleteMany({
      where: { courseId: course.id },
    })

    for (let mIdx = 0; mIdx < cData.modules.length; mIdx++) {
      const mItem = cData.modules[mIdx]
      const createdModule = await prisma.module.create({
        data: {
          courseId: course.id,
          title: mItem.title,
          description: mItem.description || null,
          sortOrder: mIdx + 1,
        },
      })

      for (let cIdx = 0; cIdx < mItem.chapters.length; cIdx++) {
        const chap = mItem.chapters[cIdx]
        const createdChapter = await prisma.chapter.create({
          data: {
            moduleId: createdModule.id,
            title: chap.title,
            sortOrder: cIdx + 1,
          },
        })

        for (let tIdx = 0; tIdx < chap.topics.length; tIdx++) {
          const topic = chap.topics[tIdx]
          await prisma.topic.create({
            data: {
              chapterId: createdChapter.id,
              title: topic,
              sortOrder: tIdx + 1,
            },
          })
        }
      }
    }
    console.log(`  ✅ Synced ${cData.modules.length} LMS Modules & Chapters`)
  }

  console.log('\n✨ Universal Master Course Catalog successfully synchronized across all courses!')
}

syncMasterCourses()
  .catch((e) => {
    console.error('❌ Error during synchronization:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

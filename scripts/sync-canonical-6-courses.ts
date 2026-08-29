import dotenv from 'dotenv'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

dotenv.config()

const targetDbUrl = process.env.PROD_DATABASE_URL || process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/recruitmentinstitute'
console.log(`🚀 Connecting to: ${targetDbUrl.includes('35.200.228.49') ? 'Cloud SQL Production' : 'Local Database'}`)

const pool = new Pool({ connectionString: targetDbUrl })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

export interface CanonicalCourseDef {
  categorySlug: string
  categoryName: string
  title: string
  duration: string
  basePrice: number
  discount: number
  finalPrice: number
  couponCode: string
  targetAudience: string
  tagline: string
  highlights: string
  upsell: string
  cta: string
  overview: string
  modules: {
    title: string
    duration: string
    description: string
    topics: string[]
  }[]
  faqs: { q: string; a: string }[]
}

export const CANONICAL_6_COURSES: CanonicalCourseDef[] = [
  {
    categorySlug: 'for-freshers',
    categoryName: 'Courses / For Freshers',
    title: 'Recruitment Career Starter',
    duration: '4 Weeks',
    basePrice: 7999,
    discount: 3000,
    finalPrice: 4999,
    couponCode: 'FRESHER30',
    targetAudience: 'Students, freshers, career switchers, and beginners wanting to break into HR & recruitment.',
    tagline: 'Become Job-Ready for Your First Recruitment Job in 4 Weeks.',
    highlights: 'Live online classes; LMS; practical assignments; recruitment templates; certificate; resume support; mock interview; job/placement assistance',
    upsell: 'Professional Recruitment Specialist',
    cta: 'Join Next Batch',
    overview: 'The Recruitment Career Starter program is specifically engineered for fresh graduates and early career switchers seeking a fast, practical pathway into corporate HR and talent acquisition. Over 4 intensive weeks, you will learn the core foundations of recruitment lifecycles, resume parsing, candidate calling, interview coordination, and portal sourcing.',
    modules: [
      {
        title: 'Recruitment Fundamentals & Job Analysis',
        duration: 'Week 1',
        description: 'Recruitment lifecycle, HR models, job description breakdown, and requirement intake understanding.',
        topics: [
          'Overview of recruitment lifecycle and corporate HR hierarchy',
          'Understanding Job Descriptions (JDs) and key qualification mapping',
          'In-house TA vs staffing agency recruitment models',
          'Recruiter key metrics: TAT, pipeline volume, and candidate communication',
        ],
      },
      {
        title: 'Candidate Sourcing, Portals & Boolean Search',
        duration: 'Week 2',
        description: 'Hands-on candidate discovery across Naukri, LinkedIn, and Boolean/X-Ray search engines.',
        topics: [
          'Boolean search operators (AND, OR, NOT, Quotations, Parentheses)',
          'Job Portal search filters, active candidate targeting, and keywords',
          'LinkedIn talent search: Title filters, locations, and Boolean strings',
          'Building custom candidate pipelines and talent databases',
        ],
      },
      {
        title: 'Screening, Calling & Interview Coordination',
        duration: 'Week 3',
        description: 'First-round candidate screening calls, pitch scripts, salary benchmarking, and schedule management.',
        topics: [
          'Structured screening calls: Assessing notice period, CTC, and location fit',
          'Objection handling: Notice period buyouts and counter-offers',
          'Interview scheduling, panel management, and candidate prep',
          'Writing recruiter assessment summaries for hiring managers',
        ],
      },
      {
        title: 'Live Sourcing Project, Resume Building & Mock Interviews',
        duration: 'Week 4',
        description: 'End-to-end recruitment capstone assignment, ATS tracking, portfolio creation, and interview mastery.',
        topics: [
          'Executing a live candidate search mandate from JD to shortlist',
          'Building an ATS-friendly HR recruiter resume with verified credentials',
          'Mock technical & HR interview simulations with industry mentors',
          'Job application strategy and placement assistance support',
        ],
      },
    ],
    faqs: [
      { q: 'Is this course suitable for someone with zero HR experience?', a: 'Yes! The Recruitment Career Starter is designed from the ground up for absolute beginners, freshers, and non-HR graduates.' },
      { q: 'What is the course duration and schedule?', a: 'The program spans 4 weeks with weekend live interactive sessions and weekday practical hands-on labs.' },
      { q: 'Do you offer placement assistance?', a: 'Yes, graduates receive 1-on-1 resume building, LinkedIn profile makeover, mock interviews, and direct referral opportunities with hiring partners.' },
      { q: 'Will I get an accredited certificate?', a: 'Yes, upon completing the weekly assignments and final capstone mandate, you will receive a verifiable certificate of completion.' },
    ],
  },
  {
    categorySlug: 'for-professionals',
    categoryName: 'Courses / For Professionals',
    title: 'Professional Recruitment Specialist',
    duration: '8 Weeks',
    basePrice: 24999,
    discount: 10000,
    finalPrice: 14999,
    couponCode: 'PROREC10',
    targetAudience: 'Recruiters, HR executives, 0–3 years experience, recruitment consultants, talent partners.',
    tagline: 'Master End-to-End Recruitment With Practical Industry Training.',
    highlights: 'Live training; sourcing; Boolean/X-Ray; screening; calling; IT & non-IT; interview coordination; offer/joining; MIS; AI; live projects; certificate',
    upsell: 'Advanced Recruitment & TA Masterclass or Recruitment Business Accelerator',
    cta: 'Join Next Batch',
    overview: 'Designed for working recruiters and HR executives who want to master full-lifecycle recruitment across diverse domains (IT, Non-IT, BFSI, Healthcare, and Manufacturing). Master advanced sourcing techniques, candidate engagement, offer rollout, counter-offer mitigation, recruitment analytics, and modern AI sourcing tools.',
    modules: [
      {
        title: 'Full-Lifecycle Recruitment Mastery & Intake Frameworks',
        duration: 'Week 1–2',
        description: 'Advanced stakeholder intake meetings, competency frameworks, talent mapping, and market intelligence.',
        topics: [
          'Conducting structured intake sessions with hiring managers & clients',
          'Competency-based job profiling and skill architecture mapping',
          'Recruitment funnel design: Top-of-funnel volume vs conversion velocity',
          'Full statutory compliance & legal fundamentals in hiring',
        ],
      },
      {
        title: 'Multi-Domain Sourcing & Advanced Boolean/X-Ray Search',
        duration: 'Week 3–4',
        description: 'Deep-web sourcing, GitHub/StackOverflow tech recruiting, niche headhunting, and X-Ray search.',
        topics: [
          'Advanced Boolean logic: Nested expressions, site search, and filetype targeting',
          'IT Recruitment: Tech stack identification (Frontend, Backend, DevOps, Cloud, AI)',
          'Non-IT & BFSI Hiring: Sales, operations, finance, and engineering profiles',
          'Direct passive talent outreach via personalized InMails and cold emails',
        ],
      },
      {
        title: 'Structured Interviewing, Offer Management & Pre-Boarding',
        duration: 'Week 5–6',
        description: 'Behavioral interviewing (STAR method), salary negotiation, offer generation, and dropout mitigation.',
        topics: [
          'Conducting competency & behavioral interviews with structured rubrics',
          'CTC breakdown: Fixed, variable, ESOPs, perks, and market benchmarking',
          'Counter-offer management and pre-joining candidate engagement protocols',
          'Mitigating early attrition and building candidate loyalty',
        ],
      },
      {
        title: 'Recruitment Analytics, AI Sourcing Tools & Live Mandates',
        duration: 'Week 7–8',
        description: 'ATS management, AI-assisted recruiter workflows, weekly MIS dashboards, and final capstone.',
        topics: [
          'AI tools for recruiters: ChatGPT prompts, JD drafting, and automated outreach',
          'Recruitment KPIs: Time-to-Fill, Cost-per-Hire, Quality-of-Hire, Offer-to-Join Ratio',
          'Building real-time executive recruitment MIS dashboards in Excel & Google Sheets',
          'Live recruitment project: Delivering closed profiles for verified mandates',
        ],
      },
    ],
    faqs: [
      { q: 'Who is the Professional Recruitment Specialist course for?', a: 'It is tailored for recruiters with 0–3 years of experience, HR executives, and talent advisors looking to master IT, BFSI, and niche recruitment.' },
      { q: 'How long is the program?', a: 'The program runs for 8 weeks (2 months) with weekend live classes, practical weekday case studies, and lifetime LMS access.' },
      { q: 'Do you cover AI tools for recruiters?', a: 'Yes! You will learn how to leverage generative AI, ChatGPT, automated Boolean builders, and modern ATS platforms to 3x your sourcing speed.' },
      { q: 'What is the certification issued?', a: 'You receive an ISO-accredited Professional Recruitment Specialist certificate with a unique QR code for LinkedIn and resume verification.' },
    ],
  },
  {
    categorySlug: 'senior-professionals',
    categoryName: 'Courses / Senior Professionals',
    title: 'Advanced Recruitment & TA Masterclass',
    duration: '6 Weeks',
    basePrice: 29999,
    discount: 10000,
    finalPrice: 19999,
    couponCode: 'TAMASTER10',
    targetAudience: 'Senior recruiters, TA managers, HR managers, recruitment consultants with 3–10+ years experience.',
    tagline: 'Upgrade From Recruiter to Strategic Talent Acquisition Professional.',
    highlights: 'Strategic TA; hiring-manager management; recruitment metrics; dashboards; bulk/niche hiring; executive hiring; AI; ATS; team productivity; client management',
    upsell: 'Recruitment Business Accelerator / Consulting',
    cta: 'Apply / Enquire',
    overview: 'A high-impact executive program for senior talent acquisition specialists and team leads. Elevate your positioning from transactional recruiter to strategic business advisor. Master workforce forecasting, capacity planning, employer branding, executive search, vendor management, and TA cost optimization.',
    modules: [
      {
        title: 'Strategic Talent Acquisition & Workforce Forecasting',
        duration: 'Week 1–2',
        description: 'Aligning talent acquisition strategy with business goals, capacity models, and hiring manager alignment.',
        topics: [
          'Transitioning from tactical recruiter to strategic talent partner',
          'Workforce planning, headcount forecasting, and capacity modeling',
          'Managing executive hiring managers and setting SLAs',
          'Recruitment budget allocation and vendor/consultant management',
        ],
      },
      {
        title: 'Advanced Metrics, Dashboards & Executive Search',
        duration: 'Week 3–4',
        description: 'Designing board-level TA dashboards, calculating Cost/Time/Quality of Hire, and C-suite headhunting.',
        topics: [
          'Core TA analytics: Funnel conversion, offer acceptance ratios, and sourcing channel ROI',
          'Building automated PowerBI / Google Looker Studio executive TA dashboards',
          'Executive search & headhunting: Confidential mandates, mapping, and board hiring',
          'Managing bulk campus hiring drives vs niche leadership recruitment',
        ],
      },
      {
        title: 'Employer Branding, Recruiter Productivity & AI Automation',
        duration: 'Week 5–6',
        description: 'Employer value proposition (EVP), team performance management, advanced ATS integrations, and AI.',
        topics: [
          'Building an attractive Employer Value Proposition (EVP) and talent community',
          'Managing recruiter team productivity, incentive models, and KPIs',
          'Enterprise ATS stack evaluation: Workday, Greenhouse, Lever, and Zoho Recruit',
          'Automating end-to-end recruitment pipelines with AI and workflow triggers',
        ],
      },
    ],
    faqs: [
      { q: 'Is this program suitable for TA Leads and Managers?', a: 'Yes! It is specifically created for professionals with 3+ years of experience who want to lead talent acquisition teams and drive strategy.' },
      { q: 'What is the duration?', a: '6 intensive weeks with executive weekend masterclasses and strategic leadership workshops.' },
      { q: 'Are there live case studies?', a: 'Yes, you will work on real-world leadership hiring mandates, budget forecasting models, and executive dashboard implementations.' },
    ],
  },
  {
    categorySlug: 'entrepreneurship',
    categoryName: 'Entrepreneurship',
    title: 'Recruitment Business Accelerator',
    duration: '8 Weeks',
    basePrice: 49999,
    discount: 20000,
    finalPrice: 29999,
    couponCode: 'AGENCY20',
    targetAudience: 'Recruiters, HR professionals, consultants, and aspiring agency owners.',
    tagline: "Don't Just Become a Recruiter. Build Your Recruitment Business.",
    highlights: 'Business model; niche; setup; contracts; recruitment SOP; ATS; client acquisition; sales; pricing; delivery; collections; team building; AI; scaling; funding readiness',
    upsell: 'Business Growth Consulting',
    cta: 'Book Free Business Call',
    overview: 'The definitive blueprint for launching, monetizing, and scaling your own profitable recruitment agency or HR consultancy firm. Learn how to choose a high-margin niche, set up legal contracts and MSME/GST registration, acquire enterprise clients, manage contingency vs retainer commercials, build recruiter teams, and ensure rapid cash collections.',
    modules: [
      {
        title: 'Business Model, Niche Selection & Agency Positioning',
        duration: 'Week 1',
        description: 'Recruitment vs staffing vs RPO, finding high-margin niches, and defining your value proposition.',
        topics: [
          'Agency business models: Contingency, Retained, Contract Staffing, and RPO',
          'Selecting your profitable niche: Tech, BFSI, Healthcare, Manufacturing, or Global Remote',
          'Target client profiling and defining competitive fee structures (8.33% to 20%)',
          'Designing brand assets, pitch decks, and commercial rate cards',
        ],
      },
      {
        title: 'Legal Setup, Commercial Contracts & Terms of Business',
        duration: 'Week 2',
        description: 'GST, MSME, NDA, SLA agreements, non-compete clauses, and risk mitigation frameworks.',
        topics: [
          'Company incorporation: Sole Proprietorship, LLP, or Pvt Ltd setup',
          'Drafting client service agreements (SLA), replacement guarantees, and payment terms',
          'Vendor onboarding paperwork and legal risk protection',
          'Setting up commercial banking, invoicing, and tax accounting systems',
        ],
      },
      {
        title: 'Agency Infrastructure, ATS & Sourcing Operations',
        duration: 'Week 3',
        description: 'Building lean tech stacks, multi-portal access, database management, and standard SOPs.',
        topics: [
          'Deploying agency-grade ATS: Zoho Recruit, Ceipal, or Recruit CRM',
          'Cost-effective portal subscription strategies (Naukri, LinkedIn, Foundit)',
          'Creating bulletproof recruitment Standard Operating Procedures (SOPs)',
          'Data security, candidate ownership protocols, and candidate pool capitalization',
        ],
      },
      {
        title: 'B2B Client Acquisition & Outbound Sales Engine',
        duration: 'Week 4',
        description: 'LinkedIn prospecting, cold email sequences, HR head calling scripts, and pitch meetings.',
        topics: [
          'Building high-converting B2B client acquisition pipelines on LinkedIn',
          'Cold email sequences and outreach templates that get replies from CHROs and Founders',
          'B2B sales call scripts: Pitching hiring solutions and overcoming objections',
          'Converting inbound leads and securing initial client discovery calls',
        ],
      },
      {
        title: 'Closing Clients & Commercial Contract Negotiation',
        duration: 'Week 5',
        description: 'Negotiating placement percentages, credit periods, retainer models, and exclusivity.',
        topics: [
          'Negotiating commercial terms: 8.33%, 12.5%, 15%+ and payment timelines (30 vs 60 days)',
          'Winning exclusive and retained search mandates',
          'Handling tough client negotiations on warranty periods and rebate clauses',
          'Signing and executing formal Master Services Agreements (MSAs)',
        ],
      },
      {
        title: 'Fulfillment Engine, Delivery & Cash Collections',
        duration: 'Week 6',
        description: 'Shortlisting frameworks, client submission decks, feedback turnaround, and invoice collection.',
        topics: [
          'High-velocity candidate delivery: Submitting top 3 CVs in 48 hours',
          'Managing candidate engagement from offer to joining to avoid dropouts',
          'Invoice dispatch, follow-up workflows, and rapid receivables collection',
          'Handling candidate replacements and disputed invoices professionally',
        ],
      },
      {
        title: 'Hiring Recruiters, Team Structure & AI Automation',
        duration: 'Week 7',
        description: 'Hiring freelance vs full-time recruiters, incentive structures, and AI agency tools.',
        topics: [
          'Hiring your first 3 freelance or full-time recruiters',
          'Designing recruiter commission and incentive structures that drive revenue',
          'Deploying AI sourcing copilots to 5x individual recruiter output',
          'Daily standups, weekly revenue reviews, and team KPI scorecards',
        ],
      },
      {
        title: 'Financial Management, Working Capital & Scaling to ₹1 Cr+',
        duration: 'Week 8',
        description: 'Cash flow forecasting, working capital, invoice discounting, and 12-month agency roadmap.',
        topics: [
          'Cash flow management: Managing receivables, GST liability, and operating expenses',
          'Invoice discounting and debt financing for staffing cash flows',
          'Building recurring revenue through contract staffing and RPO retainers',
          '12-month agency scaling roadmap: From solo recruiter to multi-member agency',
        ],
      },
    ],
    faqs: [
      { q: 'Can I start a recruitment agency alongside a full-time job?', a: 'Yes, many of our successful agency founders started as solo part-time consultants before transitioning full-time once they closed their first 2–3 clients.' },
      { q: 'Do you provide ready-to-use agency templates?', a: 'Yes! You receive complete Master Services Agreements (MSAs), fee agreements, NDA templates, recruiter calling scripts, and pitch decks.' },
      { q: 'What is the duration?', a: '8 weeks of hands-on business building, client acquisition training, and 1-on-1 mentorship.' },
      { q: 'Will I learn how to acquire real corporate clients?', a: 'Yes! Over 50% of the program focuses on practical B2B client acquisition, LinkedIn outreach, cold pitching, and closing hiring mandates.' },
    ],
  },
  {
    categorySlug: 'business-consulting',
    categoryName: 'Business Consulting',
    title: 'Recruitment Business Growth Consulting',
    duration: '3 Months',
    basePrice: 99999,
    discount: 40000,
    finalPrice: 59999,
    couponCode: 'GROWTH40',
    targetAudience: 'Existing recruitment agency owners, HR consulting founders, and staffing entrepreneurs.',
    tagline: 'Build, Acquire Clients, Deliver, Collect and Scale.',
    highlights: '1-to-1 consulting; niche; client acquisition; sales pipeline; SOPs; team; KPIs; automation; cash flow; scaling plan',
    upsell: 'Long-term consulting / partnership',
    cta: 'Book Consultation',
    overview: 'An exclusive 1-on-1 bespoke advisory and growth consulting engagement for established recruitment agency founders. We audit your existing sales pipeline, restructure fulfillment operations, optimize commercials, automate ATS workflows, and build an aggressive 12-month scaling roadmap to scale past ₹1 Crore ARR.',
    modules: [
      {
        title: 'Agency Diagnostics & Commercial Restructuring',
        duration: 'Month 1',
        description: 'Comprehensive audit of margins, client concentration, team output, and contract terms.',
        topics: [
          'Auditing existing client portfolio: Identifying low-margin vs high-yield accounts',
          'Renegotiating legacy terms and introducing retainer/exclusive search models',
          'Restructuring recruiter KPI scorecards and incentive plans',
        ],
      },
      {
        title: 'Outbound Client Acquisition Engine & High-Ticket Mandates',
        duration: 'Month 2',
        description: 'Implementing high-ticket enterprise client acquisition funnels and executive networking.',
        topics: [
          'Deploying multichannel automated B2B client acquisition campaigns',
          'Positioning for leadership and C-suite retained search mandates',
          'Building strategic corporate vendor empanelment channels',
        ],
      },
      {
        title: 'Operational Automation, Cash Flow & Multi-Branch Scaling',
        duration: 'Month 3',
        description: 'Systematizing fulfillment, automated billing, working capital finance, and expansion.',
        topics: [
          'Automating recruitment operations and ATS reporting workflows',
          'Working capital optimization and reducing debtor days (DSO) under 30 days',
          'Executive hiring for agency team leads and branch expansion plan',
        ],
      },
    ],
    faqs: [
      { q: 'Who is this consulting program for?', a: 'It is tailored for agency founders who already have registered recruitment companies and want 1-on-1 advisory to scale revenue and build systems.' },
      { q: 'Is it group training or 1-on-1 advisory?', a: 'It is a 1-to-1 personalized consulting engagement directly with senior industry advisors.' },
      { q: 'What is the engagement timeline?', a: '3 months of structured weekly advisory sessions, pipeline audits, and execution support.' },
    ],
  },
  {
    categorySlug: 'corporate',
    categoryName: 'Corporate',
    title: 'Corporate Recruitment Training',
    duration: 'Flexible (2–6 Weeks)',
    basePrice: 25000,
    discount: 0,
    finalPrice: 25000,
    couponCode: 'CORP2026',
    targetAudience: 'Corporate HR departments, talent acquisition teams, hiring managers, and enterprises.',
    tagline: 'Practical Recruitment Training Designed Around Your Hiring Requirements.',
    highlights: 'Customized curriculum; live online training; assessments; manager workshops; recruitment metrics',
    upsell: 'Custom consulting / annual training',
    cta: 'Request Corporate Proposal',
    overview: 'Customized corporate talent acquisition capability programs built specifically for enterprise HR teams and hiring managers. Upskill your in-house recruiters in modern passive sourcing, tech hiring, structured STAR interviewing, diversity hiring, employer branding, and AI productivity tools.',
    modules: [
      {
        title: 'Custom In-House Sourcing & Boolean Mastery',
        duration: 'Module 1',
        description: 'Tailored sourcing frameworks for your industry (Tech, Non-IT, BFSI, Manufacturing).',
        topics: [
          'Multi-channel passive candidate sourcing for enterprise hiring needs',
          'Advanced Boolean logic tailored to company-specific target profiles',
          'Optimizing recruiter outreach and reducing agency dependency',
        ],
      },
      {
        title: 'Structured Interviewing & Hiring Manager Alignment',
        duration: 'Module 2',
        description: 'Equipping hiring managers and TA teams with standardized evaluation rubrics.',
        topics: [
          'Competency-based behavioral interviewing techniques (STAR methodology)',
          'Eliminating unconscious bias in evaluation and candidate selection',
          'Streamlining hiring manager feedback loops to accelerate time-to-hire',
        ],
      },
      {
        title: 'Employer Branding, Candidate Experience & AI Tools',
        duration: 'Module 3',
        description: 'Enhancing the candidate journey, offer acceptance rates, and AI efficiency.',
        topics: [
          'Building a standout candidate experience from application to onboarding',
          'Deploying AI tools for JD writing, outreach personalization, and interview notes',
          'Measuring and optimizing internal recruitment KPIs (TAT, Cost per Hire, Quality of Hire)',
        ],
      },
    ],
    faqs: [
      { q: 'Can the training be customized to our industry?', a: 'Yes! We customize every corporate engagement around your industry, hiring tech stack, and specific hiring challenges.' },
      { q: 'What delivery formats are supported?', a: 'We offer interactive live online workshops, hybrid bootcamps, and on-site executive classroom sessions across India.' },
      { q: 'How do we get a corporate proposal?', a: 'Click Request Corporate Proposal or contact us directly at support@recruitmentinstitute.in / +91 7385204165.' },
    ],
  },
]

async function main() {
  console.log('🔄 Cleaning & Resetting database to strictly the 6 Canonical Courses...')

  // Fix PostgreSQL sequence counters
  const seqs = [
    { table: 'course_category', col: 'course_category_id' },
    { table: 'courses', col: 'id' },
    { table: 'fees', col: 'id' },
    { table: 'faq', col: 'f_id' },
    { table: 'modules', col: 'id' },
    { table: 'chapters', col: 'id' },
    { table: 'topics', col: 'id' },
  ]
  for (const s of seqs) {
    try {
      await pool.query(`SELECT setval(pg_get_serial_sequence('${s.table}', '${s.col}'), COALESCE((SELECT MAX(${s.col}) FROM ${s.table}), 1))`)
    } catch {
      // ignore if seq not standard
    }
  }

  // Step 1: Clean up old fee schedules so only the 6 canonical courses exist
  await prisma.courseFee.deleteMany({})
  console.log('🧹 Cleared legacy CourseFee records.')

  // Step 2: Synchronize Categories, Courses, Fees, FAQs, and LMS Modules for each of the 6 canonical courses
  for (let i = 0; i < CANONICAL_6_COURSES.length; i++) {
    const c = CANONICAL_6_COURSES[i]
    console.log(`\n📦 [${i + 1}/6] Processing: ${c.title} (${c.categorySlug})...`)

    // Upsert Category
    const category = await prisma.courseCategory.upsert({
      where: { slug: c.categorySlug },
      update: { name: c.categoryName },
      create: { name: c.categoryName, slug: c.categorySlug },
    })

    // Upsert CourseFee (Exact price, discount, final total)
    const feeRecord = await prisma.courseFee.create({
      data: {
        courseName: c.title,
        categoryId: category.id,
        fees: String(c.basePrice),
        discount: String(c.discount),
        subtotal: String(c.finalPrice),
        feeTotal: String(c.finalPrice),
        finalTotal: String(c.finalPrice),
        couponCode: c.couponCode,
      },
    })
    console.log(`  ✅ Fee Record: Base ₹${c.basePrice} - Discount ₹${c.discount} = Final ₹${c.finalPrice}`)

    // Find or create Course
    const existingCourse = await prisma.course.findFirst({
      where: { categoryId: category.id },
    })

    let courseId: number
    if (existingCourse) {
      const updated = await prisma.course.update({
        where: { id: existingCourse.id },
        data: {
          title: c.title,
          description: c.overview,
          duration: c.duration,
          rating: 5.0,
          totalStudents: 1500 + (6 - i) * 800,
          courseBy: 'Industry Mentors & Practitioners',
        },
      })
      courseId = updated.id
      console.log(`  ✅ Updated Course (ID: ${courseId})`)
    } else {
      const created = await prisma.course.create({
        data: {
          title: c.title,
          description: c.overview,
          duration: c.duration,
          categoryId: category.id,
          rating: 5.0,
          totalStudents: 1500 + (6 - i) * 800,
          courseBy: 'Industry Mentors & Practitioners',
        },
      })
      courseId = created.id
      console.log(`  ✅ Created Course (ID: ${courseId})`)
    }

    // Synchronize FAQs for this category
    await prisma.faq.deleteMany({ where: { categoryId: category.id } })
    for (let fIdx = 0; fIdx < c.faqs.length; fIdx++) {
      await prisma.faq.create({
        data: {
          categoryId: category.id,
          question: c.faqs[fIdx].q,
          answer: c.faqs[fIdx].a,
        },
      })
    }
    console.log(`  ✅ Synced ${c.faqs.length} FAQs`)

    // Synchronize LMS Modules & Chapters
    await prisma.module.deleteMany({ where: { courseId } })
    for (let mIdx = 0; mIdx < c.modules.length; mIdx++) {
      const modDef = c.modules[mIdx]
      const mod = await prisma.module.create({
        data: {
          courseId,
          title: modDef.title,
          description: modDef.description,
          sortOrder: mIdx + 1,
        },
      })

      // Add a primary chapter and topics
      const chapter = await prisma.chapter.create({
        data: {
          moduleId: mod.id,
          title: `${modDef.duration}: Core Concepts`,
          sortOrder: 1,
        },
      })

      for (let tIdx = 0; tIdx < modDef.topics.length; tIdx++) {
        await prisma.topic.create({
          data: {
            chapterId: chapter.id,
            title: modDef.topics[tIdx],
            sortOrder: tIdx + 1,
          },
        })
      }
    }
    console.log(`  ✅ Synced ${c.modules.length} LMS Modules & Topics`)
  }

  // Reassign any legacy batches/records to the 6 canonical courses, then prune legacy categories
  const validSlugs = CANONICAL_6_COURSES.map((c) => c.categorySlug)
  const canonicalCourses = await prisma.course.findMany({
    where: { category: { slug: { in: validSlugs } } },
  })
  const fallbackCourseId = canonicalCourses[0].id

  const legacyCategories = await prisma.courseCategory.findMany({
    where: { slug: { notIn: validSlugs } },
    include: { courses: true },
  })

  const fallbackFee = await prisma.courseFee.findFirst()

  for (const leg of legacyCategories) {
    for (const c of leg.courses) {
      // Reassign any fee accounts and batches referencing legacy course
      if (fallbackFee) {
        await prisma.studentFeeAccount.updateMany({
          where: { courseId: c.id },
          data: { courseId: fallbackCourseId, courseFeeId: fallbackFee.id },
        })
      }
      await prisma.batch.updateMany({
        where: { courseId: c.id },
        data: { courseId: fallbackCourseId },
      })
      await prisma.module.deleteMany({ where: { courseId: c.id } })
      await prisma.course.delete({ where: { id: c.id } })
    }
    await prisma.expert.deleteMany({ where: { categoryId: leg.id } })
    await prisma.courseReview.deleteMany({ where: { categoryId: leg.id } })
    await prisma.faq.deleteMany({ where: { categoryId: leg.id } })
    await prisma.courseFee.deleteMany({ where: { categoryId: leg.id } })
    await prisma.courseCategory.delete({ where: { id: leg.id } })
    console.log(`🧹 Removed legacy category: ${leg.name} (${leg.slug})`)
  }

  const finalFeeCount = await prisma.courseFee.count()
  const finalCourseCount = await prisma.course.count()
  console.log(`\n✨ Successfully synchronized strictly 6 Canonical Courses & Fees (Total Courses: ${finalCourseCount}, Total Fees: ${finalFeeCount})!`)
}

main()
  .catch((e) => {
    console.error('Error syncing canonical courses:', e)
    process.exit(1)
  })
  .finally(async () => {
    await pool.end()
    await prisma.$disconnect()
  })

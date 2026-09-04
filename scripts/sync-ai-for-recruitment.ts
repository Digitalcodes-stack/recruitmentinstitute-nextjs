/**
 * sync-ai-for-recruitment.ts
 *
 * Seeds/updates the flagship course "AI for Recruitment":
 * - Category: "AI & Future Skills" (slug: "ai-for-recruitment")
 * - Course: "AI for Recruitment" with full rich description
 * - Fees: Dual pricing (Online ₹7,999 vs Pune Classroom ₹12,999, Coupon: AIRECRUIT20)
 * - 14 Syllabus Modules with deep chapters, topics, learning objectives, and practical deliverables
 * - 8 High-Quality FAQs
 * - Cohort 1 Batch assigned to Shesha Shhiv Mohanty with 14 scheduled sessions & Meet links
 */

import dotenv from 'dotenv'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

dotenv.config()

const targetDbUrl =
  process.env.PROD_DATABASE_URL ||
  process.env.DATABASE_URL ||
  'postgresql://postgres:postgres@localhost:5432/recruitmentinstitute'

console.log(`🚀 Connecting to: ${targetDbUrl.includes('35.200.228.49') ? 'Cloud SQL Production' : 'Local Database'}`)

const pool = new Pool({ connectionString: targetDbUrl })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

const AI_COURSE_DATA = {
  categoryName: 'AI & Future Skills',
  categorySlug: 'ai-for-recruitment',
  title: 'AI for Recruitment',
  subtitle: 'Master AI-Powered Recruitment & Talent Acquisition',
  tagline: 'From Job Description to Joining — Build Your AI-Powered Recruitment Workflow',
  positioning: 'Don\'t Replace Your Recruiter. Upgrade Your Recruiter.',
  duration: '4 Weeks | 8 Live Sessions | 16+ Hours Live Training',
  totalStudents: 1850,
  rating: 5.0,
  courseBy: 'Industry AI & Recruitment Practitioners',
  shortDescription:
    'Learn how to use Generative AI, AI recruitment tools, automation and prompt engineering across the complete recruitment lifecycle — from Job Description to Joining. Become a faster, smarter and more productive recruiter.',
  description:
    'Recruiters today are expected to source faster, screen better, communicate effectively and manage more hiring requirements with less time.\n\nAI for Recruitment is a practical, hands-on program designed for recruiters, HR professionals, talent acquisition teams and recruitment entrepreneurs to integrate AI into their everyday recruitment workflow.\n\nThis is NOT a coding course. Participants will learn how to practically use AI tools for Job Description creation, Candidate Persona, Boolean & X-Ray search, Resume screening, Candidate matching, Communication, Interviewing, Recruitment MIS, Employer Branding, Automation and more.',

  pricing: {
    baseOnline: 9999,
    discountOnline: 2000,
    finalOnline: 7999,
    baseOffline: 14999,
    discountOffline: 2000,
    finalOffline: 12999,
    couponCode: 'AIRECRUIT20',
    modeNotes:
      'Online Live + Classroom (Pune) options. 1-to-1 Implementation (₹25,000 + GST) and Corporate packages (₹25,000+) available.',
  },

  faqs: [
    {
      q: 'What is the duration and format of the AI for Recruitment course?',
      a: 'The course runs for 4 weeks featuring 8 interactive live online masterclasses (2 sessions per week, typically weekday evenings 7:00 PM – 9:00 PM IST or weekend cohorts), totaling 16+ hours of live instructor-led learning, hands-on tool walkthroughs, and capstone mandate execution. In-person classroom batches are also hosted at our Pune training center.',
    },
    {
      q: 'Do I need coding, Python, or technical knowledge to join?',
      a: 'Absolutely not! This course is 100% no-code and built specifically for recruiters, HR generalists, and talent acquisition teams. You will learn practical prompt engineering, modern AI tool workflows, and ready-to-use recruitment automation without writing a single line of programming code.',
    },
    {
      q: 'How is this different from generic ChatGPT or AI prompt courses?',
      a: 'Generic AI courses teach broad trivia like email writing or basic summaries. This course is laser-focused on the recruitment lifecycle — building candidate personas from JDs, generating complex Boolean & X-Ray search strings, ATS-resume gap analysis, behavioral interview question design, salary benchmark calculations, and recruitment MIS automation.',
    },
    {
      q: 'What AI tools will I learn, and do I need paid subscriptions?',
      a: 'You will learn ChatGPT (GPT-4o), Google Gemini 1.5, Claude 3.5 Sonnet, Perplexity AI, LinkedIn AI features, resume matching tools, and automation platforms like Zapier/Make. All core workflows and assignments can be completed using free-tier accounts or free trials.',
    },
    {
      q: 'What certificate will I receive upon completion?',
      a: 'Graduates receive the verifiable "Certified AI Recruitment Professional" credential with unique QR-code verification that can be permanently added to your LinkedIn Licenses & Certifications section, CV, and professional portfolio.',
    },
    {
      q: 'Can I attend classes offline in Pune, or is it only online?',
      a: 'We offer both options! You can enroll in our interactive Live Online cohort or attend in-person classroom masterclasses at our Pune center (FC Road / Shivaji Nagar campus). Both formats include identical LMS access, lifetime recordings, and the AI Recruitment Toolkit.',
    },
    {
      q: 'Are corporate team training and 1-to-1 implementation available?',
      a: 'Yes. We offer customized corporate upskilling for internal TA teams and staffing agencies (starting from ₹25,000 for up to 10 members) as well as private 1-to-1 Founder/Leader Implementation packages (₹25,000 + GST) with tailored prompts and workflow setups.',
    },
    {
      q: 'What is included in the AI Recruitment Toolkit?',
      a: 'Every student receives our proprietary AI Recruitment Toolkit: 50+ battle-tested recruiter prompt templates, Boolean search generator blueprints, JD-to-Persona mapping sheets, interview scorecard rubrics, candidate communication drip templates (LinkedIn, Email, WhatsApp), and the 14-step Recruitment Playbook.',
    },
  ],

  modules: [
    {
      title: 'Module 1 — AI & The Future of Recruitment',
      duration: 'Week 1 / Session 1',
      description:
        'Foundations of Generative AI for talent acquisition, comparing LLM capabilities, understanding what AI can and cannot do, and mapping the end-to-end AI Recruiter workflow.',
      objective:
        'Understand Generative AI fundamentals and map traditional recruiting bottlenecks to AI productivity opportunities.',
      topics: [
        'What is AI & Generative AI: Core concepts simplified for recruiters',
        'Model Comparison: ChatGPT vs. Gemini vs. Claude vs. Perplexity in recruitment',
        'AI vs Automation vs Traditional ATS tools: Where each fits in your tech stack',
        'What AI can and cannot do: Realistic capabilities, limitations, and hallucinations',
        'The AI-Powered Recruiter Workflow: Mapping JD to Joining end-to-end',
        'Practical Exercise: Build your personal AI Recruiter Workflow Blueprint',
      ],
      practicalActivity:
        'Create a visual AI Recruiter Workflow Map identifying 5 immediate high-impact automation opportunities.',
    },
    {
      title: 'Module 2 — Prompt Engineering for Recruiters',
      duration: 'Week 1 / Session 2',
      description:
        'Master the recruiter prompt formula: Role + Context + Task + Constraints + Output. Learn prompt chaining, few-shot examples, and reusable recruiter templates.',
      objective:
        'Master prompt structures to extract high-accuracy, hallucination-free candidate outputs from AI models.',
      topics: [
        'Anatomy of a high-performance recruitment prompt: Role, Context, Task, Constraints & Output format',
        'Advanced techniques: Prompt Chaining, Role-based persona prompting, and Few-Shot prompting',
        'Prompt refinement & iteration: Eliminating generic corporate jargon from AI outputs',
        'Building reusable recruiter prompt templates in Notion / Google Sheets / Notes',
        'Context Window optimization and document uploads for hiring requirements',
        'Practical Exercise: Assemble your personal 50+ AI Recruitment Prompt Library',
      ],
      practicalActivity:
        'Construct a 10-prompt custom library covering intake, search, calling, and rejection sequences.',
    },
    {
      title: 'Module 3 — AI for Job Analysis & JD Creation',
      duration: 'Week 2 / Session 3',
      description:
        'Transform vague client briefs into high-converting, SEO-optimized Job Descriptions, Candidate Personas, and Competency Matrices in minutes.',
      objective:
        'Translate raw manager intake notes into precise, attractive, and bias-free job specifications.',
      topics: [
        'Deconstructing messy client or hiring manager briefs with structured prompt prompts',
        'Generating comprehensive candidate personas: Must-have vs nice-to-have competencies',
        'SEO-friendly, high-conversion JD rewriting that appeals to top-tier passive talent',
        'Extracting hard skills, soft competencies, and behavioral indicators automatically',
        'Generating first-round qualifying screening questions directly from JDs',
        'Practical Project: End-to-end JD + Persona + Competency Matrix + Screening Questions package',
      ],
      practicalActivity:
        'Deliver a full Job Analysis Suite (JD, Persona, Competency Matrix, Pre-screening form) for a niche tech/business role.',
    },
    {
      title: 'Module 4 — AI-Powered Sourcing',
      duration: 'Week 2 / Session 4',
      description:
        'Supercharge candidate discovery on LinkedIn, job portals, and Google with AI-generated Boolean search strings, alternative job titles, and X-Ray searches.',
      objective:
        'Find untapped talent pools and execute complex search queries in seconds across platforms.',
      topics: [
        'Instant Boolean search generation: AND, OR, NOT, Quotations, and Wildcards',
        'Google X-Ray search strings for LinkedIn, GitHub, Behance, and conference attendee lists',
        'Generating exhaustive alternative job titles, synonyms, and related skill taxonomy',
        'Targeting passive talent and identifying hidden candidate pools by industry verticals',
        'Evaluating candidate search result accuracy and tuning Boolean string parameters',
        'Practical Exercise: 10 Boolean Strings + 10 Alternative Titles + Target Company Profile Matrix',
      ],
      practicalActivity:
        'Generate 5 multi-portal Boolean search strings and 1 Google X-Ray search query for a hard-to-fill mandate.',
    },
    {
      title: 'Module 5 — AI Resume Screening & Candidate Matching',
      duration: 'Week 3 / Session 5',
      description:
        'Analyze resumes against job requirements with precision. Identify red flags, calculate skill gap percentages, and draft objective recruiter shortlist notes.',
      objective:
        'Screen and rank hundreds of candidate profiles accurately while preserving critical human decision-making.',
      topics: [
        'Comparing complex resumes against JDs: Automated skill-gap and experience analysis',
        'Objective candidate ranking and scoring matrix generation',
        'Detecting red flags, job-hopping timelines, and career trajectory inconsistencies',
        'Golden Governance Principle: AI recommendation ≠ Final hiring decision (Human in the Loop)',
        'Drafting executive candidate presentation summaries for hiring managers',
        'Practical Exercise: Produce a Shortlist Summary + Rejection Reasons + Interview Recommendation report',
      ],
      practicalActivity:
        'Screen 5 candidate resumes against a senior mandate, producing a 1-page comparative hiring manager briefing.',
    },
    {
      title: 'Module 6 — AI for Candidate Communication',
      duration: 'Week 3 / Session 6',
      description:
        'Craft hyper-personalized outreach, nurturing sequences, follow-ups, and offer pitches across LinkedIn InMail, Email, and WhatsApp to skyrocket response rates.',
      objective:
        'Triple candidate response rates with persuasive, personalized multi-channel outreach campaigns.',
      topics: [
        'Personalized LinkedIn InMail messages that capture executive attention',
        'Multi-touch cold email candidate outreach sequences (Initial Pitch, Follow-up 1, Follow-up 2, Breakup)',
        'WhatsApp outreach scripts: Conversational, professional, and compliant messaging',
        'Adapting tones: Executive, Friendly, Urgent, Campus, and Technical tone calibrations',
        'Drafting empathetic rejection letters and candidate talent-pool nurturing sequences',
        'Practical Exercise: Build a complete 5-stage Candidate Outreach Sequence',
      ],
      practicalActivity:
        'Draft an end-to-end 5-message communication sequence from initial InMail pitch to offer celebration.',
    },
    {
      title: 'Module 7 — AI for Interviewing & Assessment',
      duration: 'Week 4 / Session 7',
      description:
        'Generate competency-based, behavioral, and STAR interview questions with calibrated evaluation scorecards and candidate assessment frameworks.',
      objective:
        'Standardize interview evaluation criteria and equip hiring managers with structured evaluation frameworks.',
      topics: [
        'Generating role-specific technical, behavioral, situational, and culture-fit questions',
        'The STAR methodology (Situation, Task, Action, Result) prompt framework',
        'Creating weighted candidate evaluation scorecards with scoring benchmarks (1–5 scale)',
        'Interviewer calibration: Eliminating bias and ensuring structured panel feedback',
        'Generating scenario-based case study challenges and take-home assessment prompts',
        'Practical Exercise: 30 Interview Questions + Scorecard + Assessment Framework',
      ],
      practicalActivity:
        'Develop a complete 30-question structured interview kit with a rubric scoring matrix for an upcoming opening.',
    },
    {
      title: 'Module 8 — AI for Recruitment Operations',
      duration: 'Week 4 / Session 8',
      description:
        'Streamline everyday recruiter administrative workload: trackers, meeting summaries, SOPs, intake documentation, and daily task management.',
      objective:
        'Save 8–10 hours per week of manual admin tasks with AI operating templates.',
      topics: [
        'Structuring recruitment trackers, candidate status updates, and pipeline reports',
        'Summarizing client/candidate meetings and stakeholder action items in seconds',
        'Creating Standard Operating Procedures (SOPs) for recruiter onboarding and SLA adherence',
        'Generating email response drafts and daily operational agendas with voice-to-text AI',
        'Building a Daily Recruiter Operating System powered by AI task assistants',
        'Practical Exercise: Implement your AI-Assisted Daily Recruiter Operating System',
      ],
      practicalActivity:
        'Build a daily operating checklist and standardized meeting recap template using AI prompts.',
    },
    {
      title: 'Module 9 — AI for Recruitment Marketing & Employer Branding',
      duration: 'Advanced / Module 9',
      description:
        'Build a magnetic talent brand on LinkedIn: thought leadership posts, employee value proposition (EVP) content, hiring campaigns, and newsletters.',
      objective:
        'Position your agency or company as a talent magnet on social channels using AI content engines.',
      topics: [
        'Generating viral, authentic LinkedIn hiring posts and job teaser carousels',
        'Crafting compelling Employer Value Proposition (EVP) messaging and culture stories',
        'Designing targeted candidate recruitment campaigns across niche demographics',
        'Writing candidate-centric email newsletters to nurture passive candidate databases',
        'Visual & graphic AI prompts for job announcements and employer branding banners',
        'Practical Project: Build a 30-Day Recruitment Marketing & Employer Branding Calendar',
      ],
      practicalActivity:
        'Generate a 30-day social recruitment content calendar with post captions, hooks, and hashtags.',
    },
    {
      title: 'Module 10 — AI for Recruitment Analytics',
      duration: 'Advanced / Module 10',
      description:
        'Turn messy recruiting spreadsheets into actionable intelligence: funnel conversion, time-to-hire, source effectiveness, and cost-per-hire executive dashboards.',
      objective:
        'Extract strategic talent intelligence from recruitment data and generate leadership reports.',
      topics: [
        'Analyzing recruitment MIS spreadsheets and applicant tracking data with AI data analysis',
        'Calculating recruitment metrics: Time-to-fill, Offer Acceptance Rate, Funnel drop-offs',
        'Source-of-hire optimization: Pinpointing highest-performing candidate channels',
        'Drafting C-suite executive summaries and talent acquisition quarterly business reviews (QBR)',
        'Predictive hiring insights: Forecasting pipeline capacity and recruiter workload',
        'Practical Project: Management Dashboard Report + AI Executive Summary Presentation',
      ],
      practicalActivity:
        'Analyze raw candidate pipeline data and produce an executive-ready TA performance summary report.',
    },
    {
      title: 'Module 11 — AI Automation for Recruiters',
      duration: 'Advanced / Module 11',
      description:
        'Construct no-code automated recruitment pipelines: Trigger → AI Processing → Action → Human Review using Zapier, Make, and webhook integrations.',
      objective:
        'Automate repetitive recruitment tasks without sacrificing human warmth or compliance.',
      topics: [
        'Understanding no-code automation: Triggers, Actions, Webhooks, and AI Nodes',
        'Example 1: Automated inbound application intake and initial skill summary',
        'Example 2: Auto-generating candidate profile pitch summaries when a resume arrives',
        'Example 3: Automated WhatsApp / Email follow-up triggers post-interview',
        'Example 4: Automated interviewer feedback collection and aggregation',
        'Human-in-the-loop safeguards: Ensuring critical approval gates before client dispatch',
      ],
      practicalActivity:
        'Map out a 4-step recruitment workflow automation blueprint ready for implementation.',
    },
    {
      title: 'Module 12 — AI Recruitment Tools & Tool Stack',
      duration: 'Advanced / Module 12',
      description:
        'Evaluate and select the best tools for your budget and recruitment model. Build your personalized AI Recruiter Stack across sourcing, screening, and operations.',
      objective:
        'Curate a cost-effective, high-leverage software stack tailored to in-house or agency recruiting.',
      topics: [
        'Comprehensive taxonomy of AI recruitment software in 2026: Sourcing, ATS, Video & Ops',
        'Evaluating AI vendor claims: Marketing hype vs. real recruiter utility',
        'ROI calculator: Measuring time saved and cost benefits of AI tooling',
        'Building the Free/Budget AI Recruiter Stack (under ₹2,000/month)',
        'Building the Enterprise/Agency High-Volume AI Recruiter Stack',
        'Tool audit framework: Data security, privacy, and compliance review checklist',
      ],
      practicalActivity:
        'Complete your Personal AI Recruiter Tool Stack Blueprint with recommended software and monthly budget.',
    },
    {
      title: 'Module 13 — Responsible AI in Recruitment',
      duration: 'Advanced / Module 13',
      description:
        'Navigate ethical considerations, algorithmic bias, data privacy (DPDP Act & GDPR), AI hallucinations, and mandatory human oversight in hiring decisions.',
      objective:
        'Ensure 100% legal, ethical, and bias-free compliance when deploying AI across hiring workflows.',
      topics: [
        'Algorithmic bias in hiring: How historical hiring bias infects AI models and how to prevent it',
        'Data privacy in recruitment: Handling candidate PII under Indian DPDP Act & international laws',
        'Preventing AI hallucinations and verifying technical candidate claims',
        'The Golden Rule: AI assists the recruiter — AI never blindly makes final hiring decisions',
        'Building ethical AI guidelines for your agency or corporate talent acquisition team',
        'Future of recruitment jobs: Why AI upgrades recruiters rather than replacing them',
      ],
      practicalActivity:
        'Draft an Ethical AI Policy statement for your recruitment practice or HR department.',
    },
    {
      title: 'Module 14 — Final Capstone Project',
      duration: 'Capstone & Certification',
      description:
        'Execute a comprehensive end-to-end recruitment mandate from Job Description to Offer Letter using the complete AI-powered workflow. Earn your certification.',
      objective:
        'Demonstrate complete mastery of the 14 deliverables comprising the AI-Powered Recruitment Playbook.',
      topics: [
        'Capstone Mandate Briefing: Selecting a real-world difficult hiring requirement',
        'Deliverable 1–4: Optimized JD, Candidate Persona, Competency Matrix & Screening Questions',
        'Deliverable 5–7: Boolean Search Strings, Alternative Titles & X-Ray Query Stack',
        'Deliverable 8–10: Resume Screening Matrix, Shortlist Summary & 5-Step Outreach Sequence',
        'Deliverable 11–14: STAR Interview Kit, Scorecard, Daily Ops Blueprint & Executive Summary',
        'Capstone Review & Feedback from Senior Mentors',
        'Awarding of Certified AI Recruitment Professional credential',
      ],
      practicalActivity:
        'Submit the completed 14-deliverable AI-Powered Recruitment Playbook for portfolio assessment.',
    },
  ],
}

async function syncAiForRecruitment() {
  console.log('\n======================================================')
  console.log('🤖 SYNCING "AI FOR RECRUITMENT" FLAGSHIP COURSE')
  console.log('======================================================\n')

  // 1. Ensure Trainer Shesha Shhiv Mohanty exists and has availability
  console.log('1️⃣ Checking Lead Trainer...')
  let trainer = await prisma.trainer.findFirst({
    where: {
      OR: [
        { email: 'shesha.mohanty@institute.com' },
        { name: { contains: 'Shesha', mode: 'insensitive' } },
      ],
    },
  })

  if (!trainer) {
    console.log('  Creating Shesha Shhiv Mohanty trainer profile...')
    trainer = await prisma.trainer.create({
      data: {
        name: 'Shesha Shhiv Mohanty',
        email: 'shesha.mohanty@institute.com',
        phone: '9870001006',
        password: '$2a$10$YourHashedPasswordHereOrFallback123',
        specialization: 'AI Transformation & Recruitment',
        bio: 'AI transformation and recruitment trainer with 15+ years of experience, having trained 1000+ professionals across HR tech and talent acquisition.',
        image: '/assets/images/trainers/shesha_sir.jpg',
        isActive: true,
      },
    })
  }

  // Ensure trainer availability slots exist (Weekdays 19:00 - 21:00, Weekends)
  const existingSlots = await prisma.trainerAvailability.count({ where: { trainerId: trainer.id } })
  if (existingSlots === 0) {
    const defaultSlots = [
      { dayOfWeek: 1, startTime: '19:00', endTime: '21:00' }, // Mon
      { dayOfWeek: 2, startTime: '19:00', endTime: '21:00' }, // Tue
      { dayOfWeek: 3, startTime: '19:00', endTime: '21:00' }, // Wed
      { dayOfWeek: 4, startTime: '19:00', endTime: '21:00' }, // Thu
      { dayOfWeek: 5, startTime: '19:00', endTime: '21:00' }, // Fri
      { dayOfWeek: 6, startTime: '10:00', endTime: '18:00' }, // Sat
      { dayOfWeek: 0, startTime: '10:00', endTime: '18:00' }, // Sun
    ]
    await prisma.trainerAvailability.createMany({
      data: defaultSlots.map((s) => ({ ...s, trainerId: trainer.id })),
    })
    console.log(`  ✅ Added 7 availability slots for ${trainer.name}`)
  } else {
    console.log(`  ✅ Trainer ${trainer.name} (ID: ${trainer.id}) has active availability.`)
  }

  // 2. Upsert Category: "AI & Future Skills"
  console.log('\n2️⃣ Upserting Course Category...')
  const category = await prisma.courseCategory.upsert({
    where: { slug: AI_COURSE_DATA.categorySlug },
    update: {
      name: AI_COURSE_DATA.categoryName,
    },
    create: {
      name: AI_COURSE_DATA.categoryName,
      slug: AI_COURSE_DATA.categorySlug,
    },
  })
  console.log(`  ✅ Category: "${category.name}" (ID: ${category.id}, Slug: "${category.slug}")`)

  // 3. Upsert CourseFee (Dual Pricing: Online vs Classroom)
  console.log('\n3️⃣ Upserting Course Fee Record...')
  const existingFee = await prisma.courseFee.findFirst({
    where: { categoryId: category.id },
  })

  let feeRecord
  if (existingFee) {
    feeRecord = await prisma.courseFee.update({
      where: { id: existingFee.id },
      data: {
        courseName: AI_COURSE_DATA.title,
        fees: String(AI_COURSE_DATA.pricing.baseOnline),
        discount: String(AI_COURSE_DATA.pricing.discountOnline),
        subtotal: String(AI_COURSE_DATA.pricing.finalOnline),
        feeTotal: String(AI_COURSE_DATA.pricing.finalOnline),
        finalTotal: String(AI_COURSE_DATA.pricing.finalOnline),
        onlineFees: String(AI_COURSE_DATA.pricing.baseOnline),
        onlineDiscount: String(AI_COURSE_DATA.pricing.discountOnline),
        onlineFinal: String(AI_COURSE_DATA.pricing.finalOnline),
        offlineFees: String(AI_COURSE_DATA.pricing.baseOffline),
        offlineDiscount: String(AI_COURSE_DATA.pricing.discountOffline),
        offlineFinal: String(AI_COURSE_DATA.pricing.finalOffline),
        modeNotes: AI_COURSE_DATA.pricing.modeNotes,
        couponCode: AI_COURSE_DATA.pricing.couponCode,
      },
    })
    console.log(`  ✅ Updated Course Fee (ID: ${feeRecord.id})`)
  } else {
    feeRecord = await prisma.courseFee.create({
      data: {
        courseName: AI_COURSE_DATA.title,
        categoryId: category.id,
        fees: String(AI_COURSE_DATA.pricing.baseOnline),
        discount: String(AI_COURSE_DATA.pricing.discountOnline),
        subtotal: String(AI_COURSE_DATA.pricing.finalOnline),
        feeTotal: String(AI_COURSE_DATA.pricing.finalOnline),
        finalTotal: String(AI_COURSE_DATA.pricing.finalOnline),
        onlineFees: String(AI_COURSE_DATA.pricing.baseOnline),
        onlineDiscount: String(AI_COURSE_DATA.pricing.discountOnline),
        onlineFinal: String(AI_COURSE_DATA.pricing.finalOnline),
        offlineFees: String(AI_COURSE_DATA.pricing.baseOffline),
        offlineDiscount: String(AI_COURSE_DATA.pricing.discountOffline),
        offlineFinal: String(AI_COURSE_DATA.pricing.finalOffline),
        modeNotes: AI_COURSE_DATA.pricing.modeNotes,
        couponCode: AI_COURSE_DATA.pricing.couponCode,
      },
    })
    console.log(`  ✅ Created Course Fee (ID: ${feeRecord.id})`)
  }
  console.log(`     • Online: ₹${feeRecord.onlineFinal} (Base ₹${feeRecord.onlineFees})`)
  console.log(`     • Offline (Pune): ₹${feeRecord.offlineFinal} (Base ₹${feeRecord.offlineFees})`)

  // 4. Upsert Course
  console.log('\n4️⃣ Upserting Course...')
  const existingCourse = await prisma.course.findFirst({
    where: { categoryId: category.id },
  })

  let course
  if (existingCourse) {
    course = await prisma.course.update({
      where: { id: existingCourse.id },
      data: {
        title: AI_COURSE_DATA.title,
        description: AI_COURSE_DATA.description,
        duration: '4 Weeks',
        rating: AI_COURSE_DATA.rating,
        totalStudents: AI_COURSE_DATA.totalStudents,
        courseBy: AI_COURSE_DATA.courseBy,
      },
    })
    console.log(`  ✅ Updated Course: "${course.title}" (ID: ${course.id})`)
  } else {
    course = await prisma.course.create({
      data: {
        title: AI_COURSE_DATA.title,
        description: AI_COURSE_DATA.description,
        duration: '4 Weeks',
        categoryId: category.id,
        rating: AI_COURSE_DATA.rating,
        totalStudents: AI_COURSE_DATA.totalStudents,
        courseBy: AI_COURSE_DATA.courseBy,
      },
    })
    console.log(`  ✅ Created Course: "${course.title}" (ID: ${course.id})`)
  }

  // 5. Synchronize FAQs
  console.log('\n5️⃣ Synchronizing FAQs...')
  await prisma.faq.deleteMany({ where: { categoryId: category.id } })
  for (const faq of AI_COURSE_DATA.faqs) {
    await prisma.faq.create({
      data: {
        categoryId: category.id,
        question: faq.q,
        answer: faq.a,
      },
    })
  }
  console.log(`  ✅ Synced ${AI_COURSE_DATA.faqs.length} FAQs for category "${category.name}"`)

  // 6. Synchronize 14 Syllabus Modules with Chapters & Topics
  console.log('\n6️⃣ Synchronizing 14 Syllabus Modules...')
  // Remove existing modules for this course
  await prisma.module.deleteMany({ where: { courseId: course.id } })

  const createdModules: { id: number; title: string; topics: string[] }[] = []

  for (let mIdx = 0; mIdx < AI_COURSE_DATA.modules.length; mIdx++) {
    const modDef = AI_COURSE_DATA.modules[mIdx]
    const moduleRecord = await prisma.module.create({
      data: {
        courseId: course.id,
        title: modDef.title,
        description: `${modDef.description}\n\nObjective: ${modDef.objective}\nPractical Project: ${modDef.practicalActivity}`,
        sortOrder: mIdx + 1,
      },
    })

    // Create primary Chapter
    const chapter = await prisma.chapter.create({
      data: {
        moduleId: moduleRecord.id,
        title: `${modDef.duration}: Core AI Competencies`,
        sortOrder: 1,
      },
    })

    // Create Topics
    for (let tIdx = 0; tIdx < modDef.topics.length; tIdx++) {
      const topicRecord = await prisma.topic.create({
        data: {
          chapterId: chapter.id,
          title: modDef.topics[tIdx],
          sortOrder: tIdx + 1,
        },
      })

      // Add detailed Lesson for the first topic of each module so trainer can attach PDFs
      if (tIdx === 0) {
        await prisma.lesson.create({
          data: {
            topicId: topicRecord.id,
            title: `${modDef.title} — Detailed Lecture & Guide`,
            type: 'VIDEO',
            durationSec: 1800,
            bodyHtml: `<p><strong>Module Overview:</strong> ${modDef.description}</p><p><strong>Key Practical Activity:</strong> ${modDef.practicalActivity}</p><p>Download the official prompt template package and resource guide from the attachments tab.</p>`,
            sortOrder: 1,
            isPreview: mIdx === 0, // Module 1 is previewable
          },
        })
      }
    }

    createdModules.push({
      id: moduleRecord.id,
      title: modDef.title,
      topics: modDef.topics,
    })

    console.log(`  ✅ [${mIdx + 1}/14] ${modDef.title} (${modDef.topics.length} topics)`)
  }

  // 7. Seed Initial Flagship Batch & Scheduled Sessions
  console.log('\n7️⃣ Setting up Flagship Batch & Sessions...')
  const batchName = `${course.title} — Cohort 1 (Flagship)`
  let batch = await prisma.batch.findFirst({
    where: {
      courseId: course.id,
      name: batchName,
    },
  })

  // Start date: Next Tuesday
  const today = new Date()
  const startDate = new Date(today)
  startDate.setDate(today.getDate() + ((2 - today.getDay() + 7) % 7 || 7)) // Next Tuesday
  startDate.setHours(0, 0, 0, 0)

  const endDate = new Date(startDate)
  endDate.setDate(startDate.getDate() + 28) // 4 weeks

  if (!batch) {
    batch = await prisma.batch.create({
      data: {
        name: batchName,
        courseId: course.id,
        trainerId: trainer.id,
        capacity: 35,
        mode: 'ONLINE',
        startDate,
        endDate,
        schedule: 'Tue & Thu • 19:00–21:00 IST (4 Weeks | 8 Live Sessions)',
        status: 'UPCOMING',
      },
    })
    console.log(`  ✅ Created Batch: "${batch.name}" (ID: ${batch.id})`)
  } else {
    batch = await prisma.batch.update({
      where: { id: batch.id },
      data: {
        trainerId: trainer.id,
        status: 'UPCOMING',
        schedule: 'Tue & Thu • 19:00–21:00 IST (4 Weeks | 8 Live Sessions)',
      },
    })
    console.log(`  ✅ Updated Existing Batch: "${batch.name}" (ID: ${batch.id})`)
  }

  // Generate sessions for the batch
  await prisma.session.deleteMany({ where: { batchId: batch.id } })

  const chars = 'abcdefghijklmnopqrstuvwxyz'
  const genMeetCode = () => {
    const seg = (n: number) =>
      Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
    return `https://meet.google.com/${seg(3)}-${seg(4)}-${seg(3)}`
  }

  // Schedule sessions on Tuesdays and Thursdays across 7 weeks or 4 intensive weeks
  // Let's create sessions for all 14 modules so every module has a dedicated live deep dive
  let sessionCursor = new Date(startDate)
  let sessionsCreatedCount = 0

  for (let i = 0; i < createdModules.length; i++) {
    const mod = createdModules[i]
    // Advance to next Tue (2) or Thu (4)
    while (sessionCursor.getDay() !== 2 && sessionCursor.getDay() !== 4) {
      sessionCursor.setDate(sessionCursor.getDate() + 1)
    }

    const sessionDate = new Date(sessionCursor.toISOString().slice(0, 10))
    const startTime = new Date(sessionCursor)
    startTime.setHours(19, 0, 0, 0)
    const endTime = new Date(sessionCursor)
    endTime.setHours(21, 0, 0, 0)

    const topicsText = mod.topics.map((t, idx) => `${idx + 1}. ${t}`).join('\n')
    const description = `Live Masterclass for ${mod.title}\n\nKey Topics:\n${topicsText}\n\nTrainer: ${trainer.name}`

    await prisma.session.create({
      data: {
        batchId: batch.id,
        trainerId: trainer.id,
        title: `Session ${i + 1}: ${mod.title}`,
        description,
        sessionDate,
        startTime,
        endTime,
        meetLink: genMeetCode(),
        status: 'UPCOMING',
        syllabusModuleId: mod.id,
        moduleNameSnapshot: mod.title,
        topicsJson: mod.topics,
      },
    })

    sessionsCreatedCount++
    // Move to next day
    sessionCursor.setDate(sessionCursor.getDate() + 1)
  }

  console.log(`  ✅ Scheduled ${sessionsCreatedCount} Sessions with full topic outlines & Meet links`)

  console.log('\n======================================================')
  console.log('🎉 "AI FOR RECRUITMENT" SYNCHRONIZED SUCCESSFULLY!')
  console.log(`   • Category: ${category.name} (ID: ${category.id}, Slug: ${category.slug})`)
  console.log(`   • Course ID: ${course.id}`)
  console.log(`   • Modules: ${createdModules.length}`)
  console.log(`   • Batch ID: ${batch.id} (${batch.name})`)
  console.log(`   • Trainer: ${trainer.name}`)
  console.log('======================================================\n')
}

syncAiForRecruitment()
  .catch((err) => {
    console.error('❌ Error during AI for Recruitment sync:', err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

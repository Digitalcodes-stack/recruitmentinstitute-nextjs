import { prisma } from '@/lib/prisma'

export interface DynamicCurriculumModule {
  id?: number
  week: string
  title: string
  accent?: string
  description?: string | null
  details: string[]
}

export interface DynamicFaqItem {
  id?: number
  q: string
  a: string
}

export interface DynamicCourseData {
  id: number
  slug: string
  route: string
  title: string
  description: string
  categoryName: string
  totalStudents: number
  rating: number
  duration: string
  startDate: string
  badge: string
  badgeColor: string
  badgeBg: string
  badgeBorder: string
  accent: string
  accentLight: string
  accentBorder: string
  accentGlow: string
  gradient: string
  image: string
  pricing: {
    baseFee: number
    discount: number
    finalFee: number
    savingsPercent: number
    emiPerMonth: number
  }
  curriculum: DynamicCurriculumModule[]
  faqs: DynamicFaqItem[]
  features: Array<{ title: string; desc: string }>
}

const DEFAULT_COURSE_CONFIGS: Record<string, {
  slugKey: string
  route: string
  defaultTitle: string
  defaultDuration: string
  defaultDurationShort: string
  badge: string
  badgeColor: string
  badgeBg: string
  badgeBorder: string
  accent: string
  accentLight: string
  accentBorder: string
  accentGlow: string
  gradient: string
  image: string
  defaultFees: number
  defaultDiscount: number
  defaultFinal: number
  defaultCurriculum: DynamicCurriculumModule[]
  defaultFaqs: DynamicFaqItem[]
}> = {
  'degree_tag': {
    slugKey: 'degree_tag',
    route: '/end-to-end-recruitment-training',
    defaultTitle: 'End-to-End Recruitment Training',
    defaultDuration: '3 Months',
    defaultDurationShort: '3 Mo',
    badge: 'Most Popular',
    badgeColor: '#DC2626',
    badgeBg: 'rgba(220,38,38,.15)',
    badgeBorder: 'rgba(220,38,38,.35)',
    accent: '#DC2626',
    accentLight: '#FEF2F2',
    accentBorder: '#FECACA',
    accentGlow: 'rgba(220,38,38,.2)',
    gradient: 'linear-gradient(135deg,#7F1D1D,#DC2626,#B91C1C)',
    image: '/assets/images/banner/home9.jpg',
    defaultFees: 28000,
    defaultDiscount: 3000,
    defaultFinal: 25000,
    defaultCurriculum: [
      {
        week: 'Week 1–2',
        title: 'Recruitment Fundamentals & Job Analysis',
        accent: '#DC2626',
        details: [
          'Job analysis & role intake meetings',
          'Writing clear and compelling job profiles',
          'Understanding the end-to-end hiring lifecycle',
          'Key recruitment terminology and frameworks',
          'Navigating multiple applicant sourcing channels',
          'Recruiter roles, skills, and daily responsibilities',
        ],
      },
      {
        week: 'Week 3–4',
        title: 'Sourcing Strategies & Boolean Search',
        accent: '#EA580C',
        details: [
          'Google X-ray and advanced Boolean search strings',
          'Advanced LinkedIn Recruiter filters and InMail',
          'Targeting and engaging passive candidates',
          'Job board strategies (Naukri, Indeed, LinkedIn)',
          'Building and maintaining talent pipelines',
          'Social media sourcing Facebook, Twitter, GitHub',
        ],
      },
      {
        week: 'Week 5–6',
        title: 'Screening, Interviews & Candidate Assessment',
        accent: '#D97706',
        details: [
          'Competency-based and behavioural interview techniques',
          'Vetting resumes at scale with automated tools',
          'Phone, video, and in-person interview structures',
          'Conducting initial screening calls professionally',
          'Decision-making and candidate evaluation frameworks',
          'Candidate communication and workflow management',
        ],
      },
      {
        week: 'Week 7–8',
        title: 'Domain Specialisation (IT / Non-IT)',
        accent: '#16A34A',
        details: [
          'IT sourcing terminology and technical assessment',
          'BFSI sector staffing models and role structures',
          'Pharma / Healthcare credential verification',
          'Manufacturing & FMCG role requirements',
          'Finance certifications and competitive strategies',
          'Domain-specific talent attraction techniques',
        ],
      },
      {
        week: 'Week 9–10',
        title: 'Offer Management, Onboarding & Branding',
        accent: '#2563EB',
        details: [
          'Drafting and structuring competitive job offers',
          'Counter-offer negotiation techniques',
          'Candidate onboarding checklists and workflows',
          'Building a strong employer brand',
          'Job description optimisation and content marketing',
          'Legal and ethical recruitment considerations',
        ],
      },
      {
        week: 'Week 11–12',
        title: 'Metrics, Tools, Practical Project & Placement Prep',
        accent: '#7C3AED',
        details: [
          'Modern ATS platform overview and operations',
          'KPI trackers, dashboards, and hiring metrics',
          'Complete end-to-end recruitment plan development',
          'Live candidate sourcing and screening project',
          'Mock interviews and final hiring rationale',
          'Resume optimisation and placement registration',
        ],
      },
    ],
    defaultFaqs: [
      { q: 'Who is this course suitable for?', a: 'This program is ideal for HR professionals, active recruiters, recent graduates, and working professionals transitioning into the recruitment field. No prior experience is required a basic understanding of HR concepts is beneficial but not mandatory.' },
      { q: 'How long does the program take?', a: 'The program is a 3-month intensive covering 12 weeks of structured content, live sessions, and practical assignments designed for working professionals.' },
      { q: 'Is the course available online?', a: 'Yes. The course is available both online and in-person. Live sessions, recorded materials, and a dedicated support team ensure you get full value regardless of your location.' },
      { q: 'Does it cover all industry domains?', a: 'Absolutely. The program includes dedicated modules for IT, BFSI, Pharma, Healthcare, Manufacturing, FMCG, and Finance recruitment giving you the breadth to work across any sector.' },
      { q: 'Will I get placement support?', a: 'Yes. Placement support includes resume review sessions, mock interviews, access to our hiring partner network, and registration with our placement team upon completion.' },
      { q: 'What certificate will I receive?', a: 'You will receive an industry-recognised certificate of completion from Recruitment Institute that is trusted by 200+ hiring companies across India and shareable on LinkedIn.' },
      { q: 'Is this suitable for working professionals?', a: 'Yes. The schedule is designed to accommodate working professionals with flexible timing, recorded sessions for missed classes, and weekend batch options.' },
    ],
  },
  'certification_tag': {
    slugKey: 'certification_tag',
    route: '/hr-courses-for-beginners',
    defaultTitle: 'HR Courses for Beginners',
    defaultDuration: '6 Weeks',
    defaultDurationShort: '6 Wk',
    badge: 'Beginner Friendly',
    badgeColor: '#0EA5E9',
    badgeBg: 'rgba(14,165,233,.15)',
    badgeBorder: 'rgba(14,165,233,.35)',
    accent: '#0EA5E9',
    accentLight: '#F0F9FF',
    accentBorder: '#BAE6FD',
    accentGlow: 'rgba(14,165,233,.2)',
    gradient: 'linear-gradient(135deg,#075985,#0EA5E9,#0284C7)',
    image: '/assets/images/about/tab1.jpg',
    defaultFees: 18000,
    defaultDiscount: 2000,
    defaultFinal: 16000,
    defaultCurriculum: [
      {
        week: 'Week 1',
        title: 'HR Foundations & Industry Landscape',
        accent: '#0EA5E9',
        details: [
          'Introduction to Human Resource Management',
          'Role and responsibilities of an entry-level HR recruiter',
          'Understanding organisational hierarchy and talent needs',
          'Overview of recruitment lifecycle and basic terminology',
        ],
      },
      {
        week: 'Week 2',
        title: 'Job Descriptions & Sourcing Fundamentals',
        accent: '#0284C7',
        details: [
          'Deconstructing job descriptions and candidate personas',
          'Introduction to job portals (Naukri, Indeed, LinkedIn)',
          'Basic keyword searching and candidate search filters',
          'Creating candidate talent pools from scratch',
        ],
      },
      {
        week: 'Week 3',
        title: 'Resume Screening & Telephonic Calling',
        accent: '#0369A1',
        details: [
          '30-second resume evaluation framework',
          'Conducting professional telephonic screening calls',
          'Handling candidate queries and salary expectations',
          'Basic email etiquette and scheduling interviews',
        ],
      },
      {
        week: 'Week 4',
        title: 'Interview Coordination & Documentation',
        accent: '#075985',
        details: [
          'End-to-end interview round scheduling',
          'Collecting feedback and communicating with hiring managers',
          'Basic onboarding documents and verification checks',
          'Understanding offer letters and joining formalities',
        ],
      },
      {
        week: 'Week 5–6',
        title: 'Practical Project, Portfolio & First Job Prep',
        accent: '#0C4A6E',
        details: [
          'Hands-on live candidate sourcing simulation',
          'Building your professional recruiter resume',
          'Mock HR interviews with faculty feedback',
          'Job application strategy and placement cell registration',
        ],
      },
    ],
    defaultFaqs: [
      { q: 'Is any prior HR knowledge required?', a: 'No. This course is specifically built for beginners, fresh graduates, and career switchers starting with zero HR background.' },
      { q: 'What is the duration of this beginner course?', a: 'The course runs for 6 weeks with live weekend and evening weekday options to suit working individuals and students.' },
      { q: 'Will I get an accredited certificate?', a: 'Yes. You receive a verified certificate upon submitting your practical assignments and capstone screening test.' },
      { q: 'Can I get a job after this foundational course?', a: 'Yes! Most students qualify for Junior Recruiter, HR Coordinator, and Talent Acquisition Associate positions.' },
    ],
  },
  'entrepreneur_tag': {
    slugKey: 'entrepreneur_tag',
    route: '/hr-entrepreneurship-program',
    defaultTitle: 'HR Entrepreneurship Program',
    defaultDuration: '2 Months',
    defaultDurationShort: '2 Mo',
    badge: 'Business Track',
    badgeColor: '#D97706',
    badgeBg: 'rgba(217,119,6,.15)',
    badgeBorder: 'rgba(217,119,6,.35)',
    accent: '#D97706',
    accentLight: '#FFFBEB',
    accentBorder: '#FDE68A',
    accentGlow: 'rgba(217,119,6,.2)',
    gradient: 'linear-gradient(135deg,#78350F,#D97706,#B45309)',
    image: '/assets/images/courses/style4/4.jpg',
    defaultFees: 25000,
    defaultDiscount: 3000,
    defaultFinal: 22000,
    defaultCurriculum: [
      {
        week: 'Week 1–2',
        title: 'Niche Selection, Positioning & Legal Setup',
        accent: '#D97706',
        details: [
          'Selecting a high-margin recruitment niche (IT, Healthcare, BFSI)',
          'Business structure: Sole Proprietorship vs LLP vs Pvt Ltd',
          'GST registration, MSME, and bank account setup',
          'Client service agreement (SLA) & non-disclosure agreements (NDA)',
        ],
      },
      {
        week: 'Week 3–4',
        title: 'Client Acquisition & B2B Cold Outreach',
        accent: '#B45309',
        details: [
          'Targeting HR Heads, Founders, and Talent Acquisition Directors',
          'Proven 3-touch email & LinkedIn outreach scripts',
          'Pitching contingency vs retained recruitment models',
          'Negotiating commercial terms (8.33% to 15% placement fee)',
        ],
      },
      {
        week: 'Week 5–6',
        title: 'Bench Building & Delivery Excellence',
        accent: '#92400E',
        details: [
          'Setting up low-cost ATS & sourcing infrastructure',
          'Sourcing candidate pipelines before client mandates',
          'The 48-Hour Shortlist standard that wins client loyalty',
          'Managing candidate drop-offs and counter-offers',
        ],
      },
      {
        week: 'Week 7–8',
        title: 'Billing, Invoicing, Scaling & Team Hiring',
        accent: '#78350F',
        details: [
          'Invoicing, payment follow-ups, and collections cycle',
          'Hiring your first freelance recruiter or sourcer',
          'Commission sharing and performance incentives',
          'Scaling from solo founder to 5-person agency',
        ],
      },
    ],
    defaultFaqs: [
      { q: 'Can I start my recruitment agency from home?', a: 'Yes! Over 80% of our alumni operate as remote agency owners with minimal overhead costs.' },
      { q: 'Do I need a large capital investment?', a: 'No. Recruitment is a service-based business requiring basic tools like a laptop, phone, and sourcing access.' },
      { q: 'Do you provide ready client contract templates?', a: 'Yes. You receive our complete lawyer-vetted contract bundle (Client Agreement, NDA, Invoicing formats).' },
      { q: 'Is there 1-on-1 business mentorship?', a: 'Yes. You get direct mentorship sessions with successful recruitment entrepreneurs who have scaled agencies to ₹1Cr+ revenue.' },
    ],
  },
  'corporate_traning_tag': {
    slugKey: 'corporate_traning_tag',
    route: '/hr-corporate-training-course',
    defaultTitle: 'HR Corporate Training Course',
    defaultDuration: 'Flexible',
    defaultDurationShort: 'Bespoke',
    badge: 'Enterprise',
    badgeColor: '#7C3AED',
    badgeBg: 'rgba(124,58,237,.15)',
    badgeBorder: 'rgba(124,58,237,.35)',
    accent: '#7C3AED',
    accentLight: '#F5F3FF',
    accentBorder: '#DDD6FE',
    accentGlow: 'rgba(124,58,237,.2)',
    gradient: 'linear-gradient(135deg,#3B0764,#7C3AED,#6D28D9)',
    image: '/assets/images/about/tab2.jpg',
    defaultFees: 20000,
    defaultDiscount: 2500,
    defaultFinal: 17500,
    defaultCurriculum: [
      {
        week: 'Module 1',
        title: 'Talent Acquisition Process Audit & Optimization',
        accent: '#7C3AED',
        details: [
          'Assessing current hiring bottlenecks and time-to-fill',
          'Benchmarking candidate experience and employer branding',
          'Standardizing job intake and hiring manager alignment',
        ],
      },
      {
        week: 'Module 2',
        title: 'Advanced Sourcing & Talent Pipeline Architecture',
        accent: '#6D28D9',
        details: [
          'Advanced Boolean search and multi-channel talent mapping',
          'Passive candidate engagement strategies for internal recruiters',
          'Building proprietary talent pools to reduce agency dependency',
        ],
      },
      {
        week: 'Module 3',
        title: 'Structured Interviewing & Objective Selection',
        accent: '#5B21B6',
        details: [
          'Eliminating unconscious bias in candidate evaluation',
          'Developing role-specific competency scorecards',
          'Interviewing training for technical & functional hiring managers',
        ],
      },
      {
        week: 'Module 4',
        title: 'Recruitment Analytics, Metrics & Reporting',
        accent: '#4C1D95',
        details: [
          'Cost-per-hire, Offer-to-join ratio, and quality-of-hire metrics',
          'Building real-time executive hiring dashboards',
          'Presenting TA metrics to Board & leadership',
        ],
      },
    ],
    defaultFaqs: [
      { q: 'Can this training be customized for our industry?', a: 'Yes. We customize case studies and live exercises specifically for your company sector (IT, Manufacturing, BFSI, Retail, etc.).' },
      { q: 'Can training be conducted on-premise or virtually?', a: 'We offer both on-site workshops at your company office and interactive virtual workshops over Zoom/Teams.' },
      { q: 'What is the minimum team size for corporate training?', a: 'We accommodate teams ranging from small HR units (5–10 recruiters) up to enterprise divisions (100+ members).' },
      { q: 'Do you offer post-training performance reviews?', a: 'Yes. We provide 30-day and 60-day follow-up assessments to evaluate talent metric improvements.' },
    ],
  },
}

function stripHtml(input: string = '') {
  return input
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/(p|h[1-6]|li|ul|ol)>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&mdash;/g, '-')
    .replace(/&ndash;/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Fetches dynamic, comprehensive data for any course track from the database.
 * Reconciles Course, Category, LMS Modules, Chapters, Fees, and Category FAQs.
 */
export async function getDynamicCourseData(categorySlug: string): Promise<DynamicCourseData> {
  const config = DEFAULT_COURSE_CONFIGS[categorySlug] || DEFAULT_COURSE_CONFIGS['degree_tag']

  try {
    // 1. Fetch category with its course, modules, chapters, fees, and faqs
    const category = await prisma.courseCategory.findFirst({
      where: {
        OR: [
          { slug: categorySlug },
          { slug: config.slugKey },
        ],
      },
      include: {
        courses: {
          orderBy: { id: 'asc' },
          include: {
            modules: {
              orderBy: { sortOrder: 'asc' },
              include: {
                chapters: {
                  orderBy: { sortOrder: 'asc' },
                },
              },
            },
            batches: {
              where: { status: 'UPCOMING' },
              orderBy: { startDate: 'asc' },
              take: 1,
            },
          },
        },
        fees: {
          orderBy: { id: 'asc' },
        },
        faqs: {
          orderBy: { id: 'asc' },
        },
      },
    })

    const dbCourse = category?.courses[0]
    const dbFee = category?.fees[0]

    // 2. Resolve Course Title & Description
    const title = dbCourse?.title && dbCourse.title !== 'Degree Courses' && dbCourse.title !== 'Certification Courses' && dbCourse.title !== 'Entrepreneur Courses' && dbCourse.title !== 'Corporate Traning Courses'
      ? dbCourse.title
      : config.defaultTitle

    const description = dbCourse?.description
      ? stripHtml(dbCourse.description)
      : 'Master professional recruitment, sourcing, ATS systems, and talent acquisition with industry mentors.'

    const totalStudents = dbCourse?.totalStudents && dbCourse.totalStudents > 0
      ? dbCourse.totalStudents
      : 5000

    const rating = dbCourse?.rating ? Number(dbCourse.rating) : 4.9

    // 3. Resolve Pricing (Dynamic from CourseFee table)
    let baseFee = config.defaultFees
    let discount = config.defaultDiscount
    let finalFee = config.defaultFinal

    if (dbFee) {
      const fBase = dbFee.fees ? Number(dbFee.fees) : 0
      const fDisc = dbFee.discount ? Number(dbFee.discount) : 0
      const fFinal = dbFee.finalTotal ? Number(dbFee.finalTotal) : (fBase - fDisc > 0 ? fBase - fDisc : fBase)

      if (fBase > 0) baseFee = fBase
      if (fDisc >= 0) discount = fDisc
      if (fFinal > 0) finalFee = fFinal
    }

    const savingsPercent = baseFee > 0 && discount > 0 ? Math.round((discount / baseFee) * 100) : 0
    const emiPerMonth = Math.round(finalFee / 6)

    // 4. Resolve Curriculum (Dynamic from LMS Modules in DB)
    let curriculum: DynamicCurriculumModule[] = []

    if (dbCourse && dbCourse.modules && dbCourse.modules.length > 0) {
      curriculum = dbCourse.modules.map((m, idx) => {
        const details = m.chapters.map((c) => c.title)
        return {
          id: m.id,
          week: `Module ${idx + 1}`,
          title: m.title,
          description: m.description,
          accent: config.accent,
          details: details.length > 0 ? details : [m.description || 'Comprehensive interactive hands-on training module.'],
        }
      })
    }

    if (curriculum.length === 0) {
      curriculum = config.defaultCurriculum
    }

    // 5. Resolve FAQs (Dynamic from FAQ table in DB)
    let faqs: DynamicFaqItem[] = []
    if (category?.faqs && category.faqs.length > 0) {
      // Remove duplicate questions in case of repeated DB rows
      const seen = new Set<string>()
      for (const f of category.faqs) {
        const qClean = f.question.trim().toLowerCase()
        if (!seen.has(qClean)) {
          seen.add(qClean)
          faqs.push({
            id: f.id,
            q: f.question,
            a: f.answer,
          })
        }
      }
    }

    if (faqs.length === 0) {
      faqs = config.defaultFaqs
    }

    // 6. Next Batch Start Date
    const nextBatchDate = dbCourse?.batches?.[0]?.startDate
      ? new Date(dbCourse.batches[0].startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
      : new Date(Date.now() + 5 * 86400000).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })

    return {
      id: dbCourse?.id || 1,
      slug: categorySlug,
      route: config.route,
      title,
      description,
      categoryName: category?.name || config.defaultTitle,
      totalStudents,
      rating,
      duration: dbCourse?.duration?.trim() || config.defaultDuration,
      startDate: nextBatchDate,
      badge: config.badge,
      badgeColor: config.badgeColor,
      badgeBg: config.badgeBg,
      badgeBorder: config.badgeBorder,
      accent: config.accent,
      accentLight: config.accentLight,
      accentBorder: config.accentBorder,
      accentGlow: config.accentGlow,
      gradient: config.gradient,
      image: config.image,
      pricing: {
        baseFee,
        discount,
        finalFee,
        savingsPercent,
        emiPerMonth,
      },
      curriculum,
      faqs,
      features: [
        { title: 'Job Analysis & Sourcing', desc: 'Master active/passive sourcing, Boolean search, LinkedIn recruiting, and talent pool development.' },
        { title: 'Resume Screening & Selection', desc: 'Screen at scale using automation tools, competency frameworks, and structured decision criteria.' },
        { title: 'Interview Design & Execution', desc: 'Build behavioral, situational, and technical interview blueprints for every role type.' },
        { title: 'Domain-Specific Recruitment', desc: 'Deep-dive into IT, BFSI, Pharma, Healthcare, Manufacturing, and FMCG hiring workflows.' },
        { title: 'Employer Branding & Marketing', desc: 'Craft job descriptions, run email campaigns, and leverage SEO to attract top talent.' },
        { title: 'Metrics, ATS & Career Planning', desc: 'Track KPIs, master modern ATS tools, and prepare your placement profile for the market.' },
      ],
    }
  } catch (error) {
    console.error(`Error loading dynamic course data for ${categorySlug}:`, error)
    return {
      id: 1,
      slug: categorySlug,
      route: config.route,
      title: config.defaultTitle,
      description: 'Master professional recruitment, sourcing, ATS systems, and talent acquisition with industry mentors.',
      categoryName: config.defaultTitle,
      totalStudents: 5000,
      rating: 4.9,
      duration: config.defaultDuration,
      startDate: 'Upcoming Monday',
      badge: config.badge,
      badgeColor: config.badgeColor,
      badgeBg: config.badgeBg,
      badgeBorder: config.badgeBorder,
      accent: config.accent,
      accentLight: config.accentLight,
      accentBorder: config.accentBorder,
      accentGlow: config.accentGlow,
      gradient: config.gradient,
      image: config.image,
      pricing: {
        baseFee: config.defaultFees,
        discount: config.defaultDiscount,
        finalFee: config.defaultFinal,
        savingsPercent: Math.round((config.defaultDiscount / config.defaultFees) * 100),
        emiPerMonth: Math.round(config.defaultFinal / 6),
      },
      curriculum: config.defaultCurriculum,
      faqs: config.defaultFaqs,
      features: [],
    }
  }
}

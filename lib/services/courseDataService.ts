import { prisma } from '@/lib/prisma'

export interface DynamicCurriculumModule {
  id?: number
  week: string
  title: string
  duration?: string
  accent?: string
  description?: string | null
  learningObjectives?: string[]
  details: string[]
  practicalActivity?: string
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
  shortDescription: string
  description: string
  overview: string
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
    online: {
      baseFee: number
      discountPercent: number
      discountAmount: number
      finalFee: number
      emiPerMonth: number
    }
    offline: {
      baseFee: number
      discountPercent: number
      discountAmount: number
      finalFee: number
      emiPerMonth: number
    }
    modeNotes?: string | null
  }
  curriculum: DynamicCurriculumModule[]
  learningOutcomes: string[]
  whoShouldEnroll: Array<{ role: string; desc: string }>
  toolsCovered: Array<{ category: string; tools: string[] }>
  certificationDetails: {
    title: string
    bullets: string[]
  }
  faqs: DynamicFaqItem[]
  lmsStructure: Array<{ week: string; title: string; desc: string }>
  features: Array<{ title: string; desc: string }>
}

export const CANONICAL_COURSE_CONFIGS: Record<string, {
  slugKey: string
  route: string
  aliases: string[]
  defaultTitle: string
  defaultShortDescription: string
  defaultOverview: string
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
  defaultLearningOutcomes: string[]
  defaultWhoShouldEnroll: Array<{ role: string; desc: string }>
  defaultToolsCovered: Array<{ category: string; tools: string[] }>
  defaultCertificationDetails: { title: string; bullets: string[] }
  defaultFaqs: DynamicFaqItem[]
  defaultLmsStructure: Array<{ week: string; title: string; desc: string }>
}> = {
  'for-freshers': {
    slugKey: 'for-freshers',
    route: '/recruitment-career-starter',
    aliases: ['recruitment-career-starter', 'hr-courses-for-beginners', 'certification_tag'],
    defaultTitle: 'Recruitment Career Starter',
    defaultShortDescription: 'Become Job-Ready for Your First Recruitment Job in 4 Weeks. Master candidate sourcing, Boolean search, Job Portal sourcing, structured screening calls, and interview coordination.',
    defaultOverview: 'The Recruitment Career Starter program is specifically engineered for fresh graduates, career switchers, and non-HR professionals seeking a fast, practical pathway into corporate talent acquisition. Over 4 intensive weeks, you will learn the core foundations of recruitment lifecycles, resume parsing, candidate calling, interview coordination, and portal sourcing with dedicated placement support.',
    defaultDuration: '4 Weeks',
    defaultDurationShort: '4 Wk',
    badge: 'Entry Level',
    badgeColor: '#0EA5E9',
    badgeBg: 'rgba(14,165,233,.15)',
    badgeBorder: 'rgba(14,165,233,.35)',
    accent: '#0EA5E9',
    accentLight: '#F0F9FF',
    accentBorder: '#BAE6FD',
    accentGlow: 'rgba(14,165,233,.2)',
    gradient: 'linear-gradient(135deg,#075985,#0EA5E9,#0284C7)',
    image: '/assets/images/about/tab1.jpg',
    defaultFees: 7999,
    defaultDiscount: 3000,
    defaultFinal: 4999,
    defaultCurriculum: [
      {
        week: 'Week 1',
        title: 'Recruitment Fundamentals & Job Analysis',
        duration: 'Week 1',
        accent: '#0EA5E9',
        description: 'Recruitment lifecycle, HR models, job description breakdown, and requirement understanding.',
        learningObjectives: [
          'Understand end-to-end recruitment from job requisition to candidate onboarding.',
          'Differentiate between In-house HR, Staffing Agencies, and RPO models.',
          'Interpret and draft actionable Job Descriptions (JDs) and qualification requirements.',
        ],
        details: [
          'Overview of recruitment lifecycle and corporate HR hierarchy',
          'Understanding Job Descriptions (JDs) and key qualification mapping',
          'In-house TA vs staffing agency recruitment models',
          'Recruiter key metrics: TAT, pipeline volume, and candidate communication',
        ],
        practicalActivity: 'Analyze a live job description and draft a candidate qualification checklist.',
      },
      {
        week: 'Week 2',
        title: 'Candidate Sourcing, Portals & Boolean Search',
        duration: 'Week 2',
        accent: '#2563EB',
        description: 'Hands-on candidate discovery across Job Portals, LinkedIn, and Boolean/X-Ray search engines.',
        learningObjectives: [
          'Master Boolean search operators (AND, OR, NOT, Quotes, Parentheses).',
          'Navigate Job Portal filters, keyword targeting, and candidate search.',
          'Build talent search queries on LinkedIn and Google X-Ray.',
        ],
        details: [
          'Boolean search operators and nested search strings',
          'Job Portal search filters, active candidate targeting, and keywords',
          'LinkedIn talent search: Title filters, locations, and Boolean strings',
          'Building custom candidate pipelines and talent databases',
        ],
        practicalActivity: 'Build 5 complex Boolean search strings for tech and non-tech job profiles.',
      },
      {
        week: 'Week 3',
        title: 'Screening, Calling & Interview Coordination',
        duration: 'Week 3',
        accent: '#059669',
        description: 'First-round candidate screening calls, pitch scripts, salary benchmarking, and schedule management.',
        learningObjectives: [
          'Conduct professional phone screening calls with candidate pitch scripts.',
          'Assess candidate notice period, CTC, expected salary, and location fit.',
          'Manage interview scheduling and candidate communication.',
        ],
        details: [
          'Structured screening calls: Assessing notice period, CTC, and location fit',
          'Objection handling: Notice period buyouts and counter-offers',
          'Interview scheduling, panel management, and candidate prep',
          'Writing recruiter assessment summaries for hiring managers',
        ],
        practicalActivity: 'Simulate a candidate telephone screening call using our standardized assessment script.',
      },
      {
        week: 'Week 4',
        title: 'Practical Project, Resume Building & Mock Interviews',
        duration: 'Week 4',
        accent: '#D97706',
        description: 'End-to-end recruitment capstone assignment, ATS tracking, portfolio creation, and interview mastery.',
        learningObjectives: [
          'Execute a live recruitment search mandate from JD intake to candidate shortlist.',
          'Build an ATS-compliant HR recruiter resume highlighting hands-on tools.',
          'Crack HR recruiter job interviews with mock interview simulations.',
        ],
        details: [
          'Executing a live candidate search mandate from JD to shortlist',
          'Building an ATS-friendly HR recruiter resume with verified credentials',
          'Mock technical & HR interview simulations with industry mentors',
          'Job application strategy and placement assistance support',
        ],
        practicalActivity: 'Complete a live candidate sourcing mandate and participate in a 1-on-1 mock interview.',
      },
    ],
    defaultLearningOutcomes: [
      'Master the complete end-to-end recruitment lifecycle and corporate hiring processes.',
      'Construct advanced Boolean and Google X-Ray search strings to source qualified candidates.',
      'Navigate professional recruitment job portals including top Job Portals and LinkedIn.',
      'Conduct confident telephone screening interviews and assess candidate CTC and notice period.',
      'Manage interview coordination, candidate prep, and hiring manager communications.',
      'Receive an ATS-optimized recruiter resume and portfolio to secure your first HR role.',
    ],
    defaultWhoShouldEnroll: [
      { role: 'Fresh Graduates & Final Year Students', desc: 'Graduates looking for high-growth corporate careers in HR and Talent Acquisition.' },
      { role: 'Career Switchers & Non-HR Professionals', desc: 'Professionals transitioning into recruitment from customer service, sales, or operations.' },
      { role: 'Entry-Level HR Associates', desc: 'Junior HR coordinators seeking structured practical recruitment training.' },
    ],
    defaultToolsCovered: [
      { category: 'Job Portals', tools: ['Job Portals', 'LinkedIn', 'Indeed', 'Foundit'] },
      { category: 'Search Engines', tools: ['Google X-Ray', 'Boolean Search Builders'] },
      { category: 'Productivity', tools: ['MS Excel', 'Google Sheets', 'Canva'] },
    ],
    defaultCertificationDetails: {
      title: 'Certificate of Excellence: Recruitment Career Starter',
      bullets: [
        'Accredited certification with individual QR Code verification.',
        'Lifetime access to practical recruitment templates, calling scripts, and trackers.',
        '100% dedicated placement support, resume review, and interview coaching.',
      ],
    },
    defaultFaqs: [
      { q: 'Is this course suitable for someone with zero HR experience?', a: 'Yes! The Recruitment Career Starter is designed from the ground up for absolute beginners, freshers, and non-HR graduates.' },
      { q: 'What is the course duration and schedule?', a: 'The program spans 4 weeks with weekend live interactive sessions and weekday practical hands-on labs.' },
      { q: 'Do you offer placement assistance?', a: 'Yes, graduates receive 1-on-1 resume building, LinkedIn profile makeover, mock interviews, and direct referral opportunities with hiring partners.' },
      { q: 'Will I get an accredited certificate?', a: 'Yes, upon completing the weekly assignments and final capstone mandate, you will receive a verifiable certificate of completion.' },
    ],
    defaultLmsStructure: [
      { week: 'Week 1', title: 'Recruitment Fundamentals', desc: 'Full lifecycle overview, JD analysis, and candidate persona creation.' },
      { week: 'Week 2', title: 'Candidate Sourcing & Boolean', desc: 'Job Portals, LinkedIn, Boolean search, and talent pool construction.' },
      { week: 'Week 3', title: 'Screening & Coordination', desc: 'Candidate calling, salary screening, notice period, and panel scheduling.' },
      { week: 'Week 4', title: 'Capstone & Placement Prep', desc: 'Live mandate execution, ATS resume drafting, and interview simulations.' },
    ],
  },

  'for-professionals': {
    slugKey: 'for-professionals',
    route: '/professional-recruitment-specialist',
    aliases: ['professional-recruitment-specialist', 'end-to-end-recruitment-training', 'degree_tag'],
    defaultTitle: 'Professional Recruitment Specialist',
    defaultShortDescription: 'Master End-to-End Recruitment With Practical Industry Training. Covers multi-domain sourcing (IT, Non-IT, BFSI), structured STAR interviewing, offer negotiation, MIS analytics, and AI recruitment tools.',
    defaultOverview: 'The Professional Recruitment Specialist program delivers comprehensive, practical grounding in modern recruitment methodologies. You will master multi-channel candidate sourcing across IT, Non-IT, and BFSI sectors, advanced Boolean search strings, structured screening frameworks (STAR method), offer negotiation, candidate dropout mitigation, recruitment MIS analytics, and AI tools.',
    defaultDuration: '8 Weeks',
    defaultDurationShort: '8 Wk',
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
    defaultFees: 24999,
    defaultDiscount: 10000,
    defaultFinal: 14999,
    defaultCurriculum: [
      {
        week: 'Week 1–2',
        title: 'Full-Lifecycle Recruitment Mastery & Intake Frameworks',
        duration: '2 Weeks',
        accent: '#DC2626',
        description: 'Advanced stakeholder intake meetings, competency frameworks, talent mapping, and market intelligence.',
        learningObjectives: [
          'Conduct structured intake sessions with hiring managers and corporate clients.',
          'Map technical and functional competency frameworks.',
          'Design conversion-focused recruitment funnels and SLAs.',
        ],
        details: [
          'Conducting structured intake sessions with hiring managers & clients',
          'Competency-based job profiling and skill architecture mapping',
          'Recruitment funnel design: Top-of-funnel volume vs conversion velocity',
          'Full statutory compliance & legal fundamentals in hiring',
        ],
        practicalActivity: 'Conduct a simulated stakeholder intake meeting and build a complete requisition brief.',
      },
      {
        week: 'Week 3–4',
        title: 'Multi-Domain Sourcing & Advanced Boolean/X-Ray Search',
        duration: '2 Weeks',
        accent: '#EA580C',
        description: 'Deep-web sourcing, GitHub/StackOverflow tech recruiting, niche headhunting, and X-Ray search.',
        learningObjectives: [
          'Master IT recruitment tech stacks: Frontend, Backend, DevOps, Cloud, AI.',
          'Execute Non-IT, BFSI, Sales, and Operations recruitment mandates.',
          'Deploy Google X-Ray, GitHub, and LinkedIn Recruiter search strings.',
        ],
        details: [
          'Advanced Boolean logic: Nested expressions, site search, and filetype targeting',
          'IT Recruitment: Tech stack identification (Frontend, Backend, DevOps, Cloud, AI)',
          'Non-IT & BFSI Hiring: Sales, operations, finance, and engineering profiles',
          'Direct passive talent outreach via personalized InMails and cold emails',
        ],
        practicalActivity: 'Source 15 qualified candidate profiles for a Senior Full-Stack Engineer and a BFSI Branch Head.',
      },
      {
        week: 'Week 5–6',
        title: 'Structured Interviewing, Offer Management & Pre-Boarding',
        duration: '2 Weeks',
        accent: '#2563EB',
        description: 'Behavioral interviewing (STAR method), salary negotiation, offer generation, and dropout mitigation.',
        learningObjectives: [
          'Conduct structured competency interviews using the STAR method.',
          'Structure CTC components, fixed/variable payouts, and compensation benchmarking.',
          'Implement post-offer engagement protocols to minimize candidate dropouts.',
        ],
        details: [
          'Conducting competency & behavioral interviews with structured rubrics',
          'CTC breakdown: Fixed, variable, ESOPs, perks, and market benchmarking',
          'Counter-offer management and pre-joining candidate engagement protocols',
          'Mitigating early attrition and building candidate loyalty',
        ],
        practicalActivity: 'Negotiate salary terms with a candidate holding multiple offers and design a 30-day pre-boarding engagement plan.',
      },
      {
        week: 'Week 7–8',
        title: 'Recruitment Analytics, AI Sourcing Tools & Live Mandates',
        duration: '2 Weeks',
        accent: '#059669',
        description: 'ATS management, AI-assisted recruiter workflows, weekly MIS dashboards, and final capstone.',
        learningObjectives: [
          'Automate recruiter workflows using generative AI and modern ATS platforms.',
          'Calculate and track Time-to-Fill, Cost-per-Hire, and Quality-of-Hire metrics.',
          'Build automated executive recruitment MIS dashboards in Excel and Google Sheets.',
        ],
        details: [
          'AI tools for recruiters: ChatGPT prompts, JD drafting, and automated outreach',
          'Recruitment KPIs: Time-to-Fill, Cost-per-Hire, Quality-of-Hire, Offer-to-Join Ratio',
          'Building real-time executive recruitment MIS dashboards in Excel & Google Sheets',
          'Live recruitment project: Delivering closed profiles for verified mandates',
        ],
        practicalActivity: 'Build a live executive recruitment dashboard tracking 5 active client mandates from sourcing to offer acceptance.',
      },
    ],
    defaultLearningOutcomes: [
      'Master end-to-end recruitment execution across IT, Non-IT, BFSI, and Healthcare domains.',
      'Source high-caliber passive candidates via advanced Boolean search, X-Ray, and GitHub.',
      'Conduct competency-based behavioral interviews using the structured STAR framework.',
      'Negotiate complex compensation packages, manage counter-offers, and eliminate dropouts.',
      'Track recruitment metrics (TAT, Cost-per-Hire, Quality-of-Hire) on automated MIS dashboards.',
      'Leverage AI tools and ATS platforms to increase sourcing speed and closure velocity 3x.',
    ],
    defaultWhoShouldEnroll: [
      { role: 'Recruiters & HR Executives (0–3 Years)', desc: 'Practitioners wanting to master multi-domain hiring and high-ticket candidate closures.' },
      { role: 'Staffing & Agency Consultants', desc: 'Recruitment consultants aiming to increase billing and closure rates.' },
      { role: 'Generalist HR Professionals', desc: 'HR generalists looking to specialize in high-demand Talent Acquisition.' },
    ],
    defaultToolsCovered: [
      { category: 'Applicant Tracking Systems', tools: ['Zoho Recruit', 'Greenhouse', 'Ceipal', 'Freshteam'] },
      { category: 'Sourcing & Search', tools: ['LinkedIn Recruiter', 'Job Portals', 'GitHub', 'Google X-Ray'] },
      { category: 'AI & Analytics', tools: ['ChatGPT for TA', 'MS Excel Advanced MIS', 'Google Looker Studio'] },
    ],
    defaultCertificationDetails: {
      title: 'Certified Professional Recruitment Specialist (CPRS)',
      bullets: [
        'ISO-accredited certificate with verifiable QR Code authentication.',
        'Lifetime access to complete recruitment templates, negotiation scripts, and MIS trackers.',
        'Direct career placement and interview opportunities with leading recruitment partners.',
      ],
    },
    defaultFaqs: [
      { q: 'Who is the Professional Recruitment Specialist course for?', a: 'It is tailored for recruiters with 0–3 years of experience, HR executives, and talent advisors looking to master IT, BFSI, and niche recruitment.' },
      { q: 'How long is the program?', a: 'The program runs for 8 weeks (2 months) with weekend live classes, practical weekday case studies, and lifetime LMS access.' },
      { q: 'Do you cover AI tools for recruiters?', a: 'Yes! You will learn how to leverage generative AI, ChatGPT, automated Boolean builders, and modern ATS platforms to 3x your sourcing speed.' },
      { q: 'What is the certification issued?', a: 'You receive an ISO-accredited Professional Recruitment Specialist certificate with a unique QR code for LinkedIn and resume verification.' },
    ],
    defaultLmsStructure: [
      { week: 'Week 1–2', title: 'Recruitment Lifecycle & Intake', desc: 'Competency frameworks, stakeholder intake, and requisition briefs.' },
      { week: 'Week 3–4', title: 'Multi-Domain Sourcing & Boolean', desc: 'IT/Non-IT sourcing, GitHub, X-Ray, and passive candidate outreach.' },
      { week: 'Week 5–6', title: 'Interviewing & Offer Negotiation', desc: 'STAR interviewing, CTC benchmarking, and counter-offer management.' },
      { week: 'Week 7–8', title: 'MIS Dashboards, AI & Capstone', desc: 'AI tools for recruiters, executive MIS dashboards, and live project submission.' },
    ],
  },

  'senior-professionals': {
    slugKey: 'senior-professionals',
    route: '/advanced-recruitment-ta-masterclass',
    aliases: ['advanced-recruitment-ta-masterclass'],
    defaultTitle: 'Advanced Recruitment & TA Masterclass',
    defaultShortDescription: 'Upgrade From Recruiter to Strategic Talent Acquisition Professional. Master strategic workforce planning, TA metrics, executive search, employer branding, and recruiter team leadership.',
    defaultOverview: 'A high-impact executive program designed for senior recruiters, TA leads, and HR managers. Transition from tactical transactional recruiting to high-value strategic talent partnership. Master workforce forecasting, hiring manager alignment, executive C-suite search, TA budget optimization, employer branding, and AI automated pipelines.',
    defaultDuration: '6 Weeks',
    defaultDurationShort: '6 Wk',
    badge: 'Executive Level',
    badgeColor: '#7C3AED',
    badgeBg: 'rgba(124,58,237,.15)',
    badgeBorder: 'rgba(124,58,237,.35)',
    accent: '#7C3AED',
    accentLight: '#F5F3FF',
    accentBorder: '#DDD6FE',
    accentGlow: 'rgba(124,58,237,.2)',
    gradient: 'linear-gradient(135deg,#3B0764,#7C3AED,#6D28D9)',
    image: '/assets/images/courses/home14/3.jpg',
    defaultFees: 29999,
    defaultDiscount: 10000,
    defaultFinal: 19999,
    defaultCurriculum: [
      {
        week: 'Week 1–2',
        title: 'Strategic Talent Acquisition & Workforce Forecasting',
        duration: '2 Weeks',
        accent: '#7C3AED',
        description: 'Aligning talent acquisition strategy with business goals, capacity models, and hiring manager alignment.',
        learningObjectives: [
          'Transition from tactical recruiter to strategic talent acquisition partner.',
          'Build headcount forecasting models and recruiter capacity plans.',
          'Manage senior business leaders and establish operational SLAs.',
        ],
        details: [
          'Transitioning from tactical recruiter to strategic talent partner',
          'Workforce planning, headcount forecasting, and capacity modeling',
          'Managing executive hiring managers and setting SLAs',
          'Recruitment budget allocation and vendor/consultant management',
        ],
        practicalActivity: 'Develop a 12-month headcount capacity and hiring budget model for an enterprise organization.',
      },
      {
        week: 'Week 3–4',
        title: 'Advanced Metrics, Dashboards & Executive Search',
        duration: '2 Weeks',
        accent: '#2563EB',
        description: 'Designing board-level TA dashboards, calculating Cost/Time/Quality of Hire, and C-suite headhunting.',
        learningObjectives: [
          'Design automated executive TA analytics dashboards in PowerBI / Looker.',
          'Execute confidential C-suite executive search and headhunting mandates.',
          'Balance high-volume campus hiring with niche leadership recruitment.',
        ],
        details: [
          'Core TA analytics: Funnel conversion, offer acceptance ratios, and sourcing channel ROI',
          'Building automated PowerBI / Google Looker Studio executive TA dashboards',
          'Executive search & headhunting: Confidential mandates, mapping, and board hiring',
          'Managing bulk campus hiring drives vs niche leadership recruitment',
        ],
        practicalActivity: 'Design an interactive PowerBI executive TA dashboard with channel ROI metrics.',
      },
      {
        week: 'Week 5–6',
        title: 'Employer Branding, Recruiter Productivity & AI Automation',
        duration: '2 Weeks',
        accent: '#059669',
        description: 'Employer value proposition (EVP), team performance management, advanced ATS integrations, and AI.',
        learningObjectives: [
          'Architect a compelling Employer Value Proposition (EVP) and talent community.',
          'Manage recruiter team productivity, KPI scorecards, and incentive schemes.',
          'Automate end-to-end talent acquisition pipelines using AI workflows.',
        ],
        details: [
          'Building an attractive Employer Value Proposition (EVP) and talent community',
          'Managing recruiter team productivity, incentive models, and KPIs',
          'Enterprise ATS stack evaluation: Workday, Greenhouse, Lever, and Zoho Recruit',
          'Automating end-to-end recruitment pipelines with AI and workflow triggers',
        ],
        practicalActivity: 'Draft an enterprise EVP framework and recruiter incentive scorecard.',
      },
    ],
    defaultLearningOutcomes: [
      'Lead talent acquisition teams and align recruitment operations with board-level business goals.',
      'Build predictive headcount forecasting and recruiter capacity planning models.',
      'Construct real-time executive TA dashboards measuring Channel ROI, Quality-of-Hire, and Velocity.',
      'Execute confidential leadership and executive search headhunting assignments.',
      'Design attractive Employer Branding campaigns to attract high-caliber passive candidates.',
      'Optimize recruitment budgets, vendor empanelment agreements, and enterprise ATS workflows.',
    ],
    defaultWhoShouldEnroll: [
      { role: 'Senior Recruiters & TA Leads (3–10+ Years)', desc: 'Practitioners aiming to step up into TA Manager, Head of Talent, or HR Business Partner roles.' },
      { role: 'HR Managers & Generalists', desc: 'HR professionals responsible for leading organizational recruitment strategy.' },
      { role: 'Senior Agency Account Managers', desc: 'Agency leaders managing large client portfolios and recruiting teams.' },
    ],
    defaultToolsCovered: [
      { category: 'Enterprise ATS', tools: ['Workday', 'Greenhouse', 'SuccessFactors', 'Lever'] },
      { category: 'Executive Sourcing', tools: ['LinkedIn Talent Insights', 'ExecuNet', 'Board Search'] },
      { category: 'Analytics', tools: ['PowerBI', 'Google Looker Studio', 'Advanced Excel Modeling'] },
    ],
    defaultCertificationDetails: {
      title: 'Executive Master Certificate in Strategic Talent Acquisition',
      bullets: [
        'Accredited executive credential with QR Code verification.',
        'Access to complete TA leadership frameworks, capacity models, and vendor contracts.',
        'Exclusive executive alumni networking community and leadership mastermind sessions.',
      ],
    },
    defaultFaqs: [
      { q: 'Is this program suitable for TA Leads and Managers?', a: 'Yes! It is specifically created for professionals with 3+ years of experience who want to lead talent acquisition teams and drive strategy.' },
      { q: 'What is the duration?', a: '6 intensive weeks with executive weekend masterclasses and strategic leadership workshops.' },
      { q: 'Are there live case studies?', a: 'Yes, you will work on real-world leadership hiring mandates, budget forecasting models, and executive dashboard implementations.' },
    ],
    defaultLmsStructure: [
      { week: 'Week 1–2', title: 'Strategic TA & Workforce Planning', desc: 'Headcount forecasting, SLA alignment, and stakeholder management.' },
      { week: 'Week 3–4', title: 'Executive TA Metrics & Search', desc: 'Executive search, confidential mandates, and PowerBI dashboards.' },
      { week: 'Week 5–6', title: 'EVP, Team KPIs & Automation', desc: 'Employer branding, recruiter incentive plans, and automated AI pipelines.' },
    ],
  },

  'entrepreneurship': {
    slugKey: 'entrepreneurship',
    route: '/recruitment-business-accelerator',
    aliases: ['recruitment-business-accelerator', 'hr-entrepreneurship-program', 'become-an-entrepreneur', 'entrepreneur_tag'],
    defaultTitle: 'Recruitment Business Accelerator',
    defaultShortDescription: "Don't Just Become a Recruiter. Build Your Recruitment Business. Launch, monetize, and scale your own profitable recruitment agency or HR consultancy firm in 8 weeks.",
    defaultOverview: 'The definitive blueprint for launching, monetizing, and scaling your own profitable recruitment agency or HR consultancy. Learn how to select high-margin niches, structure legal MSME/GST contracts, acquire enterprise corporate clients, manage contingency and retainer commercials, hire recruiters, and scale past ₹1 Crore ARR.',
    defaultDuration: '8 Weeks',
    defaultDurationShort: '8 Wk',
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
    defaultFees: 49999,
    defaultDiscount: 20000,
    defaultFinal: 29999,
    defaultCurriculum: [
      {
        week: 'Week 1',
        title: 'Business Model, Niche Selection & Agency Positioning',
        duration: 'Week 1',
        accent: '#D97706',
        description: 'Recruitment vs staffing vs RPO, finding high-margin niches, and defining your value proposition.',
        learningObjectives: ['Select your profitable high-margin recruitment niche.', 'Structure pricing and revenue models (8.33% to 20%).'],
        details: ['Agency business models: Contingency vs Retained vs RPO', 'Selecting high-margin niches (Tech, BFSI, Healthcare)', 'Target client profiling and rate card structuring'],
        practicalActivity: 'Draft your agency value proposition and commercial rate card.',
      },
      {
        week: 'Week 2',
        title: 'Legal Setup, Commercial Contracts & Terms of Business',
        duration: 'Week 2',
        accent: '#B45309',
        description: 'GST, MSME, NDA, SLA agreements, non-compete clauses, and risk mitigation frameworks.',
        learningObjectives: ['Incorporate your company and set up legal agreements.', 'Draft Master Services Agreements (MSAs) and payment terms.'],
        details: ['Sole Proprietorship, LLP, or Pvt Ltd incorporation', 'Drafting client service agreements (SLA) & replacement clauses', 'Setting up banking, invoicing, and tax accounting'],
        practicalActivity: 'Customize your Master Service Agreement (MSA) and client pitch deck.',
      },
      {
        week: 'Week 3',
        title: 'Agency Infrastructure, ATS & Sourcing Operations',
        duration: 'Week 3',
        accent: '#059669',
        description: 'Building lean tech stacks, multi-portal access, database management, and standard SOPs.',
        learningObjectives: ['Deploy an agency-grade ATS and candidate database.', 'Establish Standard Operating Procedures (SOPs).'],
        details: ['Setting up Zoho Recruit or Ceipal ATS', 'Cost-effective portal subscription strategies', 'Standard Operating Procedures for candidate fulfillment'],
        practicalActivity: 'Configure your agency ATS pipeline and candidate submission template.',
      },
      {
        week: 'Week 4',
        title: 'B2B Client Acquisition & Outbound Sales Engine',
        duration: 'Week 4',
        accent: '#2563EB',
        description: 'LinkedIn prospecting, cold email sequences, HR head calling scripts, and pitch meetings.',
        learningObjectives: ['Generate predictable B2B corporate client leads on LinkedIn.', 'Run high-converting cold email and calling outreach campaigns.'],
        details: ['LinkedIn prospecting and outreach for CHROs/Founders', 'Cold email sequences with 40%+ open rates', 'B2B sales call scripts and discovery meeting framework'],
        practicalActivity: 'Launch a live outbound campaign to 50 targeted corporate HR leaders.',
      },
      {
        week: 'Week 5',
        title: 'Closing Clients & Commercial Contract Negotiation',
        duration: 'Week 5',
        accent: '#7C3AED',
        description: 'Negotiating placement percentages, credit periods, retainer models, and exclusivity.',
        learningObjectives: ['Negotiate and sign commercial contracts with corporate clients.', 'Win exclusive and retained search mandates.'],
        details: ['Negotiating commercial fee terms (8.33% to 15%+)', 'Winning exclusive search mandates and upfront retainers', 'Signing and executing Master Services Agreements'],
        practicalActivity: 'Role-play a commercial fee negotiation call with an enterprise client.',
      },
      {
        week: 'Week 6',
        title: 'Fulfillment Engine, Delivery & Cash Collections',
        duration: 'Week 6',
        accent: '#DC2626',
        description: 'Shortlisting frameworks, client submission decks, feedback turnaround, and invoice collection.',
        learningObjectives: ['Deliver candidate shortlists in under 48 hours.', 'Collect invoices rapidly and minimize payment delays.'],
        details: ['High-velocity candidate delivery protocols', 'Managing candidate offer-to-joining to avoid dropouts', 'Invoice dispatch workflows and rapid receivables collection'],
        practicalActivity: 'Prepare a 3-candidate submission deck and simulated invoice follow-up schedule.',
      },
      {
        week: 'Week 7',
        title: 'Hiring Recruiters, Team Structure & AI Automation',
        duration: 'Week 7',
        accent: '#0EA5E9',
        description: 'Hiring freelance vs full-time recruiters, incentive structures, and AI agency tools.',
        learningObjectives: ['Hire and manage your first team of recruiters.', 'Design commission structures that drive monthly revenue.'],
        details: ['Hiring freelance and full-time recruiters', 'Recruiter incentive models and daily KPI scorecards', 'Deploying AI copilots to multiply team output'],
        practicalActivity: 'Draft a recruiter job description and performance incentive plan.',
      },
      {
        week: 'Week 8',
        title: 'Financial Management, Working Capital & Scaling to ₹1 Cr+',
        duration: 'Week 8',
        accent: '#059669',
        description: 'Cash flow forecasting, working capital, invoice discounting, and 12-month agency roadmap.',
        learningObjectives: ['Manage agency cash flow and working capital.', 'Execute a 12-month scaling roadmap to cross ₹1 Cr ARR.'],
        details: ['Managing receivables, GST liability, and operating expenses', 'Invoice discounting and working capital finance', '12-month scaling roadmap: Solo recruiter to multi-member agency'],
        practicalActivity: 'Build your agency 12-month financial revenue and cash flow model.',
      },
    ],
    defaultLearningOutcomes: [
      'Incorporate and legally set up a high-margin recruitment or staffing agency in India.',
      'Draft ironclad client service agreements (MSAs), NDA terms, and commercial rate cards.',
      'Generate corporate client leads using automated LinkedIn prospecting and cold email sequences.',
      'Negotiate favorable recruitment fees (8.33% to 15%+) and win exclusive client mandates.',
      'Deploy modern agency ATS infrastructure and Standard Operating Procedures (SOPs).',
      'Hire, train, and manage freelance/full-time recruiters with high-performing incentive plans.',
      'Scale your recruitment business to ₹1 Crore+ in annual revenue with healthy cash flows.',
    ],
    defaultWhoShouldEnroll: [
      { role: 'Aspiring Recruitment Agency Founders', desc: 'Recruiters and professionals ready to start their own independent recruitment firm.' },
      { role: 'Freelance Recruiters', desc: 'Solo consultants wanting to scale into a structured multi-client agency.' },
      { role: 'HR Consultants & Trainers', desc: 'HR practitioners looking to add high-ticket placement and staffing services.' },
    ],
    defaultToolsCovered: [
      { category: 'Agency ATS', tools: ['Zoho Recruit', 'Ceipal', 'Recruit CRM'] },
      { category: 'B2B Sales & Outreach', tools: ['Apollo.io', 'LinkedIn Sales Navigator', 'Hunter.io', 'Instantly'] },
      { category: 'Billing & Legal', tools: ['Zoho Books', 'DocuSign', 'GST Portal'] },
    ],
    defaultCertificationDetails: {
      title: 'Certified Recruitment Business Entrepreneur (CRBE)',
      bullets: [
        'Accredited certification with individual QR Code verification.',
        'Complete repository of ready-to-use MSAs, client contracts, cold email scripts, and rate cards.',
        'Ongoing agency founder mastermind community and 1-on-1 discovery mentorship.',
      ],
    },
    defaultFaqs: [
      { q: 'Can I start a recruitment agency alongside a full-time job?', a: 'Yes, many of our successful agency founders started as solo part-time consultants before transitioning full-time once they closed their first 2–3 clients.' },
      { q: 'Do you provide ready-to-use agency templates?', a: 'Yes! You receive complete Master Services Agreements (MSAs), fee agreements, NDA templates, recruiter calling scripts, and pitch decks.' },
      { q: 'What is the duration?', a: '8 weeks of hands-on business building, client acquisition training, and 1-on-1 mentorship.' },
      { q: 'Will I learn how to acquire real corporate clients?', a: 'Yes! Over 50% of the program focuses on practical B2B client acquisition, LinkedIn outreach, cold pitching, and closing hiring mandates.' },
    ],
    defaultLmsStructure: [
      { week: 'Week 1', title: 'Agency Business Model', desc: 'Niche selection, business models, and value proposition.' },
      { week: 'Week 2', title: 'Legal & Commercial Setup', desc: 'Incorporation, GST/MSME, contracts, and terms of business.' },
      { week: 'Week 3', title: 'Agency Tech & ATS', desc: 'ATS deployment, portal access, and recruitment SOPs.' },
      { week: 'Week 4', title: 'B2B Client Acquisition', desc: 'LinkedIn prospecting, cold outreach, and pitch scripts.' },
      { week: 'Week 5', title: 'Contract Negotiation', desc: 'Commercial negotiation, retainers, and signing MSAs.' },
      { week: 'Week 6', title: 'Delivery & Collections', desc: 'Candidate delivery, offer management, and invoice collections.' },
      { week: 'Week 7', title: 'Hiring Recruiters', desc: 'Team structure, commission models, and AI automation.' },
      { week: 'Week 8', title: 'Scaling to ₹1 Cr+', desc: 'Working capital, cash flow, and 12-month scaling roadmap.' },
    ],
  },

  'business-consulting': {
    slugKey: 'business-consulting',
    route: '/recruitment-business-growth-consulting',
    aliases: ['recruitment-business-growth-consulting'],
    defaultTitle: 'Recruitment Business Growth Consulting',
    defaultShortDescription: 'Build, Acquire Clients, Deliver, Collect and Scale. Exclusive 1-on-1 strategic growth consulting and operational advisory for existing recruitment agency founders.',
    defaultOverview: 'An exclusive 1-on-1 bespoke advisory and growth consulting engagement for established recruitment agency owners. We audit your existing sales pipeline, restructure fulfillment operations, optimize commercials, automate ATS workflows, and build an aggressive 12-month roadmap to scale past ₹1 Crore ARR.',
    defaultDuration: '3 Months',
    defaultDurationShort: '3 Mo',
    badge: '1-to-1 Advisory',
    badgeColor: '#059669',
    badgeBg: 'rgba(5,150,105,.15)',
    badgeBorder: 'rgba(5,150,105,.35)',
    accent: '#059669',
    accentLight: '#F0FDF4',
    accentBorder: '#BBF7D0',
    accentGlow: 'rgba(5,150,105,.2)',
    gradient: 'linear-gradient(135deg,#064E3B,#059669,#047857)',
    image: '/assets/images/courses/home14/4.jpg',
    defaultFees: 99999,
    defaultDiscount: 40000,
    defaultFinal: 59999,
    defaultCurriculum: [
      {
        week: 'Month 1',
        title: 'Agency Diagnostics & Commercial Restructuring',
        duration: 'Month 1',
        accent: '#059669',
        description: 'Comprehensive audit of margins, client concentration, team output, and contract terms.',
        learningObjectives: ['Audit and restructure existing client accounts for maximum profitability.', 'Renegotiate legacy terms into retainer and exclusive search models.'],
        details: [
          'Auditing existing client portfolio: Identifying low-margin vs high-yield accounts',
          'Renegotiating legacy terms and introducing retainer/exclusive search models',
          'Restructuring recruiter KPI scorecards and incentive plans',
        ],
        practicalActivity: 'Complete a full commercial and operational audit of your existing agency accounts.',
      },
      {
        week: 'Month 2',
        title: 'Outbound Client Acquisition Engine & High-Ticket Mandates',
        duration: 'Month 2',
        accent: '#2563EB',
        description: 'Implementing high-ticket enterprise client acquisition funnels and executive networking.',
        learningObjectives: ['Deploy automated multichannel outbound client acquisition funnels.', 'Secure high-margin C-suite and leadership retained mandates.'],
        details: [
          'Deploying multichannel automated B2B client acquisition campaigns',
          'Positioning for leadership and C-suite retained search mandates',
          'Building strategic corporate vendor empanelment channels',
        ],
        practicalActivity: 'Launch a high-ticket enterprise client acquisition funnel for your agency.',
      },
      {
        week: 'Month 3',
        title: 'Operational Automation, Cash Flow & Multi-Branch Scaling',
        duration: 'Month 3',
        accent: '#7C3AED',
        description: 'Systematizing fulfillment, automated billing, working capital finance, and expansion.',
        learningObjectives: ['Automate agency ATS and billing operations.', 'Reduce DSO (debtor days) under 30 days and scale recruiter headcount.'],
        details: [
          'Automating recruitment operations and ATS reporting workflows',
          'Working capital optimization and reducing debtor days (DSO) under 30 days',
          'Executive hiring for agency team leads and branch expansion plan',
        ],
        practicalActivity: 'Finalize your 12-month agency revenue expansion and financial scaling roadmap.',
      },
    ],
    defaultLearningOutcomes: [
      'Restructure legacy agency client contracts to secure retainers and 15%+ commercial terms.',
      'Deploy scalable outbound B2B sales pipelines to acquire 5–10 new enterprise clients quarterly.',
      'Automate fulfillment workflows to increase individual recruiter monthly billing 2x.',
      'Systematize receivables collection and reduce invoice realization time under 30 days.',
      'Build a self-managing agency team structure with experienced recruitment team leads.',
    ],
    defaultWhoShouldEnroll: [
      { role: 'Existing Recruitment Agency Owners', desc: 'Founders running registered agencies wanting to scale revenue and build systems.' },
      { role: 'Staffing Firm Managing Partners', desc: 'Partners looking to optimize cash flows, client contracts, and team productivity.' },
    ],
    defaultToolsCovered: [
      { category: 'Enterprise Sourcing', tools: ['LinkedIn Recruiter Enterprise', 'Sales Navigator'] },
      { category: 'Agency CRM', tools: ['Recruit CRM', 'Zoho Recruit Enterprise'] },
      { category: 'Finance', tools: ['Working Capital Finance Models', 'QuickBooks / Zoho Books'] },
    ],
    defaultCertificationDetails: {
      title: 'Certified Agency Growth Partner',
      bullets: [
        'Official Growth Partnership certificate and executive endorsement.',
        'Direct quarterly business reviews with master recruitment consultants.',
        'Priority access to institutional co-brokering and mandate sharing networks.',
      ],
    },
    defaultFaqs: [
      { q: 'Who is this consulting program for?', a: 'It is tailored for agency founders who already have registered recruitment companies and want 1-on-1 advisory to scale revenue and build systems.' },
      { q: 'Is it group training or 1-on-1 advisory?', a: 'It is a 1-to-1 personalized consulting engagement directly with senior industry advisors.' },
      { q: 'What is the engagement timeline?', a: '3 months of structured weekly advisory sessions, pipeline audits, and execution support.' },
    ],
    defaultLmsStructure: [
      { week: 'Month 1', title: 'Commercial Audit & Restructuring', desc: 'Margin optimization, contract renegotiation, and recruiter KPI overhauls.' },
      { week: 'Month 2', title: 'High-Ticket Client Acquisition', desc: 'Outbound sales engine, executive retained search, and enterprise vendor empanelment.' },
      { week: 'Month 3', title: 'Systematization & Scale', desc: 'Fulfillment automation, cash flow optimization, and 12-month expansion roadmap.' },
    ],
  },

  'corporate': {
    slugKey: 'corporate',
    route: '/corporate-recruitment-training',
    aliases: ['corporate-recruitment-training', 'hr-corporate-training-course', 'corporate_traning_tag'],
    defaultTitle: 'Corporate Recruitment Training',
    defaultShortDescription: 'Practical Recruitment Training Designed Around Your Hiring Requirements. Tailored capability programs for enterprise HR departments, TA teams, and hiring managers.',
    defaultOverview: 'Customized corporate talent acquisition capability programs built specifically for enterprise HR teams and hiring managers. Upskill your in-house recruiters in modern passive sourcing, tech hiring, structured STAR interviewing, diversity hiring, employer branding, and AI productivity tools.',
    defaultDuration: 'Flexible (2–6 Weeks)',
    defaultDurationShort: 'Custom',
    badge: 'Enterprise',
    badgeColor: '#7C3AED',
    badgeBg: 'rgba(124,58,237,.15)',
    badgeBorder: 'rgba(124,58,237,.35)',
    accent: '#7C3AED',
    accentLight: '#F5F3FF',
    accentBorder: '#DDD6FE',
    accentGlow: 'rgba(124,58,237,.2)',
    gradient: 'linear-gradient(135deg,#3B0764,#7C3AED,#6D28D9)',
    image: '/assets/images/courses/home14/2.jpg',
    defaultFees: 25000,
    defaultDiscount: 0,
    defaultFinal: 25000,
    defaultCurriculum: [
      {
        week: 'Module 1',
        title: 'Custom In-House Sourcing & Boolean Mastery',
        duration: 'Module 1',
        accent: '#7C3AED',
        description: 'Tailored sourcing frameworks for your industry (Tech, Non-IT, BFSI, Manufacturing).',
        learningObjectives: ['Source high-caliber passive candidates directly without high agency spend.', 'Master industry-specific Boolean and X-Ray search operators.'],
        details: [
          'Multi-channel passive candidate sourcing for enterprise hiring needs',
          'Advanced Boolean logic tailored to company-specific target profiles',
          'Optimizing recruiter outreach and reducing agency dependency',
        ],
        practicalActivity: 'Build a customized talent sourcing pipeline for your top 3 open company requisitions.',
      },
      {
        week: 'Module 2',
        title: 'Structured Interviewing & Hiring Manager Alignment',
        duration: 'Module 2',
        accent: '#2563EB',
        description: 'Equipping hiring managers and TA teams with standardized evaluation rubrics.',
        learningObjectives: ['Standardize evaluation criteria across all interview panels.', 'Eliminate bias and accelerate time-to-hire.'],
        details: [
          'Competency-based behavioral interviewing techniques (STAR methodology)',
          'Eliminating unconscious bias in evaluation and candidate selection',
          'Streamlining hiring manager feedback loops to accelerate time-to-hire',
        ],
        practicalActivity: 'Design a competency rubric and structured question guide for your hiring managers.',
      },
      {
        week: 'Module 3',
        title: 'Employer Branding, Candidate Experience & AI Tools',
        duration: 'Module 3',
        accent: '#059669',
        description: 'Enhancing the candidate journey, offer acceptance rates, and AI efficiency.',
        learningObjectives: ['Deploy AI productivity tools to accelerate screening and outreach.', 'Measure internal TA metrics and improve candidate experience.'],
        details: [
          'Building a standout candidate experience from application to onboarding',
          'Deploying AI tools for JD writing, outreach personalization, and interview notes',
          'Measuring and optimizing internal recruitment KPIs (TAT, Cost per Hire, Quality of Hire)',
        ],
        practicalActivity: 'Create an automated recruiter workflow and candidate journey audit for your company.',
      },
    ],
    defaultLearningOutcomes: [
      'Reduce third-party agency dependency by strengthening internal direct sourcing capabilities.',
      'Train hiring managers in structured competency interviewing using the STAR method.',
      'Improve offer-to-joining ratios through structured pre-boarding engagement protocols.',
      'Deploy AI sourcing copilots to automate JD drafting and candidate communications.',
      'Track recruitment performance metrics on centralized executive dashboards.',
    ],
    defaultWhoShouldEnroll: [
      { role: 'Enterprise Talent Acquisition Teams', desc: 'In-house recruitment teams seeking to master modern direct sourcing and speed up TAT.' },
      { role: 'Hiring Managers & Engineering Leads', desc: 'Panel interviewers looking to conduct structured, unbiased competency assessments.' },
      { role: 'CHROs & Heads of HR', desc: 'HR leaders seeking to upskill their entire talent acquisition division.' },
    ],
    defaultToolsCovered: [
      { category: 'Enterprise ATS', tools: ['Workday', 'SuccessFactors', 'Greenhouse', 'Zoho Recruit'] },
      { category: 'Talent Sourcing', tools: ['LinkedIn Recruiter Enterprise', 'Google X-Ray'] },
      { category: 'Assessment & Analytics', tools: ['PowerBI', 'HackerRank', 'SHL'] },
    ],
    defaultCertificationDetails: {
      title: 'Corporate Certificate in Strategic Talent Acquisition Operations',
      bullets: [
        'Company-branded digital certificates with individual QR Code verification.',
        'Permanent access to corporate workshop recordings and editable hiring kits.',
        '60-day post-training implementation review and metric audit.',
      ],
    },
    defaultFaqs: [
      { q: 'Can the corporate curriculum be customized for our specific industry?', a: 'Yes! All case studies, sourcing drills, and scorecards are tailored specifically to your industry sector (e.g., IT, Manufacturing, BFSI, Healthcare).' },
      { q: 'Is training conducted on-site or virtually?', a: 'We offer flexible delivery options: interactive on-premise workshops at your corporate facility or live virtual masterclasses.' },
      { q: 'How do we request a proposal?', a: 'Click Request Corporate Proposal or contact us directly at support@recruitmentinstitute.in / +91 7385204165.' },
    ],
    defaultLmsStructure: [
      { week: 'Module 1', title: 'Direct Sourcing & Boolean', desc: 'Passive talent discovery, advanced Boolean search, and reducing agency reliance.' },
      { week: 'Module 2', title: 'STAR Interviewing & Scorecards', desc: 'Competency evaluation rubrics, manager workshops, and bias reduction.' },
      { week: 'Module 3', title: 'EVP, Metrics & AI Tools', desc: 'Candidate experience, AI recruitment tools, and executive TA analytics.' },
    ],
  },
  'ai-for-recruitment': {
    slugKey: 'ai-for-recruitment',
    route: '/ai-for-recruitment',
    aliases: ['ai-for-recruitment', 'ai-and-future-skills', 'ai-recruitment'],
    defaultTitle: 'AI for Recruitment',
    defaultShortDescription: 'Master AI-Powered Recruitment & Talent Acquisition. From Job Description to Joining — Build Your AI-Powered Recruitment Workflow with Generative AI, automation, and prompt engineering.',
    defaultOverview: 'Recruiters today are expected to source faster, screen better, communicate effectively and manage more hiring requirements with less time. AI for Recruitment is a practical, hands-on program designed for recruiters, HR professionals, talent acquisition teams and recruitment entrepreneurs to integrate AI into their everyday recruitment workflow. This is NOT a coding course. Participants will learn how to practically use AI tools for Job Description creation, Candidate Persona, Boolean & X-Ray search, Resume screening, Candidate matching, Communication, Interviewing, Recruitment MIS, Employer Branding, Automation and more.',
    defaultDuration: '4 Weeks | 8 Live Sessions',
    defaultDurationShort: '4 Wks (16+ Hrs)',
    badge: 'FLAGSHIP AI PROGRAM',
    badgeColor: '#6366F1',
    badgeBg: 'rgba(99,102,241,.15)',
    badgeBorder: 'rgba(99,102,241,.35)',
    accent: '#6366F1',
    accentLight: '#EEF2FF',
    accentBorder: '#C7D2FE',
    accentGlow: 'rgba(99,102,241,.25)',
    gradient: 'linear-gradient(135deg,#1E1B4B,#4F46E5,#6366F1)',
    image: '/assets/images/courses/home14/3.jpg',
    defaultFees: 9999,
    defaultDiscount: 2000,
    defaultFinal: 7999,
    defaultCurriculum: [
      {
        week: 'Module 1',
        title: 'Module 1 — AI & The Future of Recruitment',
        duration: 'Week 1 / Session 1',
        accent: '#6366F1',
        description: 'What is AI & Generative AI for recruiters, model comparisons, and mapping the AI-powered recruiter workflow.',
        details: [
          'What is AI & Generative AI: Core concepts simplified for recruiters',
          'Model Comparison: ChatGPT vs. Gemini vs. Claude vs. Perplexity in recruitment',
          'AI vs Automation vs Traditional ATS tools: Where each fits in your tech stack',
          'What AI can and cannot do: Realistic capabilities, limitations, and hallucinations',
          'The AI-Powered Recruiter Workflow: Mapping JD to Joining end-to-end',
          'Practical Exercise: Build your personal AI Recruiter Workflow Blueprint',
        ],
        practicalActivity: 'Build personal AI Recruiter Workflow Map identifying immediate high-impact automation opportunities.',
      },
      {
        week: 'Module 2',
        title: 'Module 2 — Prompt Engineering for Recruiters',
        duration: 'Week 1 / Session 2',
        accent: '#6366F1',
        description: 'Anatomy of a good recruitment prompt: Role + Context + Task + Constraints + Output. Prompt chaining and reusable templates.',
        details: [
          'Anatomy of a high-performance recruitment prompt: Role, Context, Task, Constraints & Output format',
          'Advanced techniques: Prompt Chaining, Role-based persona prompting, and Few-Shot prompting',
          'Prompt refinement & iteration: Eliminating generic corporate jargon from AI outputs',
          'Building reusable recruiter prompt templates in Notion / Google Sheets / Notes',
          'Context Window optimization and document uploads for hiring requirements',
          'Practical Exercise: Assemble your personal 50+ AI Recruitment Prompt Library',
        ],
        practicalActivity: 'Construct personal 50+ AI Recruitment Prompt Library across intake, sourcing, and calling.',
      },
      {
        week: 'Module 3',
        title: 'Module 3 — AI for Job Analysis & JD Creation',
        duration: 'Week 2 / Session 3',
        accent: '#6366F1',
        description: 'Transform vague client briefs into high-converting, SEO-friendly JDs, Candidate Personas, and Competency Matrices.',
        details: [
          'Deconstructing messy client or hiring manager briefs with structured prompt prompts',
          'Generating comprehensive candidate personas: Must-have vs nice-to-have competencies',
          'SEO-friendly, high-conversion JD rewriting that appeals to top-tier passive talent',
          'Extracting hard skills, soft competencies, and behavioral indicators automatically',
          'Generating first-round qualifying screening questions directly from JDs',
          'Practical Project: End-to-end JD + Persona + Competency Matrix + Screening Questions package',
        ],
        practicalActivity: 'Deliver full Job Analysis Suite (JD, Persona, Competency Matrix, Pre-screening questions) for a live role.',
      },
      {
        week: 'Module 4',
        title: 'Module 4 — AI-Powered Sourcing',
        duration: 'Week 2 / Session 4',
        accent: '#6366F1',
        description: 'Generate advanced Boolean and X-Ray search strings for LinkedIn, job portals, and Google with AI synonym engines.',
        details: [
          'Instant Boolean search generation: AND, OR, NOT, Quotations, and Wildcards',
          'Google X-Ray search strings for LinkedIn, GitHub, Behance, and conference attendee lists',
          'Generating exhaustive alternative job titles, synonyms, and related skill taxonomy',
          'Targeting passive talent and identifying hidden candidate pools by industry verticals',
          'Evaluating candidate search result accuracy and tuning Boolean string parameters',
          'Practical Exercise: 10 Boolean Strings + 10 Alternative Titles + Target Company Profile Matrix',
        ],
        practicalActivity: 'Produce 10 Boolean Strings + 10 Alternative Titles + Target Company Matrix.',
      },
      {
        week: 'Module 5',
        title: 'Module 5 — AI Resume Screening & Candidate Matching',
        duration: 'Week 3 / Session 5',
        accent: '#6366F1',
        description: 'Resume vs JD matching, skill-gap analysis, candidate ranking, red-flag identification, and human-in-the-loop governance.',
        details: [
          'Comparing complex resumes against JDs: Automated skill-gap and experience analysis',
          'Objective candidate ranking and scoring matrix generation',
          'Detecting red flags, job-hopping timelines, and career trajectory inconsistencies',
          'Golden Governance Principle: AI recommendation ≠ Final hiring decision (Human in the Loop)',
          'Drafting executive candidate presentation summaries for hiring managers',
          'Practical Exercise: Produce a Shortlist Summary + Rejection Reasons + Interview Recommendation report',
        ],
        practicalActivity: 'Produce Shortlist + Rejection Reasons + Interview Recommendations hiring manager brief.',
      },
      {
        week: 'Module 6',
        title: 'Module 6 — AI for Candidate Communication',
        duration: 'Week 3 / Session 6',
        accent: '#6366F1',
        description: 'Personalized messaging across LinkedIn, Email, and WhatsApp. Follow-ups, offer pitches, and rejection sequences.',
        details: [
          'Personalized LinkedIn InMail messages that capture executive attention',
          'Multi-touch cold email candidate outreach sequences (Initial Pitch, Follow-up 1, Follow-up 2, Breakup)',
          'WhatsApp outreach scripts: Conversational, professional, and compliant messaging',
          'Adapting tones: Executive, Friendly, Urgent, Campus, and Technical tone calibrations',
          'Drafting empathetic rejection letters and candidate talent-pool nurturing sequences',
          'Practical Exercise: Build a complete 5-stage Candidate Outreach Sequence',
        ],
        practicalActivity: 'Build complete 5-stage Candidate Communication Sequence from pitch to offer.',
      },
      {
        week: 'Module 7',
        title: 'Module 7 — AI for Interviewing & Assessment',
        duration: 'Week 4 / Session 7',
        accent: '#6366F1',
        description: 'Technical, behavioural, STAR, and competency-based questions with evaluation scorecards and comparison matrices.',
        details: [
          'Generating role-specific technical, behavioral, situational, and culture-fit questions',
          'The STAR methodology (Situation, Task, Action, Result) prompt framework',
          'Creating weighted candidate evaluation scorecards with scoring benchmarks (1–5 scale)',
          'Interviewer calibration: Eliminating bias and ensuring structured panel feedback',
          'Generating scenario-based case study challenges and take-home assessment prompts',
          'Practical Exercise: 30 Interview Questions + Scorecard + Assessment Framework',
        ],
        practicalActivity: 'Develop 30 Interview Questions + Scorecard + Assessment Framework for a technical/business role.',
      },
      {
        week: 'Module 8',
        title: 'Module 8 — AI for Recruitment Operations',
        duration: 'Week 4 / Session 8',
        accent: '#6366F1',
        description: 'Trackers, reports, daily operating systems, meeting summaries, SOPs, and automated recruiter agendas.',
        details: [
          'Structuring recruitment trackers, candidate status updates, and pipeline reports',
          'Summarizing client/candidate meetings and stakeholder action items in seconds',
          'Creating Standard Operating Procedures (SOPs) for recruiter onboarding and SLA adherence',
          'Generating email response drafts and daily operational agendas with voice-to-text AI',
          'Building a Daily Recruiter Operating System powered by AI task assistants',
          'Practical Exercise: Implement your AI-Assisted Daily Recruiter Operating System',
        ],
        practicalActivity: 'Implement personal AI-Assisted Daily Recruiter Operating System and meeting summarizer.',
      },
      {
        week: 'Module 9',
        title: 'Module 9 — AI for Recruitment Marketing & Employer Branding',
        duration: 'Advanced / Module 9',
        accent: '#6366F1',
        description: 'Social posts, campaigns, EVP content, and talent newsletters to build a magnetic candidate employer brand.',
        details: [
          'Generating viral, authentic LinkedIn hiring posts and job teaser carousels',
          'Crafting compelling Employer Value Proposition (EVP) messaging and culture stories',
          'Designing targeted candidate recruitment campaigns across niche demographics',
          'Writing candidate-centric email newsletters to nurture passive candidate databases',
          'Visual & graphic AI prompts for job announcements and employer branding banners',
          'Practical Project: Build a 30-Day Recruitment Marketing & Employer Branding Calendar',
        ],
        practicalActivity: 'Produce a 30-Day Recruitment Marketing Calendar with hooks, post copy, and visuals.',
      },
      {
        week: 'Module 10',
        title: 'Module 10 — AI for Recruitment Analytics',
        duration: 'Advanced / Module 10',
        accent: '#6366F1',
        description: 'MIS, funnel conversion analysis, time-to-hire, and cost-per-hire analytics with executive presentation summaries.',
        details: [
          'Analyzing recruitment MIS spreadsheets and applicant tracking data with AI data analysis',
          'Calculating recruitment metrics: Time-to-fill, Offer Acceptance Rate, Funnel drop-offs',
          'Source-of-hire optimization: Pinpointing highest-performing candidate channels',
          'Drafting C-suite executive summaries and talent acquisition quarterly business reviews (QBR)',
          'Predictive hiring insights: Forecasting pipeline capacity and recruiter workload',
          'Practical Project: Management Dashboard Report + AI Executive Summary Presentation',
        ],
        practicalActivity: 'Generate Management Dashboard + AI Executive Summary from raw hiring funnel data.',
      },
      {
        week: 'Module 11',
        title: 'Module 11 — AI Automation for Recruiters',
        duration: 'Advanced / Module 11',
        accent: '#6366F1',
        description: 'Trigger -> AI -> Action -> Human Review workflows. 5 practical automation examples across the recruitment lifecycle.',
        details: [
          'Understanding no-code automation: Triggers, Actions, Webhooks, and AI Nodes',
          'Example 1: Automated inbound application intake and initial skill summary',
          'Example 2: Auto-generating candidate profile pitch summaries when a resume arrives',
          'Example 3: Automated WhatsApp / Email follow-up triggers post-interview',
          'Example 4: Automated interviewer feedback collection and aggregation',
          'Human-in-the-loop safeguards: Ensuring critical approval gates before client dispatch',
        ],
        practicalActivity: 'Build and deploy a 4-step recruitment workflow automation blueprint.',
      },
      {
        week: 'Module 12',
        title: 'Module 12 — AI Recruitment Tools & Tool Stack',
        duration: 'Advanced / Module 12',
        accent: '#6366F1',
        description: 'How to select and build your personal AI Recruiter Stack across sourcing, screening, communication, and operations.',
        details: [
          'Comprehensive taxonomy of AI recruitment software in 2026: Sourcing, ATS, Video & Ops',
          'Evaluating AI vendor claims: Marketing hype vs. real recruiter utility',
          'ROI calculator: Measuring time saved and cost benefits of AI tooling',
          'Building the Free/Budget AI Recruiter Stack (under ₹2,000/month)',
          'Building the Enterprise/Agency High-Volume AI Recruiter Stack',
          'Tool audit framework: Data security, privacy, and compliance review checklist',
        ],
        practicalActivity: 'Create customized AI Recruiter Tool Stack Blueprint with recommended software and budget.',
      },
      {
        week: 'Module 13',
        title: 'Module 13 — Responsible AI in Recruitment',
        duration: 'Advanced / Module 13',
        accent: '#6366F1',
        description: 'Bias, data privacy (DPDP Act/GDPR), hallucinations, and human oversight. AI assists the recruiter; human makes the decision.',
        details: [
          'Algorithmic bias in hiring: How historical hiring bias infects AI models and how to prevent it',
          'Data privacy in recruitment: Handling candidate PII under Indian DPDP Act & international laws',
          'Preventing AI hallucinations and verifying technical candidate claims',
          'The Golden Rule: AI assists the recruiter — AI never blindly makes final hiring decisions',
          'Building ethical AI guidelines for your agency or corporate talent acquisition team',
          'Future of recruitment jobs: Why AI upgrades recruiters rather than replacing them',
        ],
        practicalActivity: 'Draft an Ethical AI Policy statement for your recruitment practice or HR department.',
      },
      {
        week: 'Module 14',
        title: 'Module 14 — Final Capstone Project',
        duration: 'Capstone & Certification',
        accent: '#6366F1',
        description: 'End-to-end AI-Powered Recruitment Playbook: 14 practical deliverables from Job Description to final Joining.',
        details: [
          'Capstone Mandate Briefing: Selecting a real-world difficult hiring requirement',
          'Deliverables 1–4: Optimized JD, Candidate Persona, Competency Matrix & Screening Questions',
          'Deliverables 5–7: Boolean Search Strings, Alternative Titles & X-Ray Query Stack',
          'Deliverables 8–10: Resume Screening Matrix, Shortlist Summary & 5-Step Outreach Sequence',
          'Deliverables 11–14: STAR Interview Kit, Scorecard, Daily Ops Blueprint & Executive Summary',
          'Capstone Review & Feedback from Senior Mentors',
          'Awarding of Certified AI Recruitment Professional credential',
        ],
        practicalActivity: 'Submit completed 14-deliverable AI-Powered Recruitment Playbook for certification.',
      },
    ],
    defaultLearningOutcomes: [
      'Master prompt engineering (Role + Context + Task + Constraints + Output) for zero-hallucination outputs.',
      'Generate complex Boolean & X-Ray searches across LinkedIn, Google, GitHub, and niche communities.',
      'Synthesize client intake notes into high-converting, bias-free Job Descriptions & Candidate Personas in minutes.',
      'Perform structured AI-assisted resume screening, skill gap matrix calculation, and shortlist justifications.',
      'Draft hyper-personalized 5-step outreach sequences (LinkedIn, Email, WhatsApp) with 3x higher response rates.',
      'Formulate competency-based STAR interview question guides, rubrics, and interviewer calibration matrices.',
      'Build no-code recruitment automation triggers (application intake, auto-followups, feedback aggregation).',
      'Deploy the complete 14-deliverable AI Recruitment Playbook from requirement to final joining.',
    ],
    defaultWhoShouldEnroll: [
      { role: 'Recruiters & Talent Acquisition Specialists', desc: 'Working recruiters who want to source faster, automate admin chores, and upgrade their hiring output.' },
      { role: 'HR Executives & Talent Partners', desc: 'HR generalists looking to lead AI adoption and modern workflow transformations in their organizations.' },
      { role: 'Staffing & Agency Founders', desc: 'Consultancy owners looking to multiply recruiter billing without linearly expanding team headcount.' },
      { role: 'Freelance Recruiters & Consultants', desc: 'Solo recruiters who need an AI "second brain" to compete effectively with larger staffing firms.' },
      { role: 'Campus Recruiters & Freshers', desc: 'Early-career professionals looking to enter the industry with high-demand, future-proof AI skills.' },
      { role: 'Business Owners & Hiring Managers', desc: 'Founders and department heads who need to source and interview top talent fast without full-time agency costs.' },
    ],
    defaultToolsCovered: [
      { category: 'Generative AI Engines', tools: ['ChatGPT (GPT-4o)', 'Claude 3.5 Sonnet', 'Google Gemini 1.5 Pro', 'Perplexity AI'] },
      { category: 'AI Sourcing & Search', tools: ['LinkedIn AI Search', 'Google X-Ray Engine', 'Boolean String Generator', 'GitHub / Behance Search'] },
      { category: 'Screening & Matching', tools: ['ATS Matchers', 'Skill-Gap Matrices', 'Red-Flag Detectors', 'Candidate Rankers'] },
      { category: 'Outreach & Messaging', tools: ['LinkedIn InMail AI', 'Cold Email Sequences', 'WhatsApp Workflows', 'Rejection & Nurture Prompts'] },
      { category: 'No-Code Automation', tools: ['Zapier', 'Make.com', 'Webhooks', 'Google Sheets AI Extensions'] },
    ],
    defaultCertificationDetails: {
      title: 'Certified AI Recruitment Professional',
      bullets: [
        'Industry-accredited credential with unique digital verification QR Code for LinkedIn.',
        'Permanent access to our proprietary 50+ AI Recruiter Prompt Library & Templates.',
        '14-deliverable Capstone Recruitment Playbook evaluation by veteran AI trainers.',
        'Lifetime access to session recordings, toolkit updates, and community mastermind.',
      ],
    },
    defaultFaqs: [
      { q: 'What is the duration and format of the AI for Recruitment course?', a: 'The course runs for 4 weeks featuring 8 interactive live online masterclasses (2 sessions per week, weekday evenings 7:00 PM – 9:00 PM IST), totaling 16+ hours of live instructor-led learning, tool walkthroughs, and capstone execution. Pune classroom options are also available.' },
      { q: 'Do I need any coding or technical background to join?', a: 'No technical or programming knowledge required! The course is 100% no-code and designed specifically for recruiters, HR professionals, and talent acquisition teams to integrate AI into their everyday workflows.' },
      { q: 'How is this course different from generic ChatGPT courses?', a: 'Generic courses teach broad trivia. This program is laser-focused on the recruitment lifecycle — from JD analysis, candidate personas, and Boolean search strings to resume screening, interview questions, and recruitment MIS automation.' },
      { q: 'What tools will I learn, and do I need paid subscriptions?', a: 'You will learn ChatGPT, Claude, Gemini, Perplexity, LinkedIn AI, and automation tools like Zapier/Make. All core workflows and assignments can be completed using free-tier accounts.' },
      { q: 'What certificate do I receive upon completion?', a: 'Graduates receive the verifiable "Certified AI Recruitment Professional" credential with unique QR code verification, suitable for LinkedIn licenses and your professional resume.' },
      { q: 'Can I attend classes offline in Pune or is it only online?', a: 'Both! You can enroll in our Live Online cohort or attend in-person classroom masterclasses at our Pune center (FC Road / Shivaji Nagar). Both modes include complete LMS access.' },
      { q: 'Are corporate team training and 1-to-1 implementation available?', a: 'Yes. We offer corporate packages starting from ₹25,000 for internal recruitment teams, as well as 1-to-1 implementation packages (₹25,000 + GST) with bespoke prompt engineering for your niche.' },
      { q: 'What is included in the AI Recruitment Toolkit?', a: 'Every student receives our proprietary AI Recruitment Toolkit: 50+ battle-tested recruiter prompts, Boolean generator blueprints, candidate communication drip templates (LinkedIn, Email, WhatsApp), and the 14-step Recruitment Playbook.' },
    ],
    defaultLmsStructure: [
      { week: 'Week 1', title: 'AI Foundations & Prompt Mastery', desc: 'GenAI comparison, AI recruiter workflow map, and the 50+ prompt library.' },
      { week: 'Week 2', title: 'Job Analysis & AI-Powered Sourcing', desc: 'JD rewriting, candidate personas, Boolean search, and X-Ray queries.' },
      { week: 'Week 3', title: 'Screening, Matching & Candidate Outreach', desc: 'Skill gap analysis, red flags, and 5-stage personalized messaging sequences.' },
      { week: 'Week 4', title: 'Interviewing, Automation & Capstone', desc: 'STAR scorecards, no-code workflows, responsible AI, and the Capstone Playbook.' },
    ],
  },
}

function resolveConfig(slugOrId: string) {
  const clean = slugOrId.toLowerCase().trim()
  if (CANONICAL_COURSE_CONFIGS[clean]) {
    return CANONICAL_COURSE_CONFIGS[clean]
  }
  for (const cfg of Object.values(CANONICAL_COURSE_CONFIGS)) {
    if (cfg.slugKey === clean || cfg.aliases.includes(clean) || cfg.route.replace('/', '') === clean) {
      return cfg
    }
  }
  return CANONICAL_COURSE_CONFIGS['for-professionals']
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
 * Fetches dynamic, comprehensive data for any of the 6 canonical courses.
 */
export async function getDynamicCourseData(categorySlug: string): Promise<DynamicCourseData> {
  const config = resolveConfig(categorySlug)

  try {
    const category = await prisma.courseCategory.findFirst({
      where: {
        OR: [
          { slug: categorySlug },
          { slug: config.slugKey },
          { slug: { in: config.aliases } },
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
                  include: {
                    topics: {
                      orderBy: { sortOrder: 'asc' },
                    },
                  },
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

    // 1. Resolve Course Title
    const title = dbCourse?.title || config.defaultTitle

    // 2. Resolve Descriptions
    const rawDesc = dbCourse?.description?.trim()
    const description = rawDesc && rawDesc.length > 30 ? stripHtml(rawDesc) : config.defaultOverview
    const shortDescription = config.defaultShortDescription
    const overview = description

    // 3. Resolve Duration & Students
    const duration = dbCourse?.duration?.trim() || config.defaultDuration
    const totalStudents = dbCourse?.totalStudents || 2500
    const rating = dbCourse?.rating ? Number(dbCourse.rating) : 4.9

    // 4. Resolve Pricing
    let baseFee = config.defaultFees
    let discount = config.defaultDiscount
    let finalFee = config.defaultFinal

    if (dbFee) {
      const parsedBase = dbFee.fees ? Number(dbFee.fees) : 0
      const parsedDisc = dbFee.discount ? Number(dbFee.discount) : 0
      const parsedFinal = dbFee.finalTotal ? Number(dbFee.finalTotal) : (dbFee.subtotal ? Number(dbFee.subtotal) : 0)

      if (parsedBase > 0) baseFee = parsedBase
      if (parsedDisc >= 0) discount = parsedDisc
      if (parsedFinal > 0) finalFee = parsedFinal
      else finalFee = Math.max(0, baseFee - discount)
    }

    // Online pricing calculation (default 50% discount)
    const onlineBase = dbFee?.onlineFees ? Number(dbFee.onlineFees) : baseFee
    const onlineDiscountAmount = dbFee?.onlineDiscount != null
      ? Number(dbFee.onlineDiscount)
      : Math.round(onlineBase * 0.50)
    const onlineFinalFee = dbFee?.onlineFinal != null
      ? Number(dbFee.onlineFinal)
      : Math.max(0, onlineBase - onlineDiscountAmount)
    const onlineDiscountPercent = onlineBase > 0 ? Math.round((onlineDiscountAmount / onlineBase) * 100) : 50
    const onlineEmi = Math.round(onlineFinalFee / 3)

    // Offline pricing calculation (default 10% discount)
    const offlineBase = dbFee?.offlineFees ? Number(dbFee.offlineFees) : baseFee
    const offlineDiscountAmount = dbFee?.offlineDiscount != null
      ? Number(dbFee.offlineDiscount)
      : Math.round(offlineBase * 0.10)
    const offlineFinalFee = dbFee?.offlineFinal != null
      ? Number(dbFee.offlineFinal)
      : Math.max(0, offlineBase - offlineDiscountAmount)
    const offlineDiscountPercent = offlineBase > 0 ? Math.round((offlineDiscountAmount / offlineBase) * 100) : 10
    const offlineEmi = Math.round(offlineFinalFee / 3)

    const savingsPercent = baseFee > 0 ? Math.round((discount / baseFee) * 100) : 0
    const emiPerMonth = Math.round(finalFee / 3)

    const pricing = {
      baseFee,
      discount,
      finalFee,
      savingsPercent,
      emiPerMonth,
      online: {
        baseFee: onlineBase,
        discountPercent: onlineDiscountPercent,
        discountAmount: onlineDiscountAmount,
        finalFee: onlineFinalFee,
        emiPerMonth: onlineEmi,
      },
      offline: {
        baseFee: offlineBase,
        discountPercent: offlineDiscountPercent,
        discountAmount: offlineDiscountAmount,
        finalFee: offlineFinalFee,
        emiPerMonth: offlineEmi,
      },
      modeNotes: dbFee?.modeNotes || null,
    }

    // 5. Resolve Curriculum
    let curriculum: DynamicCurriculumModule[] = config.defaultCurriculum

    if (dbCourse?.modules && dbCourse.modules.length > 0) {
      curriculum = dbCourse.modules.map((m, idx) => {
        const fallbackMod = config.defaultCurriculum[idx % config.defaultCurriculum.length]
        const allTopics: string[] = []
        if (m.chapters && m.chapters.length > 0) {
          m.chapters.forEach((ch) => {
            if (ch.topics && ch.topics.length > 0) {
              ch.topics.forEach((t) => allTopics.push(t.title))
            } else {
              allTopics.push(ch.title)
            }
          })
        }

        return {
          id: m.id,
          week: fallbackMod.week || `Module ${idx + 1}`,
          title: m.title,
          duration: fallbackMod.duration || `${idx + 1} Week`,
          accent: fallbackMod.accent || config.accent,
          description: m.description || fallbackMod.description,
          learningObjectives: fallbackMod.learningObjectives,
          details: allTopics.length > 0 ? allTopics : fallbackMod.details,
          practicalActivity: fallbackMod.practicalActivity,
        }
      })
    }

    // 6. Resolve FAQs
    let faqs: DynamicFaqItem[] = config.defaultFaqs
    if (category?.faqs && category.faqs.length > 0) {
      faqs = category.faqs.map((f) => ({
        id: f.id,
        q: f.question,
        a: f.answer,
      }))
    }

    // 7. Resolve Batch Start Date
    const upcomingBatch = dbCourse?.batches?.[0]
    let startDate = 'New Batch Starting Soon'
    if (upcomingBatch?.startDate) {
      startDate = new Date(upcomingBatch.startDate).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    }

    return {
      id: dbCourse?.id || 1,
      slug: category?.slug || config.slugKey,
      route: config.route,
      title,
      shortDescription,
      description,
      overview,
      categoryName: category?.name || config.defaultTitle,
      totalStudents,
      rating,
      duration,
      startDate,
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
      pricing,
      curriculum,
      learningOutcomes: config.defaultLearningOutcomes,
      whoShouldEnroll: config.defaultWhoShouldEnroll,
      toolsCovered: config.defaultToolsCovered,
      certificationDetails: config.defaultCertificationDetails,
      faqs,
      lmsStructure: config.defaultLmsStructure,
      features: [
        { title: `${duration} Practical Training`, desc: 'Live instructor-led masterclasses and interactive practical drills.' },
        { title: 'ISO-Accredited Credential', desc: 'Verifiable certificate with unique QR Code for LinkedIn.' },
        { title: 'Dedicated Career Support', desc: '1-on-1 resume building, mock interviews, and direct placement assistance.' },
        { title: 'Lifetime LMS Access', desc: 'Full access to class recordings, templates, spreadsheets, and scripts.' },
      ],
    }
  } catch (err) {
    console.error(`Error loading dynamic course data for ${categorySlug}:`, err)
    return {
      id: 1,
      slug: config.slugKey,
      route: config.route,
      title: config.defaultTitle,
      shortDescription: config.defaultShortDescription,
      description: config.defaultOverview,
      overview: config.defaultOverview,
      categoryName: config.defaultTitle,
      totalStudents: 2500,
      rating: 4.9,
      duration: config.defaultDuration,
      startDate: 'New Cohort Starting Soon',
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
        emiPerMonth: Math.round(config.defaultFinal / 3),
        online: {
          baseFee: config.defaultFees,
          discountPercent: 50,
          discountAmount: Math.round(config.defaultFees * 0.50),
          finalFee: Math.round(config.defaultFees * 0.50),
          emiPerMonth: Math.round((config.defaultFees * 0.50) / 3),
        },
        offline: {
          baseFee: config.defaultFees,
          discountPercent: 10,
          discountAmount: Math.round(config.defaultFees * 0.10),
          finalFee: Math.round(config.defaultFees * 0.90),
          emiPerMonth: Math.round((config.defaultFees * 0.90) / 3),
        },
        modeNotes: 'Pune Center Classroom Training & Online Live Batches Available',
      },
      curriculum: config.defaultCurriculum,
      learningOutcomes: config.defaultLearningOutcomes,
      whoShouldEnroll: config.defaultWhoShouldEnroll,
      toolsCovered: config.defaultToolsCovered,
      certificationDetails: config.defaultCertificationDetails,
      faqs: config.defaultFaqs,
      lmsStructure: config.defaultLmsStructure,
      features: [
        { title: `${config.defaultDuration} Practical Training`, desc: 'Live instructor-led masterclasses and interactive practical drills.' },
        { title: 'ISO-Accredited Credential', desc: 'Verifiable certificate with unique QR Code for LinkedIn.' },
        { title: 'Dedicated Career Support', desc: '1-on-1 resume building, mock interviews, and direct placement assistance.' },
        { title: 'Lifetime LMS Access', desc: 'Full access to class recordings, templates, spreadsheets, and scripts.' },
      ],
    }
  }
}

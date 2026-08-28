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

const DEFAULT_COURSE_CONFIGS: Record<string, {
  slugKey: string
  route: string
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
  'degree_tag': {
    slugKey: 'degree_tag',
    route: '/end-to-end-recruitment-training',
    defaultTitle: 'End-to-End Recruitment Training',
    defaultShortDescription: 'Master the complete talent acquisition lifecycle with our industry-accredited End-to-End Recruitment Training. Covers candidate sourcing, Boolean search, portal management, competency-based interviewing, multi-domain hiring (IT, Healthcare, BFSI), and statutory compliance with dedicated placement support.',
    defaultOverview: 'In today’s competitive talent landscape, organizations require agile, tech-savvy recruiters who can identify, engage, and close high-impact talent efficiently. The End-to-End Recruitment Training program delivers a 360-degree, practical grounding in modern recruitment methodologies, bridging academic HR concepts with real-world corporate hiring practices. You will master talent mapping, multi-channel candidate sourcing across LinkedIn Recruiter, Naukri, and GitHub, advanced Boolean search strings, structured screening frameworks (STAR method), offer negotiation, employer branding, and labour law compliance.',
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
    defaultFees: 95000,
    defaultDiscount: 10000,
    defaultFinal: 85000,
    defaultCurriculum: [
      {
        week: 'Module 1',
        title: 'Full-Lifecycle Recruitment Fundamentals & Job Analysis',
        duration: '1.5 Weeks (6 Hours Live + 4 Hours Labs)',
        accent: '#DC2626',
        description: 'Understand the end-to-end recruitment lifecycle, differentiate HR models, and translate business needs into Job Descriptions.',
        learningObjectives: [
          'Understand end-to-end recruitment from job requisition to onboarding.',
          'Differentiate between Corporate HR, Staffing Agencies, RPOs, and Executive Search.',
          'Interpret and draft comprehensive Job Descriptions (JDs) and candidate personas.',
          'Formulate hiring metrics: Time-to-Hire, Cost-per-Hire, and Quality-of-Hire.',
        ],
        details: [
          'Talent Acquisition vs. Traditional Recruitment paradigms',
          'Anatomy of a Job Requisition: Intake meetings, stakeholder alignment & SLAs',
          'Translating business requirements into actionable JDs & competency matrices',
          'Recruiter KPIs, funnels, conversion rates, and pipeline management',
        ],
        practicalActivity: 'Conduct a simulated Hiring Manager Intake Meeting and draft a standardized Job Description with essential vs. desirable skills.',
      },
      {
        week: 'Module 2',
        title: 'Candidate Sourcing, Boolean Search & Social Platforms',
        duration: '2.5 Weeks (10 Hours Live + 8 Hours Labs)',
        accent: '#EA580C',
        description: 'Master Boolean logic, Google X-Ray, LinkedIn Recruiter, Naukri Resdex, and social candidate engagement.',
        learningObjectives: [
          'Construct complex Boolean search operators across search engines and portals.',
          'Leverage LinkedIn Recruiter, Naukri Resdex, Monster/Foundit, and Indeed effectively.',
          'Execute passive candidate sourcing via GitHub, Stack Overflow, and Google X-Ray.',
          'Draft high-converting cold outreach messages, InMails, and automated sequences.',
        ],
        details: [
          'Boolean Search logic: AND, OR, NOT, quotation marks, parentheses & wildcards',
          'Google X-Ray Search: Finding unlisted resumes, portfolio links & contact directories',
          'Job Portal Mastery: Advanced filtering on Naukri (IT/Non-IT keywords, CTC, notice periods)',
          'Social & Tech Sourcing: LinkedIn outreach, GitHub commit analysis & Stack Overflow',
          'Email deliverability, personalized cold messaging & drip sequences',
        ],
        practicalActivity: 'Live Sourcing Drill: Source 15 qualified candidate profiles for a given role within 60 minutes using multi-channel search.',
      },
      {
        week: 'Module 3',
        title: 'Resume Screening, Assessment & Competency Interviewing',
        duration: '2 Weeks (8 Hours Live + 6 Hours Mock Labs)',
        accent: '#D97706',
        description: 'Screen resumes in 30 seconds, detect red flags, and lead competency-based interviews using STAR.',
        learningObjectives: [
          'Evaluate resumes systematically against Job Descriptions within 30 seconds.',
          'Spot red flags, employment gaps, fabricated credentials, and job-hopping patterns.',
          'Design structured telephonic screening questionnaires and scorecards.',
          'Conduct Behavioral and Competency-Based Interviews using the STAR framework.',
        ],
        details: [
          'Resume screening frameworks: Keyword matching, career trajectory & pedigree',
          'Initial telephonic screening: Salary expectation, notice period & cultural fit',
          'Interviewing Methodologies: Behavioral, situational & technical screening',
          'The STAR Method (Situation, Task, Action, Result) in candidate assessment',
          'Eliminating unconscious bias and standardizing candidate evaluation scorecards',
        ],
        practicalActivity: 'Screen 25 mixed-quality resumes, shortlist the top 5, and conduct a recorded 15-minute mock telephonic screening interview.',
      },
      {
        week: 'Module 4',
        title: 'Domain-Specific Recruitment (IT, Healthcare & Finance)',
        duration: '2 Weeks (8 Hours Live + 6 Hours Case Studies)',
        accent: '#16A34A',
        description: 'Deep-dive into specialized recruitment ecosystems for Information Technology, Healthcare, and BFSI sectors.',
        learningObjectives: [
          'Understand terminology, tech stacks, and career paths in IT/Software Recruitment.',
          'Navigate hiring regulations, clinical certifications, and licensures in Healthcare.',
          'Master skill frameworks for Banking, Financial Services, and Insurance (BFSI).',
          'Adapt sourcing and screening strategies according to domain nuances.',
        ],
        details: [
          'IT Recruitment: Frontend, Backend, Full Stack, Cloud/DevOps, Data Engineering & Cyber',
          'Healthcare Recruitment: Doctors, Nursing staff, Clinical Research & Medical Council checks',
          'BFSI Recruitment: Chartered Accountants (CA), Investment Bankers, Risk Analysts & NISM/CFA',
        ],
        practicalActivity: 'Map the technical ecosystem for a Microservices Architecture role and complete a 3-domain sourcing case study.',
      },
      {
        week: 'Module 5',
        title: 'Advanced Recruitment Strategies & Employer Branding',
        duration: '1.5 Weeks (6 Hours Live + 4 Hours Projects)',
        accent: '#2563EB',
        description: 'Employer value proposition (EVP), talent communities, salary negotiation, and candidate drop-off prevention.',
        learningObjectives: [
          'Develop an Employer Value Proposition (EVP) and recruitment marketing campaigns.',
          'Implement proactive candidate engagement and talent pipelining.',
          'Master salary negotiation techniques, counter-offer handling, and offer rollouts.',
          'Optimize candidate experience to minimize offer dropouts and ghosting.',
        ],
        details: [
          'Employer Branding Fundamentals: Job posts, employee spotlights & career page messaging',
          'Talent Nurturing: Building Warm Talent Pools for high-demand roles',
          'Offer Formulation & Negotiation: Total Rewards breakdown (Fixed, Variable, ESOPs)',
          'Post-Offer Engagement: Pre-boarding touchpoints & first-90-day retention drivers',
        ],
        practicalActivity: 'Roleplay a difficult compensation negotiation and offer acceptance scenario with a candidate holding competing offers.',
      },
      {
        week: 'Module 6',
        title: 'Legal Frameworks, Labour Compliance & Ethics in Recruitment',
        duration: '1 Week (4 Hours Live + 3 Hours Policy Review)',
        accent: '#7C3AED',
        description: 'Indian labour laws, Background Verification (BGV), data privacy (DPDP), and recruitment ethics.',
        learningObjectives: [
          'Understand statutory and legal frameworks governing hiring in India.',
          'Implement compliant Background Verification (BGV) and credential checks.',
          'Ensure equal opportunity, diversity & inclusion (D&I), and data privacy compliance.',
          'Maintain professional recruitment ethics and prevent malpractice.',
        ],
        details: [
          'Key Indian Labour Laws: Equal Remuneration Act, POSH awareness & Shops & Establishment Act',
          'Background Verification (BGV): Education, employment, criminal records & reference checks',
          'Candidate Data Privacy (DPDP Act compliance) and confidential data handling',
          'Ethical recruitment: Anti-poaching agreements, non-compete clauses & fee ethics',
        ],
        practicalActivity: 'Design an end-to-end Background Verification (BGV) workflow policy and consent documentation.',
      },
      {
        week: 'Module 7',
        title: 'Capstone Project & Real-World Hiring Simulation',
        duration: '1.5 Weeks (6 Hours Mentorship + 12 Hours Capstone)',
        accent: '#0F172A',
        description: 'Full-cycle hiring simulation from job mandate intake to candidate offer closure and analytics dashboard.',
        learningObjectives: [
          'Execute a complete recruitment lifecycle from Job Requisition to Final Offer.',
          'Demonstrate proficiency in ATS management, candidate tracking, and reporting.',
          'Present a structured Recruitment Analytics Dashboard to industry mentors.',
        ],
        details: [
          'Real-world project kickoff: Allocation of enterprise hiring mandates',
          'Sourcing, screening, scheduling, assessment & candidate dossier preparation',
          'Compiling a comprehensive Recruiter Portfolio and capstone presentation',
        ],
        practicalActivity: 'Full-Cycle Hiring Simulation: Source a 10-candidate pipeline, screen 3 finalists, prepare submission dossiers, and present a hiring closure report.',
      },
    ],
    defaultLearningOutcomes: [
      'Independently execute end-to-end recruitment workflows from requirement gathering to onboarding.',
      'Construct sophisticated Boolean search strings and Google X-Ray queries for active and passive talent.',
      'Navigate major job portals (Naukri Resdex, LinkedIn Recruiter, Indeed) and enterprise ATS platforms.',
      'Screen resumes in under 30 seconds and conduct structured competency interviews using the STAR method.',
      'Confidently recruit across specialized domains including IT, Healthcare, and BFSI.',
      'Structure competitive compensation offers, negotiate counter-offers, and reduce candidate dropouts.',
      'Apply Indian labour laws, standard BGV workflows, and data privacy compliance in daily hiring.',
      'Implement employer branding and maintain active talent communities for recurring mandates.',
      'Track and optimize core hiring metrics: Time-to-Fill, Cost-per-Hire, and Offer Acceptance Ratios.',
    ],
    defaultWhoShouldEnroll: [
      { role: 'Aspiring HR & Recruitment Professionals', desc: 'Fresh graduates (BBA, B.Com, MBA-HR, MSW) seeking high-growth entry into Talent Acquisition.' },
      { role: 'Junior Recruiters & HR Executives', desc: 'Early-career professionals (0–2 years) wanting to upgrade their sourcing capabilities, domain expertise, and closing ratios.' },
      { role: 'Non-HR Career Switchers', desc: 'Professionals from sales, customer service, BPO, or administration transitioning into high-demand recruitment roles.' },
      { role: 'Freelance Recruiters & Staffing Consultants', desc: 'Independent headhunters aiming to master modern recruitment tools, employer branding, and enterprise client handling.' },
    ],
    defaultToolsCovered: [
      { category: 'Sourcing & Talent Search', tools: ['LinkedIn Recruiter', 'LinkedIn Sales Navigator', 'Google X-Ray Search', 'GitHub', 'Stack Overflow'] },
      { category: 'Job Portals & Databases', tools: ['Naukri.com (Resdex & Job Postings)', 'Indeed India', 'Foundit (Monster)', 'Shine'] },
      { category: 'Applicant Tracking Systems (ATS)', tools: ['Zoho Recruit', 'Greenhouse', 'Lever', 'Google Sheets Recruiter Pipelines'] },
      { category: 'Assessment & Scheduling', tools: ['Google Meet', 'Zoom', 'MS Teams', 'Calendly', 'TestGorilla'] },
      { category: 'AI Sourcing & Productivity', tools: ['ChatGPT for Recruiter Prompts', 'Magical AI', 'Claude for JD Writing', 'Loom'] },
    ],
    defaultCertificationDetails: {
      title: 'Certified Talent Acquisition & Full-Lifecycle Recruitment Specialist',
      bullets: [
        'Tamper-proof certificate with unique verifiable QR Code for instant employer verification.',
        'Accredited by Recruitment Institute adhering to ISO-standard corporate training quality.',
        'Lifetime access to LMS learning portal, recorded sessions, sourcing templates, and cheat sheets.',
        'One-click verifiable LinkedIn digital certification badge.',
      ],
    },
    defaultFaqs: [
      { q: 'What is the duration and schedule of the course?', a: 'The course spans 3 Months (12 weeks). Classes are held on weekends (Saturday & Sunday, 2 hours/day) with weekday doubt-clearing sessions and hands-on sourcing labs.' },
      { q: 'What are the prerequisites to join this program?', a: 'There are no strict prerequisites. A bachelor’s degree in any discipline (or final-year students), basic computer literacy, and strong communication skills are sufficient.' },
      { q: 'How is this course different from generic HR management courses?', a: 'Unlike broad theoretical HR courses, this program is 100% focused on Talent Acquisition and Recruitment operations. You spend over 60% of class time actively sourcing, screening, and simulating hiring mandates.' },
      { q: 'Is placement support provided?', a: 'Yes. We provide comprehensive career support including 1-on-1 resume rebuilding, LinkedIn profile optimization, mock recruitment interviews, and direct referrals to our network of 150+ hiring partners.' },
      { q: 'Are flexible installment / EMI options available?', a: 'Yes. The course fee of ₹85,000 can be paid through easy no-cost and low-cost EMI options starting at ₹14,167/month across major credit cards, debit cards, and loan partners.' },
      { q: 'What if I miss a live class?', a: 'All live classes are recorded in HD quality and uploaded to your LMS student portal within 4 hours. You enjoy lifetime access to review recordings at your convenience.' },
      { q: 'Will I get hands-on access to recruitment tools?', a: 'Yes. You will participate in live walkthroughs and practical assignments utilizing LinkedIn Recruiter workflows, Boolean search engines, Naukri simulation frameworks, and ATS tools.' },
      { q: 'Is the certificate recognized by employers?', a: 'Yes. Our certificate is widely acknowledged across corporate HR departments, IT staffing firms, and RPO firms in India and abroad with instant QR-code verification.' },
    ],
    defaultLmsStructure: [
      { week: 'Week 01', title: 'Recruitment Fundamentals & JD Structuring', desc: 'Talent Acquisition ecosystem, Corporate vs. Agency hiring, Intake meetings, and JD structuring.' },
      { week: 'Week 02', title: 'Recruiter Metrics & Persona Mapping', desc: 'Hiring funnels, KPIs (Time-to-Hire, Cost-per-Hire), Candidate Personas, and Competency Mapping.' },
      { week: 'Week 03', title: 'Boolean Search & Google X-Ray Logic', desc: 'Boolean Operators, search string construction, nesting logic, and Google X-Ray search methodology.' },
      { week: 'Week 04', title: 'Portal Sourcing (Naukri, Indeed, Foundit)', desc: 'Job portal architecture, Naukri Resdex advanced search, keyword density, and portal posting.' },
      { week: 'Week 05', title: 'Social & Niche Sourcing (LinkedIn, GitHub)', desc: 'LinkedIn Recruiter workflows, Boolean on social networks, GitHub candidate identification, and InMail writing.' },
      { week: 'Week 06', title: 'Resume Screening & Red Flag Detection', desc: '30-second resume screening, career gap verification, telephonic screening frameworks, and candidate dossiers.' },
      { week: 'Week 07', title: 'Competency-Based & STAR Interviewing', desc: 'Structured interviewing, STAR assessment sheets, rating rubrics, and unconscious bias mitigation.' },
      { week: 'Week 08', title: 'IT & Tech Recruitment Deep Dive', desc: 'Frontend/Backend/Cloud stacks, understanding developer resumes, tech screening questions.' },
      { week: 'Week 09', title: 'Healthcare & BFSI Sector Hiring', desc: 'Non-IT hiring: Healthcare credentials, Nursing/Doctor registries, CA/CFA/Banking profiles, and compliance.' },
      { week: 'Week 10', title: 'Employer Branding & Outreach Strategies', desc: 'Recruitment marketing, LinkedIn personal branding for recruiters, employer value proposition (EVP), and candidate nurturing.' },
      { week: 'Week 11', title: 'Offer Negotiation & Labour Law Compliance', desc: 'CTC breakups, offer letter negotiation, counter-offer handling, pre-boarding touchpoints, and Indian labour laws.' },
      { week: 'Week 12', title: 'Capstone Project, Recruiter Portfolio & Certificate', desc: 'Capstone project execution, live peer review, LMS final assessment quiz, and issuance of QR-coded certificates.' },
    ],
  },

  'certification_tag': {
    slugKey: 'certification_tag',
    route: '/hr-courses-for-beginners',
    defaultTitle: 'HR Courses for Beginners',
    defaultShortDescription: 'Kickstart your Human Resources career with our foundational 6-week intensive certificate program. Covers HR operations, entry-level recruitment, resume screening, calling etiquette, portal basics (Naukri & LinkedIn), interview scheduling, and basic documentation.',
    defaultOverview: 'Entering the Human Resources domain without formal training can feel daunting. The HR Courses for Beginners is an accessible, career-starter program engineered to transform beginners into job-ready HR professionals in just 6 weeks. You will learn how modern organizations structure their HR teams, how to read job descriptions, search candidates on Naukri and LinkedIn, conduct telephonic screening calls, manage interview calendars, and coordinate onboarding.',
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
        week: 'Module 1',
        title: 'HR Foundations & the Modern Talent Landscape',
        duration: '1 Week (6 Hours Live + 3 Hours Labs)',
        accent: '#0EA5E9',
        description: 'Core pillars of Human Resource Management, recruiter responsibilities, and key terminology.',
        learningObjectives: [
          'Understand the core pillars of Human Resource Management (HRM).',
          'Identify roles, daily responsibilities, and growth paths of an entry-level recruiter.',
          'Decode organizational charts, hiring hierarchies, and team workflows.',
          'Master fundamental HR and recruitment terminology.',
        ],
        details: [
          'Introduction to Corporate HR vs. Staffing vs. HR Operations',
          'The employee lifecycle: Hire to Retire overview',
          'Key HR terms: CTC, Notice Period, In-hand Salary, Gross, SLAs, Requisition',
          'Day-in-the-life of a Junior Recruiter and HR Trainee',
        ],
        practicalActivity: 'Map an organizational chart for a 100-person tech company and create a glossary of 25 essential HR terms.',
      },
      {
        week: 'Module 2',
        title: 'Job Descriptions & Sourcing Fundamentals',
        duration: '1.5 Weeks (8 Hours Live + 6 Hours Labs)',
        accent: '#0284C7',
        description: 'Deconstruct JDs, search keywords, and perform candidate searches on Naukri and LinkedIn.',
        learningObjectives: [
          'Deconstruct job descriptions to identify mandatory vs. optional qualifications.',
          'Perform basic keyword search queries on Naukri and LinkedIn.',
          'Search for candidates by location, experience, and salary criteria.',
          'Organize candidate profiles into structured spreadsheets.',
        ],
        details: [
          'Reading and analyzing Job Descriptions (JDs)',
          'Navigating job boards: Naukri Resdex basics, filters, and keyword fields',
          'Basic LinkedIn searching: Utilizing search filters, titles, and location tags',
          'Building structured Google Sheet candidate trackers',
        ],
        practicalActivity: 'Extract 5 key search criteria from an Entry-Level JD and build a candidate tracker on Google Sheets with 10 shortlisted profiles.',
      },
      {
        week: 'Module 3',
        title: 'Resume Screening & Calling Etiquette',
        duration: '1.5 Weeks (8 Hours Live + 6 Hours Roleplays)',
        accent: '#0369A1',
        description: 'Apply the 30-second resume evaluation checklist and conduct polite telephonic screening calls.',
        learningObjectives: [
          'Apply the 30-second resume evaluation checklist.',
          'Conduct polite, structured telephonic candidate screening calls.',
          'Inquire about salary expectations, location, and notice periods professionally.',
          'Handle candidate hesitations and basic objections effectively.',
        ],
        details: [
          'The 30-second resume scan: Identifying relevant experience, education, and tenure',
          'Telephonic screening scripts and professional phone etiquette',
          'How to verify CTC details, expected compensation, and notice period constraints',
          'Writing clear, professional candidate email invitations and WhatsApp messages',
        ],
        practicalActivity: 'Conduct a recorded 5-minute telephonic screening roleplay with an instructor and screen 15 student resumes.',
      },
      {
        week: 'Module 4',
        title: 'Interview Coordination & Documentation Basics',
        duration: '1 Week (6 Hours Live + 4 Hours Workflows)',
        accent: '#075985',
        description: 'Coordinate interview rounds, manage calendars, and audit pre-onboarding document checklists.',
        learningObjectives: [
          'Coordinate interview rounds between candidates and hiring managers seamlessly.',
          'Manage calendar invites, video interview links, and reminder notifications.',
          'Understand standard document checklists required for onboarding.',
          'Assist in basic offer letter dispatch and joining confirmation workflows.',
        ],
        details: [
          'Interview scheduling workflows: Coordinating panel calendars & sending meeting invites',
          'Managing candidate dropouts and rescheduling requests',
          'Standard onboarding document checklist: Identity proofs, certificates, payslips & relieving letters',
          'Basic offer letter components and pre-joining check-ins',
        ],
        practicalActivity: 'Draft an interview confirmation email with calendar attachments and create a standardized document verification checklist.',
      },
      {
        week: 'Module 5',
        title: 'Practical Capstone, Resume Rebuilding & Placement Prep',
        duration: '1 Week (6 Hours Mentorship + 4 Hours Mocks)',
        accent: '#0C4A6E',
        description: 'Complete full-cycle fresher hiring simulation, format ATS-friendly resume, and attend mock HR interviews.',
        learningObjectives: [
          'Complete an end-to-end entry-level sourcing and screening simulation.',
          'Format an ATS-friendly HR resume highlighting course projects and competencies.',
          'Clear foundational HR interview questions and behavioral rounds.',
          'Register with the Recruitment Institute Placement Cell.',
        ],
        details: [
          'Full-cycle mini-project: Source, screen, and schedule candidates for an assigned role',
          'Recruiter resume crafting: Highlighting keywords, project work, and certifications',
          'Common HR interview questions and model answers for freshers',
          'Job application strategies on LinkedIn, Naukri, and entry-level job boards',
        ],
        practicalActivity: 'Complete the "First Hire Simulation", finalize your optimized HR resume, and attend a 1-on-1 mock interview with faculty.',
      },
    ],
    defaultLearningOutcomes: [
      'Explain core HR and talent acquisition processes within corporate and agency setups.',
      'Accurately identify core requirements, experience brackets, and skill priorities from JDs.',
      'Search and retrieve relevant candidate profiles using basic filters on Naukri and LinkedIn.',
      'Evaluate resumes in under a minute using structured screening criteria.',
      'Conduct confident, articulate telephonic screening conversations with prospective candidates.',
      'Manage end-to-end interview logistics, Google Meet invites, and candidate follow-ups.',
      'Compile and audit basic candidate onboarding documents and credential records.',
      'Build an industry-ready resume tailored for Junior Recruiter and HR Trainee openings.',
    ],
    defaultWhoShouldEnroll: [
      { role: 'Fresh Graduates', desc: 'Students from Arts, Commerce, Science, BBA, and MBA seeking an immediate start in corporate HR.' },
      { role: 'Career Switchers', desc: 'Individuals from non-HR backgrounds (BPO, Sales, Customer Support, Retail) looking to transition into HR.' },
      { role: 'Aspiring HR Assistants', desc: 'Professionals seeking formal foundational certification to qualify for corporate entry-level roles.' },
    ],
    defaultToolsCovered: [
      { category: 'Job Portals', tools: ['Naukri.com (Basic Resdex overview)', 'LinkedIn Jobs', 'Indeed India'] },
      { category: 'Productivity & Tracking', tools: ['Google Sheets', 'MS Excel (Recruitment Trackers)', 'Google Docs'] },
      { category: 'Communication & Scheduling', tools: ['Google Meet', 'Zoom', 'MS Outlook', 'Gmail', 'WhatsApp Business'] },
    ],
    defaultCertificationDetails: {
      title: 'Certificate in Foundational HR & Recruitment Practices',
      bullets: [
        'Tamper-proof verifiable QR Code for instant employer verification.',
        'Lifetime access to foundational HR templates, calling scripts, and interview checklists.',
        'Sharable digital PDF Certificate and LinkedIn badge.',
      ],
    },
    defaultFaqs: [
      { q: 'Do I need an MBA in HR to join this course?', a: 'No. A graduate degree in any discipline or final-year student status is sufficient. Prior HR knowledge is not required.' },
      { q: 'How many hours per week do I need to commit?', a: 'Approximately 6 to 8 hours per week, including live classes and hands-on practice.' },
      { q: 'What job roles can I apply for after completing this course?', a: 'Junior Recruiter, HR Trainee, Talent Acquisition Associate, HR Coordinator, and Sourcing Specialist.' },
      { q: 'Is the course conducted in English?', a: 'Yes, classes are delivered in clear, simple Business English to help you build workplace communication confidence.' },
      { q: 'Are recorded sessions provided if I miss a lecture?', a: 'Yes. All sessions are recorded and made available on the LMS portal within 4 hours.' },
      { q: 'What is the course fee and are there installment options?', a: 'The fee is ₹16,000 (all-inclusive), payable in 2 installments or via zero-cost monthly EMI options starting at ₹2,667/month.' },
    ],
    defaultLmsStructure: [
      { week: 'Week 1', title: 'HR Foundations & Recruiter Roles', desc: 'Introduction to Human Resource Management, Organizational Structures, and Recruiter Roles.' },
      { week: 'Week 2', title: 'Job Descriptions & Portal Searching', desc: 'Understanding Job Descriptions, Keyword Extraction, and Job Portal Fundamentals (Naukri/LinkedIn).' },
      { week: 'Week 3', title: 'Resume Screening & Candidate Calling', desc: '30-Second Resume Screening Techniques, Shortlisting Criteria, and Tracker Management.' },
      { week: 'Week 4', title: 'Calling Scripts & Notice Period Handling', desc: 'Telephonic Calling Scripts, Candidate Communication, and Negotiation of Notice Periods/CTC.' },
      { week: 'Week 5', title: 'Interview Scheduling & Document Checklists', desc: 'Interview Logistics, Calendar Coordination, Onboarding Document Checklists, and Offer Basics.' },
      { week: 'Week 6', title: 'First-Hire Simulation & Career Launch', desc: 'First-Hire Capstone Simulation, Resume Rebuilding Workshop, Mock Interviews, and Certification.' },
    ],
  },

  'entrepreneur_tag': {
    slugKey: 'entrepreneur_tag',
    route: '/hr-entrepreneurship-program',
    defaultTitle: 'HR Entrepreneurship Program',
    defaultShortDescription: 'Launch, operate, and scale your own profitable recruitment consultancy or staffing agency with our 2-month executive masterclass. Covers niche selection, GST/MSME registration, B2B client acquisition, SLA/NDA contracts, 48-hour shortlisting, and cash flow management.',
    defaultOverview: 'Starting a recruitment agency offers high profit margins with low initial capital requirements, but building a scalable, resilient staffing business requires structured business acumen. The HR Entrepreneurship Program is a practical business blueprint designed to guide entrepreneurs through the entire agency lifecycle—from zero to their first ₹10 Lakhs in billing. You will master niche selection, B2B client outreach, commercial negotiation (8.33% to 15% placement fees), lean ATS infrastructure, and billing cycles.',
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
        week: 'Module 1',
        title: 'Niche Selection, Positioning & Legal Setup',
        duration: '2 Weeks (8 Hours Live + 6 Hours Planning)',
        accent: '#D97706',
        description: 'Agency business models, high-margin staffing niches, entity incorporation (LLP/Pvt Ltd), and GST/MSME compliance.',
        learningObjectives: [
          'Select a high-margin, sustainable recruitment niche based on market demand.',
          'Decide between Sole Proprietorship, LLP, and Private Limited company structures.',
          'Complete statutory registrations: GST, MSME/Udyam, and Current Account setup.',
          'Establish agency branding, corporate domain, website, and digital presence.',
        ],
        details: [
          'Market analysis: Identifying high-growth staffing niches (IT, GCCs, BFSI, Healthcare)',
          'Legal company incorporation: Proprietorship vs. LLP vs. Pvt Ltd in India',
          'Tax compliance: GST registration, TDS on recruitment fees (Section 194J) & MSME benefits',
          'Corporate identity: Crafting agency value proposition, service brochure & website',
        ],
        practicalActivity: 'Complete the Agency Niche Scoring Matrix and draft your agency service deck showcasing domain specializations.',
      },
      {
        week: 'Module 2',
        title: 'B2B Client Acquisition & Commercial Contracts',
        duration: '2 Weeks (8 Hours Live + 8 Hours Outreach)',
        accent: '#B45309',
        description: 'Target CXOs and HR Heads, execute cold outreach campaigns, and negotiate commercial SLAs and NDAs.',
        learningObjectives: [
          'Identify and target key hiring decision-makers (Founders, VP-HR, TA Heads).',
          'Execute cold outreach campaigns across LinkedIn, email, and phone.',
          'Structure and negotiate Client Service Agreements (SLA), NDAs, and fee models.',
          'Pitch contingency vs. retained vs. executive search recruitment models.',
        ],
        details: [
          'Prospecting target clients: Building a database of high-growth companies',
          'Proven 3-touch outbound cold outreach scripts: Email, LinkedIn InMail & calling frameworks',
          'Commercial terms: 8.33% vs. 10–12.5% vs. 15% tiers; 30/60-day credit terms',
          'Contract clauses: 90-day replacement guarantee, non-solicitation & exclusivity',
        ],
        practicalActivity: 'Customize an industry-standard Client Service Agreement (SLA) and execute a 3-step outreach campaign targeting 30 companies.',
      },
      {
        week: 'Module 3',
        title: 'Delivery Excellence & 48-Hour Shortlisting',
        duration: '2 Weeks (8 Hours Live + 6 Hours Workflows)',
        accent: '#92400E',
        description: 'Implement lean ATS infrastructure, build candidate benches, and deliver candidate dossiers within 48 hours.',
        learningObjectives: [
          'Implement low-cost, scalable ATS and candidate tracking infrastructure.',
          'Master the "48-Hour Shortlist" standard to deliver rapid candidate pipelines to clients.',
          'Manage candidate offer acceptance, counter-offer risks, and joining confirmations.',
          'Handle difficult client feedback, scope changes, and rejected submissions.',
        ],
        details: [
          'Setting up lean recruitment tech stack: Low-cost ATS & email automation tools',
          'Talent bench strategy: Pre-sourcing candidates before client mandates are released',
          'Submitting compelling candidate dossiers that maximize shortlist rates',
          'Candidate control: Pre-closing salary expectations & managing notice period buyouts',
        ],
        practicalActivity: 'Configure a client pipeline board on a cloud ATS and prepare a formal 3-candidate submission dossier.',
      },
      {
        week: 'Module 4',
        title: 'Billing, Cash Flow Management & Scaling',
        duration: '2 Weeks (8 Hours Live + 6 Hours Modelling)',
        accent: '#78350F',
        description: 'Manage client invoicing cycles, GST billing, debt collection, freelancer commission models, and agency scaling.',
        learningObjectives: [
          'Master client invoicing, GST billing, and collections cycles.',
          'Handle delayed payments, disputed invoices, and debt recovery professionally.',
          'Structure commission schemes and incentives for freelance sourcers.',
          'Formulate a 12-month agency growth and revenue roadmap.',
        ],
        details: [
          'Invoicing best practices: Tax invoice formats, milestone tracking & GST TDS credits',
          'Managing receivables: Payment reminder sequences, escalations & legal notice triggers',
          'Hiring your first team member: Freelancer models & variable incentive plans',
          'Scaling strategies: Moving to retained search, RPO contracts & international staffing',
        ],
        practicalActivity: 'Build an Agency Cash Flow & Revenue Projection Model for Year 1 and finalize your comprehensive Business Launch Plan.',
      },
    ],
    defaultLearningOutcomes: [
      'Register and structure a fully compliant recruitment business (GST, MSME, Banking, Contracts).',
      'Position your agency within a profitable, high-demand sector with strong commercial margins.',
      'Execute multi-channel cold outreach campaigns to sign corporate client mandates.',
      'Draft and negotiate robust Client Service Agreements with favorable commercial terms.',
      'Fulfill client mandates within 48 to 72 hours using proactive talent pipelines.',
      'Protect revenue by managing counter-offers, notice period hurdles, and candidate dropouts.',
      'Manage billing cycles, GST compliance, and debt collection effectively.',
      'Hire and manage freelance sourcers and recruiters using commission-driven structures.',
    ],
    defaultWhoShouldEnroll: [
      { role: 'Experienced Recruiters & HR Professionals', desc: 'Individuals with 2+ years experience wanting to transition from employee to business owner.' },
      { role: 'Freelance Headhunters', desc: 'Solo recruiters seeking to formalize their business, sign direct enterprise clients, and increase billing rates.' },
      { role: 'HR Consultancies', desc: 'Small consultancy founders looking to refine client acquisition, commercial terms, and scaling systems.' },
    ],
    defaultToolsCovered: [
      { category: 'Agency Tech Stack', tools: ['Zoho Recruit', 'Google Workspace for Business', 'Calendly'] },
      { category: 'B2B Outreach', tools: ['LinkedIn Sales Navigator', 'Hunter.io / Apollo.io', 'Lemlist / Mailshake'] },
      { category: 'Invoicing & Finance', tools: ['Zoho Books', 'QuickBooks', 'MS Excel Financial Models'] },
      { category: 'Contract Templates', tools: ['Lawyer-vetted Client SLA', 'NDA Templates', 'Candidate Consent Forms', 'Freelancer Agreements'] },
    ],
    defaultCertificationDetails: {
      title: 'Executive Certification in Recruitment Agency Management & HR Entrepreneurship',
      bullets: [
        'Verifiable QR Code on digital credentials with permanent institutional verification.',
        'Complete Agency Launchpad Toolkit (10+ Editable Contracts, Proposal Decks, Outreach Scripts, Trackers).',
        '1-on-1 Business Plan review with experienced agency founders.',
      ],
    },
    defaultFaqs: [
      { q: 'Can I start a recruitment agency from home with minimal capital?', a: 'Yes. Recruitment is a service business that can be operated remotely with a laptop, phone, internet, and basic sourcing subscriptions.' },
      { q: 'Do I need prior recruitment experience to succeed?', a: 'While prior HR/recruitment or B2B sales experience is advantageous, the program provides comprehensive end-to-end guidance.' },
      { q: 'Are legal contract templates included in the course?', a: 'Yes. You receive fully editable, lawyer-vetted Client Service Agreements (SLAs), Non-Disclosure Agreements (NDAs), and Invoicing templates.' },
      { q: 'How long does it typically take to sign the first corporate client?', a: 'By following the outreach methodology in Module 2, most active students sign their first client contract within 30 to 45 days of launch.' },
      { q: 'What is the course fee and installment schedule?', a: 'The fee is ₹22,000 (all-inclusive), payable in 2 installments or via zero-cost monthly EMI options starting at ₹3,667/month.' },
    ],
    defaultLmsStructure: [
      { week: 'Week 1', title: 'Agency Business Models & Niche Strategy', desc: 'Agency Business Models, Niche Identification, Market Analysis, and Value Proposition.' },
      { week: 'Week 2', title: 'Company Incorporation & Compliance', desc: 'Company Registration, GST/MSME Compliance, Banking, Domain, and Corporate Brand Assets.' },
      { week: 'Week 3', title: 'Client Prospecting & B2B Outreach', desc: 'Target Client Prospecting, Building CXO Databases, and Outbound Cold Outreach Systems.' },
      { week: 'Week 4', title: 'Commercial Negotiations & SLAs', desc: 'Commercial Negotiations, Contingency vs. Retained Fees, SLAs, NDAs, and Contract Closures.' },
      { week: 'Week 5', title: 'Lean Tech Stack & 48-Hour Delivery', desc: 'Lean Tech Stack Setup, Talent Bench Sourcing, and the 48-Hour Shortlist Delivery Standard.' },
      { week: 'Week 6', title: 'Candidate Submissions & Offer Control', desc: 'Candidate Dossier Submissions, Interview Management, Offer Control, and Drop-off Prevention.' },
      { week: 'Week 7', title: 'Invoicing, Collections & Cash Flow', desc: 'GST Invoicing, Payment Collections, Debt Recovery, and MSME Protections.' },
      { week: 'Week 8', title: 'Financial Planning & Agency Scaling', desc: 'Financial Planning, Commission Models for Freelancers, Agency Scaling, and Final Business Plan Review.' },
    ],
  },

  'corporate_traning_tag': {
    slugKey: 'corporate_traning_tag',
    route: '/hr-corporate-training-course',
    defaultTitle: 'HR Corporate Training Course',
    defaultShortDescription: 'Empower your in-house talent acquisition and Human Resources teams with our customized corporate training. Upskills internal recruiters and hiring managers in advanced talent mapping, passive sourcing, structured STAR interviewing, and recruitment analytics.',
    defaultOverview: 'In high-performance corporate environments, the capability of the internal talent acquisition team directly impacts business velocity and organizational growth. The HR Corporate Training Course is an enterprise-grade capability-building program engineered to optimize your company’s internal hiring machine. We audit your recruitment metrics, train internal recruiters on advanced Boolean search and passive talent mapping, standardize competency scorecards for hiring managers, and reduce agency dependency.',
    defaultDuration: 'Flexible (2–6 Wks)',
    defaultDurationShort: 'Bespoke',
    badge: 'Enterprise Track',
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
        title: 'Talent Acquisition Process Audit & Strategic Alignment',
        duration: 'Week 1 (6 Hours Interactive Workshop)',
        accent: '#7C3AED',
        description: 'Audit internal hiring bottlenecks, standardize the job intake process, and align on hiring SLAs.',
        learningObjectives: [
          'Audit current internal hiring bottlenecks, conversion funnels, and recruitment spend.',
          'Standardize the Job Requisition and Intake process between Recruiters and Hiring Managers.',
          'Benchmark your organization\'s candidate experience against industry standards.',
          'Establish clear SLAs, turnaround times (TAT), and accountability metrics.',
        ],
        details: [
          'Analyzing internal recruitment funnel metrics: Sourcing-to-Interview, Interview-to-Offer',
          'The Strategic Intake Meeting: Aligning on core competencies, culture fit & timelines',
          'Employer Value Proposition (EVP) audit: Identifying why candidates accept or reject offers',
          'Standardizing Service Level Agreements (SLAs) across business units',
        ],
        practicalActivity: 'Map your company’s current hiring workflow and co-create a standardized Job Requisition Intake Template.',
      },
      {
        week: 'Module 2',
        title: 'Advanced Sourcing & Direct Talent Pipeline Architecture',
        duration: 'Week 2 (8 Hours Sourcing Labs)',
        accent: '#6D28D9',
        description: 'Reduce agency dependency by mastering advanced Boolean search, LinkedIn Recruiter, and passive candidate engagement.',
        learningObjectives: [
          'Reduce external agency dependency by building strong direct sourcing capabilities.',
          'Master advanced Boolean search, LinkedIn Recruiter workflows, and Google X-Ray.',
          'Engage high-caliber passive talent using customized, brand-aligned outreach sequences.',
          'Build proprietary talent pools for recurring and niche technical mandates.',
        ],
        details: [
          'Complex Boolean string construction for niche corporate roles',
          'Advanced LinkedIn Recruiter seat optimization: Pipeline projects, custom tags & InMail analytics',
          'Niche talent search: GitHub, Stack Overflow, Behance & conference attendee lists',
          'Crafting high-converting corporate outreach messages that achieve >40% response rates',
        ],
        practicalActivity: 'Live Sourcing Hackathon: Internal team sources 20 high-priority passive profiles for an open internal requisition.',
      },
      {
        week: 'Module 3',
        title: 'Structured Interviewing & Objective Selection for Managers',
        duration: 'Week 3 (6 Hours Joint Workshop)',
        accent: '#5B21B6',
        description: 'Eliminate unconscious bias, develop role-specific scorecards, and train hiring managers on STAR interviewing.',
        learningObjectives: [
          'Eliminate unconscious bias and subjective "gut-feel" hiring decisions.',
          'Design role-specific competency matrices and standardized rating scorecards.',
          'Train technical and functional hiring managers to conduct behavioral STAR interviews.',
          'Deliver a consistent, professional, and respectful candidate interview experience.',
        ],
        details: [
          'Types of cognitive bias in interviews (Halo effect, Confirmation bias) & mitigation',
          'Developing behavioral and situational interview question banks mapped to values',
          'Constructing objective 5-point evaluation scorecards for interview panels',
          'Training interviewers on candidate-friendly communication & employer brand representation',
        ],
        practicalActivity: 'Conduct mock panel interviews with real-time feedback and design a Competency Interview Scorecard for 2 critical roles.',
      },
      {
        week: 'Module 4',
        title: 'Recruitment Analytics, Executive Reporting & Retention',
        duration: 'Week 4 (6 Hours Interactive Session)',
        accent: '#4C1D95',
        description: 'Build executive hiring dashboards, track Cost-per-Hire and Quality-of-Hire, and eliminate offer ghosting.',
        learningObjectives: [
          'Build and maintain real-time recruitment analytics dashboards.',
          'Track and report Cost-per-Hire, Source Channel Efficiency, and Quality-of-Hire.',
          'Implement post-offer engagement strategies to reduce joining dropouts.',
          'Establish 30-60-90 day onboarding integration touchpoints.',
        ],
        details: [
          'Core corporate TA metrics: Time-to-Fill, Offer Acceptance Rate & Sourcing ROI',
          'Designing executive-ready TA dashboards using PowerBI, Tableau, or Looker Studio',
          'Post-offer engagement: Pre-boarding communication cadences & welcome calls',
          'Measuring Quality-of-Hire and first-year employee retention correlations',
        ],
        practicalActivity: 'Build an Executive Recruitment Dashboard and design a 30-day Post-Offer Pre-boarding Cadence.',
      },
    ],
    defaultLearningOutcomes: [
      'Increase direct in-house sourcing share to significantly cut third-party agency recruitment fees.',
      'Streamline hiring workflows to reduce average days-to-hire across technical and non-technical roles.',
      'Ensure complete alignment between recruiters and hiring managers before opening requisitions.',
      'Equip internal teams with modern Boolean, social, and passive talent engagement techniques.',
      'Standardize interview scorecards and STAR questioning frameworks across all hiring panels.',
      'Implement proactive pre-boarding touchpoints to minimize offer dropouts and candidate ghosting.',
      'Track and present high-impact recruitment analytics dashboards to Board and HR leadership.',
      'Deliver a consistent, high-quality candidate experience that strengthens organizational reputation.',
    ],
    defaultWhoShouldEnroll: [
      { role: 'In-House Talent Acquisition Teams', desc: 'Corporate recruiters, talent sourcers, and TA team leads.' },
      { role: 'HR Business Partners (HRBPs)', desc: 'HR generalists and business partners managing departmental staffing.' },
      { role: 'Hiring Managers & Department Heads', desc: 'Engineering leads and department heads actively interviewing candidate panels.' },
    ],
    defaultToolsCovered: [
      { category: 'Enterprise ATS', tools: ['Workday', 'Greenhouse', 'SuccessFactors', 'Taleo', 'Zoho Recruit'] },
      { category: 'Sourcing & Talent Intelligence', tools: ['LinkedIn Recruiter Enterprise', 'LinkedIn Talent Insights', 'Google X-Ray'] },
      { category: 'Analytics & Dashboards', tools: ['PowerBI', 'MS Excel Advanced Dashboards', 'Google Looker Studio'] },
    ],
    defaultCertificationDetails: {
      title: 'Corporate Certificate in Strategic Talent Acquisition & Modern Recruitment Operations',
      bullets: [
        'Company-branded digital certificate with individual QR Code verification.',
        'Permanent access to corporate workshop recordings and editable hiring kits.',
        '60-day post-training implementation review and metric audit.',
      ],
    },
    defaultFaqs: [
      { q: 'Can the corporate curriculum be customized for our specific industry?', a: 'Yes. All case studies, sourcing drills, and scorecards are tailored specifically to your industry sector (e.g., IT, Manufacturing, BFSI, Healthcare).' },
      { q: 'Is training conducted on-site or virtually?', a: 'We offer flexible delivery options: interactive on-premise workshops at your corporate facility or live virtual masterclasses.' },
      { q: 'What is the recommended team size per cohort?', a: 'We accommodate cohorts ranging from small specialized teams (5–10 recruiters) up to enterprise-wide batches (50–100+ members).' },
      { q: 'Can we include technical hiring managers in the interview training modules?', a: 'Yes. Module 3 is specifically designed as a joint workshop for recruiters and technical hiring managers.' },
      { q: 'How do you measure the ROI and impact of the corporate training?', a: 'We establish baseline metrics before the program and conduct 30-day and 60-day post-training audits to measure quantitative improvements.' },
    ],
    defaultLmsStructure: [
      { week: 'Module 01 (Week 1)', title: 'Process Audit & Intake Alignment', desc: 'Recruitment Process Audit, SLA Definition, and Hiring Manager Intake Alignment.' },
      { week: 'Module 02 (Week 2)', title: 'Advanced Sourcing & Pipeline Architecture', desc: 'Advanced Boolean Sourcing, Talent Mapping, and Direct Passive Candidate Engagement.' },
      { week: 'Module 03 (Week 3)', title: 'Structured STAR Interviewing & Scorecards', desc: 'Structured STAR Interviewing, Competency Scorecards, and Unconscious Bias Elimination.' },
      { week: 'Module 04 (Week 4)', title: 'Recruitment Analytics & Retention Strategy', desc: 'Recruitment Analytics, Executive Dashboards, Post-Offer Engagement, and Retention Strategy.' },
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
    const title = dbCourse?.title &&
      dbCourse.title !== 'Degree Courses' &&
      dbCourse.title !== 'Certification Courses' &&
      dbCourse.title !== 'Entrepreneur Courses' &&
      dbCourse.title !== 'Corporate Traning Courses'
        ? dbCourse.title
        : config.defaultTitle

    // 2. Resolve Description: If DB has an old raw module dump, clean it to default short description
    let description = dbCourse?.description ? stripHtml(dbCourse.description) : config.defaultShortDescription
    if (description.startsWith('Module 1:') || description.length < 20) {
      description = config.defaultShortDescription
    }

    const shortDescription = config.defaultShortDescription
    const overview = config.defaultOverview

    const totalStudents = dbCourse?.totalStudents && dbCourse.totalStudents > 0
      ? dbCourse.totalStudents
      : 5000

    const rating = dbCourse?.rating ? Number(dbCourse.rating) : 5.0

    // 3. Resolve Pricing
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

    // 4. Resolve Curriculum
    let curriculum: DynamicCurriculumModule[] = []

    if (dbCourse && dbCourse.modules && dbCourse.modules.length > 0) {
      curriculum = dbCourse.modules.map((m, idx) => {
        const configMatch = config.defaultCurriculum[idx]
        const chapterDetails = m.chapters.flatMap((c) => c.topics.map((t) => t.title))
        const details = chapterDetails.length > 0
          ? chapterDetails
          : (m.chapters.map((c) => c.title).length > 0 ? m.chapters.map((c) => c.title) : (configMatch?.details || [m.description || 'Interactive hands-on training module.']))

        return {
          id: m.id,
          week: configMatch?.week || `Module ${idx + 1}`,
          title: m.title,
          duration: configMatch?.duration,
          description: m.description || configMatch?.description,
          accent: config.accent,
          learningObjectives: configMatch?.learningObjectives,
          details,
          practicalActivity: configMatch?.practicalActivity,
        }
      })
    }

    if (curriculum.length === 0) {
      curriculum = config.defaultCurriculum
    }

    // 5. Resolve FAQs
    let faqs: DynamicFaqItem[] = []
    if (category?.faqs && category.faqs.length > 0) {
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

    // 6. Next Batch Date
    const nextBatchDate = dbCourse?.batches?.[0]?.startDate
      ? new Date(dbCourse.batches[0].startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
      : '13 Oct 2026'

    return {
      id: dbCourse?.id || 1,
      slug: categorySlug,
      route: config.route,
      title,
      shortDescription,
      description,
      overview,
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
      learningOutcomes: config.defaultLearningOutcomes,
      whoShouldEnroll: config.defaultWhoShouldEnroll,
      toolsCovered: config.defaultToolsCovered,
      certificationDetails: config.defaultCertificationDetails,
      faqs,
      lmsStructure: config.defaultLmsStructure,
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
      shortDescription: config.defaultShortDescription,
      description: config.defaultShortDescription,
      overview: config.defaultOverview,
      categoryName: config.defaultTitle,
      totalStudents: 5000,
      rating: 5.0,
      duration: config.defaultDuration,
      startDate: '13 Oct 2026',
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
      learningOutcomes: config.defaultLearningOutcomes,
      whoShouldEnroll: config.defaultWhoShouldEnroll,
      toolsCovered: config.defaultToolsCovered,
      certificationDetails: config.defaultCertificationDetails,
      faqs: config.defaultFaqs,
      lmsStructure: config.defaultLmsStructure,
      features: [],
    }
  }
}

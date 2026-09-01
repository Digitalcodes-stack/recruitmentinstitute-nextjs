export interface CourseBrochure {
  id: string
  slug: string
  title: string
  subtitle: string
  category: string
  badge: string
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels'
  duration: string
  batchHours: string
  mode: string
  rating: number
  reviewsCount: number
  studentsTrained: number
  placementRate: string
  originalFee: number
  discountedFee: number
  emiOption: string
  description: string
  keyHighlights: string[]
  whoShouldAttend: string[]
  toolsCovered: { name: string; icon: string; category: string }[]
  modules: {
    moduleNumber: number
    title: string
    duration: string
    objective: string
    topics: string[]
    practicalOutcome: string
  }[]
  placementBenefits: string[]
  certificationTitle: string
  certificationDescription: string
  upcomingBatches: {
    type: string
    timing: string
    days: string
    seatsLeft: number
    status: 'Fast Filling' | 'Open' | 'Few Seats'
  }[]
  faqs: { question: string; answer: string }[]
}

export const COURSE_BROCHURES: CourseBrochure[] = [
  {
    id: 'end-to-end-recruitment-training',
    slug: 'end-to-end-recruitment-training',
    title: 'End-to-End Recruitment Training Program',
    subtitle: 'India’s #1 Practical Talent Acquisition & Executive Headhunting Master Program',
    category: 'Recruitment & Sourcing',
    badge: 'FLAGSHIP PROGRAM',
    level: 'All Levels',
    duration: '6 to 8 Weeks',
    batchHours: '40+ Hours Live + 60+ Hours Practical Projects',
    mode: 'Live Interactive Online & Classroom Pune',
    rating: 4.96,
    reviewsCount: 384,
    studentsTrained: 3200,
    placementRate: '100% Placement Support',
    originalFee: 24999,
    discountedFee: 14999,
    emiOption: 'EMI starting @ ₹1,999/month',
    description:
      'Transform into an industry-ready Talent Acquisition Specialist. Master live Boolean search strings, LinkedIn Recruiter mastery, Naukri/Monster portals, enterprise ATS software, headhunting, screening, offer rollouts, salary negotiations, and closing complex mandates across IT, Non-IT, BFSI, and Healthcare sectors.',
    keyHighlights: [
      '100% Live Practical Hands-on Training with Real Candidate Profiles',
      'Mastery of LinkedIn Recruiter, Naukri RMS, Indeed, and Boolean Search Logic',
      'Live Case Studies on Sourcing Niche Tech & Executive Leadership Mandates',
      'End-to-End Offer Negotiation, Counter-Offer Handling & Onboarding Mastery',
      'Guaranteed Placement Assistance with 150+ Hiring Partner Companies',
      '1-on-1 Resume & LinkedIn Optimization by Ex-Google & Amazon Talent Mentors',
    ],
    whoShouldAttend: [
      'Fresh Graduates (B.Com, BBA, BA, B.Sc, B.Tech, MBA HR) looking to start a lucrative recruitment career',
      'Junior HR Recruiters looking to master modern sourcing & boost salary packages',
      'Career-gap candidates seeking a confident return to corporate HR',
      'Agency Recruiters aiming to switch to high-paying In-House Corporate Talent Acquisition roles',
    ],
    toolsCovered: [
      { name: 'LinkedIn Recruiter', icon: '💼', category: 'Sourcing & InMail' },
      { name: 'Naukri Resdex & RMS', icon: '🔍', category: 'Portal Sourcing' },
      { name: 'Boolean X-Ray Search', icon: '⚡', category: 'Advanced Search' },
      { name: 'ATS (Greenhouse/Lever/Zoho)', icon: '📊', category: 'Applicant Tracking' },
      { name: 'Salary Benchmarking Calculators', icon: '💰', category: 'Offer Negotiation' },
      { name: 'Canva / Outreach Email Copy', icon: '✉️', category: 'Candidate Engagement' },
    ],
    modules: [
      {
        moduleNumber: 1,
        title: 'Recruitment Fundamentals & Modern TA Ecosystem',
        duration: 'Week 1 (6 Hours)',
        objective: 'Build a rock-solid understanding of recruitment lifecycles and business hiring requirements.',
        topics: [
          'Overview of IT, Non-IT, BFSI, Healthcare, and Engineering Recruitment',
          'Decoding Job Descriptions (JDs) and intake meetings with Hiring Managers',
          'Recruiter KPIs & Metrics: Time-to-Fill, Cost-per-Hire, Source Mix & Pipeline Ratios',
          'Staffing Agencies vs RPO vs In-House Talent Acquisition workflows',
        ],
        practicalOutcome: 'Create a structured Job Intake Brief & Candidate Assessment Persona for live mandates.',
      },
      {
        moduleNumber: 2,
        title: 'Advanced Boolean Logic & Talent Sourcing Mastery',
        duration: 'Week 2 (8 Hours)',
        objective: 'Master Boolean operators to find top 5% hidden talent who never apply directly.',
        topics: [
          'Boolean Operators (AND, OR, NOT, Quotations, Parentheses, Wildcards)',
          'Building Complex Search Strings for Niche Tech (Java, React, DevOps, AI, Data Science)',
          'Non-IT & Sales Talent Search Strings (B2B Sales, Plant HR, Finance, Supply Chain)',
          'Google X-Ray Search on GitHub, StackOverflow, Medium, Behance, and Meetup',
          'Bypassing Portal Search Limits & Extracting Verified Contact Details',
        ],
        practicalOutcome: 'Execute 5 live Boolean search strings and build a qualified 50-candidate talent pipeline.',
      },
      {
        moduleNumber: 3,
        title: 'Naukri, Monster & Job Board Dominance',
        duration: 'Week 3 (6 Hours)',
        objective: 'Extract maximum ROI from India’s top job portals.',
        topics: [
          'Naukri Resdex Advanced Filters (Functional Area, Key Skills, CTC, Notice Period)',
          'Writing High-Converting Job Postings that rank #1 on search results',
          'Handling Active vs Passive job seekers and instant WhatsApp/SMS campaigns',
          'Indeed, Shine, TimesJobs & Free Job Board distribution techniques',
        ],
        practicalOutcome: 'Post live job ads and shortlist 20 verified profiles meeting 100% mandatory JD criteria.',
      },
      {
        moduleNumber: 4,
        title: 'LinkedIn Recruiter & Social Headhunting',
        duration: 'Week 4 (8 Hours)',
        objective: 'Turn LinkedIn into your 24/7 talent generation machine.',
        topics: [
          'Setting up an All-Star Recruiter Profile that builds candidate trust',
          'LinkedIn Search Filters: Spotlights, Past Companies, Open to Work & Years in Role',
          'Crafting High-Response InMail Copy (>45% open and reply rate frameworks)',
          'Passive Candidate Engagement & Building Long-Term Talent Pools',
        ],
        practicalOutcome: 'Send 10 personalized InMail outreach templates and secure 3 candidate screening calls.',
      },
      {
        moduleNumber: 5,
        title: 'Screening, Competency Interviewing & Assessment',
        duration: 'Week 5 (6 Hours)',
        objective: 'Evaluate technical and behavioral competencies accurately in 15 minutes.',
        topics: [
          'Conducting the 15-Minute Telephonic Screening Call',
          'STAR Methodology (Situation, Task, Action, Result) for behavioral evaluation',
          'Verifying Notice Period genuineness & early release strategies',
          'Red Flags to spot: job hopping, fabricated experience, fake certificates',
        ],
        practicalOutcome: 'Conduct a recorded mock screening call with feedback from senior corporate mentors.',
      },
      {
        moduleNumber: 6,
        title: 'Salary Negotiation, Counter-Offers & Onboarding',
        duration: 'Week 6 (6 Hours)',
        objective: 'Close candidates without budget blowouts and prevent last-minute offer dropouts.',
        topics: [
          'Decoding Salary Slips: Fixed, Variable, Allowances, PF, Gratuity & ESOPs',
          'Calculating Fair Salary Hikes (20%–45%) matching market benchmarking data',
          'Counter-Offer Inoculation: How to address retention attempts by current employers',
          'Pre-Onboarding Engagement: Keeping candidates excited between offer and joining date',
        ],
        practicalOutcome: 'Simulate a high-stakes salary negotiation and draft an official Offer Letter document.',
      },
    ],
    placementBenefits: [
      'Dedicated Placement Officer with 1-on-1 interview scheduling',
      'Exclusive access to Recruitment Institute Internal Job Portal & Referral Network',
      '3 Mock Interview Rounds with Senior HR Leaders (IT, Non-IT & Corporate TA)',
      'ATS-Compliant Resume Makeover & LinkedIn Profile Revamp',
      'Lifetime Alumni Community Access for job sharing & industry updates',
    ],
    certificationTitle: 'Certified Talent Acquisition Specialist (CTAS)',
    certificationDescription:
      'Issued by Recruitment Institute upon completion of live assessments, portfolio submission, and mock interview clearance. Recognized by 150+ corporate employers across India.',
    upcomingBatches: [
      { type: 'Weekday Evening Batch', timing: '7:30 PM - 8:30 PM (Mon-Fri)', days: 'Monday to Friday', seatsLeft: 4, status: 'Fast Filling' },
      { type: 'Weekend Fast-Track Batch', timing: '11:00 AM - 1:00 PM (Sat-Sun)', days: 'Saturday & Sunday', seatsLeft: 6, status: 'Open' },
      { type: 'Pune Classroom Batch', timing: '10:30 AM - 12:30 PM (Sat-Sun)', days: 'FC Road, Pune Campus', seatsLeft: 2, status: 'Few Seats' },
    ],
    faqs: [
      {
        question: 'Do I need any prior recruitment experience?',
        answer: 'No! The course starts from ground zero and takes you to advanced headhunting skills with live practical assignments.',
      },
      {
        question: 'Will I get practical access to portals and tools?',
        answer: 'Yes, you will work on live recruiter portals, practice Boolean queries, and use ATS systems during class sessions.',
      },
      {
        question: 'How does the placement support work?',
        answer: 'Upon finishing your capstone project and passing mock interviews, our dedicated placement cell connects you directly with our 150+ hiring partner companies.',
      },
    ],
  },
  {
    id: 'hr-courses-for-beginners',
    slug: 'hr-courses-for-beginners',
    title: 'HR Generalist & Operations for Beginners',
    subtitle: 'Complete Foundation in Recruitment, Payroll, Statutory Compliance & HR Operations',
    category: 'HR Generalist',
    badge: 'BEST FOR FRESHERS',
    level: 'Beginner',
    duration: '6 Weeks',
    batchHours: '36 Hours Live Sessions + HR Template Kit',
    mode: 'Live Online & Pune Classroom',
    rating: 4.94,
    reviewsCount: 290,
    studentsTrained: 2400,
    placementRate: '100% Placement Support',
    originalFee: 19999,
    discountedFee: 11999,
    emiOption: 'EMI starting @ ₹1,499/month',
    description:
      'The definitive launchpad for aspiring HR professionals. Master end-to-end HR Generalist responsibilities including talent acquisition basics, onboarding, employee engagement, payroll calculations, PF/ESIC statutory compliance, leave & attendance management, and performance appraisals.',
    keyHighlights: [
      'Comprehensive 360° coverage of HR Generalist, Payroll, and Recruitment',
      'Live Hands-on Excel Payroll Calculation with CTC Breakdown & Payslips',
      'In-Depth Statutory Compliance: PF, ESIC, Gratuity, Bonus & POSH Guidelines',
      'Ready-to-Use 100+ Corporate HR Templates (Offer Letters, Policies, NDAs)',
      'Mock Interviews and Dedicated Placement Referrals',
    ],
    whoShouldAttend: [
      'Fresh MBA/BBA HR, B.Com, BA, and B.Sc Graduates entering human resources',
      'Admin, customer support, or operations professionals wanting to transition into HR',
      'Junior HR Executives looking to expand beyond basic recruiting into core HR operations',
    ],
    toolsCovered: [
      { name: 'Advanced Excel for HR', icon: '📈', category: 'Data & Payroll' },
      { name: 'HRMS Portals', icon: '🏢', category: 'Employee Lifecycle' },
      { name: 'Govt PF & ESIC Portals', icon: '🏛️', category: 'Statutory Filings' },
      { name: 'Zoho People / Keka ATS', icon: '⚙️', category: 'Operations' },
    ],
    modules: [
      {
        moduleNumber: 1,
        title: 'Core HR Lifecycle & Corporate Policy Frameworks',
        duration: 'Week 1 (6 Hours)',
        objective: 'Understand human resource architecture and employee lifecycle stages from hire to retire.',
        topics: [
          'Evolution of HR: From Personnel Management to Strategic Business Partner (HRBP)',
          'Drafting HR Policies: Leave Policy, Code of Conduct, Work From Home & POSH',
          'Employee Handbook Creation & Compliance Documentation',
        ],
        practicalOutcome: 'Draft an official Employee Code of Conduct and Onboarding Checklist.',
      },
      {
        moduleNumber: 2,
        title: 'Recruitment & Selection Basics for Generalists',
        duration: 'Week 2 (6 Hours)',
        objective: 'Learn rapid candidate sourcing, screening, and interview scheduling.',
        topics: [
          'Writing clear Job Descriptions & Job Specifications',
          'Sourcing on Naukri, LinkedIn, and Free Job Boards',
          'Shortlisting, screening calls, and interview coordination',
        ],
        practicalOutcome: 'Conduct a simulated intake session and shortlist suitable profiles.',
      },
      {
        moduleNumber: 3,
        title: 'Joining, Documentation & Seamless Onboarding',
        duration: 'Week 3 (6 Hours)',
        objective: 'Deliver an immaculate day-one employee onboarding experience.',
        topics: [
          'Pre-joining document verification and background check (BGV) workflows',
          'Drafting Appointment Letters, NDAs, Non-Compete & Relieving Letters',
          'Employee code generation, asset handover, and orientation programs',
        ],
        practicalOutcome: 'Create a complete new-hire joining docket and onboarding kit.',
      },
      {
        moduleNumber: 4,
        title: 'Payroll Management & CTC Structuring in Excel',
        duration: 'Week 4 (6 Hours)',
        objective: 'Calculate error-free monthly payroll, taxes, and CTC structures.',
        topics: [
          'Gross Salary vs Basic vs HRA vs Special Allowances vs Net In-Hand Salary',
          'Attendance & Leave reconciliation (LOP, Earned Leave, Casual Leave)',
          'Income Tax (Old vs New Regime basics), TDS calculations on salary',
          'Generating Monthly Salary Slips and Bank Salary Transfer Advice',
        ],
        practicalOutcome: 'Build an automated Excel payroll sheet for 50 employees with formulas.',
      },
      {
        moduleNumber: 5,
        title: 'Statutory Compliances: PF, ESIC, Gratuity & Labor Laws',
        duration: 'Week 5 (6 Hours)',
        objective: 'Master India statutory compliance rules and prevent legal non-compliance.',
        topics: [
          'Provident Fund (EPF/EPS) rules, employer/employee contribution rates & UAN filing',
          'ESIC eligibility, coverage, contribution calculation, and benefits',
          'Payment of Gratuity Act formula & calculation rules',
          'POSH (Prevention of Sexual Harassment) committee setup and compliance reporting',
        ],
        practicalOutcome: 'Calculate exact PF, ESIC, and Gratuity liability for sample salary bands.',
      },
      {
        moduleNumber: 6,
        title: 'PMS, Employee Engagement & Exit Management',
        duration: 'Week 6 (6 Hours)',
        objective: 'Handle appraisals, grievances, full & final settlements, and exit interviews.',
        topics: [
          'Performance Management Systems: OKRs, KPIs, 360-Degree Feedback & Bell Curves',
          'Employee Engagement initiatives, rewards, and retention strategies',
          'Resignation acceptance, notice period buyout, and exit interview surveys',
          'Full & Final Settlement (FnF) statement preparation and service certificates',
        ],
        practicalOutcome: 'Prepare an accurate Full & Final Settlement (FnF) calculation docket.',
      },
    ],
    placementBenefits: [
      'Direct interview referrals for HR Trainee, HR Executive, and HR Generalist roles',
      'Complete HR Master Kit with 100+ editable Word/Excel templates',
      '2 Mock Interview Rounds focused on HR Generalist questions',
      'Resume revamp highlighting core statutory compliance and payroll skills',
    ],
    certificationTitle: 'Certified HR Generalist & Operations Professional (CHGP)',
    certificationDescription: 'Accredited certificate verifying practical HR Generalist, Payroll, and Labor Law skills.',
    upcomingBatches: [
      { type: 'Weekday Evening Batch', timing: '6:30 PM - 7:30 PM (Mon-Fri)', days: 'Monday to Friday', seatsLeft: 5, status: 'Fast Filling' },
      { type: 'Weekend Live Batch', timing: '3:00 PM - 5:00 PM (Sat-Sun)', days: 'Saturday & Sunday', seatsLeft: 8, status: 'Open' },
    ],
    faqs: [
      {
        question: 'Does this course cover practical payroll calculations in Excel?',
        answer: 'Yes! You will build complete automated payroll sheets with real formulas, tax calculations, and PF/ESIC deductions.',
      },
      {
        question: 'Will I get ready templates for HR letters and policies?',
        answer: 'Yes, all enrolled candidates receive our Master HR Kit containing 100+ editable policies, offer letters, NDAs, and FnF templates.',
      },
    ],
  },
  {
    id: 'hr-entrepreneurship-program',
    slug: 'hr-entrepreneurship-program',
    title: 'HR Entrepreneurship & Recruitment Agency Setup',
    subtitle: 'Launch, Operate, and Scale Your Own Profitable HR Recruitment & Staffing Consultancy',
    category: 'Entrepreneurship & Business',
    badge: 'BUSINESS ACCELERATOR',
    level: 'Advanced',
    duration: '8 Weeks',
    batchHours: '48 Hours Live Mentorship + 1-on-1 Business Coaching',
    mode: 'Live Mentorship & 1-on-1 Advisory',
    rating: 4.98,
    reviewsCount: 180,
    studentsTrained: 950,
    placementRate: 'Business Setup Guarantee',
    originalFee: 39999,
    discountedFee: 24999,
    emiOption: 'EMI starting @ ₹3,499/month',
    description:
      'A complete step-by-step master blueprint for aspiring founders and senior recruiters to start, register, client-acquire, and scale a 6-to-7 figure recruitment consultancy or staffing agency in India and international markets.',
    keyHighlights: [
      'Complete Agency Setup Blueprint: Company Registration, GST, MSME, Branding & Website',
      'B2B Client Acquisition Frameworks: Cold Email, LinkedIn Lead Gen & CXO Pitching',
      'Client Agreement Templates: Standard Contingent, Retained Search & SLA Contracts',
      'Pricing & Fee Structuring: 8.33% to 15% Commercials, Invoicing & Payment Terms',
      'Building & Managing a High-Performance Team of Virtual & In-House Recruiters',
      'Live Case Studies from 20+ Successful Consultancy Founders Launched by RI',
    ],
    whoShouldAttend: [
      'Senior Recruiters & HR Managers wanting to start their own staffing agency',
      'Entrepreneurs seeking high-margin, low-capital B2B service business models',
      'Freelance Recruiters aiming to scale into a formal agency with corporate clients',
    ],
    toolsCovered: [
      { name: 'Apollo.io / Hunter.io', icon: '🎯', category: 'B2B Lead Generation' },
      { name: 'Lusha / Lead411', icon: '📞', category: 'CXO Contact Finding' },
      { name: 'Zoho Recruit / Recruitee', icon: '⚡', category: 'Agency ATS' },
      { name: 'QuickBooks / Zoho Books', icon: '📑', category: 'B2B Invoicing' },
    ],
    modules: [
      {
        moduleNumber: 1,
        title: 'Business Architecture, Legal Setup & Niche Selection',
        duration: 'Week 1-2 (12 Hours)',
        objective: 'Establish your company structure, branding, and profitable niche specialization.',
        topics: [
          'Selecting High-Margin Niches: Tech/IT, BFSI, Healthcare, Executive Search or Blue-Collar',
          'Entity Registration: Pvt Ltd vs LLP vs Sole Proprietorship, GST & MSME setup',
          'Consultancy Branding: Name, Logo, Corporate Deck, Website & Email Infrastructure',
        ],
        practicalOutcome: 'Define your core niche, value proposition, and client-facing corporate deck.',
      },
      {
        moduleNumber: 2,
        title: 'B2B Client Acquisition & Lead Generation Systems',
        duration: 'Week 3-4 (12 Hours)',
        objective: 'Sign your first 3 paying corporate hiring clients in 60 days.',
        topics: [
          'Identifying Hiring Companies & Decision Makers (CHROs, VPs of HR, TA Heads, Founders)',
          'High-Converting Cold Email & LinkedIn Outbound Campaigns that book discovery calls',
          'Conducting the Client Pitch Call: Handling Objections, Emphasizing Speed & Quality',
          'Vendor Empanelment (VMS) documentation and master service agreements',
        ],
        practicalOutcome: 'Launch an outbound campaign targeting 100 verified TA heads and secure client meetings.',
      },
      {
        moduleNumber: 3,
        title: 'Commercial Terms, Contracts & Invoicing Frameworks',
        duration: 'Week 5-6 (12 Hours)',
        objective: 'Protect your revenue with bulletproof contracts and clear payment cycles.',
        topics: [
          'Commercial Fee Structures: Contingency (8.33%–12.5%), Retained Search (15%–25%)',
          'Replacement Guarantee clauses, exclusivity terms, and anti-poaching clauses',
          'Invoicing triggers (Date of Joining), credit periods (30-45 days), and payment follow-ups',
        ],
        practicalOutcome: 'Customize a signed Master Service Agreement (MSA) template for client onboarding.',
      },
      {
        moduleNumber: 4,
        title: 'Scaling Operations, Recruiter Hiring & Tech Stack',
        duration: 'Week 7-8 (12 Hours)',
        objective: 'Automate sourcing, hire junior recruiters, and build a recurring revenue business.',
        topics: [
          'Recruiter Incentive & Commission structures that drive high placement volume',
          'Implementing Multi-Tenant Agency ATS software and shared database systems',
          'International Recruitment: Sourcing for UAE, UK, US, and Singapore mandates',
        ],
        practicalOutcome: 'Create your 12-month business financial model and recruiter commission playbook.',
      },
    ],
    placementBenefits: [
      '1-on-1 Mentorship Sessions with Successful Consultancy Founders',
      'Exclusive Client Referral Network & Sub-Contracting Opportunities',
      'Ready Legal Kit: MSAs, NDA Templates, Vendor Empanelment Forms & Invoices',
      'Direct Guidance on Portal Licensing & Agency Discounted Tool Access',
    ],
    certificationTitle: 'Executive Certified HR Entrepreneur & Staffing Specialist',
    certificationDescription: 'Prestigious accreditation for certified recruitment business founders.',
    upcomingBatches: [
      { type: 'Executive Weekend Mastermind', timing: '4:00 PM - 7:00 PM (Sat-Sun)', days: 'Saturday & Sunday', seatsLeft: 3, status: 'Fast Filling' },
    ],
    faqs: [
      {
        question: 'How much capital do I need to start a recruitment agency?',
        answer: 'Recruitment is a zero-inventory business. You can start with basic infrastructure (laptop, internet, portal access) and minimal capital.',
      },
      {
        question: 'Will I receive legal contracts and client agreement templates?',
        answer: 'Yes, you will receive fully customized legal client agreements (MSAs), fee schedules, and vendor forms vetted by corporate legal experts.',
      },
    ],
  },
  {
    id: 'corporate-recruitment-training',
    slug: 'corporate-recruitment-training',
    title: 'Corporate Talent Acquisition & Recruiter Upskilling',
    subtitle: 'Strategic Upskilling for In-House HR Teams & Corporate Recruitment Units',
    category: 'Corporate Programs',
    badge: 'FOR ENTERPRISES & TEAMS',
    level: 'Advanced',
    duration: '4 to 6 Weeks',
    batchHours: 'Customizable Corporate Hours',
    mode: 'Enterprise Online & On-Site Corporate Workshops',
    rating: 4.95,
    reviewsCount: 115,
    studentsTrained: 1200,
    placementRate: 'Enterprise Upskilling Program',
    originalFee: 29999,
    discountedFee: 19999,
    emiOption: 'Corporate Group Discounts Available',
    description:
      'Tailored corporate capability program designed for in-house TA teams and hiring managers. Accelerate time-to-hire, lower cost-per-hire, master modern AI sourcing tools, and elevate candidate experience across all corporate hiring touchpoints.',
    keyHighlights: [
      'Customized curriculum tailored to your company’s hiring stack and industry vertical',
      'Hands-on Boolean Search, Diversity Sourcing & Passive Talent Outreach drills',
      'Structured Competency-Based Interviewing Frameworks (CBI)',
      'Data-Driven Recruiting Analytics: Pipeline Velocity, Offer Drop Analytics & Source Mix',
      'Employer Branding & High-Converting Candidate Engagement Workflows',
    ],
    whoShouldAttend: [
      'Corporate Talent Acquisition Teams & Talent Partners',
      'Hiring Managers and Tech Interview Panelists',
      'HR Leaders seeking to modernize their organization’s hiring engine',
    ],
    toolsCovered: [
      { name: 'Enterprise ATS & CRM', icon: '🏢', category: 'Hiring Operations' },
      { name: 'AI Sourcing Accelerators', icon: '🤖', category: 'Automation' },
      { name: 'Talent Analytics Dashboards', icon: '📊', category: 'Recruitment BI' },
      { name: 'LinkedIn Talent Insights', icon: '💡', category: 'Market Intelligence' },
    ],
    modules: [
      {
        moduleNumber: 1,
        title: 'Modern Sourcing Architecture & AI in Recruitment',
        duration: 'Module 1',
        objective: 'Upgrade in-house recruiters with cutting-edge talent intelligence and Boolean mastery.',
        topics: ['Advanced Boolean & Semantic AI search', 'Mapping Competitor Talent Pools', 'Diversity & Inclusion (D&I) Sourcing'],
        practicalOutcome: 'Execute high-speed talent mapping for current open requisitions.',
      },
      {
        moduleNumber: 2,
        title: 'Structured Interviewing & Assessment Standards',
        duration: 'Module 2',
        objective: 'Eliminate interviewer bias and improve hiring accuracy.',
        topics: ['Competency-Based Interviewing (CBI)', 'Scorecards & Rubric Creation', 'Calibrating interview panels'],
        practicalOutcome: 'Develop custom competency scorecards for 3 critical roles.',
      },
      {
        moduleNumber: 3,
        title: 'Candidate Experience & Offer Conversion Optimization',
        duration: 'Module 3',
        objective: 'Boost offer acceptance rates and lower renege rates.',
        topics: ['Candidate Journey Mapping', 'Proactive Counter-Offer Inoculation', 'Pre-boarding workflows'],
        practicalOutcome: 'Implement a comprehensive candidate engagement playbook.',
      },
    ],
    placementBenefits: [
      'Custom Corporate Skill Assessment Matrix & Recruiter Benchmark Report',
      'Post-training support & quarterly capability review sessions',
    ],
    certificationTitle: 'Executive Certified Corporate Talent Leader (CCTL)',
    certificationDescription: 'Awarded to enterprise team members upon completing practical capability milestones.',
    upcomingBatches: [
      { type: 'Corporate Batch Scheduling', timing: 'Custom Weekday / Weekend Slots', days: 'Tailored for Enterprise Teams', seatsLeft: 10, status: 'Open' },
    ],
    faqs: [
      {
        question: 'Can this course be customized for our industry (e.g. IT, Manufacturing, BFSI)?',
        answer: 'Yes! We customize the case studies, sourcing drills, and interview rubrics to match your exact industry vertical and hiring tech stack.',
      },
    ],
  },
  {
    id: 'advanced-recruitment-ta-masterclass',
    slug: 'advanced-recruitment-ta-masterclass',
    title: 'Advanced Talent Acquisition & Headhunting Masterclass',
    subtitle: 'Niche Tech Sourcing, Executive Search & Leadership Hiring Strategies',
    category: 'Recruitment & Sourcing',
    badge: 'EXECUTIVE SPECIALIZATION',
    level: 'Advanced',
    duration: '4 Weeks',
    batchHours: '24 Hours Intensive Weekend Masterclass',
    mode: 'Live Online Masterclass',
    rating: 4.97,
    reviewsCount: 160,
    studentsTrained: 890,
    placementRate: 'Senior Level Placement Network',
    originalFee: 21999,
    discountedFee: 13999,
    emiOption: 'EMI starting @ ₹1,799/month',
    description:
      'An elite masterclass for recruiters looking to specialize in high-billing Executive Search, Leadership Mandates, and Niche Tech Hiring (AI/ML, Cloud Architecture, DevOps, Cybersecurity, Blockchain, and VP/Director-level roles).',
    keyHighlights: [
      'Deep dive into Tech Stacks: Decoding Front-End, Back-End, DevOps, Cloud & AI/ML architectures',
      'Executive Search Methodology: Confidential Mandates, Cold Calling CXOs & Headhunting',
      'Advanced Compensation Modelling: CTC, Fixed/Variable, RSU/ESOP Grants & Retention Bonuses',
      'Direct Mentorship from Industry Headhunters with 15+ Years Leadership Hiring Experience',
    ],
    whoShouldAttend: [
      'Recruiters with 1-5 years experience wanting to move into Senior/Lead Recruiter roles',
      'Non-tech recruiters struggling with IT and engineering hiring mandates',
      'Executive search professionals seeking structured market mapping methodologies',
    ],
    toolsCovered: [
      { name: 'GitHub & StackOverflow Search', icon: '💻', category: 'Tech Sourcing' },
      { name: 'Executive Compensation Models', icon: '📈', category: 'Leadership CTC' },
      { name: 'Talent Mapping Sheets', icon: '🗺️', category: 'Market Intelligence' },
    ],
    modules: [
      {
        moduleNumber: 1,
        title: 'Deconstructing Tech Architecture for Recruiters',
        duration: 'Week 1 (6 Hours)',
        objective: 'Talk with senior engineers and architects with 100% technical fluency.',
        topics: ['Programming Languages, Frameworks, DBs, and Cloud Tech Ecosystems', 'Evaluating tech seniority vs buzzwords'],
        practicalOutcome: 'Screen live tech resumes and identify genuine hands-on technical depth.',
      },
      {
        moduleNumber: 2,
        title: 'Executive Headhunting & Confidential Mandates',
        duration: 'Week 2 (6 Hours)',
        objective: 'Engage senior VP, Director, and C-Suite candidates confidentially.',
        topics: ['Organizational Chart Mapping', 'Cold calling passive leadership candidates', 'Maintaining discreet confidentiality'],
        practicalOutcome: 'Create a full competitive talent map for a VP of Engineering position.',
      },
    ],
    placementBenefits: [
      'Executive Referrals for Lead Recruiter, Principal Consultant, and TA Manager positions',
      'Comprehensive Tech Recruiter Cheat Sheet & Engineering Stack Glossary',
    ],
    certificationTitle: 'Master Certified Talent Sourcing Architect (MTSA)',
    certificationDescription: 'Elite badge certifying advanced technical and executive search capabilities.',
    upcomingBatches: [
      { type: 'Weekend Masterclass Batch', timing: '10:00 AM - 1:00 PM (Sat-Sun)', days: 'Saturday & Sunday', seatsLeft: 4, status: 'Fast Filling' },
    ],
    faqs: [
      {
        question: 'Do I need a technical/engineering degree for this course?',
        answer: 'Not at all! We teach tech fundamentals in plain, crystal-clear business language so non-tech recruiters master tech hiring effortlessly.',
      },
    ],
  },
  {
    id: 'professional-recruitment-specialist',
    slug: 'professional-recruitment-specialist',
    title: 'Professional Recruitment Specialist Program',
    subtitle: 'Comprehensive Industry-Ready Placement Certification for Freshers & Job Seekers',
    category: 'Recruitment & Sourcing',
    badge: 'JOB READY TRACK',
    level: 'All Levels',
    duration: '6 Weeks',
    batchHours: '36 Hours Live Sessions + Live Hiring Mandates',
    mode: 'Live Online & Pune Classroom',
    rating: 4.93,
    reviewsCount: 220,
    studentsTrained: 1750,
    placementRate: '100% Placement Support',
    originalFee: 18999,
    discountedFee: 11499,
    emiOption: 'EMI starting @ ₹1,499/month',
    description:
      'Fast-track your entry into corporate recruiting. Learn core candidate sourcing, screening frameworks, portal operations, and interview scheduling with guaranteed placement assistance.',
    keyHighlights: [
      'Fast-track practical training designed specifically for immediate job placement',
      'Live portal practice on Naukri and LinkedIn',
      'Interview preparation and mock tests with real HR recruiters',
      '100% placement support with corporate referrals',
    ],
    whoShouldAttend: [
      'Fresh graduates looking for immediate corporate HR jobs',
      'Career switchers wanting an actionable, budget-friendly recruitment certification',
    ],
    toolsCovered: [
      { name: 'Naukri Recruiter', icon: '🔍', category: 'Portals' },
      { name: 'LinkedIn Search', icon: '💼', category: 'Sourcing' },
      { name: 'Google Workspace for HR', icon: '📁', category: 'Operations' },
    ],
    modules: [
      {
        moduleNumber: 1,
        title: 'Recruitment Essentials & Portal Sourcing',
        duration: 'Week 1-3 (18 Hours)',
        objective: 'Master Boolean logic, Naukri Resdex, and LinkedIn search.',
        topics: ['JD Analysis', 'Boolean operators', 'Resume screening', 'Portal search optimization'],
        practicalOutcome: 'Screen 100 profiles and shortlist 15 candidates meeting JD requirements.',
      },
      {
        moduleNumber: 2,
        title: 'Candidate Engagement, Screening & Placements',
        duration: 'Week 4-6 (18 Hours)',
        objective: 'Perform phone screening, schedule interviews, and crack your own HR job interview.',
        topics: ['Telephonic screening call', 'Interview coordination', 'HR job interview mastery'],
        practicalOutcome: 'Complete 2 mock placement interviews and clear technical assessments.',
      },
    ],
    placementBenefits: [
      'Guaranteed interview calls with hiring partner agencies and IT companies',
      'Resume revamp & LinkedIn profile boost',
    ],
    certificationTitle: 'Certified Professional Recruitment Specialist (CPRS)',
    certificationDescription: 'Industry-standard accreditation for corporate recruiters.',
    upcomingBatches: [
      { type: 'Weekday Morning Batch', timing: '10:00 AM - 11:30 AM (Mon-Fri)', days: 'Monday to Friday', seatsLeft: 6, status: 'Open' },
    ],
    faqs: [
      {
        question: 'How fast can I get placed after completing this course?',
        answer: 'Most candidates start attending placement interview rounds within 2 to 4 weeks of completing the program and mock evaluations.',
      },
    ],
  },
]

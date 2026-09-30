import type { Trainer as PrismaTrainer } from '@prisma/client'
import { TrainerItem } from '@/types/training'

/** Neutral initials avatar for trainers with no photo on file — never guess a stock photo for a real person. */
export function initialsAvatar(name: string) {
  const initials = name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="640" viewBox="0 0 480 640"><rect width="480" height="640" fill="#0F172A"/><text x="240" y="340" font-family="Arial, sans-serif" font-size="160" font-weight="700" fill="#94A3B8" text-anchor="middle" dominant-baseline="middle">${initials}</text></svg>`
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`
}

/**
 * Builds the public-facing TrainerItem for one DB trainer row.
 *
 * Historically, six named faculty had rich real biographical content (LinkedIn,
 * verified accreditation links, long-form bios) hand-curated directly into the
 * /trainers listing page as inline name-matched fallbacks. That real, previously
 * reviewed content is preserved here verbatim — nothing new is invented — so both
 * the listing page and individual /trainers/[slug] pages render identical data.
 * Any trainer edited via Admin's profileJson fields overrides these fallbacks.
 */
export function buildTrainerItem(t: PrismaTrainer): TrainerItem {
  const pj = (t.profileJson && typeof t.profileJson === 'object') ? (t.profileJson as Record<string, any>) : {}
  const lower = t.name.toLowerCase()
  const isBrahmita = lower.includes('brahmita')
  const isShesha = lower.includes('shesha') || lower.includes('shhiv') || lower.includes('mohanty')
  const isDebabrata = lower.includes('debabrata') || lower.includes('pattanayak') || lower.includes('dpattanayak')
  const isRahul = lower.includes('rahul') || lower.includes('limaye')
  const isTukuna = lower.includes('tukuna') || lower.includes('lenka')
  const isSaurav = lower.includes('saurav') || lower.includes('dey')

  let baseDesignation = t.specialization || 'Recruitment & HR Faculty'
  let baseExp = 15
  let baseCompanyEx = 'Recruitment Institute'
  let baseLinkedin = ''
  let baseQuote = 'Great recruiters connect business goals with human potential to build world-class teams.'
  let baseBio = t.bio || 'Experienced recruitment and HR practitioner at Recruitment Institute.'
  let baseLongBio = t.bio || 'Experienced recruitment and HR practitioner at Recruitment Institute.'
  let baseTags = t.specialization ? t.specialization.split(',').map((s) => s.trim()) : ['Recruitment & HR']
  let baseCerts = ['Recruitment Institute Certified Faculty']
  let baseCourses = ['End-to-End Recruitment Training']
  let baseAccreditationHighlight: { text: string; link?: string; linkLabel?: string } | undefined = undefined
  let baseImage = t.image || initialsAvatar(t.name)
  let baseRating = 4.98
  let baseReviews = 140
  let baseStudents = 1200

  if (isBrahmita) {
    baseDesignation = 'Recruitment & HR Transformation Expert'
    baseExp = 22
    baseCompanyEx = 'Talent Acquisition Leader | Recruitment Business Mentor | Corporate & MNC Hiring Specialist'
    baseLinkedin = 'https://www.linkedin.com/in/brahmita/'
    baseQuote = 'Learn from experience. Build recruitment excellence. Transform the way you hire.'
    baseBio = 'Talent Acquisition Leader, Recruitment Business Mentor and Corporate & MNC Hiring Specialist with 22+ years empowering professionals and entrepreneurs to build structured, scalable recruitment practices.'
    baseLongBio = `Talent Acquisition Leader | Recruitment Business Mentor | Corporate & MNC Hiring Specialist\n\nBrahmita Nayak is an experienced HR and Recruitment professional with deep expertise in end-to-end talent acquisition, corporate & MNC recruitment, staffing and recruitment consulting.\n\nShe brings practical industry knowledge across the complete recruitment lifecycle — from understanding client requirements and sourcing talent to screening, selection, closure and recruitment operations.\n\nHer expertise also extends to setting up and strengthening recruitment consulting and staffing businesses, helping professionals and entrepreneurs build structured, scalable recruitment practices.\n\nLearn from experience. Build recruitment excellence. Transform the way you hire.\n\nBrahmita Nayak — Empowering Recruiters, HR Professionals & Recruitment Entrepreneurs to build stronger careers and businesses.`
    baseImage = '/assets/images/trainers/brahmita_mam.jpg'
    baseRating = 4.98
    baseReviews = 146
    baseStudents = 1400
    baseTags = [
      'End-to-End Recruitment & Talent Acquisition',
      'Corporate & MNC Hiring',
      'Recruitment & Staffing Business Setup',
      'Recruitment Consulting',
      'Client & Candidate Management',
      'HR & Recruitment Transformation',
      'Recruiter Leadership & Team Building',
      'AI & Future of Recruitment',
    ]
    baseCerts = ['Talent Acquisition Leader', 'Corporate & MNC Recruitment Consultant', 'Recruitment Business Mentor', 'HR Transformation Expert']
    baseCourses = ['End-to-End Recruitment Training', 'HR Corporate Training Course', 'HR Courses for Beginners', 'Recruitment Business Accelerator']
  } else if (isShesha) {
    baseDesignation = 'AI Transformation & Recruitment Specialist | Startup & Business Growth Strategist'
    baseExp = 22
    baseCompanyEx = 'AI Business Transformation Consultant | Startup Builder & Growth Strategist'
    baseLinkedin = 'https://www.linkedin.com/in/sheshamohanty/'
    baseQuote = "AI will not replace recruiters. Recruiters who know how to use AI will outperform recruiters who don't."
    baseBio = 'AI Business Transformation Consultant, Startup Builder and Growth Strategist bridging the gap between traditional recruitment and AI-powered recruitment.'
    baseLongBio = `The future of recruitment belongs to recruiters who know how to use AI.\n\nShesha brings extensive experience across IT, business transformation, recruitment, consulting, technology and AI.\n\nHis LinkedIn profile describes him as an AI Business Transformation Consultant, Startup Builder and Growth Strategist, with active work and thought leadership around recruitment, AI and the future of work.\n\nAt Recruitment Institute, his focus is to bridge the gap between traditional recruitment and AI-powered recruitment.`
    baseImage = '/assets/images/trainers/shesha_shhiv_mohanty.jpg'
    baseRating = 4.99
    baseReviews = 158
    baseStudents = 1550
    baseTags = [
      'AI in Recruitment',
      'Generative AI for Recruiters',
      'AI-Powered Sourcing',
      'Boolean Search',
      'Recruitment Automation',
      'Candidate Screening',
      'AI-Assisted Recruitment Operations',
      'Recruitment Business Development',
      'Recruitment Agency Setup',
      'Client Acquisition',
      'Recruitment Entrepreneurship',
      'HR Technology & Future of Work',
    ]
    baseCerts = ['AI Business Transformation Consultant', 'Master AI Talent Architect', 'Generative AI for Recruiters', 'Advanced Boolean & AI-Powered Sourcing']
    baseCourses = ['AI for Recruitment', 'Corporate Recruitment Training', 'Professional Recruitment Specialist', 'HR Entrepreneurship Program']
  } else if (isDebabrata) {
    baseDesignation = 'Director HR & Talent Acquisition Leader | Recruitment & Leadership Mentor'
    baseExp = 24
    baseCompanyEx = 'Director HR & Talent Acquisition Leader | Recruitment & Leadership Mentor'
    baseLinkedin = 'https://www.linkedin.com/in/dpattanayak/'
    baseQuote = 'Recruitment is not just about filling a position. It is about finding the right person for the right business need.'
    baseBio = 'Director HR & Talent Acquisition Leader bringing 24+ years of real-world hiring expertise across organizational leadership, people management and corporate recruitment.'
    baseLongBio = `Learn Recruitment from someone who understands hiring from the leadership side.\n\nDeba brings extensive professional experience in HR, talent management, leadership and organizational hiring, with strong exposure to real-world recruitment requirements.\n\nHis experience in the hospitality sector gives learners an opportunity to understand recruitment beyond resumes — including business requirements, people management, leadership hiring, candidate evaluation and workforce needs.\n\nHe is also actively involved in hiring and talent identification and has been recognized for his contribution to the hospitality industry.\n\nDebabrata's LinkedIn profile demonstrates active involvement in hiring, leadership and HR-related professional activities, including recruitment for finance, sales and hospitality leadership positions.`
    baseImage = '/assets/images/trainers/debabrata_pattanayak_faculty.jpg'
    baseRating = 4.97
    baseReviews = 138
    baseStudents = 1250
    baseTags = [
      'HR & Recruitment Fundamentals',
      'Talent Acquisition',
      'Leadership Hiring',
      'Candidate Evaluation',
      'Hiring Strategy',
      'HR Communication',
      'People Management',
      'Time & Performance Management',
      'Corporate HR Practices',
    ]
    baseCerts = ['Director HR & Talent Acquisition Leader', 'Recruitment & Leadership Mentor', 'Hospitality Industry HR Awardee', 'Strategic Talent & Executive Hiring']
    baseCourses = ['HR Corporate Training Course', 'End-to-End Recruitment Training', 'HR Entrepreneurship Program']
  } else if (isRahul) {
    baseDesignation = 'Business Growth & Transformation Strategy Consultant | Scaling Startups & Enterprises | Career Coach'
    baseExp = 30
    baseCompanyEx = 'Business Growth & Transformation Strategy Consultant | Scaling Startups & Enterprises | Career Coach'
    baseLinkedin = ''
    baseQuote = 'Combining technology, business strategy and human psychology to catalyze growth and transformation.'
    baseBio = 'Business & Technology Consultant, Corporate Trainer and Business Growth Strategist with 30+ years of professional experience.'
    baseLongBio = `Rahul Limaye is a Business & Technology Consultant, Corporate Trainer and Business Growth Strategist with 30+ years of professional experience across Sales & Business Development, Recruitment, Technology, Business Analysis, Product Management, Strategic Planning and Management Consulting.\n\nHe has worked across diverse industries including IT, Healthcare, Manufacturing, Retail, Supply Chain & Logistics, Banking & Finance, Recruitment, Travel & Tourism, BPO/KPO/RPO, Education, Construction and Agriculture & Food. His experience includes building business practices, developing client relationships, driving sales growth, improving processes and supporting organisations through technology adoption and business transformation.\n\nRahul brings particularly relevant experience in Recruitment & Staffing, including leadership roles in recruitment and staffing businesses. His professional journey includes experience with Persistent Systems, Creative Vision & Endeavour Systems and Talent Bricks HR Services, along with extensive business development and consulting experience.\n\nAs a trainer and business coach, Rahul focuses on helping professionals, recruiters, entrepreneurs and business leaders develop practical capabilities in business growth, recruitment, sales strategy, client acquisition, technology adoption, process optimisation and leadership.\n\nHis approach combines technology, business strategy and human psychology, reflected in his professional positioning as a "Smile Catalyst".`
    baseImage = t.image || initialsAvatar(t.name)
    baseRating = 4.98
    baseReviews = 162
    baseStudents = 1350
    baseTags = [
      'Recruitment & Talent Acquisition',
      'Recruitment Business Development',
      'Staffing & Recruitment Agency Management',
      'Client Acquisition & Relationship Management',
      'B2B Sales & Business Development',
      'Sales Strategy & Revenue Growth',
      'Business Growth Strategy',
      'Market Research & Competitive Analysis',
      'Strategic Planning & Business Consulting',
      'Business Process Optimisation',
      'Technology Adoption & Digital Transformation',
      'Business Analysis & Product Management',
      'Leadership & Team Management',
      'Entrepreneurship & Business Building',
      'Career Development & Coaching',
      'Change Management & Performance Management',
    ]
    baseCerts = [
      'Business & Technology Consultant',
      'Corporate Trainer & Business Coach',
      'Recruitment & Staffing Professional',
      'Business Growth & Sales Strategist',
      'Management & Strategic Planning Consultant',
      'Career Development Coach',
    ]
    baseAccreditationHighlight = {
      text: 'Professionally recognised by the International Career Counsellors’ Club.',
      link: 'https://www.iccclub.org/MemberDetail.php?id=ICMIEIN2401407',
      linkLabel: 'Verify Credential on ICC Club',
    }
    baseCourses = ['HR Corporate Training Course', 'Recruitment Business Accelerator', 'End-to-End Recruitment Training', 'AI for Recruitment']
  } else if (isTukuna) {
    baseDesignation = 'Talent Acquisition & Recruitment Professional | Corporate Hiring & Sourcing Specialist | Recruitment Coach'
    baseExp = 15
    baseCompanyEx = 'Talent Acquisition & Recruitment Professional | Associated with Capgemini / Capgemini Engineering'
    baseLinkedin = 'https://www.linkedin.com/in/tukunakumarlenka/'
    baseQuote = 'Mastering end-to-end talent sourcing and recruiter productivity transforms candidate quality and hiring turnaround.'
    baseBio = 'Talent Acquisition & Recruitment Professional with corporate hiring experience at Capgemini / Capgemini Engineering across IT & Technology hiring.'
    baseLongBio = `Talent Acquisition & Recruitment Professional with corporate hiring experience.\n\nAssociated with Capgemini / Capgemini Engineering in talent acquisition and recruitment activities.\n\nExperience in IT/Technology Recruitment and Talent Sourcing.\n\nHands-on exposure to end-to-end recruitment and candidate sourcing.\n\nExperience supporting hiring requirements across multiple technology roles and skill areas.\n\nPractical understanding of corporate recruitment processes, stakeholder coordination and hiring delivery.\n\nIndustry-oriented perspective on recruiter performance, candidate quality and hiring turnaround.`
    baseImage = (t.image && t.image.trim() !== '') ? t.image : '/assets/images/trainers/tukuna_kumar_lenka.jpg'
    baseRating = 4.96
    baseReviews = 125
    baseStudents = 1100
    baseTags = [
      'Talent Acquisition & Recruitment',
      'IT & Technology Recruitment',
      'End-to-End Recruitment',
      'Candidate Sourcing & Screening',
      'LinkedIn Recruitment & Talent Sourcing',
      'Recruitment Pipeline Management',
      'Technical Hiring',
      'Candidate Engagement',
      'Interview Coordination',
      'Hiring Manager Coordination',
      'Recruitment Operations',
      'Corporate Recruitment Practices',
      'Recruitment Metrics & Delivery',
      'Recruiter Productivity & Performance',
    ]
    baseCerts = [
      'Corporate Talent Acquisition Professional',
      'Recruitment & Talent Sourcing Practitioner',
      'IT & Technology Recruitment Professional',
      'Corporate Hiring & Recruitment Specialist',
    ]
    baseCourses = ['End-to-End Recruitment Training', 'AI for Recruitment', 'Corporate Recruitment Training', 'Professional Recruitment Specialist']
  } else if (isSaurav) {
    baseDesignation = 'Head HR & People Management Professional | HR Strategy | Talent Acquisition | People & Culture'
    baseExp = 10
    baseCompanyEx = 'Head HR & People Management Professional | HR Strategy | Talent Acquisition | People & Culture'
    baseLinkedin = 'https://www.linkedin.com/in/saurav-dey-bb5bb1157/'
    baseQuote = 'Effective people practices, structured hiring and engaged cultures are the true drivers of business performance.'
    baseBio = 'Experienced HR professional with a strong background in People & Culture, HR Strategy, Talent Acquisition and HR Operations with 10+ years of senior-level HR leadership.'
    baseLongBio = `Executive Background\n\nSaurav Dey is an experienced HR professional with a strong background in People & Culture, HR Strategy, Talent Acquisition and HR Operations. His professional experience includes senior-level HR responsibilities, with a focus on building people-centric workplaces, strengthening HR processes and supporting organisational growth.\n\nAs a trainer, Saurav brings practical industry perspectives to the classroom, helping HR professionals and recruiters understand how effective people practices, structured hiring and employee engagement contribute to business performance.`
    baseImage = (t.image && t.image.trim() !== '') ? t.image : '/assets/images/trainers/saurav_dey.jpg'
    baseRating = 4.97
    baseReviews = 134
    baseStudents = 1150
    baseTags = [
      'Talent Acquisition & Recruitment Strategy',
      'End-to-End Recruitment Process',
      'HR Operations & Best Practices',
      'HR Strategy & Workforce Planning',
      'People & Culture',
      'Employee Engagement & Retention',
      'Leadership & People Management',
      'HR Business Partnering',
      'Candidate Experience',
      'Hiring & Interview Management',
      'Recruitment Negotiation & Stakeholder Management',
      'Building High-Performance Teams',
      'Practical HR Case Studies & Industry Practices',
    ]
    baseCerts = [
      'Head HR & People Management Professional',
      'Professional Development & Academic Credentials',
      'MBA / Management Education',
      'Strategic HR & Talent Acquisition Practitioner',
      'People & Culture Strategy Specialist',
    ]
    baseCourses = [
      'Talent Acquisition & Recruitment Strategy',
      'End-to-End Recruitment Training',
      'HR Corporate Training Course',
      'Recruitment Business Accelerator',
    ]
  }

  const sanitizeText = (val: string) => val.replace(/Director Senior HR/g, 'Director HR')

  return {
    id: 100000 + t.id,
    name: t.name,
    email: t.email,
    phone: t.phone ?? undefined,
    designation: sanitizeText(pj.designation || t.specialization || baseDesignation),
    experienceYears: typeof pj.experienceYears === 'number' ? pj.experienceYears : baseExp,
    companyEx: sanitizeText(pj.companyEx || baseCompanyEx),
    linkedinUrl: pj.linkedinUrl || baseLinkedin,
    quote: pj.quote || baseQuote,
    bio: sanitizeText(pj.bio || t.bio || baseBio),
    longBio: sanitizeText(pj.longBio || baseLongBio),
    specializationTags: (Array.isArray(pj.specializationTags) && pj.specializationTags.length > 0)
      ? pj.specializationTags
      : baseTags,
    certifications: (Array.isArray(pj.certifications) && pj.certifications.length > 0)
      ? pj.certifications
      : baseCerts,
    accreditationHighlight: pj.accreditationHighlight || baseAccreditationHighlight,
    coursesTaught: (Array.isArray(pj.coursesTaught) && pj.coursesTaught.length > 0)
      ? pj.coursesTaught
      : baseCourses,
    image: t.image || pj.image || baseImage,
    rating: typeof pj.rating === 'number' ? pj.rating : baseRating,
    reviewsCount: typeof pj.reviewsCount === 'number' ? pj.reviewsCount : baseReviews,
    studentsMentored: typeof pj.studentsMentored === 'number' ? pj.studentsMentored : baseStudents,
    modes: ['Online', 'Offline', 'Hybrid'],
    featured: true,
  }
}

/** URL-safe slug from a trainer's name, e.g. "Rahul Limaye" -> "rahul-limaye". */
export function slugifyName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

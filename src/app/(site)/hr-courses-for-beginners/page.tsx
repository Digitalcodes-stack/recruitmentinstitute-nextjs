import type { Metadata } from 'next'
import CourseLandingPage from '@/components/home/CourseLandingPage'
import { prisma } from '@/lib/prisma'

const BASE_URL = 'https://recruitmentinstitute.in'
const PAGE_URL = `${BASE_URL}/hr-courses-for-beginners`

export const metadata: Metadata = {
  title: 'HR Courses for Beginners — Freshers & Career Switchers | Recruitment Institute Pune',
  description:
    'Start your HR career with our beginner-friendly 6-week recruitment course in Pune. Perfect for freshers and career switchers. Learn recruitment basics, ATS tools, and get placement support.',
  keywords: 'hr courses beginners, hr training freshers pune, recruitment basics, HR course for freshers, beginner HR training',
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: 'HR Courses for Beginners — Recruitment Institute Pune',
    description: '6-week beginner-friendly HR training. Perfect for freshers and career switchers.',
    url: PAGE_URL,
    type: 'website',
    images: [{ url: `${BASE_URL}/assets/images/og-beginners.jpg`, width: 1200, height: 630, alt: 'HR Courses for Beginners' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HR Courses for Beginners — Recruitment Institute',
    description: '6-week beginner HR training in Pune. Start your HR career today.',
  },
}

const courseSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Course',
      '@id': `${PAGE_URL}#course`,
      name: 'Learning Recruitment for Beginners',
      description: 'Perfect for freshers and career changers. Build a solid foundation in HR and recruitment — no prior experience needed.',
      url: PAGE_URL,
      provider: { '@type': 'Organization', name: 'Recruitment Institute', url: BASE_URL },
      educationalLevel: 'Beginner',
      timeRequired: 'P6W',
      inLanguage: 'en-IN',
      courseMode: ['online'],
      offers: { '@type': 'Offer', availability: 'https://schema.org/InStock', priceCurrency: 'INR' },
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${PAGE_URL}#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
        { '@type': 'ListItem', position: 2, name: 'Courses', item: `${BASE_URL}/courses` },
        { '@type': 'ListItem', position: 3, name: 'HR Courses for Beginners', item: PAGE_URL },
      ],
    },
  ],
}

export default async function HRBeginnerPage() {
  let dbFaqs: any[] = []
  try {
    const category = await prisma.courseCategory.findUnique({
      where: { slug: 'hr-courses-for-beginners' },
      include: { faqs: true },
    })
    if (category) {
      dbFaqs = category.faqs.map((f) => ({
        id: f.id,
        question: f.question,
        answer: f.answer,
      }))
    }
  } catch (err) {
    console.error('Failed to load FAQs for beginners course:', err)
  }

  const ldJson = JSON.stringify(courseSchema)
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson }} />
      <CourseLandingPage
        title="Learning Recruitment for Beginners"
        subtitle="HR Courses for Beginners"
        description="Perfect for freshers and career changers. Build a solid foundation in HR and recruitment — no prior experience needed. Start your HR journey today."
        icon="📚"
        color="from-blue-500 to-indigo-700"
        duration="6 Weeks"
        mode="Online"
        level="Beginner"
        features={[
          'Introduction to Human Resources',
          'Recruitment Basics & Terminologies',
          'Job Posting & Resume Screening',
          'Telephonic Interview Techniques',
          'HR Software Overview (ATS, Excel)',
          'Labour Laws Fundamentals',
          'Mock Interviews & Practice',
          'Career Guidance & Placement Support',
        ]}
        curriculum={[
          { week: 'Week 1', topic: 'Introduction to HR & Recruitment', details: ['Understanding HR roles', 'Recruitment cycle basics', 'Key HR terminologies', 'Corporate structure overview'] },
          { week: 'Week 2', topic: 'Job Analysis & Posting', details: ['Deciphering job descriptions', 'Intake meetings with managers', 'Writing effective job ads', 'Job boards and social media posting'] },
          { week: 'Week 3', topic: 'Candidate Sourcing & Screening', details: ['Vetting candidate profiles', 'Boolean search strings basics', 'Initial candidate outreach', 'Vetting resumes for match'] },
          { week: 'Week 4', topic: 'Interview Basics & Assessment', details: ['Telephonic screening checklists', 'Structuring basic questions', 'Candidate communication guidelines', 'Coordinating interview schedules'] },
          { week: 'Week 5', topic: 'HR Tools & Software', details: ['ATS (Applicant Tracking Systems) overview', 'Using MS Excel/Google Sheets for recruiting', 'Candidate databases management', 'Recruitment metrics tracking'] },
          { week: 'Week 6', topic: 'Mock Interviews & Career Planning', details: ['Roleplay call practice', 'Resume preparation tips', 'Interview prep for learners', 'Placement registration & review'] },
        ]}
        slug="hr-courses-for-beginners"
        dbFaqs={dbFaqs}
      />
    </>
  )
}

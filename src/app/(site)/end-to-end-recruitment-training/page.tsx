import type { Metadata } from 'next'
import CourseLandingPage from '@/components/home/CourseLandingPage'
import { prisma } from '@/lib/prisma'

const BASE_URL = 'https://recruitmentinstitute.in'
const PAGE_URL = `${BASE_URL}/end-to-end-recruitment-training`

export const metadata: Metadata = {
  title: 'End-to-End Recruitment Training with All Domains — Pune | Recruitment Institute',
  description:
    'Master the complete recruitment lifecycle across all domains — IT, BFSI, Pharma, Manufacturing. Our 3-month end-to-end recruitment training in Pune covers sourcing, screening, interviewing, and onboarding.',
  keywords: 'end to end recruitment training, recruitment course pune, full cycle recruiting, IT recruitment training, HR sourcing course',
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: 'End-to-End Recruitment Training — All Domains | Pune',
    description: 'Master the complete recruitment lifecycle. 3-month intensive program covering all industry domains.',
    url: PAGE_URL,
    type: 'website',
    images: [{ url: `${BASE_URL}/assets/images/og-end-to-end.jpg`, width: 1200, height: 630, alt: 'End-to-End Recruitment Training' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'End-to-End Recruitment Training — Recruitment Institute',
    description: '3-month program covering all recruitment domains. Expert trainers in Pune.',
  },
}

const courseSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Course',
      '@id': `${PAGE_URL}#course`,
      name: 'End-to-End Recruitment Training with All Domain',
      description: 'Master the complete recruitment lifecycle — from job analysis and sourcing to interviewing, selection, and onboarding. Covers IT, BFSI, Manufacturing, FMCG, Pharma and all recruitment domains.',
      url: PAGE_URL,
      provider: { '@type': 'Organization', name: 'Recruitment Institute', url: BASE_URL },
      educationalLevel: 'All Levels',
      timeRequired: 'P3M',
      inLanguage: 'en-IN',
      courseMode: ['online', 'offline'],
      offers: { '@type': 'Offer', availability: 'https://schema.org/InStock', priceCurrency: 'INR' },
      hasCourseInstance: { '@type': 'CourseInstance', courseMode: ['online', 'offline'], inLanguage: 'en-IN' },
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${PAGE_URL}#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
        { '@type': 'ListItem', position: 2, name: 'Courses', item: `${BASE_URL}/courses` },
        { '@type': 'ListItem', position: 3, name: 'End-to-End Recruitment Training', item: PAGE_URL },
      ],
    },
  ],
}

export default async function EndToEndRecruitmentPage() {
  let dbFaqs: any[] = []
  try {
    const category = await prisma.courseCategory.findUnique({
      where: { slug: 'end-to-end-recruitment-training' },
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
    console.error('Failed to load FAQs for end-to-end course:', err)
  }

  const ldJson = JSON.stringify(courseSchema)
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson }} />
      <CourseLandingPage
        title="End-to-End Recruitment Training with all Domain"
        subtitle="Complete Recruitment Mastery"
        description="Master the complete recruitment lifecycle — from job analysis and sourcing to interviewing, selection, and onboarding. This comprehensive program covers IT, BFSI, Manufacturing, FMCG, Pharma and all recruitment domains."
        icon="🎯"
        color="from-brand-red to-rose-700"
        duration="3 Months"
        mode="Online / Offline"
        level="All Levels"
        features={[
          'Job Analysis & Position Description Writing',
          'Sourcing Strategies (Active & Passive)',
          'Boolean Search & LinkedIn Recruiting',
          'Resume Screening Techniques',
          'Interview Design & Execution',
          'Assessment & Evaluation Methods',
          'Offer Negotiation & Management',
          'Candidate Experience & Employer Branding',
          'All Industry Domains (IT, BFSI, Pharma, Manufacturing)',
          'ATS & Recruitment Software',
          'Diversity & Inclusion Recruiting',
          'Metrics, Reports & Analytics',
        ]}
        curriculum={[
          { week: 'Week 1-2', topic: 'Recruitment Fundamentals & Job Analysis', details: ['Job analysis & role intakes', 'Writing clear job profiles', 'Navigating applicant channels', 'Key recruitment terminology'] },
          { week: 'Week 3-4', topic: 'Sourcing Strategies & Boolean Search', details: ['Google X-ray search strings', 'Advanced LinkedIn filters', 'Vetting boolean syntax', 'Targeting passive candidates'] },
          { week: 'Week 5-6', topic: 'Screening & Interview Techniques', details: ['Competency-based assessment', 'Vetting resumes at scale', 'Conducting initial screenings', 'Candidate email workflows'] },
          { week: 'Week 7-8', topic: 'Domain Specialization (IT/Non-IT)', details: ['IT sourcing terminology', 'BFSI sector staffing models', 'Pharma / healthcare structures', 'Manufacturing & FMCG roles'] },
          { week: 'Week 9-10', topic: 'Offer Management & Onboarding', details: ['Drafting contract offers', 'Counter-offer negotiation', 'Candidate onboarding checklists', 'Employer branding techniques'] },
          { week: 'Week 11-12', topic: 'Metrics, Tools & Career Planning', details: ['Modern ATS overview', 'KPI trackers & metrics', 'Placement call prep', 'Resume optimization workshops'] },
        ]}
        slug="end-to-end-recruitment-training"
        dbFaqs={dbFaqs}
      />
    </>
  )
}

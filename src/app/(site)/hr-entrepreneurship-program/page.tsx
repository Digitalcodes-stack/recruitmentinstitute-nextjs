import type { Metadata } from 'next'
import CourseLandingPage from '@/components/home/CourseLandingPage'
import { prisma } from '@/lib/prisma'

const BASE_URL = 'https://recruitmentinstitute.in'
const PAGE_URL = `${BASE_URL}/hr-entrepreneurship-program`

export const metadata: Metadata = {
  title: 'HR Entrepreneurship Program — Start Your Recruitment Business | Pune',
  description:
    'Become a hiring master and start your own recruitment consultancy in 2 months. Our HR Entrepreneurship Program covers business development, client acquisition, legal setup, and revenue strategies.',
  keywords: 'hr entrepreneurship, start recruitment agency pune, recruitment consultancy business, HR business training',
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: 'HR Entrepreneurship Program — Start Your Recruitment Business',
    description: '2-month program to launch your own recruitment consultancy. Business development, client acquisition, legal setup.',
    url: PAGE_URL,
    type: 'website',
    images: [{ url: `${BASE_URL}/assets/images/og-entrepreneurship.jpg`, width: 1200, height: 630, alt: 'HR Entrepreneurship Program' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HR Entrepreneurship Program — Recruitment Institute',
    description: 'Launch your own recruitment business. 2-month intensive program.',
  },
}

const courseSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Course',
      '@id': `${PAGE_URL}#course`,
      name: 'Become a Hiring Master and Start Your Own Business',
      description: 'Learn how to build and scale your own recruitment consultancy or HR firm. From business model design to client acquisition, everything you need to succeed as an HR entrepreneur.',
      url: PAGE_URL,
      provider: { '@type': 'Organization', name: 'Recruitment Institute', url: BASE_URL },
      educationalLevel: 'Intermediate',
      timeRequired: 'P2M',
      inLanguage: 'en-IN',
      courseMode: ['online', 'offline'],
      offers: { '@type': 'Offer', availability: 'https://schema.org/InStock', priceCurrency: 'INR' },
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${PAGE_URL}#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
        { '@type': 'ListItem', position: 2, name: 'Courses', item: `${BASE_URL}/courses` },
        { '@type': 'ListItem', position: 3, name: 'HR Entrepreneurship Program', item: PAGE_URL },
      ],
    },
  ],
}

export default async function EntrepreneurshipPage() {
  let dbFaqs: any[] = []
  try {
    const category = await prisma.courseCategory.findUnique({
      where: { slug: 'hr-entrepreneurship-program' },
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
    console.error('Failed to load FAQs for entrepreneurship course:', err)
  }

  const ldJson = JSON.stringify(courseSchema)
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson }} />
      <CourseLandingPage
        title="Become a Hiring Master and Start Your Own Business"
        subtitle="HR Entrepreneurship Program"
        description="Learn how to build and scale your own recruitment consultancy or HR firm. From business model design to client acquisition, we cover everything you need to succeed as an HR entrepreneur."
        icon="🚀"
        color="from-emerald-500 to-teal-700"
        duration="2 Months"
        mode="Online / Offline"
        level="Intermediate"
        features={[
          'Recruitment Business Model Design',
          'Legal Registration & Compliance',
          'Client Acquisition Strategies',
          'Pricing & Fee Structures',
          'Team Building & Management',
          'Brand Building for Recruitment Firms',
          'Revenue Generation Tactics',
          'Contract & Agreement Templates',
          'Technology Stack for Agencies',
          'Scaling Your Business',
        ]}
        curriculum={[
          { week: 'Week 1-2', topic: 'Business Planning & Legal Foundations', details: ['Forming your recruitment LLC or proprietorship', 'Tax registration & GST filings', 'Structuring commission packages', 'Basic operations layout'] },
          { week: 'Week 3-4', topic: 'Client Acquisition & Sales', details: ['Cold emailing templates that convert', 'Vetting terms of business contracts', 'Finding high-paying corporate clients', 'Negotiating billing rates & commissions'] },
          { week: 'Week 5-6', topic: 'Operations & Team Management', details: ['Recruiting associate screeners', 'Setting up daily target trackers', 'Client service standards', 'Managing candidate dropouts'] },
          { week: 'Week 7-8', topic: 'Scaling, Tech & Revenue Growth', details: ['Agency ATS platforms selection', 'Building recruiter LinkedIn brand', 'Retainer billing models', 'Expanding into contract staffing'] },
        ]}
        slug="hr-entrepreneurship-program"
        dbFaqs={dbFaqs}
      />
    </>
  )
}

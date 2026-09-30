import type { Metadata } from 'next'
import FlagshipProgramPage from '@/components/site/FlagshipProgramPage'
import { hrOutsourcingBusinessContent as content } from '@/lib/content/flagship-pages/hr-outsourcing-business'
import { BASE_URL, generateServicePageSchemaGraph } from '@/lib/seo'

const SLUG = 'hr-outsourcing-business'
const TITLE = 'HR Outsourcing Business Accelerator in India | Build an HR-as-a-Service Practice | Recruitment Institute'
const DESCRIPTION =
  'Build an HR outsourcing business in India handling payroll, compliance, HR operations and policy design for small and mid-size companies that need HR support without a full in-house team.'
const OG_IMAGE = `${BASE_URL}/assets/images/courses/style4/4.jpg`

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    'HR Outsourcing Business Accelerator',
    'Start an HR Outsourcing Business in India',
    'HR as a Service India',
    'HR Consulting Business Setup',
    'Outsourced HR Services Business',
    'Recruitment Institute',
  ],
  alternates: { canonical: `${BASE_URL}/${SLUG}` },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${BASE_URL}/${SLUG}`,
    siteName: 'Recruitment Institute',
    locale: 'en_IN',
    type: 'website',
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: 'HR Outsourcing Business Accelerator in India - Recruitment Institute' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: [OG_IMAGE],
  },
}

export default function HrOutsourcingBusinessPage() {
  const schemaGraph = generateServicePageSchemaGraph({
    slug: SLUG,
    name: content.h1,
    description: DESCRIPTION,
    breadcrumbLabel: 'HR Outsourcing Business Accelerator',
    serviceType: 'HR Outsourcing Business Advisory',
    faqs: content.faqs.map((f) => ({ question: f.q, answer: f.a })),
  })

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaGraph) }} />
      <FlagshipProgramPage content={content} enquiryProgramName="HR Outsourcing Business Accelerator" />
    </>
  )
}

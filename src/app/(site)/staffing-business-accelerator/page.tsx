import type { Metadata } from 'next'
import FlagshipProgramPage from '@/components/site/FlagshipProgramPage'
import { staffingBusinessAcceleratorContent as content } from '@/lib/content/flagship-pages/staffing-business-accelerator'
import { BASE_URL, generateServicePageSchemaGraph } from '@/lib/seo'

const SLUG = 'staffing-business-accelerator'
const TITLE = 'Staffing Business Accelerator in India | Scale Your Contract Staffing Firm | Recruitment Institute'
const DESCRIPTION =
  'Scale a contract staffing or temp-to-hire business in India with structured commercial models, compliance frameworks and a repeatable client acquisition system.'
const OG_IMAGE = `${BASE_URL}/assets/images/courses/style4/4.jpg`

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    'Staffing Business Accelerator',
    'Start a Staffing Business in India',
    'Contract Staffing Business India',
    'Staffing Agency Business Model',
    'Temp Staffing Business India',
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
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: 'Staffing Business Accelerator in India - Recruitment Institute' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: [OG_IMAGE],
  },
}

export default function StaffingBusinessAcceleratorPage() {
  const schemaGraph = generateServicePageSchemaGraph({
    slug: SLUG,
    name: content.h1,
    description: DESCRIPTION,
    breadcrumbLabel: 'Staffing Business Accelerator',
    serviceType: 'Staffing Business Growth Advisory',
    faqs: content.faqs.map((f) => ({ question: f.q, answer: f.a })),
  })

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaGraph) }} />
      <FlagshipProgramPage content={content} enquiryProgramName="Staffing Business Accelerator" />
    </>
  )
}

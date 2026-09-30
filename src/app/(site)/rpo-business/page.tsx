import type { Metadata } from 'next'
import FlagshipProgramPage from '@/components/site/FlagshipProgramPage'
import { rpoBusinessContent as content } from '@/lib/content/flagship-pages/rpo-business'
import { BASE_URL, generateServicePageSchemaGraph } from '@/lib/seo'

const SLUG = 'rpo-business'
const TITLE = 'RPO Business Accelerator in India | Build a Recruitment Process Outsourcing Practice | Recruitment Institute'
const DESCRIPTION =
  'Move from contingency recruitment fees to retained RPO contracts. Learn how to structure, pitch and deliver Recruitment Process Outsourcing engagements for enterprise clients in India.'
const OG_IMAGE = `${BASE_URL}/assets/images/courses/style4/4.jpg`

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    'RPO Business Accelerator',
    'Start an RPO Business in India',
    'Recruitment Process Outsourcing Business',
    'RPO Company India',
    'How to Start RPO Business',
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
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: 'RPO Business Accelerator in India - Recruitment Institute' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: [OG_IMAGE],
  },
}

export default function RpoBusinessPage() {
  const schemaGraph = generateServicePageSchemaGraph({
    slug: SLUG,
    name: content.h1,
    description: DESCRIPTION,
    breadcrumbLabel: 'RPO Business Accelerator',
    serviceType: 'Recruitment Process Outsourcing Business Advisory',
    faqs: content.faqs.map((f) => ({ question: f.q, answer: f.a })),
  })

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaGraph) }} />
      <FlagshipProgramPage content={content} enquiryProgramName="RPO Business Accelerator" />
    </>
  )
}

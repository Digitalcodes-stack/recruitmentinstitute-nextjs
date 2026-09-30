import type { Metadata } from 'next'
import FlagshipProgramPage from '@/components/site/FlagshipProgramPage'
import { recruitmentBusinessIncubatorContent as content } from '@/lib/content/flagship-pages/recruitment-business-incubator'
import { BASE_URL, generateServicePageSchemaGraph } from '@/lib/seo'

const SLUG = 'recruitment-business-incubator'
const TITLE = 'Recruitment Business Incubator in India | Start Your Own Recruitment Agency | Recruitment Institute'
const DESCRIPTION =
  'Launch your own recruitment agency from scratch with India\'s Recruitment Business Incubator — business registration guidance, contract templates and first-client acquisition support.'
const OG_IMAGE = `${BASE_URL}/assets/images/courses/style4/4.jpg`

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    'Recruitment Business Incubator',
    'Start a Recruitment Agency in India',
    'How to Start a Recruitment Agency',
    'Recruitment Agency Registration India',
    'Recruitment Business Incubator India',
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
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: 'Recruitment Business Incubator in India - Recruitment Institute' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: [OG_IMAGE],
  },
}

export default function RecruitmentBusinessIncubatorPage() {
  const schemaGraph = generateServicePageSchemaGraph({
    slug: SLUG,
    name: content.h1,
    description: DESCRIPTION,
    breadcrumbLabel: 'Recruitment Business Incubator',
    serviceType: 'Recruitment Agency Business Incubation',
    faqs: content.faqs.map((f) => ({ question: f.q, answer: f.a })),
  })

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaGraph) }} />
      <FlagshipProgramPage content={content} enquiryProgramName="Recruitment Business Incubator" />
    </>
  )
}

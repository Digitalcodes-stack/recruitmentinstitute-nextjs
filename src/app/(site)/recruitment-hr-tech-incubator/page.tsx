import type { Metadata } from 'next'
import FlagshipProgramPage from '@/components/site/FlagshipProgramPage'
import { recruitmentHrTechIncubatorContent as content } from '@/lib/content/flagship-pages/recruitment-hr-tech-incubator'
import { BASE_URL, generateServicePageSchemaGraph } from '@/lib/seo'

const SLUG = 'recruitment-hr-tech-incubator'
const TITLE = 'Recruitment, HR & Talent Tech Startup Incubator in India | Recruitment Institute'
const DESCRIPTION =
  'Domain-expert incubation for recruitment-tech, HR-tech and talent-tech startup founders — practitioner product feedback, go-to-market guidance and warm pilot client introductions.'
const OG_IMAGE = `${BASE_URL}/assets/images/courses/home14/3.jpg`

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    'Recruitment Tech Incubator',
    'HR Tech Accelerator India',
    'Talent Tech Startup India',
    'AI Recruitment Startup Incubator',
    'Recruitment SaaS Growth',
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
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: 'Recruitment, HR & Talent Tech Startup Incubator in India - Recruitment Institute' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: [OG_IMAGE],
  },
}

export default function RecruitmentHrTechIncubatorPage() {
  const schemaGraph = generateServicePageSchemaGraph({
    slug: SLUG,
    name: content.h1,
    description: DESCRIPTION,
    breadcrumbLabel: 'Recruitment, HR & Talent Tech Startup Incubator',
    serviceType: 'Recruitment and HR Technology Startup Incubation',
    faqs: content.faqs.map((f) => ({ question: f.q, answer: f.a })),
  })

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaGraph) }} />
      <FlagshipProgramPage content={content} enquiryProgramName="Recruitment, HR & Talent Tech Startup Incubator" />
    </>
  )
}

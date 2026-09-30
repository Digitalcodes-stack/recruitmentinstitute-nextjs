import type { Metadata } from 'next'
import FlagshipProgramPage from '@/components/site/FlagshipProgramPage'
import { hrRecruitmentConsultingContent as content } from '@/lib/content/flagship-pages/hr-recruitment-consulting'
import { BASE_URL, generateServicePageSchemaGraph } from '@/lib/seo'

const SLUG = 'hr-recruitment-consulting'
const TITLE = 'HR & Recruitment Consulting Services in India | Recruitment Institute'
const DESCRIPTION =
  'One-on-one HR and recruitment consulting for agency owners, staffing founders and corporate HR leaders — business audits, pricing strategy, operations review and growth roadmaps.'
const OG_IMAGE = `${BASE_URL}/assets/images/courses/home14/4.jpg`

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    'HR Consulting India',
    'Recruitment Consulting Services',
    'HR and Recruitment Consulting',
    'Talent Acquisition Consulting India',
    'Recruitment Agency Consulting',
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
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: 'HR & Recruitment Consulting Services in India - Recruitment Institute' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: [OG_IMAGE],
  },
}

export default function HrRecruitmentConsultingPage() {
  const schemaGraph = generateServicePageSchemaGraph({
    slug: SLUG,
    name: content.h1,
    description: DESCRIPTION,
    breadcrumbLabel: 'HR & Recruitment Consulting',
    serviceType: 'HR and Recruitment Business Consulting',
    faqs: content.faqs.map((f) => ({ question: f.q, answer: f.a })),
  })

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaGraph) }} />
      <FlagshipProgramPage content={content} enquiryProgramName="HR & Recruitment Consulting" />
    </>
  )
}

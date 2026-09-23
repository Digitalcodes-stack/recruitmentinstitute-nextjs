import type { Metadata } from 'next'
import { getDynamicCourseData } from '@/lib/services/courseDataService'
import DynamicCourseLandingClient from '@/components/site/DynamicCourseLandingClient'
import { BASE_URL, DEFAULT_OG_IMAGE, generateCoursePageSchemaGraph } from '@/lib/seo'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const SLUG = 'advanced-recruitment-ta-masterclass'

export async function generateMetadata(): Promise<Metadata> {
  const course = await getDynamicCourseData('senior-professionals')
  const ogImage = course.image || DEFAULT_OG_IMAGE
  const pageTitle =
    'Advanced Recruitment & TA Masterclass in India | Talent Acquisition Course | Recruitment Institute'
  const pageDesc =
    'Join our Advanced Recruitment & TA Masterclass in India. An executive Talent Acquisition Course covering strategic hiring, AI tools, & workforce leadership.'

  return {
    title: pageTitle,
    description: pageDesc,
    keywords: [
      'Advanced Recruitment & TA Masterclass',
      'Talent Acquisition Course',
      'Talent Acquisition Training',
      'Advanced Recruitment Training',
      'Recruitment Training',
      'Recruitment Training in India',
      'Professional Recruitment Specialist',
      'Corporate Recruitment',
      'AI for Recruitment',
      'TA Masterclass',
      'TA Masterclass India',
      'Leadership in Talent Acquisition',
      'Recruitment Institute',
    ],
    alternates: { canonical: `${BASE_URL}/${SLUG}` },
    openGraph: {
      title: pageTitle,
      description: pageDesc,
      url: `${BASE_URL}/${SLUG}`,
      siteName: 'Recruitment Institute',
      locale: 'en_IN',
      type: 'website',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: 'Advanced Recruitment & TA Masterclass in India - Recruitment Institute',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDesc,
      images: [ogImage],
    },
  }
}

export default async function AdvancedTAMasterclassPage() {
  const course = await getDynamicCourseData('senior-professionals')
  const pageH1 = 'Advanced Recruitment & TA Masterclass in India'
  const ogImage = course.image || DEFAULT_OG_IMAGE

  const schemaGraph = generateCoursePageSchemaGraph({
    course,
    slug: SLUG,
    pageH1,
    image: ogImage,
    credentialAwarded:
      'Executive Certificate in Strategic Talent Acquisition & Recruitment Leadership',
  })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaGraph) }}
      />
      <DynamicCourseLandingClient course={course} h1Title={pageH1} />
    </>
  )
}

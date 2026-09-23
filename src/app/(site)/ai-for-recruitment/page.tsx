import type { Metadata } from 'next'
import { getDynamicCourseData } from '@/lib/services/courseDataService'
import AiForRecruitmentLandingClient from '@/components/site/AiForRecruitmentLandingClient'
import { BASE_URL, generateCoursePageSchemaGraph } from '@/lib/seo'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const SLUG = 'ai-for-recruitment'

export async function generateMetadata(): Promise<Metadata> {
  const ogImage = 'https://recruitmentinstitute.in/assets/images/courses/home14/3.jpg'
  const pageTitle = 'AI for Recruitment Course in India | AI Recruitment Training | Recruitment Institute'
  const pageDesc =
    'Master AI for Recruitment with India\'s top AI Recruitment Course. Learn AI sourcing, prompt engineering & ATS automation with online & classroom training.'

  return {
    title: pageTitle,
    description: pageDesc,
    keywords: [
      'AI for Recruitment',
      'AI Recruitment Course',
      'AI Recruitment Training',
      'AI for Talent Acquisition',
      'Recruitment Training',
      'Recruitment Training in India',
      'Professional Recruitment Specialist',
      'Corporate Recruitment',
      'Online AI Recruitment Course India',
      'AI recruiter training',
      'ChatGPT for recruiters',
      'Boolean AI search',
      'ATS automation',
      'Recruitment Institute Pune',
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
          alt: 'AI for Recruitment Course in India - Recruitment Institute',
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

export default async function AiForRecruitmentPage() {
  const course = await getDynamicCourseData('ai-for-recruitment')
  const pageH1 = 'AI for Recruitment Course in India'
  const ogImage = 'https://recruitmentinstitute.in/assets/images/courses/home14/3.jpg'

  const schemaGraph = generateCoursePageSchemaGraph({
    course,
    slug: SLUG,
    pageH1,
    image: ogImage,
    credentialAwarded: 'Certified AI Recruitment Specialist',
  })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaGraph) }}
      />
      <AiForRecruitmentLandingClient course={course} />
    </>
  )
}

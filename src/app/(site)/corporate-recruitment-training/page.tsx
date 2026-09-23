import type { Metadata } from 'next'
import { getDynamicCourseData } from '@/lib/services/courseDataService'
import DynamicCourseLandingClient from '@/components/site/DynamicCourseLandingClient'
import { BASE_URL, DEFAULT_OG_IMAGE, generateCoursePageSchemaGraph } from '@/lib/seo'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const SLUG = 'corporate-recruitment-training'

export async function generateMetadata(): Promise<Metadata> {
  const course = await getDynamicCourseData('corporate')
  const ogImage = course.image || DEFAULT_OG_IMAGE
  const pageTitle =
    'Corporate Recruitment Training in India | Programs for Hiring Teams | Recruitment Institute'
  const pageDesc =
    'Empower your talent acquisition teams with customized Corporate Recruitment Training in India. Modern hiring workflows, structured interviewing, and AI sourcing.'

  return {
    title: pageTitle,
    description: pageDesc,
    keywords: [
      'Corporate Recruitment Training',
      'Corporate Recruitment',
      'corporate recruitment training in India',
      'enterprise talent acquisition course',
      'corporate hiring strategies',
      'recruitment training for companies',
      'HR corporate training',
      'AI for Recruitment',
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
          alt: 'Corporate Recruitment Training in India - Recruitment Institute',
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

export default async function CorporateRecruitmentTrainingPage() {
  const course = await getDynamicCourseData('corporate')
  const pageH1 = 'Corporate Recruitment Training Programs in India'
  const ogImage = course.image || DEFAULT_OG_IMAGE

  const schemaGraph = generateCoursePageSchemaGraph({
    course,
    slug: SLUG,
    pageH1,
    image: ogImage,
    credentialAwarded: 'Corporate Talent Acquisition Team Certification',
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

import type { Metadata } from 'next'
import { getDynamicCourseData } from '@/lib/services/courseDataService'
import DynamicCourseLandingClient from '@/components/site/DynamicCourseLandingClient'
import { BASE_URL, DEFAULT_OG_IMAGE, generateCoursePageSchemaGraph } from '@/lib/seo'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const SLUG = 'hr-corporate-training-course'

export async function generateMetadata(): Promise<Metadata> {
  const course = await getDynamicCourseData('corporate_traning_tag')
  const ogImage = course.image || DEFAULT_OG_IMAGE
  const pageTitle =
    'HR Corporate Training Course in India | Corporate Recruitment Training | Recruitment Institute'
  const pageDesc =
    'Upskill your hiring team with our HR Corporate Training Course in India. Customized Corporate Recruitment Training, AI sourcing tools, & enterprise workshops.'

  return {
    title: pageTitle,
    description: pageDesc,
    keywords: [
      'HR Corporate Training Course',
      'Corporate Recruitment Training',
      'Corporate Recruitment',
      'Recruitment Training',
      'Recruitment Training in India',
      'Corporate HR Training',
      'Professional Recruitment Specialist',
      'AI for Recruitment',
      'Talent Acquisition Training',
      'Talent Acquisition Training for Teams',
      'Corporate Training Programs India',
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
          alt: 'HR Corporate Training Course in India - Recruitment Institute',
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

export default async function HrCorporateTrainingPage() {
  const course = await getDynamicCourseData('corporate_traning_tag')
  const pageH1 = 'HR Corporate Training Course in India'
  const ogImage = course.image || DEFAULT_OG_IMAGE

  const schemaGraph = generateCoursePageSchemaGraph({
    course,
    slug: SLUG,
    pageH1,
    image: ogImage,
    credentialAwarded: 'Certified Corporate Recruitment Professional / Team Certification',
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

import type { Metadata } from 'next'
import { getDynamicCourseData } from '@/lib/services/courseDataService'
import DynamicCourseLandingClient from '@/components/site/DynamicCourseLandingClient'
import { BASE_URL, DEFAULT_OG_IMAGE, generateCoursePageSchemaGraph } from '@/lib/seo'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const SLUG = 'end-to-end-recruitment-training'

export async function generateMetadata(): Promise<Metadata> {
  const course = await getDynamicCourseData('degree_tag')
  const ogImage = course.image || DEFAULT_OG_IMAGE
  const pageTitle = 'End-to-End Recruitment Training Course in India | Recruitment Institute'
  const pageDesc =
    'Master the full hiring lifecycle with our End-to-End Recruitment Training Course in India. Learn sourcing, ATS, & practical job-ready recruiter skills today.'

  return {
    title: pageTitle,
    description: pageDesc,
    keywords: [
      'End-to-End Recruitment Training',
      'Recruitment Training',
      'Recruitment Training in India',
      'Recruitment Course',
      'Recruitment Course in India',
      'Professional Recruitment Specialist',
      'Corporate Recruitment',
      'Recruitment Career Starter',
      'AI for Recruitment',
      'Talent Acquisition Training',
      'Full Recruitment Process Training',
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
          alt: 'End-to-End Recruitment Training Course in India - Recruitment Institute',
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

export default async function EndToEndRecruitmentPage() {
  const course = await getDynamicCourseData('degree_tag')
  const pageH1 = 'End-to-End Recruitment Training Course in India'
  const ogImage = course.image || DEFAULT_OG_IMAGE

  const schemaGraph = generateCoursePageSchemaGraph({
    course,
    slug: SLUG,
    pageH1,
    image: ogImage,
    credentialAwarded: 'Certified Recruitment Specialist',
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

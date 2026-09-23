import type { Metadata } from 'next'
import { getDynamicCourseData } from '@/lib/services/courseDataService'
import DynamicCourseLandingClient from '@/components/site/DynamicCourseLandingClient'
import { BASE_URL, DEFAULT_OG_IMAGE, generateCoursePageSchemaGraph } from '@/lib/seo'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const SLUG = 'hr-courses-for-beginners'

export async function generateMetadata(): Promise<Metadata> {
  const course = await getDynamicCourseData('certification_tag')
  const ogImage = course.image || DEFAULT_OG_IMAGE
  const pageTitle =
    'HR Courses for Beginners & Freshers in India | Recruitment Career Starter | Recruitment Institute'
  const pageDesc =
    'Enroll in top HR Courses for Beginners in India. Our job-oriented Recruitment Course for Freshers offers live sourcing, ATS tools, & 100% placement support.'

  return {
    title: pageTitle,
    description: pageDesc,
    keywords: [
      'HR Courses for Beginners',
      'Recruitment Course for Freshers',
      'Recruitment Training for Beginners',
      'Recruitment Career Starter',
      'Recruitment Training in India',
      'HR Course for Freshers',
      'Recruitment Training',
      'Professional Recruitment Specialist',
      'Corporate Recruitment',
      'AI for Recruitment',
      'Job-Oriented HR Course India',
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
          alt: 'HR Courses for Beginners & Freshers in India - Recruitment Institute',
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

export default async function HrBeginnersPage() {
  const course = await getDynamicCourseData('certification_tag')
  const pageH1 = 'HR Courses for Beginners & Freshers in India'
  const ogImage = course.image || DEFAULT_OG_IMAGE

  const schemaGraph = generateCoursePageSchemaGraph({
    course,
    slug: SLUG,
    pageH1,
    image: ogImage,
    credentialAwarded: 'Certified Recruitment Associate / Trainee',
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

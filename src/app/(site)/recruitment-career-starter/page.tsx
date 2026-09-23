import type { Metadata } from 'next'
import { getDynamicCourseData } from '@/lib/services/courseDataService'
import DynamicCourseLandingClient from '@/components/site/DynamicCourseLandingClient'
import { BASE_URL, DEFAULT_OG_IMAGE, generateCoursePageSchemaGraph } from '@/lib/seo'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const SLUG = 'recruitment-career-starter'

export async function generateMetadata(): Promise<Metadata> {
  const course = await getDynamicCourseData('for-freshers')
  const ogImage = course.image || DEFAULT_OG_IMAGE
  const pageTitle =
    'Recruitment Career Starter Course in India | Recruiter Training for Freshers | Recruitment Institute'
  const pageDesc =
    'Launch your HR career with our Recruitment Career Starter in India. A top Recruiter Training Course with practical job-oriented training & placement support.'

  return {
    title: pageTitle,
    description: pageDesc,
    keywords: [
      'Recruitment Career Starter',
      'Recruitment Course for Freshers',
      'Recruiter Training Course',
      'Recruitment Training for Beginners',
      'Recruitment Training',
      'Recruitment Training in India',
      'HR Courses for Beginners',
      'Professional Recruitment Specialist',
      'Corporate Recruitment',
      'AI for Recruitment',
      'Job-Oriented Recruitment Course India',
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
          alt: 'Recruitment Career Starter Course in India - Recruitment Institute',
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

export default async function RecruitmentCareerStarterPage() {
  const course = await getDynamicCourseData('for-freshers')
  const pageH1 = 'Recruitment Career Starter Course in India'
  const ogImage = course.image || DEFAULT_OG_IMAGE

  const schemaGraph = generateCoursePageSchemaGraph({
    course,
    slug: SLUG,
    pageH1,
    image: ogImage,
    credentialAwarded: 'Certified Recruiter / Recruitment Associate',
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

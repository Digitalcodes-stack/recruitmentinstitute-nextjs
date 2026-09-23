import type { Metadata } from 'next'
import { getDynamicCourseData } from '@/lib/services/courseDataService'
import DynamicCourseLandingClient from '@/components/site/DynamicCourseLandingClient'
import { BASE_URL, DEFAULT_OG_IMAGE, generateCoursePageSchemaGraph } from '@/lib/seo'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const SLUG = 'professional-recruitment-specialist'

export async function generateMetadata(): Promise<Metadata> {
  const course = await getDynamicCourseData('for-professionals')
  const ogImage = course.image || DEFAULT_OG_IMAGE
  const pageTitle =
    'Professional Recruitment Specialist Course in India | Recruitment Certification | Recruitment Institute'
  const pageDesc =
    'Become an industry-certified recruiter with our Professional Recruitment Specialist course in India. Multi-domain hiring, Boolean logic, & 100% placement support.'

  return {
    title: pageTitle,
    description: pageDesc,
    keywords: [
      'Professional Recruitment Specialist',
      'Recruitment Certification Course',
      'Recruitment Training',
      'Recruitment Training in India',
      'recruitment course in India',
      'certified talent acquisition specialist',
      'recruiter training course',
      'Corporate Recruitment',
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
          alt: 'Professional Recruitment Specialist Course in India - Recruitment Institute',
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

export default async function ProfessionalRecruitmentSpecialistPage() {
  const course = await getDynamicCourseData('for-professionals')
  const pageH1 = 'Professional Recruitment Specialist Course in India'
  const ogImage = course.image || DEFAULT_OG_IMAGE

  const schemaGraph = generateCoursePageSchemaGraph({
    course,
    slug: SLUG,
    pageH1,
    image: ogImage,
    credentialAwarded: 'Certified Professional Recruitment Specialist',
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

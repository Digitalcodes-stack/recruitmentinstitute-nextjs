import type { Metadata } from 'next'
import { getDynamicCourseData } from '@/lib/services/courseDataService'
import DynamicCourseLandingClient from '@/components/site/DynamicCourseLandingClient'
import { generateCoursePageSchemaGraph, DEFAULT_OG_IMAGE } from '@/lib/seo'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const SLUG = 'recruitment-business-growth-consulting'

export async function generateMetadata(): Promise<Metadata> {
  const course = await getDynamicCourseData('business-consulting')
  const ogImage = course.image || DEFAULT_OG_IMAGE

  return {
    title: 'Recruitment Business Growth Consulting in India | Recruitment Institute',
    description:
      'Scale your recruitment agency and staffing firm with 1-on-1 growth consulting in India. B2B client acquisition, recruiter hiring, and operational scaling advisory.',
    keywords: [
      'recruitment business growth consulting',
      'recruitment business growth consulting in India',
      'staffing firm advisory India',
      'recruitment agency scaling mentor',
      'B2B client acquisition for recruiters',
      'recruitment founder coaching',
      'Recruitment Institute',
    ],
    alternates: { canonical: `https://recruitmentinstitute.in/${SLUG}` },
    openGraph: {
      title: 'Recruitment Business Growth Consulting in India | Recruitment Institute',
      description:
        'Scale your recruitment agency and staffing firm with 1-on-1 growth consulting in India. B2B client acquisition, recruiter hiring, and operational scaling advisory.',
      url: `https://recruitmentinstitute.in/${SLUG}`,
      type: 'website',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: 'Recruitment Business Growth Consulting in India - Recruitment Institute',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Recruitment Business Growth Consulting in India | Recruitment Institute',
      description:
        'Scale your recruitment agency and staffing firm with 1-on-1 growth consulting in India.',
      images: [ogImage],
    },
  }
}

export default async function RecruitmentBusinessGrowthConsultingPage() {
  const course = await getDynamicCourseData('business-consulting')
  const pageH1 = 'Recruitment Business Growth Consulting in India'
  const schemaGraph = generateCoursePageSchemaGraph({
    course,
    slug: SLUG,
    pageH1,
    image: course.image || DEFAULT_OG_IMAGE,
    credentialAwarded: 'Certified Agency Growth Partner',
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

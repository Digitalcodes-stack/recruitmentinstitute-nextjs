import type { Metadata } from 'next'
import { getDynamicCourseData } from '@/lib/services/courseDataService'
import DynamicCourseLandingClient from '@/components/site/DynamicCourseLandingClient'
import { generateCourseJsonLd, generateBreadcrumbJsonLd, DEFAULT_OG_IMAGE } from '@/lib/seo'

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
  const courseJsonLd = generateCourseJsonLd(course, SLUG, course.image || DEFAULT_OG_IMAGE, pageH1)
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: 'Courses', url: '/courses' },
    { name: pageH1, url: `/${SLUG}` },
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <DynamicCourseLandingClient course={course} h1Title={pageH1} />
    </>
  )
}

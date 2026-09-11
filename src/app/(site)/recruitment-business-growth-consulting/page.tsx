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
    title: `${course.title} - 1-to-1 Agency Advisory | Recruitment Institute`,
    description: course.description,
    keywords: [
      'recruitment business growth consulting',
      'staffing firm advisory pune',
      'recruitment agency scaling mentor',
      'B2B client acquisition for recruiters',
      'recruitment founder coaching',
      'Recruitment Institute',
    ],
    alternates: { canonical: `https://recruitmentinstitute.in/${SLUG}` },
    openGraph: {
      title: `${course.title} - Recruitment Institute`,
      description: course.description,
      url: `https://recruitmentinstitute.in/${SLUG}`,
      type: 'website',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${course.title} - Recruitment Institute`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${course.title} | Recruitment Institute`,
      description: course.description,
      images: [ogImage],
    },
  }
}

export default async function RecruitmentBusinessGrowthConsultingPage() {
  const course = await getDynamicCourseData('business-consulting')
  const courseJsonLd = generateCourseJsonLd(course, SLUG)
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: 'Courses', url: '/courses' },
    { name: course.title, url: `/${SLUG}` },
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
      <DynamicCourseLandingClient course={course} />
    </>
  )
}

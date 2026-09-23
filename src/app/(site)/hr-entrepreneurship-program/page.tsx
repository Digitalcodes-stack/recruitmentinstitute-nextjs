import type { Metadata } from 'next'
import { getDynamicCourseData } from '@/lib/services/courseDataService'
import DynamicCourseLandingClient from '@/components/site/DynamicCourseLandingClient'
import { generateCourseJsonLd, generateBreadcrumbJsonLd, DEFAULT_OG_IMAGE } from '@/lib/seo'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const SLUG = 'hr-entrepreneurship-program'

export async function generateMetadata(): Promise<Metadata> {
  const course = await getDynamicCourseData('entrepreneur_tag')
  const ogImage = course.image || DEFAULT_OG_IMAGE

  return {
    title: 'HR Entrepreneurship Program in India | Launch Your Recruitment Agency | Recruitment Institute',
    description:
      'Learn how to establish and grow a recruitment agency with our HR Entrepreneurship Program in India. Agency blueprint, B2B client acquisition, and operational scaling.',
    keywords: [
      'HR entrepreneurship program',
      'HR entrepreneurship program in India',
      'Recruitment Business Accelerator',
      'start recruitment agency India',
      'staffing business blueprint India',
      'recruitment consultancy setup',
      'B2B recruitment business model',
      'Recruitment Institute',
    ],
    alternates: { canonical: `https://recruitmentinstitute.in/${SLUG}` },
    openGraph: {
      title: 'HR Entrepreneurship Program in India | Launch Your Recruitment Agency | Recruitment Institute',
      description:
        'Learn how to establish and grow a recruitment agency with our HR Entrepreneurship Program in India. Agency blueprint, B2B client acquisition, and operational scaling.',
      url: `https://recruitmentinstitute.in/${SLUG}`,
      type: 'website',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: 'HR Entrepreneurship Program in India - Recruitment Institute',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'HR Entrepreneurship Program in India | Launch Your Recruitment Agency | Recruitment Institute',
      description:
        'Learn how to establish and grow a recruitment agency with our HR Entrepreneurship Program in India.',
      images: [ogImage],
    },
  }
}

export default async function HrEntrepreneurshipPage() {
  const course = await getDynamicCourseData('entrepreneur_tag')
  const pageH1 = 'HR Entrepreneurship Program in India'
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

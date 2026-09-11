import type { Metadata } from 'next'
import { getDynamicCourseData } from '@/lib/services/courseDataService'
import DynamicCourseLandingClient from '@/components/site/DynamicCourseLandingClient'
import { generateCourseJsonLd, generateBreadcrumbJsonLd, DEFAULT_OG_IMAGE } from '@/lib/seo'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const SLUG = 'hr-courses-for-beginners'

export async function generateMetadata(): Promise<Metadata> {
  const course = await getDynamicCourseData('certification_tag')
  const ogImage = course.image || DEFAULT_OG_IMAGE

  return {
    title: 'Recruitment Course for Freshers & HR Beginners | Recruitment Institute',
    description:
      'Kickstart your corporate HR career with our practical Recruitment Course for Freshers in Pune. Learn candidate calling, resume screening, Boolean search, and job portal sourcing.',
    keywords: [
      'Recruitment Course for Freshers',
      'HR Course for Freshers',
      'HR courses for beginners',
      'entry level HR training',
      'recruitment basics course',
      'Recruitment Institute Pune',
    ],
    alternates: { canonical: `https://recruitmentinstitute.in/${SLUG}` },
    openGraph: {
      title: 'Recruitment Course for Freshers & HR Beginners | Recruitment Institute',
      description:
        'Kickstart your corporate HR career with our practical Recruitment Course for Freshers in Pune. Learn candidate calling, resume screening, Boolean search, and job portal sourcing.',
      url: `https://recruitmentinstitute.in/${SLUG}`,
      type: 'website',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: 'HR Courses for Beginners & Freshers - Recruitment Institute',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Recruitment Course for Freshers & HR Beginners | Recruitment Institute',
      description:
        'Kickstart your corporate HR career with our practical Recruitment Course for Freshers in Pune. Learn candidate calling, resume screening, Boolean search, and job portal sourcing.',
      images: [ogImage],
    },
  }
}

export default async function HrBeginnersPage() {
  const course = await getDynamicCourseData('certification_tag')
  const pageH1 = 'HR Courses for Beginners & Freshers'
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

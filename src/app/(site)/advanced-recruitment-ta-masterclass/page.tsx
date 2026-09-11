import type { Metadata } from 'next'
import { getDynamicCourseData } from '@/lib/services/courseDataService'
import DynamicCourseLandingClient from '@/components/site/DynamicCourseLandingClient'
import { generateCourseJsonLd, generateBreadcrumbJsonLd, DEFAULT_OG_IMAGE } from '@/lib/seo'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const SLUG = 'advanced-recruitment-ta-masterclass'

export async function generateMetadata(): Promise<Metadata> {
  const course = await getDynamicCourseData('senior-professionals')
  const ogImage = course.image || DEFAULT_OG_IMAGE

  return {
    title: 'Talent Acquisition Course & Leadership Training | Recruitment Institute',
    description:
      'Elevate from recruiter to strategic talent leader. Advanced Talent Acquisition Course & Leadership Masterclass covering workforce planning, executive search, and TA metrics.',
    keywords: [
      'Talent Acquisition Course',
      'Talent Acquisition Training',
      'advanced recruitment masterclass',
      'talent acquisition leadership pune',
      'executive search masterclass India',
      'strategic hiring for senior leaders',
      'Recruitment Institute',
    ],
    alternates: { canonical: `https://recruitmentinstitute.in/${SLUG}` },
    openGraph: {
      title: 'Talent Acquisition Course & Leadership Training | Recruitment Institute',
      description:
        'Elevate from recruiter to strategic talent leader. Advanced Talent Acquisition Course & Leadership Masterclass covering workforce planning, executive search, and TA metrics.',
      url: `https://recruitmentinstitute.in/${SLUG}`,
      type: 'website',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: 'Talent Acquisition Course & Leadership Training - Recruitment Institute',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Talent Acquisition Course & Leadership Training | Recruitment Institute',
      description:
        'Elevate from recruiter to strategic talent leader. Advanced Talent Acquisition Course & Leadership Masterclass covering workforce planning, executive search, and TA metrics.',
      images: [ogImage],
    },
  }
}

export default async function AdvancedTAMasterclassPage() {
  const course = await getDynamicCourseData('senior-professionals')
  const pageH1 = 'Talent Acquisition Training & Masterclass'
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

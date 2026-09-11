import type { Metadata } from 'next'
import { getDynamicCourseData } from '@/lib/services/courseDataService'
import DynamicCourseLandingClient from '@/components/site/DynamicCourseLandingClient'
import { generateCourseJsonLd, generateBreadcrumbJsonLd, DEFAULT_OG_IMAGE } from '@/lib/seo'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const SLUG = 'end-to-end-recruitment-training'

export async function generateMetadata(): Promise<Metadata> {
  const course = await getDynamicCourseData('degree_tag')
  const ogImage = course.image || DEFAULT_OG_IMAGE

  return {
    title: 'End-to-End Recruitment Training Course in Pune | Recruitment Institute',
    description:
      'Master full lifecycle recruitment with our End-to-End Recruitment Training Course in Pune. Hands-on candidate sourcing, Boolean search, ATS tools, and interview training with placement assistance.',
    keywords: [
      'Recruitment Course',
      'end to end recruitment training',
      'recruitment course pune',
      'recruitment certification course',
      'talent acquisition training',
      'recruitment institute pune',
    ],
    alternates: { canonical: `https://recruitmentinstitute.in/${SLUG}` },
    openGraph: {
      title: 'End-to-End Recruitment Training Course in Pune | Recruitment Institute',
      description:
        'Master full lifecycle recruitment with our End-to-End Recruitment Training Course in Pune. Hands-on candidate sourcing, Boolean search, ATS tools, and interview training with placement assistance.',
      url: `https://recruitmentinstitute.in/${SLUG}`,
      type: 'website',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: 'End-to-End Recruitment Training Course - Recruitment Institute',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'End-to-End Recruitment Training Course in Pune | Recruitment Institute',
      description:
        'Master full lifecycle recruitment with our End-to-End Recruitment Training Course in Pune. Hands-on candidate sourcing, Boolean search, ATS tools, and interview training with placement assistance.',
      images: [ogImage],
    },
  }
}

export default async function EndToEndRecruitmentPage() {
  const course = await getDynamicCourseData('degree_tag')
  const pageH1 = 'End-to-End Recruitment Training Course'
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

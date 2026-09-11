import type { Metadata } from 'next'
import { getDynamicCourseData } from '@/lib/services/courseDataService'
import DynamicCourseLandingClient from '@/components/site/DynamicCourseLandingClient'
import { generateCourseJsonLd, generateBreadcrumbJsonLd, DEFAULT_OG_IMAGE } from '@/lib/seo'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const SLUG = 'recruitment-career-starter'

export async function generateMetadata(): Promise<Metadata> {
  const course = await getDynamicCourseData('for-freshers')
  const ogImage = course.image || DEFAULT_OG_IMAGE

  return {
    title: 'Recruitment Career Starter - Recruiter Course for Freshers | Recruitment Institute',
    description:
      'Launch your recruitment career in 4 weeks. Practical Recruiter Training Course for Freshers in Pune covering candidate sourcing, calling scripts, and interview prep.',
    keywords: [
      'Recruitment Career Starter',
      'Recruiter Training Course',
      'recruiter training course for freshers',
      'recruitment course for freshers',
      'recruitment training for freshers',
      'how to become a recruiter',
      'entry-level recruiter training',
      'HR placement course pune',
      'Recruitment Institute',
    ],
    alternates: { canonical: `https://recruitmentinstitute.in/${SLUG}` },
    openGraph: {
      title: 'Recruitment Career Starter - Recruiter Course for Freshers | Recruitment Institute',
      description:
        'Launch your recruitment career in 4 weeks. Practical Recruiter Training Course for Freshers in Pune covering candidate sourcing, calling scripts, and interview prep.',
      url: `https://recruitmentinstitute.in/${SLUG}`,
      type: 'website',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: 'Recruitment Career Starter - Recruitment Institute',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Recruitment Career Starter - Recruiter Course for Freshers | Recruitment Institute',
      description:
        'Launch your recruitment career in 4 weeks. Practical Recruiter Training Course for Freshers in Pune covering candidate sourcing, calling scripts, and interview prep.',
      images: [ogImage],
    },
  }
}

export default async function RecruitmentCareerStarterPage() {
  const course = await getDynamicCourseData('for-freshers')
  const pageH1 = 'Recruitment Career Starter: Recruiter Course for Freshers'
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

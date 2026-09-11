import type { Metadata } from 'next'
import { getDynamicCourseData } from '@/lib/services/courseDataService'
import DynamicCourseLandingClient from '@/components/site/DynamicCourseLandingClient'
import { generateCourseJsonLd, generateBreadcrumbJsonLd, DEFAULT_OG_IMAGE } from '@/lib/seo'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const SLUG = 'hr-corporate-training-course'

export async function generateMetadata(): Promise<Metadata> {
  const course = await getDynamicCourseData('corporate_traning_tag')
  const ogImage = course.image || DEFAULT_OG_IMAGE

  return {
    title: 'HR Corporate Training Course in Pune | Recruitment Institute',
    description:
      'Customized HR corporate training courses for talent acquisition departments and hiring teams in Pune. Candidate sourcing, STAR interview mastery, and recruitment process audits.',
    keywords: [
      'HR corporate training course',
      'Corporate Recruitment Training',
      'corporate recruitment training pune',
      'enterprise TA capability building',
      'in-house recruiter training',
      'talent acquisition team upskilling',
      'Recruitment Institute',
    ],
    alternates: { canonical: `https://recruitmentinstitute.in/${SLUG}` },
    openGraph: {
      title: 'HR Corporate Training Course in Pune | Recruitment Institute',
      description:
        'Customized HR corporate training courses for talent acquisition departments and hiring teams in Pune. Candidate sourcing, STAR interview mastery, and recruitment process audits.',
      url: `https://recruitmentinstitute.in/${SLUG}`,
      type: 'website',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: 'HR Corporate Training Course - Recruitment Institute',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'HR Corporate Training Course in Pune | Recruitment Institute',
      description:
        'Customized HR corporate training courses for talent acquisition departments and hiring teams in Pune.',
      images: [ogImage],
    },
  }
}

export default async function HrCorporateTrainingPage() {
  const course = await getDynamicCourseData('corporate_traning_tag')
  const pageH1 = 'HR Corporate Training Course for Teams'
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

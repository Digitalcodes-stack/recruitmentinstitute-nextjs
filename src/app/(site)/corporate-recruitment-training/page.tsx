import type { Metadata } from 'next'
import { getDynamicCourseData } from '@/lib/services/courseDataService'
import DynamicCourseLandingClient from '@/components/site/DynamicCourseLandingClient'
import { generateCourseJsonLd, generateBreadcrumbJsonLd, DEFAULT_OG_IMAGE } from '@/lib/seo'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const SLUG = 'corporate-recruitment-training'

export async function generateMetadata(): Promise<Metadata> {
  const course = await getDynamicCourseData('corporate')
  const ogImage = course.image || DEFAULT_OG_IMAGE

  return {
    title: 'Corporate Recruitment Training in India & Pune | Recruitment Institute',
    description:
      'Empower your in-house talent acquisition teams with customized Corporate Recruitment Training. Modern tech hiring, structured STAR interviewing, and AI sourcing frameworks.',
    keywords: [
      'Corporate Recruitment Training',
      'corporate recruitment training in pune',
      'enterprise talent acquisition course',
      'corporate hiring strategies pune',
      'recruitment training for companies',
      'HR corporate training',
      'Recruitment Institute',
    ],
    alternates: { canonical: `https://recruitmentinstitute.in/${SLUG}` },
    openGraph: {
      title: 'Corporate Recruitment Training in India & Pune | Recruitment Institute',
      description:
        'Empower your in-house talent acquisition teams with customized Corporate Recruitment Training. Modern tech hiring, structured STAR interviewing, and AI sourcing frameworks.',
      url: `https://recruitmentinstitute.in/${SLUG}`,
      type: 'website',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: 'Corporate Recruitment Training Programs - Recruitment Institute',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Corporate Recruitment Training in India & Pune | Recruitment Institute',
      description:
        'Empower your in-house talent acquisition teams with customized Corporate Recruitment Training. Modern tech hiring, structured STAR interviewing, and AI sourcing frameworks.',
      images: [ogImage],
    },
  }
}

export default async function CorporateRecruitmentTrainingPage() {
  const course = await getDynamicCourseData('corporate')
  const pageH1 = 'Corporate Recruitment Training Programs for Teams'
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

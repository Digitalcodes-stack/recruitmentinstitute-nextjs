import type { Metadata } from 'next'
import { getDynamicCourseData } from '@/lib/services/courseDataService'
import DynamicCourseLandingClient from '@/components/site/DynamicCourseLandingClient'
import { generateCourseJsonLd, generateBreadcrumbJsonLd, DEFAULT_OG_IMAGE } from '@/lib/seo'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const SLUG = 'professional-recruitment-specialist'

export async function generateMetadata(): Promise<Metadata> {
  const course = await getDynamicCourseData('for-professionals')
  const ogImage = course.image || DEFAULT_OG_IMAGE

  return {
    title: 'Recruitment Certification Course in Pune | Recruitment Institute',
    description:
      'Become an industry-certified recruiter with our Professional Recruitment Certification Course in Pune. Multi-domain hiring, Boolean logic, STAR interviewing, and placement.',
    keywords: [
      'Recruitment Certification Course',
      'professional recruitment specialist',
      'recruitment course pune',
      'certified talent acquisition specialist',
      'recruiter training pune',
      'Recruitment Institute',
    ],
    alternates: { canonical: `https://recruitmentinstitute.in/${SLUG}` },
    openGraph: {
      title: 'Recruitment Certification Course in Pune | Recruitment Institute',
      description:
        'Become an industry-certified recruiter with our Professional Recruitment Certification Course in Pune. Multi-domain hiring, Boolean logic, STAR interviewing, and placement.',
      url: `https://recruitmentinstitute.in/${SLUG}`,
      type: 'website',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: 'Professional Recruitment Certification Course - Recruitment Institute',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Recruitment Certification Course in Pune | Recruitment Institute',
      description:
        'Become an industry-certified recruiter with our Professional Recruitment Certification Course in Pune. Multi-domain hiring, Boolean logic, STAR interviewing, and placement.',
      images: [ogImage],
    },
  }
}

export default async function ProfessionalRecruitmentSpecialistPage() {
  const course = await getDynamicCourseData('for-professionals')
  const pageH1 = 'Professional Recruitment Certification Course'
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

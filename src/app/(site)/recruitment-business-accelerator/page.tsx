import type { Metadata } from 'next'
import { getDynamicCourseData } from '@/lib/services/courseDataService'
import RecruitmentBusinessAcceleratorClient from '@/components/site/RecruitmentBusinessAcceleratorClient'
import { generateCourseJsonLd, generateBreadcrumbJsonLd } from '@/lib/seo'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const SLUG = 'recruitment-business-accelerator'

export async function generateMetadata(): Promise<Metadata> {
  const course = await getDynamicCourseData('entrepreneurship')
  const pageTitle = 'Recruitment Business Accelerator | Build, Launch & Scale Your Agency'
  const pageDesc =
    'Build. Launch. Acquire Clients. Deliver. Scale. Comprehensive agency launch blueprint, legal frameworks, client acquisition engines and hands-on founder mentoring.'
  const ogImage = 'https://recruitmentinstitute.in/assets/images/courses/style4/4.jpg'

  return {
    title: `${pageTitle} | Recruitment Institute`,
    description: pageDesc,
    keywords: [
      'Recruitment Business Accelerator',
      'Recruitment Business Training',
      'Recruitment Agency Training',
      'Recruitment Business Course',
      'Recruitment Agency Business',
      'Recruitment Business Development',
      'Recruitment Agency Growth',
      'start recruitment agency India',
      'Recruitment Institute',
    ],
    alternates: { canonical: `https://recruitmentinstitute.in/${SLUG}` },
    openGraph: {
      title: pageTitle,
      description: pageDesc,
      url: `https://recruitmentinstitute.in/${SLUG}`,
      type: 'website',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: 'Recruitment Business Accelerator - Recruitment Institute',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDesc,
      images: [ogImage],
    },
  }
}

export default async function RecruitmentBusinessAcceleratorPage() {
  const course = await getDynamicCourseData('entrepreneurship')
  const courseJsonLd = generateCourseJsonLd(course, SLUG, 'https://recruitmentinstitute.in/assets/images/courses/style4/4.jpg')
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: 'Courses', url: '/courses' },
    { name: 'Recruitment Business Accelerator', url: `/${SLUG}` },
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
      <RecruitmentBusinessAcceleratorClient course={course} />
    </>
  )
}

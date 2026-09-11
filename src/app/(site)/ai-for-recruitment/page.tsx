import type { Metadata } from 'next'
import { getDynamicCourseData } from '@/lib/services/courseDataService'
import AiForRecruitmentLandingClient from '@/components/site/AiForRecruitmentLandingClient'
import { generateCourseJsonLd, generateBreadcrumbJsonLd } from '@/lib/seo'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const SLUG = 'ai-for-recruitment'

export async function generateMetadata(): Promise<Metadata> {
  const course = await getDynamicCourseData('ai-for-recruitment')
  const ogImage = 'https://recruitmentinstitute.in/assets/images/courses/home14/3.jpg'
  const pageTitle = 'AI Recruitment Course & AI for Recruitment Training | Recruitment Institute'
  const pageDesc =
    'Master Generative AI, ChatGPT prompts, automated candidate sourcing, and modern ATS tools with our AI Recruitment Course at Recruitment Institute Pune.'

  return {
    title: pageTitle,
    description: pageDesc,
    keywords: [
      'AI Recruitment Course',
      'AI for Recruitment',
      'AI Recruitment Training',
      'AI recruiter training',
      'Generative AI HR course',
      'ChatGPT for recruiters',
      'Boolean AI search',
      'ATS automation',
      'Recruitment Institute Pune',
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
          alt: 'AI Recruitment Course - Recruitment Institute Pune',
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

export default async function AiForRecruitmentPage() {
  const course = await getDynamicCourseData('ai-for-recruitment')
  const pageH1 = 'AI Recruitment Course: AI for Talent Acquisition'
  const courseJsonLd = generateCourseJsonLd(course, SLUG, 'https://recruitmentinstitute.in/assets/images/courses/home14/3.jpg', pageH1)
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
      <AiForRecruitmentLandingClient course={course} />
    </>
  )
}

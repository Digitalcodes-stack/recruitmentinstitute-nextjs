import type { Metadata } from 'next'
import { getDynamicCourseData } from '@/lib/services/courseDataService'
import RecruitmentBusinessAcceleratorClient from '@/components/site/RecruitmentBusinessAcceleratorClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function generateMetadata(): Promise<Metadata> {
  const course = await getDynamicCourseData('entrepreneurship')
  const pageTitle = 'Recruitment Business Accelerator | Build, Launch & Scale Your Agency'
  const pageDesc =
    'Build. Launch. Acquire Clients. Deliver. Scale. From Zero to a Profitable Recruitment Agency — Complete blueprint, legal frameworks, client acquisition engines and hands-on founder mentoring.'

  return {
    title: `${pageTitle} | Recruitment Institute`,
    description: pageDesc,
    keywords:
      'recruitment business accelerator, start recruitment agency India, recruitment agency blueprint, launch staffing firm, recruitment consultancy business model, B2B client acquisition recruitment, Recruitment Institute',
    alternates: { canonical: 'https://recruitmentinstitute.in/recruitment-business-accelerator' },
    openGraph: {
      title: pageTitle,
      description: pageDesc,
      url: 'https://recruitmentinstitute.in/recruitment-business-accelerator',
      type: 'website',
      images: [
        {
          url: 'https://recruitmentinstitute.in/assets/images/courses/style4/4.jpg',
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
    },
  }
}

export default async function RecruitmentBusinessAcceleratorPage() {
  const course = await getDynamicCourseData('entrepreneurship')
  return <RecruitmentBusinessAcceleratorClient course={course} />
}


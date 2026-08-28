import type { Metadata } from 'next'
import { getDynamicCourseData } from '@/lib/services/courseDataService'
import DynamicCourseLandingClient from '@/components/site/DynamicCourseLandingClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function generateMetadata(): Promise<Metadata> {
  const course = await getDynamicCourseData('entrepreneurship')
  return {
    title: `${course.title} - Launch & Scale Your Agency | Recruitment Institute`,
    description: course.description,
    alternates: { canonical: 'https://recruitmentinstitute.in/recruitment-business-accelerator' },
    openGraph: {
      title: `${course.title} - Recruitment Institute`,
      description: course.description,
      url: 'https://recruitmentinstitute.in/recruitment-business-accelerator',
    },
  }
}

export default async function RecruitmentBusinessAcceleratorPage() {
  const course = await getDynamicCourseData('entrepreneurship')
  return <DynamicCourseLandingClient course={course} />
}

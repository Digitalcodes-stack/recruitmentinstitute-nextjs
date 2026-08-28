import type { Metadata } from 'next'
import { getDynamicCourseData } from '@/lib/services/courseDataService'
import DynamicCourseLandingClient from '@/components/site/DynamicCourseLandingClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function generateMetadata(): Promise<Metadata> {
  const course = await getDynamicCourseData('corporate')
  return {
    title: `${course.title} - Custom Enterprise Capability | Recruitment Institute`,
    description: course.description,
    alternates: { canonical: 'https://recruitmentinstitute.in/corporate-recruitment-training' },
    openGraph: {
      title: `${course.title} - Recruitment Institute`,
      description: course.description,
      url: 'https://recruitmentinstitute.in/corporate-recruitment-training',
    },
  }
}

export default async function CorporateRecruitmentTrainingPage() {
  const course = await getDynamicCourseData('corporate')
  return <DynamicCourseLandingClient course={course} />
}

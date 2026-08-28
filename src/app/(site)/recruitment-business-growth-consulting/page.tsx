import type { Metadata } from 'next'
import { getDynamicCourseData } from '@/lib/services/courseDataService'
import DynamicCourseLandingClient from '@/components/site/DynamicCourseLandingClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function generateMetadata(): Promise<Metadata> {
  const course = await getDynamicCourseData('business-consulting')
  return {
    title: `${course.title} - 1-to-1 Agency Advisory | Recruitment Institute`,
    description: course.description,
    alternates: { canonical: 'https://recruitmentinstitute.in/recruitment-business-growth-consulting' },
    openGraph: {
      title: `${course.title} - Recruitment Institute`,
      description: course.description,
      url: 'https://recruitmentinstitute.in/recruitment-business-growth-consulting',
    },
  }
}

export default async function RecruitmentBusinessGrowthConsultingPage() {
  const course = await getDynamicCourseData('business-consulting')
  return <DynamicCourseLandingClient course={course} />
}

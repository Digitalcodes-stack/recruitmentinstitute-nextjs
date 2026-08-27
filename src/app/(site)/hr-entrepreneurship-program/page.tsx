import type { Metadata } from 'next'
import { getDynamicCourseData } from '@/lib/services/courseDataService'
import DynamicCourseLandingClient from '@/components/site/DynamicCourseLandingClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function generateMetadata(): Promise<Metadata> {
  const course = await getDynamicCourseData('entrepreneur_tag')
  return {
    title: `${course.title} in Pune - Agency Launch & Scaling`,
    description: course.description,
    alternates: { canonical: 'https://recruitmentinstitute.in/hr-entrepreneurship-program' },
    openGraph: {
      title: `${course.title} - Recruitment Institute`,
      description: course.description,
      url: 'https://recruitmentinstitute.in/hr-entrepreneurship-program',
    },
  }
}

export default async function HrEntrepreneurshipPage() {
  const course = await getDynamicCourseData('entrepreneur_tag')
  return <DynamicCourseLandingClient course={course} />
}

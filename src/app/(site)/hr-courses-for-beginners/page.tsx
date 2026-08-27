import type { Metadata } from 'next'
import { getDynamicCourseData } from '@/lib/services/courseDataService'
import DynamicCourseLandingClient from '@/components/site/DynamicCourseLandingClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function generateMetadata(): Promise<Metadata> {
  const course = await getDynamicCourseData('certification_tag')
  return {
    title: `${course.title} in Pune - Complete Syllabus & Fees`,
    description: course.description,
    alternates: { canonical: 'https://recruitmentinstitute.in/hr-courses-for-beginners' },
    openGraph: {
      title: `${course.title} - Recruitment Institute`,
      description: course.description,
      url: 'https://recruitmentinstitute.in/hr-courses-for-beginners',
    },
  }
}

export default async function HrBeginnersPage() {
  const course = await getDynamicCourseData('certification_tag')
  return <DynamicCourseLandingClient course={course} />
}

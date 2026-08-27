import type { Metadata } from 'next'
import { getDynamicCourseData } from '@/lib/services/courseDataService'
import DynamicCourseLandingClient from '@/components/site/DynamicCourseLandingClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function generateMetadata(): Promise<Metadata> {
  const course = await getDynamicCourseData('degree_tag')
  return {
    title: `${course.title} in Pune - Complete Syllabus & Fees`,
    description: course.description,
    alternates: { canonical: 'https://recruitmentinstitute.in/end-to-end-recruitment-training' },
    openGraph: {
      title: `${course.title} - Recruitment Institute`,
      description: course.description,
      url: 'https://recruitmentinstitute.in/end-to-end-recruitment-training',
    },
  }
}

export default async function EndToEndRecruitmentPage() {
  const course = await getDynamicCourseData('degree_tag')
  return <DynamicCourseLandingClient course={course} />
}

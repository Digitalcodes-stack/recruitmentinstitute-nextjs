import type { Metadata } from 'next'
import { getDynamicCourseData } from '@/lib/services/courseDataService'
import DynamicCourseLandingClient from '@/components/site/DynamicCourseLandingClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function generateMetadata(): Promise<Metadata> {
  const course = await getDynamicCourseData('for-freshers')
  return {
    title: `${course.title} - Complete Syllabus & Fees | Recruitment Institute`,
    description: course.description,
    alternates: { canonical: 'https://recruitmentinstitute.in/recruitment-career-starter' },
    openGraph: {
      title: `${course.title} - Recruitment Institute`,
      description: course.description,
      url: 'https://recruitmentinstitute.in/recruitment-career-starter',
    },
  }
}

export default async function RecruitmentCareerStarterPage() {
  const course = await getDynamicCourseData('for-freshers')
  return <DynamicCourseLandingClient course={course} />
}

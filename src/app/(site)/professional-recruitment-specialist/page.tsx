import type { Metadata } from 'next'
import { getDynamicCourseData } from '@/lib/services/courseDataService'
import DynamicCourseLandingClient from '@/components/site/DynamicCourseLandingClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function generateMetadata(): Promise<Metadata> {
  const course = await getDynamicCourseData('for-professionals')
  return {
    title: `${course.title} - Complete Syllabus & Fees | Recruitment Institute`,
    description: course.description,
    alternates: { canonical: 'https://recruitmentinstitute.in/professional-recruitment-specialist' },
    openGraph: {
      title: `${course.title} - Recruitment Institute`,
      description: course.description,
      url: 'https://recruitmentinstitute.in/professional-recruitment-specialist',
    },
  }
}

export default async function ProfessionalRecruitmentSpecialistPage() {
  const course = await getDynamicCourseData('for-professionals')
  return <DynamicCourseLandingClient course={course} />
}

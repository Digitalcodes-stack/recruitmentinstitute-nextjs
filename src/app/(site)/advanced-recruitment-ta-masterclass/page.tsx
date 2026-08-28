import type { Metadata } from 'next'
import { getDynamicCourseData } from '@/lib/services/courseDataService'
import DynamicCourseLandingClient from '@/components/site/DynamicCourseLandingClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function generateMetadata(): Promise<Metadata> {
  const course = await getDynamicCourseData('senior-professionals')
  return {
    title: `${course.title} - Complete Syllabus & Fees | Recruitment Institute`,
    description: course.description,
    alternates: { canonical: 'https://recruitmentinstitute.in/advanced-recruitment-ta-masterclass' },
    openGraph: {
      title: `${course.title} - Recruitment Institute`,
      description: course.description,
      url: 'https://recruitmentinstitute.in/advanced-recruitment-ta-masterclass',
    },
  }
}

export default async function AdvancedTAMasterclassPage() {
  const course = await getDynamicCourseData('senior-professionals')
  return <DynamicCourseLandingClient course={course} />
}

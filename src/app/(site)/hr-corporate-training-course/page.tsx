import type { Metadata } from 'next'
import { getDynamicCourseData } from '@/lib/services/courseDataService'
import DynamicCourseLandingClient from '@/components/site/DynamicCourseLandingClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function generateMetadata(): Promise<Metadata> {
  const course = await getDynamicCourseData('corporate_traning_tag')
  return {
    title: `${course.title} in Pune - Team Upskilling & Process Audit`,
    description: course.description,
    alternates: { canonical: 'https://recruitmentinstitute.in/hr-corporate-training-course' },
    openGraph: {
      title: `${course.title} - Recruitment Institute`,
      description: course.description,
      url: 'https://recruitmentinstitute.in/hr-corporate-training-course',
    },
  }
}

export default async function HrCorporateTrainingPage() {
  const course = await getDynamicCourseData('corporate_traning_tag')
  return <DynamicCourseLandingClient course={course} />
}

import type { Metadata } from 'next'
import { getDynamicCourseData } from '@/lib/services/courseDataService'
import DynamicCourseLandingClient from '@/components/site/DynamicCourseLandingClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function generateMetadata(): Promise<Metadata> {
  const course = await getDynamicCourseData('ai-for-recruitment')
  return {
    title: `${course.title} - Master AI-Powered Recruitment & Talent Acquisition | Recruitment Institute Pune`,
    description:
      'Learn how to use Generative AI, AI recruitment tools, automation and prompt engineering across the complete recruitment lifecycle — from Job Description to Joining.',
    keywords:
      'AI for recruitment, AI recruiter training, Generative AI HR course, ChatGPT for recruiters, Boolean AI search, ATS automation, Recruitment Institute Pune',
    alternates: { canonical: 'https://recruitmentinstitute.in/ai-for-recruitment' },
    openGraph: {
      title: 'AI for Recruitment — Master AI-Powered Talent Acquisition',
      description:
        "Don't Replace Your Recruiter. Upgrade Your Recruiter. Master AI tools from Job Description to Joining in 4 Weeks.",
      url: 'https://recruitmentinstitute.in/ai-for-recruitment',
      type: 'website',
      images: [
        {
          url: 'https://recruitmentinstitute.in/assets/images/courses/home14/3.jpg',
          width: 1200,
          height: 630,
          alt: 'AI for Recruitment Flagship Program - Recruitment Institute',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'AI for Recruitment — Recruitment Institute Pune',
      description:
        'Become a faster, smarter and more productive recruiter with Generative AI and recruitment automation.',
    },
  }
}

export default async function AiForRecruitmentPage() {
  const course = await getDynamicCourseData('ai-for-recruitment')
  return <DynamicCourseLandingClient course={course} />
}

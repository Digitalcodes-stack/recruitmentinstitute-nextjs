import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Metadata } from 'next'
import { COURSE_BROCHURES } from '@/lib/data/course-brochures'
import CourseBrochureViewerClient from '@/components/brochures/CourseBrochureViewerClient'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const brochure = COURSE_BROCHURES.find((b) => b.slug === slug)

  if (!brochure) {
    return {
      title: 'Course Brochure Not Found — Recruitment Institute',
    }
  }

  return {
    title: `${brochure.title} — Official Course Syllabus & Brochure | Recruitment Institute Pune`,
    description: brochure.description,
    openGraph: {
      title: `${brochure.title} (Official Syllabus)`,
      description: brochure.subtitle,
      url: `https://recruitmentinstitute.in/brochures/${brochure.slug}`,
      siteName: 'Recruitment Institute',
      locale: 'en_IN',
      type: 'article',
    },
  }
}

export default async function CourseBrochurePage({ params }: Props) {
  const { slug } = await params
  const brochure = COURSE_BROCHURES.find((b) => b.slug === slug)

  if (!brochure) {
    notFound()
  }

  return <CourseBrochureViewerClient brochure={brochure} allBrochures={COURSE_BROCHURES} />
}

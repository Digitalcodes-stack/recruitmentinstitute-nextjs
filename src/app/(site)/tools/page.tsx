import type { Metadata } from 'next'
import { generateBreadcrumbJsonLd, DEFAULT_OG_IMAGE } from '@/lib/seo'
import ToolsClient from './ToolsClient'
import { initialToolsData } from './tools-data'

export const metadata: Metadata = {
  title: 'Tools | Recruitment Calculators, Templates & Practical Tools – Recruitment Institute',
  description:
    'Free recruitment calculators, practical templates, Boolean string builders, and recruiter productivity tools by Recruitment Institute.',
  keywords: [
    'Recruitment fee calculator',
    'Recruitment templates India',
    'Interview scorecard template',
    'Boolean search string builder',
    'Staffing agency MSA template',
    'Recruiter productivity tracker',
    'Recruitment Institute tools',
  ],
  alternates: {
    canonical: 'https://recruitmentinstitute.in/tools',
  },
  openGraph: {
    title: 'Tools | Recruitment Calculators, Templates & Practical Tools – Recruitment Institute',
    description:
      'Recruitment calculators, templates and practical tools for recruiters, HR professionals and agency founders.',
    url: 'https://recruitmentinstitute.in/tools',
    type: 'website',
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: 'Tools — Recruitment Institute',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tools | Recruitment Calculators, Templates & Practical Tools – Recruitment Institute',
    description:
      'Recruitment calculators, templates and practical tools for recruiters and agency leaders.',
    images: [DEFAULT_OG_IMAGE],
  },
}

export const revalidate = 3600

export default function ToolsPage() {
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: 'Tools', url: '/tools' },
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ToolsClient tools={initialToolsData} />
    </>
  )
}

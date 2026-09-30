import type { Metadata } from 'next'
import { generateBreadcrumbJsonLd, DEFAULT_OG_IMAGE } from '@/lib/seo'
import EventsClient from './EventsClient'
import { initialEventsData } from './events-data'

export const metadata: Metadata = {
  title: 'Events | Workshops, Masterclasses & HR Events – Recruitment Institute',
  description:
    'Explore upcoming recruitment workshops, live masterclasses, founder meetups, and HR events organized by Recruitment Institute across India.',
  keywords: [
    'Recruitment events India',
    'HR workshops Pune Mumbai',
    'Talent acquisition masterclass',
    'Recruiter training events',
    'Recruitment agency founder meetup',
    'AI in recruitment workshop',
    'Recruitment Institute events',
  ],
  alternates: {
    canonical: 'https://recruitmentinstitute.in/events',
  },
  openGraph: {
    title: 'Events | Workshops, Masterclasses & HR Events – Recruitment Institute',
    description:
      'Workshops, masterclasses, founder meets and HR events for talent acquisition professionals, recruiters and agency owners.',
    url: 'https://recruitmentinstitute.in/events',
    type: 'website',
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: 'Events — Recruitment Institute',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Events | Workshops, Masterclasses & HR Events – Recruitment Institute',
    description:
      'Workshops, masterclasses, founder meets and HR events for recruiters and HR professionals.',
    images: [DEFAULT_OG_IMAGE],
  },
}

export const revalidate = 3600

export default function EventsPage() {
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: 'Events', url: '/events' },
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <EventsClient events={initialEventsData} />
    </>
  )
}

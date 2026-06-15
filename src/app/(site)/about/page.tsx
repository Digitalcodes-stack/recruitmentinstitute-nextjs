import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import AboutClient from '@/components/home/AboutClient'

const BASE_URL = 'https://recruitmentinstitute.in'

export const metadata: Metadata = {
  title: 'About Us - India\'s #1 HR & Recruitment Training Institute',
  description:
    'Learn about Recruitment Institute - Pune\'s leading HR and recruitment training academy. Our mission, vision, expert trainers, and 10+ years of transforming HR careers.',
  keywords: 'about recruitment institute, HR training institute pune, recruitment academy india, HR experts pune',
  alternates: { canonical: `${BASE_URL}/about` },
  openGraph: {
    title: 'About Recruitment Institute - HR Training Academy in Pune',
    description: 'India\'s premier recruitment training institute. 5,000+ alumni, 95% placement rate, expert industry trainers.',
    url: `${BASE_URL}/about`,
    type: 'website',
    images: [{ url: `${BASE_URL}/assets/images/og-about.jpg`, width: 1200, height: 630, alt: 'About Recruitment Institute' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Recruitment Institute',
    description: 'India\'s premier HR and recruitment training academy in Pune.',
  },
}

export const revalidate = 3600

const aboutSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'AboutPage',
      '@id': `${BASE_URL}/about#webpage`,
      url: `${BASE_URL}/about`,
      name: 'About Recruitment Institute',
      description: 'About page for Recruitment Institute - India\'s #1 HR training academy',
      isPartOf: { '@id': `${BASE_URL}/#website` },
      about: { '@id': `${BASE_URL}/#organization` },
      breadcrumb: { '@id': `${BASE_URL}/about#breadcrumb` },
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${BASE_URL}/about#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
        { '@type': 'ListItem', position: 2, name: 'About Us', item: `${BASE_URL}/about` },
      ],
    },
    {
      '@type': 'Organization',
      '@id': `${BASE_URL}/#organization`,
      name: 'Recruitment Institute',
      url: BASE_URL,
      foundingDate: '2015',
      description: 'India\'s #1 HR and recruitment training institute based in Pune, Maharashtra.',
      numberOfEmployees: { '@type': 'QuantitativeValue', value: 20 },
      award: ['Top Recruitment Training Institute in Pune', 'Best HR Academy Maharashtra'],
      slogan: 'Transform Your HR Career',
    },
  ],
}

async function getAboutSections() {
  try {
    return await prisma.aboutSection.findMany({ orderBy: { createdAt: 'asc' } })
  } catch {
    return []
  }
}

export default async function AboutPage() {
  const [sections, testimonials] = await Promise.all([
    getAboutSections(),
    prisma.testimonial.findMany({ where: { isActive: true }, orderBy: { createdAt: 'desc' }, take: 4 }),
  ])
  const testimonialData = testimonials.map(t => ({
    id: t.id,
    author: t.author,
    title: t.title,
    description: t.description,
    rating: t.rating,
    image: t.image,
  }))
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutSchema) }} />
      <AboutClient sections={sections} testimonials={testimonialData} />
    </>
  )
}

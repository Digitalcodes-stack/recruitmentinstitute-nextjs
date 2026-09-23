import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import AboutClient from '@/components/home/AboutClient'
import { getSiteStats } from '@/lib/site-stats'

const BASE_URL = 'https://recruitmentinstitute.in'

export const metadata: Metadata = {
  title: 'About Recruitment Institute | Recruitment Training in Pune & India',
  description:
    'Learn about Recruitment Institute, India\'s premier recruitment training institute in Pune. Practical recruiter courses, AI hiring tools & 100% placement help.',
  keywords:
    'Recruitment Training, Recruitment Training Institute in India, Recruitment Training in Pune, Recruitment Business Accelerator, Recruitment Career Starter, Corporate Recruitment, Professional Recruitment Specialist, AI for Recruitment, HR & Recruitment Training, Recruitment Institute Pune, HR training institute Pune, recruitment certification Pune',
  alternates: { canonical: `${BASE_URL}/about` },
  openGraph: {
    title: 'About Recruitment Institute | Recruitment Training in Pune & India',
    description:
      'India\'s premier recruitment training institute in Pune. Master practical recruiter skills, AI hiring workflows, and top corporate recruitment strategies.',
    url: `${BASE_URL}/about`,
    siteName: 'Recruitment Institute',
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: `${BASE_URL}/assets/images/og-about.jpg`,
        width: 1200,
        height: 630,
        alt: 'About Recruitment Institute - Recruitment Training in Pune',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Recruitment Institute | Recruitment Training in Pune & India',
    description:
      'India\'s premier recruitment training institute in Pune. Practical recruiter training, AI recruitment tools, and career placement support.',
    images: [`${BASE_URL}/assets/images/og-about.jpg`],
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
      name: 'About Recruitment Institute | Recruitment Training in Pune & India',
      description:
        'Learn about Recruitment Institute, India\'s premier recruitment training institute in Pune offering practical recruiter programs and AI hiring tools.',
      isPartOf: { '@id': `${BASE_URL}/#website` },
      about: { '@id': `${BASE_URL}/#organization` },
      mainEntity: { '@id': `${BASE_URL}/#organization` },
      breadcrumb: { '@id': `${BASE_URL}/about#breadcrumb` },
      inLanguage: 'en-IN',
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
      '@type': ['EducationalOrganization', 'Organization'],
      '@id': `${BASE_URL}/#organization`,
      name: 'Recruitment Institute',
      url: BASE_URL,
      logo: `${BASE_URL}/assets/images/logo.png`,
      foundingDate: '2015',
      description:
        'India\'s premier HR and recruitment training institute based in Pune, offering job-oriented recruitment training, AI for recruitment, and recruiter career programs.',
      numberOfEmployees: { '@type': 'QuantitativeValue', value: 20 },
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Pune',
        addressRegion: 'Maharashtra',
        addressCountry: 'IN',
      },
      award: ['Top Recruitment Training Institute in Pune', 'Best HR Academy Maharashtra'],
      slogan: 'Transform Your HR & Recruitment Career',
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Recruitment Training Programs',
        itemListElement: [
          {
            '@type': 'Course',
            name: 'Recruitment Career Starter',
            url: `${BASE_URL}/recruitment-career-starter`,
            description: 'Recruiter course for freshers and entry-level HR professionals',
          },
          {
            '@type': 'Course',
            name: 'Recruitment Business Accelerator',
            url: `${BASE_URL}/recruitment-business-accelerator`,
            description: 'Advanced recruitment business accelerator for consultants and staffing entrepreneurs',
          },
          {
            '@type': 'Course',
            name: 'Professional Recruitment Specialist',
            url: `${BASE_URL}/professional-recruitment-specialist`,
            description: 'Comprehensive certification for working recruiters and talent acquisition specialists',
          },
          {
            '@type': 'Course',
            name: 'AI for Recruitment',
            url: `${BASE_URL}/ai-for-recruitment`,
            description: 'Master modern AI tools, automated sourcing, and talent intelligence',
          },
          {
            '@type': 'Course',
            name: 'Corporate Recruitment Training',
            url: `${BASE_URL}/corporate-recruitment-training`,
            description: 'Customized corporate recruitment programs for talent acquisition teams',
          },
        ],
      },
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
  const [sections, testimonials, stats] = await Promise.all([
    getAboutSections(),
    prisma.testimonial.findMany({ where: { isActive: true }, orderBy: { createdAt: 'desc' }, take: 4 }),
    getSiteStats(),
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
      <AboutClient sections={sections} testimonials={testimonialData} stats={stats} />
    </>
  )
}

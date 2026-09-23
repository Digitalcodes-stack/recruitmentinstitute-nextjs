import type { Metadata } from 'next'
import { getDynamicCourseData } from '@/lib/services/courseDataService'
import RecruitmentBusinessAcceleratorClient from '@/components/site/RecruitmentBusinessAcceleratorClient'
import { BASE_URL } from '@/lib/seo'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const SLUG = 'recruitment-business-accelerator'

export async function generateMetadata(): Promise<Metadata> {
  const pageTitle =
    'Recruitment Business Accelerator in India | Start & Scale Your Recruitment Agency | Recruitment Institute'
  const pageDesc =
    'Launch and scale with India\'s top Recruitment Business Accelerator. Master B2B client acquisition, legal frameworks, & start a profitable recruitment agency.'
  const ogImage = 'https://recruitmentinstitute.in/assets/images/courses/style4/4.jpg'

  return {
    title: pageTitle,
    description: pageDesc,
    keywords: [
      'Recruitment Business Accelerator',
      'Recruitment Training',
      'Recruitment Training in India',
      'Start Recruitment Agency',
      'Recruitment Agency Training',
      'HR Entrepreneurship Program',
      'HR Entrepreneurship',
      'Corporate Recruitment',
      'Professional Recruitment Specialist',
      'AI for Recruitment',
      'Recruitment Business Training India',
      'start recruitment agency India',
      'Recruitment Institute',
    ],
    alternates: { canonical: `${BASE_URL}/${SLUG}` },
    openGraph: {
      title: pageTitle,
      description: pageDesc,
      url: `${BASE_URL}/${SLUG}`,
      siteName: 'Recruitment Institute',
      locale: 'en_IN',
      type: 'website',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: 'Recruitment Business Accelerator in India - Recruitment Institute',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDesc,
      images: [ogImage],
    },
  }
}

export default async function RecruitmentBusinessAcceleratorPage() {
  const course = await getDynamicCourseData('entrepreneurship')
  const pageH1 = 'Recruitment Business Accelerator in India'
  const courseUrl = `${BASE_URL}/${SLUG}`
  const ogImage = 'https://recruitmentinstitute.in/assets/images/courses/style4/4.jpg'

  const schemaGraph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['Course', 'EducationalOccupationalProgram'],
        '@id': `${courseUrl}#program`,
        name: pageH1,
        description:
          course.description ||
          'Build, launch, acquire clients, deliver, and scale your recruitment consultancy firm with comprehensive legal frameworks, B2B sales engines, and founder mentoring.',
        url: courseUrl,
        image: ogImage,
        courseCode: SLUG,
        educationalCredentialAwarded: 'Certified Recruitment Agency Founder / Director',
        provider: {
          '@type': 'EducationalOrganization',
          '@id': `${BASE_URL}/#organization`,
          name: 'Recruitment Institute',
          url: BASE_URL,
          logo: `${BASE_URL}/assets/images/logo.png`,
        },
        hasCourseInstance: [
          {
            '@type': 'CourseInstance',
            name: 'Plan 1 — Launch (8 Weeks Foundation)',
            courseMode: 'Online',
            courseWorkload: '8 Weeks Intensive',
            offers: {
              '@type': 'Offer',
              price: '29999',
              priceCurrency: 'INR',
              availability: 'https://schema.org/InStock',
              validFrom: '2026-01-01',
              url: courseUrl,
            },
          },
          {
            '@type': 'CourseInstance',
            name: 'Plan 2 — Incubator (6 Months Hero Incubation)',
            courseMode: 'Blended',
            courseWorkload: '6 Months',
            offers: {
              '@type': 'Offer',
              price: '75000',
              priceCurrency: 'INR',
              availability: 'https://schema.org/InStock',
              validFrom: '2026-01-01',
              url: courseUrl,
            },
          },
          {
            '@type': 'CourseInstance',
            name: 'Plan 3 — Accelerator (12 Months Enterprise Advisory)',
            courseMode: 'Blended',
            courseWorkload: '12 Months',
            offers: {
              '@type': 'Offer',
              price: '150000',
              priceCurrency: 'INR',
              availability: 'https://schema.org/InStock',
              validFrom: '2026-01-01',
              url: courseUrl,
            },
          },
        ],
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${courseUrl}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
          { '@type': 'ListItem', position: 2, name: 'Courses', item: `${BASE_URL}/courses` },
          { '@type': 'ListItem', position: 3, name: pageH1, item: courseUrl },
        ],
      },
      {
        '@type': ['EducationalOrganization', 'Organization'],
        '@id': `${BASE_URL}/#organization`,
        name: 'Recruitment Institute',
        url: BASE_URL,
        logo: `${BASE_URL}/assets/images/logo.png`,
        description:
          'India\'s premier HR and recruitment training institute offering entrepreneurship accelerators, recruitment agency training, and recruiter career programs.',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Pune',
          addressRegion: 'Maharashtra',
          addressCountry: 'IN',
        },
        sameAs: [
          'https://www.linkedin.com/company/recruitment-institute',
          'https://www.facebook.com/recruitmentinstitute',
          'https://www.instagram.com/recruitmentinstitute',
        ],
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaGraph) }}
      />
      <RecruitmentBusinessAcceleratorClient course={course} />
    </>
  )
}

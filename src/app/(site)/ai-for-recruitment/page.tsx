import type { Metadata } from 'next'
import { getDynamicCourseData } from '@/lib/services/courseDataService'
import AiForRecruitmentLandingClient from '@/components/site/AiForRecruitmentLandingClient'
import { BASE_URL } from '@/lib/seo'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const SLUG = 'ai-for-recruitment'

export async function generateMetadata(): Promise<Metadata> {
  const ogImage = 'https://recruitmentinstitute.in/assets/images/courses/home14/3.jpg'
  const pageTitle = 'AI for Recruitment Course in India | AI Recruitment Training | Recruitment Institute'
  const pageDesc =
    'Master AI for Recruitment with India\'s top AI Recruitment Course. Learn AI sourcing, prompt engineering & ATS automation with online & classroom training.'

  return {
    title: pageTitle,
    description: pageDesc,
    keywords: [
      'AI for Recruitment',
      'AI Recruitment Course',
      'AI Recruitment Training',
      'AI for Talent Acquisition',
      'Recruitment Training',
      'Recruitment Training in India',
      'Professional Recruitment Specialist',
      'Corporate Recruitment',
      'Online AI Recruitment Course India',
      'AI recruiter training',
      'ChatGPT for recruiters',
      'Boolean AI search',
      'ATS automation',
      'Recruitment Institute Pune',
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
          alt: 'AI for Recruitment Course in India - Recruitment Institute',
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

export default async function AiForRecruitmentPage() {
  const course = await getDynamicCourseData('ai-for-recruitment')
  const pageH1 = 'AI for Recruitment Course in India'
  const courseUrl = `${BASE_URL}/${SLUG}`
  const ogImage = 'https://recruitmentinstitute.in/assets/images/courses/home14/3.jpg'

  const basePrice = course.pricing?.baseFee || 10000
  const onlinePrice = course.pricing?.online?.finalFee || Math.round(basePrice * 0.5)
  const offlinePrice = course.pricing?.offline?.finalFee || Math.round(basePrice * 0.9)

  const schemaGraph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Course',
        '@id': `${courseUrl}#course`,
        name: pageH1,
        description:
          course.description ||
          'Master Generative AI, ChatGPT prompts, automated candidate sourcing, and modern ATS tools with our AI Recruitment Course.',
        url: courseUrl,
        image: ogImage,
        courseCode: SLUG,
        educationalCredentialAwarded: 'Certified AI Recruitment Specialist',
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
            courseMode: 'Online',
            courseWorkload: course.duration || '4 Weeks',
            offers: {
              '@type': 'Offer',
              price: onlinePrice,
              priceCurrency: 'INR',
              availability: 'https://schema.org/InStock',
              validFrom: '2026-01-01',
              url: courseUrl,
            },
          },
          {
            '@type': 'CourseInstance',
            courseMode: 'Onsite',
            courseWorkload: course.duration || '4 Weeks',
            location: {
              '@type': 'Place',
              name: 'Recruitment Institute Pune Campus',
              address: {
                '@type': 'PostalAddress',
                addressLocality: 'Pune',
                addressRegion: 'Maharashtra',
                addressCountry: 'IN',
              },
            },
            offers: {
              '@type': 'Offer',
              price: offlinePrice,
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
          'India\'s premier HR and recruitment training institute offering job-oriented recruitment training, AI for recruitment, and recruiter career programs.',
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
      <AiForRecruitmentLandingClient course={course} />
    </>
  )
}

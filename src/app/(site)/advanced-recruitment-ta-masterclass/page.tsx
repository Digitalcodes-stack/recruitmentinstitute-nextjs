import type { Metadata } from 'next'
import { getDynamicCourseData } from '@/lib/services/courseDataService'
import DynamicCourseLandingClient from '@/components/site/DynamicCourseLandingClient'
import { BASE_URL, DEFAULT_OG_IMAGE } from '@/lib/seo'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const SLUG = 'advanced-recruitment-ta-masterclass'

export async function generateMetadata(): Promise<Metadata> {
  const course = await getDynamicCourseData('senior-professionals')
  const ogImage = course.image || DEFAULT_OG_IMAGE
  const pageTitle =
    'Advanced Recruitment & TA Masterclass in India | Talent Acquisition Course | Recruitment Institute'
  const pageDesc =
    'Join our Advanced Recruitment & TA Masterclass in India. An executive Talent Acquisition Course covering strategic hiring, AI tools, & workforce leadership.'

  return {
    title: pageTitle,
    description: pageDesc,
    keywords: [
      'Advanced Recruitment & TA Masterclass',
      'Talent Acquisition Course',
      'Talent Acquisition Training',
      'Advanced Recruitment Training',
      'Recruitment Training',
      'Recruitment Training in India',
      'Professional Recruitment Specialist',
      'Corporate Recruitment',
      'AI for Recruitment',
      'TA Masterclass',
      'TA Masterclass India',
      'Leadership in Talent Acquisition',
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
          alt: 'Advanced Recruitment & TA Masterclass in India - Recruitment Institute',
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

export default async function AdvancedTAMasterclassPage() {
  const course = await getDynamicCourseData('senior-professionals')
  const pageH1 = 'Advanced Recruitment & TA Masterclass in India'
  const courseUrl = `${BASE_URL}/${SLUG}`
  const ogImage = course.image || DEFAULT_OG_IMAGE

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
          'Elevate from recruiter to strategic talent leader with our Advanced Recruitment & TA Masterclass in India. Executive search, workforce planning, AI recruitment tools, and leadership capability building.',
        url: courseUrl,
        image: ogImage,
        courseCode: SLUG,
        educationalCredentialAwarded:
          'Executive Certificate in Strategic Talent Acquisition & Recruitment Leadership',
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
            courseWorkload: course.duration || '8 Weeks',
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
            courseWorkload: course.duration || '8 Weeks',
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
          'India\'s premier HR and recruitment training institute offering executive talent acquisition masterclasses, advanced recruitment training, and recruiter career programs.',
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
      <DynamicCourseLandingClient course={course} h1Title={pageH1} />
    </>
  )
}

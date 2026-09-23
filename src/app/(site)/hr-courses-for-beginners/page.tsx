import type { Metadata } from 'next'
import { getDynamicCourseData } from '@/lib/services/courseDataService'
import DynamicCourseLandingClient from '@/components/site/DynamicCourseLandingClient'
import { BASE_URL, DEFAULT_OG_IMAGE } from '@/lib/seo'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const SLUG = 'hr-courses-for-beginners'

export async function generateMetadata(): Promise<Metadata> {
  const course = await getDynamicCourseData('certification_tag')
  const ogImage = course.image || DEFAULT_OG_IMAGE
  const pageTitle =
    'HR Courses for Beginners & Freshers in India | Recruitment Career Starter | Recruitment Institute'
  const pageDesc =
    'Enroll in top HR Courses for Beginners in India. Our job-oriented Recruitment Course for Freshers offers live sourcing, ATS tools, & 100% placement support.'

  return {
    title: pageTitle,
    description: pageDesc,
    keywords: [
      'HR Courses for Beginners',
      'Recruitment Course for Freshers',
      'Recruitment Training for Beginners',
      'Recruitment Career Starter',
      'Recruitment Training in India',
      'HR Course for Freshers',
      'Recruitment Training',
      'Professional Recruitment Specialist',
      'Corporate Recruitment',
      'AI for Recruitment',
      'Job-Oriented HR Course India',
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
          alt: 'HR Courses for Beginners & Freshers in India - Recruitment Institute',
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

export default async function HrBeginnersPage() {
  const course = await getDynamicCourseData('certification_tag')
  const pageH1 = 'HR Courses for Beginners & Freshers in India'
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
          'Kickstart your corporate HR career with our practical Recruitment Course for Freshers in India. Learn candidate calling, resume screening, Boolean search, and ATS sourcing.',
        url: courseUrl,
        image: ogImage,
        courseCode: SLUG,
        educationalCredentialAwarded: 'Certified Recruitment Associate / Trainee',
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
      <DynamicCourseLandingClient course={course} h1Title={pageH1} />
    </>
  )
}

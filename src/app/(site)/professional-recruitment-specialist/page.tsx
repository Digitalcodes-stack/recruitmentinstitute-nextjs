import type { Metadata } from 'next'
import { getDynamicCourseData } from '@/lib/services/courseDataService'
import DynamicCourseLandingClient from '@/components/site/DynamicCourseLandingClient'
import { BASE_URL, DEFAULT_OG_IMAGE } from '@/lib/seo'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const SLUG = 'professional-recruitment-specialist'

export async function generateMetadata(): Promise<Metadata> {
  const course = await getDynamicCourseData('for-professionals')
  const ogImage = course.image || DEFAULT_OG_IMAGE
  const pageTitle =
    'Professional Recruitment Specialist Course in India | Recruitment Certification | Recruitment Institute'
  const pageDesc =
    'Become an industry-certified recruiter with our Professional Recruitment Specialist course in India. Multi-domain hiring, Boolean logic, & 100% placement support.'

  return {
    title: pageTitle,
    description: pageDesc,
    keywords: [
      'Professional Recruitment Specialist',
      'Recruitment Certification Course',
      'Recruitment Training',
      'Recruitment Training in India',
      'recruitment course in India',
      'certified talent acquisition specialist',
      'recruiter training course',
      'Corporate Recruitment',
      'AI for Recruitment',
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
          alt: 'Professional Recruitment Specialist Course in India - Recruitment Institute',
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

export default async function ProfessionalRecruitmentSpecialistPage() {
  const course = await getDynamicCourseData('for-professionals')
  const pageH1 = 'Professional Recruitment Specialist Course in India'
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
          'Become an industry-certified recruiter with our Professional Recruitment Specialist course in India. Multi-domain hiring, Boolean logic, STAR interviewing, and placement.',
        url: courseUrl,
        image: ogImage,
        courseCode: SLUG,
        educationalCredentialAwarded: 'Certified Professional Recruitment Specialist',
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
          'India\'s premier HR and recruitment training institute offering professional recruitment certification, specialist programs, and recruiter career accelerators.',
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

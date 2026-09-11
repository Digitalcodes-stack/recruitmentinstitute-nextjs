import type { DynamicCourseData } from '@/lib/services/courseDataService'

export const BASE_URL = 'https://recruitmentinstitute.in'
export const DEFAULT_OG_IMAGE = `${BASE_URL}/assets/images/og-default.jpg`

export interface BreadcrumbItem {
  name: string
  url: string
}

export function generateBreadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${BASE_URL}${item.url}`,
    })),
  }
}

export function generateCourseJsonLd(
  course: DynamicCourseData,
  slug: string,
  image: string = DEFAULT_OG_IMAGE,
  titleOverride?: string
) {
  const url = `${BASE_URL}/${slug}`
  const basePrice = course.pricing?.baseFee || 10000
  const onlinePrice = course.pricing?.online?.finalFee || Math.round(basePrice * 0.5)
  const offlinePrice = course.pricing?.offline?.finalFee || Math.round(basePrice * 0.9)

  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: titleOverride || course.title,
    description: course.description,
    provider: {
      '@type': 'EducationalOrganization',
      name: 'Recruitment Institute',
      sameAs: BASE_URL,
      url: BASE_URL,
      logo: `${BASE_URL}/assets/images/recruitment_insti_final_02.png`,
    },
    image,
    url,
    courseCode: slug,
    educationalCredentialAwarded: 'Recruitment Institute Certified Practitioner / Specialist',
    hasCourseInstance: [
      {
        '@type': 'CourseInstance',
        courseMode: 'online',
        courseWorkload: course.duration || '4 Weeks',
        offers: {
          '@type': 'Offer',
          price: onlinePrice,
          priceCurrency: 'INR',
          availability: 'https://schema.org/InStock',
          validFrom: '2026-01-01',
          url,
        },
      },
      {
        '@type': 'CourseInstance',
        courseMode: 'onsite',
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
          url,
        },
      },
    ],
  }
}

export function generateWebPageJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'EducationalOrganization',
        '@id': `${BASE_URL}/#organization`,
        name: 'Recruitment Institute',
        url: BASE_URL,
        logo: `${BASE_URL}/assets/images/recruitment_insti_final_02.png`,
        description:
          "India's #1 HR & Recruitment Training Institute in Pune. 100% practitioner-led mentorship, live simulation labs, and job placement assistance.",
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Pune',
          addressRegion: 'Maharashtra',
          addressCountry: 'IN',
        },
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: '+91-7385204165',
          contactType: 'customer service',
          areaServed: 'IN',
          availableLanguage: ['en', 'hi', 'mr'],
        },
        sameAs: [
          'https://www.linkedin.com/company/recruitmentinstitute/',
          'https://www.instagram.com/recruitmentinstitute/',
        ],
      },
      {
        '@type': 'WebPage',
        '@id': `${BASE_URL}/#webpage`,
        url: BASE_URL,
        name: 'Recruitment Training Institute in India & Pune | Recruitment Institute',
        description:
          'Learn recruitment, talent acquisition, sourcing, ATS, AI recruitment and HR skills with practical training from industry experts. Join online or Pune recruitment courses with certification and career support.',
        isPartOf: {
          '@type': 'WebSite',
          '@id': `${BASE_URL}/#website`,
          url: BASE_URL,
          name: 'Recruitment Institute',
        },
      },
      generateBreadcrumbJsonLd([{ name: 'Home', url: '/' }]),
    ],
  }
}

export function generateFaqJsonLd(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}

export function generateBlogPostingJsonLd(blog: {
  title: string
  content: string
  slug: string
  createdAt: Date | string
  updatedAt?: Date | string | null
  authorName?: string
  image?: string
}) {
  const url = `${BASE_URL}/blogs/${blog.slug}`
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: blog.title,
    description: blog.content.replace(/<[^>]*>/g, ' ').slice(0, 160).trim(),
    image: blog.image ? [blog.image] : [DEFAULT_OG_IMAGE],
    datePublished: new Date(blog.createdAt).toISOString(),
    dateModified: new Date(blog.updatedAt || blog.createdAt).toISOString(),
    author: {
      '@type': 'Person',
      name: blog.authorName || 'Editorial Team, Recruitment Institute',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Recruitment Institute',
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/assets/images/recruitment_insti_final_02.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
  }
}

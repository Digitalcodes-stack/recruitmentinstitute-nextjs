import type { DynamicCourseData, DynamicFaqItem } from '@/lib/services/courseDataService'

export const BASE_URL = 'https://recruitmentinstitute.in'
export const DEFAULT_OG_IMAGE = `${BASE_URL}/assets/images/og-default.jpg`
export const LOGO_IMAGE = `${BASE_URL}/assets/images/recruitment_insti_final_02.png`

export interface BreadcrumbItem {
  name: string
  url: string
}

export interface FaqItemInput {
  question?: string
  q?: string
  answer?: string
  a?: string
}

/**
 * Convert human duration like "4 Weeks", "8 Weeks", "3 Months", "6 Months" into ISO 8601 duration format.
 */
export function formatIsoDuration(duration?: string): string | undefined {
  if (!duration) return undefined
  const d = duration.toLowerCase().trim()
  const weekMatch = d.match(/(\d+)\s*(?:week|wk|wks|weeks)/)
  if (weekMatch) return `P${weekMatch[1]}W`
  const monthMatch = d.match(/(\d+)\s*(?:month|mo|mos|months)/)
  if (monthMatch) return `P${monthMatch[1]}M`
  const dayMatch = d.match(/(\d+)\s*(?:day|days)/)
  if (dayMatch) return `P${dayMatch[1]}D`
  return undefined
}

/**
 * Generates Schema.org BreadcrumbList structured data.
 */
export function generateBreadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${BASE_URL}${item.url.startsWith('/') ? item.url : `/${item.url}`}`,
    })),
  }
}

/**
 * Generates Schema.org FAQPage structured data.
 */
export function generateFaqJsonLd(faqs: FaqItemInput[]) {
  const validFaqs = faqs
    .map((f) => ({
      question: f.question || f.q || '',
      answer: f.answer || f.a || '',
    }))
    .filter((f) => f.question.trim().length > 0 && f.answer.trim().length > 0)

  if (validFaqs.length === 0) return null

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: validFaqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question.trim(),
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer.trim(),
      },
    })),
  }
}

export interface CourseSchemaOptions {
  course: DynamicCourseData
  slug: string
  pageH1?: string
  image?: string
  credentialAwarded?: string
  isProgram?: boolean
  customFaqs?: FaqItemInput[]
  customPriceTiers?: Array<{
    name: string
    mode: string
    workload: string
    price: number | string
  }>
}

/**
 * Generates unified, high-authority Schema Graph for Course landing pages.
 * Includes Course (+ EducationalOccupationalProgram if applicable), BreadcrumbList, and FAQPage.
 */
export function generateCoursePageSchemaGraph(options: CourseSchemaOptions) {
  const { course, slug, pageH1, image, credentialAwarded, isProgram, customFaqs, customPriceTiers } = options
  const courseUrl = `${BASE_URL}/${slug}`
  const courseName = pageH1 || course.title
  const rawDesc =
    (course.shortDescription && course.shortDescription.trim()) ||
    (course.description && course.description.trim()) ||
    (course.overview && course.overview.trim()) ||
    `Master ${courseName} with practical, job-oriented recruitment training from Recruitment Institute.`
  const courseDescription = rawDesc.replace(/<[^>]*>/g, '').trim()
  const courseImage = image || (course.image?.startsWith('http') ? course.image : `${BASE_URL}${course.image || '/assets/images/og-default.jpg'}`)
  const isoDuration = formatIsoDuration(course.duration)

  const basePrice = course.pricing?.baseFee || 10000
  const onlinePrice = course.pricing?.online?.finalFee || Math.round(basePrice * 0.5)
  const offlinePrice = course.pricing?.offline?.finalFee || Math.round(basePrice * 0.9)

  const courseInstances = customPriceTiers && customPriceTiers.length > 0
    ? customPriceTiers.map((tier) => ({
        '@type': 'CourseInstance',
        name: tier.name,
        courseMode: tier.mode,
        courseWorkload: tier.workload,
        offers: {
          '@type': 'Offer',
          price: tier.price,
          priceCurrency: 'INR',
          availability: 'https://schema.org/InStock',
          validFrom: '2026-01-01',
          url: courseUrl,
        },
      }))
    : [
        {
          '@type': 'CourseInstance',
          name: `${courseName} - Live Online Interactive Batch`,
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
          name: `${courseName} - Pune Classroom Training`,
          courseMode: 'Onsite',
          courseWorkload: course.duration || '4 Weeks',
          location: {
            '@type': 'Place',
            name: 'Recruitment Institute Pune Campus',
            address: {
              '@type': 'PostalAddress',
              streetAddress: 'Recruitment Institute',
              addressLocality: 'Pune',
              addressRegion: 'Maharashtra',
              postalCode: '411001',
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
      ]

  const courseTypes = isProgram ? ['Course', 'EducationalOccupationalProgram'] : 'Course'

  const courseEntity: Record<string, any> = {
    '@type': courseTypes,
    '@id': `${courseUrl}#course`,
    name: courseName,
    description: courseDescription,
    url: courseUrl,
    image: courseImage,
    courseCode: slug,
    educationalCredentialAwarded:
      credentialAwarded ||
      course.certificationDetails?.title ||
      'Recruitment Institute Certified Specialist',
    provider: {
      '@type': 'Organization',
      '@id': `${BASE_URL}/#organization`,
      name: 'Recruitment Institute',
      url: BASE_URL,
      sameAs: BASE_URL,
      logo: LOGO_IMAGE,
    },
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'INR',
      lowPrice: Math.min(onlinePrice, offlinePrice),
      highPrice: Math.max(onlinePrice, offlinePrice, basePrice),
      offerCount: courseInstances.length,
      availability: 'https://schema.org/InStock',
      url: courseUrl,
    },
    hasCourseInstance: courseInstances,
  }

  if (isoDuration) {
    courseEntity.timeRequired = isoDuration
  }

  const breadcrumbEntity = {
    '@type': 'BreadcrumbList',
    '@id': `${courseUrl}#breadcrumb`,
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
      { '@type': 'ListItem', position: 2, name: 'Courses', item: `${BASE_URL}/courses` },
      { '@type': 'ListItem', position: 3, name: courseName, item: courseUrl },
    ],
  }

  const rawFaqs = customFaqs && customFaqs.length > 0 ? customFaqs : (course.faqs || [])
  const validFaqs = rawFaqs
    .map((f) => ({
      question: (f as any).question || (f as any).q || '',
      answer: (f as any).answer || (f as any).a || '',
    }))
    .filter((f) => f.question.trim().length > 0 && f.answer.trim().length > 0)

  const graph: any[] = [courseEntity, breadcrumbEntity]

  if (validFaqs.length > 0) {
    graph.push({
      '@type': 'FAQPage',
      '@id': `${courseUrl}#faq`,
      mainEntity: validFaqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question.trim(),
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer.trim(),
        },
      })),
    })
  }

  return {
    '@context': 'https://schema.org',
    '@graph': graph,
  }
}

/**
 * Legacy wrapper for generateCourseJsonLd to maintain full backward compatibility.
 */
export function generateCourseJsonLd(
  course: DynamicCourseData,
  slug: string,
  image: string = DEFAULT_OG_IMAGE,
  titleOverride?: string
) {
  return generateCoursePageSchemaGraph({
    course,
    slug,
    pageH1: titleOverride,
    image,
  })
}

/**
 * Generates Root WebPage Schema for Homepage.
 */
export function generateWebPageJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
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
        about: {
          '@id': `${BASE_URL}/#organization`,
        },
        breadcrumb: {
          '@id': `${BASE_URL}/#breadcrumb`,
        },
        inLanguage: 'en-IN',
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${BASE_URL}/#breadcrumb`,
        itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL }],
      },
    ],
  }
}

/**
 * Generates BlogPosting schema with Google rich results requirements.
 */
export function generateBlogPostingJsonLd(blog: {
  title: string
  content: string
  slug: string
  createdAt: Date | string
  updatedAt?: Date | string | null
  authorName?: string
  author?: string | null
  image?: string
  featuredImage?: string | null
  metaDescription?: string | null
}) {
  const url = `${BASE_URL}/blogs/${blog.slug}`
  const plainDesc = blog.metaDescription || blog.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').slice(0, 160).trim()
  const imageUrl = blog.image || (blog.featuredImage?.startsWith('http') ? blog.featuredImage : blog.featuredImage ? `${BASE_URL}${blog.featuredImage}` : DEFAULT_OG_IMAGE)
  const fullImageUrl = imageUrl.startsWith('http') ? imageUrl : `${BASE_URL}${imageUrl}`
  const authorName = blog.authorName || blog.author || 'Editorial Team, Recruitment Institute'

  const datePublished = new Date(blog.createdAt).toISOString()
  const dateModified = new Date(blog.updatedAt || blog.createdAt).toISOString()

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: blog.title,
    description: plainDesc,
    image: [fullImageUrl],
    datePublished,
    dateModified,
    author: {
      '@type': 'Person',
      name: authorName,
      url: `${BASE_URL}/trainers`,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Recruitment Institute',
      url: BASE_URL,
      logo: {
        '@type': 'ImageObject',
        url: LOGO_IMAGE,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    url,
    inLanguage: 'en-IN',
  }
}

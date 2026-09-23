import type { Metadata } from 'next'
import { getDynamicCourseData } from '@/lib/services/courseDataService'
import RecruitmentBusinessAcceleratorClient from '@/components/site/RecruitmentBusinessAcceleratorClient'
import { BASE_URL, generateCoursePageSchemaGraph } from '@/lib/seo'

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
  const ogImage = 'https://recruitmentinstitute.in/assets/images/courses/style4/4.jpg'

  const schemaGraph = generateCoursePageSchemaGraph({
    course,
    slug: SLUG,
    pageH1,
    image: ogImage,
    isProgram: true,
    credentialAwarded: 'Certified Recruitment Agency Founder / Director',
    customPriceTiers: [
      {
        name: 'Plan 1 — Launch (8 Weeks Foundation)',
        mode: 'Online',
        workload: '8 Weeks Intensive',
        price: '29999',
      },
      {
        name: 'Plan 2 — Incubator (6 Months Hero Incubation)',
        mode: 'Blended',
        workload: '6 Months',
        price: '75000',
      },
      {
        name: 'Plan 3 — Accelerator (12 Months Enterprise Advisory)',
        mode: 'Blended',
        workload: '12 Months',
        price: '150000',
      },
    ],
  })

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

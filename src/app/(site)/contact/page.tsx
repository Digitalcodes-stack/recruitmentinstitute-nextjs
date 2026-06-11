import type { Metadata } from 'next'
import ContactClient from '@/components/home/ContactClient'

const BASE_URL = 'https://recruitmentinstitute.in'

export const metadata: Metadata = {
  title: 'Contact Us — Recruitment Institute Pune',
  description:
    'Contact Recruitment Institute in Pune for HR course enquiries, admissions guidance, and batch details. Call +91 9975048884 or email support@recruitmentinstitute.in.',
  keywords: 'contact recruitment institute, HR course enquiry pune, admissions recruitment training',
  alternates: { canonical: `${BASE_URL}/contact` },
  openGraph: {
    title: 'Contact Recruitment Institute — HR Training in Pune',
    description: 'Reach out to India\'s #1 HR training academy for course enquiries and admissions.',
    url: `${BASE_URL}/contact`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Recruitment Institute',
    description: 'Get in touch for HR course enquiries in Pune.',
  },
}

const contactSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'ContactPage',
      '@id': `${BASE_URL}/contact#webpage`,
      url: `${BASE_URL}/contact`,
      name: 'Contact Recruitment Institute',
      description: 'Contact page for Recruitment Institute — HR and recruitment training in Pune',
      isPartOf: { '@id': `${BASE_URL}/#website` },
      breadcrumb: { '@id': `${BASE_URL}/contact#breadcrumb` },
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${BASE_URL}/contact#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
        { '@type': 'ListItem', position: 2, name: 'Contact Us', item: `${BASE_URL}/contact` },
      ],
    },
    {
      '@type': 'LocalBusiness',
      name: 'Recruitment Institute',
      url: BASE_URL,
      telephone: '+91-9975048884',
      email: 'support@recruitmentinstitute.in',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Recruitment Institute',
        addressLocality: 'Pune',
        addressRegion: 'Maharashtra',
        postalCode: '411001',
        addressCountry: 'IN',
      },
      openingHoursSpecification: [
        { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '09:00', closes: '19:00' },
        { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Saturday', opens: '10:00', closes: '17:00' },
      ],
    },
  ],
}

export default function ContactPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(contactSchema) }} />
      <ContactClient />
    </>
  )
}

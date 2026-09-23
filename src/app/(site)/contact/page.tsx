import type { Metadata } from 'next'
import ContactClient from '@/components/home/ContactClient'

const BASE_URL = 'https://recruitmentinstitute.in'

export const metadata: Metadata = {
  title: 'Contact Recruitment Institute | Recruitment Training Admissions in India',
  description:
    'Contact Recruitment Institute for recruitment training course admissions, online batches, and career guidance across India. Call +91 7385204165.',
  keywords: [
    'Contact Recruitment Institute',
    'Recruitment Training Admissions India',
    'contact recruitment institute',
    'HR course enquiry India',
    'recruitment training admissions',
    'recruitment institute contact',
  ],
  alternates: { canonical: `${BASE_URL}/contact` },
  openGraph: {
    title: 'Contact Recruitment Institute | Recruitment Training Admissions in India',
    description: 'Reach out to India\'s premier recruitment training institute for course enquiries and admissions.',
    url: `${BASE_URL}/contact`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Recruitment Institute | Recruitment Training Admissions in India',
    description: 'Get in touch for recruitment and HR course enquiries across India.',
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
      description: 'Contact page for Recruitment Institute - HR and recruitment training in Pune',
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
      '@id': `${BASE_URL}/#localbusiness`,
      name: 'Recruitment Institute',
      image: `${BASE_URL}/assets/images/recruitment_insti_final_02.png`,
      url: BASE_URL,
      telephone: '+91-7385204165',
      email: 'support@recruitmentinstitute.in',
      priceRange: '₹₹',
      parentOrganization: { '@id': `${BASE_URL}/#organization` },
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Recruitment Institute',
        addressLocality: 'Pune',
        addressRegion: 'Maharashtra',
        postalCode: '411001',
        addressCountry: 'IN',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 18.5204,
        longitude: 73.8567,
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

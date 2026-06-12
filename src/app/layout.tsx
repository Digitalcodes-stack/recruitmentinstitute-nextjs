import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-poppins',
  display: 'swap',
})

const BASE_URL = 'https://recruitmentinstitute.in'

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'Recruitment Institute "" HR & Recruitment Training in Pune, India',
    template: '%s | Recruitment Institute',
  },
  description:
    'Recruitment Institute is India\'s #1 HR and recruitment training institute in Pune. Master end-to-end recruitment, HR skills, entrepreneurship, and corporate training with certified experts.',
  keywords: [
    'recruitment training pune',
    'HR courses india',
    'end to end recruitment training',
    'HR entrepreneurship program',
    'corporate training HR',
    'recruitment institute pune',
    'boolean search training',
    'talent acquisition course',
    'HR certification india',
    'recruitment academy pune',
  ],
  authors: [{ name: 'Recruitment Institute', url: BASE_URL }],
  creator: 'Recruitment Institute',
  publisher: 'Recruitment Institute',
  category: 'Education',
  classification: 'HR Training Institute',
  alternates: {
    canonical: BASE_URL,
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: BASE_URL,
    siteName: 'Recruitment Institute',
    title: 'Recruitment Institute "" HR & Recruitment Training in Pune, India',
    description:
      'India\'s #1 recruitment training institute. Expert-led HR courses, end-to-end recruitment training, entrepreneurship programs and corporate upskilling.',
    images: [
      {
        url: `${BASE_URL}/assets/images/og-default.jpg`,
        width: 1200,
        height: 630,
        alt: 'Recruitment Institute "" HR Training in Pune',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@recruitmentinstitute',
    creator: '@recruitmentinstitute',
    title: 'Recruitment Institute "" HR & Recruitment Training',
    description:
      'India\'s #1 recruitment training institute. Expert-led HR courses in Pune.',
    images: [`${BASE_URL}/assets/images/og-default.jpg`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add your Google Search Console verification token here
    // google: 'your-google-verification-token',
  },
}

// Organization + WebSite + LocalBusiness JSON-LD
const organizationSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${BASE_URL}/#organization`,
      name: 'Recruitment Institute',
      alternateName: ['RI', 'Recruitment Institute Pune'],
      url: BASE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/assets/images/recruitment_insti_final_02.png`,
        width: 300,
        height: 80,
      },
      description:
        'India\'s #1 HR and recruitment training institute offering end-to-end recruitment training, HR courses for beginners, entrepreneurship programs, and corporate training.',
      foundingDate: '2015',
      numberOfEmployees: { '@type': 'QuantitativeValue', value: 20 },
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Recruitment Institute',
        addressLocality: 'Pune',
        addressRegion: 'Maharashtra',
        postalCode: '411001',
        addressCountry: 'IN',
      },
      contactPoint: [
        {
          '@type': 'ContactPoint',
          telephone: '+91-7385204165',
          contactType: 'customer service',
          areaServed: 'IN',
          availableLanguage: ['English', 'Hindi', 'Marathi'],
        },
        {
          '@type': 'ContactPoint',
          telephone: '+91-7385204165',
          contactType: 'sales',
          areaServed: 'IN',
        },
      ],
      email: 'support@recruitmentinstitute.in',
      telephone: '+91-7385204165',
      sameAs: [
        'https://www.facebook.com/recruitmentinstitute',
        'https://www.linkedin.com/company/recruitment-institute',
        'https://www.instagram.com/recruitmentinstitute',
        'https://www.youtube.com/@recruitmentinstitute',
      ],
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'HR & Recruitment Training Programs',
        itemListElement: [
          { '@type': 'Offer', itemOffered: { '@type': 'Course', name: 'End-to-End Recruitment Training' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Course', name: 'HR Courses for Beginners' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Course', name: 'HR Entrepreneurship Program' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Course', name: 'HR Corporate Training Course' } },
        ],
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.9',
        reviewCount: '200',
        bestRating: '5',
        worstRating: '1',
      },
    },
    {
      '@type': 'EducationalOrganization',
      '@id': `${BASE_URL}/#educationalorg`,
      name: 'Recruitment Institute',
      url: BASE_URL,
      description: 'Premier HR and recruitment training academy in Pune, India',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Pune',
        addressRegion: 'Maharashtra',
        addressCountry: 'IN',
      },
      telephone: '+91-7385204165',
      email: 'support@recruitmentinstitute.in',
    },
    {
      '@type': 'LocalBusiness',
      '@id': `${BASE_URL}/#localbusiness`,
      name: 'Recruitment Institute',
      image: `${BASE_URL}/assets/images/recruitment_insti_final_02.png`,
      '@context': 'https://schema.org',
      url: BASE_URL,
      telephone: '+91-7385204165',
      priceRange: '₹₹',
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
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.9',
        reviewCount: '200',
        bestRating: '5',
      },
    },
    {
      '@type': 'WebSite',
      '@id': `${BASE_URL}/#website`,
      url: BASE_URL,
      name: 'Recruitment Institute',
      description: 'India\'s #1 HR and Recruitment Training Institute',
      publisher: { '@id': `${BASE_URL}/#organization` },
      potentialAction: {
        '@type': 'SearchAction',
        target: { '@type': 'EntryPoint', urlTemplate: `${BASE_URL}/blogs?s={search_term_string}` },
        'query-input': 'required name=search_term_string',
      },
    },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className="scroll-smooth" data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/assets/images/apple-touch-icon.png" />
        <meta name="theme-color" content="#1a2d4e" />
        <meta name="geo.region" content="IN-MH" />
        <meta name="geo.placename" content="Pune" />
        <meta name="geo.position" content="18.5204;73.8567" />
        <meta name="ICBM" content="18.5204, 73.8567" />
        {/* Google Analytics 4 "" replace G-XXXXXXXXXX with your Measurement ID */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`} />
            <script
              dangerouslySetInnerHTML={{
                __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${process.env.NEXT_PUBLIC_GA_ID}',{page_path:window.location.pathname});`,
              }}
            />
          </>
        )}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body className={`${poppins.variable} font-sans min-h-screen flex flex-col antialiased`}>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  )
}

import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import RequestCallWidget from '@/components/RequestCallWidget'

// All pages fetch live data — skip static generation at build time
export const dynamic = 'force-dynamic'

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
    default: 'Recruitment Institute - HR & Recruitment Training in Pune, India',
    template: '%s | Recruitment Institute',
  },
  description:
    'Recruitment Institute is India\'s #1 HR and recruitment training institute in Pune. Master end-to-end recruitment, HR skills, entrepreneurship and corporate training with certified experts.',
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
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    alternateLocale: ['en_US', 'en_GB', 'en_AE'],
    url: BASE_URL,
    siteName: 'Recruitment Institute',
    title: 'Recruitment Institute - HR & Recruitment Training in Pune, India',
    description:
      'India\'s #1 recruitment training institute. Expert-led HR courses, end-to-end recruitment training, entrepreneurship programs and corporate upskilling.',
    images: [
      {
        url: `${BASE_URL}/assets/images/og-default.jpg`,
        width: 1200,
        height: 630,
        alt: 'Recruitment Institute - HR Training in Pune',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@recruitmentinstitute',
    creator: '@recruitmentinstitute',
    title: 'Recruitment Institute - HR & Recruitment Training',
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
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || 'google-site-verification-recruitmentinstitute',
  },
}

// Organization + EducationalOrganization + LocalBusiness + WebSite JSON-LD
const organizationSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': ['Organization', 'EducationalOrganization'],
      '@id': `${BASE_URL}/#organization`,
      name: 'Recruitment Institute',
      alternateName: ['RI', 'Recruitment Institute Pune', 'RecruitmentInstitute.in'],
      url: BASE_URL,
      logo: {
        '@type': 'ImageObject',
        '@id': `${BASE_URL}/#logo`,
        url: `${BASE_URL}/assets/images/recruitment_insti_final_02.png`,
        contentUrl: `${BASE_URL}/assets/images/recruitment_insti_final_02.png`,
        width: 300,
        height: 80,
        caption: 'Recruitment Institute Logo',
      },
      image: `${BASE_URL}/assets/images/recruitment_insti_final_02.png`,
      description:
        'India\'s #1 HR and recruitment training institute in Pune offering end-to-end recruitment training, AI for recruitment, recruitment business accelerator, corporate training, and job placement assistance.',
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
          contactType: 'admissions',
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
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Course',
              name: 'End-to-End Recruitment Training',
              description: 'Master the full recruitment lifecycle, sourcing techniques, ATS screening, interviewing, and corporate hiring.',
              url: `${BASE_URL}/end-to-end-recruitment-training`,
              provider: {
                '@type': 'Organization',
                name: 'Recruitment Institute',
                sameAs: BASE_URL,
              },
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Course',
              name: 'HR Courses for Beginners',
              description: 'Job-oriented recruitment training course designed for freshers, graduates, and professionals transitioning into HR.',
              url: `${BASE_URL}/hr-courses-for-beginners`,
              provider: {
                '@type': 'Organization',
                name: 'Recruitment Institute',
                sameAs: BASE_URL,
              },
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Course',
              name: 'Recruitment Business Accelerator',
              description: 'Comprehensive business launch and scaling program for recruitment entrepreneurs and staffing agency founders.',
              url: `${BASE_URL}/recruitment-business-accelerator`,
              provider: {
                '@type': 'Organization',
                name: 'Recruitment Institute',
                sameAs: BASE_URL,
              },
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Course',
              name: 'AI for Recruitment',
              description: 'Hands-on training in modern AI recruiting tools, automated candidate sourcing workflows, and talent intelligence.',
              url: `${BASE_URL}/ai-for-recruitment`,
              provider: {
                '@type': 'Organization',
                name: 'Recruitment Institute',
                sameAs: BASE_URL,
              },
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Course',
              name: 'Professional Recruitment Specialist',
              description: 'Advanced recruitment certification covering IT & non-IT hiring, headhunting, Boolean search, and client management.',
              url: `${BASE_URL}/professional-recruitment-specialist`,
              provider: {
                '@type': 'Organization',
                name: 'Recruitment Institute',
                sameAs: BASE_URL,
              },
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Course',
              name: 'Advanced Recruitment & TA Masterclass',
              description: 'Strategic talent acquisition masterclass for senior recruiters covering executive search and leadership hiring.',
              url: `${BASE_URL}/advanced-recruitment-ta-masterclass`,
              provider: {
                '@type': 'Organization',
                name: 'Recruitment Institute',
                sameAs: BASE_URL,
              },
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Course',
              name: 'Recruitment Career Starter',
              description: 'Career starter course offering practical recruiter training, live candidate sourcing, and 100% placement support.',
              url: `${BASE_URL}/recruitment-career-starter`,
              provider: {
                '@type': 'Organization',
                name: 'Recruitment Institute',
                sameAs: BASE_URL,
              },
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Course',
              name: 'HR Corporate Training Course',
              description: 'Custom corporate training for enterprise HR and talent acquisition teams to boost hiring speed and quality.',
              url: `${BASE_URL}/hr-corporate-training-course`,
              provider: {
                '@type': 'Organization',
                name: 'Recruitment Institute',
                sameAs: BASE_URL,
              },
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Course',
              name: 'Corporate Recruitment Training',
              description: 'Upskilling enterprise hiring managers and recruiters with modern sourcing methodologies and structured interviewing.',
              url: `${BASE_URL}/corporate-recruitment-training`,
              provider: {
                '@type': 'Organization',
                name: 'Recruitment Institute',
                sameAs: BASE_URL,
              },
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Course',
              name: 'HR Entrepreneurship Program',
              description: 'Step-by-step program to build, launch, and grow a profitable recruitment consulting firm in India.',
              url: `${BASE_URL}/hr-entrepreneurship-program`,
              provider: {
                '@type': 'Organization',
                name: 'Recruitment Institute',
                sameAs: BASE_URL,
              },
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Course',
              name: 'Recruitment Business Growth Consulting',
              description: 'Strategic growth consulting and operational advisory for staffing and recruitment agency owners.',
              url: `${BASE_URL}/recruitment-business-growth-consulting`,
              provider: {
                '@type': 'Organization',
                name: 'Recruitment Institute',
                sameAs: BASE_URL,
              },
            },
          },
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
      '@type': 'LocalBusiness',
      '@id': `${BASE_URL}/#localbusiness`,
      name: 'Recruitment Institute',
      image: `${BASE_URL}/assets/images/recruitment_insti_final_02.png`,
      url: BASE_URL,
      telephone: '+91-7385204165',
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
      description: 'India\'s #1 HR and Recruitment Training Institute in Pune',
      publisher: { '@id': `${BASE_URL}/#organization` },
      inLanguage: 'en-IN',
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
    <html lang="en-IN" className="scroll-smooth" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
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
      <body className={`${poppins.variable} font-sans min-h-screen flex flex-col antialiased`} suppressHydrationWarning>
        {children}
        <Toaster position="top-right" />
        <RequestCallWidget />
        {/* AI Desk Talk widget — floating voice-assistant button */}
        <script
          src="/desk/admin/talk-widget.js"
          data-exec-id="aa76d1ef-ae97-4c64-9e1b-426555239b8d"
          data-exec-name="Pooja"
          data-api-base={
            process.env.NEXT_PUBLIC_AIDESK_API_URL ||
            'https://recruitmentinstitute-aidesk-396924250862.asia-south1.run.app'
          }
          async
        />
      </body>
    </html>
  )
}

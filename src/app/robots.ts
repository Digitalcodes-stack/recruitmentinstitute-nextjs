import { MetadataRoute } from 'next'

const BASE_URL = 'https://recruitmentinstitute.in'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/admin/',
          '/api/',
          '/profile',
          '/profile/',
          '/activity',
          '/subscriptions',
          '/trainer',
          '/trainer/',
          '/student-login',
          '/candidate-login',
          '/membership-login',
          '/trainer-login',
          '/thank-you',
          '/privacy',
          '/terms',
          '/_next/',
          '/static/',
        ],
      },
      // Block known web scrapers from training data
      {
        userAgent: 'GPTBot',
        disallow: ['/'],
      },
      {
        userAgent: 'ChatGPT-User',
        disallow: ['/'],
      },
      {
        userAgent: 'CCBot',
        disallow: ['/'],
      },
      // Allow Google Extended (AI Overviews) for AI search visibility
      {
        userAgent: 'Google-Extended',
        allow: '/',
      },
      // Allow Perplexity
      {
        userAgent: 'PerplexityBot',
        allow: '/',
        disallow: ['/admin', '/api/'],
      },
    ],
    sitemap: [
      `${BASE_URL}/sitemap.xml`,
      `${BASE_URL}/sitemap-blogs.xml`,
    ],
    host: BASE_URL,
  }
}

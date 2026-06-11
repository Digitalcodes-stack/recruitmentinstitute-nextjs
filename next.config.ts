import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'recruitmentinstitute.in' },
      { protocol: 'http', hostname: 'localhost' },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000,
  },

  async redirects() {
    return [
      { source: '/admin', destination: '/admin/dashboard', permanent: false },
      { source: '/admin/', destination: '/admin/dashboard', permanent: false },
      // ── Homepage / CI root controller ─────────────────────
      { source: '/home', destination: '/', permanent: true },
      { source: '/home/index', destination: '/', permanent: true },
      { source: '/index.php', destination: '/', permanent: true },
      { source: '/index.php/home', destination: '/', permanent: true },

      // ── About ─────────────────────────────────────────────
      { source: '/home/about', destination: '/about', permanent: true },
      { source: '/about-us', destination: '/about', permanent: true },

      // ── Courses ───────────────────────────────────────────
      { source: '/home/course_main', destination: '/courses', permanent: true },
      { source: '/course_main', destination: '/courses', permanent: true },
      { source: '/home/courses', destination: '/courses', permanent: true },
      { source: '/courses-list', destination: '/courses', permanent: true },
      // Old numeric course IDs → courses landing
      { source: '/home/course_single/:id', destination: '/courses', permanent: true },
      { source: '/course_single/:id', destination: '/courses', permanent: true },
      // Old course landing page alt URLs
      { source: '/home/end_to_end_recruitment_training', destination: '/end-to-end-recruitment-training', permanent: true },
      { source: '/home/hr_courses_for_beginners', destination: '/hr-courses-for-beginners', permanent: true },
      { source: '/home/hr_entrepreneurship_program', destination: '/hr-entrepreneurship-program', permanent: true },
      { source: '/home/hr_corporate_training_course', destination: '/hr-corporate-training-course', permanent: true },

      // ── Blog ──────────────────────────────────────────────
      { source: '/blog', destination: '/blogs', permanent: true },
      { source: '/blogpage', destination: '/blogs', permanent: true },
      { source: '/home/blogpage', destination: '/blogs', permanent: true },
      { source: '/home/blog', destination: '/blogs', permanent: true },
      // Old blog detail numeric IDs — redirect to blog list
      // (slug-based DB lookup not possible at redirect layer; handled in /blogs/[id] catch-all)
      { source: '/home/blog_details/:id', destination: '/blogs', permanent: false },
      { source: '/blog_details/:id', destination: '/blogs', permanent: false },

      // ── Contact ───────────────────────────────────────────
      { source: '/home/contact', destination: '/contact', permanent: true },
      { source: '/contact-us', destination: '/contact', permanent: true },

      // ── Knowledge ─────────────────────────────────────────
      { source: '/home/knowledge', destination: '/knowledge', permanent: true },
      { source: '/home/knowledges', destination: '/knowledge', permanent: true },
      { source: '/knowledges', destination: '/knowledge', permanent: true },
      { source: '/knowledges/:page', destination: '/knowledge?page=:page', permanent: true },
      { source: '/home/knowledge_detail/:id', destination: '/knowledge', permanent: true },

      // ── Login / Auth ──────────────────────────────────────
      { source: '/home/login_student', destination: '/candidate-login', permanent: true },
      { source: '/home/login_student/index.html', destination: '/candidate-login', permanent: true },
      { source: '/home/login_membership', destination: '/candidate-login', permanent: true },
      { source: '/home/login_membership/index.html', destination: '/candidate-login', permanent: true },
      { source: '/login', destination: '/candidate-login', permanent: true },
      { source: '/login_student', destination: '/candidate-login', permanent: true },
      { source: '/login_membership', destination: '/candidate-login', permanent: true },

      // ── Community / Members ───────────────────────────────
      { source: '/home/community', destination: '/community', permanent: true },
      { source: '/home/members', destination: '/community', permanent: true },
      { source: '/members', destination: '/community', permanent: true },

      // ── Student Membership ────────────────────────────────
      { source: '/home/Student_Membership', destination: '/student-membership', permanent: true },
      { source: '/home/student_membership', destination: '/student-membership', permanent: true },
      { source: '/Student_Membership', destination: '/student-membership', permanent: true },
      { source: '/student_membership', destination: '/student-membership', permanent: true },

      // ── Fees ──────────────────────────────────────────────
      { source: '/home/fees', destination: '/fees', permanent: true },
      { source: '/fee', destination: '/fees', permanent: true },

      // ── Admin (old CI admin) ──────────────────────────────
      { source: '/Admin', destination: '/admin', permanent: true },
      { source: '/Admin/index.php', destination: '/admin', permanent: true },
    ]
  },

  async headers() {
    return [
      // Security headers on all routes
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
        ],
      },
      // Long-cache on static image uploads
      {
        source: '/uploads/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      // Long-cache on public assets
      {
        source: '/assets/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      // NOTE: /_next/static cache headers intentionally omitted —
      // Next.js manages these automatically via content-hash filenames.
      // Adding immutable here breaks hot-reload and causes hydration mismatches.

    ]
  },
}

export default nextConfig

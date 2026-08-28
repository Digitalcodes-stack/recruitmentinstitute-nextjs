import type { Metadata } from 'next'
import HomePage from '@/components/home/HomePage'
import { prisma } from '@/lib/prisma'

function stripHtml(input: string) {
  return input
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/(p|h[1-6]|li|ul|ol)>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&mdash;/g, '-')
    .replace(/&ndash;/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
}

export const metadata: Metadata = {
  title: 'Recruitment Institute - HR & Recruitment Training Courses',
  description:
    'Master HR and recruitment skills with expert-led courses. End-to-end recruitment training, HR for beginners, entrepreneurship programs, and corporate training in Pune.',
  keywords: 'recruitment training pune, HR courses, end to end recruitment, recruitment institute',
  openGraph: {
    title: 'Recruitment Institute - HR & Recruitment Training',
    description: 'Master HR and recruitment skills with expert-led courses.',
    url: 'https://recruitmentinstitute.in',
  },
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function Page() {
  const [categories, testimonials, totalCourses, totalStudents, services, experts, clients] = await Promise.all([
    prisma.courseCategory.findMany({
      orderBy: { id: 'asc' },
      include: {
        courses: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    }),
    prisma.testimonial.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      take: 4,
    }),
    prisma.course.count(),
    prisma.student.count({ where: { isActive: true } }),
    prisma.service.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      take: 6,
    }),
    prisma.expert.findMany({
      include: { category: true },
      orderBy: { id: 'asc' },
      take: 8,
    }),
    prisma.clientLogo.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      select: { id: true, name: true, logo: true, website: true },
    }),
  ])

  const SLUG_ORDER = [
    'for-freshers',
    'for-professionals',
    'senior-professionals',
    'entrepreneurship',
    'business-consulting',
    'corporate',
  ]

  const SLUG_ROUTE_MAP: Record<string, { href: string; badge: string; badgeCls: string; bar: string; image: string; highlights: string[] }> = {
    'for-freshers': {
      href: '/recruitment-career-starter',
      badge: 'Beginner Friendly',
      badgeCls: 'bg-sky-600 text-white',
      bar: 'from-sky-500 to-sky-700',
      image: '/assets/images/about/tab1.jpg',
      highlights: ['Naukri Resdex & Sourcing', 'Candidate Calling Drills', 'Placement & Resume Support'],
    },
    'for-professionals': {
      href: '/professional-recruitment-specialist',
      badge: 'Most Popular',
      badgeCls: 'bg-red-600 text-white',
      bar: 'from-red-500 to-red-700',
      image: '/assets/images/banner/home9.jpg',
      highlights: ['IT & Non-IT Tech Sourcing', 'STAR Interview Framework', 'Salary & Offer Negotiation'],
    },
    'senior-professionals': {
      href: '/advanced-recruitment-ta-masterclass',
      badge: 'Executive Track',
      badgeCls: 'bg-purple-600 text-white',
      bar: 'from-purple-500 to-purple-700',
      image: '/assets/images/courses/home14/3.jpg',
      highlights: ['Executive Headhunting', 'TA Dashboards & Analytics', 'Leadership Hiring SLAs'],
    },
    'entrepreneurship': {
      href: '/recruitment-business-accelerator',
      badge: 'Agency Track',
      badgeCls: 'bg-amber-600 text-white',
      bar: 'from-amber-500 to-amber-700',
      image: '/assets/images/courses/style4/4.jpg',
      highlights: ['Agency Legal & MSA Setup', 'B2B Client Prospecting', '12-Month ₹1 Cr Blueprint'],
    },
    'business-consulting': {
      href: '/recruitment-business-growth-consulting',
      badge: '1-to-1 Advisory',
      badgeCls: 'bg-emerald-600 text-white',
      bar: 'from-emerald-500 to-emerald-700',
      image: '/assets/images/courses/home14/4.jpg',
      highlights: ['Retained Search Positioning', 'Cash Flow & DSO Optimization', 'Direct Founder Mentorship'],
    },
    'corporate': {
      href: '/corporate-recruitment-training',
      badge: 'Enterprise',
      badgeCls: 'bg-indigo-600 text-white',
      bar: 'from-indigo-500 to-indigo-700',
      image: '/assets/images/courses/home14/2.jpg',
      highlights: ['Custom Hiring Playbooks', 'Interviewer Calibration', 'Pre-Boarding Retention'],
    },
  }

  // Sort categories strictly according to canonical 6-course order
  const sortedCategories = [...categories].sort((a, b) => {
    const aIdx = SLUG_ORDER.indexOf(a.slug)
    const bIdx = SLUG_ORDER.indexOf(b.slug)
    if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx
    if (aIdx !== -1) return -1
    if (bIdx !== -1) return 1
    return a.id - b.id
  })

  const courses = sortedCategories
    .filter((category) => category.courses.length > 0)
    .map((category) => {
      const course = category.courses[0]
      const meta = SLUG_ROUTE_MAP[category.slug] || {
        href: `/${category.slug}`,
        badge: 'Featured',
        badgeCls: 'bg-slate-700 text-white',
        bar: 'from-slate-500 to-slate-700',
        image: '/assets/images/banner/home-students-banner.jpg',
        highlights: ['Live Classes & Labs', 'Practical Mandates', 'ISO Certificate'],
      }

      return {
        id: course.id,
        title: course.title,
        badge: meta.badge,
        badgeCls: meta.badgeCls,
        level: category.name,
        duration: course.duration?.trim() || '6 Weeks',
        desc: stripHtml(course.description),
        href: meta.href,
        image: meta.image,
        bar: meta.bar,
        highlights: meta.highlights,
      }
    })

  const totalAlumniCount = 5000 + totalStudents

  const stats = [
    { icon: 'users' as const, value: `${totalAlumniCount.toLocaleString('en-IN')}+`, label: 'Professionals Trained', iconBg: '#EFF6FF', iconColor: '#1D4ED8' },
    { icon: 'book' as const, value: `${courses.length || totalCourses}`, label: 'Programs Available', iconBg: '#F5F3FF', iconColor: '#7C3AED' },
    { icon: 'award' as const, value: '10+ Yrs', label: 'Industry Expertise', iconBg: '#FFFBEB', iconColor: '#D97706' },
    { icon: 'trending' as const, value: '95%', label: 'Placement Success', iconBg: '#F0FDF4', iconColor: '#16A34A' },
  ]

  const testimonialData = testimonials.map((t) => ({
    name: t.author || 'Alumni',
    role: t.title || 'Student',
    company: 'Recruitment Institute',
    initial: (t.author || 'A').slice(0, 1).toUpperCase(),
    grad: 'from-blue-500 to-indigo-600',
    text: t.description || '',
    image: t.image || '',
    rating: t.rating || 5,
  }))

  const serviceData = services.map((s) => ({
    id: s.id,
    title: s.title,
    description: s.description || '',
    image: s.image || '',
    slug: s.slug,
  }))

  const expertData = experts.map((e) => ({
    id: e.id,
    name: e.title,
    profession: e.profession || '',
    image: e.image || '',
    category: e.category.name,
  }))

  const clientData = clients.map(c => ({ id: c.id, name: c.name, logo: c.logo, website: c.website || '' }))

  return <HomePage courses={courses} stats={stats} testimonials={testimonialData} services={serviceData} experts={expertData} clients={clientData} />
}

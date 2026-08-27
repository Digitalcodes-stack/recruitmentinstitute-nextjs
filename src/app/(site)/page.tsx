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

  const courses = categories
    .filter((category) => category.courses.length > 0)
    .map((category, index) => {
      const course = category.courses[0]
      const courseImages = [
        '/assets/images/banner/home9.jpg',          // End-to-End: office team working on laptops
        '/assets/images/about/tab1.jpg',             // HR Beginners: students learning at laptop
        '/assets/images/bg/about-bg.jpg',            // Entrepreneurship: professional on call
        '/assets/images/about/tab2.jpg',             // Corporate: team collaborating
      ]
      const badgeMap = ['Most Popular', 'Beginner Friendly', 'Business Track', 'Enterprise']
      const levelMap = ['Advanced / Professional', 'Foundational', 'Advanced / Business', 'Tailored / Executive']
      const durations = ['3 Months', '6 Weeks', '2 Months', 'Flexible']
      const highlights = [
        ['Boolean Search & LinkedIn', 'ATS Tools & Sourcing', 'All Industry Domains'],
        ['HR Fundamentals', 'Recruitment Basics', 'Resume Screening'],
        ['Agency Setup', 'Client Acquisition', 'Pricing Strategy'],
        ['Team Assessment', 'Process Optimisation', 'ATS Implementation'],
      ]
      const slugs = ['end-to-end-recruitment-training', 'hr-courses-for-beginners', 'hr-entrepreneurship-program', 'hr-corporate-training-course']
      const defaultTitleMap = ['End-to-End Recruitment Training', 'HR Courses for Beginners', 'HR Entrepreneurship Program', 'HR Corporate Training']
      
      const title = course.title && course.title !== 'Degree Courses' && course.title !== 'Certification Courses' && course.title !== 'Entrepreneur Courses' && course.title !== 'Corporate Traning Courses'
        ? course.title
        : defaultTitleMap[index] || course.title

      return {
        id: course.id,
        title,
        badge: badgeMap[index] || 'Featured',
        badgeCls: ['bg-red-500 text-white', 'bg-blue-600 text-white', 'bg-emerald-600 text-white', 'bg-purple-600 text-white'][index] || 'bg-slate-700 text-white',
        level: levelMap[index] || category.name,
        duration: durations[index] || 'Flexible',
        desc: stripHtml(course.description),
        href: `/${slugs[index] || category.slug}`,
        image: courseImages[index] || '/assets/images/banner/home-students-banner.jpg',
        bar: ['from-red-500 to-red-700', 'from-blue-500 to-blue-700', 'from-emerald-500 to-emerald-700', 'from-purple-500 to-purple-700'][index] || 'from-slate-500 to-slate-700',
        highlights: highlights[index] || [],
      }
    })

  const stats = [
    { icon: 'users' as const, value: `${totalStudents.toLocaleString('en-IN')}+`, label: 'Professionals Trained', iconBg: '#EFF6FF', iconColor: '#1D4ED8' },
    { icon: 'book' as const, value: `${totalCourses}`, label: 'Programs Available', iconBg: '#F5F3FF', iconColor: '#7C3AED' },
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

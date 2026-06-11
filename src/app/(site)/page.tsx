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
  title: 'Recruitment Institute — HR & Recruitment Training Courses',
  description:
    'Master HR and recruitment skills with expert-led courses. End-to-end recruitment training, HR for beginners, entrepreneurship programs, and corporate training in Pune.',
  keywords: 'recruitment training pune, HR courses, end to end recruitment, recruitment institute',
  openGraph: {
    title: 'Recruitment Institute — HR & Recruitment Training',
    description: 'Master HR and recruitment skills with expert-led courses.',
    url: 'https://recruitmentinstitute.in',
  },
}

export default async function Page() {
  const [categories, testimonials, totalCourses, totalStudents] = await Promise.all([
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
  ])

  const courses = categories
    .filter((category) => category.courses.length > 0)
    .map((category, index) => {
      const course = category.courses[0]
      const courseImages = [
        '/assets/images/courses/main-home/1.jpg',
        '/assets/images/courses/main-home/2.jpg',
        '/assets/images/courses/home8/3.jpg',
        '/assets/images/courses/home8/1.jpg',
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
      return {
        id: course.id,
        title: course.title,
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
  }))

  return <HomePage courses={courses} stats={stats} testimonials={testimonialData} />
}

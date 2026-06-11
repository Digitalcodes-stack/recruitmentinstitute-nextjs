import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import {
  ArrowRight,
  Award,
  BadgeCheck,
  BookOpen,
  Briefcase,
  Building2,
  CheckCircle2,
  Clock,
  ChevronRight,
  MessageCircle,
  Monitor,
  Phone,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react'

const BASE_URL = 'https://recruitmentinstitute.in'

export const metadata: Metadata = {
  title: 'HR & Recruitment Training Courses in Pune - All Programs',
  description:
    'Explore recruitment and HR training programs at Recruitment Institute Pune. End-to-end recruitment, HR basics, entrepreneurship, and corporate training.',
  keywords: 'HR courses pune, recruitment training programs, end to end recruitment, HR entrepreneurship, corporate HR training',
  alternates: { canonical: `${BASE_URL}/courses` },
  openGraph: {
    title: 'HR & Recruitment Courses in Pune - Recruitment Institute',
    description: "India's #1 recruitment training institute. Expert programs for every career stage.",
    url: `${BASE_URL}/courses`,
    type: 'website',
    images: [{ url: `${BASE_URL}/assets/images/og-courses.jpg`, width: 1200, height: 630, alt: 'HR Training Courses at Recruitment Institute' }],
  },
}

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

function Stars({ rating }: { rating: number }) {
  return (
    <span style={{ display: 'inline-flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} style={{ width: 13, height: 13, color: '#F59E0B', fill: s <= Math.round(rating) ? '#F59E0B' : 'none' }} />
      ))}
    </span>
  )
}

function getCourseImage(categorySlug: string, index: number) {
  const bySlug: Record<string, string> = {
    degree_tag:            '/assets/images/courses/main-home/1.jpg',
    certification_tag:     '/assets/images/courses/main-home/2.jpg',
    entrepreneur_tag:      '/assets/images/courses/home8/3.jpg',
    corporate_traning_tag: '/assets/images/courses/home8/1.jpg',
  }
  if (bySlug[categorySlug]) return bySlug[categorySlug]

  const fallbacks = [
    '/assets/images/courses/home12/1.jpg',
    '/assets/images/courses/home12/2.jpg',
    '/assets/images/courses/home12/3.jpg',
    '/assets/images/courses/home12/4.jpg',
    '/assets/images/courses/home13/1.jpg',
    '/assets/images/courses/home13/2.jpg',
    '/assets/images/courses/home14/1.jpg',
    '/assets/images/courses/home14/2.jpg',
  ]
  return fallbacks[index % fallbacks.length]
}

export default async function CoursesPage() {
  const [categories, courses, fees, reviews] = await Promise.all([
    prisma.courseCategory.findMany({
      orderBy: { id: 'asc' },
      include: {
        courses: { orderBy: { id: 'asc' } },
        fees: { orderBy: { id: 'asc' } },
      },
    }),
    prisma.course.findMany({
      orderBy: { id: 'asc' },
      include: { category: true },
    }),
    prisma.courseFee.findMany({
      orderBy: { id: 'asc' },
      include: { category: { include: { courses: true } } },
    }),
    prisma.courseReview.findMany({
      orderBy: { id: 'asc' },
      include: { category: true },
    }),
  ])

  const primaryCards = courses.slice(0, 2).map((course, index) => {
    const categorySlug = course.category.slug
    const categoryName = course.category.name
    const relatedFee = fees.find((fee) => fee.categoryId === course.categoryId)
    const relatedReviews = reviews.filter((review) => review.categoryId === course.categoryId)

    return {
      slug: categorySlug,
      id: course.id,
      title: course.title,
      badge: index === 0 ? 'Most Popular' : 'Beginner Friendly',
      level: categoryName,
      accent: index === 0 ? '#1D4ED8' : '#0D9488',
      accentMid: index === 0 ? '#2563EB' : '#14B8A6',
      accentLight: index === 0 ? '#EFF6FF' : '#F0FDFA',
      accentBorder: index === 0 ? '#BFDBFE' : '#99F6E4',
      accentKey: index === 0 ? 'blue' : 'teal',
      description: stripHtml(course.description),
      image: getCourseImage(categorySlug, index),
      features: [
        relatedFee ? `Fee from database: INR ${Number(relatedFee.finalTotal ?? relatedFee.fees ?? 0).toLocaleString('en-IN')}` : 'Live pricing available',
        `${course.totalStudents.toLocaleString('en-IN')} enrolled students`,
        `${relatedReviews.length} course reviews`,
        `Category: ${categoryName}`,
      ],
      duration: course.startDate ? new Date(course.startDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : 'Rolling intake',
      mode: course.courseBy || 'Recruitment training',
      rating: Number(course.rating ?? 4.8),
      reviews: relatedReviews.length || 0,
      enrolled: `${course.totalStudents.toLocaleString('en-IN')}+`,
    }
  })

  const secondaryCards = fees.slice(0, 2).map((fee, index) => {
    const categorySlug = fee.category.slug
    const linkedCourse = courses.find((course) => course.categoryId === fee.categoryId)
    const relatedReviews = reviews.filter((review) => review.categoryId === fee.categoryId)
    const description = linkedCourse ? stripHtml(linkedCourse.description) : `${fee.courseName} is part of the ${fee.category.name} program line-up.`

    return {
      slug: categorySlug,
      id: fee.id,
      title: fee.courseName,
      badge: index === 0 ? 'Business Track' : 'Enterprise',
      level: fee.category.name,
      accent: index === 0 ? '#B45309' : '#6D28D9',
      accentMid: index === 0 ? '#D97706' : '#7C3AED',
      accentLight: index === 0 ? '#FFFBEB' : '#F5F3FF',
      accentBorder: index === 0 ? '#FDE68A' : '#DDD6FE',
      accentKey: index === 0 ? 'amber' : 'purple',
      description,
      image: getCourseImage(categorySlug, index + 2),
      features: [
        fee.fees ? `Fee: INR ${Number(fee.fees).toLocaleString('en-IN')}` : 'Fee available in database',
        fee.discount ? `Discount: INR ${Number(fee.discount).toLocaleString('en-IN')}` : 'Discount available in database',
        fee.finalTotal ? `Final total: INR ${Number(fee.finalTotal).toLocaleString('en-IN')}` : 'Final total available in database',
        `${relatedReviews.length} reviews in database`,
      ],
      duration: fee.couponCode || 'Current batch',
      mode: linkedCourse?.courseBy || 'Live training',
      rating: relatedReviews.length ? Math.min(5, 4 + relatedReviews.length / 10) : 4.5,
      reviews: relatedReviews.length,
      enrolled: fee.category.courses.length ? `${fee.category.courses.length} programs` : 'Database-driven',
    }
  })

  const stats = [
    { icon: Users, value: `${categories.length}`, label: 'Program Categories', color: '#DC2626', bg: '#FEF2F2', border: '#FECACA' },
    { icon: BookOpen, value: `${courses.length}`, label: 'Live Courses', color: '#1D4ED8', bg: '#EFF6FF', border: '#BFDBFE' },
    { icon: Award, value: `${reviews.length}`, label: 'Course Reviews', color: '#B45309', bg: '#FFFBEB', border: '#FDE68A' },
    { icon: TrendingUp, value: `${fees.length}`, label: 'Pricing Records', color: '#0D9488', bg: '#F0FDFA', border: '#99F6E4' },
  ]

  const itemList = [...primaryCards, ...secondaryCards]

  const coursesSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${BASE_URL}/courses#webpage`,
        url: `${BASE_URL}/courses`,
        name: 'HR & Recruitment Training Courses - Recruitment Institute',
        description: 'All HR and recruitment training programs at Recruitment Institute Pune',
        isPartOf: { '@id': `${BASE_URL}/#website` },
      },
      {
        '@type': 'ItemList',
        name: 'HR & Recruitment Training Programs',
        numberOfItems: itemList.length,
        itemListElement: itemList.map((course, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'Course',
            name: course.title,
            description: course.description,
            url: `${BASE_URL}/${course.slug}`,
            provider: { '@type': 'Organization', name: 'Recruitment Institute', url: BASE_URL },
          },
        })),
      },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(coursesSchema) }} />

      <style>{`
        .c-crumb { color: #94A3B8; text-decoration: none; font-size: 13px; font-weight: 500; transition: color .18s; }
        .c-crumb:hover { color: #CBD5E1; }
        .c-hero-cta, .c-hero-ghost, .c-cta-primary, .c-cta-ghost, .c-btn-dark, .c-btn-red {
          text-decoration: none;
        }
        .c-hero-cta {
          display: inline-flex; align-items: center; gap: 9px;
          background: linear-gradient(135deg,#1D4ED8,#2563EB);
          color: #fff; font-weight: 700; font-size: 14px;
          padding: 14px 30px; border-radius: 10px;
          box-shadow: 0 8px 28px rgba(29,78,216,.45);
        }
        .c-hero-ghost {
          display: inline-flex; align-items: center; gap: 9px;
          border: 1.5px solid rgba(255,255,255,.16); color: #fff;
          font-weight: 600; font-size: 14px; padding: 13px 24px;
          border-radius: 10px; background: rgba(255,255,255,.05);
        }
        .c-stat-card, .c-card-primary, .c-card-secondary { transition: transform .25s, box-shadow .25s; }
        .c-stat-card:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(15,23,42,.12) !important; }
        .c-card-primary, .c-card-secondary {
          background: #fff; border-radius: 20px; border: 1.5px solid #E2E8F0;
          box-shadow: 0 4px 28px rgba(15,23,42,.07); overflow: hidden;
        }
        .c-card-primary:hover, .c-card-secondary:hover { transform: translateY(-5px); box-shadow: 0 22px 56px rgba(15,23,42,.12); }
        .c-card-img { transition: transform .55s ease; width: 100%; height: 100%; object-fit: cover; object-position: top center; }
        .c-card-primary:hover .c-card-img, .c-card-secondary:hover .c-card-img { transform: scale(1.05); }
        .c-btn-dark {
          flex: 1; display: flex; align-items: center; justify-content: center; gap: 7px;
          background: #0F172A; color: #fff; font-weight: 700; font-size: 13px;
          padding: 13px 16px; border-radius: 9px;
        }
        .c-btn-red {
          flex: 1; display: flex; align-items: center; justify-content: center; gap: 7px;
          background: linear-gradient(135deg,#DC2626,#EF4444);
          color: #fff; font-weight: 700; font-size: 13px;
          padding: 13px 16px; border-radius: 9px;
        }
        @media (max-width: 1100px) { .c-hero-grid { grid-template-columns: 1fr !important; } .c-hero-visual { display: none !important; } }
        @media (max-width: 980px) { .c-primary-grid, .c-secondary-grid, .c-stats-grid { grid-template-columns: 1fr !important; } .c-card-secondary { flex-direction: column !important; } .c-sec-img-wrap { width: 100% !important; height: 220px !important; } .c-feat-grid, .c-cta-grid { grid-template-columns: 1fr !important; } }
        @media (max-width: 700px) { .c-feat-grid { grid-template-columns: 1fr !important; } .c-stats-grid { grid-template-columns: repeat(2,1fr) !important; } }
        @media (max-width: 480px) { .c-stats-grid { grid-template-columns: 1fr !important; } }
      `}</style>

      <section
        style={{
          background: 'linear-gradient(130deg,#060D1C 0%,#0B1629 40%,#0E1F3A 70%,#071120 100%)',
          position: 'relative',
          overflow: 'hidden',
          minHeight: '580px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div aria-hidden className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,.025) 1px, transparent 1px)', backgroundSize: '28px 28px', zIndex: 1 }} />
        <div aria-hidden className="absolute top-0 left-0 right-0" style={{ height: 2, background: 'linear-gradient(90deg,transparent 0%,#D97706 28%,#14B8A6 72%,transparent 100%)', zIndex: 3 }} />

        <div className="container" style={{ position: 'relative', zIndex: 10, padding: '80px 0 88px' }}>
          <div className="c-hero-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 430px', gap: '60px', alignItems: 'center' }}>
            <div>
              <nav aria-label="breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 28 }}>
                <Link href="/" className="c-crumb">Home</Link>
                <ChevronRight style={{ width: 13, height: 13, color: '#475569' }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: '#F59E0B' }}>All Courses</span>
              </nav>

              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 50, background: 'rgba(245,158,11,.12)', border: '1px solid rgba(245,158,11,.28)', marginBottom: 22 }}>
                <Sparkles style={{ width: 12, height: 12, color: '#F59E0B' }} />
                <span style={{ fontSize: 11, fontWeight: 800, color: '#FCD34D', letterSpacing: '.18em', textTransform: 'uppercase' }}>HR & Recruitment Training</span>
              </div>

              <h1 style={{ fontSize: 'clamp(30px,3.8vw,54px)', fontWeight: 900, color: '#fff', lineHeight: 1.1, letterSpacing: '-.035em', marginBottom: 20 }}>
                Recruitment programs
                <br />
                <span style={{ background: 'linear-gradient(120deg,#60A5FA 0%,#5EEAD4 55%,#FCD34D 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  backed by live database content.
                </span>
              </h1>

              <p style={{ fontSize: 16, color: '#94A3B8', lineHeight: 1.85, maxWidth: 520, marginBottom: 34 }}>
                Every program card on this page is pulled from the database. Images are limited to recruitment and HR visuals only.
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 38 }}>
                {[
                  { label: 'Live database content', color: '#5EEAD4', bg: 'rgba(94,234,212,.09)', border: 'rgba(94,234,212,.2)' },
                  { label: 'Recruitment visuals only', color: '#FCD34D', bg: 'rgba(252,211,77,.09)', border: 'rgba(252,211,77,.2)' },
                  { label: 'Pricing from database', color: '#86EFAC', bg: 'rgba(134,239,172,.09)', border: 'rgba(134,239,172,.2)' },
                  { label: 'HR course catalog', color: '#93C5FD', bg: 'rgba(147,197,253,.09)', border: 'rgba(147,197,253,.2)' },
                ].map(({ label, color, bg, border }) => (
                  <span key={label} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '7px 14px', borderRadius: 50, background: bg, border: `1px solid ${border}`, fontSize: 12, fontWeight: 600, color }}>
                    <CheckCircle2 style={{ width: 12, height: 12 }} />
                    {label}
                  </span>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                <Link href="#programs" className="c-hero-cta">
                  View Courses <ArrowRight style={{ width: 16, height: 16 }} />
                </Link>
                <Link href="/contact" className="c-hero-ghost">
                  <Phone style={{ width: 14, height: 14 }} /> Free Counselling
                </Link>
              </div>
            </div>

            <div className="c-hero-visual" style={{ position: 'relative' }}>
              <div style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', border: '1px solid rgba(255,255,255,.08)', boxShadow: '0 44px 100px rgba(0,0,0,.65)' }}>
                <div style={{ position: 'relative', height: 330, background: '#0B1629' }}>
                  <Image src="/assets/images/coursesBanner.jpg" alt="Recruitment and HR training team" fill priority sizes="430px" style={{ objectFit: 'cover', objectPosition: 'center top' }} />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom,transparent 40%,rgba(7,17,32,.95) 100%)' }} />
                  <div style={{ position: 'absolute', top: 16, left: 16, display: 'inline-flex', alignItems: 'center', gap: 7, padding: '6px 13px', borderRadius: 50, background: 'rgba(245,158,11,.15)', border: '1px solid rgba(245,158,11,.35)', backdropFilter: 'blur(10px)' }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#F59E0B', boxShadow: '0 0 8px #F59E0B', display: 'block' }} />
                    <span style={{ fontSize: 10, fontWeight: 800, color: '#FCD34D', letterSpacing: '.12em', textTransform: 'uppercase' }}>{categories.length} Program Categories</span>
                  </div>
                  <div style={{ position: 'absolute', top: 16, right: 16, display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 50, background: 'rgba(255,255,255,.13)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,.2)' }}>
                    <Star style={{ width: 12, height: 12, color: '#FBBF24', fill: '#FBBF24' }} />
                    <span style={{ fontSize: 12, fontWeight: 800, color: '#fff' }}>{courses.length || 0} live courses</span>
                  </div>
                </div>
                <div style={{ background: '#071120', padding: '20px 24px 22px', borderTop: '1px solid rgba(255,255,255,.06)' }}>
                  <p style={{ fontSize: 10, fontWeight: 800, color: '#14B8A6', textTransform: 'uppercase', letterSpacing: '.2em', margin: '0 0 6px' }}>Database-driven catalog</p>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#fff', lineHeight: 1.55, margin: '0 0 14px' }}>
                    {reviews.length} reviews, {fees.length} fee records, and {categories.length} categories loaded from the database.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ background: '#F8FAFC', paddingTop: 64 }}>
        <div className="container">
          <div className="c-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
            {stats.map(({ icon: Icon, value, label, color, bg, border }) => (
              <div key={label} className="c-stat-card" style={{ background: '#fff', borderRadius: 16, border: '1.5px solid #E2E8F0', padding: '26px 22px', boxShadow: '0 2px 14px rgba(15,23,42,.06)', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <div style={{ width: 46, height: 46, borderRadius: 12, background: bg, border: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <Icon style={{ width: 20, height: 20, color }} />
                </div>
                <p style={{ fontSize: 'clamp(26px,2.4vw,36px)', fontWeight: 900, color, lineHeight: 1, margin: 0, letterSpacing: '-.03em', whiteSpace: 'nowrap' }}>{value}</p>
                <div style={{ width: 24, height: 2, borderRadius: 2, background: color, opacity: .28, margin: '10px 0' }} />
                <p style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '.12em', margin: 0, lineHeight: 1.5 }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="programs" style={{ background: '#F8FAFC', paddingTop: 72, paddingBottom: 80 }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 60px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 15px', borderRadius: 50, background: '#EFF6FF', border: '1px solid #BFDBFE', color: '#1D4ED8', fontSize: 11, fontWeight: 800, letterSpacing: '.18em', textTransform: 'uppercase', marginBottom: 18 }}>
              <BookOpen style={{ width: 11, height: 11 }} />
              All Programs
            </div>
            <h2 style={{ fontSize: 'clamp(26px,3vw,42px)', fontWeight: 900, color: '#0F172A', lineHeight: 1.15, letterSpacing: '-.03em', margin: '0 0 16px' }}>
              Pick the program built for your next step.
            </h2>
            <p style={{ fontSize: 16, color: '#64748B', lineHeight: 1.8, margin: 0 }}>
              Every course and fee card below is sourced from the database.
            </p>
          </div>

          {itemList.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-600">
              No course records were found in the database yet.
            </div>
          ) : (
            <>
              <div className="c-primary-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 24, marginBottom: 24 }}>
                {primaryCards.map((course) => {
                  return (
                    <article key={course.id} className="c-card-primary" data-accent={course.accentKey}>
                      <div style={{ position: 'relative', height: 300, background: '#0F172A', overflow: 'hidden' }}>
                        <img src={course.image} alt={course.title} className="c-card-img" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
                        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom,rgba(0,0,0,.08) 0%,transparent 38%,rgba(0,0,0,.52) 100%)' }} />
                        <div style={{ position: 'absolute', top: 18, left: 18, padding: '5px 13px', borderRadius: 50, background: `${course.accent}28`, border: `1px solid ${course.accentBorder}`, backdropFilter: 'blur(10px)' }}>
                          <span style={{ fontSize: 10, fontWeight: 800, color: course.accent, textTransform: 'uppercase', letterSpacing: '.14em' }}>{course.badge}</span>
                        </div>
                        <div style={{ position: 'absolute', top: 18, right: 18, display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 11px', borderRadius: 50, background: 'rgba(255,255,255,.14)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,.2)' }}>
                          <Star style={{ width: 12, height: 12, color: '#FBBF24', fill: '#FBBF24' }} />
                          <span style={{ fontSize: 12, fontWeight: 800, color: '#fff' }}>{course.rating}</span>
                        </div>
                        <div style={{ position: 'absolute', bottom: 18, right: 18, width: 42, height: 42, borderRadius: 11, background: `${course.accent}40`, border: `1px solid ${course.accent}55`, backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {course.accentKey === 'blue' ? <Briefcase style={{ width: 19, height: 19, color: '#fff' }} /> : <Building2 style={{ width: 19, height: 19, color: '#fff' }} />}
                        </div>
                        <div style={{ position: 'absolute', bottom: 18, left: 18, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 11px', borderRadius: 50, background: 'rgba(0,0,0,.45)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,.12)' }}>
                          <Users style={{ width: 11, height: 11, color: '#94A3B8' }} />
                          <span style={{ fontSize: 11, fontWeight: 700, color: '#CBD5E1' }}>{course.enrolled} enrolled</span>
                        </div>
                      </div>

                      <div style={{ padding: '30px 30px 26px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                        <div style={{ marginBottom: 16 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
                            <div style={{ width: 3, height: 13, borderRadius: 2, background: course.accent, flexShrink: 0 }} />
                            <span style={{ fontSize: 10, fontWeight: 800, color: course.accent, textTransform: 'uppercase', letterSpacing: '.16em' }}>{course.level}</span>
                          </div>
                          <h3 style={{ fontSize: 'clamp(19px,1.9vw,24px)', fontWeight: 800, color: '#0F172A', lineHeight: 1.22, letterSpacing: '-.022em', margin: 0 }}>{course.title}</h3>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18, paddingBottom: 16, borderBottom: '1px solid #F1F5F9' }}>
                          <Stars rating={course.rating} />
                          <span style={{ fontSize: 12, fontWeight: 700, color: '#0F172A' }}>{course.rating}</span>
                          <span style={{ fontSize: 12, color: '#94A3B8' }}>({course.reviews} reviews)</span>
                        </div>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 50, background: '#FEF2F2', border: '1px solid #FECACA', fontSize: 11, fontWeight: 700, color: '#DC2626' }}>
                            <Clock style={{ width: 11, height: 11 }} /> {course.duration}
                          </span>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 50, background: '#EFF6FF', border: '1px solid #BFDBFE', fontSize: 11, fontWeight: 700, color: '#1D4ED8' }}>
                            <Monitor style={{ width: 11, height: 11 }} /> {course.mode}
                          </span>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 50, background: '#F0FDF4', border: '1px solid #BBF7D0', fontSize: 11, fontWeight: 700, color: '#059669' }}>
                            <BadgeCheck style={{ width: 11, height: 11 }} /> Certified
                          </span>
                        </div>

                        <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.82, marginBottom: 20 }}>{course.description}</p>

                        <ul className="c-feat-grid" style={{ listStyle: 'none', margin: '0 0 22px', padding: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 12px', flex: 1 }}>
                          {course.features.map((f) => (
                            <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 7 }}>
                              <div style={{ width: 17, height: 17, borderRadius: '50%', flexShrink: 0, background: course.accentLight, border: `1px solid ${course.accentBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 1 }}>
                                <CheckCircle2 style={{ width: 10, height: 10, color: course.accent }} />
                              </div>
                              <span style={{ fontSize: 12, fontWeight: 600, color: '#334155', lineHeight: 1.55 }}>{f}</span>
                            </li>
                          ))}
                        </ul>

                        <div style={{ display: 'flex', gap: 10, marginTop: 'auto', paddingTop: 20, borderTop: '1px solid #F1F5F9' }}>
                          <Link href={`/${course.slug}`} className="c-btn-dark">
                            Learn More <ArrowRight style={{ width: 14, height: 14 }} />
                          </Link>
                          <Link href="/contact" className="c-btn-red">
                            <Phone style={{ width: 13, height: 13 }} /> Enquire Now
                          </Link>
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>

              <div className="c-secondary-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 24 }}>
                {secondaryCards.map((course) => {
                  return (
                    <article key={course.id} className="c-card-secondary" data-accent={course.accentKey} style={{ display: 'flex' }}>
                      <div className="c-sec-img-wrap" style={{ width: 220, flexShrink: 0, position: 'relative', background: '#0F172A', overflow: 'hidden' }}>
                        <img src={course.image} alt={course.title} className="c-card-img" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
                        <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, transparent 55%, rgba(0,0,0,.35) 100%)' }} />
                        <div style={{ position: 'absolute', top: 14, left: 12, padding: '4px 10px', borderRadius: 50, background: `${course.accent}30`, border: `1px solid ${course.accentBorder}`, backdropFilter: 'blur(8px)' }}>
                          <span style={{ fontSize: 9, fontWeight: 800, color: course.accent, textTransform: 'uppercase', letterSpacing: '.12em' }}>{course.badge}</span>
                        </div>
                        <div style={{ position: 'absolute', bottom: 14, left: 12, display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 9px', borderRadius: 50, background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,.15)' }}>
                          <Star style={{ width: 11, height: 11, color: '#FBBF24', fill: '#FBBF24' }} />
                          <span style={{ fontSize: 11, fontWeight: 800, color: '#fff' }}>{course.rating.toFixed(1)}</span>
                        </div>
                      </div>

                      <div style={{ padding: '26px 26px 22px', display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
                          <div style={{ width: 3, height: 12, borderRadius: 2, background: course.accent, flexShrink: 0 }} />
                          <span style={{ fontSize: 10, fontWeight: 800, color: course.accent, textTransform: 'uppercase', letterSpacing: '.14em' }}>{course.level}</span>
                        </div>
                        <h3 style={{ fontSize: 'clamp(16px,1.6vw,20px)', fontWeight: 800, color: '#0F172A', lineHeight: 1.25, letterSpacing: '-.02em', margin: '0 0 8px' }}>{course.title}</h3>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
                          <Stars rating={course.rating} />
                          <span style={{ fontSize: 11, fontWeight: 700, color: '#64748B' }}>({course.reviews} reviews)</span>
                        </div>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 14 }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 50, background: '#FEF2F2', border: '1px solid #FECACA', fontSize: 10, fontWeight: 700, color: '#DC2626' }}>
                            <Clock style={{ width: 10, height: 10 }} /> {course.duration}
                          </span>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 50, background: '#EFF6FF', border: '1px solid #BFDBFE', fontSize: 10, fontWeight: 700, color: '#1D4ED8' }}>
                            <Monitor style={{ width: 10, height: 10 }} /> {course.mode}
                          </span>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 50, background: '#F0FDF4', border: '1px solid #BBF7D0', fontSize: 10, fontWeight: 700, color: '#059669' }}>
                            <Users style={{ width: 10, height: 10 }} /> {course.enrolled}
                          </span>
                        </div>

                        <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.75, marginBottom: 18, flex: 1 }}>{course.description}</p>

                        <div style={{ display: 'flex', gap: 9 }}>
                          <Link href={`/${course.slug}`} className="c-btn-dark" style={{ padding: '11px 14px', fontSize: 12 }}>
                            Learn More <ArrowRight style={{ width: 13, height: 13 }} />
                          </Link>
                          <Link href="/contact" className="c-btn-red" style={{ padding: '11px 14px', fontSize: 12 }}>
                            <Phone style={{ width: 12, height: 12 }} /> Enquire Now
                          </Link>
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </section>

      <section style={{ background: '#fff', borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0', padding: '40px 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 0 }}>
            {[
              { icon: ShieldCheck, color: '#1D4ED8', bg: '#EFF6FF', title: 'Industry-Recognised Certificate', desc: 'Certificates and course data come from the live database.' },
              { icon: MessageCircle, color: '#0D9488', bg: '#F0FDFA', title: 'Live, Hands-On Sessions', desc: 'Recruitment and HR learning paths are structured for practical hiring workflows.' },
              { icon: TrendingUp, color: '#D97706', bg: '#FFFBEB', title: 'Placement-Focused Training', desc: 'Programs are aligned with hiring outcomes and recruiter skill-building.' },
            ].map(({ icon: Icon, color, bg, title, desc }, i) => (
              <div key={title} style={{ padding: '28px 36px', borderLeft: i > 0 ? '1px solid #E2E8F0' : 'none', display: 'flex', alignItems: 'flex-start', gap: 18 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon style={{ width: 22, height: 22, color }} />
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', margin: '0 0 6px', lineHeight: 1.35 }}>{title}</p>
                  <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.7, margin: 0 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ background: '#F8FAFC', padding: '72px 0 88px' }}>
        <div className="container">
          <div style={{ borderRadius: 22, background: 'linear-gradient(130deg,#0B1629 0%,#0F172A 50%,#0D1F3A 100%)', border: '1px solid rgba(255,255,255,.07)', overflow: 'hidden', position: 'relative' }}>
            <div aria-hidden className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,.03) 1px,transparent 1px)', backgroundSize: '24px 24px' }} />
            <div style={{ padding: '52px 52px', position: 'relative', zIndex: 10 }}>
              <div className="c-cta-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto', gap: 44, alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 14px', borderRadius: 50, background: 'rgba(245,158,11,.12)', border: '1px solid rgba(245,158,11,.25)', marginBottom: 18 }}>
                    <Zap style={{ width: 11, height: 11, color: '#F59E0B' }} />
                    <span style={{ fontSize: 10, fontWeight: 800, color: '#FCD34D', textTransform: 'uppercase', letterSpacing: '.18em' }}>Need help choosing?</span>
                  </div>
                  <h2 style={{ fontSize: 'clamp(22px,2.5vw,34px)', fontWeight: 900, color: '#fff', lineHeight: 1.2, letterSpacing: '-.025em', marginBottom: 14 }}>
                    Need the right recruitment path?
                  </h2>
                  <p style={{ fontSize: 14, color: '#94A3B8', lineHeight: 1.8, maxWidth: 500, marginBottom: 24 }}>
                    Talk to our counsellors for free. We will guide you using the live course, fee, and review data already stored in the database.
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flexShrink: 0 }}>
                  <Link href="/contact" className="c-cta-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, background: 'linear-gradient(135deg,#DC2626,#EF4444)', color: '#fff', fontWeight: 700, fontSize: 14, padding: '15px 34px', borderRadius: 10 }}>
                    <MessageCircle style={{ width: 16, height: 16 }} />
                    Talk to an Expert
                  </Link>
                  <a href="https://wa.me/919975048884" target="_blank" rel="noopener noreferrer" className="c-cta-ghost" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, border: '1.5px solid rgba(255,255,255,.18)', color: '#fff', fontWeight: 600, fontSize: 14, padding: '14px 32px', borderRadius: 10, background: 'rgba(255,255,255,.05)' }}>
                    WhatsApp Us
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

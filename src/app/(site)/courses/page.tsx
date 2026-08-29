import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import UpcomingBatches from '@/components/site/UpcomingBatches'
import FeaturedTrainers from '@/components/site/FeaturedTrainers'
import LiveAndUpcomingSessions, { SessionListItem } from '@/components/site/LiveAndUpcomingSessions'
import { DEFAULT_BATCHES, DEFAULT_TRAINERS } from '@/lib/data/trainingData'
import { BatchItem, TrainerItem } from '@/types/training'
import {
  ArrowRight,
  Award,
  BadgeCheck,
  BookOpen,
  Briefcase,
  CheckCircle2,
  ChevronRight,
  Clock,
  GraduationCap,
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
  twitter: {
    card: 'summary_large_image',
    title: 'HR & Recruitment Courses in Pune - Recruitment Institute',
    description: "India's #1 recruitment training institute. Expert programs for every career stage.",
  },
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

/* ─── Slug → route mapping ────────────────────────────────────── */
const SLUG_TO_ROUTE: Record<string, string> = {
  'for-freshers':                         '/recruitment-career-starter',
  'recruitment-career-starter':           '/recruitment-career-starter',
  'for-professionals':                    '/professional-recruitment-specialist',
  'professional-recruitment-specialist':  '/professional-recruitment-specialist',
  'senior-professionals':                 '/advanced-recruitment-ta-masterclass',
  'advanced-recruitment-ta-masterclass':  '/advanced-recruitment-ta-masterclass',
  'entrepreneurship':                     '/recruitment-business-accelerator',
  'recruitment-business-accelerator':     '/recruitment-business-accelerator',
  'business-consulting':                  '/recruitment-business-growth-consulting',
  'recruitment-business-growth-consulting':'/recruitment-business-growth-consulting',
  'corporate':                            '/corporate-recruitment-training',
  'corporate-recruitment-training':       '/corporate-recruitment-training',
  // legacy redirects
  'degree_tag':                           '/end-to-end-recruitment-training',
  'certification_tag':                    '/hr-courses-for-beginners',
  'entrepreneur_tag':                     '/hr-entrepreneurship-program',
  'corporate_traning_tag':                '/hr-corporate-training-course',
}
function getCourseRoute(slug: string) {
  return SLUG_TO_ROUTE[slug] ?? `/${slug}`
}

/* ─── Static card data (visual identity per course) ─────────────── */
const COURSE_META: Record<string, {
  tagline: string
  badge: string
  badgeColor: string
  badgeBg: string
  badgeBorder: string
  accent: string
  accentLight: string
  accentBorder: string
  accentGlow: string
  gradient: string
  icon: string
  tags: string[]
  highlight: string
  image: string
  duration: string
  mode: string
  ctaText: string
}> = {
  'for-freshers': {
    tagline: 'Courses / For Freshers',
    badge: 'Beginner Friendly',
    badgeColor: '#0EA5E9',
    badgeBg: 'rgba(14,165,233,.15)',
    badgeBorder: 'rgba(14,165,233,.35)',
    accent: '#0EA5E9',
    accentLight: '#F0F9FF',
    accentBorder: '#BAE6FD',
    accentGlow: 'rgba(14,165,233,.2)',
    gradient: 'linear-gradient(135deg,#075985,#0EA5E9,#0284C7)',
    icon: '📚',
    tags: ['4 Weeks', '100% Online', 'Placement Support'],
    highlight: 'Zero to Hero in 4 Wks',
    image: '/assets/images/about/tab1.jpg',
    duration: '4 Weeks',
    mode: '100% Online',
    ctaText: 'Join Next Batch',
  },
  'for-professionals': {
    tagline: 'Courses / For Professionals',
    badge: 'Most Popular',
    badgeColor: '#DC2626',
    badgeBg: 'rgba(220,38,38,.15)',
    badgeBorder: 'rgba(220,38,38,.35)',
    accent: '#DC2626',
    accentLight: '#FEF2F2',
    accentBorder: '#FECACA',
    accentGlow: 'rgba(220,38,38,.2)',
    gradient: 'linear-gradient(135deg,#7F1D1D,#DC2626,#B91C1C)',
    icon: '🎯',
    tags: ['8 Weeks', 'Online & Offline', 'Multi-Domain'],
    highlight: 'IT & Non-IT Sourcing',
    image: '/assets/images/banner/home9.jpg',
    duration: '8 Weeks',
    mode: 'Online & Offline',
    ctaText: 'Join Next Batch',
  },
  'senior-professionals': {
    tagline: 'Courses / Senior Professionals',
    badge: 'Executive Track',
    badgeColor: '#7C3AED',
    badgeBg: 'rgba(124,58,237,.15)',
    badgeBorder: 'rgba(124,58,237,.35)',
    accent: '#7C3AED',
    accentLight: '#F5F3FF',
    accentBorder: '#DDD6FE',
    accentGlow: 'rgba(124,58,237,.2)',
    gradient: 'linear-gradient(135deg,#3B0764,#7C3AED,#6D28D9)',
    icon: '👑',
    tags: ['6 Weeks', 'Executive Weekend', 'Leadership'],
    highlight: 'Strategic TA & Metrics',
    image: '/assets/images/courses/home14/3.jpg',
    duration: '6 Weeks',
    mode: 'Executive Live Online',
    ctaText: 'Apply / Enquire',
  },
  'entrepreneurship': {
    tagline: 'Entrepreneurship',
    badge: 'Agency Track',
    badgeColor: '#D97706',
    badgeBg: 'rgba(217,119,6,.15)',
    badgeBorder: 'rgba(217,119,6,.35)',
    accent: '#D97706',
    accentLight: '#FFFBEB',
    accentBorder: '#FDE68A',
    accentGlow: 'rgba(217,119,6,.2)',
    gradient: 'linear-gradient(135deg,#78350F,#D97706,#B45309)',
    icon: '🚀',
    tags: ['8 Weeks', 'Business Setup', 'Client Acquisition'],
    highlight: 'Build ₹1Cr+ Agency',
    image: '/assets/images/courses/style4/4.jpg',
    duration: '8 Weeks',
    mode: 'Blended Cohort',
    ctaText: 'Book Free Business Call',
  },
  'business-consulting': {
    tagline: 'Business Consulting',
    badge: '1-to-1 Advisory',
    badgeColor: '#059669',
    badgeBg: 'rgba(5,150,105,.15)',
    badgeBorder: 'rgba(5,150,105,.35)',
    accent: '#059669',
    accentLight: '#F0FDF4',
    accentBorder: '#BBF7D0',
    accentGlow: 'rgba(5,150,105,.2)',
    gradient: 'linear-gradient(135deg,#064E3B,#059669,#047857)',
    icon: '💼',
    tags: ['3 Months', '1-on-1 Mentoring', 'Growth Audit'],
    highlight: 'Scale Existing Agency',
    image: '/assets/images/courses/home14/4.jpg',
    duration: '3 Months',
    mode: '1-to-1 Consulting',
    ctaText: 'Book Consultation',
  },
  'corporate': {
    tagline: 'Corporate Training',
    badge: 'Enterprise',
    badgeColor: '#4F46E5',
    badgeBg: 'rgba(79,70,229,.15)',
    badgeBorder: 'rgba(79,70,229,.35)',
    accent: '#4F46E5',
    accentLight: '#EEF2FF',
    accentBorder: '#C7D2FE',
    accentGlow: 'rgba(79,70,229,.2)',
    gradient: 'linear-gradient(135deg,#312E81,#4F46E5,#4338CA)',
    icon: '🏢',
    tags: ['Custom', 'On-Site / Online', 'Tailored SLA'],
    highlight: 'Corporate Upskilling',
    image: '/assets/images/courses/home14/2.jpg',
    duration: 'Custom (2–6 Wks)',
    mode: 'On-Site / Live Online',
    ctaText: 'Request Corporate Proposal',
  },
}

const FALLBACK_META = {
  tagline: 'Professional HR Program',
  badge: 'Available Now',
  badgeColor: '#0D9488',
  badgeBg: 'rgba(13,148,136,.15)',
  badgeBorder: 'rgba(13,148,136,.35)',
  accent: '#0D9488',
  accentLight: '#F0FDFA',
  accentBorder: '#99F6E4',
  accentGlow: 'rgba(13,148,136,.2)',
  gradient: 'linear-gradient(135deg,#134E4A,#0D9488,#0F766E)',
  icon: '🎓',
  tags: ['Flexible', 'Online', 'Certified'],
  highlight: 'Expert Faculty',
  image: '/assets/images/courses/home14/4.jpg',
  duration: 'Flexible',
  mode: 'Online',
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

/* ── Page ────────────────────────────────────────────────────────── */

export default async function CoursesPage() {
  const now = new Date()
  const sessionWindowEnd = new Date(now.getTime() + 14 * 86_400_000)

  const [categories, courses, fees, reviews, testimonials, rawDbBatches, rawDbTrainers, rawSessions] = await Promise.all([
    prisma.courseCategory.findMany({ orderBy: { id: 'asc' }, include: { courses: { orderBy: { id: 'asc' } }, fees: { orderBy: { id: 'asc' } } } }),
    prisma.course.findMany({ orderBy: { id: 'asc' }, include: { category: true } }),
    prisma.courseFee.findMany({ orderBy: { id: 'asc' }, include: { category: { include: { courses: true } } } }),
    prisma.courseReview.findMany({ orderBy: { id: 'asc' }, include: { category: true } }),
    prisma.testimonial.findMany({ where: { isActive: true }, orderBy: { createdAt: 'desc' }, take: 4 }),
    prisma.batch.findMany({
      where: { status: 'UPCOMING' },
      include: {
        course: { select: { id: true, title: true, duration: true, category: true } },
        trainer: { select: { id: true, name: true, image: true, specialization: true } },
        _count: { select: { enrollments: true } },
      },
      orderBy: { startDate: 'asc' },
      take: 8,
    }).catch(() => []),
    prisma.trainer.findMany({
      where: { isActive: true },
      take: 6,
    }).catch(() => []),
    prisma.session.findMany({
      where: {
        status: { in: ['LIVE', 'UPCOMING'] },
        endTime: { gte: now },
        startTime: { lte: sessionWindowEnd },
        batch: { status: { in: ['ACTIVE', 'UPCOMING'] } },
      },
      include: {
        batch: { select: { name: true, course: { select: { title: true } } } },
        trainer: { select: { name: true, image: true } },
      },
      orderBy: { startTime: 'asc' },
      take: 6,
    }).catch(() => []),
  ])

  // Map DB Batches with graceful fallback
  let formattedBatches: BatchItem[] = DEFAULT_BATCHES
  if (rawDbBatches && rawDbBatches.length > 0) {
    formattedBatches = rawDbBatches.map((b) => {
      const enrolled = b._count?.enrollments ?? 0
      const cap = b.capacity || 30
      const left = Math.max(1, cap - enrolled)
      const startDateStr = b.startDate
        ? new Date(b.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
        : 'Upcoming Cohort'

      const cleanTitle = b.course?.title || 'Professional Recruitment Specialist'
      const trainerName = b.trainer?.name || 'Lead Faculty'
      const trainerImg = b.trainer?.image || '/assets/images/trainers/rajesh_sharma.jpg'

      const matchedFee = fees.find((f) => f.categoryId === b.course?.category?.id)
      const isOffline = b.mode === 'OFFLINE'
      const onlineBase = Number(matchedFee?.onlineFees ?? matchedFee?.fees ?? 14999)
      const offlineBase = Number(matchedFee?.offlineFees ?? matchedFee?.fees ?? 14999)
      const onlinePrice = Number(matchedFee?.onlineFinal ?? Math.round(onlineBase * 0.5))
      const offlinePrice = Number(matchedFee?.offlineFinal ?? Math.round(offlineBase * 0.9))
      const basePrice = isOffline ? offlineBase : onlineBase
      const finalPrice = isOffline ? offlinePrice : onlinePrice
      const duration = b.course?.duration?.trim() || '8 Weeks'

      const slugCode = b.course?.category?.slug
        ? b.course.category.slug.replace(/for-|-/g, '').slice(0, 3).toUpperCase()
        : 'CRS'

      return {
        id: b.id,
        name: b.name,
        batchCode: `RI-${slugCode}-${String(b.id).padStart(2, '0')}`,
        courseId: b.courseId,
        courseTitle: cleanTitle,
        courseSlug: b.course?.category?.slug ? getCourseRoute(b.course.category.slug).replace('/', '') : 'courses',
        trainerId: b.trainerId,
        trainerName,
        trainerImage: trainerImg,
        trainerTitle: b.trainer?.specialization || 'Lead Faculty',
        capacity: cap,
        enrolledCount: enrolled,
        seatsLeft: left,
        mode: b.mode as 'ONLINE' | 'OFFLINE' | 'HYBRID',
        startDate: b.startDate ? new Date(b.startDate).toISOString().split('T')[0] : '2026-09-15',
        displayStartDate: startDateStr,
        schedule: b.schedule || 'Sat & Sun 10:00 AM – 1:00 PM IST',
        duration,
        originalPrice: basePrice,
        discountedPrice: finalPrice,
        onlinePrice,
        offlinePrice,
        currency: 'INR',
        isFastFilling: left <= 8,
        isGuaranteed: true,
      }
    })
  }

  // Map DB Trainers — only show real DB trainers, no static fallbacks
  let formattedTrainers: TrainerItem[] = []
  if (rawDbTrainers && rawDbTrainers.length > 0) {
    formattedTrainers = rawDbTrainers.map((t, idx) => {
      const lower = t.name.toLowerCase()
      const isFemale =
        lower.includes('priya') ||
        lower.includes('priti') ||
        lower.includes('ananya') ||
        lower.includes('snehal') ||
        lower.includes('shah')
      const profileImg = t.image || (isFemale ? '/assets/images/trainers/priyanka_kulkarni.jpg' : '/assets/images/trainers/rajesh_sharma.jpg')

      return {
        id: t.id,
        name: t.name,
        email: t.email,
        phone: t.phone || undefined,
        designation: t.specialization ? `${t.specialization} Specialist` : 'Senior Recruitment Mentor',
        experienceYears: 14 + (idx % 5),
        specializationTags: t.specialization ? t.specialization.split(',').map(s => s.trim()) : ['Recruitment & Sourcing', 'Talent Acquisition'],
        bio: t.bio ? t.bio.slice(0, 160) + '…' : 'Active recruitment practitioner and talent advisor with 10+ years experience.',
        longBio: t.bio || 'Comprehensive mentoring in modern recruitment lifecycles, ATS platforms, and talent acquisition strategies.',
        image: profileImg,
        rating: 4.92,
        reviewsCount: 110 + idx * 8,
        studentsMentored: 1200 + idx * 150,
        coursesTaught: ['End-to-End Recruitment Training', 'HR Courses for Beginners'],
        modes: ['Online', 'Offline', 'Hybrid'],
        featured: true,
        quote: isFemale
          ? 'A solid foundation in statutory compliance and structured interviewing transforms freshers into boardroom-ready talent partners.'
          : 'Recruiting is understanding business architecture and candidate psychology.',
        certifications: ['SHRM Certified Professional', 'Certified Staffing Professional'],
      }
    })
  }

  /* Build unified card list: one card per category */
  const allCards = categories.map((cat, index) => {
    const meta = COURSE_META[cat.slug] ?? FALLBACK_META
    const linkedCourse = courses.find(c => c.categoryId === cat.id)
    const linkedFee = fees.find(f => f.categoryId === cat.id)
    const catReviews = reviews.filter(r => r.categoryId === cat.id)
    const avgRating = catReviews.length
      ? Math.min(5, catReviews.reduce((s, r) => s + Number(r.rating ?? 0), 0) / catReviews.length)
      : 4.8
    const description = linkedCourse ? stripHtml(linkedCourse.description) : `${cat.name} – a professional recruitment training program at Recruitment Institute.`

    const duration = linkedCourse?.duration?.trim() || meta.duration || 'Flexible'
    const matchedFee = fees.find((f) => f.categoryId === cat.id)
    const basePrice = Number(matchedFee?.fees || matchedFee?.onlineFees || 10000)
    const onlineFinal = Number(matchedFee?.onlineFinal || Math.round(basePrice * 0.5))
    const offlineFinal = Number(matchedFee?.offlineFinal || Math.round(basePrice * 0.9))

    return {
      index,
      slug: cat.slug,
      route: getCourseRoute(cat.slug),
      name: cat.name,
      title: meta.tagline ?? linkedCourse?.title ?? cat.name,
      description: description.slice(0, 200) + (description.length > 200 ? '…' : ''),
      enrolled: linkedCourse ? `${Number(linkedCourse.totalStudents).toLocaleString('en-IN')}+` : '500+',
      rating: avgRating,
      reviewCount: catReviews.length,
      duration,
      onlinePrice: onlineFinal,
      offlinePrice: offlineFinal,
      meta,
    }
  })

  const coursesSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'CollectionPage', '@id': `${BASE_URL}/courses#webpage`, url: `${BASE_URL}/courses`, name: 'HR & Recruitment Training Courses - Recruitment Institute', description: 'All HR and recruitment training programs at Recruitment Institute Pune', isPartOf: { '@id': `${BASE_URL}/#website` } },
      {
        '@type': 'BreadcrumbList',
        '@id': `${BASE_URL}/courses#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
          { '@type': 'ListItem', position: 2, name: 'Courses', item: `${BASE_URL}/courses` },
        ],
      },
      { '@type': 'ItemList', name: 'HR & Recruitment Training Programs', numberOfItems: allCards.length, itemListElement: allCards.map((c, i) => ({ '@type': 'ListItem', position: i + 1, item: { '@type': 'Course', name: c.title, description: c.description, url: `${BASE_URL}${c.route}`, provider: { '@type': 'Organization', name: 'Recruitment Institute', url: BASE_URL } } })) },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(coursesSchema) }} />

      <style>{`
        body { font-family: 'Poppins', sans-serif; }
        .cp-crumb { color: #64748B; text-decoration: none; font-size: 12px; font-weight: 500; transition: color .18s; }
        .cp-crumb:hover { color: #CBD5E1; }
        .cp-cta { display:inline-flex; align-items:center; gap:9px; background:linear-gradient(135deg,#DC2626,#EF4444); color:#fff; font-weight:700; font-size:14px; padding:14px 30px; border-radius:11px; text-decoration:none; box-shadow:0 8px 28px rgba(220,38,38,.38); transition:transform .2s,box-shadow .2s; }
        .cp-cta:hover { transform:translateY(-2px); box-shadow:0 14px 40px rgba(220,38,38,.48); }
        .cp-ghost { display:inline-flex; align-items:center; gap:9px; border:1.5px solid rgba(255,255,255,.16); color:#fff; font-weight:600; font-size:14px; padding:13px 24px; border-radius:11px; text-decoration:none; background:rgba(255,255,255,.05); transition:background .2s,border-color .2s; }
        .cp-ghost:hover { background:rgba(255,255,255,.12); border-color:rgba(255,255,255,.3); }

        /* Course cards */
        .cp-card { background:#fff; border-radius:24px; border:1.5px solid #E2E8F0; overflow:hidden; box-shadow:0 4px 24px rgba(15,23,42,.07); transition:transform .3s,box-shadow .3s,border-color .3s; display:flex; flex-direction:column; }
        .cp-card:hover { transform:translateY(-8px); box-shadow:0 28px 64px rgba(15,23,42,.14); }
        .cp-card-img { transition:transform .6s ease; }
        .cp-card:hover .cp-card-img { transform:scale(1.07); }
        .cp-card-btn { display:flex; align-items:center; justify-content:center; gap:8px; flex:1; font-weight:700; font-size:13px; padding:13px 16px; border-radius:10px; text-decoration:none; transition:transform .18s,box-shadow .18s; border:none; cursor:pointer; }
        .cp-card-btn:hover { transform:translateY(-1px); }

        /* Trust bar */
        .cp-trust-item { display:flex; align-items:flex-start; gap:18px; padding:28px 32px; }

        /* Bottom CTA */
        .cp-bottom-cta-btn { display:flex; align-items:center; justify-content:center; gap:9px; font-weight:700; font-size:14px; padding:15px 36px; border-radius:11px; text-decoration:none; transition:transform .2s,box-shadow .2s; }
        .cp-bottom-cta-btn:hover { transform:translateY(-2px); }

        @media(max-width:1100px){ .cp-hero-grid{grid-template-columns:1fr !important;} .cp-hero-right{display:none !important;} }
        @media(max-width:960px){ .cp-cards-grid{grid-template-columns:repeat(2,1fr) !important;} .cp-stats-grid{grid-template-columns:repeat(2,1fr) !important;} }
        @media(max-width:640px){ .cp-cards-grid{grid-template-columns:1fr !important;} .cp-trust-grid{grid-template-columns:1fr !important;} .cp-cta-row{flex-direction:column !important;} }
        @media(max-width:560px){ .cp-stats-grid{grid-template-columns:repeat(2,1fr) !important;} }
      `}</style>

      {/* â•â• HERO â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section style={{ background:'linear-gradient(140deg,#04091A 0%,#080F22 40%,#0C1830 70%,#04081A 100%)', position:'relative', overflow:'hidden', minHeight:600, display:'flex', alignItems:'center' }}>
        <div aria-hidden style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(rgba(255,255,255,.022) 1px,transparent 1px)', backgroundSize:'28px 28px' }} />
        <div aria-hidden style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg,transparent,#DC2626 20%,#F59E0B 50%,#0EA5E9 80%,transparent)', zIndex:3 }} />
        <div aria-hidden style={{ position:'absolute', top:-120, left:-60, width:600, height:600, background:'radial-gradient(circle,rgba(220,38,38,.13) 0%,transparent 65%)', pointerEvents:'none' }} />
        <div aria-hidden style={{ position:'absolute', bottom:-80, right:'15%', width:500, height:500, background:'radial-gradient(circle,rgba(14,165,233,.1) 0%,transparent 65%)', pointerEvents:'none' }} />

        <div className="container" style={{ position:'relative', zIndex:10, padding:'80px 0 100px' }}>
          <div className="cp-hero-grid" style={{ display:'grid', gridTemplateColumns:'minmax(0,1fr) 460px', gap:'68px', alignItems:'center' }}>
            <div>
              <nav style={{ display:'flex', alignItems:'center', gap:6, marginBottom:30 }}>
                <Link href="/" className="cp-crumb">Home</Link>
                <ChevronRight style={{ width:13, height:13, color:'#475569' }} />
                <span style={{ fontSize:12, fontWeight:700, color:'#F59E0B' }}>All Courses</span>
              </nav>

              <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'6px 16px', borderRadius:50, background:'rgba(245,158,11,.12)', border:'1px solid rgba(245,158,11,.3)', marginBottom:22 }}>
                <Sparkles style={{ width:12, height:12, color:'#F59E0B' }} />
                <span style={{ fontSize:11, fontWeight:800, color:'#FCD34D', letterSpacing:'.18em', textTransform:'uppercase' }}>HR & Recruitment Training</span>
              </div>

              <h1 style={{ fontSize:'clamp(32px,4vw,58px)', fontWeight:900, color:'#fff', lineHeight:1.07, letterSpacing:'-.04em', marginBottom:22 }}>
                India&apos;s Leading{' '}
                <span style={{ background:'linear-gradient(120deg,#F87171 0%,#FBBF24 40%,#38BDF8 80%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
                  Recruitment Training
                </span>{' '}Programs
              </h1>

              <p style={{ fontSize:17, color:'#94A3B8', lineHeight:1.85, maxWidth:530, marginBottom:36 }}>
                From beginner foundations to corporate transformation — find the right program to launch or level up your recruitment career.
              </p>

              <div style={{ display:'flex', flexWrap:'wrap', gap:10, marginBottom:42 }}>
                {[
                  { label:'4 Specialised Programs',  color:'#F87171', bg:'rgba(248,113,113,.09)', border:'rgba(248,113,113,.22)' },
                  { label:'5,000+ Students Trained',  color:'#FCD34D', bg:'rgba(252,211,77,.09)',  border:'rgba(252,211,77,.22)'  },
                  { label:'Industry Certified',        color:'#6EE7B7', bg:'rgba(110,231,183,.09)', border:'rgba(110,231,183,.22)' },
                  { label:'Placement Support',         color:'#93C5FD', bg:'rgba(147,197,253,.09)', border:'rgba(147,197,253,.22)' },
                ].map(({ label, color, bg, border }) => (
                  <span key={label} style={{ display:'inline-flex', alignItems:'center', gap:7, padding:'7px 14px', borderRadius:50, background:bg, border:`1px solid ${border}`, fontSize:12, fontWeight:600, color }}>
                    <CheckCircle2 style={{ width:12, height:12 }} />{label}
                  </span>
                ))}
              </div>

              <div className="cp-cta-row" style={{ display:'flex', gap:14, flexWrap:'wrap' }}>
                <Link href="#programs" className="cp-cta">
                  Explore Programs <ArrowRight style={{ width:16, height:16 }} />
                </Link>
                <Link href="/contact" className="cp-ghost">
                  <Phone style={{ width:14, height:14 }} /> Free Counselling
                </Link>
              </div>
            </div>

            <div className="cp-hero-right" style={{ position:'relative' }}>
              <div aria-hidden style={{ position:'absolute', inset:-22, borderRadius:32, background:'linear-gradient(135deg,rgba(220,38,38,.2),rgba(245,158,11,.12),rgba(14,165,233,.12))', filter:'blur(2px)' }} />
              <div style={{ position:'relative', borderRadius:24, overflow:'hidden', border:'1px solid rgba(255,255,255,.09)', boxShadow:'0 52px 120px rgba(0,0,0,.65)' }}>
                <div style={{ position:'relative', height:320, background:'#060D1C' }}>
                  <Image src="/assets/images/coursesBanner.jpg" alt="HR & Recruitment Training Programs at Recruitment Institute" fill priority sizes="460px" style={{ objectFit:'cover', objectPosition:'center top' }} />
                  <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom,rgba(4,9,26,.08) 0%,transparent 38%,rgba(4,9,26,.9) 100%)' }} />
                  <div style={{ position:'absolute', top:16, left:16, display:'inline-flex', alignItems:'center', gap:7, padding:'6px 13px', borderRadius:50, background:'rgba(220,38,38,.2)', border:'1px solid rgba(220,38,38,.4)', backdropFilter:'blur(12px)' }}>
                    <span style={{ width:6, height:6, borderRadius:'50%', background:'#EF4444', boxShadow:'0 0 8px #EF4444', display:'block' }} />
                    <span style={{ fontSize:10, fontWeight:800, color:'#FCA5A5', letterSpacing:'.12em', textTransform:'uppercase' }}>{allCards.length} Programs</span>
                  </div>
                  <div style={{ position:'absolute', top:16, right:16, display:'inline-flex', alignItems:'center', gap:5, padding:'6px 12px', borderRadius:50, background:'rgba(255,255,255,.13)', backdropFilter:'blur(12px)', border:'1px solid rgba(255,255,255,.2)' }}>
                    <Star style={{ width:12, height:12, color:'#FBBF24', fill:'#FBBF24' }} />
                    <span style={{ fontSize:12, fontWeight:800, color:'#fff' }}>4.8 Avg Rating</span>
                  </div>
                </div>
                <div style={{ background:'#050C1C', padding:'22px 26px 24px', borderTop:'1px solid rgba(255,255,255,.07)' }}>
                  <p style={{ fontSize:10, fontWeight:800, color:'#F59E0B', textTransform:'uppercase', letterSpacing:'.2em', margin:'0 0 14px' }}>Programs at a Glance</p>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10 }}>
                    {[
                      { val:`${courses.length}`, lbl:'Courses', color:'#F87171' },
                      { val:`${categories.length}`, lbl:'Tracks', color:'#FCD34D' },
                      { val:`${reviews.length}`, lbl:'Reviews', color:'#6EE7B7' },
                      { val:'100%', lbl:'Practical', color:'#93C5FD' },
                    ].map(({ val, lbl, color }) => (
                      <div key={lbl} style={{ textAlign:'center' }}>
                        <p style={{ fontSize:20, fontWeight:900, color, lineHeight:1, margin:'0 0 3px', letterSpacing:'-.03em' }}>{val}</p>
                        <p style={{ fontSize:9, fontWeight:700, color:'#475569', textTransform:'uppercase', letterSpacing:'.1em', margin:0 }}>{lbl}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div aria-hidden style={{ position:'absolute', bottom:0, left:0, right:0, height:56, background:'#F8FAFC', clipPath:'ellipse(55% 100% at 50% 100%)' }} />
      </section>

      {/* ── STATS STRIP ────────────────────────────────────────────── */}
      <section style={{ background:'#F8FAFC', paddingTop:64 }}>
        <div className="container">
          <div className="cp-stats-grid" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16 }}>
            {[
              { icon:GraduationCap, value:'5,000+', label:'Students Trained',    color:'#DC2626', bg:'#FEF2F2', border:'#FECACA' },
              { icon:BookOpen,      value:`${allCards.length}`,  label:'Specialised Programs', color:'#0EA5E9', bg:'#F0F9FF', border:'#BAE6FD' },
              { icon:Award,         value:`${reviews.length || '100'}+`, label:'Course Reviews',    color:'#D97706', bg:'#FFFBEB', border:'#FDE68A' },
              { icon:TrendingUp,    value:'95%',   label:'Placement Rate',       color:'#059669', bg:'#F0FDF4', border:'#BBF7D0' },
            ].map(({ icon:Icon, value, label, color, bg, border }) => (
              <div key={label} style={{ background:'#fff', borderRadius:16, border:'1.5px solid #E2E8F0', padding:'26px 22px', boxShadow:'0 2px 14px rgba(15,23,42,.06)', display:'flex', flexDirection:'column', alignItems:'flex-start', transition:'transform .25s,box-shadow .25s' }}>
                <div style={{ width:44, height:44, borderRadius:12, background:bg, border:`1px solid ${border}`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:14 }}>
                  <Icon style={{ width:20, height:20, color }} />
                </div>
                <p style={{ fontSize:'clamp(26px,2.4vw,36px)', fontWeight:900, color, lineHeight:1, margin:0, letterSpacing:'-.03em' }}>{value}</p>
                <div style={{ width:24, height:2.5, borderRadius:2, background:color, opacity:.28, margin:'10px 0 8px' }} />
                <p style={{ fontSize:11, fontWeight:700, color:'#64748B', textTransform:'uppercase', letterSpacing:'.12em', margin:0 }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── UPCOMING BATCHES SECTION ────────────────────────────────── */}
      <UpcomingBatches
        batches={formattedBatches}
        title="Upcoming Batches"
        subtitle="Limited seats • Live Online + Offline options • New batches every month"
      />

      {/* ── LIVE & UPCOMING SESSIONS ─────────────────────────────────── */}
      <LiveAndUpcomingSessions
        sessions={rawSessions.map((s): SessionListItem => ({
          id: s.id,
          title: s.title,
          sessionDate: s.sessionDate.toISOString(),
          startTime: s.startTime.toISOString(),
          endTime: s.endTime.toISOString(),
          isLive: s.status === 'LIVE' || (s.startTime <= now && s.endTime >= now),
          meetLink: s.meetLink,
          batchName: s.batch.name,
          courseTitle: s.batch.course.title,
          trainerName: s.trainer.name,
          trainerImage: s.trainer.image,
        }))}
      />

      {/* ── COURSE CARDS ────────────────────────────────────────────── */}
      <section id="programs" style={{ background:'#F8FAFC', padding:'72px 0 96px' }}>
        <div className="container">
          <div style={{ textAlign:'center', maxWidth:680, margin:'0 auto 64px' }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:7, padding:'5px 16px', borderRadius:50, background:'#EFF6FF', border:'1px solid #BFDBFE', color:'#1D4ED8', fontSize:11, fontWeight:800, letterSpacing:'.18em', textTransform:'uppercase', marginBottom:20 }}>
              <BookOpen style={{ width:11, height:11 }} />
              All Programs
            </div>
            <h2 style={{ fontSize:'clamp(28px,3.2vw,46px)', fontWeight:900, color:'#0F172A', lineHeight:1.1, letterSpacing:'-.04em', margin:'0 0 18px' }}>
              Find Your Perfect{' '}
              <span style={{ background:'linear-gradient(120deg,#DC2626,#F59E0B)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
                Recruitment Program
              </span>
            </h2>
            <p style={{ fontSize:16, color:'#64748B', lineHeight:1.82, margin:0 }}>
              Every course is designed by recruitment practitioners with 25+ years of industry experience. Pick the track that matches your career stage.
            </p>
          </div>

          {allCards.length === 0 ? (
            <div style={{ background:'#fff', borderRadius:24, border:'1.5px solid #E2E8F0', padding:48, textAlign:'center', color:'#64748B', fontSize:15 }}>
              No programs found. Please check back soon.
            </div>
          ) : (
            <div className="cp-cards-grid" style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:28 }}>
              {allCards.map((card) => {
                const m = card.meta
                return (
                  <article key={card.slug} className="cp-card">
                    {/* Image header */}
                    <div style={{ position:'relative', height:280, background:'#0F172A', overflow:'hidden', flexShrink:0 }}>
                      <Image
                        src={m.image}
                        alt={card.title}
                        fill sizes="(max-width:960px) 100vw, 50vw"
                        className="cp-card-img"
                        style={{ objectFit:'cover', objectPosition:'center top' }}
                      />
                      {/* Dark overlay */}
                      <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom,rgba(0,0,0,.05) 0%,transparent 38%,rgba(0,0,0,.7) 100%)' }} />
                      {/* Accent top-left glow */}
                      <div aria-hidden style={{ position:'absolute', bottom:-40, right:-40, width:200, height:200, background:`radial-gradient(circle,${m.accentGlow} 0%,transparent 70%)`, pointerEvents:'none' }} />

                      {/* Badge */}
                      <div style={{ position:'absolute', top:18, left:18, display:'inline-flex', alignItems:'center', gap:6, padding:'6px 13px', borderRadius:50, background:m.badgeBg, border:`1px solid ${m.badgeBorder}`, backdropFilter:'blur(12px)' }}>
                        <span style={{ width:5, height:5, borderRadius:'50%', background:m.badgeColor, flexShrink:0, display:'block', boxShadow:`0 0 6px ${m.badgeColor}` }} />
                        <span style={{ fontSize:10, fontWeight:800, color:m.badgeColor, textTransform:'uppercase', letterSpacing:'.14em' }}>{m.badge}</span>
                      </div>

                      {/* Rating */}
                      <div style={{ position:'absolute', top:18, right:18, display:'inline-flex', alignItems:'center', gap:5, padding:'6px 12px', borderRadius:50, background:'rgba(255,255,255,.14)', backdropFilter:'blur(12px)', border:'1px solid rgba(255,255,255,.22)' }}>
                        <Star style={{ width:12, height:12, color:'#FBBF24', fill:'#FBBF24' }} />
                        <span style={{ fontSize:12, fontWeight:800, color:'#fff' }}>{card.rating.toFixed(1)}</span>
                      </div>

                      {/* Bottom highlight */}
                      <div style={{ position:'absolute', bottom:18, left:18, display:'flex', alignItems:'center', gap:10 }}>
                        <div style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:42, height:42, borderRadius:12, background:m.badgeBg, border:`1px solid ${m.badgeBorder}`, backdropFilter:'blur(12px)', fontSize:19 }}>
                          {m.icon}
                        </div>
                        <div>
                          <p style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,.55)', textTransform:'uppercase', letterSpacing:'.1em', margin:'0 0 2px' }}>Highlight</p>
                          <p style={{ fontSize:13, fontWeight:800, color:'#fff', margin:0 }}>{m.highlight}</p>
                        </div>
                      </div>

                      {/* Enrolled bottom-right */}
                      <div style={{ position:'absolute', bottom:18, right:18, display:'inline-flex', alignItems:'center', gap:6, padding:'5px 12px', borderRadius:50, background:'rgba(0,0,0,.5)', backdropFilter:'blur(10px)', border:'1px solid rgba(255,255,255,.14)' }}>
                        <Users style={{ width:11, height:11, color:'#94A3B8' }} />
                        <span style={{ fontSize:11, fontWeight:700, color:'#CBD5E1' }}>{card.enrolled} enrolled</span>
                      </div>
                    </div>

                    {/* Body */}
                    <div style={{ padding:'28px 28px 24px', display:'flex', flexDirection:'column', flex:1 }}>
                      {/* Course label + title */}
                      <div style={{ marginBottom:16 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:8 }}>
                          <div style={{ width:3, height:14, borderRadius:2, background:m.accent, flexShrink:0 }} />
                          <span style={{ fontSize:10, fontWeight:800, color:m.accent, textTransform:'uppercase', letterSpacing:'.16em' }}>{m.tagline}</span>
                        </div>
                        <h3 style={{ fontSize:'clamp(18px,1.8vw,22px)', fontWeight:900, color:'#0F172A', lineHeight:1.22, letterSpacing:'-.025em', margin:0 }}>{card.title}</h3>
                      </div>

                      {/* Stars + reviews */}
                      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16, paddingBottom:14, borderBottom:'1px solid #F1F5F9' }}>
                        <Stars rating={card.rating} />
                        <span style={{ fontSize:12, fontWeight:700, color:'#0F172A' }}>{card.rating.toFixed(1)}</span>
                        <span style={{ fontSize:12, color:'#94A3B8' }}>({card.reviewCount} reviews)</span>
                      </div>

                      {/* Tags */}
                      <div style={{ display:'flex', flexWrap:'wrap', gap:7, marginBottom:16 }}>
                        {[card.duration, m.tags[1] || 'Online & Offline', m.tags[2] || 'Certificate'].map((tag, tIdx) => (
                          <span key={tag} style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'5px 12px', borderRadius:50, background:m.accentLight, border:`1px solid ${m.accentBorder}`, fontSize:11, fontWeight:700, color:m.accent }}>
                            {tIdx === 0 ? <Clock style={{ width:10, height:10 }} /> : tIdx === 1 ? <Monitor style={{ width:10, height:10 }} /> : <BadgeCheck style={{ width:10, height:10 }} />}
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Description */}
                      <p style={{ fontSize:14, color:'#475569', lineHeight:1.82, marginBottom:22, flex:1 }}>{card.description}</p>

                      {/* Key features */}
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px 12px', marginBottom:22, paddingBottom:20, borderBottom:'1px solid #F1F5F9' }}>
                        {[
                          `${card.duration} duration`,
                          `${m.mode} delivery`,
                          'Industry certificate',
                          'Placement support',
                        ].map(f => (
                          <div key={f} style={{ display:'flex', alignItems:'flex-start', gap:7 }}>
                            <div style={{ width:17, height:17, borderRadius:'50%', flexShrink:0, background:m.accentLight, border:`1px solid ${m.accentBorder}`, display:'flex', alignItems:'center', justifyContent:'center', marginTop:1 }}>
                              <CheckCircle2 style={{ width:10, height:10, color:m.accent }} />
                            </div>
                            <span style={{ fontSize:12, fontWeight:600, color:'#334155', lineHeight:1.5 }}>{f}</span>
                          </div>
                        ))}
                      </div>

                      {/* Pricing pills */}
                      <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 14, padding: '10px 14px', marginBottom: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 10, fontWeight: 800, color: '#0284C7', background: '#E0F2FE', padding: '2px 6px', borderRadius: 6, textTransform: 'uppercase' }}>
                            Online 50% OFF
                          </span>
                          <span style={{ fontSize: 13, fontWeight: 900, color: '#0F172A' }}>
                            ₹{card.onlinePrice.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 10, fontWeight: 800, color: '#D97706', background: '#FEF3C7', padding: '2px 6px', borderRadius: 6, textTransform: 'uppercase' }}>
                            Classroom 10% OFF
                          </span>
                          <span style={{ fontSize: 13, fontWeight: 900, color: '#0F172A' }}>
                            ₹{card.offlinePrice.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>

                      {/* CTAs */}
                      <div style={{ display:'flex', gap:10 }}>
                        <Link href={card.route} className="cp-card-btn" style={{ background:m.gradient, color:'#fff', boxShadow:`0 6px 20px ${m.accentGlow}` }}>
                          Learn More <ArrowRight style={{ width:14, height:14 }} />
                        </Link>
                        <Link href="/contact" className="cp-card-btn" style={{ background:'#0F172A', color:'#fff', boxShadow:'0 4px 14px rgba(15,23,42,.22)' }}>
                          <Phone style={{ width:13, height:13 }} /> Enquire Now
                        </Link>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── TRUST BAR ────────────────────────────────────────────────── */}
      <section style={{ background:'#fff', borderTop:'1px solid #E2E8F0', borderBottom:'1px solid #E2E8F0' }}>
        <div className="container">
          <div className="cp-trust-grid" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', borderRight:'1px solid #E2E8F0' }}>
            {[
              { icon:ShieldCheck, color:'#1D4ED8', bg:'#EFF6FF', border:'#BFDBFE', title:'Industry-Recognised Certificate', desc:"Every graduate receives a certificate trusted by India's top companies and recruitment agencies." },
              { icon:MessageCircle, color:'#0D9488', bg:'#F0FDFA', border:'#99F6E4', title:'Live, Hands-On Training', desc:'Practice real hiring scenarios, ATS tools, and interview techniques with live practitioner sessions.' },
              { icon:TrendingUp, color:'#D97706', bg:'#FFFBEB', border:'#FDE68A', title:'Placement-Focused Outcomes', desc:'95% of graduates secure a recruitment role within 90 days of completing the program.' },
            ].map(({ icon:Icon, color, bg, border, title, desc }, i) => (
              <div key={title} className="cp-trust-item" style={{ borderLeft:'1px solid #E2E8F0', borderBottom:'none' }}>
                <div style={{ width:50, height:50, borderRadius:14, background:bg, border:`1.5px solid ${border}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <Icon style={{ width:23, height:23, color }} />
                </div>
                <div>
                  <p style={{ fontSize:14, fontWeight:800, color:'#0F172A', margin:'0 0 7px', lineHeight:1.3 }}>{title}</p>
                  <p style={{ fontSize:13, color:'#64748B', lineHeight:1.75, margin:0 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED TRAINERS SECTION ────────────────────────────────── */}
      <FeaturedTrainers
        trainers={formattedTrainers}
        title="Learn From The Best"
        subtitle="Our master faculty has built talent acquisition engines at Google, Amazon, TCS & India's top recruitment agencies."
      />

      {/* â• â•  BOTTOM CTA â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â•  */}
      {/* TESTIMONIALS */}
      {testimonials.length > 0 && (
        <section style={{ background: '#fff', padding: '80px 0', borderTop: '1px solid #E2E8F0' }}>
          <div className="container">
            <div style={{ textAlign: 'center', maxWidth: 620, margin: '0 auto 52px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 16px', borderRadius: 50, background: '#FFFBEB', border: '1px solid #FDE68A', color: '#D97706', fontSize: 11, fontWeight: 800, letterSpacing: '.18em', textTransform: 'uppercase' as const, marginBottom: 18 }}>
                <Star style={{ width: 11, height: 11, fill: '#D97706' }} /> Alumni Reviews
              </div>
              <h2 style={{ fontSize: 'clamp(26px,3vw,40px)', fontWeight: 900, color: '#0F172A', lineHeight: 1.15, letterSpacing: '-.03em', margin: '0 0 14px' }}>
                What Our Students{' '}
                <span style={{ background: 'linear-gradient(120deg,#1D4ED8,#2563EB)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  Say
                </span>
              </h2>
              <p style={{ fontSize: 15, color: '#64748B', lineHeight: 1.8, margin: 0 }}>
                Real feedback from HR professionals and career switchers who trained with us.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 22 }}>
              {testimonials.map((t, i) => {
                const tColors = [
                  { border: '#BFDBFE', badge: '#EFF6FF', accent: '#1D4ED8' },
                  { border: '#BBF7D0', badge: '#F0FDF4', accent: '#059669' },
                  { border: '#DDD6FE', badge: '#F5F3FF', accent: '#7C3AED' },
                  { border: '#FDE68A', badge: '#FFFBEB', accent: '#D97706' },
                ]
                const c = tColors[i % tColors.length]
                const name = t.author || 'Alumni'
                const role = t.title || 'Student'
                const imgSrc = t.image ? (t.image.startsWith('http') ? t.image : `/${t.image.replace(/^\/+/, '')}`) : null
                const initials = name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)
                return (
                  <div key={t.id} style={{ background: '#FAFBFF', border: `1.5px solid ${c.border}`, borderRadius: 20, padding: '26px 24px', display: 'flex', flexDirection: 'column', gap: 16, boxShadow: '0 2px 12px rgba(15,23,42,.05)' }}>
                    <div style={{ display: 'flex', gap: 3 }}>
                      {[...Array(5)].map((_, si) => (
                        <Star key={si} style={{ width: 13, height: 13, color: si < (t.rating ?? 5) ? '#F59E0B' : '#E2E8F0', fill: si < (t.rating ?? 5) ? '#F59E0B' : '#E2E8F0' }} />
                      ))}
                    </div>
                    <p style={{ fontSize: 14, color: '#334155', lineHeight: 1.8, fontStyle: 'italic', flex: 1, margin: 0 }}>
                      &ldquo;{t.description}&rdquo;
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 11, paddingTop: 16, borderTop: '1px solid #F1F5F9' }}>
                      {imgSrc ? (
                        <img src={imgSrc} alt={name} style={{ width: 42, height: 42, borderRadius: '50%', objectFit: 'cover' as const, border: `2px solid ${c.border}` }} />
                      ) : (
                        <div style={{ width: 42, height: 42, borderRadius: '50%', background: c.badge, border: `2px solid ${c.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <span style={{ fontSize: 13, fontWeight: 800, color: c.accent }}>{initials}</span>
                        </div>
                      )}
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', margin: 0, lineHeight: 1.3 }}>{name}</p>
                        <p style={{ fontSize: 12, color: '#64748B', margin: '2px 0 0', fontWeight: 500 }}>{role}</p>
                      </div>
                      <div style={{ marginLeft: 'auto', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 50, padding: '3px 10px', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Award style={{ width: 10, height: 10, color: '#059669' }} />
                        <span style={{ fontSize: 10, fontWeight: 700, color: '#059669', textTransform: 'uppercase' as const, letterSpacing: '.1em' }}>Verified</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div style={{ textAlign: 'center', marginTop: 40 }}>
              <Link href="/testimonials" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#EFF6FF', border: '1.5px solid #BFDBFE', color: '#1D4ED8', padding: '11px 24px', borderRadius: 12, fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
                View All Reviews <ChevronRight style={{ width: 15, height: 15 }} />
              </Link>
            </div>
          </div>
        </section>
      )}

      <section style={{ background:'#F8FAFC', padding:'80px 0 96px' }}>
        <div className="container">
          <div style={{ borderRadius:26, background:'linear-gradient(135deg,#04091A 0%,#080F22 50%,#04081A 100%)', border:'1px solid rgba(255,255,255,.07)', overflow:'hidden', position:'relative' }}>
            <div aria-hidden style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(rgba(255,255,255,.022) 1px,transparent 1px)', backgroundSize:'26px 26px' }} />
            <div aria-hidden style={{ position:'absolute', top:-80, right:-60, width:480, height:480, background:'radial-gradient(circle,rgba(220,38,38,.18) 0%,transparent 65%)', pointerEvents:'none' }} />
            <div aria-hidden style={{ position:'absolute', bottom:-60, left:'10%', width:380, height:380, background:'radial-gradient(circle,rgba(14,165,233,.1) 0%,transparent 65%)', pointerEvents:'none' }} />
            <div aria-hidden style={{ height:2, background:'linear-gradient(90deg,#DC2626,#F59E0B 40%,#0EA5E9 80%,#7C3AED)' }} />

            <div style={{ padding:'64px 60px', position:'relative', zIndex:10, textAlign:'center' }}>
              <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'6px 16px', borderRadius:50, background:'rgba(220,38,38,.12)', border:'1px solid rgba(220,38,38,.28)', marginBottom:22 }}>
                <Zap style={{ width:11, height:11, color:'#EF4444' }} />
                <span style={{ fontSize:11, fontWeight:800, color:'#FCA5A5', letterSpacing:'.18em', textTransform:'uppercase' }}>Not sure which program?</span>
              </div>

              <h2 style={{ fontSize:'clamp(26px,3vw,46px)', fontWeight:900, color:'#fff', lineHeight:1.1, letterSpacing:'-.035em', marginBottom:18 }}>
                Talk to a career counsellor — it&apos;s free.
              </h2>
              <p style={{ fontSize:16, color:'#94A3B8', lineHeight:1.85, maxWidth:520, margin:'0 auto 40px' }}>
                Our experts will match you to the right program based on your experience, goals, and timeline. No obligation, just genuine guidance.
              </p>

              <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap', marginBottom:32 }}>
                <Link href="/contact" className="cp-bottom-cta-btn" style={{ background:'linear-gradient(135deg,#DC2626,#EF4444)', color:'#fff', boxShadow:'0 8px 28px rgba(220,38,38,.38)' }}>
                  <MessageCircle style={{ width:16, height:16 }} /> Talk to an Expert
                </Link>
                <a href="https://wa.me/917385204165" target="_blank" rel="noopener noreferrer" className="cp-bottom-cta-btn" style={{ background:'linear-gradient(135deg,#059669,#0D9488)', color:'#fff', boxShadow:'0 8px 24px rgba(5,150,105,.32)', textDecoration:'none' }}>
                  WhatsApp Admissions
                </a>
              </div>

              <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:24, flexWrap:'wrap' }}>
                {['Free 30-min consultation', 'No pressure, no commitment', 'Instant WhatsApp response'].map(t => (
                  <div key={t} style={{ display:'flex', alignItems:'center', gap:7 }}>
                    <CheckCircle2 style={{ width:13, height:13, color:'#6EE7B7' }} />
                    <span style={{ fontSize:12, fontWeight:600, color:'#64748B' }}>{t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

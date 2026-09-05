import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import { getSiteStats } from '@/lib/site-stats'
import {
  ArrowRight,
  Award,
  BadgeCheck,
  BookOpen,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  GraduationCap,
  Lightbulb,
  MessageCircle,
  Phone,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  Zap,
  Shield,
  PlayCircle,
} from 'lucide-react'
import WhatsAppIcon from '@/components/shared/WhatsAppIcon'

const BASE_URL = 'https://recruitmentinstitute.in'

export const metadata: Metadata = {
  title: 'Student Membership - Unlock Exclusive HR Career Benefits | Recruitment Institute',
  description:
    'Join the Recruitment Institute student membership program for exclusive access to premium resources, HR community, placement support, certification, knowledge base, and industry events.',
  alternates: { canonical: `${BASE_URL}/student-membership` },
  openGraph: {
    title: 'Student Membership - Recruitment Institute',
    description: 'Unlock exclusive HR career benefits. Join 5,000+ professionals in our student membership community.',
    url: `${BASE_URL}/student-membership`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Student Membership - Recruitment Institute',
    description: 'Unlock exclusive HR career benefits. Join 5,000+ professionals in our student membership community.',
  },
}

/* â"€â"€â"€ Benefit cards â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€ */
/* ─── Benefit cards ─────────────────────────────────────────── */
const defaultBenefits = [
  {
    icon: BookOpen,
    title: 'Recruiter Toolkits & Resources',
    desc: 'Access exclusive study materials, JD templates, Boolean sourcing scripts, ATS workflows, and recruiter toolkits curated by industry experts.',
    href: '/knowledge',
    color: '#1D4ED8',
    bg: '#EFF6FF',
    border: '#BFDBFE',
    tag: '200+ Resources',
  },
  {
    icon: Users,
    title: 'Active Recruiter Community',
    desc: 'Connect, collaborate, and network alongside 5,000+ active HR professionals, talent acquisition leads, and recruiters across India.',
    href: '/community',
    color: '#0D9488',
    bg: '#F0FDFA',
    border: '#99F6E4',
    tag: '5,000+ Members',
  },
  {
    icon: Briefcase,
    title: '100% Placement Support',
    desc: 'Get dedicated placement assistance, resume optimization, mock technical interview drills, and direct referrals to hiring partners.',
    href: '/contact',
    color: '#DC2626',
    bg: '#FEF2F2',
    border: '#FECACA',
    tag: '95% Placed',
  },
  {
    icon: GraduationCap,
    title: 'Verifiable Certification',
    desc: 'Earn industry-recognized, verifiable certificates trusted by 200+ top corporates and talent acquisition agencies across India.',
    href: '/testimonials',
    color: '#7C3AED',
    bg: '#F5F3FF',
    border: '#DDD6FE',
    tag: 'Industry Verified',
  },
  {
    icon: Lightbulb,
    title: 'Practical Case Studies & LMS',
    desc: 'Interactive LMS portal with chapter quizzes, live assignment submissions, real-world hiring case studies, and instructor feedback.',
    href: '/knowledge',
    color: '#D97706',
    bg: '#FFFBEB',
    border: '#FDE68A',
    tag: '1,000+ Modules',
  },
  {
    icon: CalendarDays,
    title: 'Masterclasses & Live Webinars',
    desc: 'Exclusive access to live webinars, weekend masterclasses with ex-Google/TCS leaders, and annual HR conclave networking sessions.',
    href: '/contact',
    color: '#059669',
    bg: '#F0FDF4',
    border: '#BBF7D0',
    tag: 'Weekly Events',
  },
]

/* ─── Testimonials ───────────────────────────────────────────── */
const defaultTestimonials = [
  {
    name: 'Priya Sharma',
    role: 'Talent Acquisition Executive, Tech Mahindra',
    avatar: '/assets/images/team/style2/1.jpg',
    text: 'The End-to-End Recruitment training and student membership transformed my career. The live Boolean sourcing drills and mock interviews helped me land my dream role within 3 weeks.',
    rating: 5,
  },
  {
    name: 'Rahul Mehta',
    role: 'Senior Technical Recruiter, Infosys',
    avatar: '/assets/images/team/style2/3.jpg',
    text: 'The recruiter toolkits, JD templates, and ATS scripts saved me countless hours every week. The verifiable certificate added immense credibility on LinkedIn.',
    rating: 5,
  },
  {
    name: 'Sneha Kulkarni',
    role: 'HR Business Partner, Wipro',
    avatar: '/assets/images/team/style2/5.jpg',
    text: 'The statutory compliance and payroll modules in the Beginner & Foundation track gave me boardroom-ready confidence. Highly recommended!',
    rating: 5,
  },
]

/* ─── Actual Institute Course Plans ───────────────────────────── */
const officialCoursePlans = [
  {
    name: 'HR Courses for Beginners',
    courseSlug: '/hr-courses-for-beginners',
    tagline: 'Fast-Track HR Foundation',
    price: '₹14,999',
    originalPrice: '₹19,999',
    discountTag: '25% OFF',
    period: '• 4 Weeks',
    mode: '100% Live Online Cohort',
    desc: 'Perfect for freshers and early professionals aiming to build a solid foundation in HR operations, payroll, and compliance.',
    color: '#0284C7',
    bg: '#F0F9FF',
    border: '#BAE6FD',
    cta: 'Enroll in Beginner Track',
    ctaBg: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
    features: [
      'Payroll & Statutory Compliance (PF, ESIC, PT, TDS)',
      'End-to-End HR Operations, Onboarding & Offboarding',
      'Basic Candidate Sourcing & Job Portal Search',
      'Full LMS Access, Chapter Notes & Recordings',
      'Verifiable HR Foundation Certificate',
      'Placement Assistance & Resume Review Drills',
    ],
    highlight: false,
  },
  {
    name: 'End-to-End Recruitment Training',
    courseSlug: '/end-to-end-recruitment-training',
    tagline: 'Most Popular • Flagship Cohort',
    price: '₹24,999',
    originalPrice: '₹34,999',
    discountTag: '29% OFF',
    period: '• 3 Months',
    mode: 'Live Online & Pune Classroom',
    desc: 'Comprehensive, hands-on training covering full lifecycle recruitment, Boolean search, headhunting, and ATS workflows.',
    color: '#1E40AF',
    bg: '#EFF6FF',
    border: '#1E40AF',
    cta: 'Enroll in Flagship Track',
    ctaBg: 'linear-gradient(135deg, #1E40AF 0%, #1D4ED8 100%)',
    features: [
      'Full Lifecycle Tech & Non-Tech Recruitment Engine',
      'Advanced Boolean Search, LinkedIn Recruiter & X-Ray',
      'ATS Screening, Candidate Assessment & Offer Closing',
      '1-on-1 Mentorship from Ex-Google & TCS Talent Directors',
      'Executive Certificate with Distinction Score',
      '100% Dedicated Placement Support & Mock Interviews',
      'Lifelong Recruiter Community & Alumni Forum Access',
    ],
    highlight: true,
  },
  {
    name: 'HR Entrepreneurship Program',
    courseSlug: '/hr-entrepreneurship-program',
    tagline: 'Business & Agency Track',
    price: '₹34,999',
    originalPrice: '₹45,000',
    discountTag: '22% OFF',
    period: '• 6 Months',
    mode: 'Executive Blended Mentorship',
    desc: 'Step-by-step master program to launch, scale, and monetize your own recruitment agency or HR consulting practice.',
    color: '#7C3AED',
    bg: '#FAF5FF',
    border: '#DDD6FE',
    cta: 'Launch Your HR Agency',
    ctaBg: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
    features: [
      'Complete Blueprint to Launch a Profitable HR Agency',
      'Client Acquisition, Retainer Billing & 8.33%–15% Contracts',
      'Staffing Agreements, Legal Contracts & Fee Templates',
      'Direct Mentorship with Successful HR Firm Founders',
      'VIP Access to Annual HR Conclaves & Masterclasses',
      'Lifelong LMS Updates & Business Toolkits',
    ],
    highlight: false,
  },
]

export default async function StudentMembershipPage() {
  const [activeMembers, testimonials, knowledgeCount, siteStats] = await Promise.all([
    prisma.subscriber.count({ where: { isActive: true } }),
    prisma.testimonial.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      take: 3,
    }),
    prisma.knowledgeItem.count(),
    getSiteStats(),
  ])

  const benefits = defaultBenefits.map((b, index) => ({
    ...b,
    tag:
      index === 0
        ? `${knowledgeCount > 0 ? knowledgeCount : '200'}+ Resources`
        : index === 1
        ? `${activeMembers > 0 ? activeMembers.toLocaleString('en-IN') : '5,000'}+ Members`
        : index === 2
        ? 'Placement Support'
        : index === 3
        ? 'Industry Verified'
        : index === 4
        ? 'Practical LMS'
        : 'Weekly Events',
  }))

  const plans = officialCoursePlans

  const testimonialCards = testimonials.length > 0
    ? testimonials.map((t, idx) => ({
        name: t.author || 'Member',
        role: t.title || 'HR Professional',
        avatar: t.image || ['/assets/images/team/style1/1.jpg','/assets/images/team/style1/2.jpg','/assets/images/team/style1/3.jpg'][idx % 3],
        text: t.description || '',
        rating: t.rating || 5,
      }))
    : defaultTestimonials

  return (
    <>
      {/* â"€â"€ CSS â"€â"€ */}
      <style>{`
        /* Breadcrumb */
        .sm-crumb { color: #94A3B8; text-decoration: none; font-size: 13px; font-weight: 500; transition: color .18s; }
        .sm-crumb:hover { color: #CBD5E1; }

        /* Hero CTAs */
        .sm-hero-cta {
          display: inline-flex; align-items: center; gap: 9px;
          background: linear-gradient(135deg,#1D4ED8,#2563EB);
          color: #fff; font-weight: 700; font-size: 15px;
          padding: 15px 32px; border-radius: 11px; text-decoration: none;
          box-shadow: 0 8px 28px rgba(29,78,216,.45);
          transition: transform .2s, box-shadow .2s;
        }
        .sm-hero-cta:hover { transform: translateY(-2px); box-shadow: 0 14px 36px rgba(29,78,216,.55); }

        .sm-hero-ghost {
          display: inline-flex; align-items: center; gap: 9px;
          border: 1.5px solid rgba(255,255,255,.18); color: #fff;
          font-weight: 600; font-size: 14px; padding: 14px 26px;
          border-radius: 11px; text-decoration: none;
          background: rgba(255,255,255,.06);
          transition: background .2s, border-color .2s;
        }
        .sm-hero-ghost:hover { background: rgba(255,255,255,.12); border-color: rgba(255,255,255,.32); }

        /* Benefit cards */
        .sm-benefit {
          background: #fff; border-radius: 18px; border: 1.5px solid #E2E8F0;
          padding: 32px 28px; box-shadow: 0 4px 20px rgba(15,23,42,.06);
          display: flex; flex-direction: column;
          transition: transform .28s ease, box-shadow .28s ease, border-color .28s ease;
          position: relative; overflow: hidden;
        }
        .sm-benefit::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
          background: var(--card-accent); opacity: 0; transition: opacity .28s;
        }
        .sm-benefit:hover { transform: translateY(-6px); box-shadow: 0 24px 56px rgba(15,23,42,.12); }
        .sm-benefit:hover::before { opacity: 1; }

        /* Plan cards */
        .sm-plan {
          border-radius: 20px; border: 1.5px solid #E2E8F0;
          background: #fff; overflow: hidden;
          box-shadow: 0 4px 20px rgba(15,23,42,.06);
          display: flex; flex-direction: column;
          transition: transform .28s ease, box-shadow .28s ease;
        }
        .sm-plan:hover { transform: translateY(-6px); box-shadow: 0 28px 64px rgba(15,23,42,.13); }
        .sm-plan.featured { border-color: #1D4ED8; box-shadow: 0 8px 40px rgba(29,78,216,.18); }

        /* Plan CTA */
        .sm-plan-cta {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          color: #fff; font-weight: 700; font-size: 14px;
          padding: 14px 24px; border-radius: 10px; text-decoration: none;
          transition: opacity .2s, transform .2s;
        }
        .sm-plan-cta:hover { opacity: .88; transform: translateY(-1px); }

        .sm-plan-cta-outline {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          border: 1.5px solid #E2E8F0; color: #0F172A;
          font-weight: 700; font-size: 14px; padding: 13px 24px; border-radius: 10px;
          text-decoration: none; background: #F8FAFC;
          transition: background .2s, border-color .2s;
        }
        .sm-plan-cta-outline:hover { background: #F1F5F9; border-color: #CBD5E1; }

        /* Testimonial cards */
        .sm-testi {
          background: #fff; border-radius: 18px; border: 1.5px solid #E2E8F0;
          padding: 30px 28px; box-shadow: 0 4px 20px rgba(15,23,42,.06);
          transition: transform .28s ease, box-shadow .28s ease;
        }
        .sm-testi:hover { transform: translateY(-5px); box-shadow: 0 20px 50px rgba(15,23,42,.11); }

        /* Bottom CTAs */
        .sm-cta-red {
          display: inline-flex; align-items: center; gap: 9px;
          background: linear-gradient(135deg,#DC2626,#EF4444);
          color: #fff; font-weight: 700; font-size: 15px;
          padding: 15px 34px; border-radius: 11px; text-decoration: none;
          box-shadow: 0 8px 24px rgba(220,38,38,.38);
          transition: opacity .2s, transform .2s;
        }
        .sm-cta-red:hover { opacity: .88; transform: translateY(-2px); }

        .sm-cta-outline {
          display: inline-flex; align-items: center; gap: 9px;
          border: 1.5px solid rgba(255,255,255,.2); color: #fff;
          font-weight: 600; font-size: 14px; padding: 14px 28px;
          border-radius: 11px; text-decoration: none; background: rgba(255,255,255,.07);
          transition: background .2s, border-color .2s;
        }
        .sm-cta-outline:hover { background: rgba(255,255,255,.13); border-color: rgba(255,255,255,.35); }

        /* Responsive */
        @media (max-width: 1100px) {
          .sm-hero-grid  { grid-template-columns: 1fr !important; }
          .sm-hero-right { display: none !important; }
          .sm-plans-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 900px) {
          .sm-benefits-grid { grid-template-columns: repeat(2,1fr) !important; }
          .sm-testi-grid    { grid-template-columns: 1fr !important; }
          .sm-cta-btns      { flex-direction: column !important; align-items: center !important; }
          .sm-trust-grid    { grid-template-columns: repeat(2,1fr) !important; }
        }
        @media (max-width: 580px) {
          .sm-benefits-grid { grid-template-columns: 1fr !important; }
          .sm-trust-grid    { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          HERO "" dark navy, split layout
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section style={{
        background: 'linear-gradient(130deg,#060D1C 0%,#0B1629 40%,#0E1F3A 72%,#071120 100%)',
        position: 'relative', overflow: 'hidden',
        minHeight: '560px', display: 'flex', alignItems: 'center',
      }}>
        {/* Dot grid */}
        <div aria-hidden className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,.026) 1px,transparent 1px)', backgroundSize: '28px 28px', zIndex: 1 }} />
        {/* Glows */}
        <div aria-hidden className="absolute" style={{ top: -160, left: -100, width: 600, height: 600, background: 'radial-gradient(circle,rgba(29,78,216,.18) 0%,transparent 65%)', zIndex: 1 }} />
        <div aria-hidden className="absolute" style={{ bottom: -80, right: '20%', width: 400, height: 400, background: 'radial-gradient(circle,rgba(13,148,136,.1) 0%,transparent 65%)', zIndex: 1 }} />
        {/* Gold accent line */}
        <div aria-hidden className="absolute top-0 left-0 right-0" style={{ height: 2, background: 'linear-gradient(90deg,transparent,#D97706 28%,#14B8A6 72%,transparent)', zIndex: 3 }} />

        <div className="container" style={{ position: 'relative', zIndex: 10, padding: '80px 0 96px' }}>
          <div className="sm-hero-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 460px', gap: '64px', alignItems: 'center' }}>

            {/* Left */}
            <div>
              {/* Breadcrumb */}
              <nav aria-label="breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 28 }}>
                <Link href="/" className="sm-crumb">Home</Link>
                <ChevronRight style={{ width: 13, height: 13, color: '#475569' }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: '#F59E0B' }}>Student Membership</span>
              </nav>

              {/* Eyebrow */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 50, background: 'rgba(245,158,11,.12)', border: '1px solid rgba(245,158,11,.28)', marginBottom: 22 }}>
                <Sparkles style={{ width: 12, height: 12, color: '#F59E0B' }} />
                <span style={{ fontSize: 11, fontWeight: 800, color: '#FCD34D', letterSpacing: '.2em', textTransform: 'uppercase' }}>Exclusive Member Benefits</span>
              </div>

              <h1 style={{ fontSize: 'clamp(32px,4vw,58px)', fontWeight: 900, color: '#fff', lineHeight: 1.08, letterSpacing: '-.038em', marginBottom: 20 }}>
                Accelerate your HR career
                <br />
                <span style={{ background: 'linear-gradient(120deg,#60A5FA 0%,#5EEAD4 55%,#FCD34D 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  with full membership.
                </span>
              </h1>

              <p style={{ fontSize: 17, color: '#94A3B8', lineHeight: 1.85, maxWidth: 490, marginBottom: 36 }}>
                Become a member of Recruitment Institute and unlock premium resources, a thriving HR community, placement support, certification, and exclusive industry events.
              </p>

              {/* Highlights */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 40 }}>
                {[
                  { text: '5,000+ Members',        color: '#5EEAD4', bg: 'rgba(94,234,212,.09)',  border: 'rgba(94,234,212,.22)'  },
                  { text: '200+ Resources',         color: '#FCD34D', bg: 'rgba(252,211,77,.09)',  border: 'rgba(252,211,77,.22)'  },
                  { text: '95% Placement Rate',     color: '#86EFAC', bg: 'rgba(134,239,172,.09)', border: 'rgba(134,239,172,.22)' },
                  { text: 'Industry Certificate',   color: '#93C5FD', bg: 'rgba(147,197,253,.09)', border: 'rgba(147,197,253,.22)' },
                ].map(({ text, color, bg, border }) => (
                  <span key={text} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '8px 15px', borderRadius: 50, background: bg, border: `1px solid ${border}`, fontSize: 12, fontWeight: 700, color }}>
                    <CheckCircle2 style={{ width: 12, height: 12 }} />
                    {text}
                  </span>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                <Link href="/student-login" className="sm-hero-cta">
                  Join Now - It&apos;s Free <ArrowRight style={{ width: 16, height: 16 }} />
                </Link>
                <Link href="#benefits" className="sm-hero-ghost">
                  <PlayCircle style={{ width: 15, height: 15 }} /> See Benefits
                </Link>
              </div>
            </div>

            {/* Right visual card */}
            <div className="sm-hero-right" style={{ position: 'relative' }}>
              <div aria-hidden style={{ position: 'absolute', inset: -18, borderRadius: 30, background: 'linear-gradient(135deg,rgba(29,78,216,.2),rgba(13,148,136,.12),rgba(245,158,11,.07))', filter: 'blur(2px)' }} />
              <div style={{ position: 'relative', borderRadius: 22, overflow: 'hidden', border: '1px solid rgba(255,255,255,.08)', boxShadow: '0 48px 110px rgba(0,0,0,.68)' }}>

                {/* Photo */}
                <div style={{ position: 'relative', height: 320, background: '#0B1629' }}>
                  <Image src="/assets/images/banner/home-students-banner.jpg" alt="HR students and recruitment community at Recruitment Institute" fill priority sizes="460px"
                    style={{ objectFit: 'cover', objectPosition: 'center top' }} />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom,rgba(6,13,28,.15) 0%,transparent 40%,rgba(7,17,32,.92) 100%)' }} />
                  {/* Live badge */}
                  <div style={{ position: 'absolute', top: 16, left: 16, display: 'inline-flex', alignItems: 'center', gap: 7, padding: '7px 14px', borderRadius: 50, background: 'rgba(29,78,216,.2)', border: '1px solid rgba(29,78,216,.45)', backdropFilter: 'blur(10px)' }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#60A5FA', boxShadow: '0 0 8px #60A5FA', display: 'block' }} />
                    <span style={{ fontSize: 10, fontWeight: 800, color: '#93C5FD', letterSpacing: '.12em', textTransform: 'uppercase' }}>Active Community</span>
                  </div>
                  {/* Members badge */}
                  <div style={{ position: 'absolute', top: 16, right: 16, display: 'inline-flex', alignItems: 'center', gap: 5, padding: '7px 13px', borderRadius: 50, background: 'rgba(255,255,255,.14)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,.2)' }}>
                    <Users style={{ width: 12, height: 12, color: '#fff' }} />
                    <span style={{ fontSize: 12, fontWeight: 800, color: '#fff' }}>5,000+</span>
                  </div>
                  {/* Floating member avatars */}
                  <div style={{ position: 'absolute', bottom: 20, left: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ display: 'flex' }}>
                      {[1,2,3,4,5].map((i) => (
                        <div key={i} style={{ width: 34, height: 34, borderRadius: '50%', border: '2px solid rgba(255,255,255,.8)', overflow: 'hidden', marginLeft: i > 1 ? -10 : 0, position: 'relative', flexShrink: 0 }}>
                          <Image src={`/assets/images/team/style${i <= 3 ? 1 : 2}/${i <= 3 ? i : i - 3}.jpg`} alt="" fill sizes="34px" style={{ objectFit: 'cover' }} />
                        </div>
                      ))}
                    </div>
                    <div style={{ background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(8px)', borderRadius: 50, padding: '4px 10px', border: '1px solid rgba(255,255,255,.15)' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>+4,995 members</span>
                    </div>
                  </div>
                </div>

                {/* Stats row */}
                <div style={{ background: '#071120', padding: '22px 26px', borderTop: '1px solid rgba(255,255,255,.06)' }}>
                  <p style={{ fontSize: 10, fontWeight: 800, color: '#14B8A6', textTransform: 'uppercase', letterSpacing: '.2em', margin: '0 0 14px' }}>Membership at a Glance</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
                    {[
                      { val: '5K+',  lbl: 'Members',   color: '#60A5FA' },
                      { val: '95%',  lbl: 'Placed',     color: '#5EEAD4' },
                      { val: '200+', lbl: 'Resources',  color: '#FCD34D' },
                    ].map(({ val, lbl, color }) => (
                      <div key={lbl} style={{ textAlign: 'center' }}>
                        <p style={{ fontSize: 22, fontWeight: 900, color, lineHeight: 1, margin: '0 0 4px', letterSpacing: '-.03em' }}>{val}</p>
                        <p style={{ fontSize: 10, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '.1em', margin: 0 }}>{lbl}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave transition */}
        <div aria-hidden className="absolute bottom-0 left-0 right-0" style={{ height: 54, background: '#F8FAFC', clipPath: 'ellipse(55% 100% at 50% 100%)', zIndex: 10 }} />
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          TRUST STRIP
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section style={{ background: '#F8FAFC', paddingTop: 64, paddingBottom: 0 }}>
        <div className="container">
          <div className="sm-trust-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
            {siteStats.map((item, idx) => {
              const Icon = item.icon === 'users' ? Users : item.icon === 'book' ? BookOpen : item.icon === 'award' ? Award : item.icon === 'trending' ? TrendingUp : Award
              return (
                <div key={idx} style={{ background: '#fff', borderRadius: 16, border: '1.5px solid #E2E8F0', padding: '24px 20px', boxShadow: '0 2px 14px rgba(15,23,42,.05)', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 11, background: item.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                    <Icon style={{ width: 20, height: 20, color: item.iconColor }} />
                  </div>
                  <p style={{ fontSize: 'clamp(24px,2.2vw,34px)', fontWeight: 900, color: item.iconColor, margin: 0, letterSpacing: '-.03em', lineHeight: 1, whiteSpace: 'nowrap' }}>{item.value}</p>
                  <div style={{ width: 22, height: 2, borderRadius: 2, background: item.iconColor, opacity: .28, margin: '8px 0' }} />
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '.11em', margin: 0, lineHeight: 1.5 }}>{item.label}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          BENEFITS SECTION
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section id="benefits" style={{ background: '#F8FAFC', padding: '80px 0 88px' }}>
        <div className="container">

          {/* Section header */}
          <div style={{ textAlign: 'center', maxWidth: 660, margin: '0 auto 64px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 16px', borderRadius: 50, background: '#EFF6FF', border: '1px solid #BFDBFE', color: '#1D4ED8', fontSize: 11, fontWeight: 800, letterSpacing: '.2em', textTransform: 'uppercase', marginBottom: 18 }}>
              <Sparkles style={{ width: 11, height: 11 }} />
              Join Our Community
            </div>
            <h2 style={{ fontSize: 'clamp(28px,3.2vw,46px)', fontWeight: 900, color: '#0F172A', lineHeight: 1.12, letterSpacing: '-.035em', margin: '0 0 18px' }}>
              Student Membership Benefits
            </h2>
            <p style={{ fontSize: 17, color: '#64748B', lineHeight: 1.82, margin: 0 }}>
              Become a member of Recruitment Institute and unlock exclusive benefits to accelerate your HR career from day one.
            </p>
          </div>

          {/* 3 Ã— 2 benefit grid */}
          <div className="sm-benefits-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 22, marginBottom: 56 }}>
            {benefits.map((b) => {
              const Icon = b.icon
              return (
                <div
                  key={b.title}
                  className="sm-benefit"
                  style={{ '--card-accent': b.color } as React.CSSProperties}
                >
                  {/* Ghost watermark number */}
                  <span aria-hidden style={{ position: 'absolute', top: 16, right: 20, fontSize: 72, fontWeight: 900, color: b.color, opacity: .04, lineHeight: 1, userSelect: 'none', pointerEvents: 'none' }}>
                    {String(benefits.indexOf(b) + 1).padStart(2, '0')}
                  </span>

                  {/* Icon box */}
                  <div style={{ width: 58, height: 58, borderRadius: 15, background: b.bg, border: `1.5px solid ${b.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, flexShrink: 0 }}>
                    <Icon style={{ width: 26, height: 26, color: b.color }} />
                  </div>

                  {/* Tag */}
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 50, background: b.bg, border: `1px solid ${b.border}`, marginBottom: 12 }}>
                    <span style={{ fontSize: 10, fontWeight: 800, color: b.color, textTransform: 'uppercase', letterSpacing: '.14em' }}>{b.tag}</span>
                  </div>

                  <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', lineHeight: 1.25, letterSpacing: '-.018em', margin: '0 0 10px' }}>{b.title}</h3>
                  <p style={{ fontSize: 14, color: '#64748B', lineHeight: 1.8, margin: 0, flex: 1 }}>{b.desc}</p>

                  {/* Bottom link */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 20, paddingTop: 16, borderTop: '1px solid #F1F5F9' }}>
                    <Link href={b.href} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, textDecoration: 'none' }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: b.color }}>Learn more</span>
                      <ArrowRight style={{ width: 13, height: 13, color: b.color }} />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Primary CTAs */}
          <div style={{ textAlign: 'center' }}>
            <div className="sm-cta-btns" style={{ display: 'inline-flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
              <Link href="/student-login" style={{
                display: 'inline-flex', alignItems: 'center', gap: 9,
                background: 'linear-gradient(135deg,#1D4ED8,#2563EB)',
                color: '#fff', fontWeight: 700, fontSize: 15,
                padding: '15px 34px', borderRadius: 11, textDecoration: 'none',
                boxShadow: '0 8px 28px rgba(29,78,216,.42)',
              }}>
                Join Now - Free <ArrowRight style={{ width: 16, height: 16 }} />
              </Link>
              <Link href="/contact" style={{
                display: 'inline-flex', alignItems: 'center', gap: 9,
                border: '1.5px solid #E2E8F0', color: '#0F172A',
                fontWeight: 700, fontSize: 14, padding: '14px 28px',
                borderRadius: 11, textDecoration: 'none', background: '#fff',
                boxShadow: '0 2px 10px rgba(15,23,42,.05)',
              }}>
                <Phone style={{ width: 15, height: 15 }} /> Talk to Counsellor
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          OFFICIAL COURSE TRACKS & MEMBERSHIP PLANS
      ────────────────────────────────────────────────────────────────────────── */}
      <section style={{ background: '#fff', padding: '88px 0 96px', borderTop: '1px solid #E2E8F0' }} id="plans">
        <div className="container">

          {/* Header */}
          <div style={{ textAlign: 'center', maxWidth: 680, margin: '0 auto 60px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 15px', borderRadius: 50, background: '#EFF6FF', border: '1px solid #BFDBFE', color: '#1D4ED8', fontSize: 11, fontWeight: 800, letterSpacing: '.18em', textTransform: 'uppercase', marginBottom: 18 }}>
              <Zap style={{ width: 11, height: 11 }} />
              Flagship Course Tracks &amp; Student Membership
            </div>
            <h2 style={{ fontSize: 'clamp(26px,3vw,42px)', fontWeight: 900, color: '#0F172A', lineHeight: 1.14, letterSpacing: '-.03em', margin: '0 0 16px' }}>
              Choose the right program for your career.
            </h2>
            <p style={{ fontSize: 16, color: '#64748B', lineHeight: 1.8, margin: 0 }}>
              All course enrollments include full <strong>Pro Student Membership</strong>, 100% placement support, verifiable certificate, and lifelong LMS access.
            </p>
          </div>

          {/* Plan cards */}
          <div className="sm-plans-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24, marginBottom: 40 }}>
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`sm-plan${plan.highlight ? ' featured' : ''}`}
                style={{
                  border: `1.5px solid ${plan.highlight ? '#1E40AF' : plan.border}`,
                  boxShadow: plan.highlight ? '0 12px 48px rgba(30,64,175,0.18)' : '0 4px 20px rgba(15,23,42,0.06)',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 20,
                  overflow: 'hidden',
                }}
              >
                {/* Featured / Tagline ribbon */}
                <div
                  style={{
                    background: plan.highlight ? 'linear-gradient(135deg,#1E40AF,#2563EB)' : plan.bg,
                    borderBottom: `1px solid ${plan.border}`,
                    padding: '8px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span style={{ fontSize: 11, fontWeight: 800, color: plan.highlight ? '#fff' : plan.color, letterSpacing: '.1em', textTransform: 'uppercase' }}>
                    {plan.tagline}
                  </span>
                  <span style={{ fontSize: 10, fontWeight: 800, background: plan.highlight ? 'rgba(255,255,255,0.2)' : '#fff', color: plan.highlight ? '#fff' : plan.color, padding: '2px 8px', borderRadius: 50, border: plan.highlight ? 'none' : `1px solid ${plan.border}` }}>
                    {plan.discountTag}
                  </span>
                </div>

                {/* Plan header */}
                <div style={{ padding: '26px 28px 20px', borderBottom: '1px solid #F1F5F9', background: '#FFFFFF' }}>
                  <Link href={plan.courseSlug} style={{ textDecoration: 'none' }}>
                    <h3 style={{ fontSize: 18, fontWeight: 900, color: '#0F172A', lineHeight: 1.3, margin: '0 0 10px', transition: 'color .2s' }}>
                      {plan.name}
                    </h3>
                  </Link>

                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 13, color: '#94A3B8', textDecoration: 'line-through', fontWeight: 600 }}>
                      {plan.originalPrice}
                    </span>
                    <span style={{ fontSize: 'clamp(28px,2.8vw,38px)', fontWeight: 900, color: '#0F172A', letterSpacing: '-.04em', lineHeight: 1 }}>
                      {plan.price}
                    </span>
                    <span style={{ fontSize: 13, color: '#64748B', fontWeight: 700 }}>
                      {plan.period}
                    </span>
                  </div>

                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 6, background: '#F8FAFC', border: '1px solid #E2E8F0', fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 12 }}>
                    <span>📍 {plan.mode}</span>
                  </div>

                  <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.65, margin: 0 }}>
                    {plan.desc}
                  </p>
                </div>

                {/* Features */}
                <div style={{ padding: '24px 28px', flex: 1 }}>
                  <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {plan.features.map((f) => (
                      <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                        <CheckCircle2 style={{ width: 16, height: 16, color: plan.color, flexShrink: 0, marginTop: 1 }} />
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#334155', lineHeight: 1.55 }}>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA */}
                <div style={{ padding: '0 28px 30px' }}>
                  <Link
                    href={plan.courseSlug}
                    className="sm-plan-cta"
                    style={{
                      background: plan.ctaBg,
                      boxShadow: plan.highlight ? '0 6px 20px rgba(30,64,175,0.35)' : '0 4px 14px rgba(15,23,42,0.1)',
                      textDecoration: 'none',
                    }}
                  >
                    {plan.cta} <ArrowRight style={{ width: 15, height: 15 }} />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* ─── CORPORATE TRAINING & ENTERPRISE BANNER ─── */}
          <div
            style={{
              background: 'linear-gradient(130deg, #F8FAFC 0%, #EFF6FF 100%)',
              borderRadius: 20,
              border: '1.5px solid #BFDBFE',
              padding: '32px 36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 24,
            }}
          >
            <div style={{ maxWidth: 640 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 50, background: '#DBEAFE', color: '#1E40AF', fontSize: 10.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 10 }}>
                <span>🏢 Enterprise Solutions</span>
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 900, color: '#0F172A', margin: '0 0 6px' }}>
                Looking for HR Corporate Training for your company team?
              </h3>
              <p style={{ fontSize: 14, color: '#475569', margin: 0, lineHeight: 1.6 }}>
                Customized in-house recruiter bootcamps, executive workshops, volume hiring frameworks, and corporate team certifications.
              </p>
            </div>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link
                href="/hr-corporate-training-course"
                style={{
                  padding: '13px 24px',
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, #1E40AF 0%, #1D4ED8 100%)',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: 13.5,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                View Corporate Program <ArrowRight style={{ width: 14, height: 14 }} />
              </Link>
              <Link
                href="/contact"
                style={{
                  padding: '13px 22px',
                  borderRadius: 10,
                  background: '#FFFFFF',
                  border: '1.5px solid #CBD5E1',
                  color: '#0F172A',
                  fontWeight: 700,
                  fontSize: 13.5,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <Phone style={{ width: 14, height: 14 }} /> Request Proposal
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          TESTIMONIALS
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section style={{ background: '#F8FAFC', padding: '88px 0 96px' }}>
        <div className="container">

          {/* Header */}
          <div style={{ textAlign: 'center', maxWidth: 560, margin: '0 auto 56px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 15px', borderRadius: 50, background: '#FFFBEB', border: '1px solid #FDE68A', color: '#D97706', fontSize: 11, fontWeight: 800, letterSpacing: '.18em', textTransform: 'uppercase', marginBottom: 18 }}>
              <Star style={{ width: 11, height: 11 }} />
              Member Stories
            </div>
            <h2 style={{ fontSize: 'clamp(24px,2.8vw,40px)', fontWeight: 900, color: '#0F172A', lineHeight: 1.14, letterSpacing: '-.03em', margin: '0 0 16px' }}>
              What our members say.
            </h2>
            <p style={{ fontSize: 16, color: '#64748B', lineHeight: 1.8, margin: 0 }}>
              Thousands of HR professionals transformed their careers through our membership community.
            </p>
          </div>

          {/* Cards */}
          <div className="sm-testi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 22 }}>
            {testimonialCards.map((t) => (
              <div key={t.name} className="sm-testi">
                {/* Stars */}
                <div style={{ display: 'flex', gap: 3, marginBottom: 18 }}>
                  {[1,2,3,4,5].map((s) => (
                    <Star key={s} style={{ width: 14, height: 14, color: '#F59E0B', fill: s <= t.rating ? '#F59E0B' : 'none' }} />
                  ))}
                </div>

                {/* Quote mark */}
                <div style={{ fontSize: 48, lineHeight: 1, color: '#E2E8F0', fontFamily: 'Georgia,serif', marginBottom: 4, marginTop: -8 }}>&ldquo;</div>

                <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.85, fontStyle: 'italic', margin: '0 0 24px', flex: 1 }}>{t.text}</p>

                {/* Author */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, paddingTop: 20, borderTop: '1px solid #F1F5F9' }}>
                  <div style={{ width: 46, height: 46, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: '2px solid #E2E8F0' }}>
                    <Image src={t.avatar} alt={t.name} width={46} height={46} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', margin: '0 0 2px' }}>{t.name}</p>
                    <p style={{ fontSize: 12, color: '#64748B', margin: 0 }}>{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          HOW IT WORKS - 3 steps
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section style={{ background: '#fff', padding: '80px 0 88px', borderTop: '1px solid #E2E8F0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: 560, margin: '0 auto 56px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 15px', borderRadius: 50, background: '#EFF6FF', border: '1px solid #BFDBFE', color: '#1D4ED8', fontSize: 11, fontWeight: 800, letterSpacing: '.18em', textTransform: 'uppercase', marginBottom: 18 }}>
              <CheckCircle2 style={{ width: 11, height: 11 }} />
              How It Works
            </div>
            <h2 style={{ fontSize: 'clamp(24px,2.8vw,40px)', fontWeight: 900, color: '#0F172A', lineHeight: 1.14, letterSpacing: '-.03em', margin: 0 }}>
              Get started in 3 simple steps.
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 32, position: 'relative' }}>
            {/* Connector line */}
            <div aria-hidden style={{ position: 'absolute', top: 40, left: '16.67%', right: '16.67%', height: 2, background: 'linear-gradient(90deg,#BFDBFE,#99F6E4,#BBF7D0)', zIndex: 0 }} />

            {[
              { step: '01', icon: Users,       color: '#1D4ED8', bg: '#EFF6FF', border: '#BFDBFE', title: 'Register an Account',    desc: 'Sign up with your email in under 60 seconds. No credit card required to start.' },
              { step: '02', icon: BookOpen,     color: '#0D9488', bg: '#F0FDFA', border: '#99F6E4', title: 'Choose Your Plan',       desc: 'Pick the free Starter plan or upgrade to Pro for full access to all benefits.' },
              { step: '03', icon: TrendingUp,   color: '#059669', bg: '#F0FDF4', border: '#BBF7D0', title: 'Unlock & Accelerate',    desc: 'Access resources, join the community, attend events, and fast-track your HR career.' },
            ].map(({ step, icon: Icon, color, bg, border, title, desc }) => (
              <div key={step} style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
                {/* Icon circle */}
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: bg, border: `2px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 4px 20px rgba(15,23,42,.06)' }}>
                  <Icon style={{ width: 32, height: 32, color }} />
                </div>
                <div style={{ display: 'inline-block', padding: '2px 10px', borderRadius: 50, background: bg, border: `1px solid ${border}`, marginBottom: 14 }}>
                  <span style={{ fontSize: 10, fontWeight: 800, color, letterSpacing: '.14em' }}>STEP {step}</span>
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', lineHeight: 1.3, letterSpacing: '-.018em', margin: '0 0 10px' }}>{title}</h3>
                <p style={{ fontSize: 14, color: '#64748B', lineHeight: 1.8, margin: 0, maxWidth: 260, marginLeft: 'auto', marginRight: 'auto' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          BOTTOM CTA BANNER
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section style={{ background: '#F8FAFC', padding: '0 0 88px' }}>
        <div className="container">
          <div style={{ borderRadius: 24, background: 'linear-gradient(130deg,#0B1629 0%,#0F172A 50%,#0D1F3A 100%)', border: '1px solid rgba(255,255,255,.07)', overflow: 'hidden', position: 'relative' }}>
            <div aria-hidden className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,.028) 1px,transparent 1px)', backgroundSize: '24px 24px' }} />
            <div aria-hidden className="absolute" style={{ top: -60, right: -40, width: 380, height: 380, background: 'radial-gradient(circle,rgba(29,78,216,.18) 0%,transparent 65%)' }} />
            <div aria-hidden className="absolute" style={{ bottom: -40, left: '30%', width: 280, height: 280, background: 'radial-gradient(circle,rgba(13,148,136,.1) 0%,transparent 65%)' }} />
            {/* Top accent */}
            <div aria-hidden style={{ height: 2, background: 'linear-gradient(90deg,#1D4ED8,#D97706,#14B8A6)' }} />

            <div style={{ padding: '60px 56px', position: 'relative', zIndex: 10, textAlign: 'center' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 50, background: 'rgba(245,158,11,.12)', border: '1px solid rgba(245,158,11,.28)', marginBottom: 22 }}>
                <Shield style={{ width: 12, height: 12, color: '#F59E0B' }} />
                <span style={{ fontSize: 11, fontWeight: 800, color: '#FCD34D', letterSpacing: '.18em', textTransform: 'uppercase' }}>Start Free Today</span>
              </div>

              <h2 style={{ fontSize: 'clamp(26px,3.2vw,44px)', fontWeight: 900, color: '#fff', lineHeight: 1.12, letterSpacing: '-.032em', marginBottom: 18 }}>
                Ready to accelerate your HR career?
              </h2>
              <p style={{ fontSize: 16, color: '#94A3B8', lineHeight: 1.82, maxWidth: 520, margin: '0 auto 36px' }}>
                Join 5,000+ HR professionals who transformed their careers with Recruitment Institute membership. No risk, no commitment to start.
              </p>

              <div className="sm-cta-btns" style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 28 }}>
                <Link href="/student-login" className="sm-cta-red">
                  Join Free Now <ArrowRight style={{ width: 16, height: 16 }} />
                </Link>
                <a href="https://wa.me/917385204165" target="_blank" rel="noopener noreferrer" className="sm-cta-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <WhatsAppIcon size={16} color="#25D366" /> WhatsApp Us
                </a>
              </div>

              {/* Micro-trust row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, flexWrap: 'wrap' }}>
                {['No credit card required', 'Cancel anytime', 'Free Starter plan forever'].map((t) => (
                  <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <CheckCircle2 style={{ width: 13, height: 13, color: '#5EEAD4' }} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#64748B' }}>{t}</span>
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

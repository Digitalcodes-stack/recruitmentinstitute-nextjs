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
const defaultBenefits = [
  {
    icon: BookOpen,
    title: 'Premium Resources',
    desc: 'Access exclusive study materials, JD templates, sourcing scripts, and recruiter toolkits curated by industry experts.',
    color: '#1D4ED8',
    bg: '#EFF6FF',
    border: '#BFDBFE',
    tag: '200+ Resources',
  },
  {
    icon: Users,
    title: 'Community Access',
    desc: 'Connect, collaborate, and grow alongside 500+ active HR professionals, recruiters, and peers in your city and online.',
    color: '#0D9488',
    bg: '#F0FDFA',
    border: '#99F6E4',
    tag: '500+ Members',
  },
  {
    icon: Briefcase,
    title: 'Career Support',
    desc: 'Get dedicated placement assistance, resume reviews, mock interviews, and one-on-one career guidance sessions.',
    color: '#DC2626',
    bg: '#FEF2F2',
    border: '#FECACA',
    tag: '95% Placed',
  },
  {
    icon: GraduationCap,
    title: 'Certification',
    desc: 'Earn industry-recognised certificates trusted by 200+ hiring companies across India. Verifiable, shareable, valuable.',
    color: '#7C3AED',
    bg: '#F5F3FF',
    border: '#DDD6FE',
    tag: 'Industry Verified',
  },
  {
    icon: Lightbulb,
    title: 'Knowledge Base',
    desc: 'Unlock a curated HR knowledge repository - articles, case studies, interview frameworks, and hiring playbooks.',
    color: '#D97706',
    bg: '#FFFBEB',
    border: '#FDE68A',
    tag: '1,000+ Articles',
  },
  {
    icon: CalendarDays,
    title: 'Webinars & Events',
    desc: 'Receive exclusive invitations to live webinars, HR conclaves, hiring fairs, and industry networking events.',
    color: '#059669',
    bg: '#F0FDF4',
    border: '#BBF7D0',
    tag: 'Monthly Events',
  },
]

/* â"€â"€â"€ Testimonials â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€ */
const defaultTestimonials = [
  {
    name: 'Priya Sharma',
    role: 'HR Executive, TCS',
    avatar: '/assets/images/team/style2/1.jpg',
    text: 'The membership community alone is worth it. I found my current job through a connection I made in the RI community forums within 3 weeks of joining.',
    rating: 5,
  },
  {
    name: 'Rahul Mehta',
    role: 'Senior Recruiter, Infosys',
    avatar: '/assets/images/team/style2/3.jpg',
    text: 'The premium resources and JD templates saved me hours every week. The certification added real credibility to my LinkedIn profile.',
    rating: 5,
  },
  {
    name: 'Sneha Kulkarni',
    role: 'Talent Acquisition, Wipro',
    avatar: '/assets/images/team/style2/5.jpg',
    text: 'Career support here is genuine. My mock interview feedback was detailed, honest, and helped me nail my next role in under a month.',
    rating: 5,
  },
]

/* â"€â"€â"€ Plans â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€ */
const defaultPlans = [
  {
    name: 'Starter',
    price: 'Free',
    period: '',
    desc: 'Perfect for exploring HR fundamentals and getting a feel for the community.',
    color: '#64748B',
    bg: '#F8FAFC',
    border: '#E2E8F0',
    cta: 'Get Started',
    ctaBg: '#0F172A',
    features: ['Community forum access', 'Basic knowledge articles', 'Monthly newsletter', 'Job board access'],
    highlight: false,
  },
  {
    name: 'Pro Member',
    price: '₹999',
    period: '/ month',
    desc: 'The full membership experience - for serious HR professionals ready to accelerate.',
    color: '#1D4ED8',
    bg: '#EFF6FF',
    border: '#1D4ED8',
    cta: 'Join Now',
    ctaBg: 'linear-gradient(135deg,#1D4ED8,#2563EB)',
    features: ['All Starter benefits', 'Premium 200+ resources', 'Placement assistance', 'Monthly live webinars', 'Certification included', 'Priority career support', '1-on-1 mentor sessions'],
    highlight: true,
  },
  {
    name: 'Annual',
    price: '₹7,999',
    period: '/ year',
    desc: 'Best value - save 33% and unlock everything Pro has to offer for a full year.',
    color: '#059669',
    bg: '#F0FDF4',
    border: '#059669',
    cta: 'Go Annual',
    ctaBg: 'linear-gradient(135deg,#059669,#10B981)',
    features: ['All Pro benefits', '2 months free', 'Annual recognition award', 'Priority event seats', 'Exclusive HR conclave', 'Alumni network access'],
    highlight: false,
  },
]

export default async function StudentMembershipPage() {
  const [activeMembers, testimonials, courseFees, knowledgeCount] = await Promise.all([
    prisma.subscriber.count({ where: { isActive: true } }),
    prisma.testimonial.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      take: 3,
    }),
    prisma.courseFee.findMany({
      include: { category: true },
      orderBy: { id: 'asc' },
      take: 3,
    }),
    prisma.knowledgeItem.count(),
  ])

  const benefits = defaultBenefits.map((b, index) => ({
    ...b,
    tag:
      index === 0
        ? `${knowledgeCount}+ Resources`
        : index === 1
        ? `${activeMembers.toLocaleString('en-IN')}+ Members`
        : index === 2
        ? 'Placement Support'
        : index === 3
        ? 'Industry Verified'
        : index === 4
        ? 'Knowledge Base'
        : 'Monthly Events',
  }))

  const plans = courseFees.length > 0
    ? courseFees.map((fee, idx) => ({
        name: fee.courseName,
        price: fee.finalTotal ? `₹${Number(fee.finalTotal).toLocaleString('en-IN')}` : 'Contact Us',
        period: '',
        desc: fee.category?.name || 'Recruitment-focused program',
        color: ['#64748B', '#1D4ED8', '#059669'][idx] || '#7C3AED',
        bg: ['#F8FAFC', '#EFF6FF', '#F0FDF4'][idx] || '#F5F3FF',
        border: ['#E2E8F0', '#1D4ED8', '#059669'][idx] || '#DDD6FE',
        cta: 'Enroll Now',
        ctaBg: idx === 1 ? 'linear-gradient(135deg,#1D4ED8,#2563EB)' : 'linear-gradient(135deg,#059669,#10B981)',
        features: [
          fee.fees ? `Original fee ₹${Number(fee.fees).toLocaleString('en-IN')}` : 'Original fee available on request',
          fee.discount ? `Discount ₹${Number(fee.discount).toLocaleString('en-IN')}` : 'Seasonal offers',
          fee.category?.name || 'HR training',
          'Placement-oriented learning',
        ],
        highlight: idx === 1,
      }))
    : defaultPlans

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
                <Link href="/candidate-login" className="sm-hero-cta">
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
            {[
              { icon: Users,      val: '5,000+', lbl: 'Active Members',       color: '#1D4ED8', bg: '#EFF6FF', border: '#BFDBFE' },
              { icon: Award,      val: '10+ Yrs', lbl: 'Industry Experience',  color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
              { icon: TrendingUp, val: '95%',    lbl: 'Placement Success',     color: '#059669', bg: '#F0FDF4', border: '#BBF7D0' },
              { icon: BadgeCheck, val: '200+',   lbl: 'Hiring Partners',       color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE' },
            ].map(({ icon: Icon, val, lbl, color, bg, border }) => (
              <div key={lbl} style={{ background: '#fff', borderRadius: 16, border: '1.5px solid #E2E8F0', padding: '24px 20px', boxShadow: '0 2px 14px rgba(15,23,42,.05)', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <div style={{ width: 44, height: 44, borderRadius: 11, background: bg, border: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                  <Icon style={{ width: 20, height: 20, color }} />
                </div>
                <p style={{ fontSize: 'clamp(24px,2.2vw,34px)', fontWeight: 900, color, margin: 0, letterSpacing: '-.03em', lineHeight: 1, whiteSpace: 'nowrap' }}>{val}</p>
                <div style={{ width: 22, height: 2, borderRadius: 2, background: color, opacity: .28, margin: '8px 0' }} />
                <p style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '.11em', margin: 0, lineHeight: 1.5 }}>{lbl}</p>
              </div>
            ))}
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
                    <span style={{ fontSize: 12, fontWeight: 700, color: b.color }}>Learn more</span>
                    <ArrowRight style={{ width: 13, height: 13, color: b.color }} />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Primary CTAs */}
          <div style={{ textAlign: 'center' }}>
            <div className="sm-cta-btns" style={{ display: 'inline-flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
              <Link href="/candidate-login" style={{
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

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          MEMBERSHIP PLANS
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section style={{ background: '#fff', padding: '88px 0 96px', borderTop: '1px solid #E2E8F0' }}>
        <div className="container">

          {/* Header */}
          <div style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto 60px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 15px', borderRadius: 50, background: '#F0FDF4', border: '1px solid #BBF7D0', color: '#059669', fontSize: 11, fontWeight: 800, letterSpacing: '.18em', textTransform: 'uppercase', marginBottom: 18 }}>
              <Zap style={{ width: 11, height: 11 }} />
              Membership Plans
            </div>
            <h2 style={{ fontSize: 'clamp(26px,3vw,42px)', fontWeight: 900, color: '#0F172A', lineHeight: 1.14, letterSpacing: '-.03em', margin: '0 0 16px' }}>
              Choose the right plan for you.
            </h2>
            <p style={{ fontSize: 16, color: '#64748B', lineHeight: 1.8, margin: 0 }}>
              Start free and upgrade when you&apos;re ready. No hidden fees, cancel anytime.
            </p>
          </div>

          {/* Plan cards */}
          <div className="sm-plans-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 22 }}>
            {plans.map((plan) => (
              <div key={plan.name} className={`sm-plan${plan.highlight ? ' featured' : ''}`} style={{ border: `1.5px solid ${plan.highlight ? '#1D4ED8' : '#E2E8F0'}`, boxShadow: plan.highlight ? '0 8px 40px rgba(29,78,216,.18)' : undefined }}>

                {/* Featured ribbon */}
                {plan.highlight && (
                  <div style={{ background: 'linear-gradient(135deg,#1D4ED8,#2563EB)', padding: '8px 0', textAlign: 'center' }}>
                    <span style={{ fontSize: 10, fontWeight: 800, color: '#fff', letterSpacing: '.18em', textTransform: 'uppercase' }}>Most Popular</span>
                  </div>
                )}

                {/* Plan header */}
                <div style={{ padding: '30px 28px 24px', borderBottom: '1px solid #F1F5F9', background: plan.bg }}>
                  <p style={{ fontSize: 12, fontWeight: 800, color: plan.color, textTransform: 'uppercase', letterSpacing: '.16em', margin: '0 0 10px' }}>{plan.name}</p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 12 }}>
                    <span style={{ fontSize: 'clamp(30px,3vw,42px)', fontWeight: 900, color: '#0F172A', letterSpacing: '-.04em', lineHeight: 1 }}>{plan.price}</span>
                    {plan.period && <span style={{ fontSize: 14, color: '#64748B', fontWeight: 600 }}>{plan.period}</span>}
                  </div>
                  <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.7, margin: 0 }}>{plan.desc}</p>
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
                  {plan.highlight ? (
                    <Link href="/candidate-login" className="sm-plan-cta" style={{ background: plan.ctaBg as string }}>
                      {plan.cta} <ArrowRight style={{ width: 15, height: 15 }} />
                    </Link>
                  ) : (
                    <Link href="/candidate-login" className="sm-plan-cta-outline">
                      {plan.cta} <ArrowRight style={{ width: 15, height: 15 }} />
                    </Link>
                  )}
                </div>
              </div>
            ))}
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
                <Link href="/candidate-login" className="sm-cta-red">
                  Join Free Now <ArrowRight style={{ width: 16, height: 16 }} />
                </Link>
                <a href="https://wa.me/917385204165" target="_blank" rel="noopener noreferrer" className="sm-cta-outline">
                  <MessageCircle style={{ width: 15, height: 15 }} /> WhatsApp Us
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

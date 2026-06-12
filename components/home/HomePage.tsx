'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  CheckCircle2, Star,
  Users, BookOpen, Award, TrendingUp, ArrowRight,
  Phone, GraduationCap,
  BadgeCheck, Clock, Layers, PlayCircle
} from 'lucide-react'
import EnquiryModal from './EnquiryModal'
import homeStudentsBanner from '../../public/assets/images/banner/home9.jpg'

/* â"€â"€â"€ Data â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€ */

const defaultCourses = [
  {
    id: 1,
    title: 'End-to-End Recruitment Training',
    badge: 'Most Popular',
    badgeCls: 'bg-red-500 text-white',
    level: 'Advanced / Professional',
    duration: '3 Months',
    desc: 'Master the complete recruitment lifecycle "" from sourcing strategies and boolean search to offer negotiation and onboarding across all industry domains.',
    href: '/end-to-end-recruitment-training',
    image: '/assets/images/courses/main-home/1.jpg',
    bar: 'from-red-500 to-red-700',
    highlights: ['Boolean Search & LinkedIn', 'ATS Tools & Sourcing', 'All Industry Domains'],
  },
  {
    id: 2,
    title: 'HR Courses for Beginners',
    badge: 'Beginner Friendly',
    badgeCls: 'bg-blue-600 text-white',
    level: 'Foundational',
    duration: '6 Weeks',
    desc: 'Perfect for freshers and career switchers. Build strong foundations in HR, recruitment basics, resume screening, and human resource management.',
    href: '/hr-courses-for-beginners',
    image: '/assets/images/courses/main-home/2.jpg',
    bar: 'from-blue-500 to-blue-700',
    highlights: ['HR Fundamentals', 'Recruitment Basics', 'Resume Screening'],
  },
  {
    id: 3,
    title: 'HR Entrepreneurship Program',
    badge: 'Business Track',
    badgeCls: 'bg-emerald-600 text-white',
    level: 'Advanced / Business',
    duration: '2 Months',
    desc: 'Learn to start and grow your own recruitment consultancy or HR agency. Master client acquisition, billing strategies, and operational scaling.',
    href: '/hr-entrepreneurship-program',
    image: '/assets/images/courses/home8/3.jpg',
    bar: 'from-emerald-500 to-emerald-700',
    highlights: ['Agency Setup', 'Client Acquisition', 'Pricing Strategy'],
  },
  {
    id: 4,
    title: 'HR Corporate Training',
    badge: 'Enterprise',
    badgeCls: 'bg-purple-600 text-white',
    level: 'Tailored / Executive',
    duration: 'Flexible',
    desc: 'Custom corporate training for HR teams and organisations. Improve internal recruitment processes, reduce time-to-hire, and enhance quality of hires.',
    href: '/hr-corporate-training-course',
    image: '/assets/images/courses/home8/1.jpg',
    bar: 'from-purple-500 to-purple-700',
    highlights: ['Team Assessment', 'Process Optimisation', 'ATS Implementation'],
  },
]

const defaultStats = [
  { icon: 'users', value: '5,000+', label: 'Professionals Trained', iconBg: '#EFF6FF', iconColor: '#1D4ED8' },
  { icon: 'book', value: '4', label: 'Premium Programs', iconBg: '#F5F3FF', iconColor: '#7C3AED' },
  { icon: 'award', value: '10+ Yrs', label: 'Industry Expertise', iconBg: '#FFFBEB', iconColor: '#D97706' },
  { icon: 'trending', value: '95%', label: 'Placement Success', iconBg: '#F0FDF4', iconColor: '#16A34A' },
]

const whyUs = [
  { icon: <BadgeCheck className="w-6 h-6" />, title: 'Expert Instructors', desc: 'Learn from active industry recruiters and HR professionals with real corporate experience.', iconBg: '#EFF6FF', iconColor: '#1D4ED8' },
  { icon: <Layers className="w-6 h-6" />, title: 'Comprehensive Syllabus', desc: 'Every module maps to real-world workflows "" no placeholders, no outdated theory.', iconBg: '#F5F3FF', iconColor: '#7C3AED' },
  { icon: <PlayCircle className="w-6 h-6" />, title: '100% Practical Focus', desc: 'Work with live ATS platforms, boolean search strings, and real-world recruitment cases.', iconBg: '#F0FDF4', iconColor: '#16A34A' },
  { icon: <GraduationCap className="w-6 h-6" />, title: 'Placement Assistance', desc: 'Receive mock interview coaching, resume reviews, and partner company referrals.', iconBg: '#FFFBEB', iconColor: '#D97706' },
  { icon: <Clock className="w-6 h-6" />, title: 'Flexible Batches', desc: 'Weekday and weekend batches designed for working professionals and students alike.', iconBg: '#FFF1F2', iconColor: '#E11D48' },
  { icon: <Award className="w-6 h-6" />, title: 'Industry Certificate', desc: 'Earn a recognised certification that demonstrates your HR and recruitment expertise.', iconBg: '#F0F9FF', iconColor: '#0284C7' },
]

const process = [
  { n: '01', title: 'Choose Your Course', desc: 'Browse our programs and select the one that best fits your career goals and experience level.' },
  { n: '02', title: 'Enroll & Register', desc: 'Fill out the enquiry form or WhatsApp us. Our counsellors will guide you through admissions.' },
  { n: '03', title: 'Learn & Practice', desc: 'Attend live sessions, complete hands-on projects, and practice on real ATS tools and job portals.' },
  { n: '04', title: 'Get Certified & Placed', desc: 'Earn your certificate, build your HR resume, and get placement assistance through our network.' },
]

const defaultTestimonials = [
  {
    name: 'Poonam Pol', role: 'HR Executive', company: 'Tech Startup, Pune', initial: 'P',
    grad: 'from-red-500 to-rose-600',
    text: 'The End-to-End Recruitment Training completely transformed my career. The practical approach "" boolean searching, ATS exposure "" helped me land an HR Specialist role in less than 2 months.',
  },
  {
    name: 'Rahul Sharma', role: 'Recruitment Consultant', company: 'Independent Agency', initial: 'R',
    grad: 'from-blue-500 to-blue-700',
    text: 'Outstanding curriculum! The HR Entrepreneurship program gave me a clear roadmap to start my own agency. The client billing and business development guidance was worth every rupee.',
  },
  {
    name: 'Priya Desai', role: 'HR Talent Partner', company: 'MNC, Bangalore', initial: 'P',
    grad: 'from-emerald-500 to-teal-600',
    text: 'The corporate upskilling program helped standardise our entire talent acquisition workflow. Our average cost-to-hire decreased significantly while retention metrics improved.',
  },
  {
    name: 'Amit Kulkarni', role: 'Senior Recruiter', company: 'IT Firm, Pune', initial: 'A',
    grad: 'from-purple-500 to-purple-700',
    text: 'I switched from sales to HR after completing the Beginners program. The trainers were incredibly patient and the practical exercises gave me the confidence to start my HR career.',
  },
]

/* â"€â"€â"€ Component â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€ */

interface ServiceItem { id: number; title: string; description: string; image: string; slug: string }
interface ExpertItem { id: number; name: string; profession: string; image: string; category: string }
interface ClientItem { id: number; name: string; logo: string; website: string }

interface HomePageProps {
  courses?: typeof defaultCourses
  stats?: typeof defaultStats
  testimonials?: typeof defaultTestimonials
  services?: ServiceItem[]
  experts?: ExpertItem[]
  clients?: ClientItem[]
}

export default function HomePage({ courses: courseData, stats: statData, testimonials: testimonialData, services: serviceData, experts: expertData, clients: clientData }: HomePageProps) {
  const courses = courseData?.length ? courseData : defaultCourses
  const stats = statData?.length ? statData : defaultStats
  const testimonials = testimonialData?.length ? testimonialData : defaultTestimonials
  const services = serviceData ?? []
  const experts = expertData ?? []
  const clients = clientData ?? []
  const [enquiryOpen, setEnquiryOpen] = useState(false)

  return (
    <>
      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          HERO
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="relative overflow-hidden" style={{ background: '#ffffff', minHeight: '92vh', display: 'flex', alignItems: 'center' }}>

        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0" style={{ height: 4, background: 'linear-gradient(90deg,#1E40AF 0%,#6366F1 35%,#0EA5E9 65%,#10B981 100%)' }} />

        {/* Diagonal split bg "" right half */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0" style={{ background: '#F8FAFC', clipPath: 'polygon(52% 0,100% 0,100% 100%,44% 100%)' }} />
        </div>

        {/* Subtle grid */}
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(30,64,175,0.035) 1px,transparent 1px),linear-gradient(90deg,rgba(30,64,175,0.035) 1px,transparent 1px)', backgroundSize: '60px 60px' }} />

        {/* Glow orbs */}
        <div className="absolute pointer-events-none" style={{ top: '-80px', right: '30%', width: 500, height: 500, background: 'radial-gradient(circle,rgba(99,102,241,0.10) 0%,transparent 70%)' }} />
        <div className="absolute pointer-events-none" style={{ bottom: '0', left: '-60px', width: 400, height: 400, background: 'radial-gradient(circle,rgba(16,185,129,0.07) 0%,transparent 70%)' }} />

        <div className="container relative z-10 w-full" style={{ paddingTop: '80px', paddingBottom: '96px' }}>
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">

            {/* â"€â"€ LEFT â"€â"€ */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

              {/* Eyebrow pill */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', alignSelf: 'flex-start', padding: '7px 18px', borderRadius: '50px', border: '1.5px solid #DBEAFE', background: '#EFF6FF' }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#2563EB', display: 'inline-block', boxShadow: '0 0 0 3px rgba(37,99,235,0.18)' }} />
                <span style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#1D4ED8' }}>India&apos;s #1 Recruitment Academy</span>
              </div>

              {/* Headline */}
              <div>
                <h1 style={{ fontSize: 'clamp(38px,4.8vw,64px)', fontWeight: 900, lineHeight: 1.06, letterSpacing: '-0.04em', color: '#0F172A', marginBottom: '0' }}>
                  Launch Your
                </h1>
                <h1 style={{ fontSize: 'clamp(38px,4.8vw,64px)', fontWeight: 900, lineHeight: 1.06, letterSpacing: '-0.04em', margin: 0, background: 'linear-gradient(90deg,#1E40AF 0%,#6366F1 50%,#0EA5E9 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  HR &amp; Recruitment
                </h1>
                <h1 style={{ fontSize: 'clamp(38px,4.8vw,64px)', fontWeight: 900, lineHeight: 1.06, letterSpacing: '-0.04em', color: '#0F172A', marginTop: '0' }}>
                  Career Today.
                </h1>
              </div>

              {/* Sub */}
              <p style={{ fontSize: '17px', color: '#475569', lineHeight: 1.8, maxWidth: '500px' }}>
                India&apos;s most practical recruitment training "" boolean search, ATS tools, sourcing strategy, and real placement support. From freshers to entrepreneurs.
              </p>

              {/* Trust chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {[
                  { label: '5,000+ Graduates', color: '#1E40AF', bg: '#EFF6FF', border: '#BFDBFE' },
                  { label: '95% Placement Rate', color: '#059669', bg: '#F0FDF4', border: '#A7F3D0' },
                  { label: 'Industry Certificate', color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE' },
                  { label: 'Live + Online Batches', color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
                ].map((chip) => (
                  <span key={chip.label} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '50px', background: chip.bg, border: `1.5px solid ${chip.border}`, fontSize: '12px', fontWeight: 700, color: chip.color }}>
                    <CheckCircle2 style={{ width: 13, height: 13 }} />
                    {chip.label}
                  </span>
                ))}
              </div>

              {/* CTAs */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', paddingTop: '4px' }}>
                <Link href="/courses"
                  className="inline-flex items-center gap-2.5 font-bold text-white transition-all duration-200 hover:-translate-y-0.5"
                  style={{ background: 'linear-gradient(135deg,#1E40AF,#2563EB,#3B82F6)', padding: '16px 38px', borderRadius: '14px', fontSize: '16px', boxShadow: '0 10px 32px rgba(30,64,175,0.38)', letterSpacing: '-0.01em' }}>
                  Explore Courses <ArrowRight className="w-5 h-5" />
                </Link>
                <button onClick={() => setEnquiryOpen(true)}
                  className="inline-flex items-center gap-2.5 font-bold transition-all duration-200 hover:-translate-y-0.5 cursor-pointer border-0"
                  style={{ background: '#0F172A', color: 'white', padding: '16px 38px', borderRadius: '14px', fontSize: '16px', boxShadow: '0 8px 24px rgba(15,23,42,0.20)' }}>
                  <Phone className="w-5 h-5" /> Free Callback
                </button>
              </div>

              {/* Social proof strip */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', paddingTop: '6px' }}>
                <div style={{ display: 'flex' }}>
                  {['#F59E0B','#1D4ED8','#10B981','#7C3AED','#DC2626'].map((c, i) => (
                    <div key={i} style={{ width: 34, height: 34, borderRadius: '50%', background: c, border: '2.5px solid white', marginLeft: i === 0 ? 0 : -10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '11px', boxShadow: '0 2px 8px rgba(0,0,0,0.14)' }}>
                      {['P','R','A','S','M'][i]}
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{ display: 'flex', gap: '2px', marginBottom: '2px' }}>
                    {[...Array(5)].map((_,i) => <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}
                  </div>
                  <p style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>Trusted by <strong style={{ color: '#0F172A' }}>5,000+</strong> HR professionals</p>
                </div>
              </div>
            </div>

            {/* â"€â"€ RIGHT â"€â"€ */}
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>

              {/* Decorative ring behind image */}
              <div className="absolute pointer-events-none" style={{ inset: '-28px', borderRadius: '32px', border: '1.5px dashed rgba(99,102,241,0.20)' }} />

              {/* Main image */}
              <div style={{ position: 'relative', width: '100%', maxWidth: '580px', borderRadius: '28px', overflow: 'hidden', boxShadow: '0 40px 100px rgba(15,23,42,0.18), 0 0 0 1px rgba(30,64,175,0.08)', aspectRatio: '4/3' }}>
                <Image src={homeStudentsBanner} alt="HR Training students" fill className="object-cover object-center" priority sizes="(max-width: 1024px) 90vw, 580px" />
                {/* Gradient overlay bottom */}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(15,23,42,0.50) 0%,rgba(15,23,42,0.10) 45%,transparent 100%)' }} />

                {/* Bottom-left info badge on image */}
                <div style={{ position: 'absolute', bottom: 20, left: 20, background: 'rgba(255,255,255,0.96)', borderRadius: '14px', padding: '14px 18px', display: 'flex', gap: '12px', alignItems: 'center', backdropFilter: 'blur(10px)', boxShadow: '0 8px 28px rgba(0,0,0,0.15)' }}>
                  <div style={{ width: 42, height: 42, borderRadius: '10px', background: 'linear-gradient(135deg,#1E40AF,#3B82F6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <GraduationCap style={{ width: 22, height: 22, color: 'white' }} />
                  </div>
                  <div>
                    <p style={{ fontWeight: 900, fontSize: '18px', color: '#0F172A', lineHeight: 1 }}>5,000+</p>
                    <p style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, marginTop: '3px' }}>Graduates Placed</p>
                  </div>
                </div>
              </div>

              {/* Floating card "" top right */}
              <div style={{ position: 'absolute', top: -22, right: -18, background: 'white', borderRadius: '18px', padding: '16px 20px', boxShadow: '0 16px 48px rgba(0,0,0,0.14)', border: '1px solid #E2E8F0', minWidth: '170px', zIndex: 10 }}>
                <div style={{ display: 'flex', gap: '3px', marginBottom: '6px' }}>
                  {[...Array(5)].map((_,i) => <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}
                </div>
                <p style={{ fontWeight: 800, fontSize: '17px', color: '#0F172A', lineHeight: 1 }}>4.9 / 5.0</p>
                <p style={{ fontSize: '11px', color: '#64748B', fontWeight: 500, marginTop: '4px' }}>200+ Google Reviews</p>
              </div>

              {/* Floating card "" bottom right */}
              <div style={{ position: 'absolute', bottom: -22, right: -18, background: 'linear-gradient(135deg,#1E40AF,#4F46E5)', borderRadius: '18px', padding: '16px 20px', boxShadow: '0 16px 48px rgba(30,64,175,0.32)', minWidth: '160px', zIndex: 10 }}>
                <p style={{ fontWeight: 900, fontSize: '22px', color: 'white', lineHeight: 1 }}>95%</p>
                <p style={{ fontSize: '11px', color: 'rgba(219,234,254,0.90)', fontWeight: 600, marginTop: '4px' }}>Placement Success</p>
                <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.20)', borderRadius: '2px', marginTop: '10px', overflow: 'hidden' }}>
                  <div style={{ width: '95%', height: '100%', background: '#34D399', borderRadius: '2px' }} />
                </div>
              </div>

              {/* Vertical label "" far right edge */}
              <div className="hidden xl:flex" style={{ position: 'absolute', right: -52, top: '50%', transform: 'translateY(-50%) rotate(90deg)', gap: '6px', alignItems: 'center' }}>
                <span style={{ width: 24, height: 1.5, background: '#CBD5E1', display: 'block' }} />
                <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.18em', color: '#94A3B8', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Since 2014</span>
                <span style={{ width: 24, height: 1.5, background: '#CBD5E1', display: 'block' }} />
              </div>
            </div>

          </div>

          {/* â"€â"€ BOTTOM TRUST BAR â"€â"€ */}
          <div style={{ marginTop: '72px', paddingTop: '40px', borderTop: '1px solid #E2E8F0', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0' }}>
            {[
              { icon: <Users className="w-5 h-5" />, value: '5,000+', label: 'Professionals Trained', color: '#1E40AF', bg: '#EFF6FF' },
              { icon: <Award className="w-5 h-5" />, value: '10+ Years', label: 'Industry Experience', color: '#7C3AED', bg: '#F5F3FF' },
              { icon: <BookOpen className="w-5 h-5" />, value: '4 Programs', label: 'Expert Courses', color: '#0284C7', bg: '#F0F9FF' },
              { icon: <TrendingUp className="w-5 h-5" />, value: '95%', label: 'Placement Rate', color: '#059669', bg: '#F0FDF4' },
            ].map((item, i, arr) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '0 40px', borderRight: i < arr.length - 1 ? '1px solid #E2E8F0' : 'none' }}>
                <div style={{ width: 46, height: 46, borderRadius: '12px', background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.color, flexShrink: 0 }}>
                  {item.icon}
                </div>
                <div>
                  <p style={{ fontWeight: 900, fontSize: '22px', color: '#0F172A', lineHeight: 1, letterSpacing: '-0.02em' }}>{item.value}</p>
                  <p style={{ fontSize: '12px', color: '#64748B', fontWeight: 600, marginTop: '3px' }}>{item.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          STATS BAR
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      {/* CLIENT LOGOS MARQUEE — only rendered when DB has data */}
      {clients.length > 0 && (
        <section style={{ background: '#F8FAFF', borderTop: '1px solid #E8EDF5', borderBottom: '1px solid #E8EDF5', padding: '22px 0', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ flexShrink: 0, padding: '0 28px 0 36px', borderRight: '1.5px solid #E2E8F0' }}>
              <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#94A3B8', whiteSpace: 'nowrap', margin: 0, lineHeight: 1.6 }}>
                Our Alumni<br /><span style={{ color: '#2563EB' }}>Work At</span>
              </p>
            </div>
            <div style={{ flex: 1, overflow: 'hidden', maskImage: 'linear-gradient(to right,transparent 0%,black 8%,black 92%,transparent 100%)', WebkitMaskImage: 'linear-gradient(to right,transparent 0%,black 8%,black 92%,transparent 100%)' }}>
              <div style={{ display: 'flex', gap: 52, alignItems: 'center', animation: 'marqueeScroll 30s linear infinite', width: 'max-content' }}>
                {[...clients, ...clients].map((c, i) => {
                  const src = c.logo.startsWith('http') ? c.logo : `/${c.logo.replace(/^\/+/, '')}`
                  const imgEl = <img key={i} src={src} alt={c.name} style={{ height: 34, maxWidth: 120, objectFit: 'contain', display: 'block' }} />
                  return c.website ? (
                    <a key={i} href={c.website} target="_blank" rel="noopener noreferrer" title={c.name}
                      style={{ flexShrink: 0, opacity: 0.72, transition: 'opacity 0.2s' }}
                      onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                      onMouseLeave={e => (e.currentTarget.style.opacity = '0.72')}>
                      {imgEl}
                    </a>
                  ) : <div key={i} style={{ flexShrink: 0, opacity: 0.72 }}>{imgEl}</div>
                })}
              </div>
            </div>
          </div>
          <style>{`@keyframes marqueeScroll{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}`}</style>
        </section>
      )}

      <section className="bg-white" style={{ borderBottom: '1px solid #E2E8F0' }}>
        <div className="container">
          <div className="grid grid-cols-2 lg:grid-cols-4">
            {stats.map((s, i) => (
              <div key={i}
                className="flex flex-col sm:flex-row items-center gap-5 transition-colors hover:bg-slate-50 group"
                style={{ padding: '36px 24px', borderRight: i < 3 ? '1px solid #E2E8F0' : undefined }}>
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-200"
                  style={{ background: s.iconBg, color: s.iconColor }}>
                  {s.icon === 'users' && <Users className="w-7 h-7" />}
                  {s.icon === 'book' && <BookOpen className="w-7 h-7" />}
                  {s.icon === 'award' && <Award className="w-7 h-7" />}
                  {s.icon === 'trending' && <TrendingUp className="w-7 h-7" />}
                </div>
                <div className="text-center sm:text-left">
                  <div className="font-extrabold tracking-tight" style={{ fontSize: '32px', color: '#0F172A', lineHeight: 1 }}>{s.value}</div>
                  <div className="font-semibold uppercase tracking-wider mt-2" style={{ fontSize: '11px', color: '#64748B' }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          COURSE CARDS
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section style={{ padding: '100px 0', background: '#F0F4FF', position: 'relative', overflow: 'hidden' }}>

        {/* Subtle background pattern */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(circle at 15% 50%, rgba(99,102,241,0.07) 0%, transparent 55%), radial-gradient(circle at 85% 15%, rgba(14,165,233,0.06) 0%, transparent 55%)',
        }} />
        {/* Dot grid */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(circle, rgba(99,102,241,0.12) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }} />

        <div className="container relative z-10">

          {/* Section header */}
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-16">
            <div style={{ maxWidth: '620px' }}>
              <div className="inline-flex items-center gap-2 mb-5" style={{
                padding: '7px 18px', borderRadius: '50px',
                background: '#EEF2FF', border: '1px solid #C7D2FE',
              }}>
                <BookOpen className="w-3.5 h-3.5" style={{ color: '#4F46E5' }} />
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#4F46E5', letterSpacing: '0.18em', textTransform: 'uppercase' }}>Our Training Programs</span>
              </div>
              <h2 style={{ fontSize: 'clamp(28px,3.5vw,46px)', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: '16px' }}>
                Choose Your Course With{' '}
                <span style={{ color: '#1E40AF' }}>
                  India&apos;s No.1 Institute
                </span>
              </h2>
              <p style={{ fontSize: '16px', color: '#475569', lineHeight: 1.8 }}>
                Practical, industry-ready programs designed for every career stage — from freshers to corporate leaders.
              </p>
            </div>
            <Link href="/courses"
              className="inline-flex items-center gap-2.5 font-bold shrink-0 transition-all duration-200 hover:-translate-y-0.5"
              style={{
                background: 'linear-gradient(135deg,#1E40AF,#4F46E5)',
                color: '#fff', padding: '14px 32px', borderRadius: '14px',
                fontSize: '14px', boxShadow: '0 8px 24px rgba(79,70,229,0.30)',
              }}>
              View All Programs <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Cards grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {courses.map((c, i) => {
              const accents = [
                { glow: 'rgba(220,38,38,0.18)',  light: '#FEF2F2', border: '#FECACA', solid: '#DC2626', grad: 'linear-gradient(135deg,#B91C1C,#DC2626)', num: '01' },
                { glow: 'rgba(14,165,233,0.18)', light: '#EFF6FF', border: '#BFDBFE', solid: '#1D4ED8', grad: 'linear-gradient(135deg,#1E40AF,#2563EB)', num: '02' },
                { glow: 'rgba(5,150,105,0.18)',  light: '#F0FDF4', border: '#BBF7D0', solid: '#059669', grad: 'linear-gradient(135deg,#047857,#059669)', num: '03' },
                { glow: 'rgba(124,58,237,0.18)', light: '#F5F3FF', border: '#DDD6FE', solid: '#7C3AED', grad: 'linear-gradient(135deg,#6D28D9,#7C3AED)', num: '04' },
              ]
              const a = accents[i] ?? accents[0]
              return (
                <article key={c.id} className="group flex flex-col relative overflow-hidden bg-white"
                  style={{
                    borderRadius: '24px',
                    border: `1.5px solid ${a.border}`,
                    boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
                    transition: 'transform 0.35s cubic-bezier(.22,.68,0,1.2), box-shadow 0.35s ease',
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.transform = 'translateY(-10px)'
                    el.style.boxShadow = `0 24px 60px -8px ${a.glow}, 0 4px 24px rgba(0,0,0,0.08)`
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.transform = 'translateY(0)'
                    el.style.boxShadow = '0 4px 24px rgba(0,0,0,0.06)'
                  }}
                >
                  {/* Top accent bar */}
                  <div style={{ height: '4px', background: a.grad }} />

                  {/* Image */}
                  <div className="relative overflow-hidden" style={{ aspectRatio: '16/10' }}>
                    <Image src={c.image} alt={c.title} fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width:640px) 100vw,(max-width:1024px) 50vw,25vw"
                    />
                    {/* Subtle overlay */}
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)' }} />

                    {/* Badge top-left */}
                    <div className="absolute top-3 left-3">
                      <span className={`font-extrabold uppercase ${c.badgeCls}`}
                        style={{ padding: '4px 10px', borderRadius: '8px', fontSize: '9px', letterSpacing: '0.1em', boxShadow: '0 2px 8px rgba(0,0,0,0.25)' }}>
                        {c.badge}
                      </span>
                    </div>

                    {/* Number chip top-right */}
                    <div className="absolute top-3 right-3" style={{
                      width: 30, height: 30, borderRadius: '50%',
                      background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(6px)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '10px', fontWeight: 900, color: a.solid,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                    }}>{a.num}</div>

                    {/* Duration bottom-right */}
                    <div className="absolute bottom-3 right-3 flex items-center gap-1.5"
                      style={{ background: 'rgba(255,255,255,0.92)', borderRadius: '50px', padding: '4px 10px', backdropFilter: 'blur(4px)' }}>
                      <Clock className="w-3 h-3" style={{ color: a.solid }} />
                      <span style={{ fontSize: '10px', fontWeight: 700, color: '#1E293B' }}>{c.duration}</span>
                    </div>
                  </div>

                  {/* Card body */}
                  <div className="flex flex-col flex-1" style={{ padding: '22px' }}>

                    {/* Level label */}
                    <span style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: a.solid, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '8px' }}>
                      {c.level}
                    </span>

                    {/* Title */}
                    <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', lineHeight: 1.3, letterSpacing: '-0.01em', marginBottom: '10px' }}>
                      {c.title}
                    </h3>

                    {/* Description */}
                    <p style={{
                      fontSize: '12.5px', color: '#64748B', lineHeight: 1.7, marginBottom: '16px',
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    }}>
                      {c.desc}
                    </p>

                    {/* Highlights */}
                    <div className="flex flex-col gap-2 flex-1" style={{ marginBottom: '20px' }}>
                      {c.highlights.map((h) => (
                        <div key={h} className="flex items-center gap-2.5">
                          <span style={{
                            width: 20, height: 20, borderRadius: '6px', flexShrink: 0,
                            background: a.light, border: `1px solid ${a.border}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <CheckCircle2 className="w-3 h-3" style={{ color: a.solid }} />
                          </span>
                          <span style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>{h}</span>
                        </div>
                      ))}
                    </div>

                    {/* CTA */}
                    <Link href={c.href}
                      className="group/btn flex items-center justify-center gap-2 font-bold w-full"
                      style={{
                        padding: '12px 20px', borderRadius: '12px',
                        background: a.grad,
                        color: '#fff', fontSize: '13px',
                        boxShadow: `0 4px 16px -4px ${a.glow}`,
                        transition: 'opacity 0.2s',
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.88' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1' }}
                    >
                      Explore Program
                      <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover/btn:translate-x-1" />
                    </Link>
                  </div>
                </article>
              )
            })}
          </div>

          {/* Bottom trust strip */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6"
            style={{ marginTop: '56px', padding: '20px 32px', borderRadius: '16px', background: '#fff', border: '1.5px solid #E2E8F0', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
            <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
              {[
                { icon: <GraduationCap className="w-4 h-4" />, text: '5,000+ Graduates' },
                { icon: <BadgeCheck className="w-4 h-4" />, text: 'Industry Certificate' },
                { icon: <PlayCircle className="w-4 h-4" />, text: 'Live Online Sessions' },
              ].map(({ icon, text }) => (
                <div key={text} className="flex items-center gap-2">
                  <span style={{ color: '#4F46E5' }}>{icon}</span>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>{text}</span>
                </div>
              ))}
            </div>
            <p style={{ fontSize: '13px', color: '#94A3B8', fontWeight: 500, whiteSpace: 'nowrap' }}>Online &amp; Offline Batches Available</p>
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          WHY CHOOSE US
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section style={{ padding: '90px 0', background: '#ffffff' }}>
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Left */}
            <div>
              <span style={{ display: 'block', fontSize: '11px', fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#1D4ED8', marginBottom: '12px' }}>
                Why Choose Us
              </span>
              <h2 style={{ fontSize: 'clamp(26px,3vw,42px)', fontWeight: 700, color: '#0F172A', letterSpacing: '-0.025em', lineHeight: 1.2, marginBottom: '16px' }}>
                The Career Advantage
              </h2>
              <div style={{ width: 56, height: 4, background: 'linear-gradient(135deg,#1E40AF,#2563EB)', borderRadius: 2, marginBottom: '24px' }} />
              <p style={{ fontSize: '17px', color: '#64748B', lineHeight: 1.8, marginBottom: '40px', maxWidth: '520px' }}>
                At Recruitment Institute, we replace theoretical lectures with practical recruiter labs. Our goal is to prepare you for real team workloads on day one.
              </p>

              <div className="grid sm:grid-cols-2 gap-5">
                {whyUs.map((f, i) => (
                  <div key={i} className="flex gap-4 items-start group cursor-default">
                    <div className="rounded-2xl flex items-center justify-center shrink-0 transition-all duration-200"
                      style={{ width: 52, height: 52, background: f.iconBg, color: f.iconColor }}>
                      {f.icon}
                    </div>
                    <div>
                      <h4 style={{ fontWeight: 700, color: '#0F172A', fontSize: '14px', marginBottom: '6px', lineHeight: 1.3 }}>{f.title}</h4>
                      <p style={{ color: '#64748B', fontSize: '13px', lineHeight: 1.65 }}>{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-4" style={{ marginTop: '40px' }}>
                <button onClick={() => setEnquiryOpen(true)}
                  className="inline-flex items-center gap-2 font-bold text-white rounded-xl transition-all duration-200 hover:-translate-y-0.5 cursor-pointer border-0"
                  style={{ background: 'linear-gradient(135deg,#1E40AF,#2563EB)', padding: '16px 36px', fontSize: '15px', boxShadow: '0 6px 24px rgba(30,64,175,0.30)' }}>
                  Enquire Now <ArrowRight className="w-5 h-5" />
                </button>
                <a href="https://wa.me/917385204165" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 font-bold text-white rounded-xl transition-all hover:-translate-y-0.5"
                  style={{ background: '#25D366', padding: '16px 28px', fontSize: '14px', boxShadow: '0 4px 16px rgba(37,211,102,0.30)' }}>
                  <WhatsAppIcon /> WhatsApp Us
                </a>
              </div>
            </div>

            {/* Right "" dark promo panel */}
            <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg,#0F172A,#1E293B)', borderRadius: '28px', padding: '48px', boxShadow: '0 24px 70px rgba(15,23,42,0.25)' }}>
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none" style={{ background: 'rgba(30,64,175,0.15)', filter: 'blur(60px)' }} />
              <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full pointer-events-none" style={{ background: 'rgba(239,68,68,0.08)', filter: 'blur(60px)' }} />
              <div className="absolute top-0 inset-x-0 h-1" style={{ background: 'linear-gradient(90deg,#1E40AF,#3B82F6,#1E40AF)' }} />

              <div className="relative z-10 flex flex-col gap-7">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg,#1E40AF,#2563EB)', boxShadow: '0 8px 24px rgba(30,64,175,0.40)' }}>
                  <TrophyIcon />
                </div>

                <div>
                  <h3 style={{ fontSize: '24px', fontWeight: 800, color: 'white', marginBottom: '14px', lineHeight: 1.3 }}>
                    Begin Your Learning Path Today
                  </h3>
                  <p style={{ color: '#94A3B8', lineHeight: 1.75, fontSize: '15px' }}>
                    Join a network of 5,000+ HR graduates placing in specialised roles across India. Master modern ATS tools, sourcing, and build your recruiter career.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {[['5,000+','Students Trained'],['95%','Placement Rate'],['10+ Yrs','Of Excellence'],['4','Expert Courses']].map(([v, l]) => (
                    <div key={l} className="border border-white/10 rounded-2xl" style={{ background: 'rgba(255,255,255,0.06)', padding: '18px' }}>
                      <div style={{ fontSize: '24px', fontWeight: 800, color: '#F59E0B', lineHeight: 1 }}>{v}</div>
                      <div style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 500, marginTop: '6px' }}>{l}</div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-4 border border-white/10 rounded-2xl" style={{ background: 'rgba(255,255,255,0.06)', padding: '18px' }}>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_,i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, color: 'white', fontSize: '15px' }}>4.9 / 5.0 Rating</p>
                    <p style={{ color: '#64748B', fontSize: '12px', marginTop: '2px' }}>Based on 200+ Google reviews</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          HOW IT WORKS
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section style={{ padding: '90px 0', background: '#F8FAFC' }}>
        <div className="container">
          <div className="text-center" style={{ marginBottom: '64px' }}>
            <span style={{ display: 'block', fontSize: '11px', fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#1D4ED8', marginBottom: '12px' }}>
              Simple Process
            </span>
            <h2 style={{ fontSize: 'clamp(26px,3vw,42px)', fontWeight: 700, color: '#0F172A', letterSpacing: '-0.025em', lineHeight: 1.2, marginBottom: '16px' }}>
              How It Works
            </h2>
            <div style={{ width: 56, height: 4, background: 'linear-gradient(135deg,#1E40AF,#2563EB)', borderRadius: 2, margin: '0 auto' }} />
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {/* Connecting line */}
            <div className="hidden lg:block absolute"
              style={{ top: '35px', left: '12.5%', right: '12.5%', height: '1px', background: 'linear-gradient(90deg,transparent,#BFDBFE,transparent)' }} />

            {process.map((p, i) => (
              <div key={i} className="group flex flex-col items-center text-center gap-5 relative transition-transform duration-300 hover:-translate-y-2">
                <div className="flex items-center justify-center font-extrabold text-white z-10 relative transition-shadow duration-300"
                  style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg,#1E40AF,#2563EB)', fontSize: '22px', boxShadow: '0 8px 24px rgba(30,64,175,0.35)' }}>
                  {p.n}
                </div>
                <div className="bg-white w-full transition-all duration-300 group-hover:border-blue-100"
                  style={{ borderRadius: '20px', border: '1px solid #E2E8F0', padding: '24px 20px', boxShadow: '0 8px 24px rgba(0,0,0,0.07)' }}>
                  <h3 style={{ fontWeight: 700, color: '#0F172A', fontSize: '15px', marginBottom: '10px' }}>{p.title}</h3>
                  <p style={{ color: '#64748B', fontSize: '13px', lineHeight: 1.7 }}>{p.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center" style={{ marginTop: '56px' }}>
            <button onClick={() => setEnquiryOpen(true)}
              className="inline-flex items-center gap-2 font-bold text-white rounded-xl transition-all duration-200 hover:-translate-y-0.5 cursor-pointer border-0"
              style={{ background: 'linear-gradient(135deg,#1E40AF,#2563EB)', padding: '16px 40px', fontSize: '15px', boxShadow: '0 6px 24px rgba(30,64,175,0.30)' }}>
              Get Started Today <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          TESTIMONIALS
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      {/* SERVICES */}
      {services.length > 0 && (
        <section style={{ padding: '96px 0', background: '#fff' }}>
          <div className="container">

            {/* ── Section Header ── */}
            <div style={{ textAlign: 'center', marginBottom: 60 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 100, padding: '6px 18px', marginBottom: 16 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#2563EB', display: 'inline-block' }} />
                <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase' as const, color: '#1D4ED8' }}>What We Offer</span>
              </div>
              <h2 style={{ fontSize: 'clamp(28px,3.2vw,44px)', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.03em', lineHeight: 1.15, margin: '0 0 14px' }}>
                Our Services
              </h2>
              <p style={{ fontSize: 16, color: '#64748B', lineHeight: 1.7, maxWidth: 520, margin: '0 auto' }}>
                End-to-end HR &amp; recruitment solutions designed to accelerate your career and your organisation.
              </p>
            </div>

            {/* ── Cards ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 28 }}>
              {services.map((s, i) => {
                const accents  = ['#1D4ED8','#7C3AED','#059669','#DC2626','#D97706','#0891B2']
                const lightBgs = ['#EFF6FF','#F5F3FF','#F0FDF4','#FEF2F2','#FFFBEB','#ECFEFF']
                const fallbackImgs = [
                  '/assets/images/banner/home9.jpg',          // office team working
                  '/assets/images/about/tab2.jpg',             // team collaborating at laptop
                  '/assets/images/about/tab1.jpg',             // students at laptop
                  '/assets/images/bg/about-bg.jpg',            // professional on phone
                  '/assets/images/bg/main-home.jpg',           // writing/studying
                  '/assets/images/breadcrumbs/5.jpg',          // students studying
                ]
                const acc = accents[i % accents.length]
                const lbg = lightBgs[i % lightBgs.length]
                const src = s.image
                  ? (s.image.startsWith('http') ? s.image : `/${s.image.replace(/^\/+/, '')}`)
                  : fallbackImgs[i % fallbackImgs.length]

                return (
                  <div
                    key={s.id}
                    style={{ background: '#fff', borderRadius: 20, border: '1px solid #E8EDF5', overflow: 'hidden', boxShadow: '0 2px 16px rgba(0,0,0,0.06)', transition: 'transform 0.22s, box-shadow 0.22s' }}
                    onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.transform = 'translateY(-6px)'; el.style.boxShadow = '0 16px 48px rgba(0,0,0,0.12)' }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.transform = 'translateY(0)'; el.style.boxShadow = '0 2px 16px rgba(0,0,0,0.06)' }}
                  >
                    {/* Image */}
                    <div style={{ position: 'relative', height: 200, overflow: 'hidden' }}>
                      <img src={src} alt={s.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.4s' }}
                        onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
                        onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')} />
                      {/* Accent bar at bottom of image */}
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 4, background: acc }} />
                      {/* Number badge */}
                      <div style={{ position: 'absolute', top: 14, right: 14, width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}>
                        <span style={{ fontSize: 12, fontWeight: 800, color: acc }}>{String(i + 1).padStart(2, '0')}</span>
                      </div>
                    </div>

                    {/* Body */}
                    <div style={{ padding: '26px 28px 28px' }}>
                      {/* Icon circle */}
                      <div style={{ width: 46, height: 46, borderRadius: 14, background: lbg, border: `1.5px solid ${acc}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                        <span style={{ fontSize: 20, fontWeight: 900, color: acc }}>{s.title.charAt(0)}</span>
                      </div>

                      <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', lineHeight: 1.3, margin: '0 0 10px' }}>
                        {s.title}
                      </h3>

                      {s.description && (
                        <p style={{ fontSize: 13.5, color: '#64748B', lineHeight: 1.75, margin: '0 0 20px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>
                          {s.description}
                        </p>
                      )}

                      {/* Bottom row */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 16, borderTop: `1px solid ${acc}18` }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: acc, textTransform: 'uppercase' as const, letterSpacing: '0.12em' }}>Learn More</span>
                        <div style={{ width: 30, height: 30, borderRadius: '50%', background: lbg, border: `1.5px solid ${acc}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6h8M6 2l4 4-4 4" stroke={acc} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* EXPERTS */}
      {experts.length > 0 && (
        <section style={{ padding: '80px 0', background: '#fff' }}>
          <div className="container">
            <div className="text-center" style={{ marginBottom: '52px' }}>
              <span className="inline-block font-bold uppercase"
                style={{ padding: '7px 18px', borderRadius: '50px', background: '#F5F3FF', border: '1px solid #DDD6FE', color: '#7C3AED', fontSize: '10px', letterSpacing: '0.18em', marginBottom: '14px' }}>
                Meet The Team
              </span>
              <h2 style={{ fontSize: 'clamp(24px,2.8vw,38px)', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                Our Expert Trainers
              </h2>
              <p style={{ color: '#64748B', fontSize: '16px', marginTop: '12px' }}>Learn from active industry professionals with real corporate experience.</p>
            </div>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {experts.map((e, i) => {
                const ecolors = ['#2563EB', '#7C3AED', '#059669', '#D97706', '#DB2777', '#0284C7', '#DC2626', '#0891B2']
                const ec = ecolors[i % ecolors.length]
                const initials = e.name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()
                return (
                  <div key={e.id} style={{ background: '#fff', border: '1px solid #E8ECF0', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', textAlign: 'center' }}>
                    <div style={{ height: 80, background: `linear-gradient(135deg,${ec}22,${ec}11)`, display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid #F1F5F9' }}>
                      {e.image ? (
                        <img src={e.image} alt={e.name} style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', border: `3px solid ${ec}44` }} />
                      ) : (
                        <div style={{ width: 56, height: 56, borderRadius: '50%', background: ec, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800, color: '#fff' }}>
                          {initials}
                        </div>
                      )}
                    </div>
                    <div style={{ padding: '16px 18px 20px' }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>{e.name}</p>
                      {e.profession && <p style={{ fontSize: 12, color: '#64748B', marginBottom: 8 }}>{e.profession}</p>}
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: `${ec}11`, color: ec, border: `1px solid ${ec}33` }}>
                        {e.category}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      <section style={{ background: '#F8FAFC', padding: '80px 0', borderTop: '1px solid #E2E8F0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: 620, margin: '0 auto 52px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 16px', borderRadius: 50, background: '#FFFBEB', border: '1px solid #FDE68A', color: '#D97706', fontSize: 11, fontWeight: 800, letterSpacing: '.18em', textTransform: 'uppercase' as const, marginBottom: 18 }}>
              <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> Alumni Reviews
            </div>
            <h2 style={{ fontSize: 'clamp(26px,3vw,42px)', fontWeight: 900, color: '#0F172A', lineHeight: 1.15, letterSpacing: '-.03em', margin: '0 0 14px' }}>
              What Our Students{' '}
              <span style={{ background: 'linear-gradient(120deg,#1D4ED8,#2563EB)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Say
              </span>
            </h2>
            <p style={{ fontSize: 15, color: '#64748B', lineHeight: 1.8, margin: 0 }}>
              Real stories from HR professionals and career switchers who trained with us.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {testimonials.map((t, i) => {
              const tColors = [
                { border: '#BFDBFE', badge: '#EFF6FF', accent: '#1D4ED8', top: '#1D4ED8' },
                { border: '#BBF7D0', badge: '#F0FDF4', accent: '#059669', top: '#059669' },
                { border: '#DDD6FE', badge: '#F5F3FF', accent: '#7C3AED', top: '#7C3AED' },
                { border: '#FDE68A', badge: '#FFFBEB', accent: '#D97706', top: '#D97706' },
              ]
              const c = tColors[i % tColors.length]
              return (
                <div key={i} style={{ background: '#fff', border: `1.5px solid ${c.border}`, borderRadius: 20, padding: '26px 24px', display: 'flex', flexDirection: 'column', gap: 14, boxShadow: '0 2px 12px rgba(15,23,42,.05)', position: 'relative', overflow: 'hidden', transition: 'transform .25s,box-shadow .25s' }}
                  className="hover:-translate-y-1">
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: c.top, borderRadius: '20px 20px 0 0' }} />
                  <div className="flex gap-1">
                    {[...Array(5)].map((_,j) => <Star key={j} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}
                  </div>
                  <p style={{ color: '#334155', fontSize: 13, lineHeight: 1.85, flex: 1, fontStyle: 'italic', margin: 0 }}>
                    &ldquo;{t.text}&rdquo;
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 14, borderTop: '1px solid #F1F5F9' }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: c.badge, border: `2px solid ${c.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 13, fontWeight: 800, color: c.accent }}>
                      {t.initial}
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, color: '#0F172A', fontSize: 13, lineHeight: 1.2, margin: 0 }}>{t.name}</p>
                      <p style={{ color: '#64748B', fontSize: 11, marginTop: 2, fontWeight: 500 }}>{t.role}</p>
                      <p style={{ color: c.accent, fontSize: 10, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginTop: 2 }}>{t.company}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 24, marginTop: 48, flexWrap: 'wrap' as const }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fff', border: '1.5px solid #BFDBFE', borderRadius: 16, padding: '14px 28px', boxShadow: '0 2px 10px rgba(15,23,42,.06)' }}>
              <div className="flex gap-1">
                {[...Array(5)].map((_,i) => <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />)}
              </div>
              <div style={{ width: 1, height: 30, background: '#E2E8F0' }} />
              <div>
                <p style={{ fontWeight: 800, color: '#0F172A', fontSize: 18, lineHeight: 1, margin: 0 }}>4.9 / 5.0</p>
                <p style={{ color: '#64748B', fontSize: 12, marginTop: 4, fontWeight: 500 }}>Based on 200+ Google reviews</p>
              </div>
            </div>
            <a href="/testimonials" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#EFF6FF', border: '1.5px solid #BFDBFE', color: '#1D4ED8', padding: '11px 24px', borderRadius: 12, fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
              View All Reviews →
            </a>
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          CTA BANNER
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section style={{ padding: '90px 0', position: 'relative', overflow: 'hidden' }}>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg,#1E40AF,#2563EB,#1D4ED8)' }} />
        <div className="absolute top-0 right-0 rounded-full pointer-events-none" style={{ width: 600, height: 600, background: 'rgba(255,255,255,0.08)', filter: 'blur(120px)' }} />
        <div className="absolute bottom-0 left-0 rounded-full pointer-events-none" style={{ width: 500, height: 500, background: 'rgba(0,0,0,0.10)', filter: 'blur(100px)' }} />

        <div className="container relative z-10 text-center flex flex-col items-center" style={{ gap: '32px' }}>
          <span className="inline-block font-bold uppercase border border-white/25"
            style={{ padding: '8px 24px', borderRadius: '50px', background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', color: 'white', fontSize: '11px', letterSpacing: '0.18em' }}>
            Next Batch Enrolling Now
          </span>

          <h2 style={{ fontSize: 'clamp(28px,4vw,52px)', fontWeight: 800, color: 'white', letterSpacing: '-0.03em', lineHeight: 1.15, maxWidth: '700px' }}>
            Start Your Recruitment Career Today
          </h2>

          <p style={{ color: 'rgba(219,234,254,0.90)', fontSize: '18px', lineHeight: 1.75, maxWidth: '560px' }}>
            Register today. Join our live recruiter training network, master modern screening models, and fast-track your HR career.
          </p>

          <div className="flex flex-wrap justify-center gap-5">
            <Link href="/courses"
              className="inline-flex items-center gap-2.5 font-bold rounded-xl transition-all duration-200 hover:-translate-y-0.5"
              style={{ background: 'white', color: '#1D4ED8', padding: '16px 40px', fontSize: '16px', boxShadow: '0 8px 30px rgba(0,0,0,0.15)' }}>
              Enroll Now <ArrowRight className="w-5 h-5" />
            </Link>
            <button onClick={() => setEnquiryOpen(true)}
              className="inline-flex items-center gap-2.5 font-bold text-white rounded-xl transition-all duration-200 hover:-translate-y-0.5 border-2 border-white/60 hover:bg-white hover:text-blue-700 cursor-pointer"
              style={{ padding: '16px 40px', fontSize: '16px' }}>
              <Phone className="w-5 h-5" /> Talk To Counsellor
            </button>
          </div>

          <div className="flex flex-wrap justify-center gap-8">
            {['100% Practical Training','Industry Certificate','Placement Support','Expert Mentors'].map((t) => (
              <span key={t} className="flex items-center gap-2 font-medium" style={{ color: 'rgba(219,234,254,0.85)', fontSize: '14px' }}>
                <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: 'rgba(255,255,255,0.80)' }} />
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      <EnquiryModal isOpen={enquiryOpen} onClose={() => setEnquiryOpen(false)} />
    </>
  )
}

function TrophyIcon() {
  return (
    <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 010-5H6" /><path d="M18 9h1.5a2.5 2.5 0 000-5H18" />
      <path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0012 0V2z" />
    </svg>
  )
}

function WhatsAppIcon() {
  return (
    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

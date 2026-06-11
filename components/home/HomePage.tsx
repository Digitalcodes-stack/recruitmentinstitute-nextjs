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

/* ─── Data ──────────────────────────────────────────────── */

const defaultCourses = [
  {
    id: 1,
    title: 'End-to-End Recruitment Training',
    badge: 'Most Popular',
    badgeCls: 'bg-red-500 text-white',
    level: 'Advanced / Professional',
    duration: '3 Months',
    desc: 'Master the complete recruitment lifecycle — from sourcing strategies and boolean search to offer negotiation and onboarding across all industry domains.',
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
  { icon: <Layers className="w-6 h-6" />, title: 'Comprehensive Syllabus', desc: 'Every module maps to real-world workflows — no placeholders, no outdated theory.', iconBg: '#F5F3FF', iconColor: '#7C3AED' },
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
    text: 'The End-to-End Recruitment Training completely transformed my career. The practical approach — boolean searching, ATS exposure — helped me land an HR Specialist role in less than 2 months.',
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

/* ─── Component ─────────────────────────────────────────── */

interface HomePageProps {
  courses?: typeof defaultCourses
  stats?: typeof defaultStats
  testimonials?: typeof defaultTestimonials
}

export default function HomePage({ courses: courseData, stats: statData, testimonials: testimonialData }: HomePageProps) {
  const courses = courseData?.length ? courseData : defaultCourses
  const stats = statData?.length ? statData : defaultStats
  const testimonials = testimonialData?.length ? testimonialData : defaultTestimonials
  const [enquiryOpen, setEnquiryOpen] = useState(false)

  return (
    <>
      {/* ═══════════════════════════════════════════════
          HERO
      ═══════════════════════════════════════════════ */}
      <section style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1a2744 50%, #0F172A 100%)' }}
        className="relative overflow-hidden min-h-[88vh] flex items-center">

        {/* Background glows */}
        <div className="absolute top-0 right-0 w-[700px] h-[700px] rounded-full opacity-10 pointer-events-none"
          style={{ background: '#1E40AF', filter: 'blur(130px)' }} />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full opacity-8 pointer-events-none"
          style={{ background: '#EF4444', filter: 'blur(120px)' }} />
        {/* Dot grid */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

        <div className="container relative z-10 py-20 lg:py-28 w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* Left */}
            <div className="flex flex-col gap-7">
              <div className="inline-flex items-center gap-2.5 self-start px-5 py-2.5 rounded-full border border-white/15 backdrop-blur-sm" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <span className="relative flex h-2.5 w-2.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400" />
                </span>
                <span className="text-amber-300 text-xs font-bold uppercase tracking-widest">India&apos;s #1 Recruitment Academy</span>
              </div>

              <h1 style={{ fontSize: 'clamp(36px,4.5vw,58px)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.03em', color: 'white' }}>
                Master Recruitment &{' '}
                <span style={{ background: 'linear-gradient(90deg, #60A5FA, #93C5FD, #60A5FA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  Build Your HR Career
                </span>
              </h1>

              <p className="text-slate-300 leading-relaxed max-w-xl" style={{ fontSize: '18px', lineHeight: '1.75' }}>
                Join India&apos;s premier recruitment training institute. From sourcing and boolean search to running your own HR agency — learn from industry leaders with live project expertise.
              </p>

              <div className="flex flex-wrap gap-x-6 gap-y-3">
                {['5,000+ Trained', '4 Expert Programs', '95% Placement Rate', 'Industry Certificate'].map((t) => (
                  <span key={t} className="flex items-center gap-2 text-slate-300 font-medium" style={{ fontSize: '14px' }}>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    {t}
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap gap-4 pt-2">
                <Link href="/courses"
                  className="inline-flex items-center gap-2 font-bold text-white rounded-xl transition-all duration-200 hover:-translate-y-0.5"
                  style={{ background: 'linear-gradient(135deg,#1E40AF,#2563EB)', padding: '16px 36px', fontSize: '16px', boxShadow: '0 8px 30px rgba(30,64,175,0.40)' }}>
                  Explore Courses <ArrowRight className="w-5 h-5" />
                </Link>
                <button onClick={() => setEnquiryOpen(true)}
                  className="inline-flex items-center gap-2 font-bold text-white rounded-xl transition-all duration-200 border-2 border-white/30 hover:border-white/60 hover:bg-white/10 cursor-pointer"
                  style={{ padding: '16px 36px', fontSize: '16px' }}>
                  <Phone className="w-5 h-5" /> Free Callback
                </button>
              </div>
            </div>

            {/* Right — image + floating stats */}
            <div className="relative flex items-center justify-center lg:justify-end">
              <div className="relative w-full max-w-[600px]">
                <div className="absolute -inset-4 rounded-[2.5rem] pointer-events-none"
                  style={{ background: 'linear-gradient(135deg,rgba(30,64,175,0.18),transparent)', filter: 'blur(40px)' }} />

                <div className="relative overflow-hidden border border-white/15 aspect-[16/10]"
                  style={{ borderRadius: '20px', boxShadow: '0 32px 80px rgba(0,0,0,0.50)' }}>
                  <Image src={homeStudentsBanner} alt="HR Training students" fill className="object-cover object-center" priority sizes="(max-width: 1024px) 90vw, 600px" />
                  <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(135deg,rgba(15,23,42,0.08),transparent,rgba(0,0,0,0.18))' }} />
                </div>

                {/* Badge top-left */}
                <div className="absolute -top-5 -left-5 bg-white flex items-center gap-3 z-10"
                  style={{ borderRadius: '16px', padding: '14px 18px', boxShadow: '0 12px 40px rgba(0,0,0,0.16)' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#EFF6FF' }}>
                    <Users className="w-5 h-5" style={{ color: '#1D4ED8' }} />
                  </div>
                  <div>
                    <p className="font-extrabold leading-none" style={{ fontSize: '20px', color: '#0F172A' }}>5,000+</p>
                    <p className="font-semibold mt-1" style={{ fontSize: '11px', color: '#64748B' }}>Alumni Placed</p>
                  </div>
                </div>

                {/* Badge bottom-right */}
                <div className="absolute -bottom-5 -right-5 flex items-center gap-3 z-10 border border-white/10"
                  style={{ background: '#0F172A', borderRadius: '16px', padding: '14px 18px', boxShadow: '0 12px 40px rgba(0,0,0,0.30)' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-xl shrink-0"
                    style={{ background: 'linear-gradient(135deg,#F59E0B,#F97316)' }}>★</div>
                  <div>
                    <p className="font-extrabold leading-none text-white" style={{ fontSize: '18px' }}>4.9 / 5</p>
                    <p className="font-semibold mt-1" style={{ fontSize: '11px', color: '#94A3B8' }}>Google Rating</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave bottom */}
        <div className="absolute bottom-0 left-0 right-0 bg-white" style={{ height: '60px', clipPath: 'ellipse(55% 100% at 50% 100%)' }} />
      </section>

      {/* ═══════════════════════════════════════════════
          STATS BAR
      ═══════════════════════════════════════════════ */}
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

      {/* ═══════════════════════════════════════════════
          COURSE CARDS
      ═══════════════════════════════════════════════ */}
      <section style={{ padding: '90px 0', background: '#F8FAFC' }}>
        <div className="container">

          {/* Header */}
          <div className="text-center mb-16" style={{ maxWidth: '760px', margin: '0 auto 64px' }}>
            <span className="inline-flex items-center gap-2 font-extrabold uppercase rounded-full mb-5"
              style={{ padding: '8px 20px', background: '#EFF6FF', border: '1px solid #BFDBFE', color: '#1D4ED8', fontSize: '11px', letterSpacing: '0.18em' }}>
              <BookOpen className="w-3.5 h-3.5" />
              Our Training Programs
            </span>
            <h2 style={{ fontSize: 'clamp(26px,3vw,42px)', fontWeight: 700, color: '#0F172A', letterSpacing: '-0.025em', lineHeight: 1.2, marginBottom: '16px' }}>
              Choose Your Course With India&apos;s{' '}
              <span style={{ color: '#1D4ED8' }}>No.1 Recruitment Training Institute</span>
            </h2>
            <div className="flex items-center justify-center gap-2 mb-5">
              <span style={{ width: 40, height: 4, background: '#1D4ED8', borderRadius: 2, display: 'block' }} />
              <span style={{ width: 12, height: 4, background: '#93C5FD', borderRadius: 2, display: 'block' }} />
              <span style={{ width: 6, height: 4, background: '#BFDBFE', borderRadius: 2, display: 'block' }} />
            </div>
            <p style={{ fontSize: '17px', color: '#64748B', lineHeight: 1.75 }}>
              Practical, industry-ready programs designed for every career stage — from freshers to corporate leaders.
            </p>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {courses.map((c) => (
              <article key={c.id} className="group flex flex-col bg-white overflow-hidden transition-all duration-300 hover:-translate-y-2"
                style={{ borderRadius: '20px', border: '1px solid #E2E8F0', boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}
                onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 24px 60px rgba(0,0,0,0.14)')}
                onMouseLeave={(e) => (e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.08)')}>

                {/* Accent bar */}
                <div className={`h-1.5 bg-gradient-to-r ${c.bar}`} />

                {/* Image */}
                <div className="relative w-full overflow-hidden bg-slate-100" style={{ aspectRatio: '4/3' }}>
                  <Image src={c.image} alt={c.title} fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width:640px) 100vw,(max-width:1024px) 50vw,25vw" />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top,rgba(0,0,0,0.35),transparent)' }} />
                  {/* Badge */}
                  <div className={`absolute top-4 left-4 font-extrabold uppercase ${c.badgeCls}`}
                    style={{ padding: '4px 12px', borderRadius: '8px', fontSize: '10px', letterSpacing: '0.08em', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
                    {c.badge}
                  </div>
                  {/* Duration */}
                  <div className="absolute bottom-4 right-4 flex items-center gap-1.5"
                    style={{ background: 'rgba(255,255,255,0.92)', borderRadius: '50px', padding: '4px 12px', backdropFilter: 'blur(4px)' }}>
                    <Clock className="w-3 h-3" style={{ color: '#1D4ED8' }} />
                    <span style={{ fontSize: '10px', fontWeight: 700, color: '#334155' }}>{c.duration}</span>
                  </div>
                </div>

                {/* Body */}
                <div className="flex flex-col flex-1" style={{ padding: '24px' }}>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '10px', display: 'block' }}>{c.level}</span>

                  <h3 className="group-hover:text-blue-700 transition-colors duration-200"
                    style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', lineHeight: 1.4, marginBottom: '12px' }}>
                    {c.title}
                  </h3>

                  <p className="flex-1" style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.7, marginBottom: '16px',
                    display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {c.desc}
                  </p>

                  {/* Highlights */}
                  <div className="flex flex-wrap gap-1.5" style={{ marginBottom: '16px' }}>
                    {c.highlights.map((h) => (
                      <span key={h} className="inline-flex items-center gap-1"
                        style={{ padding: '3px 10px', borderRadius: '50px', background: '#F8FAFC', border: '1px solid #E2E8F0', fontSize: '11px', fontWeight: 600, color: '#334155' }}>
                        <CheckCircle2 className="w-2.5 h-2.5 shrink-0" style={{ color: '#16A34A' }} />
                        {h}
                      </span>
                    ))}
                  </div>

                  {/* Learn more */}
                  <Link href={c.href} className="flex items-center justify-between group/link"
                    style={{ paddingTop: '16px', borderTop: '1px solid #E2E8F0', marginTop: 'auto' }}>
                    <span className="font-bold group-hover/link:text-blue-700 transition-colors" style={{ fontSize: '13px', color: '#0F172A' }}>
                      Learn More
                    </span>
                    <span className="flex items-center justify-center transition-all duration-200 group-hover/link:bg-blue-600 group-hover/link:text-white"
                      style={{ width: 36, height: 36, borderRadius: '50%', background: '#F1F5F9', color: '#1D4ED8', flexShrink: 0 }}>
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </Link>
                </div>
              </article>
            ))}
          </div>

          {/* CTA */}
          <div className="flex flex-col items-center" style={{ marginTop: '56px', gap: '12px' }}>
            <Link href="/courses"
              className="inline-flex items-center gap-2.5 font-bold text-white rounded-xl transition-all duration-200 hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(135deg,#1E40AF,#2563EB)', padding: '16px 40px', fontSize: '15px', boxShadow: '0 6px 24px rgba(30,64,175,0.30)' }}>
              Explore All Programs <ArrowRight className="w-5 h-5" />
            </Link>
            <p style={{ fontSize: '13px', color: '#94A3B8', fontWeight: 500 }}>Online &amp; Offline Batches Available</p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          WHY CHOOSE US
      ═══════════════════════════════════════════════ */}
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
                <a href="https://wa.me/919975048884" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 font-bold text-white rounded-xl transition-all hover:-translate-y-0.5"
                  style={{ background: '#25D366', padding: '16px 28px', fontSize: '14px', boxShadow: '0 4px 16px rgba(37,211,102,0.30)' }}>
                  <WhatsAppIcon /> WhatsApp Us
                </a>
              </div>
            </div>

            {/* Right — dark promo panel */}
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

      {/* ═══════════════════════════════════════════════
          HOW IT WORKS
      ═══════════════════════════════════════════════ */}
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

      {/* ═══════════════════════════════════════════════
          TESTIMONIALS
      ═══════════════════════════════════════════════ */}
      <section style={{ padding: '90px 0', background: 'linear-gradient(135deg,#0B1120,#111e35,#0B1120)', position: 'relative', overflow: 'hidden' }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="absolute top-0 left-1/4 rounded-full pointer-events-none" style={{ width: 500, height: 500, background: 'rgba(30,64,175,0.10)', filter: 'blur(100px)' }} />
        <div className="absolute bottom-0 right-1/4 rounded-full pointer-events-none" style={{ width: 400, height: 400, background: 'rgba(59,130,246,0.07)', filter: 'blur(100px)' }} />

        <div className="container relative z-10">
          <div className="text-center" style={{ marginBottom: '56px' }}>
            <span className="inline-block font-bold uppercase border border-white/15"
              style={{ padding: '8px 20px', borderRadius: '50px', background: 'rgba(255,255,255,0.08)', color: '#FCD34D', fontSize: '11px', letterSpacing: '0.18em', marginBottom: '16px' }}>
              Alumni Feedback
            </span>
            <h2 style={{ fontSize: 'clamp(26px,3vw,42px)', fontWeight: 700, color: 'white', letterSpacing: '-0.025em', lineHeight: 1.2, marginBottom: '16px' }}>
              What Our Students Say
            </h2>
            <div style={{ width: 56, height: 4, background: 'linear-gradient(135deg,#1E40AF,#3B82F6)', borderRadius: 2, margin: '0 auto' }} />
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {testimonials.map((t, i) => (
              <div key={i} className={`relative flex flex-col border border-white/10 overflow-hidden transition-all duration-300 hover:-translate-y-2 group`}
                style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '20px', padding: '28px', backdropFilter: 'blur(8px)' }}>
                <div className={`absolute top-0 inset-x-0 h-[3px] rounded-t-[20px] bg-gradient-to-r ${t.grad} opacity-80 group-hover:opacity-100 transition-opacity`} />
                <div className="absolute -top-2 -right-1 font-serif pointer-events-none select-none" style={{ fontSize: '7rem', lineHeight: 1, color: 'rgba(255,255,255,0.04)' }}>&ldquo;</div>

                <div className="flex gap-1 mb-5">
                  {[...Array(5)].map((_,j) => <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                </div>

                <p className="flex-1 relative z-10" style={{ color: '#CBD5E1', fontSize: '13px', lineHeight: 1.85, marginBottom: '20px' }}>
                  &ldquo;{t.text}&rdquo;
                </p>

                <div className="flex items-center gap-3 relative z-10" style={{ paddingTop: '18px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${t.grad} flex items-center justify-center font-extrabold text-white shrink-0`}
                    style={{ fontSize: '14px', boxShadow: '0 4px 12px rgba(0,0,0,0.25)', border: '2px solid rgba(255,255,255,0.10)' }}>
                    {t.initial}
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, color: 'white', fontSize: '14px', lineHeight: 1.2 }}>{t.name}</p>
                    <p style={{ color: '#64748B', fontSize: '12px', marginTop: '2px' }}>{t.role}</p>
                    <p style={{ color: '#F59E0B', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '2px' }}>{t.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center" style={{ marginTop: '48px' }}>
            <div className="inline-flex items-center gap-4 border border-white/10"
              style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '16px', padding: '16px 32px', backdropFilter: 'blur(8px)' }}>
              <div className="flex gap-1">
                {[...Array(5)].map((_,i) => <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />)}
              </div>
              <div style={{ width: 1, height: 32, background: 'rgba(255,255,255,0.12)' }} />
              <div>
                <p style={{ fontWeight: 800, color: 'white', fontSize: '18px', lineHeight: 1 }}>4.9 / 5.0</p>
                <p style={{ color: '#64748B', fontSize: '12px', marginTop: '4px', fontWeight: 500 }}>Based on 200+ Google reviews</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          CTA BANNER
      ═══════════════════════════════════════════════ */}
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

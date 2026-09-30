import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowRight, MessageCircle, Briefcase, Star, CheckCircle,
  GraduationCap, Award, ShieldCheck,
} from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { buildTrainerItem, slugifyName } from '@/lib/trainer-profile'
import { BASE_URL, generateBreadcrumbJsonLd, generateFaqJsonLd } from '@/lib/seo'

export const dynamic = 'force-dynamic'

// Real, live course routes a trainer's "coursesTaught" display title can link to.
// Only courses that actually exist as pages are linked — anything unrecognized
// renders as plain text instead of a dead link.
const COURSE_HREF_BY_TITLE: Record<string, string> = {
  'AI for Recruitment': '/ai-for-recruitment',
  'End-to-End Recruitment Training': '/end-to-end-recruitment-training',
  'HR Courses for Beginners': '/hr-courses-for-beginners',
  'Recruitment Career Starter': '/recruitment-career-starter',
  'Professional Recruitment Specialist': '/professional-recruitment-specialist',
  'Advanced Recruitment & TA Masterclass': '/advanced-recruitment-ta-masterclass',
  'Recruitment Business Accelerator': '/recruitment-business-accelerator',
  'Recruitment Business Growth Consulting': '/recruitment-business-growth-consulting',
  'HR Entrepreneurship Program': '/hr-entrepreneurship-program',
  'Corporate Recruitment Training': '/corporate-recruitment-training',
  'HR Corporate Training Course': '/hr-corporate-training-course',
}

async function getPublicTrainerBySlug(slug: string) {
  // Trainers created before slugs existed are matched by a slugified name so
  // links from the listing page never 404, but only if the row is published.
  const candidates = await prisma.trainer.findMany({ where: { isActive: true, isPublic: true } })
  return candidates.find((t) => (t.slug || slugifyName(t.name)) === slug) || null
}

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const trainer = await getPublicTrainerBySlug(slug)
  if (!trainer) return {}

  const item = buildTrainerItem(trainer)
  const title = `${item.name} — ${item.designation} | Recruitment Institute Faculty`
  const description = item.bio.length > 155 ? `${item.bio.slice(0, 152)}...` : item.bio
  const canonical = `${BASE_URL}/trainers/${slug}`
  const ogImage = item.image.startsWith('http') || item.image.startsWith('data:')
    ? item.image
    : `${BASE_URL}${item.image}`

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'profile',
      images: [{ url: ogImage, width: 1200, height: 630, alt: item.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  }
}

export default async function TrainerProfilePage({ params }: Props) {
  const { slug } = await params
  const trainer = await getPublicTrainerBySlug(slug)
  if (!trainer) notFound()

  const item = buildTrainerItem(trainer)
  const canonical = `${BASE_URL}/trainers/${slug}`
  const pj = (trainer.profileJson && typeof trainer.profileJson === 'object') ? (trainer.profileJson as Record<string, any>) : {}
  const faqs: Array<{ q: string; a: string }> = Array.isArray(pj.faqs) ? pj.faqs : []

  const personSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': `${canonical}#person`,
        name: item.name,
        jobTitle: item.designation,
        description: item.bio,
        image: item.image.startsWith('http') ? item.image : `${BASE_URL}${item.image}`,
        url: canonical,
        knowsAbout: item.specializationTags,
        sameAs: item.linkedinUrl ? [item.linkedinUrl] : undefined,
        worksFor: {
          '@type': 'EducationalOrganization',
          '@id': `${BASE_URL}/#organization`,
          name: 'Recruitment Institute',
          url: BASE_URL,
        },
      },
      generateBreadcrumbJsonLd([
        { name: 'Home', url: '/' },
        { name: 'Faculty & Trainers', url: '/trainers' },
        { name: item.name, url: `/trainers/${slug}` },
      ]),
      ...(faqs.length > 0 ? [generateFaqJsonLd(faqs)].filter(Boolean) : []),
    ],
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }} />

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section style={{ background: 'linear-gradient(180deg, #0A1628 0%, #0F213A 50%, #0A1628 100%)', color: '#FFFFFF', paddingTop: '90px', paddingBottom: '60px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 20px' }}>
          <nav style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '28px' }}>
            <Link href="/trainers" style={{ color: '#94A3B8', textDecoration: 'none' }}>Faculty &amp; Trainers</Link>
            <span style={{ margin: '0 8px' }}>/</span>
            <span style={{ color: '#E2E8F0' }}>{item.name}</span>
          </nav>

          <div style={{ display: 'flex', gap: '32px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', width: '160px', height: '160px', borderRadius: '20px', overflow: 'hidden', border: '3px solid rgba(255,255,255,0.15)', flexShrink: 0, background: '#1E293B' }}>
              {item.image.startsWith('data:') ? (
                <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
              ) : (
                <Image src={item.image} alt={item.name} fill sizes="160px" style={{ objectFit: 'cover', objectPosition: 'top' }} priority />
              )}
            </div>

            <div style={{ flex: 1, minWidth: '280px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '50px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#F87171', fontSize: '10.5px', fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: '12px' }}>
                <ShieldCheck style={{ width: '12px', height: '12px' }} />
                <span>Verified Faculty</span>
              </div>

              <h1 style={{ fontSize: 'clamp(26px, 4vw, 42px)', fontWeight: 900, color: '#FFFFFF', lineHeight: 1.15, margin: '0 0 10px' }}>
                {item.name}
              </h1>

              <p style={{ fontSize: '15px', fontWeight: 700, color: '#F87171', margin: '0 0 16px' }}>
                {item.designation}
              </p>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', fontSize: '12.5px', fontWeight: 700, color: '#94A3B8' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  <Briefcase style={{ width: '13px', height: '13px', color: '#F87171' }} /> {item.experienceYears}+ Years Experience
                </span>
                <span>•</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  <Star style={{ width: '13px', height: '13px', fill: '#FACC15', color: '#FACC15' }} /> {item.rating.toFixed(1)} Rating
                </span>
                <span>•</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  <GraduationCap style={{ width: '13px', height: '13px', color: '#34D399' }} /> {item.studentsMentored}+ Trained
                </span>
              </div>

              {item.linkedinUrl && (
                <a
                  href={item.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '16px', padding: '8px 16px', borderRadius: '10px', background: '#0A66C2', color: '#fff', fontSize: '12.5px', fontWeight: 700, textDecoration: 'none' }}
                >
                  <svg style={{ width: '13px', height: '13px', fill: 'currentColor' }} viewBox="0 0 24 24">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.64 1.64 0 1 0-.02-3.28 1.64 1.64 0 0 0 .02 3.28m1.39 9.74v-8.37H5.07v8.37h2.78Z" />
                  </svg>
                  <span>View LinkedIn Profile</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .trainer-profile-grid { display: grid; grid-template-columns: 1.6fr 1fr; gap: 40px; }
        @media (max-width: 860px) {
          .trainer-profile-grid { grid-template-columns: 1fr; }
        }
      `}</style>
      <div className="trainer-profile-grid" style={{ maxWidth: '1100px', margin: '0 auto', padding: '48px 20px' }}>
        {/* ── MAIN COLUMN ─────────────────────────────────────── */}
        <div>
          {/* Executive Background */}
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#0F172A', marginBottom: '14px' }}>Executive Background</h2>
            <div style={{ fontSize: '14.5px', color: '#334155', lineHeight: 1.8, whiteSpace: 'pre-line' }}>
              {item.longBio || item.bio}
            </div>
            {item.quote && (
              <blockquote style={{ marginTop: '20px', padding: '16px 20px', borderLeft: '3px solid #DC2626', background: '#FEF2F2', borderRadius: '0 12px 12px 0', fontSize: '14px', fontStyle: 'italic', color: '#334155' }}>
                “{item.quote}”
              </blockquote>
            )}
          </section>

          {/* Expertise Areas */}
          {item.specializationTags.length > 0 && (
            <section style={{ marginBottom: '40px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#0F172A', marginBottom: '14px' }}>Expertise Areas</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {item.specializationTags.map((tag, idx) => (
                  <span key={idx} style={{ padding: '6px 14px', borderRadius: '10px', background: '#fff', border: '1px solid #E2E8F0', color: '#334155', fontSize: '13px', fontWeight: 600 }}>
                    {tag}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Programs Taught */}
          {item.coursesTaught.length > 0 && (
            <section style={{ marginBottom: '40px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#0F172A', marginBottom: '14px' }}>Programs Taught</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                {item.coursesTaught.map((course, idx) => {
                  const href = COURSE_HREF_BY_TITLE[course]
                  const content = (
                    <div style={{ padding: '14px 16px', borderRadius: '12px', background: '#fff', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                      <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A' }}>{course}</span>
                      {href && <ArrowRight style={{ width: '14px', height: '14px', color: '#DC2626', flexShrink: 0 }} />}
                    </div>
                  )
                  return href ? (
                    <Link key={idx} href={href} style={{ textDecoration: 'none' }}>{content}</Link>
                  ) : (
                    <div key={idx}>{content}</div>
                  )
                })}
              </div>
            </section>
          )}

          {/* Certifications */}
          {item.certifications && item.certifications.length > 0 && (
            <section style={{ marginBottom: '40px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#0F172A', marginBottom: '14px' }}>Certifications &amp; Recognition</h2>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {item.certifications.map((cert, idx) => (
                  <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13.5px', color: '#334155' }}>
                    <Award style={{ width: '16px', height: '16px', color: '#D97706', flexShrink: 0, marginTop: '2px' }} />
                    <span>{cert}</span>
                  </li>
                ))}
              </ul>
              {item.accreditationHighlight && (
                <div style={{ marginTop: '14px', padding: '12px 16px', borderRadius: '10px', background: '#EFF6FF', border: '1px solid #BFDBFE', fontSize: '13px', color: '#1E3A8A' }}>
                  <CheckCircle style={{ width: '14px', height: '14px', display: 'inline', marginRight: '6px', color: '#2563EB', verticalAlign: '-2px' }} />
                  {item.accreditationHighlight.text}{' '}
                  {item.accreditationHighlight.link && (
                    <a href={item.accreditationHighlight.link} target="_blank" rel="noopener noreferrer" style={{ color: '#2563EB', fontWeight: 700 }}>
                      {item.accreditationHighlight.linkLabel || 'Verify'}
                    </a>
                  )}
                </div>
              )}
            </section>
          )}

          {/* FAQs — only rendered if Admin has actually added real FAQs for this trainer */}
          {faqs.length > 0 && (
            <section>
              <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#0F172A', marginBottom: '14px' }}>Frequently Asked Questions</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {faqs.map((faq, idx) => (
                  <div key={idx} style={{ padding: '16px 18px', borderRadius: '12px', background: '#fff', border: '1px solid #E2E8F0' }}>
                    <p style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', margin: '0 0 6px' }}>{faq.q}</p>
                    <p style={{ fontSize: '13.5px', color: '#475569', margin: 0, lineHeight: 1.6 }}>{faq.a}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* ── SIDEBAR CTA ─────────────────────────────────────── */}
        <aside>
          <div style={{ position: 'sticky', top: '90px', padding: '24px', borderRadius: '20px', background: '#0F172A', color: '#fff' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '8px' }}>Learn Directly From {item.name.split(' ')[0]}</h3>
            <p style={{ fontSize: '13px', color: '#94A3B8', lineHeight: 1.6, marginBottom: '20px' }}>
              Speak with our admissions counsellor to find the right program taught by this mentor.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Link
                href="/contact"
                style={{ padding: '12px 16px', borderRadius: '10px', background: 'linear-gradient(135deg, #DC2626 0%, #E63946 100%)', color: '#fff', fontWeight: 800, fontSize: '13px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                Talk to a Counsellor <ArrowRight style={{ width: '14px', height: '14px' }} />
              </Link>
              <Link
                href="/courses"
                style={{ padding: '12px 16px', borderRadius: '10px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontWeight: 700, fontSize: '13px', textDecoration: 'none', textAlign: 'center' }}
              >
                View All Courses
              </Link>
              <a
                href="https://wa.me/917385204165"
                target="_blank"
                rel="noopener noreferrer"
                style={{ padding: '12px 16px', borderRadius: '10px', background: '#059669', color: '#fff', fontWeight: 700, fontSize: '13px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <MessageCircle style={{ width: '14px', height: '14px' }} /> WhatsApp Admissions
              </a>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

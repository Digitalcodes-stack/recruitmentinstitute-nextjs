import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Star, Quote, ChevronRight, Users, Award, TrendingUp } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Student Testimonials - Recruitment Institute',
  description: 'Read what our alumni say about their HR and recruitment training experience at Recruitment Institute, Pune.',
}

export const revalidate = 3600

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

const avatarColors = [
  { bg: '#EFF6FF', border: '#BFDBFE', text: '#1E40AF' },
  { bg: '#F0FDF4', border: '#BBF7D0', text: '#059669' },
  { bg: '#FFF7ED', border: '#FED7AA', text: '#EA580C' },
  { bg: '#F5F3FF', border: '#DDD6FE', text: '#7C3AED' },
  { bg: '#FFF1F2', border: '#FECDD3', text: '#E11D48' },
  { bg: '#ECFEFF', border: '#A5F3FC', text: '#0891B2' },
  { bg: '#FFFBEB', border: '#FDE68A', text: '#D97706' },
  { bg: '#F0FDF4', border: '#A7F3D0', text: '#047857' },
]

export default async function TestimonialsPage() {
  const testimonials = await prisma.testimonial.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' },
  })

  const totalCount = testimonials.length
  const avgRating = totalCount
    ? (testimonials.reduce((s, t) => s + (t.rating || 5), 0) / totalCount).toFixed(1)
    : '5.0'

  return (
    <>
      {/* ── Hero ── */}
      <div style={{ background: 'linear-gradient(135deg,#0F172A 0%,#1a2744 60%,#0F172A 100%)', padding: '80px 0 100px', position: 'relative', overflow: 'hidden' }}>
        {/* dot grid */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle,rgba(255,255,255,0.04) 1px,transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="absolute top-0 left-0 pointer-events-none"
          style={{ width: 500, height: 500, background: 'rgba(30,64,175,0.12)', filter: 'blur(100px)', transform: 'translate(-30%,-20%)' }} />
        <div className="absolute bottom-0 right-0 pointer-events-none"
          style={{ width: 400, height: 400, background: 'rgba(124,58,237,0.10)', filter: 'blur(80px)', transform: 'translate(20%,20%)' }} />

        <div className="container relative z-10">
          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28, fontSize: 12, fontWeight: 600 }}>
            <Link href="/" style={{ color: '#64748B', textDecoration: 'none' }}>Home</Link>
            <ChevronRight style={{ width: 13, height: 13, color: '#475569' }} />
            <span style={{ color: '#94A3B8' }}>Testimonials</span>
          </div>

          <div style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 100, padding: '6px 18px', marginBottom: 20 }}>
              <Star style={{ width: 12, height: 12, color: '#F59E0B', fill: '#F59E0B' }} />
              <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase' as const, color: '#FCD34D' }}>Student Reviews</span>
            </div>

            <h1 style={{ fontSize: 'clamp(34px,4.5vw,56px)', fontWeight: 900, color: 'white', lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: 20 }}>
              What Our Alumni{' '}
              <span style={{ background: 'linear-gradient(135deg,#60A5FA,#818CF8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Say
              </span>
            </h1>

            <p style={{ fontSize: 17, color: '#94A3B8', lineHeight: 1.8, marginBottom: 40 }}>
              Real stories from HR professionals, freshers, and career switchers who trained with us and built successful recruitment careers.
            </p>

            {/* Stats row */}
            <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' as const, gap: 24 }}>
              {[
                { icon: Star, value: avgRating, label: 'Average Rating', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)' },
                { icon: Users, value: `${totalCount}+`, label: 'Reviews', color: '#60A5FA', bg: 'rgba(96,165,250,0.1)', border: 'rgba(96,165,250,0.2)' },
                { icon: TrendingUp, value: '95%', label: 'Placement Rate', color: '#34D399', bg: 'rgba(52,211,153,0.1)', border: 'rgba(52,211,153,0.2)' },
                { icon: Award, value: '5,000+', label: 'Trained', color: '#C084FC', bg: 'rgba(192,132,252,0.1)', border: 'rgba(192,132,252,0.2)' },
              ].map(({ icon: Icon, value, label, color, bg, border }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 20px', borderRadius: 50, background: bg, border: `1px solid ${border}` }}>
                  <Icon style={{ width: 14, height: 14, color, fill: label === 'Average Rating' ? color : 'none' }} />
                  <span style={{ fontSize: 14, fontWeight: 800, color }}>{value}</span>
                  <span style={{ fontSize: 12, color: '#64748B', fontWeight: 500 }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* bottom wave */}
        <div className="absolute bottom-0 left-0 right-0"
          style={{ background: '#F8FAFC', height: 56, clipPath: 'ellipse(55% 100% at 50% 100%)' }} />
      </div>

      {/* ── Testimonials Grid ── */}
      <section style={{ background: '#F8FAFC', padding: '80px 0' }}>
        <div className="container">

          {testimonials.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 24px', background: '#fff', borderRadius: 24, border: '1px solid #E2E8F0' }}>
              <div style={{ width: 64, height: 64, borderRadius: 18, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <Quote style={{ width: 28, height: 28, color: '#1E40AF' }} />
              </div>
              <p style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', marginBottom: 8 }}>No testimonials yet</p>
              <p style={{ fontSize: 14, color: '#64748B' }}>Check back soon - student reviews will appear here.</p>
            </div>
          ) : (
            <>
              <style>{`
                .testi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
                @media (max-width: 960px) { .testi-grid { grid-template-columns: repeat(2, 1fr); } }
                @media (max-width: 600px) { .testi-grid { grid-template-columns: 1fr; } }
              `}</style>
              <div className="testi-grid">
                {testimonials.map((t, i) => {
                  const col = avatarColors[i % avatarColors.length]
                  const name = t.author || 'Alumni'
                  const role = t.title || 'Student'
                  const text = t.description || ''
                  const rating = t.rating ?? 5
                  const imgSrc = t.image
                    ? (t.image.startsWith('http') ? t.image : `/${t.image.replace(/^\/+/, '')}`)
                    : null

                  return (
                    <div
                      key={t.id}
                      style={{
                        background: '#fff',
                        borderRadius: 20,
                        border: '1px solid #E8EDF5',
                        boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
                        padding: '28px 28px 24px',
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      {/* Quote icon */}
                      <div style={{ marginBottom: 16 }}>
                        <Quote style={{ width: 28, height: 28, color: col.text, opacity: 0.25, transform: 'rotate(180deg)' }} />
                      </div>

                      {/* Stars */}
                      <div style={{ display: 'flex', gap: 3, marginBottom: 14 }}>
                        {[...Array(5)].map((_, si) => (
                          <Star key={si} style={{ width: 14, height: 14, color: si < rating ? '#F59E0B' : '#E2E8F0', fill: si < rating ? '#F59E0B' : '#E2E8F0' }} />
                        ))}
                      </div>

                      {/* Text */}
                      {text && (
                        <p style={{ fontSize: 14.5, color: '#334155', lineHeight: 1.8, marginBottom: 22, fontStyle: 'italic', flex: 1 }}>
                          &ldquo;{text}&rdquo;
                        </p>
                      )}

                      {/* Divider */}
                      <div style={{ height: 1, background: '#F1F5F9', marginBottom: 18, marginTop: 'auto' }} />

                      {/* Author row */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {imgSrc ? (
                          <img src={imgSrc} alt={name} style={{ width: 46, height: 46, borderRadius: '50%', objectFit: 'cover' as const, border: `2px solid ${col.border}` }} />
                        ) : (
                          <div style={{ width: 46, height: 46, borderRadius: '50%', background: col.bg, border: `2px solid ${col.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <span style={{ fontSize: 14, fontWeight: 800, color: col.text }}>{getInitials(name)}</span>
                          </div>
                        )}
                        <div>
                          <p style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', lineHeight: 1.3 }}>{name}</p>
                          <p style={{ fontSize: 12, color: '#64748B', fontWeight: 500, marginTop: 2 }}>{role}</p>
                        </div>
                        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4, background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 50, padding: '3px 10px', flexShrink: 0 }}>
                          <Award style={{ width: 11, height: 11, color: '#059669' }} />
                          <span style={{ fontSize: 10, fontWeight: 700, color: '#059669', letterSpacing: '0.1em', textTransform: 'uppercase' as const }}>Verified</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}

          {/* ── CTA ── */}
          <div style={{ marginTop: 64, background: 'linear-gradient(135deg,#1E40AF,#2563EB)', borderRadius: 24, padding: '52px 48px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -60, right: -60, width: 280, height: 280, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: -40, left: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase' as const, color: '#BFDBFE', marginBottom: 12 }}>Join 5,000+ Alumni</p>
              <h2 style={{ fontSize: 'clamp(24px,3vw,38px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.2, marginBottom: 14 }}>
                Ready to write your own success story?
              </h2>
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.75)', lineHeight: 1.7, maxWidth: 480, margin: '0 auto 32px' }}>
                Join India&apos;s leading HR &amp; recruitment training institute and build skills that hiring managers actually want.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' as const, gap: 12 }}>
                <Link href="/courses" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fff', color: '#1E40AF', padding: '14px 28px', borderRadius: 14, fontSize: 14, fontWeight: 700, textDecoration: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
                  Explore Courses
                </Link>
                <Link href="/contact" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.12)', color: '#fff', padding: '14px 28px', borderRadius: 14, fontSize: 14, fontWeight: 600, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.2)' }}>
                  Talk to Admissions
                </Link>
              </div>
            </div>
          </div>

        </div>
      </section>
    </>
  )
}

import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import AdminLayout from '@/components/admin/AdminLayout'
import { Star, Quote, Plus, ToggleLeft, ToggleRight } from 'lucide-react'

export default async function AdminTestimonialsPage() {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin') redirect('/admin/login')

  const testimonials = await prisma.testimonial.findMany({ orderBy: { createdAt: 'desc' } })

  const active   = testimonials.filter((t) => t.isActive).length
  const inactive = testimonials.filter((t) => !t.isActive).length
  const avgRating = testimonials.length
    ? (testimonials.reduce((s, t) => s + t.rating, 0) / testimonials.length).toFixed(1)
    : '0.0'

  return (
    <AdminLayout title="Testimonials">
      {/* Page header */}
      <div className="flex items-start justify-between gap-6 mb-7" style={{ flexWrap: 'wrap' }}>
        <div>
          <div
            className="inline-flex items-center gap-2 rounded-full mb-3"
            style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '5px 13px', fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#b45309' }}
          >
            <Quote style={{ width: 11, height: 11 }} />
            Social Proof
          </div>
          <h2 className="font-black tracking-tight" style={{ fontSize: 26, color: '#0f172a', lineHeight: 1.2 }}>
            Testimonials
          </h2>
          <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 5 }}>
            Student and alumni testimonials displayed on the website.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          {[
            { label: 'Total',    value: testimonials.length, accent: '#2563eb', bg: '#eff6ff' },
            { label: 'Active',   value: active,              accent: '#059669', bg: '#f0fdf4' },
            { label: 'Inactive', value: inactive,            accent: '#94a3b8', bg: '#f8fafc' },
            { label: 'Avg ★',    value: avgRating,           accent: '#f59e0b', bg: '#fffbeb' },
          ].map(({ label, value, accent, bg }) => (
            <div key={label} style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', padding: '14px 18px', minWidth: 80 }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: 6 }}>{label}</p>
              <span style={{ fontSize: 22, fontWeight: 900, color: accent, letterSpacing: '-0.02em' }}>{value}</span>
            </div>
          ))}
          <button
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 12, background: 'linear-gradient(135deg,#3b82f6,#2563eb)', color: '#fff', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(37,99,235,0.3)' }}
          >
            <Plus style={{ width: 14, height: 14 }} />
            Add Testimonial
          </button>
        </div>
      </div>

      {/* Grid */}
      {testimonials.length === 0 ? (
        <div style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 20, padding: '64px 32px', textAlign: 'center' }}>
          <Quote style={{ width: 36, height: 36, color: '#e2e8f0', margin: '0 auto 12px' }} />
          <p style={{ fontSize: 15, fontWeight: 600, color: '#64748b' }}>No testimonials yet</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 16 }}>
          {testimonials.map((t) => {
            const initials = (t.author || 'U').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
            const colors = ['#2563eb', '#7c3aed', '#059669', '#d97706', '#db2777']
            const color  = colors[t.id % colors.length]

            return (
              <div
                key={t.id}
                style={{ background: '#fff', border: `1px solid ${t.isActive ? '#e8ecf0' : '#f1f5f9'}`, borderRadius: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', padding: '20px', opacity: t.isActive ? 1 : 0.65, display: 'flex', flexDirection: 'column', gap: 14 }}
              >
                {/* Stars */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        style={{ width: 13, height: 13, fill: i < t.rating ? '#f59e0b' : 'transparent', color: i < t.rating ? '#f59e0b' : '#e2e8f0' }}
                      />
                    ))}
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20, ...(t.isActive ? { background: '#f0fdf4', color: '#15803d' } : { background: '#f1f5f9', color: '#94a3b8' }) }}>
                    {t.isActive ? 'Active' : 'Hidden'}
                  </span>
                </div>

                {/* Quote */}
                <div style={{ position: 'relative', flex: 1 }}>
                  <Quote style={{ width: 18, height: 18, color: '#e2e8f0', position: 'absolute', top: 0, left: 0 }} />
                  <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.7, paddingLeft: 24, display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>
                    {t.description || t.title || '—'}
                  </p>
                </div>

                {/* Author */}
                <div className="flex items-center gap-3" style={{ borderTop: '1px solid #f8fafc', paddingTop: 12 }}>
                  {t.image ? (
                    <img src={t.image} alt={t.author || ''} style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                  ) : (
                    <div style={{ width: 34, height: 34, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                      {initials}
                    </div>
                  )}
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{t.author || 'Anonymous'}</p>
                    <p style={{ fontSize: 11, color: '#94a3b8' }}>
                      {new Date(t.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </AdminLayout>
  )
}

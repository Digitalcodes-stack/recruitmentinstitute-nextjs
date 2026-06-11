import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import AdminLayout from '@/components/admin/AdminLayout'
import { Info, ImageIcon, Plus, FileText } from 'lucide-react'

export default async function AdminAboutPage() {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin') redirect('/admin/login')

  const sections = await prisma.aboutSection.findMany({ orderBy: { id: 'asc' } })

  return (
    <AdminLayout title="About Us">
      {/* Page header */}
      <div className="flex items-start justify-between gap-6 mb-7" style={{ flexWrap: 'wrap' }}>
        <div>
          <div
            className="inline-flex items-center gap-2 rounded-full mb-3"
            style={{ background: '#f0f9ff', border: '1px solid #bae6fd', padding: '5px 13px', fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#0284c7' }}
          >
            <Info style={{ width: 11, height: 11 }} />
            Brand Content
          </div>
          <h2 className="font-black tracking-tight" style={{ fontSize: 26, color: '#0f172a', lineHeight: 1.2 }}>
            About Us
          </h2>
          <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 5 }}>
            Manage the About Us page content and images.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', padding: '14px 18px' }}>
            <div className="flex items-center gap-1.5 mb-2" style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#94a3b8' }}>
              <FileText style={{ width: 11, height: 11 }} />
              Sections
            </div>
            <span style={{ fontSize: 22, fontWeight: 900, color: '#0f172a' }}>{sections.length}</span>
          </div>
          <button
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 12, background: 'linear-gradient(135deg,#3b82f6,#2563eb)', color: '#fff', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(37,99,235,0.3)' }}
          >
            <Plus style={{ width: 14, height: 14 }} />
            Add Section
          </button>
        </div>
      </div>

      {/* Sections */}
      {sections.length === 0 ? (
        <div style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 20, padding: '64px 32px', textAlign: 'center' }}>
          <Info style={{ width: 36, height: 36, color: '#e2e8f0', margin: '0 auto 12px' }} />
          <p style={{ fontSize: 15, fontWeight: 600, color: '#64748b' }}>No About Us sections yet</p>
          <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>Click "Add Section" to get started.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {sections.map((s, idx) => (
            <div
              key={s.id}
              style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', overflow: 'hidden' }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: s.image ? '180px 1fr' : '1fr', gap: 0 }}>
                {/* Image */}
                {s.image && (
                  <div style={{ background: '#f8fafc', borderRight: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 140 }}>
                    <img
                      src={s.image}
                      alt={s.title || 'About section'}
                      style={{ width: '100%', height: 140, objectFit: 'cover' }}
                      onError={undefined}
                    />
                  </div>
                )}
                {!s.image && (
                  <div style={{ display: 'none' }} />
                )}

                {/* Content */}
                <div style={{ padding: '20px 24px' }}>
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8' }}>Section {idx + 1}</span>
                      </div>
                      {s.title && <p style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>{s.title}</p>}
                      {s.subtitle && <p style={{ fontSize: 13, fontWeight: 500, color: '#2563eb', marginBottom: 8 }}>{s.subtitle}</p>}
                    </div>
                    {!s.image && (
                      <div style={{ width: 40, height: 40, borderRadius: 12, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <ImageIcon style={{ width: 16, height: 16, color: '#cbd5e1' }} />
                      </div>
                    )}
                  </div>
                  {s.description && (
                    <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.7, display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>
                      {s.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-4">
                    <span style={{ fontSize: 11, color: '#94a3b8' }}>
                      Added {new Date(s.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  )
}

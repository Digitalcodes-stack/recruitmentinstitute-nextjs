import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getAdminSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import AdminLayout from '@/components/admin/AdminLayout'
import { FileText, Plus, ArrowLeft } from 'lucide-react'

export default async function NotificationTemplatesPage() {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin') redirect('/admin/login')

  const templates = await prisma.notificationTemplate.findMany({ orderBy: { id: 'desc' } })

  return (
    <AdminLayout title="Notification Templates">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <Link href="/admin/notifications" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#64748b', textDecoration: 'none' }}>
          <ArrowLeft style={{ width: 14, height: 14 }} /> Back
        </Link>
      </div>

      <div className="flex items-start justify-between gap-6 mb-7" style={{ flexWrap: 'wrap' }}>
        <div>
          <div
            className="inline-flex items-center gap-2 rounded-full mb-3"
            style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '5px 13px', fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#2563eb' }}
          >
            <FileText style={{ width: 11, height: 11 }} />
            Templates
          </div>
          <h2 className="font-black tracking-tight" style={{ fontSize: 24, color: '#0f172a', lineHeight: 1.2 }}>Notification Templates</h2>
        </div>
        <Link
          href="/admin/notifications/templates/new"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 12, background: 'linear-gradient(135deg,#3b82f6,#2563eb)', color: '#fff', fontSize: 13, fontWeight: 600, textDecoration: 'none', boxShadow: '0 4px 14px rgba(37,99,235,0.3)' }}
        >
          <Plus style={{ width: 14, height: 14 }} />
          New Template
        </Link>
      </div>

      {templates.length === 0 ? (
        <div style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 20, padding: '64px 32px', textAlign: 'center' }}>
          <FileText style={{ width: 36, height: 36, color: '#e2e8f0', margin: '0 auto 12px' }} />
          <p style={{ fontSize: 15, fontWeight: 600, color: '#64748b' }}>No templates yet</p>
          <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>Create a template to use it in campaigns.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 16 }}>
          {templates.map((t) => (
            <div key={t.id} style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{t.name}</p>
                <span style={{ fontSize: 10.5, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: '#f1f5f9', color: '#475569' }}>{t.channel}</span>
              </div>
              <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>Key: <code style={{ color: '#475569' }}>{t.key}</code></p>
              {t.subject && <p style={{ fontSize: 12.5, color: '#64748b', marginBottom: 4 }}>{t.subject}</p>}
              <span style={{
                fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, marginTop: 8, display: 'inline-block',
                background: t.isActive ? '#ecfdf5' : '#f8fafc',
                color: t.isActive ? '#059669' : '#94a3b8',
                border: `1px solid ${t.isActive ? '#a7f3d0' : '#e2e8f0'}`,
              }}>
                {t.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  )
}

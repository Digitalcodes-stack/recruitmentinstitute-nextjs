import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getAdminSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import AdminLayout from '@/components/admin/AdminLayout'
import { Bell, Plus, FileText, Send, Clock, CheckCircle2 } from 'lucide-react'
import NotificationActions from '@/components/admin/NotificationActions'

const STATUS_STYLE: Record<string, { bg: string; border: string; color: string; label: string }> = {
  DRAFT: { bg: '#f8fafc', border: '#e2e8f0', color: '#64748b', label: 'Draft' },
  SCHEDULED: { bg: '#fffbeb', border: '#fde68a', color: '#b45309', label: 'Scheduled' },
  PROCESSING: { bg: '#eff6ff', border: '#bfdbfe', color: '#2563eb', label: 'Processing' },
  COMPLETED: { bg: '#ecfdf5', border: '#a7f3d0', color: '#059669', label: 'Completed' },
  PARTIALLY_FAILED: { bg: '#fff7ed', border: '#fed7aa', color: '#c2410c', label: 'Partially Failed' },
  FAILED: { bg: '#fef2f2', border: '#fecaca', color: '#dc2626', label: 'Failed' },
  CANCELLED: { bg: '#f8fafc', border: '#e2e8f0', color: '#94a3b8', label: 'Cancelled' },
}

export default async function AdminNotificationsPage() {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin') redirect('/admin/login')

  const notifications = await prisma.notification.findMany({
    orderBy: { id: 'desc' },
    include: { template: { select: { name: true, channel: true } }, _count: { select: { recipients: true } } },
  })

  const counts = {
    total: notifications.length,
    scheduled: notifications.filter((n) => n.status === 'SCHEDULED').length,
    processing: notifications.filter((n) => n.status === 'PROCESSING').length,
    completed: notifications.filter((n) => n.status === 'COMPLETED').length,
  }

  return (
    <AdminLayout title="Notifications">
      <div className="flex items-start justify-between gap-6 mb-7" style={{ flexWrap: 'wrap' }}>
        <div>
          <div
            className="inline-flex items-center gap-2 rounded-full mb-3"
            style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '5px 13px', fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#2563eb' }}
          >
            <Bell style={{ width: 11, height: 11 }} />
            Notification Center
          </div>
          <h2 className="font-black tracking-tight" style={{ fontSize: 26, color: '#0f172a', lineHeight: 1.2 }}>
            Notifications
          </h2>
          <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 5 }}>
            Send and track Email, SMS, WhatsApp, Push, and In-App campaigns.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          {[
            { label: 'Total', value: counts.total, icon: Bell },
            { label: 'Scheduled', value: counts.scheduled, icon: Clock },
            { label: 'Processing', value: counts.processing, icon: Send },
            { label: 'Completed', value: counts.completed, icon: CheckCircle2 },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', padding: '14px 18px', minWidth: 100 }}>
              <div className="flex items-center gap-1.5 mb-2" style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#94a3b8' }}>
                <Icon style={{ width: 11, height: 11 }} />
                {label}
              </div>
              <span style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>{value}</span>
            </div>
          ))}
          <Link
            href="/admin/notifications/templates"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 12, background: '#fff', border: '1px solid #e2e8f0', color: '#475569', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}
          >
            <FileText style={{ width: 14, height: 14 }} />
            Templates
          </Link>
          <Link
            href="/admin/notifications/new"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 12, background: 'linear-gradient(135deg,#3b82f6,#2563eb)', color: '#fff', fontSize: 13, fontWeight: 600, textDecoration: 'none', boxShadow: '0 4px 14px rgba(37,99,235,0.3)' }}
          >
            <Plus style={{ width: 14, height: 14 }} />
            New Campaign
          </Link>
        </div>
      </div>

      {notifications.length === 0 ? (
        <div style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 20, padding: '64px 32px', textAlign: 'center' }}>
          <Bell style={{ width: 36, height: 36, color: '#e2e8f0', margin: '0 auto 12px' }} />
          <p style={{ fontSize: 15, fontWeight: 600, color: '#64748b' }}>No notifications yet</p>
          <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>Create your first campaign to reach students or candidates.</p>
        </div>
      ) : (
        <div style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e8ecf0' }}>
                {['Campaign', 'Channels', 'Audience', 'Recipients', 'Status', 'Scheduled / Created', ''].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: '12px 20px', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#94a3b8' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {notifications.map((n) => {
                const s = STATUS_STYLE[n.status] ?? STATUS_STYLE.DRAFT
                return (
                  <tr key={n.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 20px' }}>
                      <Link href={`/admin/notifications/${n.id}`} style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a', textDecoration: 'none' }}>
                        {n.title}
                      </Link>
                      {n.template && <p style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 2 }}>via {n.template.name}</p>}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {n.channels.map((c) => (
                          <span key={c} style={{ fontSize: 10.5, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: '#f1f5f9', color: '#475569' }}>{c}</span>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: 12.5, color: '#475569' }}>{n.audienceType.replaceAll('_', ' ')}</td>
                    <td style={{ padding: '14px 20px', fontSize: 12.5, color: '#475569' }}>{n._count.recipients}</td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
                        {s.label}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: 12, color: '#94a3b8' }}>
                      {(n.scheduledAt ?? n.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <NotificationActions id={n.id} status={n.status} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  )
}

import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { getAdminSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import AdminLayout from '@/components/admin/AdminLayout'
import { ArrowLeft, Bell, CheckCircle2, XCircle, Clock } from 'lucide-react'
import NotificationActions from '@/components/admin/NotificationActions'
import RecipientRetryButton from '@/components/admin/RecipientRetryButton'

const STATUS_COLOR: Record<string, string> = {
  PENDING: '#94a3b8', QUEUED: '#2563eb', SENT: '#0891b2', DELIVERED: '#059669',
  FAILED: '#dc2626', BOUNCED: '#dc2626', READ: '#7c3aed',
}

export default async function NotificationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin') redirect('/admin/login')

  const { id } = await params
  const notification = await prisma.notification.findUnique({
    where: { id: Number(id) },
    include: { template: true },
  })
  if (!notification) notFound()

  const [grouped, recipients] = await Promise.all([
    prisma.notificationRecipient.groupBy({ by: ['channel', 'status'], where: { notificationId: notification.id }, _count: true }),
    prisma.notificationRecipient.findMany({ where: { notificationId: notification.id }, orderBy: { id: 'asc' }, take: 100 }),
  ])

  const total = grouped.reduce((s, r) => s + r._count, 0)
  const sent = grouped.filter((r) => ['SENT', 'DELIVERED', 'READ'].includes(r.status)).reduce((s, r) => s + r._count, 0)
  const failed = grouped.filter((r) => ['FAILED', 'BOUNCED'].includes(r.status)).reduce((s, r) => s + r._count, 0)
  const pending = grouped.filter((r) => ['PENDING', 'QUEUED'].includes(r.status)).reduce((s, r) => s + r._count, 0)

  return (
    <AdminLayout title={notification.title}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <Link href="/admin/notifications" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#64748b', textDecoration: 'none' }}>
          <ArrowLeft style={{ width: 14, height: 14 }} /> Back
        </Link>
        <span style={{ color: '#e2e8f0' }}>·</span>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#2563eb' }}>
          <Bell style={{ width: 11, height: 11 }} />
          Campaign Detail
        </div>
      </div>

      <div className="flex items-start justify-between gap-6 mb-7" style={{ flexWrap: 'wrap' }}>
        <div>
          <h2 className="font-black tracking-tight" style={{ fontSize: 24, color: '#0f172a', lineHeight: 1.2 }}>{notification.title}</h2>
          <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 5 }}>
            {notification.channels.join(', ')} · {notification.audienceType.replaceAll('_', ' ')}
            {notification.template && <> · via {notification.template.name}</>}
          </p>
        </div>
        <NotificationActions id={notification.id} status={notification.status} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Total', value: total, icon: Bell, color: '#2563eb' },
          { label: 'Sent', value: sent, icon: CheckCircle2, color: '#059669' },
          { label: 'Pending', value: pending, icon: Clock, color: '#b45309' },
          { label: 'Failed', value: failed, icon: XCircle, color: '#dc2626' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', padding: '16px 18px' }}>
            <div className="flex items-center gap-1.5 mb-2" style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#94a3b8' }}>
              <Icon style={{ width: 11, height: 11, color }} />
              {label}
            </div>
            <span style={{ fontSize: 24, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>{value}</span>
          </div>
        ))}
      </div>

      <div style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', padding: 24, marginBottom: 24 }}>
        <h3 style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', marginBottom: 14 }}>Delivery by Channel</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
          {Array.from(new Set(grouped.map((g) => g.channel))).map((channel) => (
            <div key={channel} style={{ minWidth: 160 }}>
              <p style={{ fontSize: 11.5, fontWeight: 700, color: '#475569', marginBottom: 6 }}>{channel}</p>
              {grouped.filter((g) => g.channel === channel).map((g) => (
                <div key={g.status} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748b', padding: '2px 0' }}>
                  <span style={{ color: STATUS_COLOR[g.status] ?? '#64748b' }}>{g.status}</span>
                  <span style={{ fontWeight: 700 }}>{g._count}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9' }}>
          <h3 style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>Recipients {total > 100 && <span style={{ color: '#94a3b8', fontWeight: 500 }}>(showing first 100)</span>}</h3>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e8ecf0' }}>
              {['Address', 'Channel', 'Status', 'Attempts', 'Error', ''].map((h) => (
                <th key={h} style={{ textAlign: 'left', padding: '10px 20px', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#94a3b8' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recipients.map((r) => (
              <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '10px 20px', fontSize: 12.5, color: '#334155' }}>{r.address}</td>
                <td style={{ padding: '10px 20px', fontSize: 12, color: '#64748b' }}>{r.channel}</td>
                <td style={{ padding: '10px 20px' }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: STATUS_COLOR[r.status] ?? '#64748b' }}>{r.status}</span>
                </td>
                <td style={{ padding: '10px 20px', fontSize: 12, color: '#94a3b8' }}>{r.attempts}</td>
                <td style={{ padding: '10px 20px', fontSize: 11.5, color: '#dc2626', maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={r.error ?? ''}>
                  {r.error ?? '—'}
                </td>
                <td style={{ padding: '10px 20px' }}>
                  {(r.status === 'FAILED' || r.status === 'BOUNCED') && <RecipientRetryButton id={r.id} />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  )
}

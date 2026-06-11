import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import AdminLayout from '@/components/admin/AdminLayout'
import { Mail, Phone, MessageSquare, Clock3, Inbox } from 'lucide-react'

export default async function AdminContactsPage() {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin') redirect('/admin/login')

  const contacts = await prisma.contactSubmission.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  return (
    <AdminLayout title="Contact Submissions">

      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 28 }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 100, padding: '5px 13px', marginBottom: 12, fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase' as const, color: '#2563eb' }}>
            <MessageSquare style={{ width: 11, height: 11 }} />
            Inbox
          </div>
          <h2 style={{ fontSize: 26, fontWeight: 900, color: '#0f172a', lineHeight: 1.2, letterSpacing: '-0.02em' }}>
            Contact Submissions
          </h2>
          <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 5 }}>
            {contacts.length} total enquiries in the inbox
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {[
            { label: 'Total Enquiries', value: contacts.length, accent: '#2563eb', bg: '#eff6ff', bdr: '#bfdbfe' },
            { label: 'Response SLA',    value: '24h',           accent: '#059669', bg: '#f0fdf4', bdr: '#bbf7d0' },
          ].map(({ label, value, accent, bg, bdr }) => (
            <div key={label} style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', padding: '14px 18px', minWidth: 110 }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase' as const, color: '#94a3b8', marginBottom: 6 }}>{label}</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <span style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>{value}</span>
                <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 100, background: bg, color: accent, border: `1px solid ${bdr}` }}>Live</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contact cards */}
      {contacts.length === 0 ? (
        <div style={{ background: '#fff', border: '1px dashed #e8ecf0', borderRadius: 20, padding: '72px 32px', textAlign: 'center' as const }}>
          <div style={{ width: 52, height: 52, borderRadius: 16, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Inbox style={{ width: 22, height: 22, color: '#cbd5e1' }} />
          </div>
          <p style={{ fontSize: 14, fontWeight: 600, color: '#64748b' }}>No contact submissions yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 12 }}>
          {contacts.map((contact) => (
            <div key={contact.id} style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', padding: '20px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 14 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 10, background: '#eff6ff', border: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <MessageSquare style={{ width: 14, height: 14, color: '#2563eb' }} />
                    </div>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{contact.name}</h3>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap' as const, alignItems: 'center', gap: 16 }}>
                    <a href={`mailto:${contact.email}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#475569', textDecoration: 'none' }}>
                      <Mail style={{ width: 11, height: 11 }} />
                      {contact.email}
                    </a>
                    {contact.mobile && (
                      <a href={`tel:${contact.mobile}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#475569', textDecoration: 'none' }}>
                        <Phone style={{ width: 11, height: 11 }} />
                        {contact.mobile}
                      </a>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#94a3b8', flexShrink: 0 }}>
                  <Clock3 style={{ width: 11, height: 11 }} />
                  {new Date(contact.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </div>
              </div>
              <div style={{ background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: 12, padding: '14px 18px', fontSize: 13, lineHeight: 1.7, color: '#475569' }}>
                {contact.message}
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  )
}

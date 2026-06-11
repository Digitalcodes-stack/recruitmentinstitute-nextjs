import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import AdminLayout from '@/components/admin/AdminLayout'
import AddServiceButton from '@/components/admin/AddServiceButton'
import ServiceActions from '@/components/admin/ServiceActions'
import { Settings2, Link2, ImageIcon } from 'lucide-react'

export default async function AdminServicesPage() {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin') redirect('/admin/login')

  const services = await prisma.service.findMany({ orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }] })

  const active   = services.filter((s) => s.isActive).length
  const inactive = services.filter((s) => !s.isActive).length

  return (
    <AdminLayout title="Services">
      {/* Page header */}
      <div className="flex items-start justify-between gap-6 mb-7" style={{ flexWrap: 'wrap' }}>
        <div>
          <div
            className="inline-flex items-center gap-2 rounded-full mb-3"
            style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', padding: '5px 13px', fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7c3aed' }}
          >
            <Settings2 style={{ width: 11, height: 11 }} />
            Service Offerings
          </div>
          <h2 className="font-black tracking-tight" style={{ fontSize: 26, color: '#0f172a', lineHeight: 1.2 }}>
            Services
          </h2>
          <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 5 }}>
            Manage public-facing service pages and their status.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          {[
            { label: 'Total',    value: services.length, accent: '#2563eb' },
            { label: 'Active',   value: active,          accent: '#059669' },
            { label: 'Inactive', value: inactive,        accent: '#94a3b8' },
          ].map(({ label, value, accent }) => (
            <div key={label} style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', padding: '14px 18px', minWidth: 80 }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: 6 }}>{label}</p>
              <span style={{ fontSize: 22, fontWeight: 900, color: accent }}>{value}</span>
            </div>
          ))}
          <AddServiceButton />
        </div>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid #f1f5f9' }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>All Services</p>
          <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{services.length} total</p>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                {['#', 'Title', 'Slug', 'Description', 'Order', 'Status', 'Actions'].map((h) => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#94a3b8', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {services.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '48px 24px', textAlign: 'center', fontSize: 13, color: '#94a3b8' }}>No services found. Click "Add Service" to create one.</td>
                </tr>
              ) : services.map((s, idx) => (
                <tr key={s.id} style={{ borderBottom: idx < services.length - 1 ? '1px solid #f8fafc' : 'none' }}>
                  <td style={{ padding: '14px 16px', fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>{idx + 1}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {s.image ? (
                        <img src={s.image} alt={s.title} style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
                      ) : (
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <ImageIcon style={{ width: 13, height: 13, color: '#cbd5e1' }} />
                        </div>
                      )}
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{s.title}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 500, color: '#64748b', background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: 8, padding: '3px 8px', fontFamily: 'monospace' }}>
                      <Link2 style={{ width: 10, height: 10 }} />
                      {s.slug}
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 12, color: '#64748b', maxWidth: 240 }}>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.description || '—'}</div>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 13, fontWeight: 600, color: '#374151', textAlign: 'center' }}>{s.sortOrder}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
                      ...(s.isActive
                        ? { background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0' }
                        : { background: '#f1f5f9', color: '#94a3b8', border: '1px solid #e2e8f0' }),
                    }}>
                      {s.isActive ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <ServiceActions service={s} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  )
}

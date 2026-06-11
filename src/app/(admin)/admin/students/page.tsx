import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import AdminLayout from '@/components/admin/AdminLayout'
import EntityAdminTable from '@/components/admin/EntityAdminTable'
import { GraduationCap, Users, UserCheck, Clock3 } from 'lucide-react'

type StudentRow = {
  id: number
  name: string
  email: string
  contact: string | null
  mobile?: string | null
  isActive: boolean
  createdAt: Date
}

export default async function AdminStudentsPage() {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin') redirect('/admin/login')

  const rows = await prisma.student.findMany({ orderBy: { createdAt: 'desc' } })

  const active   = rows.filter((r) => r.isActive).length
  const inactive = rows.length - active

  return (
    <AdminLayout title="Students">

      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 28 }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#ecfeff', border: '1px solid #a5f3fc', borderRadius: 100, padding: '5px 13px', marginBottom: 12, fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase' as const, color: '#0891b2' }}>
            <GraduationCap style={{ width: 11, height: 11 }} />
            Student Management
          </div>
          <h2 style={{ fontSize: 26, fontWeight: 900, color: '#0f172a', lineHeight: 1.2, letterSpacing: '-0.02em' }}>
            Students
          </h2>
          <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 5 }}>
            Manage student accounts, access status, and onboarding activity.
          </p>
        </div>

        {/* Stat mini-cards */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {[
            { label: 'Total',   value: rows.length, icon: Users,       accent: '#2563eb', bg: '#eff6ff', bdr: '#bfdbfe' },
            { label: 'Active',  value: active,      icon: UserCheck,   accent: '#059669', bg: '#f0fdf4', bdr: '#bbf7d0' },
            { label: 'Pending', value: inactive,    icon: Clock3,      accent: '#d97706', bg: '#fffbeb', bdr: '#fde68a' },
          ].map(({ label, value, icon: Icon, accent, bg, bdr }) => (
            <div key={label} style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', padding: '14px 18px', minWidth: 90 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase' as const, color: '#94a3b8', marginBottom: 8 }}>
                <Icon style={{ width: 10, height: 10 }} />
                {label}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <span style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>{value}</span>
                <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 100, background: bg, color: accent, border: `1px solid ${bdr}` }}>Live</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <EntityAdminTable rows={rows as StudentRow[]} endpoint="/api/admin/students" entityLabel="Student" />
    </AdminLayout>
  )
}

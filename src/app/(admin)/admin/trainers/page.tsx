import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getAdminSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import AdminLayout from '@/components/admin/AdminLayout'
import { GraduationCap, Plus, Briefcase, CheckCircle2 } from 'lucide-react'
import TrainerActions from '@/components/admin/TrainerActions'

export default async function AdminTrainersPage() {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin') redirect('/admin/login')

  const trainers = await prisma.trainer.findMany({ orderBy: { id: 'asc' } })
  const activeCount = trainers.filter((t) => t.isActive).length

  return (
    <AdminLayout title="Trainers">
      <div className="flex items-start justify-between gap-6 mb-7" style={{ flexWrap: 'wrap' }}>
        <div>
          <div
            className="inline-flex items-center gap-2 rounded-full mb-3"
            style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', padding: '5px 13px', fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7c3aed' }}
          >
            <GraduationCap style={{ width: 11, height: 11 }} />
            Batch Trainers
          </div>
          <h2 className="font-black tracking-tight" style={{ fontSize: 26, color: '#0f172a', lineHeight: 1.2 }}>
            Trainers
          </h2>
          <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 5 }}>
            Trainers who can be assigned to batches and conduct live sessions.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {[
            { label: 'Total Trainers', value: trainers.length, icon: GraduationCap },
            { label: 'Active', value: activeCount, icon: CheckCircle2 },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', padding: '14px 18px', minWidth: 110 }}>
              <div className="flex items-center gap-1.5 mb-2" style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#94a3b8' }}>
                <Icon style={{ width: 11, height: 11 }} />
                {label}
              </div>
              <span style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>{value}</span>
            </div>
          ))}
          <Link
            href="/admin/trainers/new"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 12, background: 'linear-gradient(135deg,#3b82f6,#2563eb)', color: '#fff', fontSize: 13, fontWeight: 600, textDecoration: 'none', boxShadow: '0 4px 14px rgba(37,99,235,0.3)' }}
          >
            <Plus style={{ width: 14, height: 14 }} />
            Add Trainer
          </Link>
        </div>
      </div>

      {trainers.length === 0 ? (
        <div style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 20, padding: '64px 32px', textAlign: 'center' }}>
          <GraduationCap style={{ width: 36, height: 36, color: '#e2e8f0', margin: '0 auto 12px' }} />
          <p style={{ fontSize: 15, fontWeight: 600, color: '#64748b' }}>No trainers yet</p>
          <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>Add your first trainer to start assigning batches.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 16 }}>
          {trainers.map((trainer) => {
            const initials = trainer.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
            const colors = ['#2563eb', '#7c3aed', '#059669', '#d97706', '#db2777']
            const color = colors[trainer.id % colors.length]
            return (
              <div
                key={trainer.id}
                style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', overflow: 'hidden' }}
              >
                <div style={{ height: 72, background: `linear-gradient(135deg,${color}22,${color}11)`, borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {trainer.image ? (
                    <img src={trainer.image} alt={trainer.name} style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover', border: `3px solid ${color}33` }} />
                  ) : (
                    <div style={{ width: 52, height: 52, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: '#fff' }}>
                      {initials}
                    </div>
                  )}
                </div>

                <div style={{ padding: '16px 20px' }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>{trainer.name}</p>
                  {trainer.specialization && (
                    <div className="flex items-center gap-1.5 mb-3">
                      <Briefcase style={{ width: 11, height: 11, color: '#94a3b8' }} />
                      <span style={{ fontSize: 12, color: '#64748b' }}>{trainer.specialization}</span>
                    </div>
                  )}
                  <span style={{
                    fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
                    background: trainer.isActive ? '#ecfdf5' : '#f8fafc',
                    color: trainer.isActive ? '#059669' : '#94a3b8',
                    border: `1px solid ${trainer.isActive ? '#a7f3d0' : '#e2e8f0'}`,
                  }}>
                    {trainer.isActive ? 'Active' : 'Inactive'}
                  </span>

                  <TrainerActions id={trainer.id} />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </AdminLayout>
  )
}

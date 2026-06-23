import Link from 'next/link'
import { GraduationCap, LogOut } from 'lucide-react'

interface Props {
  title: string
  trainerName: string
  children: React.ReactNode
}

export default function TrainerLayout({ title, trainerName, children }: Props) {
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <header style={{ background: '#fff', borderBottom: '1px solid #e8ecf0', padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg,#7c3aed,#5b21b6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <GraduationCap style={{ width: 18, height: 18, color: '#fff' }} />
          </div>
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#94a3b8' }}>Trainer Portal</p>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{title}</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 13, color: '#475569' }}>{trainerName}</span>
          <Link
            href="/api/auth/logout"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: '#dc2626', textDecoration: 'none', padding: '7px 12px', borderRadius: 9, background: '#fef2f2', border: '1px solid #fecaca' }}
          >
            <LogOut style={{ width: 12, height: 12 }} /> Sign Out
          </Link>
        </div>
      </header>
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 32px' }}>{children}</main>
    </div>
  )
}

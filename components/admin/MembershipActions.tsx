'use client'

import { useRouter } from 'next/navigation'

export default function MembershipActions({ id, isActive }: { id: number; isActive: boolean }) {
  const router = useRouter()

  const toggle = async () => {
    await fetch('/api/admin/memberships', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, isActive: !isActive }),
    })
    router.refresh()
  }

  return (
    <button
      onClick={toggle}
      style={{
        padding: '6px 14px', borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: 'pointer', border: 'none', transition: 'all 0.15s',
        ...(isActive
          ? { background: '#f1f5f9', color: '#374151' }
          : { background: '#2563eb', color: '#fff', boxShadow: '0 2px 8px rgba(37,99,235,0.25)' }),
      }}
      onMouseEnter={(e) => {
        if (isActive) { e.currentTarget.style.background = '#e2e8f0' }
        else { e.currentTarget.style.background = '#1d4ed8' }
      }}
      onMouseLeave={(e) => {
        if (isActive) { e.currentTarget.style.background = '#f1f5f9' }
        else { e.currentTarget.style.background = '#2563eb' }
      }}
    >
      {isActive ? 'Suspend' : 'Activate'}
    </button>
  )
}

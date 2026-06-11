'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminDashboard from '@/components/admin/AdminDashboard'
import type { AuthSession } from '@/types'

export default function AdminDashboardEntry() {
  const router = useRouter()
  const [session, setSession] = useState<AuthSession | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    fetch('/api/auth/admin/session', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (!mounted) return
        if (data.success && data.session?.type === 'admin') {
          setSession(data.session)
        } else {
          router.replace('/admin/login')
        }
      })
      .catch(() => {
        if (mounted) router.replace('/admin/login')
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [router])

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center rounded-[30px] border border-slate-200 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
          <p className="text-sm font-medium text-slate-500">Loading admin workspace...</p>
        </div>
      </div>
    )
  }

  if (!session) return null

  return <AdminDashboard />
}

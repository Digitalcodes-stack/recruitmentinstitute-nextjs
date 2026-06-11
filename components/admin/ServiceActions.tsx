'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2, ToggleLeft, ToggleRight, Loader2 } from 'lucide-react'
import ServiceModal from './ServiceModal'

interface Service {
  id: number
  title: string
  slug: string
  description: string | null
  image: string | null
  isActive: boolean
  sortOrder: number
}

interface Props {
  service: Service
}

export default function ServiceActions({ service }: Props) {
  const router = useRouter()
  const [showEdit, setShowEdit] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState('')

  async function handleToggle() {
    setLoading('toggle')
    setError('')
    const res = await fetch(`/api/admin/services/${service.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !service.isActive }),
    })
    setLoading(null)
    if (res.ok) router.refresh()
    else setError('Failed to update')
  }

  async function handleDelete() {
    if (!confirm(`Delete "${service.title}"? This cannot be undone.`)) return
    setLoading('delete')
    setError('')
    const res = await fetch(`/api/admin/services/${service.id}`, { method: 'DELETE' })
    setLoading(null)
    if (res.ok) router.refresh()
    else setError('Failed to delete')
  }

  const btnBase: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: 4,
    fontSize: 11, fontWeight: 700, padding: '5px 10px',
    borderRadius: 8, cursor: 'pointer', border: 'none',
  }

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {/* Edit */}
        <button
          onClick={() => setShowEdit(true)}
          style={{ ...btnBase, background: '#eff6ff', color: '#2563eb' }}
        >
          <Pencil style={{ width: 11, height: 11 }} />
          Edit
        </button>

        {/* Toggle active */}
        <button
          onClick={handleToggle}
          disabled={!!loading}
          style={{ ...btnBase, background: service.isActive ? '#fff7ed' : '#f0fdf4', color: service.isActive ? '#ea580c' : '#059669', opacity: loading === 'toggle' ? 0.6 : 1 }}
        >
          {loading === 'toggle'
            ? <Loader2 style={{ width: 11, height: 11 }} className="animate-spin" />
            : service.isActive
              ? <ToggleRight style={{ width: 11, height: 11 }} />
              : <ToggleLeft style={{ width: 11, height: 11 }} />
          }
          {service.isActive ? 'Deactivate' : 'Activate'}
        </button>

        {/* Delete */}
        <button
          onClick={handleDelete}
          disabled={!!loading}
          style={{ ...btnBase, background: '#fff7f7', color: '#dc2626', opacity: loading === 'delete' ? 0.6 : 1 }}
        >
          {loading === 'delete'
            ? <Loader2 style={{ width: 11, height: 11 }} className="animate-spin" />
            : <Trash2 style={{ width: 11, height: 11 }} />
          }
          Delete
        </button>

        {error && <span style={{ fontSize: 10, color: '#dc2626' }}>{error}</span>}
      </div>

      {showEdit && <ServiceModal service={service} onClose={() => setShowEdit(false)} />}
    </>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { Menu, ArrowUp, ArrowDown, Eye, EyeOff, Save, Loader2, RotateCcw } from 'lucide-react'
import toast from 'react-hot-toast'
import type { NavOverride } from '@/lib/nav-config-constants'
import { DEFAULT_NAV_OVERRIDES } from '@/lib/nav-config-constants'

// These ids have no matching menu entry in Header.tsx yet (no page exists for
// either). Toggling one visible here has no effect on the live header until a
// developer adds its entry to Header.tsx's navItems.
const PENDING_NO_PAGE_YET = new Set(['tools', 'events'])

export default function NavSettingsForm() {
  const [items, setItems] = useState<NavOverride[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/admin/settings/nav')
      .then((r) => r.json())
      .then((data) => {
        const overrides: NavOverride[] = data.overrides || DEFAULT_NAV_OVERRIDES
        setItems([...overrides].sort((a, b) => a.order - b.order))
      })
      .catch(() => setItems([...DEFAULT_NAV_OVERRIDES]))
      .finally(() => setLoading(false))
  }, [])

  const move = (idx: number, dir: -1 | 1) => {
    const target = idx + dir
    if (target < 0 || target >= items.length) return
    setItems((prev) => {
      const next = [...prev]
      ;[next[idx], next[target]] = [next[target], next[idx]]
      return next.map((item, i) => ({ ...item, order: i }))
    })
  }

  const toggleVisible = (idx: number) => {
    setItems((prev) => prev.map((item, i) => (i === idx ? { ...item, visible: !item.visible } : item)))
  }

  const setLabel = (idx: number, label: string) => {
    setItems((prev) => prev.map((item, i) => (i === idx ? { ...item, label } : item)))
  }

  const resetToDefaults = () => {
    if (!confirm('Reset all navigation items to their default labels, order and visibility?')) return
    setItems([...DEFAULT_NAV_OVERRIDES])
  }

  const save = async () => {
    if (items.some((i) => !i.label.trim())) {
      toast.error('Every navigation item needs a label')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/admin/settings/nav', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ overrides: items.map((item, idx) => ({ ...item, order: idx })) }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.message)
      toast.success('Navigation updated successfully')
    } catch (e: unknown) {
      toast.error((e as Error).message || 'Failed to save navigation')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <p style={{ fontSize: 13, color: '#94a3b8', textAlign: 'center', padding: 48 }}>Loading…</p>
  }

  return (
    <div style={{ maxWidth: 720 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 100, padding: '5px 13px', marginBottom: 12, fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase' as const, color: '#1d4ed8' }}>
            <Menu style={{ width: 11, height: 11 }} />
            Header Navigation
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', lineHeight: 1.2, letterSpacing: '-0.02em' }}>
            Main Navigation Items
          </h2>
          <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 5, maxWidth: 480 }}>
            Show/hide, reorder, or relabel the top-level menu items shown on every public page.
            Dropdown sub-items (e.g. courses under Training) are not editable here.
          </p>
        </div>
        <button onClick={resetToDefaults}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0', color: '#64748b', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
          <RotateCcw style={{ width: 12, height: 12 }} /> Reset to Defaults
        </button>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
        {items.map((item, idx) => (
          <div
            key={item.id}
            style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px',
              borderBottom: idx < items.length - 1 ? '1px solid #f8fafc' : 'none',
              opacity: item.visible ? 1 : 0.5,
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <button onClick={() => move(idx, -1)} disabled={idx === 0}
                style={{ background: 'none', border: 'none', cursor: idx === 0 ? 'not-allowed' : 'pointer', color: idx === 0 ? '#e2e8f0' : '#64748b', padding: 2 }}>
                <ArrowUp style={{ width: 14, height: 14 }} />
              </button>
              <button onClick={() => move(idx, 1)} disabled={idx === items.length - 1}
                style={{ background: 'none', border: 'none', cursor: idx === items.length - 1 ? 'not-allowed' : 'pointer', color: idx === items.length - 1 ? '#e2e8f0' : '#64748b', padding: 2 }}>
                <ArrowDown style={{ width: 14, height: 14 }} />
              </button>
            </div>

            <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', minWidth: 20 }}>{idx + 1}</span>

            <input
              type="text"
              value={item.label}
              onChange={(e) => setLabel(idx, e.target.value)}
              style={{ flex: 1, padding: '9px 12px', borderRadius: 10, fontSize: 14, fontWeight: 600, border: '1px solid #e2e8f0', outline: 'none', color: '#0f172a', background: '#fafafa' }}
            />

            {PENDING_NO_PAGE_YET.has(item.id) && (
              <span style={{ fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 100, background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', whiteSpace: 'nowrap' }}>
                Planned — no page yet
              </span>
            )}

            <button
              onClick={() => toggleVisible(idx)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
                background: item.visible ? '#f0fdf4' : '#fef2f2',
                border: `1px solid ${item.visible ? '#bbf7d0' : '#fecaca'}`,
                color: item.visible ? '#15803d' : '#dc2626',
              }}
            >
              {item.visible ? <Eye style={{ width: 13, height: 13 }} /> : <EyeOff style={{ width: 13, height: 13 }} />}
              {item.visible ? 'Visible' : 'Hidden'}
            </button>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
        <button onClick={save} disabled={saving}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 24px', borderRadius: 12, background: 'linear-gradient(135deg,#3b82f6,#2563eb)', color: '#fff', fontSize: 13, fontWeight: 700, border: 'none', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, boxShadow: '0 4px 14px rgba(37,99,235,0.3)' }}>
          {saving ? <Loader2 style={{ width: 14, height: 14 }} /> : <Save style={{ width: 14, height: 14 }} />}
          {saving ? 'Saving…' : 'Save Navigation'}
        </button>
      </div>
    </div>
  )
}

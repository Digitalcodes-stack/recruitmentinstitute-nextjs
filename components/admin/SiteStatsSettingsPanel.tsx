'use client'

import { useState, useEffect } from 'react'
import {
  Users, BookOpen, Award, TrendingUp,
  GraduationCap, Star, ShieldCheck, Clock,
  Save, RotateCcw, Sparkles, Check, HelpCircle
} from 'lucide-react'
import toast from 'react-hot-toast'
import type { SiteStatItem } from '@/lib/site-stats-constants'

const ICON_MAP: Record<string, any> = {
  users: Users,
  book: BookOpen,
  award: Award,
  trending: TrendingUp,
  graduation: GraduationCap,
  star: Star,
  shield: ShieldCheck,
  clock: Clock,
}

interface Props {
  initialStats: SiteStatItem[]
  autoSuggestions?: {
    professionalsTrained: string
    programsAvailable: string
    industryExpertise: string
    placementSuccess: string
  }
}

export default function SiteStatsSettingsPanel({ initialStats, autoSuggestions }: Props) {
  const [stats, setStats] = useState<SiteStatItem[]>(initialStats)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const handleUpdateField = (index: number, field: keyof SiteStatItem, val: string) => {
    const updated = [...stats]
    updated[index] = { ...updated[index], [field]: val }
    setStats(updated)
    setHasChanges(true)
  }

  const handleResetDefaults = () => {
    const defaultStats: SiteStatItem[] = [
      { icon: 'users',   value: '5,000+',  label: 'Professionals Trained', iconBg: '#EFF6FF', iconColor: '#1D4ED8' },
      { icon: 'book',    value: '6',       label: 'Programs Available',     iconBg: '#F5F3FF', iconColor: '#7C3AED' },
      { icon: 'award',   value: '10+ Yrs', label: 'Industry Expertise',     iconBg: '#FFFBEB', iconColor: '#D97706' },
      { icon: 'trending',value: '95%',     label: 'Placement Success',      iconBg: '#F0FDF4', iconColor: '#16A34A' },
    ]
    setStats(defaultStats)
    setHasChanges(true)
    toast.success('Reset to default values. Click Save to apply.')
  }

  const handleApplyAutoCount = () => {
    if (!autoSuggestions) return
    const updated = [...stats]
    if (updated[0]) updated[0].value = autoSuggestions.professionalsTrained
    if (updated[1]) updated[1].value = autoSuggestions.programsAvailable
    if (updated[2]) updated[2].value = autoSuggestions.industryExpertise
    if (updated[3]) updated[3].value = autoSuggestions.placementSuccess
    setStats(updated)
    setHasChanges(true)
    toast.success('Applied dynamic database counts!')
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/settings/stats', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stats }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Site stats successfully updated across all pages!')
        setHasChanges(false)
      } else {
        toast.error(data.message || 'Failed to save settings')
      }
    } catch (err) {
      toast.error('Network error while saving settings')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{
      background: '#ffffff',
      borderRadius: 18,
      border: '1px solid #e2e8f0',
      boxShadow: '0 4px 20px rgba(15,23,42,0.06)',
      overflow: 'hidden',
    }}>
      {/* Panel Header */}
      <div style={{
        padding: '24px 28px',
        borderBottom: '1px solid #f1f5f9',
        background: 'linear-gradient(180deg, #fafbfd 0%, #ffffff 100%)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: '#eff6ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#2563eb',
            }}>
              <Award size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Global Site Statistics & Counters
              </h2>
              <p style={{ fontSize: 13, color: '#64748b', margin: '3px 0 0 0' }}>
                Control the 4 key highlight stats shown on the Homepage, About page, Modals, and across the entire platform.
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {autoSuggestions && (
            <button
              type="button"
              onClick={handleApplyAutoCount}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 14px',
                borderRadius: 8,
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                fontSize: 12,
                fontWeight: 600,
                color: '#334155',
                cursor: 'pointer',
              }}
            >
              <Sparkles size={14} color="#6366f1" />
              Auto DB Count
            </button>
          )}

          <button
            type="button"
            onClick={handleResetDefaults}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              borderRadius: 8,
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              fontSize: 12,
              fontWeight: 600,
              color: '#334155',
              cursor: 'pointer',
            }}
          >
            <RotateCcw size={14} />
            Reset Defaults
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 18px',
              borderRadius: 8,
              border: 'none',
              background: hasChanges ? '#1d4ed8' : '#0f172a',
              color: '#ffffff',
              fontSize: 13,
              fontWeight: 700,
              cursor: saving ? 'not-allowed' : 'pointer',
              boxShadow: hasChanges ? '0 2px 10px rgba(29,78,216,0.35)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            <Save size={15} />
            {saving ? 'Saving...' : hasChanges ? 'Save Changes *' : 'Saved'}
          </button>
        </div>
      </div>

      {/* Live Preview Bar */}
      <div style={{
        padding: '24px 28px',
        background: '#f8fafc',
        borderBottom: '1px solid #e2e8f0',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#64748b' }}>
            Live Website Preview (Hero Stats Bar)
          </span>
          <span style={{ fontSize: 12, color: '#94a3b8', fontStyle: 'italic' }}>
            Changes update live here
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
          background: '#ffffff',
          padding: 16,
          borderRadius: 14,
          border: '1px solid #e2e8f0',
        }}>
          {stats.map((s, idx) => {
            const IconComp = ICON_MAP[s.icon] || Award
            return (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '12px 16px',
                  borderRadius: 10,
                  background: '#ffffff',
                  border: '1px solid #f1f5f9',
                }}
              >
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: s.iconBg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: s.iconColor,
                  flexShrink: 0,
                }}>
                  <IconComp size={22} />
                </div>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', lineHeight: 1.1 }}>
                    {s.value || '—'}
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em', marginTop: 3 }}>
                    {s.label || '—'}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Editable Fields Grid */}
      <div style={{
        padding: '28px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 20,
      }}>
        {stats.map((item, idx) => {
          const IconComp = ICON_MAP[item.icon] || Award
          return (
            <div
              key={idx}
              style={{
                borderRadius: 12,
                border: '1px solid #e2e8f0',
                padding: '20px',
                background: '#ffffff',
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{
                  fontSize: 11,
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  padding: '3px 8px',
                  borderRadius: 6,
                  background: item.iconBg,
                  color: item.iconColor,
                }}>
                  Position {idx + 1}
                </span>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <label style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Icon:</label>
                  <select
                    value={item.icon}
                    onChange={(e) => handleUpdateField(idx, 'icon', e.target.value)}
                    style={{
                      padding: '4px 8px',
                      borderRadius: 6,
                      border: '1px solid #cbd5e1',
                      fontSize: 12,
                      fontWeight: 600,
                      color: '#0f172a',
                      background: '#ffffff',
                    }}
                  >
                    <option value="users">Users (Professionals)</option>
                    <option value="book">Book (Programs)</option>
                    <option value="award">Award (Expertise)</option>
                    <option value="trending">Trending (Placement)</option>
                    <option value="graduation">Graduation (Alumni)</option>
                    <option value="star">Star (Rating)</option>
                    <option value="shield">Shield (Certified)</option>
                    <option value="clock">Clock (Duration)</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                  Display Value:
                </label>
                <input
                  type="text"
                  value={item.value}
                  onChange={(e) => handleUpdateField(idx, 'value', e.target.value)}
                  placeholder="e.g. 5,000+"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    fontSize: 14,
                    fontWeight: 700,
                    color: '#0f172a',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                  Label Text:
                </label>
                <input
                  type="text"
                  value={item.label}
                  onChange={(e) => handleUpdateField(idx, 'label', e.target.value)}
                  placeholder="e.g. Professionals Trained"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#334155',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>
                    Icon Color:
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <input
                      type="color"
                      value={item.iconColor}
                      onChange={(e) => handleUpdateField(idx, 'iconColor', e.target.value)}
                      style={{ width: 28, height: 28, border: 'none', borderRadius: 4, cursor: 'pointer', padding: 0 }}
                    />
                    <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#475569' }}>{item.iconColor}</span>
                  </div>
                </div>

                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>
                    Tile Bg:
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <input
                      type="color"
                      value={item.iconBg.length === 7 ? item.iconBg : '#EFF6FF'}
                      onChange={(e) => handleUpdateField(idx, 'iconBg', e.target.value)}
                      style={{ width: 28, height: 28, border: 'none', borderRadius: 4, cursor: 'pointer', padding: 0 }}
                    />
                    <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#475569' }}>{item.iconBg}</span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { Eye, EyeOff, ArrowRight, ShieldCheck, LockKeyhole, BadgeCheck, Users2, Shield } from 'lucide-react'

const features = [
  { label: 'Protected admin access', icon: LockKeyhole },
  { label: 'Role-based permissions', icon: BadgeCheck },
  { label: 'Secure session cookies', icon: ShieldCheck },
  { label: 'Content and user control', icon: Users2 },
]

export default function AdminLoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/auth/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Login successful')
        window.location.href = '/admin/dashboard'
      } else {
        toast.error(data.message || 'Invalid credentials')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = (field: string) => ({
    width: '100%',
    borderRadius: 14,
    border: focusedField === field ? '1.5px solid #2563eb' : '1.5px solid #e8ecf0',
    background: focusedField === field ? '#fff' : '#f8fafc',
    padding: '13px 16px',
    fontSize: 13,
    color: '#0f172a',
    outline: 'none',
    boxShadow: focusedField === field ? '0 0 0 4px rgba(37,99,235,0.09)' : 'none',
    transition: 'border 0.15s, box-shadow 0.15s, background 0.15s',
    boxSizing: 'border-box' as const,
  })

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #071124 0%, #0a1730 48%, #0f2148 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Subtle dot grid overlay */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
      }} />

      {/* Two-panel card */}
      <div style={{
        position: 'relative', zIndex: 1,
        width: '100%', maxWidth: 1040,
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        borderRadius: 28,
        overflow: 'hidden',
        boxShadow: '0 40px 120px rgba(2,6,23,0.55)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}>

        {/* ── Left: brand panel ───────────────────────────────── */}
        <div style={{
          background: '#08142b',
          padding: '48px 44px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Glow */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'radial-gradient(circle at 0% 0%, rgba(34,211,238,0.14) 0%, transparent 50%), radial-gradient(circle at 100% 100%, rgba(37,99,235,0.16) 0%, transparent 50%)',
          }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            {/* Logo row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 32 }}>
              <div style={{
                width: 52, height: 52, borderRadius: 14,
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 15, fontWeight: 900, color: '#fff',
                letterSpacing: '-0.02em',
              }}>RI</div>
              <div>
                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#67e8f9', marginBottom: 4 }}>
                  Recruitment Institute
                </p>
                <p style={{ fontSize: 12, color: '#94a3b8' }}>Admin portal access</p>
              </div>
            </div>

            {/* Security badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.2)',
              borderRadius: 100, padding: '6px 14px',
              fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase',
              color: '#a5f3fc', marginBottom: 28,
            }}>
              <Shield style={{ width: 12, height: 12 }} />
              Secure enterprise access
            </div>

            <h1 style={{
              fontSize: 40, fontWeight: 900, color: '#fff',
              letterSpacing: '-0.04em', lineHeight: 1.15, marginBottom: 16,
            }}>
              Admin<br />Login
            </h1>
            <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.75, maxWidth: 280 }}>
              Sign in to manage candidates, students, memberships, courses, blog content, and site-wide administrative workflows.
            </p>
          </div>

          {/* Feature tiles */}
          <div style={{ position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 36 }}>
            {features.map(({ label, icon: Icon }) => (
              <div key={label} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 14, padding: '12px 14px',
              }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 9,
                  background: 'rgba(255,255,255,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Icon style={{ width: 14, height: 14, color: '#67e8f9' }} />
                </div>
                <span style={{ fontSize: 11, fontWeight: 500, color: '#cbd5e1', lineHeight: 1.4 }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: form panel ───────────────────────────────── */}
        <div style={{ background: '#ffffff', padding: '48px 44px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{
              width: 64, height: 64, borderRadius: 18, margin: '0 auto 18px',
              background: 'linear-gradient(135deg, #2563eb, #06b6d4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 16px 48px rgba(37,99,235,0.28)',
            }}>
              <ShieldCheck style={{ width: 30, height: 30, color: '#fff' }} />
            </div>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.26em', textTransform: 'uppercase', color: '#2563eb', marginBottom: 8 }}>
              Admin Portal
            </p>
            <h2 style={{ fontSize: 28, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.03em', marginBottom: 10 }}>
              Welcome Back
            </h2>
            <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.7 }}>
              Enter your credentials to access the Recruitment Institute admin dashboard.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#64748b', marginBottom: 8 }}>
                Email Address
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                placeholder="admin@recruitmentinstitute.in"
                style={inputStyle('email')}
              />
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#64748b', marginBottom: 8 }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Your password"
                  style={{ ...inputStyle('password'), paddingRight: 48 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#94a3b8', display: 'flex', alignItems: 'center',
                  }}
                >
                  {showPass ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
                </button>
              </div>
            </div>

            {/* Remember / Forgot */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#64748b', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  style={{ width: 15, height: 15, accentColor: '#2563eb', cursor: 'pointer' }}
                />
                Remember me
              </label>
              <button
                type="button"
                style={{ background: 'none', border: 'none', fontSize: 13, fontWeight: 600, color: '#2563eb', cursor: 'pointer', padding: 0 }}
              >
                Forgot password?
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                width: '100%', padding: '15px 24px',
                background: loading ? '#93c5fd' : 'linear-gradient(135deg, #2563eb, #06b6d4)',
                border: 'none', borderRadius: 14,
                fontSize: 14, fontWeight: 700, color: '#fff',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 12px 36px rgba(37,99,235,0.28)',
                transition: 'opacity 0.15s, box-shadow 0.15s',
                letterSpacing: '0.01em',
              }}
            >
              {loading ? 'Signing in…' : 'Sign In'}
              {!loading && <ArrowRight style={{ width: 16, height: 16 }} />}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

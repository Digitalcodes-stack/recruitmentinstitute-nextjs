'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, X, Check, Loader2, Lock, User, Mail, Phone, MapPin, AlertCircle } from 'lucide-react'

export interface UserProfileData {
  id?: number
  name: string
  email: string
  phone?: string | null
  city?: string | null
  gender?: string | null
  address?: string | null
  type: string
}

interface Props {
  initialProfile: UserProfileData
  onProfileUpdated?: (updated: UserProfileData) => void
}

export default function UserProfileClient({ initialProfile, onProfileUpdated }: Props) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const [form, setForm] = useState({
    name: initialProfile.name || '',
    email: initialProfile.email || '',
    phone: initialProfile.phone || '',
    city: initialProfile.city || '',
    gender: initialProfile.gender || '',
    address: initialProfile.address || '',
    password: '',
    confirmPassword: '',
  })

  function openModal() {
    setForm({
      name: initialProfile.name || '',
      email: initialProfile.email || '',
      phone: initialProfile.phone || '',
      city: initialProfile.city || '',
      gender: initialProfile.gender || '',
      address: initialProfile.address || '',
      password: '',
      confirmPassword: '',
    })
    setMessage(null)
    setIsOpen(true)
  }

  function closeModal() {
    if (busy) return
    setIsOpen(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMessage(null)

    if (!form.name.trim()) {
      setMessage({ type: 'error', text: 'Full Name is required.' })
      return
    }
    if (!form.email.trim() || !form.email.includes('@')) {
      setMessage({ type: 'error', text: 'Please provide a valid email address.' })
      return
    }
    if (form.password) {
      if (form.password.length < 6) {
        setMessage({ type: 'error', text: 'Password must be at least 6 characters long.' })
        return
      }
      if (form.password !== form.confirmPassword) {
        setMessage({ type: 'error', text: 'Passwords do not match.' })
        return
      }
    }

    setBusy(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          phone: form.phone.trim() || null,
          contact: form.phone.trim() || null,
          city: form.city.trim() || null,
          gender: form.gender.trim() || null,
          address: form.address.trim() || null,
          password: form.password ? form.password.trim() : undefined,
        }),
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to update profile')
      }

      setMessage({ type: 'success', text: 'Profile updated successfully!' })

      const updatedProfile: UserProfileData = {
        ...initialProfile,
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim() || null,
        city: form.city.trim() || null,
        gender: form.gender.trim() || null,
        address: form.address.trim() || null,
      }

      if (onProfileUpdated) {
        onProfileUpdated(updatedProfile)
      }

      setTimeout(() => {
        closeModal()
        router.refresh()
      }, 1000)
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Something went wrong.' })
    } finally {
      setBusy(false)
    }
  }

  const isStudent = initialProfile.type === 'student'

  return (
    <>
      <button
        onClick={openModal}
        type="button"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          width: '100%',
          marginTop: 12,
          padding: '10px 16px',
          borderRadius: 12,
          background: 'linear-gradient(135deg, #1E40AF 0%, #2563EB 100%)',
          color: '#ffffff',
          fontSize: 13,
          fontWeight: 700,
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(37,99,235,0.25)',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
      >
        <Pencil style={{ width: 14, height: 14 }} />
        Edit Profile
      </button>

      {isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal()
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: 20,
              width: '100%',
              maxWidth: 540,
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid #e2e8f0',
              animation: 'profileModalSlideIn 0.2s ease-out',
            }}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '20px 24px',
                borderBottom: '1px solid #f1f5f9',
                background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
              }}
            >
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: 0 }}>Edit Your Profile</h3>
                <p style={{ fontSize: 13, color: '#64748b', margin: '3px 0 0' }}>Update your personal details and account credentials</p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                disabled={busy}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: 6,
                  borderRadius: 8,
                  display: 'flex',
                }}
              >
                <X style={{ width: 20, height: 20 }} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {message && (
                <div
                  style={{
                    padding: '12px 16px',
                    borderRadius: 12,
                    fontSize: 13,
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    background: message.type === 'success' ? '#f0fdf4' : '#fef2f2',
                    border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
                    color: message.type === 'success' ? '#166534' : '#b91c1c',
                  }}
                >
                  {message.type === 'success' ? <Check style={{ width: 16, height: 16 }} /> : <AlertCircle style={{ width: 16, height: 16 }} />}
                  <span>{message.text}</span>
                </div>
              )}

              {/* Basic Details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                    Full Name <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <User style={{ position: 'absolute', left: 12, top: 12, width: 16, height: 16, color: '#94a3b8' }} />
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                      placeholder="e.g. Rahul Sharma"
                      style={{
                        width: '100%',
                        padding: '10px 14px 10px 38px',
                        borderRadius: 10,
                        border: '1px solid #cbd5e1',
                        fontSize: 14,
                        color: '#0f172a',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                    Email Address <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail style={{ position: 'absolute', left: 12, top: 12, width: 16, height: 16, color: '#94a3b8' }} />
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      required
                      placeholder="you@example.com"
                      style={{
                        width: '100%',
                        padding: '10px 14px 10px 38px',
                        borderRadius: 10,
                        border: '1px solid #cbd5e1',
                        fontSize: 14,
                        color: '#0f172a',
                        outline: 'none',
                      }}
                    />
                  </div>
                  <span style={{ fontSize: 11, color: '#64748b', marginTop: 4, display: 'block' }}>
                    This is your primary sign-in ID. Your session will remain active if changed.
                  </span>
                </div>

                <div style={{ gridColumn: isStudent ? 'span 1' : 'span 2' }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                    Phone / Contact Number
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Phone style={{ position: 'absolute', left: 12, top: 12, width: 16, height: 16, color: '#94a3b8' }} />
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="e.g. 9876543210"
                      style={{
                        width: '100%',
                        padding: '10px 14px 10px 38px',
                        borderRadius: 10,
                        border: '1px solid #cbd5e1',
                        fontSize: 14,
                        color: '#0f172a',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>

                {isStudent && (
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                      City / Location
                    </label>
                    <div style={{ position: 'relative' }}>
                      <MapPin style={{ position: 'absolute', left: 12, top: 12, width: 16, height: 16, color: '#94a3b8' }} />
                      <input
                        type="text"
                        value={form.city}
                        onChange={(e) => setForm({ ...form, city: e.target.value })}
                        placeholder="e.g. Mumbai"
                        style={{
                          width: '100%',
                          padding: '10px 14px 10px 38px',
                          borderRadius: 10,
                          border: '1px solid #cbd5e1',
                          fontSize: 14,
                          color: '#0f172a',
                          outline: 'none',
                        }}
                      />
                    </div>
                  </div>
                )}

                {isStudent && (
                  <>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                        Gender
                      </label>
                      <select
                        value={form.gender}
                        onChange={(e) => setForm({ ...form, gender: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: 10,
                          border: '1px solid #cbd5e1',
                          fontSize: 14,
                          color: '#0f172a',
                          background: '#fff',
                          outline: 'none',
                        }}
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                        Residential Address
                      </label>
                      <input
                        type="text"
                        value={form.address}
                        onChange={(e) => setForm({ ...form, address: e.target.value })}
                        placeholder="Address / Area"
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: 10,
                          border: '1px solid #cbd5e1',
                          fontSize: 14,
                          color: '#0f172a',
                          outline: 'none',
                        }}
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Password Section */}
              <div
                style={{
                  marginTop: 6,
                  padding: 16,
                  borderRadius: 14,
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Lock style={{ width: 14, height: 14, color: '#64748b' }} />
                  <span style={{ fontSize: 12, fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Change Password (Optional)
                  </span>
                </div>
                <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>Leave blank if you wish to keep your current password.</p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                      New Password
                    </label>
                    <input
                      type="password"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder="Min 6 characters"
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 8,
                        border: '1px solid #cbd5e1',
                        fontSize: 13,
                        color: '#0f172a',
                        outline: 'none',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      value={form.confirmPassword}
                      onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                      placeholder="Repeat new password"
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 8,
                        border: '1px solid #cbd5e1',
                        fontSize: 13,
                        color: '#0f172a',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={busy}
                  style={{
                    padding: '10px 18px',
                    borderRadius: 10,
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#475569',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: busy ? 'not-allowed' : 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '10px 22px',
                    borderRadius: 10,
                    background: 'linear-gradient(135deg, #1E40AF 0%, #2563EB 100%)',
                    color: '#ffffff',
                    fontSize: 13,
                    fontWeight: 700,
                    border: 'none',
                    cursor: busy ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 12px rgba(37,99,235,0.25)',
                  }}
                >
                  {busy ? <Loader2 style={{ width: 14, height: 14, animation: 'spin 1s linear infinite' }} /> : <Check style={{ width: 14, height: 14 }} />}
                  {busy ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

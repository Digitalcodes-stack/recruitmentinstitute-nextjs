'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import {
  Eye, EyeOff, ArrowRight, ChevronRight, Info,
  Mail, Lock, Shield, Award, Users, CheckCircle2, GraduationCap,
  User, Phone, MapPin, Sparkles,
} from 'lucide-react'
import WhatsAppIcon from '@/components/shared/WhatsAppIcon'

type Mode = 'student' | 'membership'
type ActiveTab = 'login' | 'register' | 'forgot'

const fieldLabel: React.CSSProperties = {
  display: 'block',
  fontSize: 11,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '.13em',
  color: '#475569',
  marginBottom: 7,
}

const inputWrap: React.CSSProperties = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
}

const inputIcon: React.CSSProperties = {
  position: 'absolute',
  left: 14,
  width: 16,
  height: 16,
  color: '#94A3B8',
  pointerEvents: 'none',
  flexShrink: 0,
}

const trustPoints = [
  { icon: Users, val: '12,000+', lbl: 'Learners trained', color: '#1D4ED8', bg: '#EFF6FF', border: '#BFDBFE' },
  { icon: Award, val: '4.8/5', lbl: 'Average rating', color: '#059669', bg: '#F0FDF4', border: '#BBF7D0' },
  { icon: Shield, val: '10+', lbl: 'Years of industry trust', color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
  { icon: CheckCircle2, val: '200+', lbl: 'Hiring partners', color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE' },
]

export default function PortalLoginClient({
  mode = 'student',
  endpoint = '/api/auth/student/login',
  title = 'Student Learning Portal',
  subtitle = 'Sign in or register to access your courses',
  helperText = 'Sign in to access your sessions, syllabus downloads, and assessments.',
  ctaLabel = 'Student',
  joinHref = '/student-membership',
}: {
  mode?: Mode
  endpoint?: string
  title?: string
  subtitle?: string
  helperText?: string
  ctaLabel?: string
  joinHref?: string
}) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('login')
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    password: '',
    confirmPassword: '',
  })
  const [forgotEmail, setForgotEmail] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Login successful! Redirecting...')
        window.location.href = '/profile'
      } else {
        toast.error(data.message || 'Invalid email or password')
      }
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (registerForm.password !== registerForm.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    if (registerForm.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/student/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: registerForm.name,
          email: registerForm.email,
          contact: registerForm.phone,
          city: registerForm.city,
          password: registerForm.password,
          confirmPassword: registerForm.confirmPassword,
        }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Account created successfully! Welcome to Recruitment Institute.')
        window.location.href = '/profile'
      } else {
        toast.error(data.message || 'Registration failed. Please try again.')
      }
    } catch {
      toast.error('Network error during registration')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      })
      const data = await res.json()
      toast.success(data.message || 'If registered, a reset link has been sent.')
      setActiveTab('login')
    } catch {
      toast.error('Failed to request password reset')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        .pl-tab-btn {
          flex: 1; padding: 12px 14px; text-align: center;
          font-size: 12px; font-weight: 800; letter-spacing: .1em;
          text-transform: uppercase; border: none; background: transparent;
          cursor: pointer; border-radius: 10px;
          transition: all .2s ease; color: #64748B;
        }
        .pl-tab-btn.active {
          background: linear-gradient(135deg,#1D4ED8,#2563EB);
          color: #fff; box-shadow: 0 4px 14px rgba(29,78,216,.28);
        }
        .pl-tab-btn:not(.active):hover { color: #0F172A; background: #F1F5F9; }

        .pl-input {
          width: 100%; border: 1.5px solid #E2E8F0; border-radius: 11px;
          padding: 12px 14px 12px 42px; font-size: 14px; font-weight: 500;
          color: #0F172A; background: #FAFBFC; outline: none;
          transition: border-color .2s, box-shadow .2s, background .2s;
          font-family: inherit;
        }
        .pl-input::placeholder { color: #CBD5E1; }
        .pl-input:focus { border-color: #2563EB; background: #fff; box-shadow: 0 0 0 4px rgba(37,99,235,.1); }

        .pl-submit {
          width: 100%; padding: 14px; border: none; border-radius: 11px;
          background: linear-gradient(135deg,#1D4ED8,#2563EB);
          color: #fff; font-size: 14px; font-weight: 700; letter-spacing: -.01em;
          cursor: pointer; box-shadow: 0 8px 22px rgba(29,78,216,.35);
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: transform .2s, box-shadow .2s, opacity .2s;
          font-family: inherit;
        }
        .pl-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 12px 30px rgba(29,78,216,.45); }
        .pl-submit:disabled { opacity: .65; cursor: not-allowed; }

        .pl-link { font-size: 12px; font-weight: 700; color: #1D4ED8; text-decoration: none; transition: color .18s; cursor: pointer; }
        .pl-link:hover { color: #1E40AF; }

        .pl-eye { position: absolute; right: 13px; background: none; border: none; cursor: pointer; color: #94A3B8; padding: 4px; transition: color .18s; }
        .pl-eye:hover { color: #475569; }

        .pl-crumb { color: #94A3B8; text-decoration: none; font-size: 13px; font-weight: 500; transition: color .18s; }
        .pl-crumb:hover { color: #CBD5E1; }

        .pl-trust { transition: transform .25s, box-shadow .25s; }
        .pl-trust:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(15,23,42,.1) !important; }

        @media (max-width: 1100px) {
          .pl-outer-grid { grid-template-columns: 1fr !important; }
          .pl-sidebar { display: none !important; }
        }
      `}</style>

      {/* HERO / HEADER BAND */}
      <div style={{
        background: 'linear-gradient(130deg,#060D1C 0%,#0B1629 40%,#0E1F3A 72%,#071120 100%)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div aria-hidden className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,.026) 1px,transparent 1px)', backgroundSize: '28px 28px', zIndex: 1 }} />
        <div aria-hidden className="absolute" style={{ top: -80, left: -60, width: 440, height: 440, background: 'radial-gradient(circle,rgba(29,78,216,.18) 0%,transparent 65%)', zIndex: 1 }} />
        <div aria-hidden className="absolute" style={{ bottom: -40, right: '25%', width: 300, height: 300, background: 'radial-gradient(circle,rgba(13,148,136,.1) 0%,transparent 65%)', zIndex: 1 }} />
        <div aria-hidden className="absolute top-0 left-0 right-0" style={{ height: 2, background: 'linear-gradient(90deg,transparent,#D97706 28%,#14B8A6 72%,transparent)', zIndex: 3 }} />

        <div className="container" style={{ position: 'relative', zIndex: 10, padding: '52px 0 64px' }}>
          <nav aria-label="breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 18 }}>
            <Link href="/" className="pl-crumb">Home</Link>
            <ChevronRight style={{ width: 13, height: 13, color: '#475569' }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: '#F59E0B' }}>Student Portal</span>
          </nav>
          <h1 style={{ fontSize: 'clamp(28px,3.5vw,48px)', fontWeight: 900, color: '#fff', lineHeight: 1.12, letterSpacing: '-.035em', marginBottom: 10 }}>
            {title}
          </h1>
          <p style={{ fontSize: 15, color: '#94A3B8', lineHeight: 1.7, maxWidth: 500 }}>
            {helperText}
          </p>
        </div>

        <div aria-hidden className="absolute bottom-0 left-0 right-0" style={{ height: 44, background: '#F1F5F9', clipPath: 'ellipse(55% 100% at 50% 100%)', zIndex: 10 }} />
      </div>

      {/* MAIN CONTENT */}
      <section style={{ background: '#F1F5F9', padding: '48px 0 80px' }}>
        <div className="container">
          <div className="pl-outer-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 340px', gap: 32, alignItems: 'start' }}>

            {/* FORM CARD */}
            <div style={{ background: '#fff', borderRadius: 24, border: '1.5px solid #E2E8F0', boxShadow: '0 10px 40px rgba(15,23,42,.08)', padding: '32px 32px 36px' }}>

              {/* TABS (Sign In / Register) */}
              <div style={{ display: 'flex', background: '#F8FAFC', padding: 4, borderRadius: 14, border: '1px solid #E2E8F0', marginBottom: 28 }}>
                <button
                  type="button"
                  onClick={() => setActiveTab('login')}
                  className={`pl-tab-btn ${activeTab === 'login' ? 'active' : ''}`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('register')}
                  className={`pl-tab-btn ${activeTab === 'register' ? 'active' : ''}`}
                >
                  Create Student Account
                </button>
              </div>

              {/* ─── TAB 1: LOGIN ─── */}
              {activeTab === 'login' && (
                <div>
                  <div style={{ marginBottom: 24 }}>
                    <h2 style={{ fontSize: 22, fontWeight: 900, color: '#0F172A', letterSpacing: '-.025em', margin: '0 0 6px' }}>
                      Welcome Back, Student
                    </h2>
                    <p style={{ fontSize: 13, color: '#64748B', margin: 0 }}>
                      Enter your credentials to access your live classes, recordings, and resources.
                    </p>
                  </div>

                  <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                    <div>
                      <label style={fieldLabel}>Email Address</label>
                      <div style={inputWrap}>
                        <Mail style={inputIcon} />
                        <input
                          type="email"
                          required
                          className="pl-input"
                          placeholder="student@example.com"
                          value={loginForm.email}
                          onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={fieldLabel}>Password</label>
                      <div style={inputWrap}>
                        <Lock style={inputIcon} />
                        <input
                          type={showPass ? 'text' : 'password'}
                          required
                          className="pl-input"
                          placeholder="Your password"
                          value={loginForm.password}
                          onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                          style={{ paddingRight: 42 }}
                        />
                        <button
                          type="button"
                          className="pl-eye"
                          onClick={() => setShowPass(!showPass)}
                          aria-label={showPass ? 'Hide password' : 'Show password'}
                        >
                          {showPass ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
                        </button>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: -6 }}>
                      <button
                        type="button"
                        onClick={() => setActiveTab('forgot')}
                        className="pl-link"
                        style={{ background: 'none', border: 'none', padding: 0 }}
                      >
                        Forgot Password?
                      </button>
                    </div>

                    <button type="submit" disabled={loading} className="pl-submit">
                      {loading ? 'Signing in…' : <>Sign In as Student <ArrowRight style={{ width: 15, height: 15 }} /></>}
                    </button>
                  </form>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0' }}>
                    <div style={{ flex: 1, height: 1, background: '#F1F5F9' }} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '.1em' }}>New to Recruitment Institute?</span>
                    <div style={{ flex: 1, height: 1, background: '#F1F5F9' }} />
                  </div>

                  <div style={{ textAlign: 'center', background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: 14, padding: '16px' }}>
                    <p style={{ fontSize: 13, color: '#64748B', margin: '0 0 6px' }}>Don&apos;t have a student account yet?</p>
                    <button
                      type="button"
                      onClick={() => setActiveTab('register')}
                      className="pl-link"
                      style={{ background: 'none', border: 'none', fontSize: 13 }}
                    >
                      Create Free Student Account →
                    </button>
                  </div>
                </div>
              )}

              {/* ─── TAB 2: REGISTER ─── */}
              {activeTab === 'register' && (
                <div>
                  <div style={{ marginBottom: 24 }}>
                    <h2 style={{ fontSize: 22, fontWeight: 900, color: '#0F172A', letterSpacing: '-.025em', margin: '0 0 6px' }}>
                      Register as a Student
                    </h2>
                    <p style={{ fontSize: 13, color: '#64748B', margin: 0 }}>
                      Instant access to course syllabi, live batch schedules, and free AI toolkits.
                    </p>
                  </div>

                  <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                      <label style={fieldLabel}>Full Name *</label>
                      <div style={inputWrap}>
                        <User style={inputIcon} />
                        <input
                          type="text"
                          required
                          className="pl-input"
                          placeholder="Priya Sharma"
                          value={registerForm.name}
                          onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={fieldLabel}>Email Address *</label>
                      <div style={inputWrap}>
                        <Mail style={inputIcon} />
                        <input
                          type="email"
                          required
                          className="pl-input"
                          placeholder="priya.sharma@example.com"
                          value={registerForm.email}
                          onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div>
                        <label style={fieldLabel}>Phone / WhatsApp</label>
                        <div style={inputWrap}>
                          <Phone style={inputIcon} />
                          <input
                            type="tel"
                            className="pl-input"
                            placeholder="+91 9876543210"
                            value={registerForm.phone}
                            onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                          />
                        </div>
                      </div>

                      <div>
                        <label style={fieldLabel}>City</label>
                        <div style={inputWrap}>
                          <MapPin style={inputIcon} />
                          <input
                            type="text"
                            className="pl-input"
                            placeholder="Pune / Mumbai"
                            value={registerForm.city}
                            onChange={(e) => setRegisterForm({ ...registerForm, city: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label style={fieldLabel}>Password *</label>
                      <div style={inputWrap}>
                        <Lock style={inputIcon} />
                        <input
                          type={showPass ? 'text' : 'password'}
                          required
                          className="pl-input"
                          placeholder="At least 6 characters"
                          value={registerForm.password}
                          onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                          style={{ paddingRight: 42 }}
                        />
                        <button
                          type="button"
                          className="pl-eye"
                          onClick={() => setShowPass(!showPass)}
                          aria-label={showPass ? 'Hide password' : 'Show password'}
                        >
                          {showPass ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label style={fieldLabel}>Confirm Password *</label>
                      <div style={inputWrap}>
                        <Lock style={inputIcon} />
                        <input
                          type={showPass ? 'text' : 'password'}
                          required
                          className="pl-input"
                          placeholder="Re-type your password"
                          value={registerForm.confirmPassword}
                          onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                        />
                      </div>
                    </div>

                    <button type="submit" disabled={loading} className="pl-submit" style={{ marginTop: 4 }}>
                      {loading ? 'Creating Account…' : <>Complete Registration <ArrowRight style={{ width: 15, height: 15 }} /></>}
                    </button>
                  </form>

                  <div style={{ textAlign: 'center', marginTop: 20 }}>
                    <span style={{ fontSize: 13, color: '#64748B' }}>Already registered? </span>
                    <button
                      type="button"
                      onClick={() => setActiveTab('login')}
                      className="pl-link"
                      style={{ background: 'none', border: 'none' }}
                    >
                      Sign in here
                    </button>
                  </div>
                </div>
              )}

              {/* ─── TAB 3: FORGOT PASSWORD ─── */}
              {activeTab === 'forgot' && (
                <div>
                  <div style={{ marginBottom: 24 }}>
                    <h2 style={{ fontSize: 22, fontWeight: 900, color: '#0F172A', letterSpacing: '-.025em', margin: '0 0 6px' }}>
                      Reset Your Password
                    </h2>
                    <p style={{ fontSize: 13, color: '#64748B', margin: 0 }}>
                      Enter your registered email and we&apos;ll send you a password reset link.
                    </p>
                  </div>

                  <form onSubmit={handleForgotSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                    <div>
                      <label style={fieldLabel}>Registered Email Address</label>
                      <div style={inputWrap}>
                        <Mail style={inputIcon} />
                        <input
                          type="email"
                          required
                          className="pl-input"
                          placeholder="your@email.com"
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                        />
                      </div>
                    </div>

                    <button type="submit" disabled={loading} className="pl-submit">
                      {loading ? 'Sending link…' : 'Send Password Reset Link'}
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('login')}
                      className="pl-link"
                      style={{ background: 'none', border: 'none', textAlign: 'center', marginTop: 8 }}
                    >
                      ← Back to Student Sign In
                    </button>
                  </form>
                </div>
              )}

            </div>

            {/* SIDEBAR */}
            <div className="pl-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ background: '#fff', borderRadius: 20, border: '1.5px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 20px rgba(15,23,42,.07)' }}>
                <div style={{ position: 'relative', height: 170 }}>
                  <Image
                    src="/assets/images/banner/home-students-banner.jpg"
                    alt="Student Learning Portal"
                    fill
                    style={{ objectFit: 'cover', objectPosition: 'top center' }}
                    sizes="340px"
                  />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom,rgba(6,13,28,.15) 0%,rgba(6,13,28,.85) 100%)' }} />
                  <div style={{ position: 'absolute', bottom: 16, left: 16, right: 16 }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 10px', borderRadius: 999, background: 'rgba(94,234,212,.15)', border: '1px solid rgba(94,234,212,.3)', marginBottom: 6 }}>
                      <Sparkles style={{ width: 11, height: 11, color: '#5EEAD4' }} />
                      <span style={{ fontSize: 10, fontWeight: 800, color: '#5EEAD4', textTransform: 'uppercase', letterSpacing: '.14em' }}>Official Student Portal</span>
                    </div>
                    <p style={{ fontSize: 15, fontWeight: 800, color: '#fff', lineHeight: 1.35, margin: 0 }}>Recruitment Institute</p>
                  </div>
                </div>

                <div style={{ padding: '20px 20px 4px' }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '.14em', margin: '0 0 14px' }}>Why choose us</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                    {trustPoints.map(({ icon: Icon, val, lbl, color, bg, border }) => (
                      <div key={lbl} className="pl-trust" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 12, background: '#FAFBFC', border: '1px solid #F1F5F9', boxShadow: '0 2px 8px rgba(15,23,42,.04)' }}>
                        <div style={{ width: 36, height: 36, borderRadius: 9, background: bg, border: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Icon style={{ width: 16, height: 16, color }} />
                        </div>
                        <div>
                          <p style={{ fontSize: 18, fontWeight: 900, color, margin: 0, lineHeight: 1, letterSpacing: '-.02em' }}>{val}</p>
                          <p style={{ fontSize: 10, fontWeight: 600, color: '#94A3B8', margin: 0, marginTop: 2 }}>{lbl}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ background: 'linear-gradient(135deg,#0B1629,#0F172A)', borderRadius: 18, border: '1px solid rgba(255,255,255,.07)', padding: '24px 22px', boxShadow: '0 4px 20px rgba(15,23,42,.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <GraduationCap style={{ width: 16, height: 16, color: '#F59E0B' }} />
                  <p style={{ fontSize: 11, fontWeight: 800, color: '#FCD34D', textTransform: 'uppercase', letterSpacing: '.16em', margin: 0 }}>Student Access Includes</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    'Live & recorded sessions from senior trainers',
                    'Attendance-unlocked session syllabus notes & PDFs',
                    'Hands-on AI recruiter assessment & certification',
                    'Dedicated 100% placement support & community',
                  ].map((b) => (
                    <div key={b} style={{ display: 'flex', alignItems: 'flex-start', gap: 9 }}>
                      <CheckCircle2 style={{ width: 14, height: 14, color: '#5EEAD4', flexShrink: 0, marginTop: 1 }} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#CBD5E1', lineHeight: 1.55 }}>{b}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: '#fff', borderRadius: 16, border: '1.5px solid #E2E8F0', padding: '18px 20px', boxShadow: '0 2px 12px rgba(15,23,42,.05)' }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#0F172A', margin: '0 0 6px' }}>Need assistance?</p>
                <p style={{ fontSize: 12, color: '#64748B', lineHeight: 1.65, margin: '0 0 12px' }}>Our academic coordinators are available via WhatsApp.</p>
                <a
                  href="https://wa.me/917385204165?text=Hi%2C%20I%20need%20help%20with%20my%20Student%20Portal%20access."
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700,
                    color: '#059669', textDecoration: 'none',
                  }}
                >
                  <span style={{ width: 26, height: 26, borderRadius: '50%', background: '#F0FDF4', border: '1px solid #BBF7D0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <WhatsAppIcon size={15} color="#25D366" />
                  </span>
                  WhatsApp Counsellor (+91 7385204165)
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

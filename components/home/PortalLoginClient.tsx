'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import {
  Eye, EyeOff, ArrowRight, ChevronRight, Info,
  Mail, Lock, Shield, Award, Users, CheckCircle2, GraduationCap,
} from 'lucide-react'

type Mode = 'student' | 'membership'

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
  mode,
  endpoint,
  title,
  subtitle,
  helperText,
  ctaLabel,
  joinHref,
}: {
  mode: Mode
  endpoint: string
  title: string
  subtitle: string
  helperText: string
  ctaLabel: string
  joinHref: string
}) {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Login successful')
        window.location.href = '/profile'
      } else {
        toast.error(data.message || 'Invalid credentials')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
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

        .pl-link { font-size: 12px; font-weight: 700; color: #1D4ED8; text-decoration: none; transition: color .18s; }
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
            <span style={{ fontSize: 13, fontWeight: 600, color: '#F59E0B' }}>Portal Access</span>
          </nav>
          <h1 style={{ fontSize: 'clamp(28px,3.5vw,48px)', fontWeight: 900, color: '#fff', lineHeight: 1.12, letterSpacing: '-.035em', marginBottom: 10 }}>
            {title}
          </h1>
          <p style={{ fontSize: 15, color: '#64748B', lineHeight: 1.7, maxWidth: 440 }}>
            {helperText}
          </p>
        </div>

        <div aria-hidden className="absolute bottom-0 left-0 right-0" style={{ height: 44, background: '#F1F5F9', clipPath: 'ellipse(55% 100% at 50% 100%)', zIndex: 10 }} />
      </div>

      {/* MAIN CONTENT */}
      <section style={{ background: '#F1F5F9', padding: '56px 0 80px' }}>
        <div className="container">
          <div className="pl-outer-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 320px', gap: 28, alignItems: 'start' }}>

            {/* FORM CARD */}
            <div style={{ background: '#fff', borderRadius: 22, border: '1.5px solid #E2E8F0', boxShadow: '0 8px 40px rgba(15,23,42,.09)', padding: '32px 32px 36px' }}>
              <div style={{ marginBottom: 28 }}>
                <h2 style={{ fontSize: 22, fontWeight: 900, color: '#0F172A', letterSpacing: '-.025em', margin: '0 0 6px' }}>{subtitle}</h2>
                <p style={{ fontSize: 13, color: '#64748B', margin: 0 }}>Sign in to access your dashboard and resources</p>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '14px 16px', borderRadius: 12, background: '#EFF6FF', border: '1px solid #BFDBFE' }}>
                  <Info style={{ width: 16, height: 16, color: '#1D4ED8', flexShrink: 0, marginTop: 1 }} />
                  <p style={{ fontSize: 11, fontWeight: 600, color: '#1D4ED8', lineHeight: 1.7, margin: 0 }}>
                    This portal is for approved {mode} accounts only.
                  </p>
                </div>

                <div>
                  <label style={fieldLabel}>Email Address</label>
                  <div style={inputWrap}>
                    <Mail style={inputIcon} />
                    <input type="email" required className="pl-input" placeholder="your@email.com"
                      value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  </div>
                </div>

                <div>
                  <label style={fieldLabel}>Password</label>
                  <div style={inputWrap}>
                    <Lock style={inputIcon} />
                    <input type={showPass ? 'text' : 'password'} required className="pl-input" placeholder="Your password"
                      value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                      style={{ paddingRight: 42 }} />
                    <button type="button" className="pl-eye" onClick={() => setShowPass(!showPass)} aria-label={showPass ? 'Hide password' : 'Show password'}>
                      {showPass ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: -6 }}>
                  <Link href="/candidate-login" className="pl-link">Candidate Login</Link>
                  <Link href="/candidate-login" className="pl-link">Forgot Password?</Link>
                </div>

                <button type="submit" disabled={loading} className="pl-submit">
                  {loading ? 'Signing in…' : <>Login as {ctaLabel} <ArrowRight style={{ width: 15, height: 15 }} /></>}
                </button>
              </form>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '22px 0' }}>
                <div style={{ flex: 1, height: 1, background: '#F1F5F9' }} />
                <span style={{ fontSize: 11, fontWeight: 600, color: '#CBD5E1', textTransform: 'uppercase', letterSpacing: '.1em' }}>New here?</span>
                <div style={{ flex: 1, height: 1, background: '#F1F5F9' }} />
              </div>

              <div style={{ textAlign: 'center', background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: 11, padding: '14px 16px' }}>
                <p style={{ fontSize: 13, color: '#64748B', margin: '0 0 4px' }}>Don&apos;t have an account yet?</p>
                <Link href={joinHref} className="pl-link" style={{ fontSize: 13 }}>
                  Join {ctaLabel} →
                </Link>
              </div>
            </div>

            {/* SIDEBAR */}
            <div className="pl-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ background: '#fff', borderRadius: 18, border: '1.5px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 20px rgba(15,23,42,.07)' }}>
                <div style={{ position: 'relative', height: 170 }}>
                  <Image src="/assets/images/banner/home-students-banner.jpg" alt="Learning portal" fill
                    style={{ objectFit: 'cover', objectPosition: 'top center' }} sizes="320px" />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom,rgba(6,13,28,.1) 0%,rgba(6,13,28,.82) 100%)' }} />
                  <div style={{ position: 'absolute', bottom: 16, left: 16, right: 16 }}>
                    <p style={{ fontSize: 10, fontWeight: 800, color: '#5EEAD4', textTransform: 'uppercase', letterSpacing: '.18em', margin: '0 0 4px' }}>Secure Access</p>
                    <p style={{ fontSize: 15, fontWeight: 800, color: '#fff', lineHeight: 1.35, margin: 0 }}>Premium learning portal</p>
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
                  <GraduationCap style={{ width: 15, height: 15, color: '#F59E0B' }} />
                  <p style={{ fontSize: 11, fontWeight: 800, color: '#FCD34D', textTransform: 'uppercase', letterSpacing: '.16em', margin: 0 }}>Member Benefits</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    'Live & recorded sessions from industry mentors',
                    'Verified certificates recognised by hiring partners',
                    'Bank-grade encryption on every login',
                    'Dedicated placement assistance',
                  ].map((b) => (
                    <div key={b} style={{ display: 'flex', alignItems: 'flex-start', gap: 9 }}>
                      <CheckCircle2 style={{ width: 14, height: 14, color: '#5EEAD4', flexShrink: 0, marginTop: 1 }} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#CBD5E1', lineHeight: 1.55 }}>{b}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #E2E8F0', padding: '18px 18px', boxShadow: '0 2px 12px rgba(15,23,42,.05)' }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#0F172A', margin: '0 0 6px' }}>Need help signing in?</p>
                <p style={{ fontSize: 12, color: '#64748B', lineHeight: 1.65, margin: '0 0 12px' }}>Our team is available to help you access your account.</p>
                <a href="https://wa.me/917385204165" target="_blank" rel="noopener noreferrer" style={{
                  display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, fontWeight: 700,
                  color: '#059669', textDecoration: 'none',
                }}>
                  <span style={{ width: 22, height: 22, borderRadius: '50%', background: '#F0FDF4', border: '1px solid #BBF7D0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}>💬</span>
                  WhatsApp Us
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

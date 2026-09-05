'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import {
  Eye, EyeOff, ArrowLeft, Info, ArrowRight, ChevronRight,
  User, Mail, Lock, Phone, MapPin, CalendarDays, BookOpen,
  MessageSquare, CheckCircle2, Shield, Award, Users, Zap,
} from 'lucide-react'
import WhatsAppIcon from '@/components/shared/WhatsAppIcon'

type Tab = 'login' | 'signup' | 'forgot'

/* â"€â"€â"€ Shared field styles â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€ */
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

/* â"€â"€â"€ Trust sidebar data â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€ */
const trustPoints = [
  { icon: Users,        val: '5,000+', lbl: 'Trained professionals',  color: '#1D4ED8', bg: '#EFF6FF', border: '#BFDBFE' },
  { icon: Award,        val: '95%',    lbl: 'Placement success rate',  color: '#059669', bg: '#F0FDF4', border: '#BBF7D0' },
  { icon: Shield,       val: '10+',    lbl: 'Years of industry trust', color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
  { icon: CheckCircle2, val: '200+',   lbl: 'Hiring partners',         color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE' },
]

const courseOptions = [
  { value: 'end-to-end',       label: 'End-to-End Recruitment Training' },
  { value: 'beginners',        label: 'HR Courses for Beginners' },
  { value: 'entrepreneurship', label: 'HR Entrepreneurship Program' },
  { value: 'corporate',        label: 'HR Corporate Training Course' },
]

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   ROOT COMPONENT
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
export default function CandidateLoginClient() {
  const [tab, setTab] = useState<Tab>('login')

  return (
    <>
      <style>{`
        /* Breadcrumb */
        .cl-crumb { color: #94A3B8; text-decoration: none; font-size: 13px; font-weight: 500; transition: color .18s; }
        .cl-crumb:hover { color: #CBD5E1; }

        /* Tab buttons */
        .cl-tab {
          flex: 1; padding: 13px 8px; text-align: center;
          font-size: 11px; font-weight: 800; letter-spacing: .14em;
          text-transform: uppercase; border: none; background: transparent;
          cursor: pointer; position: relative; border-radius: 10px;
          transition: color .2s, background .2s;
          color: #94A3B8;
        }
        .cl-tab.active {
          background: linear-gradient(135deg,#1D4ED8,#2563EB);
          color: #fff; box-shadow: 0 4px 14px rgba(29,78,216,.28);
        }
        .cl-tab:not(.active):hover { color: #475569; background: #F1F5F9; }

        /* Inputs */
        .cl-input {
          width: 100%; border: 1.5px solid #E2E8F0; border-radius: 11px;
          padding: 12px 14px 12px 42px; font-size: 14px; font-weight: 500;
          color: #0F172A; background: #FAFBFC; outline: none;
          transition: border-color .2s, box-shadow .2s, background .2s;
          font-family: inherit;
        }
        .cl-input::placeholder { color: #CBD5E1; }
        .cl-input:focus { border-color: #2563EB; background: #fff; box-shadow: 0 0 0 4px rgba(37,99,235,.1); }
        .cl-input.no-icon { padding-left: 14px; }

        select.cl-input { appearance: none; cursor: pointer; }
        textarea.cl-input { resize: none; }

        /* Submit button */
        .cl-submit {
          width: 100%; padding: 14px; border: none; border-radius: 11px;
          background: linear-gradient(135deg,#1D4ED8,#2563EB);
          color: #fff; font-size: 14px; font-weight: 700; letter-spacing: -.01em;
          cursor: pointer; box-shadow: 0 8px 22px rgba(29,78,216,.35);
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: transform .2s, box-shadow .2s, opacity .2s;
          font-family: inherit;
        }
        .cl-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 12px 30px rgba(29,78,216,.45); }
        .cl-submit:disabled { opacity: .65; cursor: not-allowed; }

        /* Link button */
        .cl-link-btn {
          background: none; border: none; cursor: pointer; font-family: inherit;
          font-size: 12px; font-weight: 700; color: #1D4ED8;
          transition: color .18s;
        }
        .cl-link-btn:hover { color: #1E40AF; }

        /* Show password toggle */
        .cl-eye { position: absolute; right: 13px; background: none; border: none; cursor: pointer; color: #94A3B8; padding: 4px; transition: color .18s; }
        .cl-eye:hover { color: #475569; }

        /* Trust card */
        .cl-trust { transition: transform .25s, box-shadow .25s; }
        .cl-trust:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(15,23,42,.1) !important; }

        /* Responsive */
        @media (max-width: 1100px) {
          .cl-outer-grid { grid-template-columns: 1fr !important; }
          .cl-sidebar { display: none !important; }
        }
        @media (max-width: 700px) {
          .cl-hero-padding { padding: 40px 0 52px !important; }
          .cl-form-grid-2 { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          HERO / HEADER BAND
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <div style={{
        background: 'linear-gradient(130deg,#060D1C 0%,#0B1629 40%,#0E1F3A 72%,#071120 100%)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Dot grid */}
        <div aria-hidden className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,.026) 1px,transparent 1px)', backgroundSize: '28px 28px', zIndex: 1 }} />
        {/* Glows */}
        <div aria-hidden className="absolute" style={{ top: -80, left: -60, width: 440, height: 440, background: 'radial-gradient(circle,rgba(29,78,216,.18) 0%,transparent 65%)', zIndex: 1 }} />
        <div aria-hidden className="absolute" style={{ bottom: -40, right: '25%', width: 300, height: 300, background: 'radial-gradient(circle,rgba(13,148,136,.1) 0%,transparent 65%)', zIndex: 1 }} />
        {/* Gold/teal accent line */}
        <div aria-hidden className="absolute top-0 left-0 right-0" style={{ height: 2, background: 'linear-gradient(90deg,transparent,#D97706 28%,#14B8A6 72%,transparent)', zIndex: 3 }} />

        <div className="container cl-hero-padding" style={{ position: 'relative', zIndex: 10, padding: '52px 0 64px' }}>
          {/* Breadcrumb */}
          <nav aria-label="breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 18 }}>
            <Link href="/" className="cl-crumb">Home</Link>
            <ChevronRight style={{ width: 13, height: 13, color: '#475569' }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: '#F59E0B' }}>Portal Access</span>
          </nav>
          <h1 style={{ fontSize: 'clamp(28px,3.5vw,48px)', fontWeight: 900, color: '#fff', lineHeight: 1.12, letterSpacing: '-.035em', marginBottom: 10 }}>
            Member Access
          </h1>
          <p style={{ fontSize: 15, color: '#64748B', lineHeight: 1.7, maxWidth: 440 }}>
            Sign in to your learning dashboard or register a new candidate account to start your HR journey.
          </p>
        </div>

        {/* Wave clip */}
        <div aria-hidden className="absolute bottom-0 left-0 right-0" style={{ height: 44, background: '#F1F5F9', clipPath: 'ellipse(55% 100% at 50% 100%)', zIndex: 10 }} />
      </div>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          MAIN CONTENT
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section style={{ background: '#F1F5F9', padding: '56px 0 80px' }}>
        <div className="container">
          <div className="cl-outer-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 320px', gap: 28, alignItems: 'start' }}>

            {/* â"€â"€ FORM CARD â"€â"€ */}
            <div style={{ background: '#fff', borderRadius: 22, border: '1.5px solid #E2E8F0', boxShadow: '0 8px 40px rgba(15,23,42,.09)', overflow: 'hidden' }}>

              {/* Tab strip */}
              {tab !== 'forgot' && (
                <div style={{ padding: '14px 14px 0', background: '#fff', borderBottom: '1px solid #F1F5F9' }}>
                  <div style={{ display: 'flex', gap: 6, background: '#F8FAFC', borderRadius: 13, padding: 5, border: '1px solid #E2E8F0' }}>
                    {(['login', 'signup'] as Tab[]).map((t) => (
                      <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`cl-tab${tab === t ? ' active' : ''}`}
                      >
                        {t === 'login' ? 'Sign In' : 'Register Account'}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Form panels */}
              <div style={{ padding: '32px 32px 36px' }}>
                {tab === 'login'  && <LoginForm  onForgot={() => setTab('forgot')} />}
                {tab === 'signup' && <SignupForm  onSuccess={() => setTab('login')} />}
                {tab === 'forgot' && <ForgotPasswordForm onBack={() => setTab('login')} />}
              </div>
            </div>

            {/* â"€â"€ SIDEBAR â"€â"€ */}
            <div className="cl-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Why join card */}
              <div style={{ background: '#fff', borderRadius: 18, border: '1.5px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 20px rgba(15,23,42,.07)' }}>
                {/* Image */}
                <div style={{ position: 'relative', height: 170 }}>
                  <Image src="/assets/images/banner/home-students-banner.jpg" alt="HR training" fill
                    style={{ objectFit: 'cover', objectPosition: 'top center' }} sizes="320px" />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom,rgba(6,13,28,.1) 0%,rgba(6,13,28,.82) 100%)' }} />
                  <div style={{ position: 'absolute', bottom: 16, left: 16, right: 16 }}>
                    <p style={{ fontSize: 10, fontWeight: 800, color: '#5EEAD4', textTransform: 'uppercase', letterSpacing: '.18em', margin: '0 0 4px' }}>Recruitment Institute</p>
                    <p style={{ fontSize: 15, fontWeight: 800, color: '#fff', lineHeight: 1.35, margin: 0 }}>India&apos;s #1 HR Training Platform</p>
                  </div>
                </div>

                {/* Stats */}
                <div style={{ padding: '20px 20px 4px' }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '.14em', margin: '0 0 14px' }}>Why choose us</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                    {trustPoints.map(({ icon: Icon, val, lbl, color, bg, border }) => (
                      <div key={lbl} className="cl-trust" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 12, background: '#FAFBFC', border: '1px solid #F1F5F9', boxShadow: '0 2px 8px rgba(15,23,42,.04)' }}>
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

              {/* Benefit bullets card */}
              <div style={{ background: 'linear-gradient(135deg,#0B1629,#0F172A)', borderRadius: 18, border: '1px solid rgba(255,255,255,.07)', padding: '24px 22px', boxShadow: '0 4px 20px rgba(15,23,42,.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <Zap style={{ width: 15, height: 15, color: '#F59E0B' }} />
                  <p style={{ fontSize: 11, fontWeight: 800, color: '#FCD34D', textTransform: 'uppercase', letterSpacing: '.16em', margin: 0 }}>Member Benefits</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    'Access 200+ premium HR resources',
                    'Join 5,000+ active HR professionals',
                    'Dedicated placement assistance',
                    'Industry-recognised certification',
                    'Monthly live webinars & events',
                    'One-on-one mentor sessions',
                  ].map((b) => (
                    <div key={b} style={{ display: 'flex', alignItems: 'flex-start', gap: 9 }}>
                      <CheckCircle2 style={{ width: 14, height: 14, color: '#5EEAD4', flexShrink: 0, marginTop: 1 }} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#CBD5E1', lineHeight: 1.55 }}>{b}</span>
                    </div>
                  ))}
                </div>
                <Link href="/student-membership" style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  marginTop: 20, padding: '12px 16px', borderRadius: 10,
                  background: 'rgba(37,99,235,.2)', border: '1px solid rgba(37,99,235,.35)',
                  color: '#93C5FD', fontSize: 12, fontWeight: 700, textDecoration: 'none',
                  transition: 'background .2s',
                }}>
                  View All Benefits <ArrowRight style={{ width: 13, height: 13 }} />
                </Link>
              </div>

              {/* Help nudge */}
              <div style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #E2E8F0', padding: '18px 18px', boxShadow: '0 2px 12px rgba(15,23,42,.05)' }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#0F172A', margin: '0 0 6px' }}>Need help registering?</p>
                <p style={{ fontSize: 12, color: '#64748B', lineHeight: 1.65, margin: '0 0 12px' }}>Our team is available to guide you through the registration process.</p>
                <a href="https://wa.me/917385204165" target="_blank" rel="noopener noreferrer" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700,
                  color: '#059669', textDecoration: 'none',
                }}>
                  <span style={{ width: 26, height: 26, borderRadius: '50%', background: '#F0FDF4', border: '1px solid #BBF7D0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <WhatsAppIcon size={15} color="#25D366" />
                  </span>
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

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   LOGIN FORM
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function LoginForm({ onForgot }: { onForgot: () => void }) {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/auth/candidate/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Login successful!')
        window.location.href = '/profile'
      } else {
        toast.error(data.message || 'Login failed')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 22, fontWeight: 900, color: '#0F172A', letterSpacing: '-.025em', margin: '0 0 6px' }}>Welcome Back</h2>
        <p style={{ fontSize: 13, color: '#64748B', margin: 0 }}>Sign in to your learning dashboard profile</p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '14px 16px', borderRadius: 12, background: '#EFF6FF', border: '1px solid #BFDBFE' }}>
          <Info style={{ width: 16, height: 16, color: '#1D4ED8', flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: 11, fontWeight: 600, color: '#1D4ED8', lineHeight: 1.7, margin: 0 }}>
            This portal is for approved candidate accounts only. Admin users should sign in from the admin login page.
          </p>
        </div>

        {/* Email */}
        <div>
          <label style={fieldLabel}>Email Address</label>
          <div style={inputWrap}>
            <Mail style={inputIcon} />
            <input type="email" required className="cl-input" placeholder="your@email.com"
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
        </div>

        {/* Password */}
        <div>
          <label style={fieldLabel}>Password</label>
          <div style={inputWrap}>
            <Lock style={inputIcon} />
            <input type={showPass ? 'text' : 'password'} required className="cl-input" placeholder="Your password"
              value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
              style={{ paddingRight: 42 }} />
            <button type="button" className="cl-eye" onClick={() => setShowPass(!showPass)}>
              {showPass ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
            </button>
          </div>
        </div>

        {/* Forgot link */}
        <div style={{ textAlign: 'right', marginTop: -6 }}>
          <button type="button" className="cl-link-btn" onClick={onForgot}>
            Forgot Password?
          </button>
        </div>

        <button type="submit" disabled={loading} className="cl-submit">
          {loading ? 'Signing in…' : <>Sign In <ArrowRight style={{ width: 15, height: 15 }} /></>}
        </button>
      </form>

      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '22px 0' }}>
        <div style={{ flex: 1, height: 1, background: '#F1F5F9' }} />
        <span style={{ fontSize: 11, fontWeight: 600, color: '#CBD5E1', textTransform: 'uppercase', letterSpacing: '.1em' }}>New here?</span>
        <div style={{ flex: 1, height: 1, background: '#F1F5F9' }} />
      </div>

      <div style={{ textAlign: 'center', background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: 11, padding: '14px 16px' }}>
        <p style={{ fontSize: 13, color: '#64748B', margin: '0 0 4px' }}>Don&apos;t have an account yet?</p>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#1D4ED8', margin: 0, cursor: 'pointer' }}
          onClick={() => { /* trigger tab switch via parent "" label acts as hint */ }}>
          Switch to <strong style={{ color: '#1D4ED8' }}>Register Account</strong> tab above
        </p>
      </div>
    </div>
  )
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   SIGNUP FORM
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function SignupForm({ onSuccess }: { onSuccess: () => void }) {
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    birthdate: '', gender: '', address: '', city: '', state: '',
    phone: '', courseSelect: '', comments: '',
  })
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/candidate/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Registration submitted! Pending admin approval.')
        onSuccess()
      } else {
        toast.error(data.message || 'Registration failed')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 22, fontWeight: 900, color: '#0F172A', letterSpacing: '-.025em', margin: '0 0 6px' }}>Create Candidate Account</h2>
        <p style={{ fontSize: 13, color: '#64748B', margin: 0 }}>Submit your enrolment details to start your program</p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

        {/* Row 1 "" Name + Email */}
        <div className="cl-form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={fieldLabel}>Full Name *</label>
            <div style={inputWrap}>
              <User style={inputIcon} />
              <input type="text" required className="cl-input" placeholder="Your full name"
                value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
          </div>
          <div>
            <label style={fieldLabel}>Email Address *</label>
            <div style={inputWrap}>
              <Mail style={inputIcon} />
              <input type="email" required className="cl-input" placeholder="your@email.com"
                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
          </div>
        </div>

        {/* Row 2 "" Password + Confirm */}
        <div className="cl-form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={fieldLabel}>Password *</label>
            <div style={inputWrap}>
              <Lock style={inputIcon} />
              <input type={showPass ? 'text' : 'password'} required className="cl-input" placeholder="Create password"
                value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                style={{ paddingRight: 42 }} />
              <button type="button" className="cl-eye" onClick={() => setShowPass(!showPass)}>
                {showPass ? <EyeOff style={{ width: 15, height: 15 }} /> : <Eye style={{ width: 15, height: 15 }} />}
              </button>
            </div>
          </div>
          <div>
            <label style={fieldLabel}>Confirm Password *</label>
            <div style={inputWrap}>
              <Lock style={inputIcon} />
              <input type={showConfirm ? 'text' : 'password'} required className="cl-input" placeholder="Confirm password"
                value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                style={{ paddingRight: 42 }} />
              <button type="button" className="cl-eye" onClick={() => setShowConfirm(!showConfirm)}>
                {showConfirm ? <EyeOff style={{ width: 15, height: 15 }} /> : <Eye style={{ width: 15, height: 15 }} />}
              </button>
            </div>
          </div>
        </div>

        {/* Divider label */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1, height: 1, background: '#F1F5F9' }} />
          <span style={{ fontSize: 10, fontWeight: 700, color: '#CBD5E1', textTransform: 'uppercase', letterSpacing: '.14em' }}>Personal Details</span>
          <div style={{ flex: 1, height: 1, background: '#F1F5F9' }} />
        </div>

        {/* Row 3 "" DOB + Gender */}
        <div className="cl-form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={fieldLabel}>Date of Birth</label>
            <div style={inputWrap}>
              <CalendarDays style={inputIcon} />
              <input type="date" className="cl-input"
                value={form.birthdate} onChange={(e) => setForm({ ...form, birthdate: e.target.value })} />
            </div>
          </div>
          <div>
            <label style={fieldLabel}>Gender</label>
            <div style={inputWrap}>
              <User style={inputIcon} />
              <select className="cl-input" value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other / Prefer not to say</option>
              </select>
            </div>
          </div>
        </div>

        {/* Row 4 "" Phone + City */}
        <div className="cl-form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={fieldLabel}>Phone Number</label>
            <div style={inputWrap}>
              <Phone style={inputIcon} />
              <input type="tel" className="cl-input" placeholder="10-digit mobile number"
                value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
          </div>
          <div>
            <label style={fieldLabel}>City</label>
            <div style={inputWrap}>
              <MapPin style={inputIcon} />
              <input type="text" className="cl-input" placeholder="Your city"
                value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            </div>
          </div>
        </div>

        {/* Course Plan */}
        <div>
          <label style={fieldLabel}>Select Course Plan</label>
          <div style={inputWrap}>
            <BookOpen style={inputIcon} />
            <select className="cl-input" value={form.courseSelect}
              onChange={(e) => setForm({ ...form, courseSelect: e.target.value })}>
              <option value="">Select a course</option>
              {courseOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Comments */}
        <div>
          <label style={fieldLabel}>Comments / Goals</label>
          <div style={inputWrap}>
            <MessageSquare style={{ ...inputIcon, top: 14, alignSelf: 'flex-start' }} />
            <textarea rows={3} className="cl-input" placeholder="Tell us about your background and career goals..."
              value={form.comments} onChange={(e) => setForm({ ...form, comments: e.target.value })} />
          </div>
        </div>

        {/* Note */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '14px 16px', borderRadius: 12, background: '#EFF6FF', border: '1px solid #BFDBFE' }}>
          <Info style={{ width: 16, height: 16, color: '#1D4ED8', flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: 11, fontWeight: 600, color: '#1D4ED8', lineHeight: 1.7, margin: 0 }}>
            <strong>Note:</strong> All candidate profiles require manual review and verification approval from our coordinator. You will receive an email notice when your account is active.
          </p>
        </div>

        <button type="submit" disabled={loading} className="cl-submit">
          {loading
            ? 'Submitting Details…'
            : <><span>Submit Registration</span><ArrowRight style={{ width: 15, height: 15 }} /></>
          }
        </button>
      </form>
    </div>
  )
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   FORGOT PASSWORD
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function ForgotPasswordForm({ onBack }: { onBack: () => void }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (data.success) {
        setSent(true)
      } else {
        toast.error(data.message || 'Failed to send reset email')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 22, fontWeight: 900, color: '#0F172A', letterSpacing: '-.025em', margin: '0 0 6px' }}>Reset Password</h2>
        <p style={{ fontSize: 13, color: '#64748B', margin: 0 }}>Receive a secure link to update your credentials</p>
      </div>

      {sent ? (
        <div style={{ textAlign: 'center', padding: '32px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#EFF6FF', border: '2px solid #BFDBFE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>
            ðŸ"§
          </div>
          <div>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', margin: '0 0 6px' }}>Check your inbox</p>
            <p style={{ fontSize: 13, color: '#64748B', margin: 0 }}>
              Reset link sent to <strong style={{ color: '#1D4ED8' }}>{email}</strong>
            </p>
          </div>
          <button onClick={onBack} className="cl-link-btn" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <ArrowLeft style={{ width: 14, height: 14 }} /> Back to Login
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.75, margin: 0 }}>
            Enter your registered email address and we&apos;ll send you a secure password reset link.
          </p>
          <div>
            <label style={fieldLabel}>Email Address</label>
            <div style={inputWrap}>
              <Mail style={inputIcon} />
              <input type="email" required className="cl-input" placeholder="your@email.com"
                value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>
          <button type="submit" disabled={loading} className="cl-submit">
            {loading ? 'Sending Link…' : <><span>Send Reset Link</span><ArrowRight style={{ width: 15, height: 15 }} /></>}
          </button>
          <button type="button" onClick={onBack} className="cl-link-btn"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: '#64748B', marginTop: 4 }}>
            <ArrowLeft style={{ width: 14, height: 14 }} /> Back to Sign In
          </button>
        </form>
      )}
    </div>
  )
}

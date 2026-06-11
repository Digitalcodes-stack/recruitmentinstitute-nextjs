'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { ArrowRight, Eye, EyeOff, Info, Lock, Mail } from 'lucide-react'

type Mode = 'student' | 'membership'

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
        router.push(mode === 'student' ? '/profile' : '/profile')
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
    <section className="min-h-screen bg-[#f4f7fb]">
      <div className="bg-[#08142b] text-white px-6 py-6">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold tracking-[0.2em] text-cyan-300">RECRUITMENT INSTITUTE</p>
            <h1 className="mt-2 text-2xl font-black">{title}</h1>
          </div>
          <Link href={joinHref} className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold">Join {ctaLabel}</Link>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="rounded-[28px] bg-white border border-slate-200 shadow-[0_24px_80px_rgba(15,23,42,0.08)] p-8">
            <div className="mb-6">
              <h2 className="text-3xl font-black tracking-[-0.03em] text-slate-950">{subtitle}</h2>
              <p className="mt-2 text-slate-500">{helperText}</p>
            </div>
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sky-700">
              <Info className="mt-0.5 h-4 w-4 shrink-0" />
              <p className="text-sm font-medium">This portal is for approved {mode} accounts.</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-600">Email Address</label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-4 pl-11 pr-4 outline-none focus:border-blue-500" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-600">Password</label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input type={showPass ? 'text' : 'password'} className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-4 pl-11 pr-12 outline-none focus:border-blue-500" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                  <button type="button" onClick={() => setShowPass((v) => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="flex justify-between text-sm">
                <Link href="/candidate-login" className="text-blue-700">{mode === 'student' ? 'Candidate Login' : 'Candidate Login'}</Link>
                <Link href="/candidate-login" className="text-blue-700">Forgot Password?</Link>
              </div>
              <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 py-4 font-semibold text-white shadow-lg">
                {loading ? 'Signing in...' : `Login as ${ctaLabel}`}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
          <div className="space-y-4">
            <div className="rounded-[24px] bg-[#08142b] p-6 text-white shadow-[0_24px_80px_rgba(15,23,42,0.18)]">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">Secure Access</p>
              <p className="mt-3 text-lg font-bold">Premium learning portal</p>
              <p className="mt-2 text-sm text-slate-300">Access resources, progress tracking, and member-only benefits.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

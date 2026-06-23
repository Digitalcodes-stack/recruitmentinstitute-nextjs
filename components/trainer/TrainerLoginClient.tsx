'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { ArrowRight, Eye, EyeOff, Info, Lock, Mail } from 'lucide-react'

export default function TrainerLoginClient() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/auth/trainer/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Login successful')
        router.push('/trainer/dashboard')
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
            <h1 className="mt-2 text-2xl font-black">Trainer Portal Login</h1>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="rounded-[28px] bg-white border border-slate-200 shadow-[0_24px_80px_rgba(15,23,42,0.08)] p-8">
            <div className="mb-6">
              <h2 className="text-3xl font-black tracking-[-0.03em] text-slate-950">Sign In to Your Trainer Dashboard</h2>
              <p className="mt-2 text-slate-500">Manage your assigned batches, sessions, and student attendance.</p>
            </div>
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sky-700">
              <Info className="mt-0.5 h-4 w-4 shrink-0" />
              <p className="text-sm font-medium">This portal is for approved trainer accounts only. Contact the admin team if you need access.</p>
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
              <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 py-4 font-semibold text-white shadow-lg">
                {loading ? 'Signing in...' : 'Login as Trainer'}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
          <div className="space-y-4">
            <div className="rounded-[24px] bg-[#08142b] p-6 text-white shadow-[0_24px_80px_rgba(15,23,42,0.18)]">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">Secure Access</p>
              <p className="mt-3 text-lg font-bold">Trainer dashboard</p>
              <p className="mt-2 text-sm text-slate-300">View assigned batches, schedule sessions, and track student progress.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Check, MessageSquare, ArrowRight, ShieldCheck, Tag, Monitor, Building2, Sparkles, HelpCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Course Fees & Pricing - Online (50% OFF) & Classroom (10% OFF)',
  description: 'Transparent tuition fees for all Recruitment Institute courses. Save 50% on live interactive online batches or 10% on classroom programs in Pune.',
  alternates: { canonical: 'https://recruitmentinstitute.in/fees' },
  twitter: {
    card: 'summary_large_image',
    title: 'Course Fees & Pricing - Online (50% OFF) & Classroom (10% OFF)',
    description: 'Transparent tuition fees for all Recruitment Institute courses. Save 50% on online batches and 10% on classroom programs in Pune.',
  },
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function FeesPage() {
  let dbFees: Array<{
    id: number
    courseName: string
    categoryName: string
    categorySlug: string
    fees: number
    discount: number
    finalTotal: number
    onlineFees: number
    onlineDiscount: number
    onlineFinal: number
    offlineFees: number
    offlineDiscount: number
    offlineFinal: number
    modeNotes: string | null
    couponCode: string | null
  }> = []

  try {
    const fetchedFees = await prisma.courseFee.findMany({
      include: { category: true },
      orderBy: { id: 'asc' },
    })

    dbFees = fetchedFees.map((f) => {
      const base = f.fees ? Number(f.fees) : 10000
      const onBase = f.onlineFees ? Number(f.onlineFees) : base
      const onDisc = f.onlineDiscount ? Number(f.onlineDiscount) : Math.round(onBase * 0.50)
      const onFin = f.onlineFinal ? Number(f.onlineFinal) : Math.max(0, onBase - onDisc)

      const offBase = f.offlineFees ? Number(f.offlineFees) : base
      const offDisc = f.offlineDiscount ? Number(f.offlineDiscount) : Math.round(offBase * 0.10)
      const offFin = f.offlineFinal ? Number(f.offlineFinal) : Math.max(0, offBase - offDisc)

      return {
        id: f.id,
        courseName: f.courseName,
        categoryName: f.category?.name || 'Recruitment Training',
        categorySlug: f.category?.slug || '',
        fees: base,
        discount: onDisc,
        finalTotal: onFin,
        onlineFees: onBase,
        onlineDiscount: onDisc,
        onlineFinal: onFin,
        offlineFees: offBase,
        offlineDiscount: offDisc,
        offlineFinal: offFin,
        modeNotes: f.modeNotes || null,
        couponCode: f.couponCode || null,
      }
    })
  } catch (err) {
    console.error('Failed to load database fees:', err)
  }

  return (
    <>
      {/* Breadcrumb Header */}
      <div className="relative bg-gradient-to-br from-slate-950 via-[#131b31] to-brand-bg-dark text-white py-16 overflow-hidden border-b border-slate-900">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#e0e0e0_1px,transparent_1px)] [background-size:20px_20px]" />
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-3xl md:text-5xl font-bold mb-3 tracking-tight text-white">Course Fees & Modes</h1>
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider flex gap-2 items-center">
            <Link href="/" className="hover:text-brand-red transition-colors">Home</Link>
            <span>/</span>
            <span className="text-slate-200">Course Fees</span>
          </p>
        </div>
      </div>

      <section className="section-padding bg-slate-50/50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-14 flex flex-col gap-3">
            <span className="section-subtitle">Transparent Dual-Mode Pricing</span>
            <h2 className="section-title">Online vs. Classroom Tuition Plans</h2>
            <p className="text-slate-500 text-sm md:text-base leading-relaxed">
              We offer both <strong>Online Live Interactive Batches (50% OFF)</strong> and <strong>In-Person Classroom Training (10% OFF)</strong> at our Pune center with complete transparency and zero hidden fees.
            </p>
          </div>

          {/* Mode Highlights Banner */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-12">
            <div className="bg-sky-50 border border-sky-200 rounded-2xl p-5 flex items-start gap-4 shadow-sm">
              <div className="bg-sky-600 text-white p-3 rounded-xl shrink-0">
                <Monitor className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-sky-950 text-base">Online Live Batches</h3>
                  <span className="bg-sky-200/80 text-sky-900 font-extrabold text-[10px] uppercase px-2 py-0.5 rounded-full">
                    50% Discount
                  </span>
                </div>
                <p className="text-xs text-sky-800 mt-1 leading-relaxed">
                  Live instructor-led Zoom masterclasses, doubt clearing, lifetime recording access, and digital placement assistance.
                </p>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-4 shadow-sm">
              <div className="bg-amber-600 text-white p-3 rounded-xl shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-amber-950 text-base">Classroom Batches (Pune)</h3>
                  <span className="bg-amber-200/80 text-amber-900 font-extrabold text-[10px] uppercase px-2 py-0.5 rounded-full">
                    10% Discount
                  </span>
                </div>
                <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                  In-person physical classroom training, daily mentor interaction, practical recruiter lab, and physical campus placement drives.
                </p>
              </div>
            </div>
          </div>

          {dbFees.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-600">
              No course fee records were found in the database yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
              {dbFees.map((fee) => {
                const onPct = fee.onlineFees > 0 ? Math.round((fee.onlineDiscount / fee.onlineFees) * 100) : 50
                const offPct = fee.offlineFees > 0 ? Math.round((fee.offlineDiscount / fee.offlineFees) * 100) : 10

                return (
                  <div
                    key={fee.id}
                    className="bg-white rounded-3xl border border-slate-200 shadow-premium hover:shadow-premium-hover transition-all duration-300 overflow-hidden flex flex-col justify-between relative card-premium group"
                  >
                    <div className="p-6 md:p-7 flex-1 flex flex-col gap-5">
                      <div>
                        <span className="text-[10px] text-brand-red uppercase tracking-wider font-extrabold block">
                          {fee.categoryName}
                        </span>
                        <h3 className="font-bold text-slate-800 text-lg md:text-xl leading-snug mt-1 group-hover:text-brand-red transition-colors">
                          {fee.courseName}
                        </h3>
                      </div>

                      {/* ── ONLINE PRICING BOX ── */}
                      <div className="bg-sky-50/70 border border-sky-200/90 rounded-2xl p-4">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-extrabold text-sky-950 uppercase tracking-wider flex items-center gap-1.5">
                            <Monitor className="w-3.5 h-3.5 text-sky-600" /> Online Mode
                          </span>
                          <span className="bg-sky-600 text-white font-extrabold text-[10px] uppercase px-2 py-0.5 rounded-md shadow-xs">
                            {onPct}% OFF
                          </span>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl md:text-3xl font-black text-sky-950">
                            ₹{fee.onlineFinal.toLocaleString('en-IN')}
                          </span>
                          {fee.onlineDiscount > 0 && (
                            <span className="text-xs text-slate-400 font-semibold line-through">
                              ₹{fee.onlineFees.toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] font-bold text-emerald-700 mt-0.5">
                          Save ₹{fee.onlineDiscount.toLocaleString('en-IN')} (Special Online Price)
                        </p>
                      </div>

                      {/* ── OFFLINE PRICING BOX ── */}
                      <div className="bg-amber-50/70 border border-amber-200/90 rounded-2xl p-4">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-extrabold text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-amber-600" /> Classroom Mode
                          </span>
                          <span className="bg-amber-600 text-white font-extrabold text-[10px] uppercase px-2 py-0.5 rounded-md shadow-xs">
                            {offPct}% OFF
                          </span>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl md:text-3xl font-black text-amber-950">
                            ₹{fee.offlineFinal.toLocaleString('en-IN')}
                          </span>
                          {fee.offlineDiscount > 0 && (
                            <span className="text-xs text-slate-400 font-semibold line-through">
                              ₹{fee.offlineFees.toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] font-bold text-amber-800 mt-0.5">
                          Save ₹{fee.offlineDiscount.toLocaleString('en-IN')} • Pune Center Classroom
                        </p>
                      </div>

                      {/* Standard Inclusions */}
                      <ul className="flex flex-col gap-2 border-t border-slate-100 pt-3 text-xs text-slate-500">
                        <li className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>ISO-Accredited QR Verifiable Certificate</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>1-on-1 Resume Building & Placement Support</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Industry-recognized Talent Acquisition Toolkit</span>
                        </li>
                      </ul>
                    </div>

                    <div className="p-5 bg-slate-50 border-t border-slate-100 flex flex-col gap-2">
                      <Link
                        href="/contact"
                        className="w-full btn-primary flex gap-2 items-center justify-center py-3 text-xs font-bold shadow-sm"
                      >
                        Enroll / Request Callback
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                )
              })}

              {/* Custom/Corporate Pricing Card */}
              <div className="bg-gradient-to-br from-slate-900 to-brand-bg-dark rounded-3xl border border-slate-800 shadow-premium p-6 md:p-8 flex flex-col justify-between text-white relative">
                <div className="flex flex-col gap-6">
                  <div>
                    <span className="text-[10px] text-amber-400 uppercase tracking-wider font-extrabold block">
                      Enterprise & Bulk
                    </span>
                    <h3 className="font-bold text-white text-xl md:text-2xl leading-snug mt-1">
                      Corporate Training
                    </h3>
                  </div>

                  <div className="pb-6 border-b border-slate-800 flex flex-col gap-1">
                    <span className="text-3xl font-extrabold text-white">Custom Pricing</span>
                    <span className="text-slate-400 text-xs">Tailored to team size & organizational outcomes</span>
                  </div>

                  <ul className="flex flex-col gap-3 text-xs text-slate-300">
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" /> On-site or remote cohort training
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" /> Customized recruitment curriculum
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" /> Dedicated enterprise trainer
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" /> Post-training capability assessment
                    </li>
                  </ul>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-800">
                  <Link
                    href="/contact"
                    className="w-full inline-flex items-center justify-center gap-2 bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs py-3 px-6 rounded-xl transition-all shadow-sm"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-brand-red" />
                    Request Corporate Proposal
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Payment & Trust Info */}
          <div className="mt-16 bg-white rounded-3xl border border-slate-200 p-8 md:p-10 shadow-sm max-w-4xl mx-auto">
            <h3 className="text-lg font-bold text-slate-800 mb-6 text-center">Transparent Payment Terms & Security</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">0%</div>
                <h4 className="font-bold text-slate-800 text-sm">Flexible EMI Options</h4>
                <p className="text-xs text-slate-500">Split your tuition across 3 to 6 monthly installments with zero hidden surcharges.</p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <ShieldCheck className="w-10 h-10 text-brand-navy" />
                <h4 className="font-bold text-slate-800 text-sm">Direct Online / Center Payment</h4>
                <p className="text-xs text-slate-500">Pay securely via UPI, NetBanking, Credit Cards, or in-person at our Pune center.</p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Sparkles className="w-10 h-10 text-amber-500" />
                <h4 className="font-bold text-slate-800 text-sm">Scholarship & Group Off</h4>
                <p className="text-xs text-slate-500">Special merit fee concessions for early birds and group enrollments (2+ candidates).</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

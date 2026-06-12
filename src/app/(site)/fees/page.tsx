import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Check, MessageSquare, ArrowRight, ShieldCheck, Tag } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Course Fees & Pricing',
  description: 'View transparent course pricing, payment plans, and discount options for all Recruitment Institute training courses.',
}

export const revalidate = 3600

export default async function FeesPage() {
  let dbFees: any[] = []
  try {
    const fetchedFees = await prisma.courseFee.findMany({
      include: { category: true },
    })
    dbFees = fetchedFees.map((f) => {
      const fees = f.fees ? Number(f.fees) : 0
      const discount = f.discount ? Number(f.discount) : 0
      const finalTotal = f.finalTotal ? Number(f.finalTotal) : (fees - discount > 0 ? fees - discount : fees)
      return {
        id: f.id,
        courseName: f.courseName,
        categoryName: f.category?.name || 'Recruitment Training',
        fees,
        discount,
        finalTotal,
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
          <h1 className="text-3xl md:text-5xl font-bold mb-3 tracking-tight text-white">Course Fees</h1>
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider flex gap-2 items-center">
            <Link href="/" className="hover:text-brand-red transition-colors">Home</Link>
            <span>/</span>
            <span className="text-slate-200">Course Fees</span>
          </p>
        </div>
      </div>

      <section className="section-padding bg-slate-50/50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16 flex flex-col gap-3">
            <span className="section-subtitle">Transparent Pricing</span>
            <h2 className="section-title">Investment in Your Career</h2>
            <p className="text-slate-500 text-sm md:text-base leading-relaxed">
              Unlock industry-verified HR credentials with zero hidden charges. Review standard program plans and seasonal discounts.
            </p>
          </div>

          {dbFees.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-600">
              No course fee records were found in the database yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
              {dbFees.map((fee) => {
                const original = fee.fees || 0
                const discount = fee.discount || 0
                const final = fee.finalTotal || 0
                const percentage = original > 0 && discount > 0 ? Math.round((discount / original) * 100) : 0

                return (
                  <div
                    key={fee.id}
                    className="bg-white rounded-3xl border border-slate-200 shadow-premium hover:shadow-premium-hover transition-all duration-300 overflow-hidden flex flex-col justify-between relative card-premium group"
                  >
                    {percentage > 0 && (
                      <span className="absolute top-4 right-4 bg-brand-red text-white text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md shadow-sm">
                        Save {percentage}%
                      </span>
                    )}
                    <div className="p-6 md:p-8 flex-1 flex flex-col gap-6">
                      <div>
                        <span className="text-[10px] text-brand-red uppercase tracking-wider font-extrabold block">
                          {fee.categoryName}
                        </span>
                        <h3 className="font-bold text-slate-800 text-lg md:text-xl leading-snug mt-1 group-hover:text-brand-red transition-colors">
                          {fee.courseName}
                        </h3>
                      </div>

                      <div className="pb-6 border-b border-slate-100 flex flex-col gap-1.5">
                        {original > 0 && discount > 0 && (
                          <span className="text-xs text-slate-400 font-semibold line-through">
                            ₹{original.toLocaleString('en-IN')}
                          </span>
                        )}
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-3xl font-extrabold text-brand-navy">
                            ₹{final > 0 ? final.toLocaleString('en-IN') : original.toLocaleString('en-IN')}
                          </span>
                          <span className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider">
                            One-time Investment
                          </span>
                        </div>
                        {discount > 0 && (
                          <span className="text-[11px] text-emerald-600 font-semibold">
                            You save ₹{discount.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>

                      {/* Breakdown */}
                      <ul className="flex flex-col gap-2.5 flex-1">
                        {original > 0 && (
                          <li className="flex items-center justify-between text-xs text-slate-500">
                            <span className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-slate-300 shrink-0" /> Course Fee</span>
                            <span className="font-semibold text-slate-700">₹{original.toLocaleString('en-IN')}</span>
                          </li>
                        )}
                        {discount > 0 && (
                          <li className="flex items-center justify-between text-xs text-slate-500">
                            <span className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Discount</span>
                            <span className="font-semibold text-emerald-600">− ₹{discount.toLocaleString('en-IN')}</span>
                          </li>
                        )}
                        {fee.couponCode && (
                          <li className="flex items-center justify-between text-xs text-slate-500">
                            <span className="flex items-center gap-2"><Tag className="w-3.5 h-3.5 text-amber-500 shrink-0" /> Coupon</span>
                            <span className="font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">{fee.couponCode}</span>
                          </li>
                        )}
                        <li className="flex items-center justify-between text-xs border-t border-slate-100 pt-2.5 mt-1">
                          <span className="flex items-center gap-2 font-bold text-slate-700"><Check className="w-3.5 h-3.5 text-brand-red shrink-0" /> You Pay</span>
                          <span className="font-extrabold text-brand-navy text-sm">₹{(final > 0 ? final : original).toLocaleString('en-IN')}</span>
                        </li>
                        <li className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                          <Check className="w-3.5 h-3.5 text-brand-red shrink-0" /> Study materials included
                        </li>
                        <li className="flex items-center gap-2 text-xs text-slate-400">
                          <Check className="w-3.5 h-3.5 text-brand-red shrink-0" /> Industry-recognised certificate
                        </li>
                        <li className="flex items-center gap-2 text-xs text-slate-400">
                          <Check className="w-3.5 h-3.5 text-brand-red shrink-0" /> Placement assistance
                        </li>
                      </ul>
                    </div>

                    <div className="p-6 bg-slate-50 border-t border-slate-100 flex flex-col gap-3">
                      <Link
                        href="/contact"
                        className="w-full btn-primary flex gap-2 items-center justify-center py-3 text-xs font-bold shadow-sm"
                      >
                        Enroll in Next Batch
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                )
              })}

              {/* Custom/Corporate Pricing Card */}
              <div className="bg-gradient-to-br from-slate-900 to-brand-bg-dark rounded-3xl border border-slate-800 shadow-premium p-6 md:p-8 flex flex-col justify-between text-white relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-red/5 rounded-full blur-2xl pointer-events-none" />
              <div className="flex-1 flex flex-col gap-6">
                <div>
                  <span className="text-[10px] text-brand-red uppercase tracking-wider font-extrabold block">
                    Enterprise / Organizations
                  </span>
                  <h3 className="font-bold text-white text-lg md:text-xl leading-snug mt-1">
                    Corporate Training & Consulting
                  </h3>
                </div>

                <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
                  Tailored course structure, group discounts, customized schedules, and direct consulting options for companies upgrading their recruitment departments.
                </p>

                <ul className="flex flex-col gap-3">
                  {['Team skill gap assessments', 'Custom ATS workflows', 'In-house workshop materials', 'Dedicated trainer consulting'].map((feat, fIdx) => (
                    <li key={fIdx} className="flex gap-2.5 items-start text-xs text-slate-300">
                      <Check className="w-4 h-4 text-brand-red shrink-0 mt-0.5" />
                      <span className="leading-snug">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col gap-3">
                <Link
                  href="/contact"
                  className="w-full btn-primary py-3 text-xs font-bold hover:shadow-lg transition-all"
                >
                  Request Customized Quote
                </Link>
              </div>
              </div>
            </div>
          )}

          {/* Pricing Features Bar */}
          <div className="grid md:grid-cols-3 gap-6 mt-16 max-w-5xl mx-auto border-t border-slate-200 pt-10">
            {[
              {
                icon: <ShieldCheck className="w-5 h-5 text-brand-red" />,
                title: 'No Hidden Charges',
                desc: 'All study materials, live project access, and mock tests are fully integrated into our base cost.',
              },
              {
                icon: <MessageSquare className="w-5 h-5 text-blue-500" />,
                title: 'Flexible Instalments',
                desc: 'Speak to our coordinator about installment scheduling options and student scholarship limits.',
              },
              {
                icon: <Check className="w-5 h-5 text-emerald-500" />,
                title: '100% Satisfaction',
                desc: 'Read through reviews from past trainees. We focus strictly on operational skills.',
              },
            ].map((p, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className="p-2 bg-white rounded-lg border border-slate-100 shadow-sm shrink-0">
                  {p.icon}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-xs">{p.title}</h4>
                  <p className="text-slate-400 text-[10px] leading-relaxed mt-1">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

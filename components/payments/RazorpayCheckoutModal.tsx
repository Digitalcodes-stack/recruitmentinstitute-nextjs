'use client'

import { useState } from 'react'
import {
  X,
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
  Loader2,
  Calendar,
  AlertCircle,
} from 'lucide-react'

declare global {
  interface Window {
    Razorpay: any
  }
}

interface RazorpayCheckoutModalProps {
  isOpen: boolean
  onClose: () => void
  courseId: number
  courseTitle: string
  batchId?: number
  batchName?: string
  batchSchedule?: string
  originalPrice?: number
  discountedPrice?: number
  onSuccess?: (details: any) => void
}

export default function RazorpayCheckoutModal({
  isOpen,
  onClose,
  courseId,
  courseTitle,
  batchId,
  batchName,
  batchSchedule,
  originalPrice = 34999,
  discountedPrice = 24999,
  onSuccess,
}: RazorpayCheckoutModalProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [paymentSuccess, setPaymentSuccess] = useState<any | null>(null)

  if (!isOpen) return null

  const formatPrice = (p: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(p)
  }

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true)
        return
      }
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')

    if (!name.trim() || !email.trim() || !phone.trim()) {
      setErrorMessage('Please fill in your full name, email address, and phone number.')
      return
    }

    if (phone.replace(/\D/g, '').length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number for WhatsApp & batch access.')
      return
    }

    setLoading(true)

    try {
      // 1. Load Razorpay script
      const scriptLoaded = await loadRazorpayScript()
      if (!scriptLoaded) {
        setErrorMessage('Failed to connect to Razorpay payment gateway. Please check your internet connection.')
        setLoading(false)
        return
      }

      // 2. Create order on server
      const orderRes = await fetch('/api/payments/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          batchId,
          amount: discountedPrice,
          studentName: name,
          studentEmail: email,
          studentPhone: phone,
        }),
      })

      const orderData = await orderRes.json()

      if (!orderRes.ok || !orderData.orderId) {
        throw new Error(orderData.error || 'Failed to initialize payment order')
      }

      // 3. Open Razorpay Checkout Dialog
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Recruitment Institute',
        description: `Enrollment: ${courseTitle}`,
        image: 'https://recruitmentinstitute.in/assets/images/logo.png',
        order_id: orderData.orderId,
        prefill: {
          name: orderData.studentName,
          email: orderData.studentEmail,
          contact: orderData.studentPhone,
        },
        theme: {
          color: '#0A1628',
        },
        modal: {
          ondismiss: () => {
            setLoading(false)
          },
        },
        handler: async function (response: {
          razorpay_payment_id: string
          razorpay_order_id: string
          razorpay_signature: string
        }) {
          try {
            // 4. Verify payment on server
            const verifyRes = await fetch('/api/payments/razorpay/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                courseId,
                batchId,
                studentEmail: email,
              }),
            })

            const verifyData = await verifyRes.json()

            if (!verifyRes.ok || !verifyData.success) {
              throw new Error(verifyData.error || 'Payment verification failed.')
            }

            setPaymentSuccess({
              transactionId: response.razorpay_payment_id,
              invoiceNumber: verifyData.invoiceNumber,
              courseTitle,
              amount: discountedPrice,
              studentName: name,
            })

            if (onSuccess) onSuccess(verifyData)
          } catch (err: any) {
            setErrorMessage(err?.message || 'Error confirming your payment.')
          } finally {
            setLoading(false)
          }
        },
      }

      const paymentObject = new window.Razorpay(options)
      paymentObject.open()
    } catch (err: any) {
      setErrorMessage(err?.message || 'An unexpected error occurred during checkout.')
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {paymentSuccess ? (
          /* ── SUCCESS STATE ───────────────────────────────────────── */
          <div className="p-8 sm:p-10 text-center">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h3 className="text-2xl font-black text-[#0A1628] mb-1">
              Enrollment Confirmed!
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Welcome aboard, <strong>{paymentSuccess.studentName}</strong>. Your payment was verified via Razorpay.
            </p>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-left text-xs text-slate-700 space-y-2 mb-6">
              <div className="flex justify-between">
                <span className="text-slate-500">Program:</span>
                <span className="font-bold text-slate-900">{paymentSuccess.courseTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount Paid:</span>
                <span className="font-bold text-emerald-600">{formatPrice(paymentSuccess.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Transaction ID:</span>
                <span className="font-mono font-semibold text-slate-800">{paymentSuccess.transactionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Invoice Ref:</span>
                <span className="font-mono font-semibold text-slate-800">{paymentSuccess.invoiceNumber}</span>
              </div>
            </div>

            <p className="text-xs text-slate-500 mb-6">
              A confirmation email & login credentials have been sent to <strong>{email}</strong>.
            </p>

            <div className="space-y-2.5">
              <a
                href="/student-login"
                className="w-full py-3 rounded-xl bg-[#0A1628] text-white font-bold text-xs sm:text-sm hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
              >
                <span>Login to Student Portal</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <button
                onClick={onClose}
                className="w-full py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                Close Window
              </button>
            </div>
          </div>
        ) : (
          /* ── CHECKOUT FORM ───────────────────────────────────────── */
          <div>
            {/* Header */}
            <div className="bg-[#0A1628] p-6 text-white">
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10.5px] font-bold uppercase tracking-wider mb-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Instant Guaranteed Admission</span>
              </div>

              <h3 className="text-xl font-bold text-white leading-tight">
                {courseTitle}
              </h3>

              {batchName && (
                <p className="text-xs text-slate-300 font-semibold mt-1">
                  Batch: {batchName} {batchSchedule ? `• ${batchSchedule}` : ''}
                </p>
              )}
            </div>

            {/* Form */}
            <form onSubmit={handlePay} className="p-6 sm:p-7 space-y-4">
              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white text-xs sm:text-sm text-slate-900 rounded-xl border border-slate-200 focus:border-[#E63946] focus:ring-2 focus:ring-[#E63946]/15 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white text-xs sm:text-sm text-slate-900 rounded-xl border border-slate-200 focus:border-[#E63946] focus:ring-2 focus:ring-[#E63946]/15 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    WhatsApp Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="10-digit mobile"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white text-xs sm:text-sm text-slate-900 rounded-xl border border-slate-200 focus:border-[#E63946] focus:ring-2 focus:ring-[#E63946]/15 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Price Summary */}
              <div className="pt-3 pb-1 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span>Standard Program Fee:</span>
                  <span className="line-through">{formatPrice(originalPrice)}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-emerald-600 font-bold mb-2">
                  <span>Scholarship / Cohort Discount:</span>
                  <span>- {formatPrice(originalPrice - discountedPrice)}</span>
                </div>
                <div className="flex items-center justify-between text-base font-black text-[#0A1628] pt-2 border-t border-slate-200">
                  <span>Total Payable:</span>
                  <span className="text-xl text-[#0A1628]">{formatPrice(discountedPrice)}</span>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-extrabold text-xs sm:text-sm hover:from-red-700 hover:to-rose-700 transition-all shadow-md shadow-red-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Connecting to Razorpay...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Pay {formatPrice(discountedPrice)} Securely</span>
                  </>
                )}
              </button>

              {/* Trust Indicators */}
              <div className="flex items-center justify-center gap-3 pt-2 text-[11px] text-slate-400 font-semibold">
                <span>🔒 256-Bit SSL Encryption</span>
                <span>•</span>
                <span>UPI / Cards / NetBanking / EMI</span>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

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
        className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto bg-white rounded-3xl shadow-2xl border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className={
            paymentSuccess
              ? 'absolute top-4 right-4 z-20 w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900'
              : 'absolute top-4 right-4 z-20 w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer bg-white/10 text-white/80 hover:bg-white/20 hover:text-white'
          }
        >
          <X className="w-4 h-4" />
        </button>

        {paymentSuccess ? (
          /* ── SUCCESS STATE ───────────────────────────────────────── */
          <div className="p-8 sm:p-10 text-center">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-5 ring-8 ring-emerald-50/60">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <h3 className="text-2xl font-bold text-primary mb-1.5 tracking-tight">
              Enrollment Confirmed!
            </h3>
            <p className="text-sm text-text-light mb-7">
              Welcome aboard, <strong className="text-text">{paymentSuccess.studentName}</strong>. Your payment was verified via Razorpay.
            </p>

            <div className="bg-bg rounded-2xl p-5 border border-slate-200 text-left text-sm text-text space-y-3 mb-7">
              <div className="flex justify-between">
                <span className="text-text-light">Program:</span>
                <span className="font-semibold text-primary text-right">{paymentSuccess.courseTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-light">Amount Paid:</span>
                <span className="font-semibold text-emerald-600">{formatPrice(paymentSuccess.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-light">Transaction ID:</span>
                <span className="font-mono text-xs font-medium text-text">{paymentSuccess.transactionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-light">Invoice Ref:</span>
                <span className="font-mono text-xs font-medium text-text">{paymentSuccess.invoiceNumber}</span>
              </div>
            </div>

            <p className="text-sm text-text-light mb-7">
              A confirmation email & login credentials have been sent to <strong className="text-text">{email}</strong>.
            </p>

            <div className="space-y-3">
              <a
                href="/student-login"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-secondary to-secondary-light text-white font-semibold text-sm hover:-translate-y-0.5 hover:shadow-lg hover:shadow-secondary/25 transition-all flex items-center justify-center gap-2"
              >
                <span>Login to Student Portal</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <button
                onClick={onClose}
                className="w-full py-2.5 text-sm font-medium text-text-light hover:text-text transition-colors"
              >
                Close Window
              </button>
            </div>
          </div>
        ) : (
          /* ── CHECKOUT FORM ───────────────────────────────────────── */
          <div>
            {/* Header */}
            <div className="bg-primary px-7 py-6 text-white">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-400/15 text-emerald-300 text-[10.5px] font-semibold uppercase tracking-wider mb-3">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Instant Guaranteed Admission</span>
              </div>

              <h3 className="text-xl font-bold text-white leading-snug tracking-tight">
                {courseTitle}
              </h3>

              {batchName && (
                <p className="text-xs text-slate-300 font-medium mt-1.5">
                  Batch: {batchName} {batchSchedule ? `• ${batchSchedule}` : ''}
                </p>
              )}
            </div>

            {/* Form */}
            <form onSubmit={handlePay} className="p-7 sm:p-8 space-y-5">
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-text mb-1.5">
                  Full Name <span className="text-accent">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-bg focus:bg-white text-sm text-text rounded-xl border border-slate-200 focus:border-secondary focus:ring-4 focus:ring-secondary/10 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-text mb-1.5">
                    Email Address <span className="text-accent">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-bg focus:bg-white text-sm text-text rounded-xl border border-slate-200 focus:border-secondary focus:ring-4 focus:ring-secondary/10 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text mb-1.5">
                    WhatsApp Number <span className="text-accent">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="10-digit mobile"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 bg-bg focus:bg-white text-sm text-text rounded-xl border border-slate-200 focus:border-secondary focus:ring-4 focus:ring-secondary/10 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Price Summary */}
              <div className="rounded-2xl bg-bg border border-slate-200 p-5">
                <div className="flex items-center justify-between text-xs text-text-light mb-2">
                  <span>Standard Program Fee</span>
                  <span className="line-through">{formatPrice(originalPrice)}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-emerald-600 font-semibold mb-3 pb-3 border-b border-dashed border-slate-300">
                  <span>Scholarship / Cohort Discount</span>
                  <span>− {formatPrice(originalPrice - discountedPrice)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-primary">Total Payable</span>
                  <span className="text-2xl font-bold text-primary tracking-tight">{formatPrice(discountedPrice)}</span>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-secondary to-secondary-light text-white font-semibold text-sm hover:-translate-y-0.5 hover:shadow-lg hover:shadow-secondary/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:hover:translate-y-0"
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
              <div className="flex items-center justify-center gap-3 text-[11px] text-text-light font-medium">
                <span>🔒 256-Bit SSL Encryption</span>
                <span className="text-slate-300">•</span>
                <span>UPI / Cards / NetBanking / EMI</span>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

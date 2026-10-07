'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Award,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  Building2,
  Briefcase,
  User,
  Mail,
  Phone,
  FileCheck,
  Download,
  ExternalLink,
  RotateCcw,
  Sparkles,
  AlertCircle,
  Clock,
  ChevronRight,
  ChevronDown,
  Share2,
  QrCode,
  ArrowRight,
  Lock,
  Check,
  GraduationCap,
  FileText,
  Layers,
  Search,
  BadgeCheck,
  HelpCircle,
  TrendingUp,
  Users,
} from 'lucide-react'
import AssessmentResultFailed from '@/components/site/AssessmentResultFailed'

function GooglePayIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <rect width="24" height="24" rx="6" fill="#0A1628" />
      <path d="M12.5 10.2v3.6h2.8c-.2 1.5-1.5 2.6-2.8 2.6-1.8 0-3.2-1.4-3.2-3.3s1.4-3.3 3.2-3.3c.8 0 1.5.3 2.1.8l1.6-1.6c-1-.9-2.3-1.5-3.7-1.5-3 0-5.5 2.5-5.5 5.6s2.5 5.6 5.5 5.6c3.2 0 5.3-2.2 5.3-5.4 0-.4 0-.7-.1-1h-5.2z" fill="#4285F4" />
      <path d="M7 13.1c0-.4.1-.7.2-1.1l-1.9-1.5C5 11.2 4.8 12.1 4.8 13.1s.2 1.9.5 2.6l1.9-1.5c-.1-.4-.2-.7-.2-1.1z" fill="#FBBC05" />
      <path d="M12.5 7.5c1.4 0 2.7.6 3.7 1.5l1.6-1.6C16.3 6 14.5 5.3 12.5 5.3 9.4 5.3 6.7 7.1 5.3 9.7l1.9 1.5C8 8.8 10 7.5 12.5 7.5z" fill="#EA4335" />
      <path d="M12.5 18.7c2.1 0 3.9-.7 5.2-1.9l-1.6-1.6c-.7.5-1.6.8-2.6.8-2.2 0-4.1-1.4-4.8-3.4l-1.9 1.5c1.4 2.8 4.2 4.6 7.7 4.6z" fill="#34A853" />
    </svg>
  )
}

function LinkedInIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
    </svg>
  )
}

interface FormData {
  fullName: string
  email: string
  mobileNumber: string
  designation: string
  organization: string
  linkedInUrl: string
  yearsExperience: string
}

interface Question {
  id: number
  question: string
  options: string[]
  category: string
}

interface IssuedCertificate {
  certificateNo: string
  fullName: string
  designation: string
  organization: string
  issuedAt: string
  imageUrl: string
  pdfUrl: string
  verificationUrl: string
  score: number
  level?: string
}

// Dynamically load Razorpay SDK
function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false)
    if ((window as any).Razorpay) return resolve(true)

    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export default function GetFreeCertificatePage() {
  // Steps: 1 = Overview (Image 2 Info), 2 = Form, 3 = Payment, 4 = Assessment, 5 = Certificate Showcase
  const [currentStep, setCurrentStep] = useState<number>(1)

  // Form State
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    mobileNumber: '',
    designation: '',
    organization: '',
    linkedInUrl: '',
    yearsExperience: '4-7 Years',
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [isSubmittingForm, setIsSubmittingForm] = useState(false)

  // Payment State
  const [razorpayOrderId, setRazorpayOrderId] = useState<string | null>(null)
  const [paymentId, setPaymentId] = useState<string | null>(null)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)

  // Assessment State
  const [questions, setQuestions] = useState<Question[]>([])
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({})
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false)
  const [isSubmittingAssessment, setIsSubmittingAssessment] = useState(false)
  const [retakeCount, setRetakeCount] = useState<number>(0)
  const [assessmentResult, setAssessmentResult] = useState<{
    passed: boolean
    scorePercentage: number
    message?: string
  } | null>(null)

  // Certificate State
  const [issuedCert, setIssuedCert] = useState<IssuedCertificate | null>(null)

  // UPI & QR states
  const [upiQrImage, setUpiQrImage] = useState<string | null>(null)
  const [copiedUpi, setCopiedUpi] = useState(false)
  const [utrInput, setUtrInput] = useState('')

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0)

  const toggleFaq = (idx: number) => {
    setOpenFaqIndex(openFaqIndex === idx ? null : idx)
  }

  const handleCopyUpi = () => {
    navigator.clipboard.writeText('sesasiba.es@oksbi')
    setCopiedUpi(true)
    setTimeout(() => setCopiedUpi(false), 2500)
  }

  const handleGPayDirect = () => {
    const upiUri = 'upi://pay?pa=sesasiba.es@oksbi&pn=Shesha%20Shiba%20Mohanty&am=1&cu=INR&tn=HR%20Recruitment%20Certification'
    const isMobile = typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
    if (isMobile) {
      window.location.href = upiUri
    } else {
      handleRazorpayPayment('upi')
    }
  }

  const handleConfirmGPayTransfer = async () => {
    setIsProcessingPayment(true)
    try {
      const generatedId = utrInput.trim() ? `gpay_utr_${utrInput.trim()}` : `gpay_paid_${Date.now()}`
      setPaymentId(generatedId)
      if (questions.length === 0) {
        await loadAssessmentQuestions()
      }
      setCurrentStep(4)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err: any) {
      setPaymentError(err.message || 'Failed to proceed to assessment')
    } finally {
      setIsProcessingPayment(false)
    }
  }

  // Preload Razorpay Script, assessment questions, UPI QR & authenticated user profile
  useEffect(() => {
    loadRazorpayScript()
    loadAssessmentQuestions()
    fetch('/api/eac/upi-qr?amount=1')
      .then((r) => r.json())
      .then((d) => {
        if (d.qrDataUrl) setUpiQrImage(d.qrDataUrl)
      })
      .catch(() => {})
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => {
        if (d.authenticated && d.user) {
          setFormData((prev) => ({
            ...prev,
            fullName: prev.fullName || d.user.name || '',
            email: prev.email || d.user.email || '',
          }))
        }
      })
      .catch(() => {})
  }, [])

  // Form input change handler
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const copy = { ...prev }
        delete copy[name]
        return copy
      })
    }
  }

  // Validate Step 1 Form
  const validateForm = () => {
    const errors: Record<string, string> = {}
    if (!formData.fullName.trim()) errors.fullName = 'Full Name is required'
    if (!formData.email.trim() || !/^\S+@\S+\.\S+$/.test(formData.email)) {
      errors.email = 'Valid email address is required'
    }
    if (!formData.mobileNumber.trim() || formData.mobileNumber.length < 10) {
      errors.mobileNumber = 'Valid 10-digit mobile number is required'
    }
    if (!formData.designation.trim()) errors.designation = 'Current Designation is required'
    if (!formData.organization.trim()) errors.organization = 'Organization / Company Name is required'
    if (!formData.yearsExperience) errors.yearsExperience = 'Years of experience is required'

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle Form Submit -> Proceed to Step 2 (Payment)
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsSubmittingForm(true)
    setPaymentError(null)

    try {
      const res = await fetch('/api/eac/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          mobileNumber: formData.mobileNumber,
          designation: formData.designation,
          organization: formData.organization,
          yearsExperience: formData.yearsExperience,
          linkedInUrl: formData.linkedInUrl,
          amount: 1, // Verification fee ₹1
        }),
      })

      const data = await res.json()
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to initialize certification application')
      }

      setRazorpayOrderId(data.orderId)
      setCurrentStep(3)
      scrollToCard()
    } catch (err: any) {
      setFormErrors({ submit: err.message || 'Submission error' })
    } finally {
      setIsSubmittingForm(false)
    }
  }

  // Trigger Razorpay Checkout
  const handleRazorpayPayment = async (preferredMethod?: string) => {
    setIsProcessingPayment(true)
    setPaymentError(null)

    const isLoaded = await loadRazorpayScript()
    if (!isLoaded) {
      setPaymentError('Razorpay payment gateway failed to load. Please check your internet connection and refresh.')
      setIsProcessingPayment(false)
      return
    }

    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_TUKkvyTnXzSVTP'
    const targetOrderId = razorpayOrderId

    const options: any = {
      key: keyId,
      amount: 100, // ₹1 INR
      currency: 'INR',
      name: 'Recruitment Institute',
      description: 'HR & Recruitment Certification Assessment Fee',
      prefill: {
        name: formData.fullName,
        email: formData.email,
        contact: formData.mobileNumber,
        method: preferredMethod || undefined,
      },
      notes: {
        designation: formData.designation,
        organization: formData.organization,
        type: 'HR_RECRUITMENT_CERTIFICATION',
      },
      theme: {
        color: '#0A1628',
      },
      handler: async function (response: any) {
        try {
          const verifyRes = await fetch('/api/eac/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id || targetOrderId,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          })

          const verifyData = await verifyRes.json()
          if (!verifyRes.ok || !verifyData.success) {
            throw new Error(verifyData.error || 'Payment signature verification failed')
          }

          setPaymentId(response.razorpay_payment_id)
          if (questions.length === 0) {
            await loadAssessmentQuestions()
          }
          setCurrentStep(4)
          window.scrollTo({ top: 0, behavior: 'smooth' })
        } catch (err: any) {
          setPaymentError(err.message || 'Payment verification failed. Please contact support.')
        } finally {
          setIsProcessingPayment(false)
        }
      },
      modal: {
        ondismiss: function () {
          setIsProcessingPayment(false)
        },
      },
    }

    if (targetOrderId && targetOrderId.startsWith('order_') && !targetOrderId.startsWith('order_eac_')) {
      options.order_id = targetOrderId
    }

    try {
      const rzp = new (window as any).Razorpay(options)
      rzp.on('payment.failed', function (resp: any) {
        setPaymentError(resp.error?.description || 'Payment was unsuccessful or cancelled. Please try again.')
        setIsProcessingPayment(false)
      })
      rzp.open()
    } catch (err: any) {
      setPaymentError('Unable to open payment gateway. Please try again.')
      setIsProcessingPayment(false)
    }
  }

  // Load Assessment Questions
  const loadAssessmentQuestions = async () => {
    setIsLoadingQuestions(true)
    try {
      const res = await fetch('/api/eac/questions')
      const data = await res.json()
      if (data.questions) {
        setQuestions(data.questions)
      }
    } catch (err) {
      console.error('Failed to load questions:', err)
    } finally {
      setIsLoadingQuestions(false)
    }
  }

  // Handle Assessment Option Selection
  const handleSelectOption = (questionId: number, optionIdx: number, qIdx?: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIdx,
    }))

    if (typeof qIdx === 'number' && qIdx < (questions.length - 1)) {
      setTimeout(() => {
        const nextEl = document.getElementById(`question-card-${qIdx + 1}`)
        if (nextEl) {
          nextEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }, 250)
    }
  }

  // Submit Assessment
  const handleSubmitAssessment = async (answersOverride?: Record<number, number>) => {
    const targetAnswers = answersOverride || selectedAnswers
    const targetQuestionCount = questions.length || 10

    if (Object.keys(targetAnswers).length < targetQuestionCount) {
      alert(`Please answer all ${targetQuestionCount} questions before submitting. (${Object.keys(targetAnswers).length} answered)`)
      return
    }

    setIsSubmittingAssessment(true)
    try {
      const targetApplicant = {
        fullName: formData.fullName || 'PROFESSIONAL CANDIDATE',
        email: formData.email || 'candidate@recruitmentinstitute.in',
        mobileNumber: formData.mobileNumber || '9876543210',
        designation: formData.designation || 'Talent Acquisition Specialist',
        organization: formData.organization || 'Leading Corporate',
        linkedInUrl: formData.linkedInUrl || 'https://linkedin.com',
        yearsExperience: formData.yearsExperience || '4-7 Years',
      }

      const res = await fetch('/api/eac/submit-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: targetAnswers,
          applicant: targetApplicant,
          paymentId: paymentId || `pay_verified_${Date.now()}`,
          retakeCount,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to grade assessment')
      }

      setAssessmentResult({
        passed: data.passed,
        scorePercentage: data.scorePercentage,
        message: data.message,
      })

      if (data.passed && data.certificate) {
        setIssuedCert(data.certificate)
        setCurrentStep(5)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    } catch (err: any) {
      alert(err.message || 'Error evaluating assessment')
    } finally {
      setIsSubmittingAssessment(false)
    }
  }

  const scrollToCard = () => {
    setTimeout(() => {
      const el = document.getElementById('step-card-container')
      if (el) {
        const topOffset = el.getBoundingClientRect().top + window.pageYOffset - 80
        window.scrollTo({ top: topOffset, behavior: 'smooth' })
      }
    }, 50)
  }

  const handleStartRetake = () => {
    setRetakeCount((prev) => prev + 1)
    setSelectedAnswers({})
    setAssessmentResult(null)
    scrollToCard()
  }

  return (
    <div className="min-h-screen bg-[#070b13] text-slate-100 font-sans selection:bg-amber-500/30 selection:text-amber-200 pb-24">
      {/* Executive Header */}
      <header className="border-b border-slate-800/80 bg-[#0a101d]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 p-[1.5px] shadow-lg shadow-amber-500/20">
              <div className="h-full w-full bg-[#0A1628] rounded-[10px] flex items-center justify-center">
                <Award className="h-6 w-6 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black tracking-wider uppercase text-amber-400">
                  HR &amp; Recruitment Certification
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/20">
                  National Credential
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Recruitment Institute • Assessment &amp; Credentialing Directorate
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-3 text-xs text-slate-300">
            <Link
              href="/verify-certificate"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/50 hover:bg-slate-800 hover:text-amber-300 transition"
            >
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              Official Verification Portal
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Header Section */}
      <section
        className={`relative overflow-hidden transition-all duration-300 border-b border-slate-800/60 bg-gradient-to-b from-[#0e1628] to-[#070b13] ${
          currentStep > 1 ? 'py-4' : 'pt-12 pb-10'
        }`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(234,179,8,0.08),transparent_50%)]" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
          {currentStep === 1 ? (
            <>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold mb-4 shadow-sm">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                Industry-Recognized Professional Credential
              </div>

              {/* 1. HERO SECTION H1 & SUBHEADINGS */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
                HR &amp; Recruitment Certification in India
              </h1>

              <p className="mt-3 text-base sm:text-lg font-bold text-amber-300 max-w-2xl mx-auto leading-snug">
                Official Skill Recognition &amp; Benchmarking for HR Professionals &amp; Talent Acquisition Specialists
              </p>

              <p className="mt-2 text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
                Validate your expertise in full lifecycle talent acquisition, modern sourcing methods, structured behavioral interviewing, and ATS workflows with an employer-verifiable digital credential.
              </p>

              {/* Quick CTAs */}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentStep(2)
                    scrollToCard()
                  }}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-400/20 transition flex items-center gap-2 cursor-pointer"
                >
                  Apply for Certification <ArrowRight className="h-4 w-4" />
                </button>
                <a
                  href="#certification-overview"
                  className="px-5 py-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white font-bold text-xs sm:text-sm transition flex items-center gap-2"
                >
                  Explore Details &amp; Levels ↓
                </a>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center gap-2 text-xs sm:text-sm font-bold text-amber-400">
              <Award className="h-4 w-4 text-amber-400" />
              <span>HR &amp; Recruitment Certification in India • National Assessment Portal</span>
            </div>
          )}

          {/* Stepper Progress Indicator */}
          <div className="mt-6 max-w-2xl mx-auto grid grid-cols-5 gap-1.5 sm:gap-4 text-xs font-semibold">
            {[
              { num: 1, label: 'Overview' },
              { num: 2, label: 'Application' },
              { num: 3, label: 'Payment' },
              { num: 4, label: 'Assessment' },
              { num: 5, label: 'Certificate' },
            ].map((s) => {
              const isActive = currentStep === s.num
              const isDone = currentStep > s.num
              return (
                <button
                  key={s.num}
                  type="button"
                  disabled={s.num > 2 && currentStep < s.num}
                  onClick={() => {
                    if (s.num <= 2 || currentStep >= s.num) {
                      setCurrentStep(s.num)
                      scrollToCard()
                    }
                  }}
                  className={`flex flex-col items-center transition ${
                    s.num <= 2 || currentStep >= s.num ? 'cursor-pointer hover:opacity-90' : 'cursor-default opacity-60'
                  }`}
                >
                  <div
                    className={`h-9 w-9 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                      isActive
                        ? 'bg-amber-400 text-slate-950 ring-4 ring-amber-400/20 shadow-lg shadow-amber-400/30'
                        : isDone
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-800 text-slate-500 border border-slate-700'
                    }`}
                  >
                    {isDone ? <CheckCircle2 className="h-5 w-5" /> : s.num}
                  </div>
                  <span
                    className={`mt-2 hidden sm:block ${
                      isActive ? 'text-amber-400 font-bold' : isDone ? 'text-emerald-400' : 'text-slate-500'
                    }`}
                  >
                    {s.label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* Main Interactive Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8" id="step-card-container">
        {/* ============================================================ */}
        {/* STEP 1: CERTIFICATION OVERVIEW & TARGET AUDIENCE */}
        {/* ============================================================ */}
        {currentStep === 1 && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* BOX 1: WHAT IS HR & RECRUITMENT CERTIFICATION? */}
            <div className="bg-[#0c1322] border border-slate-800 rounded-2xl sm:rounded-3xl p-6 sm:p-10 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-4">
                <FileText className="h-3.5 w-3.5" />
                Industry Foundation
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                What is HR &amp; Recruitment Certification?
              </h2>
              <div className="mt-4 text-slate-300 text-sm sm:text-base leading-relaxed space-y-4">
                <p>
                  An <strong>HR &amp; Recruitment Certification</strong> is a formal credential that validates a talent acquisition practitioner&apos;s real-world competency across end-to-end hiring operations, candidate engagement, ATS workflows, and statutory compliance. Unlike purely theoretical degrees, this certification benchmarks whether an individual has the tactical skills required to source, evaluate, interview, and close candidates in high pressure corporate and agency environments.
                </p>
                <p>
                  Certified professionals demonstrate proven knowledge of modern search syntax (Boolean and X-Ray search), STAR behavioral interview rubrics, talent pipeline metrics (Time-to-Fill, Cost-per-Hire, Offer Acceptance Ratio), and ethical talent acquisition practices. It serves as an impartial stamp of quality that proves your ability to drive hiring success on day one.
                </p>
              </div>
            </div>

            {/* BOX 2: WHO SHOULD GET CERTIFIED? */}
            <div className="bg-[#0c1322] border border-slate-800 rounded-2xl sm:rounded-3xl p-6 sm:p-10 shadow-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-4">
                <Users className="h-3.5 w-3.5" />
                Target Audience
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Who Should Get Certified?
              </h2>
              <p className="mt-2 text-slate-400 text-sm">
                Whether you are stepping into HR or leading an enterprise recruitment function, this certification establishes your industry capability.
              </p>

              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                  {
                    title: 'Aspiring Recruiters & Freshers',
                    desc: 'Graduates looking to land their first HR or Talent Acquisition role with certified practical knowledge that overcomes the "no experience" barrier.',
                    icon: GraduationCap,
                    color: 'text-sky-400',
                  },
                  {
                    title: 'Working Recruiters & Specialists',
                    desc: 'Talent sourcing specialists and HR executives seeking formal verification of their skills to unlock promotions, higher salaries, and team leadership.',
                    icon: Briefcase,
                    color: 'text-amber-400',
                  },
                  {
                    title: 'Senior TA Leads & Managers',
                    desc: 'Experienced leaders seeking credential recognition for advanced workforce planning, leadership hiring, and recruiter team mentoring.',
                    icon: Award,
                    color: 'text-purple-400',
                  },
                  {
                    title: 'Agency Founders & Freelancers',
                    desc: 'Independent recruiters and staffing agency owners who need certified credibility to win enterprise B2B recruitment mandates and client trusts.',
                    icon: Building2,
                    color: 'text-emerald-400',
                  },
                ].map((item) => (
                  <div key={item.title} className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between">
                    <div>
                      <item.icon className={`h-8 w-8 ${item.color} mb-3`} />
                      <h3 className="font-bold text-white text-base leading-snug">{item.title}</h3>
                      <p className="text-xs text-slate-400 mt-2 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* ACTION CTA: PROCEED TO STEP 2 */}
              <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                    Step 1 of 5 Complete • Overview &amp; Eligibility
                  </span>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Ready to get certified? Complete the 2-minute credential application.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setCurrentStep(2)
                    scrollToCard()
                  }}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-extrabold text-sm text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 transition shadow-lg shadow-amber-400/20 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Proceed to Step 2: Application Form</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 2: APPLICATION FORM */}
        {/* ============================================================ */}
        {currentStep === 2 && (
          <div className="bg-[#0c1322] border border-slate-800 rounded-2xl p-6 sm:p-10 shadow-2xl relative animate-in fade-in duration-300">
            <div className="border-b border-slate-800 pb-5 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
                  <Briefcase className="h-6 w-6 text-amber-400" />
                  HR &amp; Recruitment Certification Application
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Please provide your verified professional credentials. These details will be dynamically printed on your official HR &amp; Recruitment Certificate.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setCurrentStep(1)
                  scrollToCard()
                }}
                className="text-xs text-slate-400 hover:text-amber-300 underline flex items-center gap-1 cursor-pointer shrink-0"
              >
                ← Back to Overview
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-6">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Full Name of Candidate <span className="text-amber-400">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="e.g. PRIYA SHARMA"
                    className="w-full pl-10 pr-4 py-3 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition text-sm"
                  />
                </div>
                {formErrors.fullName && <p className="text-rose-400 text-xs mt-1.5">{formErrors.fullName}</p>}
              </div>

              {/* Email & Mobile Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Official / Primary Email <span className="text-amber-400">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="priya@company.com"
                      className="w-full pl-10 pr-4 py-3 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition text-sm"
                    />
                  </div>
                  {formErrors.email && <p className="text-rose-400 text-xs mt-1.5">{formErrors.email}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Mobile Number <span className="text-amber-400">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                    <input
                      type="tel"
                      name="mobileNumber"
                      value={formData.mobileNumber}
                      onChange={handleInputChange}
                      placeholder="+91 98765 43210"
                      className="w-full pl-10 pr-4 py-3 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition text-sm"
                    />
                  </div>
                  {formErrors.mobileNumber && <p className="text-rose-400 text-xs mt-1.5">{formErrors.mobileNumber}</p>}
                </div>
              </div>

              {/* Designation & Organization Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Current Designation / Role <span className="text-amber-400">*</span>
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      name="designation"
                      value={formData.designation}
                      onChange={handleInputChange}
                      placeholder="e.g. Senior Talent Acquisition Specialist"
                      className="w-full pl-10 pr-4 py-3 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition text-sm"
                    />
                  </div>
                  {formErrors.designation && <p className="text-rose-400 text-xs mt-1.5">{formErrors.designation}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Organization / Company Name <span className="text-amber-400">*</span>
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      name="organization"
                      value={formData.organization}
                      onChange={handleInputChange}
                      placeholder="e.g. Tech Mahindra / Self-Employed"
                      className="w-full pl-10 pr-4 py-3 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition text-sm"
                    />
                  </div>
                  {formErrors.organization && <p className="text-rose-400 text-xs mt-1.5">{formErrors.organization}</p>}
                </div>
              </div>

              {/* LinkedIn & Years Experience */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    LinkedIn Profile URL <span className="text-slate-500 font-normal">(Optional)</span>
                  </label>
                  <div className="relative">
                    <LinkedInIcon className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                    <input
                      type="url"
                      name="linkedInUrl"
                      value={formData.linkedInUrl}
                      onChange={handleInputChange}
                      placeholder="https://linkedin.com/in/username"
                      className="w-full pl-10 pr-4 py-3 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Years of Experience in HR / Recruitment <span className="text-amber-400">*</span>
                  </label>
                  <select
                    name="yearsExperience"
                    value={formData.yearsExperience}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition text-sm"
                  >
                    <option value="0-1 Years">0 - 1 Years (Entry Level / Fresher)</option>
                    <option value="1-3 Years">1 - 3 Years (Associate)</option>
                    <option value="4-7 Years">4 - 7 Years (Mid-Senior Professional)</option>
                    <option value="8-12 Years">8 - 12 Years (Lead / Manager)</option>
                    <option value="12+ Years">12+ Years (Executive / Head of TA)</option>
                  </select>
                </div>
              </div>

              {formErrors.submit && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{formErrors.submit}</span>
                </div>
              )}

              {/* Submit CTA & Back button */}
              <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentStep(1)
                    scrollToCard()
                  }}
                  className="w-full sm:w-auto px-5 py-3.5 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 text-sm font-semibold transition cursor-pointer"
                >
                  ← Back to Overview
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingForm}
                  className="flex-1 w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-extrabold text-sm sm:text-base shadow-lg shadow-amber-400/20 active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <span>{isSubmittingForm ? 'Processing Application...' : 'Proceed to Verification & Fee (₹1)'}</span>
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
              <p className="text-center text-[11px] text-slate-500 mt-2">
                Includes official vector PDF certificate, permanent Certificate ID, QR code verification &amp; employer lookup.
              </p>
            </form>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 3: PAYMENT & VERIFICATION */}
        {/* ============================================================ */}
        {currentStep === 3 && (
          <div className="bg-[#0c1322] border border-slate-800 rounded-2xl p-6 sm:p-10 shadow-2xl">
            <div className="border-b border-slate-800 pb-5 mb-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                  Step 3 of 5 • Verification &amp; Assessment Unlock
                </span>
                <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5" />
                  256-Bit SSL Encrypted &amp; RBI Compliant
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1.5">
                HR &amp; Recruitment Certification Fee
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Complete your nominal assessment verification fee to unlock your online certification test and generate your candidate token.
              </p>
            </div>

            {/* Applicant Summary Preview */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 sm:p-5 mb-6">
              <div className="flex items-center justify-between mb-3 border-b border-slate-800/80 pb-2.5">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Candidate Summary
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentStep(2)
                    scrollToCard()
                  }}
                  className="text-xs text-amber-400 hover:text-amber-300 font-semibold underline cursor-pointer"
                >
                  Edit details
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                <div>
                  <span className="text-slate-500 block text-xs">Candidate Name:</span>
                  <span className="font-bold text-white uppercase">{formData.fullName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-xs">Role &amp; Company:</span>
                  <span className="font-semibold text-slate-200">
                    {formData.designation} | {formData.organization}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-xs">Email:</span>
                  <span className="text-slate-300">{formData.email}</span>
                </div>
              </div>
            </div>

            {/* Fee Card Summary */}
            <div className="bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/30 rounded-xl p-4 sm:p-5 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
                  Total Assessment &amp; Certification Fee
                </span>
                <div className="flex items-baseline gap-3 mt-0.5">
                  <span className="text-3xl font-black text-white">₹1</span>
                  <span className="text-sm text-slate-500 line-through">₹4,999</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                    Verification Rate (₹1)
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  100% Tax Invoice provided. Instant unlock for HR &amp; Recruitment Assessment.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleGPayDirect()}
                disabled={isProcessingPayment}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-extrabold text-xs sm:text-sm shadow-lg shadow-amber-400/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <GooglePayIcon className="h-4 w-4" />
                <span>{isProcessingPayment ? 'Opening Google Pay...' : 'Pay ₹1 with Google Pay'}</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Google Pay - Single Official Payment Method */}
            <div className="border border-slate-800 rounded-2xl bg-[#090e18] p-5 sm:p-7 mb-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-800 mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-700/80 shadow-md">
                    <GooglePayIcon className="h-7 w-7 shrink-0" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-extrabold text-white">Google Pay (UPI)</h3>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Official Payment Method
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Instant verification • 100% Secure UPI transaction
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider block">Certification Fee</span>
                  <div className="flex items-baseline sm:justify-end gap-1.5">
                    <span className="text-xl sm:text-2xl font-black text-white">₹1</span>
                    <span className="text-xs text-slate-500 line-through">₹4,999</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                {/* Left Column: Official GPay QR Code */}
                <div className="flex flex-col items-center text-center p-5 rounded-2xl bg-slate-950/80 border border-slate-800/80 shadow-inner">
                  <div className="text-[11px] font-bold text-amber-300 tracking-wider uppercase mb-3 flex items-center gap-1.5">
                    <QrCode className="h-3.5 w-3.5" />
                    <span>Scan with Google Pay App</span>
                  </div>

                  <div className="p-3 bg-white rounded-2xl shadow-xl shadow-black/40 my-1 max-w-[260px] flex items-center justify-center">
                    <img
                      src={upiQrImage || '/assets/images/gpay-qr.png'}
                      alt="Google Pay QR Code - Shesha Shiba Mohanty"
                      className="w-52 h-auto object-contain rounded-xl"
                    />
                  </div>

                  <div className="mt-3 text-xs font-semibold text-slate-300">
                    Shesha Shiba Mohanty
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                    UPI ID: <span className="text-slate-200">sesasiba.es@oksbi</span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-2">
                    Compatible with GPay, PhonePe, Paytm or any BHIM UPI app
                  </span>
                </div>

                {/* Right Column: Account Details & Action Buttons */}
                <div className="flex flex-col justify-between space-y-4">
                  <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Payee Name:</span>
                      <span className="font-bold text-white">Shesha Shiba Mohanty</span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">UPI ID / VPA:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-amber-300">sesasiba.es@oksbi</span>
                        <button
                          type="button"
                          onClick={handleCopyUpi}
                          className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer flex items-center gap-1"
                          title="Copy UPI ID"
                        >
                          {copiedUpi ? (
                            <>
                              <Check className="h-3 w-3 text-emerald-400" />
                              <span className="text-emerald-400">Copied!</span>
                            </>
                          ) : (
                            <span>Copy</span>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800">
                      <span className="text-slate-400">Amount Due:</span>
                      <span className="font-extrabold text-white text-sm">₹1 (Inclusive of Taxes)</span>
                    </div>
                  </div>

                  {/* Primary Button */}
                  <button
                    type="button"
                    onClick={handleGPayDirect}
                    disabled={isProcessingPayment}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-400/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <GooglePayIcon className="h-5 w-5 shrink-0" />
                    <span>{isProcessingPayment ? 'Processing...' : 'Pay ₹1 with Google Pay'}</span>
                  </button>

                  {/* Payment Confirmation & Unlock Assessment Box */}
                  <div className="p-4 rounded-xl bg-slate-950/70 border border-emerald-500/20">
                    <span className="text-xs font-bold text-white block mb-1">
                      Already scanned &amp; paid via GPay?
                    </span>
                    <p className="text-[11px] text-slate-400 mb-3">
                      Enter your 12-digit UPI UTR / Transaction ID (optional) and click confirm to instantly unlock your assessment.
                    </p>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={utrInput}
                        onChange={(e) => setUtrInput(e.target.value)}
                        placeholder="e.g. 423598761234 (optional)"
                        className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-amber-400 placeholder:text-slate-600"
                      />
                      <button
                        type="button"
                        onClick={handleConfirmGPayTransfer}
                        disabled={isProcessingPayment}
                        className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-extrabold text-xs transition shadow cursor-pointer whitespace-nowrap disabled:opacity-50 flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Unlock Assessment →</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {paymentError && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 mb-4">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{paymentError}</span>
              </div>
            )}

            {/* Footer Navigation */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-slate-500 pt-2 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="hover:text-slate-300 underline cursor-pointer"
              >
                ← Back to edit credentials
              </button>
              <div className="flex items-center gap-2">
                <Lock className="h-3.5 w-3.5 text-emerald-400" />
                <span>100% Encrypted Payment • Instant Assessment Authorization</span>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 4: ONLINE COMPETENCY ASSESSMENT */}
        {/* ============================================================ */}
        {currentStep === 4 && (
          assessmentResult && !assessmentResult.passed ? (
            <AssessmentResultFailed
              scorePercentage={assessmentResult.scorePercentage}
              passingScore={70}
              message={assessmentResult.message}
              retakeCount={retakeCount}
              onRetry={handleStartRetake}
            />
          ) : (
            <div className="bg-[#0c1322] border border-slate-800 rounded-2xl p-6 sm:p-10 shadow-2xl">
              <div className="border-b border-slate-800 pb-5 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-2">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Payment Verified • Assessment Unlocked
                  </div>
                  <h2 className="text-2xl font-bold text-white">
                    HR &amp; Recruitment Competency Assessment
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">
                    10 Questions • Passing Criterion: 70% (7/10 correct) • 1 Free Retake Allowed
                  </p>

                  {/* Certification Levels Breakdown */}
                  <div className="mt-3.5 p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs flex flex-wrap items-center gap-2.5">
                    <span className="text-slate-400 font-semibold text-[11px] uppercase tracking-wider">Certification Levels:</span>
                    <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-[11px]">
                      70–79%: Certified Recruiter / HR Specialist
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md bg-sky-500/10 border border-sky-500/30 text-sky-400 font-bold text-[11px]">
                      80–89%: Professional Recruiter / HR Practitioner
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold text-[11px]">
                      90–100%: Expert Recruiter / TA Leader (Expert Level)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-xl text-xs font-semibold text-amber-300">
                  <Clock className="h-4 w-4 text-amber-400" />
                  <span>Recommended: 15 Mins</span>
                </div>
              </div>

              {/* Questions List */}
            {isLoadingQuestions ? (
              <div className="py-12 text-center text-slate-400 text-sm">
                Loading assessment questions...
              </div>
            ) : (
              <div className="space-y-8">
                {questions.map((q, qIdx) => {
                  return (
                    <div
                      key={q.id}
                      id={`question-card-${qIdx}`}
                      className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 sm:p-6 transition hover:border-slate-700 scroll-mt-24"
                    >
                      <div className="flex items-center justify-between gap-3 mb-3">
                        <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                          Question {qIdx + 1} of {questions.length}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                          {q.category}
                        </span>
                      </div>

                      <h4 className="text-sm sm:text-base font-semibold text-white leading-relaxed mb-4">
                        {q.question}
                      </h4>

                      <div className="space-y-2.5">
                        {q.options.map((opt, optIdx) => {
                          const isSelected = selectedAnswers[q.id] === optIdx
                          return (
                            <label
                              key={optIdx}
                              onClick={() => handleSelectOption(q.id, optIdx, qIdx)}
                              className={`flex items-start gap-3 p-3.5 rounded-xl border text-xs sm:text-sm cursor-pointer transition ${
                                isSelected
                                  ? 'bg-amber-500/10 border-amber-400 text-amber-100 font-medium ring-1 ring-amber-400/40'
                                  : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:bg-slate-800/50 hover:border-slate-700'
                              }`}
                            >
                              <div
                                className={`h-4 w-4 rounded-full mt-0.5 border flex items-center justify-center shrink-0 ${
                                  isSelected
                                    ? 'border-amber-400 bg-amber-400'
                                    : 'border-slate-600 bg-transparent'
                                }`}
                              >
                                {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-slate-950" />}
                              </div>
                              <span className="leading-snug">{opt}</span>
                            </label>
                          )
                        })}
                      </div>

                      <div className="mt-4 pt-3.5 border-t border-slate-800/60 flex items-center justify-between text-xs">
                        <span className="text-[11px]">
                          {selectedAnswers[q.id] !== undefined ? (
                            <span className="text-emerald-400 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" /> Answer Recorded
                            </span>
                          ) : (
                            <span className="text-slate-500">Select an answer above</span>
                          )}
                        </span>

                        <div className="flex items-center gap-2">
                          {qIdx > 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                const prevEl = document.getElementById(`question-card-${qIdx - 1}`)
                                if (prevEl) prevEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
                              }}
                              className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
                            >
                              ← Prev
                            </button>
                          )}
                          {qIdx < questions.length - 1 ? (
                            <button
                              type="button"
                              onClick={() => {
                                const nextEl = document.getElementById(`question-card-${qIdx + 1}`)
                                if (nextEl) nextEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
                              }}
                              className="px-3.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition flex items-center gap-1 shadow cursor-pointer"
                            >
                              Next Question →
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleSubmitAssessment()}
                              disabled={isSubmittingAssessment}
                              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1 shadow-md disabled:opacity-50 cursor-pointer"
                            >
                              {isSubmittingAssessment ? 'Submitting...' : 'Submit Assessment →'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}

                {/* Bottom Submit Bar */}
                <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <span className="text-xs text-slate-400">
                    Questions Answered:{' '}
                    <strong className="text-white">
                      {Object.keys(selectedAnswers).length} / {questions.length}
                    </strong>
                  </span>

                  <button
                    type="button"
                    onClick={() => handleSubmitAssessment()}
                    disabled={isSubmittingAssessment || Object.keys(selectedAnswers).length < questions.length}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-extrabold text-sm text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 active:scale-95 transition shadow-lg shadow-amber-400/20 disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmittingAssessment
                      ? 'Evaluating Assessment & Issuing Certificate...'
                      : 'Submit Assessment & Generate Certificate'}
                  </button>
                </div>
              </div>
            )}
          </div>
          )
        )}

        {/* ============================================================ */}
        {/* STEP 5: CERTIFICATE SHOWCASE & DOWNLOAD */}
        {/* ============================================================ */}
        {currentStep === 5 && issuedCert && (
          <div className="space-y-8">
            <div className="bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-amber-500/20 border border-amber-400/40 rounded-2xl p-6 sm:p-8 text-center relative overflow-hidden shadow-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-400/20 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-wider mb-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                Assessment Passed ({issuedCert.score}%) • {issuedCert.level || (issuedCert.score >= 90 ? 'Expert Recruiter (Distinction)' : issuedCert.score >= 80 ? 'Professional Recruiter' : 'Certified Recruiter')}
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white">
                Congratulations! Your HR &amp; Recruitment Certificate is Issued.
              </h2>
              <p className="mt-2 text-sm text-slate-300 max-w-xl mx-auto">
                Congratulations, <strong className="text-amber-300">{issuedCert.fullName}</strong>. Your official <strong className="text-white">HR &amp; Recruitment Certificate</strong> with <strong className="text-amber-300">{issuedCert.level || (issuedCert.score >= 90 ? 'Expert Recruiter (Distinction)' : issuedCert.score >= 80 ? 'Professional Recruiter' : 'Certified Recruiter')}</strong> accreditation has been generated and recorded in the national credential registry.
              </p>

              <div className="mt-4 inline-flex items-center gap-2 text-xs text-emerald-300 bg-emerald-950/60 border border-emerald-500/30 px-3.5 py-1.5 rounded-lg">
                <Mail className="h-4 w-4 text-emerald-400" />
                A high-resolution vector PDF copy has been emailed to: <strong>{formData.email}</strong>
              </div>
            </div>

            {/* Certificate Visual Showcase Card */}
            <div className="bg-[#0c1322] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                <div>
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                    Verified Credential
                  </span>
                  <h3 className="text-xl font-bold text-white mt-0.5">
                    Official HR &amp; Recruitment Certificate
                  </h3>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    ID: {issuedCert.certificateNo} • Lifetime Credential
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <a
                    href={`/api/eac/download-pdf/${issuedCert.certificateNo}`}
                    download
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-bold text-xs sm:text-sm hover:from-amber-300 hover:to-yellow-300 transition shadow-lg shadow-amber-400/20 active:scale-95 cursor-pointer"
                  >
                    <Download className="h-4 w-4" />
                    Download Official PDF
                  </a>

                  <Link
                    href={`/verify-certificate?id=${issuedCert.certificateNo}`}
                    target="_blank"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-xs sm:text-sm hover:bg-slate-700 transition"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Verify Credential Online
                  </Link>
                </div>
              </div>

              {/* Certificate Image Frame */}
              <div className="mt-6 rounded-xl overflow-hidden border-2 border-amber-500/30 bg-black/60 shadow-2xl relative aspect-[1491/1055]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={issuedCert.imageUrl}
                  alt={`HR & Recruitment Certificate for ${issuedCert.fullName}`}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Credential Details Grid */}
              <div className="mt-8 pt-6 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-5 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 block">Candidate:</span>
                  <span className="font-bold text-white uppercase">{issuedCert.fullName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Accreditation Level:</span>
                  <span className="font-bold text-amber-300">
                    {issuedCert.level || (issuedCert.score >= 90 ? 'Expert Recruiter' : issuedCert.score >= 80 ? 'Professional Recruiter' : 'Certified Recruiter')}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Score:</span>
                  <span className="font-bold text-emerald-400">{issuedCert.score}%</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Designation:</span>
                  <span className="font-semibold text-slate-300">{issuedCert.designation}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Validity:</span>
                  <span className="text-emerald-400 font-bold">Permanent (Lifetime)</span>
                </div>
              </div>
            </div>

            {/* LinkedIn Share */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3">
                <Share2 className="h-5 w-5 text-amber-400" />
                <div>
                  <span className="font-bold text-white block">Share your certification with your network</span>
                  <span className="text-slate-400">Add to LinkedIn Licenses &amp; Certifications with a direct verification URL.</span>
                </div>
              </div>

              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                  issuedCert.verificationUrl
                )}`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-lg bg-[#0077b5] text-white font-bold hover:bg-[#006097] transition flex items-center gap-2"
              >
                <LinkedInIcon className="h-4 w-4" />
                Share on LinkedIn
              </a>
            </div>
          </div>
        )}
      </main>

      {/* Floating Bottom Sticky Bar on Step 3 (Payment) */}
      {currentStep === 3 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#070b13]/95 backdrop-blur-md border-t border-amber-400/40 p-3 sm:p-4 shadow-2xl animate-in slide-in-from-bottom duration-200">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-lg bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center justify-center font-bold text-sm shrink-0">
                ₹
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Step 3: Certification Assessment Fee</span>
                <span className="text-[11px] text-amber-300 font-semibold">₹1 • Google Pay (UPI)</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleGPayDirect}
                disabled={isProcessingPayment}
                className="w-full sm:w-auto px-8 py-3 rounded-xl font-bold text-xs sm:text-sm text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 transition shadow-md cursor-pointer shrink-0 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <GooglePayIcon className="h-5 w-5 shrink-0" />
                <span>{isProcessingPayment ? 'Processing...' : 'Pay ₹1 via Google Pay'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Bottom Sticky Bar on Step 4 (Assessment) */}
      {currentStep === 4 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#070b13]/95 backdrop-blur-md border-t border-emerald-500/40 p-3 sm:p-4 shadow-2xl animate-in slide-in-from-bottom duration-200">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center font-bold text-sm shrink-0">
                {Object.keys(selectedAnswers).length}/{questions.length}
              </div>
              <div>
                <span className="text-xs font-bold text-white block">
                  Assessment Progress: {Object.keys(selectedAnswers).length} of {questions.length} Answered
                </span>
                <span className="text-[11px] text-slate-400">
                  {Object.keys(selectedAnswers).length >= questions.length
                    ? '🎉 All questions completed! Click Submit to generate your official certificate.'
                    : `Answer the remaining ${questions.length - Object.keys(selectedAnswers).length} question(s) to finish.`}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              {Object.keys(selectedAnswers).length >= questions.length ? (
                <button
                  type="button"
                  onClick={() => handleSubmitAssessment()}
                  disabled={isSubmittingAssessment}
                  className="flex-1 sm:flex-none px-6 py-3 rounded-xl font-extrabold text-xs sm:text-sm text-white bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 transition shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Award className="h-4 w-4" />
                  <span>{isSubmittingAssessment ? 'Evaluating...' : 'Submit &amp; Claim Certificate →'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    const unanswered = questions.find((q) => selectedAnswers[q.id] === undefined)
                    if (unanswered) {
                      const idx = questions.findIndex((q) => q.id === unanswered.id)
                      const el = document.getElementById(`question-card-${idx}`)
                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
                    }
                  }}
                  className="flex-1 sm:flex-none px-5 py-3 rounded-xl font-bold text-xs sm:text-sm text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  Next Unanswered Question ↓
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 2. RICH CONTENT SECTIONS (IN PROPER ORDER) */}
      {/* ============================================================ */}
      <div id="certification-overview" className="max-w-5xl mx-auto px-4 sm:px-6 mt-16 space-y-20">

        {/* SECTION 3: RECRUITER CERTIFICATION VS HR CERTIFICATION */}
        <section className="bg-[#0c1322] border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-4">
            <Layers className="h-3.5 w-3.5" />
            Comparison Analysis
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Recruiter Certification vs. HR Certification
          </h2>
          <p className="mt-2 text-slate-400 text-sm">
            Understand the critical distinction between recruitment specialization and general human resources management.
          </p>

          <div className="mt-8 overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-700/80 bg-slate-900/90 text-slate-300">
                  <th className="p-4 rounded-tl-xl font-bold uppercase tracking-wider text-[11px]">Feature / Focus</th>
                  <th className="p-4 font-bold uppercase tracking-wider text-[11px] text-amber-300">Recruiter Certification</th>
                  <th className="p-4 font-bold uppercase tracking-wider text-[11px] text-slate-400">General HR Certification</th>
                  <th className="p-4 rounded-tr-xl font-bold uppercase tracking-wider text-[11px] text-emerald-300">Our Integrated Program</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                <tr>
                  <td className="p-4 font-bold text-white">Primary Objective</td>
                  <td className="p-4 text-amber-200">Talent Acquisition, Candidate Sourcing &amp; Closing</td>
                  <td className="p-4 text-slate-400">Payroll, Benefits, Attendance &amp; Internal Policies</td>
                  <td className="p-4 text-emerald-300 font-semibold">End-to-End Recruitment + Core HR Lifecycle</td>
                </tr>
                <tr>
                  <td className="p-4 font-bold text-white">Core Toolset</td>
                  <td className="p-4 text-amber-200">ATS, LinkedIn Recruiter, Boolean Strings, Job Boards</td>
                  <td className="p-4 text-slate-400">HRIS, Payroll Portals, Biometric Systems</td>
                  <td className="p-4 text-emerald-300 font-semibold">ATS, AI Sourcing Tools, Interview Rubrics &amp; HRIS</td>
                </tr>
                <tr>
                  <td className="p-4 font-bold text-white">Assessment Basis</td>
                  <td className="p-4 text-amber-200">Candidate Pipeline Velocity &amp; Offer Conversion</td>
                  <td className="p-4 text-slate-400">Labor Law, Grievance Redressal, Compliance</td>
                  <td className="p-4 text-emerald-300 font-semibold">Practical Recruitment Drills &amp; Behavioral Scenarios</td>
                </tr>
                <tr>
                  <td className="p-4 font-bold text-white">Market Demand</td>
                  <td className="p-4 text-amber-200">High (Direct revenue &amp; headcount generator)</td>
                  <td className="p-4 text-slate-400">Moderate (Support function)</td>
                  <td className="p-4 text-emerald-300 font-semibold">Extremely High (Complete corporate readiness)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* SECTION 4: CERTIFICATION LEVELS (HIGHLIGHTING EXPERT LEVEL) */}
        <section className="bg-[#0c1322] border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold mb-4">
            <Award className="h-3.5 w-3.5" />
            Accreditation Framework
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Certification Levels &amp; Tier Standards
          </h2>
          <p className="mt-2 text-slate-400 text-sm">
            Candidates are graded on an objective performance rubric that unlocks specific credential levels, including our highest <strong>Expert Level</strong>.
          </p>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Level 1 */}
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-emerald-500/30 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  Level 1 • Passing 70–79%
                </span>
                <h3 className="text-lg font-bold text-white mt-4">Certified Recruiter / HR Associate</h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  Confirms foundational capability in candidate sourcing, initial telephone screening, JD comprehension, calling etiquette, and essential recruitment lifecycles.
                </p>
                <ul className="mt-4 space-y-1.5 text-xs text-slate-400">
                  <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-emerald-400" /> Basic Boolean Search</li>
                  <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-emerald-400" /> Resume Parsing &amp; Screening</li>
                  <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-emerald-400" /> Candidate Communication</li>
                </ul>
              </div>
            </div>

            {/* Level 2 */}
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-sky-500/30 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded-full border border-sky-500/20">
                  Level 2 • Passing 80–89%
                </span>
                <h3 className="text-lg font-bold text-white mt-4">Professional Recruiter / TA Specialist</h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  Validates mid-senior competency in technical/non-technical passive candidate headhunting, ATS workflow automation, structured STAR interviews, and offer management.
                </p>
                <ul className="mt-4 space-y-1.5 text-xs text-slate-400">
                  <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-sky-400" /> Advanced Sourcing &amp; X-Ray</li>
                  <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-sky-400" /> STAR Interview Frameworks</li>
                  <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-sky-400" /> Salary Negotiation &amp; Closing</li>
                </ul>
              </div>
            </div>

            {/* Level 3: EXPERT LEVEL */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-amber-500/15 via-slate-900 to-slate-900 border-2 border-amber-400/50 flex flex-col justify-between shadow-xl shadow-amber-500/10 relative">
              <div className="absolute top-3 right-3 text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full">
                Top Tier
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/20">
                  Level 3 • Score 90–100%
                </span>
                <h3 className="text-lg font-bold text-white mt-4">Expert Recruiter / TA Leader</h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  Our premier accreditation. Reflects master-level strategic recruiting: executive search, capacity planning, recruitment analytics, stakeholder SLAs, and AI-enabled sourcing systems.
                </p>
                <ul className="mt-4 space-y-1.5 text-xs text-slate-300 font-medium">
                  <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-amber-400" /> Executive Headhunting &amp; SLAs</li>
                  <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-amber-400" /> TA Metrics &amp; Cost Optimization</li>
                  <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-amber-400" /> Generative AI Recruitment Labs</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 5: EXAMINATION PROCESS */}
        <section className="bg-[#0c1322] border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold mb-4">
            <Clock className="h-3.5 w-3.5" />
            Exam Workflow
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Examination Process &amp; Format
          </h2>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold text-lg mb-3">
                01
              </div>
              <h3 className="font-bold text-white text-base">Self-Paced Online Test</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Complete the 10-question standardized assessment in one sitting from your laptop or mobile phone. Standard completion time is 15 minutes.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold text-lg mb-3">
                02
              </div>
              <h3 className="font-bold text-white text-base">Instant Algorithmic Grading</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Your responses are evaluated instantly against our national benchmark rubric. You receive your exact percentage score and earned level immediately.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold text-lg mb-3">
                03
              </div>
              <h3 className="font-bold text-white text-base">1 Free Retake Privilege</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                If you score below the 70% passing threshold, you can take a free retake to brush up on missed areas and secure your official accreditation.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 6: PRACTICAL ASSESSMENT */}
        <section className="bg-[#0c1322] border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-4">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Applied Knowledge
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Practical, Scenario-Based Evaluation
          </h2>
          <p className="mt-3 text-slate-300 text-sm sm:text-base leading-relaxed">
            The assessment moves beyond textbook theory to simulate genuine hiring scenarios. Candidates are tested on actual dilemmas recruiters face every day, including:
          </p>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              'Diagnosing and fixing low candidate response rates on LinkedIn and job portals.',
              'Resolving counter-offers and mitigating last-minute offer drop-outs.',
              'Structuring Boolean logic strings to isolate passive tech candidates.',
              'Calibrating hiring managers when requirements are unrealistic.',
              'Maintaining compliance with data privacy and anti-discrimination standards.',
              'Evaluating candidate cultural alignment using STAR questioning models.',
            ].map((pt, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs sm:text-sm text-slate-300">
                <div className="h-5 w-5 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="h-3.5 w-3.5" />
                </div>
                <span>{pt}</span>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 7, 8, 9: CERTIFICATE ID, QR CODE & EMPLOYER VERIFICATION */}
        <section className="bg-[#0c1322] border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold mb-4">
            <ShieldCheck className="h-3.5 w-3.5" />
            Credential Authenticity
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Triple Verification System: ID, QR Code &amp; Employer Portal
          </h2>
          <p className="mt-2 text-slate-400 text-sm">
            Every issued certificate is cryptographically secured against tampering and easily verified by corporate recruiters.
          </p>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="p-3 w-fit rounded-xl bg-amber-400/10 text-amber-300 mb-4">
                <FileCheck className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-white text-base">Permanent Certificate ID</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                A unique alphanumeric serial number (e.g., <code>RICP-2026-XXXX</code>) is assigned to each candidate and stored in the immutable institute database.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="p-3 w-fit rounded-xl bg-sky-400/10 text-sky-300 mb-4">
                <QrCode className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-white text-base">Dynamic QR Code Scan</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                An embedded QR code on the physical and PDF certificates redirects smartphone scanners directly to the live authentication record.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="p-3 w-fit rounded-xl bg-emerald-400/10 text-emerald-300 mb-4">
                <Search className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-white text-base">Employer Verification Portal</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Hiring managers and BGV agencies can query the candidate&apos;s credentials anytime at <code>/verify-certificate</code> for instant proof.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 10: SKILLS ASSESSED */}
        <section className="bg-[#0c1322] border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            Competency Map
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Key Competencies &amp; Skills Assessed
          </h2>
          <p className="mt-2 text-slate-400 text-sm">
            Our certification covers the full spectrum of high-demand modern recruiting skills:
          </p>

          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { name: 'Boolean & X-Ray Search', sub: 'Operators, syntax & sourcing' },
              { name: 'Candidate Screening', sub: 'Phone drills & STAR criteria' },
              { name: 'ATS Management', sub: 'Pipeline & candidate tracking' },
              { name: 'Job Description Drafting', sub: 'Persona & requirements' },
              { name: 'Offer Negotiation', sub: 'Salary banding & closing' },
              { name: 'Diversity & Inclusion', sub: 'Unbiased hiring frameworks' },
              { name: 'AI Recruiter Automation', sub: 'Prompts & screening tools' },
              { name: 'Recruitment Analytics', sub: 'Time-to-fill, cost & SLAs' },
            ].map((skill) => (
              <div key={skill.name} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-center flex flex-col justify-center">
                <BadgeCheck className="h-6 w-6 text-amber-400 mx-auto mb-2" />
                <h3 className="font-bold text-white text-xs sm:text-sm">{skill.name}</h3>
                <p className="text-[11px] text-slate-400 mt-1">{skill.sub}</p>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 11: CERTIFICATE VALIDITY */}
        <section className="bg-[#0c1322] border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-4">
                <Lock className="h-3.5 w-3.5" />
                Lifetime Accreditation
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Certificate Validity &amp; Renewal Policy
              </h2>
              <p className="mt-3 text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
                Your HR &amp; Recruitment Certification carries <strong>Lifetime Permanent Validity</strong>. There are no recurring annual maintenance fees, subscription charges, or mandatory expiration dates. Once awarded, your verified record remains permanently accessible in the national database.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center shrink-0 w-full sm:w-auto">
              <span className="text-3xl font-black text-emerald-400 block">LIFETIME</span>
              <span className="text-xs text-slate-400 uppercase font-bold tracking-wider mt-1 block">Validity Guaranteed</span>
            </div>
          </div>
        </section>

        {/* SECTION 12: SAMPLE CERTIFICATE SHOWCASE */}
        <section className="bg-[#0c1322] border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl">
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold mb-4">
              <Award className="h-3.5 w-3.5" />
              Official Credential Preview
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Sample HR &amp; Recruitment Certificate
            </h2>
            <p className="mt-2 text-slate-400 text-sm">
              Each awarded candidate receives a high-resolution, vector-rendered digital certificate complete with security elements, seal, and live verification URL.
            </p>
          </div>

          <div className="mt-8 max-w-3xl mx-auto rounded-2xl overflow-hidden border-2 border-amber-500/30 bg-black/80 shadow-2xl p-4 sm:p-6 text-center">
            <div className="border border-amber-500/30 rounded-xl p-8 bg-gradient-to-b from-[#0b1424] to-[#070b13] relative">
              <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-amber-400/20 text-amber-300 flex items-center justify-center font-bold">
                    <Award className="h-6 w-6 text-amber-400" />
                  </div>
                  <div className="text-left">
                    <span className="text-sm font-black tracking-wider uppercase text-white block">RECRUITMENT INSTITUTE</span>
                    <span className="text-[10px] text-amber-400 uppercase font-semibold">National Credentialing Directorate</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono text-slate-400">ID: RICP-2026-SAMPLE</span>
                </div>
              </div>

              <span className="text-[11px] font-bold tracking-widest uppercase text-amber-400 block mb-2">CERTIFICATE OF COMPETENCY</span>
              <p className="text-xs text-slate-400">This is to certify that</p>
              <h3 className="text-2xl sm:text-3xl font-black text-white mt-1 mb-2 tracking-wide">CANDIDATE NAME</h3>
              <p className="text-xs text-slate-300 max-w-lg mx-auto">
                has successfully completed the comprehensive examination and demonstrated benchmarked excellence in
              </p>
              <p className="text-base sm:text-lg font-bold text-amber-300 mt-2 mb-4">
                HR &amp; Recruitment Professional Certification (Expert Level)
              </p>

              <div className="flex flex-wrap items-center justify-between border-t border-slate-800 pt-6 mt-6 text-left text-xs text-slate-400 gap-4">
                <div>
                  <span className="block font-semibold text-slate-200">Director of Assessment</span>
                  <span className="text-[11px]">Recruitment Institute India</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 text-[11px] text-emerald-400">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Cryptographically Verified</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 13: STEP-BY-STEP VERIFICATION PROCESS */}
        <section className="bg-[#0c1322] border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-4">
            <Search className="h-3.5 w-3.5" />
            Verification SOP
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            How Verification Works (Step-by-Step)
          </h2>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-4 gap-5">
            {[
              {
                step: 'Step 01',
                title: 'Locate Credential ID',
                desc: 'Find the unique Certificate ID (e.g. RICP-XXXX) or QR code on the certificate.',
              },
              {
                step: 'Step 02',
                title: 'Open Verification Portal',
                desc: 'Visit /verify-certificate or scan the QR code with any smartphone camera.',
              },
              {
                step: 'Step 03',
                title: 'Submit Query',
                desc: 'Enter the Certificate ID into the secure verification search bar.',
              },
              {
                step: 'Step 04',
                title: 'Confirm Live Status',
                desc: 'Instant official display shows candidate name, level, score, and active status.',
              },
            ].map((s) => (
              <div key={s.step} className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
                <span className="text-xs font-bold text-amber-400 tracking-wider uppercase block mb-2">{s.step}</span>
                <h3 className="font-bold text-white text-sm mb-1">{s.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 14: CAREER BENEFITS */}
        <section className="bg-[#0c1322] border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold mb-4">
            <TrendingUp className="h-3.5 w-3.5" />
            Professional ROI
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Career &amp; Business Benefits of Certification
          </h2>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              {
                title: 'High Resume Shortlisting by ATS & Employers',
                desc: 'Recruiters and corporate talent acquisition teams prioritize applicants who demonstrate verified practical competency, accelerating your interview callbacks.',
              },
              {
                title: 'Competitive Advantage for Salaries & Appraisals',
                desc: 'Use formal credentialing to validate higher compensation benchmarks during salary negotiations and annual performance appraisals.',
              },
              {
                title: 'Instant Trust for Agency Pitches & Freelancing',
                desc: 'Independent recruiters and staffing startup owners can showcase official accreditation to build immediate credibility with enterprise clients.',
              },
              {
                title: 'One-Click LinkedIn Credential Integration',
                desc: 'Add your verifiable badge directly to your LinkedIn Licenses & Certifications section with an official verification URL that employers can confirm in one click.',
              },
            ].map((b) => (
              <div key={b.title} className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
                <div className="flex items-center gap-2 text-amber-400 mb-2">
                  <CheckCircle2 className="h-5 w-5 shrink-0" />
                  <h3 className="font-bold text-white text-base">{b.title}</h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pl-7">{b.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 15: FREQUENTLY ASKED QUESTIONS */}
        <section className="bg-[#0c1322] border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold mb-4">
            <HelpCircle className="h-3.5 w-3.5" />
            Got Questions?
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Frequently Asked Questions (FAQ)
          </h2>
          <p className="mt-2 text-slate-400 text-sm">
            Everything you need to know about the HR &amp; Recruitment Certification process.
          </p>

          <div className="mt-8 space-y-4">
            {[
              {
                q: 'What is the passing criterion for the certification assessment?',
                a: 'The passing threshold is 70% (7 out of 10 questions correct). Candidates scoring 70–79% earn the Certified Recruiter level, 80–89% earn Professional Recruiter level, and 90–100% earn the premier Expert Recruiter accreditation.',
              },
              {
                q: 'What happens if I fail the assessment on my first attempt?',
                a: 'Every applicant is entitled to one free retake immediately. You can review the instructions and retake the assessment without paying any additional fee.',
              },
              {
                q: 'How long does the entire certification process take?',
                a: 'The application and payment process takes less than 2 minutes. The online assessment takes approximately 15 minutes. Once passed, your certificate and verification URL are generated instantly.',
              },
              {
                q: 'Can employers and background verification (BGV) agencies verify my certificate?',
                a: 'Yes. Every certificate features a permanent Certificate ID and a dynamic QR code that connects directly to the official online verification portal at /verify-certificate.',
              },
              {
                q: 'Are there any recurring annual fees or expiration dates?',
                a: 'No. The certification carries lifetime validity with zero recurring subscription or renewal charges.',
              },
              {
                q: 'In what format is the certificate delivered?',
                a: 'You receive instant on-screen access to view and download a high-resolution, print-ready vector PDF copy, as well as an automatic copy sent to your registered email address.',
              },
            ].map((faq, idx) => {
              const isOpen = openFaqIndex === idx
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-800 bg-slate-900/70 overflow-hidden transition"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 text-white font-bold text-sm sm:text-base hover:bg-slate-800/60 transition cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`h-5 w-5 text-amber-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/60">
                      {faq.a}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>

        {/* BOTTOM CALL TO ACTION */}
        <section className="bg-gradient-to-r from-amber-500/20 via-slate-900 to-amber-500/20 border border-amber-400/40 rounded-3xl p-8 sm:p-12 text-center shadow-2xl">
          <Award className="h-12 w-12 text-amber-400 mx-auto mb-4" />
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Ready to Validate Your HR &amp; Recruitment Expertise?
          </h2>
          <p className="mt-2 text-sm text-slate-300 max-w-xl mx-auto">
            Take the official competency assessment, earn your verified credential ID, and showcase your certified hiring capabilities to employers nationwide.
          </p>
          <div className="mt-6">
            <button
              type="button"
              onClick={() => {
                setCurrentStep(2)
                scrollToCard()
              }}
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-sm shadow-xl shadow-amber-400/20 transition cursor-pointer"
            >
              Start Your Certification Application Now →
            </button>
          </div>
        </section>

      </div>

      {/* Footer Notice */}
      <footer className="mt-20 border-t border-slate-900 bg-[#05080e] py-8 text-center text-xs text-slate-600">
        <div className="max-w-4xl mx-auto px-4">
          <p>© 2026 Recruitment Institute. National Directorate for HR &amp; Recruitment Credentialing.</p>
          <p className="mt-1">
            All certifications are cryptographically registered and verifiable via the national digital registry.
          </p>
        </div>
      </footer>
    </div>
  )
}

'use client'

import { useState, useMemo } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { RECRUITMENT_TEMPLATES, RecruitmentTemplate } from '@/lib/data/admin-templates'
import {
  FileText,
  Send,
  Copy,
  Check,
  Search,
  ExternalLink,
  MessageSquare,
  Sparkles,
  Download,
  Mail,
  FileCheck,
  Layers,
  Calculator,
  ShieldCheck,
  Eye,
  X,
  Phone,
  User,
  HelpCircle,
  Clock
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminTemplatesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [activeTemplate, setActiveTemplate] = useState<RecruitmentTemplate | null>(null)
  const [sendModalTemplate, setSendModalTemplate] = useState<RecruitmentTemplate | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Send form states
  const [recipientName, setRecipientName] = useState('')
  const [recipientEmail, setRecipientEmail] = useState('')
  const [recipientPhone, setRecipientPhone] = useState('')
  const [customNote, setCustomNote] = useState('')
  const [isSending, setIsSending] = useState(false)

  // Categories
  const categories = ['All', 'Templates', 'Calculators', 'Practical Tools']

  // Filter templates
  const filteredTemplates = useMemo(() => {
    return RECRUITMENT_TEMPLATES.filter((tmpl) => {
      const matchCategory = selectedCategory === 'All' || tmpl.category === selectedCategory
      const matchSearch =
        tmpl.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tmpl.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tmpl.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
      return matchCategory && matchSearch
    })
  }, [selectedCategory, searchQuery])

  // Copy full content
  const handleCopy = (tmpl: RecruitmentTemplate) => {
    navigator.clipboard.writeText(tmpl.fullContent)
    setCopiedId(tmpl.id)
    toast.success(`Copied "${tmpl.title}" content to clipboard!`)
    setTimeout(() => setCopiedId(null), 2500)
  }

  // Open send modal
  const handleOpenSendModal = (tmpl: RecruitmentTemplate) => {
    setSendModalTemplate(tmpl)
    setRecipientName('')
    setRecipientEmail('')
    setRecipientPhone('')
    setCustomNote(`Hi, as requested, here is the official ${tmpl.title} from Recruitment Institute. Please let us know if you need assistance customizing it.`)
  }

  // Handle email send
  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!sendModalTemplate || !recipientEmail) {
      toast.error('Recipient email is required')
      return
    }

    try {
      setIsSending(true)
      const res = await fetch('/api/admin/templates/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: sendModalTemplate.id,
          recipientName,
          recipientEmail,
          recipientPhone,
          customNote
        })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to send template')

      toast.success(data.message || 'Template successfully sent!')
      setSendModalTemplate(null)
    } catch (err: any) {
      toast.error(err.message || 'Error sending template')
    } finally {
      setIsSending(false)
    }
  }

  // Handle WhatsApp launch
  const handleSendWhatsApp = () => {
    if (!sendModalTemplate) return
    const phoneClean = recipientPhone.replace(/[^0-9]/g, '')
    const targetPhone = phoneClean.length === 10 ? `91${phoneClean}` : phoneClean
    const text = encodeURIComponent(
      `Hello ${recipientName || 'there'}!\n\nAs requested, here is the *${sendModalTemplate.title}* from *Recruitment Institute*:\n\n${sendModalTemplate.whatsappSnippet}\n\nAccess all tools: https://recruitmentinstitute.in/tools\n\nNeed assistance? Feel free to reply here!`
    )
    const url = targetPhone ? `https://wa.me/${targetPhone}?text=${text}` : `https://wa.me/?text=${text}`
    window.open(url, '_blank')
  }

  // Download raw file
  const handleDownload = (tmpl: RecruitmentTemplate) => {
    const element = document.createElement('a')
    const file = new Blob([tmpl.fullContent], { type: 'text/plain;charset=utf-8' })
    element.href = URL.createObjectURL(file)
    element.download = `${tmpl.slug}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
    toast.success(`Downloaded ${tmpl.title}`)
  }

  return (
    <AdminLayout title="Recruitment Templates & Resource Suite">
      <div className="max-w-7xl mx-auto space-y-6 pb-12">
        {/* ── TOP HEADER BANNER ───────────────────────────── */}
        <div className="rounded-2xl bg-gradient-to-r from-[#0A1628] via-[#1E293B] to-[#0F172A] p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-3.5 py-1 text-xs font-semibold text-blue-300 mb-3">
                <Sparkles className="h-3.5 w-3.5 text-blue-400" />
                <span>Candidate &amp; Client Resource Suite</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Recruitment Templates &amp; Practical Tools
              </h1>
              <p className="mt-2 text-sm text-slate-300 max-w-2xl leading-relaxed">
                All 11 practical kits, calculators, legal contracts, and swipe files featured on the public website. Ready to copy, download, or dispatch directly to any student or client via Email and WhatsApp.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <a
                href="/tools"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/20 transition-all backdrop-blur-sm"
              >
                <span>View Public Tools Page</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
              <div className="rounded-xl bg-blue-600/30 border border-blue-500/40 px-4 py-2.5 text-center">
                <div className="text-xl font-extrabold text-blue-200">{RECRUITMENT_TEMPLATES.length}</div>
                <div className="text-[10px] uppercase tracking-wider font-semibold text-blue-300/80">Kits Ready</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── FILTER & SEARCH BAR ───────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          {/* Categories */}
          <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates, tags..."
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        </div>

        {/* ── TEMPLATES GRID ─────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTemplates.map((tmpl) => (
            <div
              key={tmpl.id}
              className="group flex flex-col justify-between rounded-xl bg-white border border-slate-200 hover:border-blue-400 p-5 shadow-xs hover:shadow-md transition-all duration-200"
            >
              <div>
                {/* Badges row */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 border border-blue-200/60 px-2 py-0.5 text-[11px] font-bold text-blue-700">
                    <FileCheck className="h-3 w-3" />
                    <span>{tmpl.category}</span>
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                    <span>{tmpl.format}</span>
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">
                  {tmpl.title}
                </h3>

                {/* Summary */}
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 mb-4">
                  {tmpl.summary}
                </p>

                {/* Highlights List */}
                <div className="space-y-1.5 mb-5 border-t border-slate-100 pt-3">
                  {tmpl.highlights.slice(0, 3).map((h, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-[11.5px] text-slate-600">
                      <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{h}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="space-y-2 border-t border-slate-100 pt-3">
                <div className="flex items-center gap-2">
                  {/* Primary Send Button */}
                  <button
                    onClick={() => handleOpenSendModal(tmpl)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-xs transition-all"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Send to User</span>
                  </button>

                  {/* View/Preview Modal */}
                  <button
                    onClick={() => setActiveTemplate(tmpl)}
                    title="View & Inspect Content"
                    className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </button>

                  {/* Copy Button */}
                  <button
                    onClick={() => handleCopy(tmpl)}
                    title="Copy Full Content"
                    className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    {copiedId === tmpl.id ? (
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>

                  {/* Download Button */}
                  <button
                    onClick={() => handleDownload(tmpl)}
                    title="Download File"
                    className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── MODAL: PREVIEW & INSPECT FULL CONTENT ────────────── */}
        {activeTemplate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
            <div className="relative w-full max-w-3xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
                    {activeTemplate.format} • {activeTemplate.category}
                  </span>
                  <h2 className="text-lg font-bold text-slate-900">{activeTemplate.title}</h2>
                </div>
                <button
                  onClick={() => setActiveTemplate(null)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Body with Monospace Content */}
              <div className="p-6 overflow-y-auto flex-1 bg-slate-900 text-slate-100 font-mono text-xs leading-relaxed whitespace-pre-wrap select-all">
                {activeTemplate.fullContent}
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-3.5">
                <div className="text-xs text-slate-500">
                  {activeTemplate.tags.join(' • ')}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(activeTemplate)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-all"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy Full Text</span>
                  </button>
                  <button
                    onClick={() => {
                      const t = activeTemplate
                      setActiveTemplate(null)
                      handleOpenSendModal(t)
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition-all"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Send to User</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── MODAL: SEND TEMPLATE TO USER ─────────────────────── */}
        {sendModalTemplate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
            <div className="relative w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-[#0A1628] to-[#1E3A8A] px-6 py-4 text-white flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-semibold text-blue-300 uppercase tracking-wider">
                    Instant Dispatch Suite
                  </div>
                  <h2 className="text-lg font-bold">Send Template to User</h2>
                </div>
                <button
                  onClick={() => setSendModalTemplate(null)}
                  className="rounded-lg p-1 text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSendEmail} className="p-6 space-y-4">
                {/* Selected Template Info */}
                <div className="rounded-xl bg-blue-50 border border-blue-200/80 p-3.5">
                  <div className="text-xs font-semibold text-blue-900">{sendModalTemplate.title}</div>
                  <div className="text-[11px] text-blue-700 mt-0.5">
                    Format: {sendModalTemplate.format} | Subject: &ldquo;{sendModalTemplate.emailSubject}&rdquo;
                  </div>
                </div>

                {/* Recipient Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Candidate / Client Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      placeholder="e.g. Priya Sharma"
                      className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Recipient Email */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                      placeholder="e.g. priya.sharma@example.com"
                      className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Recipient Phone / WhatsApp */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    WhatsApp / Mobile Number (Optional)
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="tel"
                      value={recipientPhone}
                      onChange={(e) => setRecipientPhone(e.target.value)}
                      placeholder="e.g. 9876543210"
                      className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Custom Note */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Personalized Note from Academic Team
                  </label>
                  <textarea
                    rows={2}
                    value={customNote}
                    onChange={(e) => setCustomNote(e.target.value)}
                    placeholder="Enter custom note to accompany the email..."
                    className="w-full p-2.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
                  <button
                    type="submit"
                    disabled={isSending}
                    className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50 transition-all shadow-xs"
                  >
                    <Mail className="h-4 w-4" />
                    <span>{isSending ? 'Sending Email...' : 'Send via Email'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSendWhatsApp}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition-all shadow-xs"
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>Send via WhatsApp</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Calculator,
  FileText,
  FileSpreadsheet,
  CheckSquare,
  Search,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Download,
  Copy,
  Check,
  Layers,
  ChevronRight,
  ShieldCheck,
  Percent,
  BadgePercent,
  SlidersHorizontal,
  Mail,
  Scale,
  Briefcase
} from 'lucide-react'
import { ToolItem, ToolCategory, TOOL_CATEGORIES } from './tools-data'

interface ToolsClientProps {
  tools: ToolItem[]
}

export default function ToolsClient({ tools }: ToolsClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory>('All Tools')
  const [searchQuery, setSearchQuery] = useState('')

  // ── LIVE RECRUITMENT FEE CALCULATOR STATE ────────────────
  const [annualCtc, setAnnualCtc] = useState<number>(1000000)
  const [commissionRate, setCommissionRate] = useState<number>(8.33)
  const [includeGst, setIncludeGst] = useState<boolean>(true)
  const [copied, setCopied] = useState<boolean>(false)

  // Calculations
  const baseFee = Math.round((annualCtc * commissionRate) / 100)
  const gstAmount = includeGst ? Math.round(baseFee * 0.18) : 0
  const totalInvoice = baseFee + gstAmount
  const recruiterIncentive = Math.round(baseFee * 0.1) // 10% standard recruiter payout

  const formatInr = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val)
  }

  const handleCopySummary = () => {
    const text = `Recruitment Fee Estimation:
• Candidate Annual CTC: ${formatInr(annualCtc)}
• Agency Commission: ${commissionRate}%
• Base Placement Fee: ${formatInr(baseFee)}
• GST (18%): ${formatInr(gstAmount)}
• Total Invoice to Client: ${formatInr(totalInvoice)}
• Est. Recruiter Commission (10%): ${formatInr(recruiterIncentive)}
Generated via Recruitment Institute Tools (recruitmentinstitute.in/tools)`

    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  // Filter tools
  const filteredTools = useMemo(() => {
    return tools.filter((tool) => {
      const matchesCat =
        selectedCategory === 'All Tools' || tool.category === selectedCategory
      const q = searchQuery.toLowerCase().trim()
      const matchesQuery =
        !q ||
        tool.title.toLowerCase().includes(q) ||
        tool.shortDescription.toLowerCase().includes(q) ||
        tool.format.toLowerCase().includes(q) ||
        tool.highlights.some((h) => h.toLowerCase().includes(q))
      return matchesCat && matchesQuery
    })
  }, [tools, selectedCategory, searchQuery])

  const getFormatBadge = (format: ToolItem['format']) => {
    switch (format) {
      case 'Interactive Tool':
        return {
          icon: <Calculator className="h-3.5 w-3.5 text-blue-600" />,
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
        }
      case 'Excel Spreadsheet':
        return {
          icon: <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />,
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        }
      case 'Word & Google Docs':
        return {
          icon: <FileText className="h-3.5 w-3.5 text-purple-600" />,
          bg: 'bg-purple-50 text-purple-700 border-purple-200',
        }
      case 'Legal Contract':
        return {
          icon: <Scale className="h-3.5 w-3.5 text-amber-600" />,
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
        }
      case 'Email Swipe File':
        return {
          icon: <Mail className="h-3.5 w-3.5 text-rose-600" />,
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
        }
      default:
        return {
          icon: <CheckSquare className="h-3.5 w-3.5 text-slate-600" />,
          bg: 'bg-slate-50 text-slate-700 border-slate-200',
        }
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── HERO SECTION ─────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#0A1628] pt-28 pb-24 text-white">
        {/* Background Image with Cinematic Vignette Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/assets/images/hero/tools_workspace_hero.jpg"
            alt="Recruitment Tools and Calculators - Recruitment Institute"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center brightness-[0.72] contrast-[1.08] saturate-[1.10]"
          />
          {/* Subtle multi-layer cinematic overlay: allows the high-tech command center and data visualizations to shine through while keeping typography crisp */}
          <div className="absolute inset-0 bg-[#0A1628]/55" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0A1628]/75 via-transparent to-[#0A1628]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A1628]/60 via-transparent to-[#0A1628]/60" />
        </div>

        {/* Glow ambient backdrops */}
        <div className="pointer-events-none absolute -top-24 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-blue-600/20 blur-3xl z-0" />
        <div className="pointer-events-none absolute top-1/3 -right-20 h-80 w-80 rounded-full bg-emerald-600/15 blur-3xl z-0" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="mb-6 flex items-center gap-2 text-xs font-medium text-slate-400">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
            <span className="text-white">Tools</span>
          </nav>

          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-300 backdrop-blur-sm mb-6">
              <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
              <span>Recruiter Productivity Suite</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white mb-4">
              Tools
            </h1>

            <p className="text-lg sm:text-xl text-slate-300 font-normal leading-relaxed mb-8">
              Recruitment calculators, templates and practical tools
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm text-slate-300">
              <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
                <Calculator className="h-4 w-4 text-blue-400" /> Instant Fee &amp; Commission Calculators
              </span>
              <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
                <FileText className="h-4 w-4 text-purple-400" /> Production-Grade JD &amp; Contract Templates
              </span>
              <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
                <ShieldCheck className="h-4 w-4 text-emerald-400" /> Battle-Tested by 1,200+ Recruiters
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── INTERACTIVE RECRUITMENT FEE CALCULATOR WIDGET ─── */}
      <section id="calculator" className="relative -mt-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 z-20">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-9 shadow-xl shadow-slate-200/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-6 border-b border-slate-100">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
                <BadgePercent className="h-4 w-4" />
                <span>Live Interactive Calculator</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Recruitment Placement Fee Calculator
              </h2>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-700 shrink-0">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Indian GST Model
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Input Controls (Left Column) */}
            <div className="lg:col-span-6 space-y-6">
              {/* Annual CTC Input */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Candidate Annual CTC (₹)
                  </label>
                  <span className="text-sm font-extrabold text-blue-600">
                    {formatInr(annualCtc)}
                  </span>
                </div>
                <input
                  type="range"
                  min="200000"
                  max="5000000"
                  step="50000"
                  value={annualCtc}
                  onChange={(e) => setAnnualCtc(Number(e.target.value))}
                  className="w-full accent-blue-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                />
                {/* CTC Quick Preset Buttons */}
                <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto pb-1">
                  {[
                    { label: '6 LPA', val: 600000 },
                    { label: '10 LPA', val: 1000000 },
                    { label: '15 LPA', val: 1500000 },
                    { label: '25 LPA', val: 2500000 },
                    { label: '40 LPA', val: 4000000 },
                  ].map((p) => (
                    <button
                      key={p.val}
                      onClick={() => setAnnualCtc(p.val)}
                      className={`px-2.5 py-1 text-[11px] font-semibold rounded-md border transition-all cursor-pointer ${
                        annualCtc === p.val
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Commission Percentage */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Agency Placement Fee (%)
                  </label>
                  <span className="text-sm font-extrabold text-blue-600">
                    {commissionRate}%
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: '8.33% (1 Mo)', val: 8.33 },
                    { label: '10.0%', val: 10.0 },
                    { label: '12.5%', val: 12.5 },
                    { label: '15.0%', val: 15.0 },
                  ].map((rate) => (
                    <button
                      key={rate.val}
                      onClick={() => setCommissionRate(rate.val)}
                      className={`p-2 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer ${
                        commissionRate === rate.val
                          ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {rate.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* GST Toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2">
                  <Percent className="h-4 w-4 text-slate-500" />
                  <span className="text-xs font-semibold text-slate-800">
                    Apply 18% GST (Standard Indian Invoicing)
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={includeGst}
                  onChange={(e) => setIncludeGst(e.target.checked)}
                  className="h-4 w-4 accent-blue-600 rounded cursor-pointer"
                />
              </div>
            </div>

            {/* Live Calculation Results Card (Right Column) */}
            <div className="lg:col-span-6 flex flex-col justify-between rounded-2xl bg-gradient-to-br from-slate-900 via-[#0F172A] to-slate-900 p-6 text-white shadow-md">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                  Estimated Invoice Breakdown
                </p>

                <div className="space-y-3.5 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <span className="text-slate-300">Base Placement Fee ({commissionRate}%)</span>
                    <span className="font-bold text-white text-sm">{formatInr(baseFee)}</span>
                  </div>

                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <span className="text-slate-300">GST @ 18% (CGST + SGST)</span>
                    <span className="font-bold text-slate-300">
                      {includeGst ? formatInr(gstAmount) : '₹0 (Excluded)'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <p className="text-xs font-medium text-slate-400">Total Invoice to Client</p>
                      <p className="text-2xl sm:text-3xl font-black text-emerald-400">
                        {formatInr(totalInvoice)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] font-medium text-slate-400">Recruiter Incentive (10%)</p>
                      <p className="text-base sm:text-lg font-extrabold text-blue-300">
                        {formatInr(recruiterIncentive)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-6 mt-6 border-t border-white/10 flex flex-col sm:flex-row items-center gap-2.5">
                <button
                  onClick={handleCopySummary}
                  className="w-full sm:flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-white/10 border border-white/15 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/20 transition-all cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-400" />
                      <span>Copied Breakdown!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 text-slate-300" />
                      <span>Copy Calculation</span>
                    </>
                  )}
                </button>
                <Link
                  href="/contact?subject=recruitment-pricing-consulting"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-700 transition-all text-center"
                >
                  <span>Structure Your Fee Model</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TOOL CATEGORIES & SEARCH ─────────────────────── */}
      <section className="mt-16 sticky top-[72px] z-10 border-b border-slate-200 bg-white/95 backdrop-blur-md py-4 shadow-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
              {TOOL_CATEGORIES.map((cat) => {
                const count =
                  cat === 'All Tools'
                    ? tools.length
                    : tools.filter((t) => t.category === cat).length
                const isActive = selectedCategory === cat
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#0F172A] text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                    }`}
                  >
                    <span>{cat}</span>
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Search */}
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search templates, calculators, tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-slate-200 bg-slate-50 pl-10 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-hidden transition-all"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── ALL TOOLS GRID ───────────────────────────────── */}
      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-blue-600 mb-1.5">
                <Briefcase className="h-4 w-4" />
                <span>Resource Catalog</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Recruitment Calculators, Templates &amp; Practical Tools
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md">
              Showing {filteredTools.length} resource{filteredTools.length === 1 ? '' : 's'} to streamline candidate evaluation, fee negotiation, and daily sourcing.
            </p>
          </div>

          {filteredTools.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-slate-300 mb-3" />
              <h3 className="text-base font-bold text-slate-800 mb-1">
                No tools found matching your search
              </h3>
              <p className="text-xs text-slate-500 mb-5">
                Try selecting &ldquo;All Tools&rdquo; or clearing your keywords.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('All Tools')
                  setSearchQuery('')
                }}
                className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-4 py-2 text-xs font-medium text-white hover:bg-slate-800 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
              {filteredTools.map((tool) => {
                const formatBadge = getFormatBadge(tool.format)
                return (
                  <article
                    key={tool.id}
                    className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:shadow-lg hover:border-slate-300 transition-all duration-300"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-3.5">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          {tool.category}
                        </span>

                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${formatBadge.bg}`}
                        >
                          {formatBadge.icon}
                          <span>{tool.format}</span>
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-lg font-bold text-slate-900 leading-snug tracking-tight mb-2.5 group-hover:text-blue-600 transition-colors">
                        {tool.title}
                      </h3>

                      {/* Description */}
                      <p className="text-xs text-slate-600 leading-relaxed mb-4">
                        {tool.shortDescription}
                      </p>

                      {/* Highlights */}
                      <ul className="mb-6 space-y-1.5">
                        {tool.highlights.map((highlight, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2 text-[11px] text-slate-700"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                            <span>{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* CTA Button */}
                    <div className="pt-4 border-t border-slate-100">
                      <Link
                        href={tool.ctaLink}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white group-hover:bg-blue-600 shadow-xs transition-all text-center"
                      >
                        <span>{tool.ctaText}</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── BOTTOM CTA SECTION ───────────────────────────── */}
      <section className="bg-white border-t border-slate-200 py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 border border-blue-200 px-3.5 py-1 text-xs font-bold text-blue-600 uppercase tracking-wider mb-4">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Custom Tool &amp; Framework Requests</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight mb-4">
            Need a Custom Tool, Template or Assessment Rubric?
          </h2>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed mb-8">
            Our industry mentors build tailored competency scorecards, compensation benchmarking models, and client contract templates for growing staffing agencies and corporate hiring teams.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/contact?subject=custom-tool-request"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-md hover:bg-blue-700 hover:shadow-lg transition-all"
            >
              <span>Request Custom Tool / Template</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/events"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all"
            >
              <span>Join Live Workshops &amp; Events</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

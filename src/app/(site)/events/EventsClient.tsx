'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Search,
  PlusCircle,
  Filter,
  BadgeCheck,
  Video,
  Layers,
  ChevronRight,
  ShieldCheck,
  Award
} from 'lucide-react'
import { EventItem, EventCategory, EVENT_CATEGORIES } from './events-data'

interface EventsClientProps {
  events: EventItem[]
}

export default function EventsClient({ events }: EventsClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<EventCategory>('All Events')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredEvents = useMemo(() => {
    return events.filter((evt) => {
      const matchesCategory =
        selectedCategory === 'All Events' || evt.category === selectedCategory
      const query = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !query ||
        evt.title.toLowerCase().includes(query) ||
        evt.shortDescription.toLowerCase().includes(query) ||
        evt.speaker.name.toLowerCase().includes(query) ||
        evt.category.toLowerCase().includes(query) ||
        evt.keyTakeaways.some((t) => t.toLowerCase().includes(query))
      return matchesCategory && matchesSearch
    })
  }, [events, selectedCategory, searchQuery])

  const getCategoryTheme = (category: EventItem['category']) => {
    switch (category) {
      case 'Workshops':
        return {
          bg: 'bg-emerald-50',
          text: 'text-emerald-700',
          border: 'border-emerald-200',
          badgeBg: 'bg-emerald-500/10',
          badgeText: 'text-emerald-600',
        }
      case 'Masterclasses':
        return {
          bg: 'bg-purple-50',
          text: 'text-purple-700',
          border: 'border-purple-200',
          badgeBg: 'bg-purple-500/10',
          badgeText: 'text-purple-600',
        }
      case 'Founder Meets':
        return {
          bg: 'bg-amber-50',
          text: 'text-amber-800',
          border: 'border-amber-200',
          badgeBg: 'bg-amber-500/10',
          badgeText: 'text-amber-700',
        }
      case 'HR & Recruitment Events':
        return {
          bg: 'bg-blue-50',
          text: 'text-blue-700',
          border: 'border-blue-200',
          badgeBg: 'bg-blue-500/10',
          badgeText: 'text-blue-600',
        }
      default:
        return {
          bg: 'bg-slate-50',
          text: 'text-slate-700',
          border: 'border-slate-200',
          badgeBg: 'bg-slate-500/10',
          badgeText: 'text-slate-600',
        }
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── HERO SECTION ─────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0A1628] via-[#0F213A] to-[#0A1628] pt-28 pb-20 text-white">
        {/* Glow ambient backdrops */}
        <div className="pointer-events-none absolute -top-24 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-blue-600/15 blur-3xl" />
        <div className="pointer-events-none absolute top-1/3 -right-20 h-80 w-80 rounded-full bg-red-600/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="mb-6 flex items-center gap-2 text-xs font-medium text-slate-400">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
            <span className="text-white">Events</span>
          </nav>

          <div className="text-center max-w-3xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-rose-300 backdrop-blur-sm mb-6">
              <Sparkles className="h-3.5 w-3.5 text-rose-400" />
              <span>Industry Sessions &amp; Networking</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white mb-4">
              Events
            </h1>

            {/* Subtext */}
            <p className="text-lg sm:text-xl text-slate-300 font-normal leading-relaxed mb-8">
              Workshops, masterclasses, founder meets and HR events
            </p>

            {/* Value Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm text-slate-300">
              <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
                <Video className="h-4 w-4 text-emerald-400" /> Live Interactive Format
              </span>
              <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
                <Award className="h-4 w-4 text-amber-400" /> Veteran Practitioner Mentors
              </span>
              <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
                <ShieldCheck className="h-4 w-4 text-blue-400" /> Certificates of Attendance
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── FILTER & SEARCH SECTION ──────────────────────── */}
      <section className="sticky top-[72px] z-20 border-b border-slate-200 bg-white/95 backdrop-blur-md py-4 shadow-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Category Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
              {EVENT_CATEGORIES.map((cat) => {
                const count =
                  cat === 'All Events'
                    ? events.length
                    : events.filter((e) => e.category === cat).length
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

            {/* Keyword Search */}
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search events, topics, mentors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-slate-200 bg-slate-50 pl-10 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-hidden transition-all"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── UPCOMING EVENTS GRID ─────────────────────────── */}
      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-blue-600 mb-1.5">
                <Calendar className="h-4 w-4" />
                <span>Schedule &amp; Cohorts</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Upcoming Events &amp; Sessions
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md">
              Showing {filteredEvents.length} session{filteredEvents.length === 1 ? '' : 's'} across workshops, masterclasses, and leadership meets.
            </p>
          </div>

          {filteredEvents.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <Calendar className="mx-auto h-12 w-12 text-slate-300 mb-3" />
              <h3 className="text-base font-bold text-slate-800 mb-1">
                No events found matching your filter
              </h3>
              <p className="text-xs text-slate-500 mb-5">
                Try selecting &ldquo;All Events&rdquo; or clearing your search keywords.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('All Events')
                  setSearchQuery('')
                }}
                className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-4 py-2 text-xs font-medium text-white hover:bg-slate-800 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
              {filteredEvents.map((evt) => {
                const theme = getCategoryTheme(evt.category)
                return (
                  <article
                    key={evt.id}
                    className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 shadow-xs hover:shadow-lg hover:border-slate-300 transition-all duration-300"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${theme.bg} ${theme.text} border ${theme.border}`}
                        >
                          <Layers className="h-3 w-3" />
                          {evt.category}
                        </span>

                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                            evt.status === 'Registration Open'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : evt.status === 'Filling Fast'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />
                          {evt.status}
                        </span>
                      </div>

                      {/* Event Title */}
                      <h3 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug tracking-tight mb-3 group-hover:text-blue-600 transition-colors">
                        {evt.title}
                      </h3>

                      {/* Date, Time & Mode Meta Box */}
                      <div className="rounded-xl bg-slate-50 border border-slate-100 p-3.5 mb-5 space-y-2 text-xs text-slate-700">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-blue-600 shrink-0" />
                          <span className="font-semibold text-slate-900">{evt.date}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                          <Clock className="h-4 w-4 text-slate-400 shrink-0" />
                          <span>{evt.time}</span>
                          <span className="text-slate-300">•</span>
                          <span className="text-slate-500 font-medium">{evt.duration}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                          <MapPin className="h-4 w-4 text-rose-500 shrink-0" />
                          <span>{evt.mode}</span>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-slate-600 leading-relaxed mb-5">
                        {evt.shortDescription}
                      </p>

                      {/* Key Takeaways */}
                      <div className="mb-6 space-y-2">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          Key Takeaways:
                        </p>
                        <ul className="space-y-1.5">
                          {evt.keyTakeaways.map((takeaway, idx) => (
                            <li
                              key={idx}
                              className="flex items-start gap-2 text-xs text-slate-700"
                            >
                              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                              <span>{takeaway}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Footer: Speaker & Action */}
                    <div className="pt-5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {/* Speaker Info */}
                      <div className="flex items-center gap-3">
                        {evt.speaker.avatar ? (
                          <div className="relative h-10 w-10 overflow-hidden rounded-full border border-slate-200 bg-slate-100 shrink-0">
                            <Image
                              src={evt.speaker.avatar}
                              alt={evt.speaker.name}
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-slate-600 shrink-0">
                            <Users className="h-5 w-5" />
                          </div>
                        )}
                        <div>
                          <p className="text-xs font-bold text-slate-900 leading-tight">
                            {evt.speaker.name}
                          </p>
                          <p className="text-[11px] text-slate-500 line-clamp-1 max-w-[200px]">
                            {evt.speaker.title}
                          </p>
                        </div>
                      </div>

                      {/* CTA Button */}
                      <Link
                        href={evt.ctaLink}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700 hover:shadow-md transition-all shrink-0 text-center"
                      >
                        <span>{evt.ctaText}</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </article>
                )
              })}

              {/* ── ADMIN / PROPOSE AN EVENT PLACEHOLDER CARD ──── */}
              <div className="flex flex-col justify-between rounded-2xl border-2 border-dashed border-slate-300 bg-gradient-to-br from-slate-50 to-white p-7 text-center hover:border-blue-400 transition-all">
                <div className="my-auto py-6">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600 mb-4">
                    <PlusCircle className="h-7 w-7" />
                  </div>
                  <span className="inline-block rounded-full bg-blue-100/60 px-3 py-1 text-[11px] font-bold text-blue-700 uppercase tracking-wider mb-2">
                    Propose / Host a Session
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
                    Want to Host an Event or Request a Topic?
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto mb-6 leading-relaxed">
                    Have an industry topic you want our faculty to cover, or want to host a private hiring workshop for your staffing agency? Let us know!
                  </p>
                  <Link
                    href="/contact?subject=event-suggestion"
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-all shadow-xs"
                  >
                    <span>Suggest or Request Event</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
                <div className="pt-4 border-t border-slate-200/60 text-[11px] text-slate-400">
                  Admin Note: New events can be added anytime in <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">events-data.ts</code>.
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── BOTTOM CTA SECTION ───────────────────────────── */}
      <section className="bg-white border-t border-slate-200 py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-red-50 border border-red-200 px-3.5 py-1 text-xs font-bold text-red-600 uppercase tracking-wider mb-4">
            <BadgeCheck className="h-3.5 w-3.5" />
            <span>Corporate &amp; Agency Partnerships</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight mb-4">
            Need a Tailored Workshop for Your Recruitment Team?
          </h2>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed mb-8">
            We deliver high-impact recruitment training, AI hiring bootcamps, and executive sourcing masterclasses customized for corporate talent acquisition teams and staffing agencies across India.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/contact"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-md hover:bg-blue-700 hover:shadow-lg transition-all"
            >
              <span>Contact Our Events Team</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/courses"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all"
            >
              <span>Explore Certification Programs</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

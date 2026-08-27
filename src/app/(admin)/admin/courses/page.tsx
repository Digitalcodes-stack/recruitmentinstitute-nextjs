import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getAdminSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import AdminLayout from '@/components/admin/AdminLayout'
import {
  BookOpen, Layers3, FileQuestion, ListChecks,
  BadgeCheck, BriefcaseBusiness, GraduationCap, Sparkles,
  ChevronRight, Plus, Users, Star, Calendar, HelpCircle, Pencil,
  Layers, ArrowUpRight,
} from 'lucide-react'
import CourseActions from '@/components/admin/CourseActions'
import CategoryActions from '@/components/admin/CategoryActions'
import FaqActions from '@/components/admin/FaqActions'

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

/* ── Category colour / icon map ─────────────────────────── */
const META: Record<string, {
  accent: string
  iconBg: string
  badgeBg: string
  badgeText: string
  icon: React.ComponentType<{ style?: React.CSSProperties }>
}> = {
  certification_tag: {
    accent: '#2563eb',
    iconBg: '#eff6ff',
    badgeBg: '#dbeafe',
    badgeText: '#1e40af',
    icon: BadgeCheck,
  },
  corporate_traning_tag: {
    accent: '#7c3aed',
    iconBg: '#f5f3ff',
    badgeBg: '#ede9fe',
    badgeText: '#6d28d9',
    icon: BriefcaseBusiness,
  },
  degree_tag: {
    accent: '#059669',
    iconBg: '#ecfdf5',
    badgeBg: '#d1fae5',
    badgeText: '#047857',
    icon: GraduationCap,
  },
  entrepreneur_tag: {
    accent: '#d97706',
    iconBg: '#fffbeb',
    badgeBg: '#fef3c7',
    badgeText: '#b45309',
    icon: Sparkles,
  },
}
const FALLBACK = {
  accent: '#334155',
  iconBg: '#f1f5f9',
  badgeBg: '#e2e8f0',
  badgeText: '#1e293b',
  icon: BookOpen,
}

type TabKey = 'categories' | 'courses' | 'faqs' | 'syllabus'
const TABS: { key: TabKey; label: string }[] = [
  { key: 'categories', label: 'Categories' },
  { key: 'courses',    label: 'Courses' },
  { key: 'faqs',       label: 'FAQs' },
  { key: 'syllabus',   label: 'Syllabus' },
]

export default async function AdminCoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; cat?: string }>
}) {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin') redirect('/admin/login')

  const sp = await searchParams
  const activeTab: TabKey = (sp.tab as TabKey) || 'categories'

  const categories = await prisma.courseCategory.findMany({
    include: {
      courses: {
        include: {
          batches: {
            select: {
              id: true,
              name: true,
              _count: { select: { enrollments: true } },
            },
          },
        },
      },
      faqs: true,
    },
    orderBy: { createdAt: 'asc' },
  })

  const allCourses = await prisma.course.findMany({
    include: {
      category: true,
      batches: {
        select: {
          id: true,
          name: true,
          status: true,
          _count: { select: { enrollments: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  const allFaqs = await prisma.faq.findMany({
    include: { category: true },
    orderBy: { createdAt: 'desc' },
  })

  const totalCourses = allCourses.length
  const totalFaqs = allFaqs.length

  /* Selected category for Categories tab */
  const selectedSlug = sp.cat ?? categories[0]?.slug ?? ''
  const selected = categories.find((c) => c.slug === selectedSlug) ?? categories[0]
  const selMeta = selected ? (META[selected.slug] ?? FALLBACK) : FALLBACK

  const cardStyle: React.CSSProperties = {
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: 18,
    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
  }

  return (
    <AdminLayout title="Course Management">

      {/* ── Page Header & Stats Summary ─────────────────────────────────── */}
      <div className="flex items-start justify-between gap-6 mb-7" style={{ flexWrap: 'wrap' }}>
        <div>
          <div
            className="inline-flex items-center gap-2 rounded-full mb-3"
            style={{
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              padding: '4px 12px',
              fontSize: 10.5,
              fontWeight: 700,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: '#2563eb',
            }}
          >
            <Layers3 style={{ width: 12, height: 12 }} />
            Enterprise Curriculum Workspace
          </div>
          <h1 className="font-black tracking-tight" style={{ fontSize: 26, color: '#0f172a', lineHeight: 1.2, margin: 0 }}>
            Course Management
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 4, maxWidth: 520, margin: '4px 0 0' }}>
            Manage category taxonomies, syllabus modules, assessments, and batch linkages.
          </p>
        </div>

        {/* Header Telemetry Pills */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {[
            { label: 'Categories', value: categories.length, icon: Layers3,      accent: '#2563eb', bg: '#eff6ff' },
            { label: 'Courses',    value: totalCourses,      icon: BookOpen,     accent: '#0891b2', bg: '#ecfeff' },
            { label: 'FAQs',       value: totalFaqs,         icon: FileQuestion, accent: '#059669', bg: '#ecfdf5' },
            { label: 'Syllabus',   value: 'Active',          icon: ListChecks,   accent: '#475569', bg: '#f8fafc' },
          ].map(({ label, value, icon: Icon, accent, bg }) => (
            <div
              key={label}
              style={{
                ...cardStyle,
                padding: '12px 16px',
                borderRadius: 14,
                minWidth: 105,
              }}
            >
              <div
                className="flex items-center gap-1.5 mb-1.5"
                style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#94a3b8' }}
              >
                <Icon style={{ width: 11, height: 11 }} />
                {label}
              </div>
              <div className="flex items-center justify-between gap-3">
                <span style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>
                  {value}
                </span>
                <span
                  style={{
                    fontSize: 9.5,
                    fontWeight: 700,
                    padding: '2px 7px',
                    borderRadius: 100,
                    background: bg,
                    color: accent,
                  }}
                >
                  Live
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Modern Linear-Style Tab Navigation ──────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: '#f1f5f9',
          padding: '4px',
          borderRadius: 12,
          width: 'fit-content',
          marginBottom: 24,
        }}
      >
        {TABS.map((tab) => {
          const count =
            tab.key === 'categories' ? categories.length :
            tab.key === 'courses'    ? totalCourses :
            tab.key === 'faqs'       ? totalFaqs : null
          const isActive = activeTab === tab.key

          return (
            <Link
              key={tab.key}
              href={`/admin/courses?tab=${tab.key}${selectedSlug ? `&cat=${selectedSlug}` : ''}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 16px',
                borderRadius: 8,
                fontSize: 12.5,
                fontWeight: isActive ? 700 : 600,
                textDecoration: 'none',
                transition: 'all 0.15s ease',
                color: isActive ? '#0f172a' : '#64748b',
                background: isActive ? '#ffffff' : 'transparent',
                boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              <span>{tab.label}</span>
              {count !== null && (
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    padding: '1px 6px',
                    borderRadius: 100,
                    background: isActive ? '#eff6ff' : '#e2e8f0',
                    color: isActive ? '#2563eb' : '#64748b',
                  }}
                >
                  {count}
                </span>
              )}
            </Link>
          )
        })}
      </div>

      {/* ══════════════════════════════════════════════════════
          TAB 1: CATEGORIES & DRILLDOWN DETAIL
      ══════════════════════════════════════════════════════ */}
      {activeTab === 'categories' && (
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 20, alignItems: 'start' }}>

          {/* Left: Categories Selector List */}
          <div style={{ ...cardStyle, overflow: 'hidden' }}>
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid #f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <p style={{ fontSize: 13.5, fontWeight: 800, color: '#0f172a', margin: 0 }}>Category Families</p>
                <p style={{ fontSize: 11, color: '#94a3b8', margin: '2px 0 0' }}>{categories.length} active tracks</p>
              </div>
              <Link
                href="/admin/categories/new"
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  background: '#2563eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  textDecoration: 'none',
                }}
                title="Add New Category"
              >
                <Plus style={{ width: 14, height: 14 }} />
              </Link>
            </div>

            <div>
              {categories.map((cat) => {
                const m = META[cat.slug] ?? FALLBACK
                const Icon = m.icon
                const isActive = cat.slug === selected?.slug

                return (
                  <div key={cat.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                    <Link
                      href={`/admin/courses?tab=categories&cat=${cat.slug}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '12px 18px',
                        textDecoration: 'none',
                        background: isActive ? '#f8faff' : 'transparent',
                        borderLeft: isActive ? `3px solid ${m.accent}` : '3px solid transparent',
                        transition: 'all 0.12s ease',
                      }}
                    >
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 8,
                          background: m.iconBg,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Icon style={{ width: 16, height: 16, color: m.accent }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: isActive ? 800 : 600, color: isActive ? '#0f172a' : '#334155', margin: 0 }}>
                          {cat.name}
                        </p>
                        <p style={{ fontSize: 11, color: '#94a3b8', margin: '2px 0 0' }}>
                          {cat.courses.length} Courses · {cat.faqs.length} FAQs
                        </p>
                      </div>
                      <ChevronRight style={{ width: 14, height: 14, color: isActive ? m.accent : '#cbd5e1' }} />
                    </Link>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '2px 14px 8px' }}>
                      <CategoryActions id={cat.id} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right: Refined Linear/Stripe Detail Card */}
          {selected ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              
              {/* Category Executive Summary Card */}
              <div style={{ ...cardStyle, overflow: 'hidden' }}>
                {/* Thin Accent Bar */}
                <div style={{ height: 4, background: `linear-gradient(90deg, ${selMeta.accent} 0%, #38bdf8 100%)` }} />

                <div style={{ padding: '24px 28px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 12,
                          background: selMeta.iconBg,
                          border: `1px solid ${selMeta.accent}33`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <selMeta.icon style={{ width: 22, height: 22, color: selMeta.accent }} />
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <h2 style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', margin: 0 }}>
                            {selected.name}
                          </h2>
                          <span
                            style={{
                              fontSize: 10.5,
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: 6,
                              background: selMeta.badgeBg,
                              color: selMeta.badgeText,
                            }}
                          >
                            Active Track
                          </span>
                        </div>
                        <p style={{ fontSize: 11.5, color: '#64748b', marginTop: 3, margin: 0 }}>
                          Tag: <code style={{ background: '#f1f5f9', padding: '1px 5px', borderRadius: 4 }}>{selected.slug}</code>
                        </p>
                      </div>
                    </div>

                    <Link
                      href={`/admin/courses/new?cat=${selected.id}`}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '8px 16px',
                        borderRadius: 8,
                        background: '#2563eb',
                        color: '#ffffff',
                        fontSize: 12.5,
                        fontWeight: 700,
                        textDecoration: 'none',
                        boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
                      }}
                    >
                      <Plus style={{ width: 14, height: 14 }} />
                      <span>Add Course</span>
                    </Link>
                  </div>

                  {/* 3 Modern Metric Tiles */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 20 }}>
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '12px 16px' }}>
                      <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#64748b', margin: 0 }}>
                        Courses in Family
                      </p>
                      <p style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', margin: '4px 0 0' }}>
                        {selected.courses.length}
                      </p>
                    </div>

                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '12px 16px' }}>
                      <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#64748b', margin: 0 }}>
                        Category FAQs
                      </p>
                      <p style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', margin: '4px 0 0' }}>
                        {selected.faqs.length}
                      </p>
                    </div>

                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '12px 16px' }}>
                      <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#64748b', margin: 0 }}>
                        Active Cohorts
                      </p>
                      <p style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', margin: '4px 0 0' }}>
                        {selected.courses.reduce((acc, c) => acc + c.batches.length, 0)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Course Offerings in this Category */}
              <div style={cardStyle}>
                <div
                  style={{
                    padding: '16px 24px',
                    borderBottom: '1px solid #f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <h3 style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      Courses in {selected.name}
                    </h3>
                    <p style={{ fontSize: 11, color: '#94a3b8', margin: '2px 0 0' }}>
                      {selected.courses.length} published offering{selected.courses.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                {selected.courses.length === 0 ? (
                  <div style={{ padding: '48px 24px', textAlign: 'center', color: '#94a3b8' }}>
                    <BookOpen style={{ width: 32, height: 32, color: '#cbd5e1', margin: '0 auto 8px' }} />
                    <p style={{ fontSize: 13.5, fontWeight: 600, color: '#64748b', margin: 0 }}>No courses in this category yet</p>
                    <p style={{ fontSize: 12, color: '#94a3b8', margin: '4px 0 0' }}>Click Add Course above to create your first curriculum.</p>
                  </div>
                ) : (
                  <div>
                    {selected.courses.map((course, idx) => {
                      const totalEnrolled = course.batches.reduce((sum, b) => sum + b._count.enrollments, 0)

                      return (
                        <div
                          key={course.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '16px 24px',
                            borderBottom: idx < selected.courses.length - 1 ? '1px solid #f8fafc' : 'none',
                            flexWrap: 'wrap',
                            gap: 12,
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, minWidth: 260 }}>
                            <div
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: 8,
                                background: selMeta.iconBg,
                                color: selMeta.accent,
                                fontSize: 12,
                                fontWeight: 800,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                              }}
                            >
                              {String(idx + 1).padStart(2, '0')}
                            </div>
                            <div>
                              <p style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                                {course.title}
                              </p>
                              {course.description && (
                                <p
                                  style={{
                                    fontSize: 12,
                                    color: '#64748b',
                                    margin: '3px 0 0',
                                    overflow: 'hidden',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 1,
                                    WebkitBoxOrient: 'vertical',
                                  }}
                                >
                                  {stripHtml(course.description)}
                                </p>
                              )}
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                                <span style={{ fontSize: 10.5, fontWeight: 700, background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '1px 7px', borderRadius: 5 }}>
                                  {(course as any).duration || '3 Months'}
                                </span>
                                <span style={{ fontSize: 11, color: '#64748b' }}>
                                  Batches: <strong>{course.batches.length}</strong> · Enrolled: <strong>{totalEnrolled}</strong>
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <CourseActions id={course.id} />
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* FAQs in this Category */}
              {selected.faqs.length > 0 && (
                <div style={cardStyle}>
                  <div
                    style={{
                      padding: '16px 24px',
                      borderBottom: '1px solid #f1f5f9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <h3 style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                        Category FAQs ({selected.faqs.length})
                      </h3>
                    </div>
                    <Link
                      href={`/admin/courses?tab=faqs&cat=${selected.slug}`}
                      style={{ fontSize: 12, fontWeight: 700, color: '#2563eb', textDecoration: 'none' }}
                    >
                      View All FAQs →
                    </Link>
                  </div>
                  <div>
                    {selected.faqs.slice(0, 3).map((faq, idx) => (
                      <div
                        key={faq.id}
                        style={{
                          padding: '14px 24px',
                          borderBottom: idx < Math.min(selected.faqs.length, 3) - 1 ? '1px solid #f8fafc' : 'none',
                        }}
                      >
                        <p style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                          {faq.question}
                        </p>
                        <p
                          style={{
                            fontSize: 12,
                            color: '#64748b',
                            lineHeight: 1.5,
                            margin: '4px 0 0',
                            overflow: 'hidden',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                          }}
                        >
                          {faq.answer}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div style={{ ...cardStyle, padding: '64px 32px', textAlign: 'center' }}>
              <BookOpen style={{ width: 40, height: 40, color: '#cbd5e1', margin: '0 auto 12px' }} />
              <p style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>Select a category</p>
              <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>
                Choose a category from the left panel to inspect its courses and FAQs.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          TAB 2: ALL COURSES FLAT LIST
      ══════════════════════════════════════════════════════ */}
      {activeTab === 'courses' && (
        <div style={cardStyle}>
          <div
            style={{
              padding: '18px 24px',
              borderBottom: '1px solid #f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                All Published Courses
              </h2>
              <p style={{ fontSize: 11.5, color: '#64748b', margin: '2px 0 0' }}>
                {totalCourses} course offering{totalCourses !== 1 ? 's' : ''} across {categories.length} tracks
              </p>
            </div>
            <Link
              href="/admin/courses/new"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 16px',
                borderRadius: 8,
                background: '#2563eb',
                color: '#ffffff',
                fontSize: 12.5,
                fontWeight: 700,
                textDecoration: 'none',
                boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
              }}
            >
              <Plus style={{ width: 14, height: 14 }} />
              <span>Add Course</span>
            </Link>
          </div>

          {allCourses.length === 0 ? (
            <div style={{ padding: '64px 24px', textAlign: 'center', color: '#94a3b8' }}>
              <BookOpen style={{ width: 36, height: 36, color: '#cbd5e1', margin: '0 auto 12px' }} />
              <p style={{ fontSize: 14, fontWeight: 600, color: '#64748b' }}>No courses found</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              {/* Header row */}
              <div
                style={{
                  padding: '12px 24px',
                  background: '#f8fafc',
                  borderBottom: '1px solid #f1f5f9',
                  display: 'grid',
                  gridTemplateColumns: '1.6fr 130px 100px 100px minmax(320px, auto)',
                  gap: 12,
                  minWidth: 900,
                  fontSize: 10,
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: '#64748b',
                }}
              >
                <span>Course Title</span>
                <span>Category</span>
                <span>Active Batches</span>
                <span>Enrolled</span>
                <span style={{ textAlign: 'right' }}>Actions</span>
              </div>

              {/* Rows */}
              {allCourses.map((c, idx) => {
                const m = META[c.category.slug] ?? FALLBACK
                const enrolled = c.batches.reduce((sum, b) => sum + b._count.enrollments, 0)

                return (
                  <div
                    key={c.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1.6fr 130px 100px 100px minmax(320px, auto)',
                      gap: 12,
                      alignItems: 'center',
                      padding: '14px 24px',
                      minWidth: 900,
                      borderBottom: idx < allCourses.length - 1 ? '1px solid #f8fafc' : 'none',
                    }}
                  >
                    <div style={{ paddingRight: 16 }}>
                      <p style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                        {c.title}
                      </p>
                      {c.courseBy && (
                        <p style={{ fontSize: 11, color: '#94a3b8', margin: '2px 0 0' }}>by {c.courseBy}</p>
                      )}
                    </div>
                    <div>
                      <span
                        style={{
                          fontSize: 10.5,
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: 6,
                          background: m.iconBg,
                          color: m.accent,
                          border: `1px solid ${m.accent}33`,
                        }}
                      >
                        {c.category.name}
                      </span>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                      {c.batches.filter((b) => b.status === 'ACTIVE').length} Active
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                      {enrolled} Students
                    </div>
                    <CourseActions id={c.id} />
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          TAB 3: FAQs
      ══════════════════════════════════════════════════════ */}
      {activeTab === 'faqs' && (
        <div style={cardStyle}>
          <div
            style={{
              padding: '18px 24px',
              borderBottom: '1px solid #f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Frequently Asked Questions
              </h2>
              <p style={{ fontSize: 11.5, color: '#64748b', margin: '2px 0 0' }}>
                {totalFaqs} questions published across all course tracks
              </p>
            </div>
            <Link
              href="/admin/faqs/new"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 16px',
                borderRadius: 8,
                background: '#2563eb',
                color: '#ffffff',
                fontSize: 12.5,
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              <Plus style={{ width: 14, height: 14 }} />
              <span>Add FAQ</span>
            </Link>
          </div>

          <div>
            {allFaqs.map((faq, idx) => (
              <div
                key={faq.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  padding: '16px 24px',
                  borderBottom: idx < allFaqs.length - 1 ? '1px solid #f8fafc' : 'none',
                  gap: 16,
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <HelpCircle style={{ width: 15, height: 15, color: '#2563eb', flexShrink: 0 }} />
                    <p style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                      {faq.question}
                    </p>
                    <span style={{ fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 4, background: '#f1f5f9', color: '#64748b' }}>
                      {faq.category?.name || 'General'}
                    </span>
                  </div>
                  <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.5, margin: '6px 0 0 23px' }}>
                    {faq.answer}
                  </p>
                </div>
                <FaqActions id={faq.id} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          TAB 4: SYLLABUS HUB
      ══════════════════════════════════════════════════════ */}
      {activeTab === 'syllabus' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ ...cardStyle, padding: '24px 28px' }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Syllabus & Curriculum Directory
            </h2>
            <p style={{ fontSize: 12.5, color: '#64748b', marginTop: 4, margin: '4px 0 0' }}>
              Each course curriculum includes structured chapters, video lectures, and downloadable resources.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
            {allCourses.map((course) => (
              <div key={course.id} style={{ ...cardStyle, padding: '18px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 10 }}>
                  <div>
                    <h3 style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      {course.title}
                    </h3>
                    <p style={{ fontSize: 11, color: '#64748b', margin: '2px 0 0' }}>
                      Category: {course.category.name}
                    </p>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4, background: '#eff6ff', color: '#2563eb' }}>
                    {course.batches.length} Batches
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14 }}>
                  <Link
                    href={`/admin/courses/${course.id}/curriculum`}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 4,
                      padding: '7px 12px',
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 700,
                      color: '#ffffff',
                      background: '#2563eb',
                      textDecoration: 'none',
                    }}
                  >
                    <ListChecks style={{ width: 13, height: 13 }} />
                    <span>Curriculum</span>
                  </Link>
                  <Link
                    href={`/admin/courses/${course.id}/assessment`}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 4,
                      padding: '7px 12px',
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 700,
                      color: '#475569',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      textDecoration: 'none',
                    }}
                  >
                    <span>Assessments</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </AdminLayout>
  )
}

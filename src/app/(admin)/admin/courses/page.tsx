import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getAdminSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import AdminLayout from '@/components/admin/AdminLayout'
import {
  BookOpen, Layers3, FileQuestion, ListChecks,
  BadgeCheck, BriefcaseBusiness, GraduationCap, Sparkles,
  ChevronRight, Plus, Users, Star, Calendar, HelpCircle, Pencil,
} from 'lucide-react'
import CourseActions from '@/components/admin/CourseActions'
import CategoryActions from '@/components/admin/CategoryActions'
import FaqActions from '@/components/admin/FaqActions'

/* ── category colour / icon map ─────────────────────────── */
const META: Record<string, {
  accent: string
  iconBg: string
  dot:    string
  icon:   React.ComponentType<{ style?: React.CSSProperties }>
}> = {
  certification_tag:     { accent: '#2563eb', iconBg: '#eff6ff', dot: '#2563eb', icon: BadgeCheck },
  corporate_traning_tag: { accent: '#7c3aed', iconBg: '#f5f3ff', dot: '#7c3aed', icon: BriefcaseBusiness },
  degree_tag:            { accent: '#059669', iconBg: '#f0fdf4', dot: '#059669', icon: GraduationCap },
  entrepreneur_tag:      { accent: '#d97706', iconBg: '#fffbeb', dot: '#d97706', icon: Sparkles },
}
const FALLBACK = { accent: '#334155', iconBg: '#f1f5f9', dot: '#334155', icon: BookOpen }

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

  const sp        = await searchParams
  const activeTab: TabKey = (sp.tab as TabKey) || 'categories'

  const categories = await prisma.courseCategory.findMany({
    include: { courses: true, faqs: true },
    orderBy: { createdAt: 'asc' },
  })

  const allCourses = await prisma.course.findMany({
    include: { category: true },
    orderBy: { createdAt: 'desc' },
  })

  const allFaqs = await prisma.faq.findMany({
    include: { category: true },
    orderBy: { createdAt: 'desc' },
  })

  const totalCourses = allCourses.length
  const totalFaqs    = allFaqs.length

  /* selected category for the Categories tab detail panel */
  const selectedSlug = sp.cat ?? categories[0]?.slug ?? ''
  const selected     = categories.find((c) => c.slug === selectedSlug) ?? categories[0]
  const selMeta      = selected ? (META[selected.slug] ?? FALLBACK) : FALLBACK

  const card = (extra?: React.CSSProperties): React.CSSProperties => ({
    background: '#ffffff', border: '1px solid #e8ecf0',
    borderRadius: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', ...extra,
  })

  return (
    <AdminLayout title="Course Management">

      {/* ── Page header ───────────────────────────────────── */}
      <div className="flex items-start justify-between gap-6 mb-7" style={{ flexWrap: 'wrap' }}>
        <div>
          <div className="inline-flex items-center gap-2 rounded-full mb-3"
            style={{ background: '#f0f9ff', border: '1px solid #bae6fd', padding: '5px 13px', fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#0284c7' }}>
            <Layers3 style={{ width: 11, height: 11 }} />
            Enterprise Course Workspace
          </div>
          <h2 className="font-black tracking-tight" style={{ fontSize: 26, color: '#0f172a', lineHeight: 1.2 }}>
            Course Management
          </h2>
          <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 5, maxWidth: 440 }}>
            Manage categories, course families, FAQs, and syllabus content.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {[
            { label: 'Categories', value: categories.length, icon: Layers3,      accent: '#2563eb', bg: '#eff6ff' },
            { label: 'Courses',    value: totalCourses,      icon: BookOpen,     accent: '#0891b2', bg: '#ecfeff' },
            { label: 'FAQs',       value: totalFaqs,         icon: FileQuestion, accent: '#059669', bg: '#f0fdf4' },
            { label: 'Syllabus',   value: 'Live',            icon: ListChecks,   accent: '#334155', bg: '#f1f5f9' },
          ].map(({ label, value, icon: Icon, accent, bg }) => (
            <div key={label} style={{ ...card(), padding: '14px 18px', borderRadius: 16, minWidth: 100 }}>
              <div className="flex items-center gap-1.5 mb-2"
                style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#94a3b8' }}>
                <Icon style={{ width: 11, height: 11 }} />
                {label}
              </div>
              <div className="flex items-center justify-between gap-3">
                <span style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>{value}</span>
                <span className="rounded-full font-semibold"
                  style={{ fontSize: 10, padding: '3px 8px', background: bg, color: accent, border: `1px solid ${accent}22` }}>
                  Live
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Tab bar ───────────────────────────────────────── */}
      <div className="flex items-center gap-2 mb-7" style={{ flexWrap: 'wrap' }}>
        {TABS.map((tab) => {
          const count =
            tab.key === 'categories' ? categories.length :
            tab.key === 'courses'    ? totalCourses :
            tab.key === 'faqs'       ? totalFaqs : null
          const isActive = activeTab === tab.key
          return (
            <Link key={tab.key}
              href={`/admin/courses?tab=${tab.key}${selectedSlug ? `&cat=${selectedSlug}` : ''}`}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '8px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                textDecoration: 'none', transition: 'all 0.15s',
                ...(isActive
                  ? { background: '#2563eb', color: '#ffffff', boxShadow: '0 4px 12px rgba(37,99,235,0.28)' }
                  : { background: '#ffffff', color: '#475569', border: '1px solid #e8ecf0' }),
              }}
            >
              {tab.label}
              {count !== null && (
                <span className="rounded-full font-bold"
                  style={{ fontSize: 10, padding: '2px 7px', background: isActive ? 'rgba(255,255,255,0.2)' : '#f1f5f9', color: isActive ? '#ffffff' : '#64748b' }}>
                  {count}
                </span>
              )}
            </Link>
          )
        })}
      </div>

      {/* ══════════════════════════════════════════════════════
          TAB: CATEGORIES
      ══════════════════════════════════════════════════════ */}
      {activeTab === 'categories' && (
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20, alignItems: 'start' }}>

          {/* Left: category list */}
          <div style={{ ...card(), overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>Categories</p>
                <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{categories.length} active</p>
              </div>
              <Link href="/admin/categories/new" className="flex items-center justify-center rounded-xl"
                style={{ width: 32, height: 32, background: '#2563eb', textDecoration: 'none' }}>
                <Plus style={{ width: 14, height: 14, color: '#ffffff' }} />
              </Link>
            </div>

            <div>
              {categories.map((cat) => {
                const m        = META[cat.slug] ?? FALLBACK
                const Icon     = m.icon
                const isActive = cat.slug === selected?.slug
                return (
                  <div key={cat.id}>
                    <Link
                      href={`/admin/courses?tab=categories&cat=${cat.slug}`}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px',
                        textDecoration: 'none', position: 'relative',
                        background: isActive ? '#fafbff' : 'transparent', transition: 'background 0.12s',
                      }}
                    >
                      {isActive && (
                        <span style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', width: 3, height: 28, borderRadius: '0 3px 3px 0', background: m.accent }} />
                      )}
                      <div className="flex items-center justify-center rounded-xl flex-shrink-0"
                        style={{ width: 38, height: 38, background: isActive ? m.accent : m.iconBg }}>
                        <Icon style={{ width: 16, height: 16, color: isActive ? '#ffffff' : m.accent }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: isActive ? '#0f172a' : '#374151', lineHeight: 1.3 }}>{cat.name}</p>
                        <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{cat.courses.length} courses · {cat.faqs.length} FAQs</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="rounded-full font-semibold"
                          style={{ fontSize: 10, padding: '3px 9px', background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0' }}>
                          Live
                        </span>
                        <ChevronRight style={{ width: 13, height: 13, color: '#cbd5e1' }} />
                      </div>
                    </Link>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '4px 16px 10px', borderBottom: '1px solid #f1f5f9' }}>
                      <CategoryActions id={cat.id} />
                    </div>
                  </div>
                )
              })}
              {categories.length === 0 && (
                <div className="flex flex-col items-center justify-center" style={{ padding: '48px 24px', textAlign: 'center' }}>
                  <BookOpen style={{ width: 28, height: 28, color: '#e2e8f0', marginBottom: 12 }} />
                  <p style={{ fontSize: 13, color: '#94a3b8' }}>No categories yet.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right: selected category detail */}
          {selected ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ ...card(), padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '28px 28px 24px', background: selMeta.accent, position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 90% at 90% -20%, rgba(255,255,255,0.18) 0%, transparent 60%)', pointerEvents: 'none' }} />
                  <div style={{ position: 'relative' }}>
                    <div className="flex items-start justify-between gap-4 mb-5">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center rounded-2xl flex-shrink-0"
                          style={{ width: 52, height: 52, background: 'rgba(255,255,255,0.18)' }}>
                          <selMeta.icon style={{ width: 24, height: 24, color: '#ffffff' }} />
                        </div>
                        <div>
                          <h3 className="font-black tracking-tight" style={{ fontSize: 22, color: '#ffffff', lineHeight: 1.2 }}>{selected.name}</h3>
                          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 3 }}>{selected.slug}</p>
                        </div>
                      </div>
                      <span className="rounded-full font-semibold flex-shrink-0"
                        style={{ fontSize: 11, padding: '5px 14px', background: 'rgba(255,255,255,0.15)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.22)' }}>
                        {selected.courses.length} Courses
                      </span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
                      {[{ label: 'Courses', value: selected.courses.length }, { label: 'FAQs', value: selected.faqs.length }, { label: 'Status', value: 'Live' }].map(({ label, value }) => (
                        <div key={label} style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 14, padding: '12px 14px' }}>
                          <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', marginBottom: 5 }}>{label}</p>
                          <p style={{ fontSize: 22, fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em' }}>{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 24, padding: '14px 28px', borderBottom: '1px solid #f1f5f9', flexWrap: 'wrap' }}>
                  {[
                    { icon: Users,    text: `${selected.courses.length} courses enrolled` },
                    { icon: Star,     text: 'Premium content' },
                    { icon: Calendar, text: 'Active & ongoing' },
                  ].map(({ icon: Icon, text }) => (
                    <div key={text} className="flex items-center gap-1.5">
                      <Icon style={{ width: 13, height: 13, color: '#94a3b8' }} />
                      <span style={{ fontSize: 12, color: '#64748b' }}>{text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Courses in this category */}
              <div style={card()}>
                <div style={{ padding: '18px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Courses in this category</p>
                    <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{selected.courses.length} course{selected.courses.length !== 1 ? 's' : ''} found</p>
                  </div>
                  <Link href={`/admin/courses/new?cat=${selected.id}`} className="inline-flex items-center gap-2 rounded-xl font-semibold"
                    style={{ fontSize: 12, padding: '8px 16px', background: selMeta.accent, color: '#ffffff', textDecoration: 'none', boxShadow: `0 3px 10px ${selMeta.accent}44` }}>
                    <Plus style={{ width: 13, height: 13 }} /> Add Course
                  </Link>
                </div>
                {selected.courses.length === 0 ? (
                  <div className="flex flex-col items-center justify-center" style={{ padding: '48px 24px', textAlign: 'center' }}>
                    <div className="flex items-center justify-center rounded-2xl mb-4"
                      style={{ width: 52, height: 52, background: '#f8fafc', border: '1px dashed #e2e8f0' }}>
                      <BookOpen style={{ width: 22, height: 22, color: '#cbd5e1' }} />
                    </div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#64748b' }}>No courses yet</p>
                    <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>Add your first course to this category.</p>
                  </div>
                ) : (
                  <div>
                    {selected.courses.map((course, idx) => (
                      <div key={course.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 24px', borderBottom: idx < selected.courses.length - 1 ? '1px solid #f8fafc' : 'none' }}>
                        <div className="flex items-center justify-center rounded-xl flex-shrink-0"
                          style={{ width: 36, height: 36, background: selMeta.iconBg, fontSize: 12, fontWeight: 700, color: selMeta.accent }}>
                          {String(idx + 1).padStart(2, '0')}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{course.title}</p>
                          {course.description && (
                            <p style={{ fontSize: 12, color: '#64748b', marginTop: 2, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' as const }}>
                              {course.description}
                            </p>
                          )}
                        </div>
                        <CourseActions id={course.id} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* FAQs preview */}
              {selected.faqs.length > 0 && (
                <div style={card()}>
                  <div style={{ padding: '18px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Category FAQs</p>
                      <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{selected.faqs.length} FAQ{selected.faqs.length !== 1 ? 's' : ''}</p>
                    </div>
                    <Link href={`/admin/courses?tab=faqs&cat=${selected.slug}`}
                      style={{ fontSize: 12, color: '#2563eb', textDecoration: 'none', fontWeight: 600 }}>
                      View all →
                    </Link>
                  </div>
                  <div>
                    {selected.faqs.slice(0, 3).map((faq, idx) => (
                      <div key={faq.id} style={{ padding: '14px 24px', borderBottom: idx < Math.min(selected.faqs.length, 3) - 1 ? '1px solid #f8fafc' : 'none' }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', marginBottom: 3 }}>{faq.question}</p>
                        <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' as const }}>
                          {faq.answer}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ ...card(), padding: '64px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
              <BookOpen style={{ width: 40, height: 40, color: '#e2e8f0', marginBottom: 16 }} />
              <p style={{ fontSize: 15, fontWeight: 600, color: '#64748b' }}>Select a category</p>
              <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 6 }}>Choose a category from the list to view its details.</p>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          TAB: COURSES
      ══════════════════════════════════════════════════════ */}
      {activeTab === 'courses' && (
        <div style={card()}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>All Courses</p>
              <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{totalCourses} course{totalCourses !== 1 ? 's' : ''} across all categories</p>
            </div>
            <Link href="/admin/courses/new"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 18px', borderRadius: 10, background: 'linear-gradient(135deg,#3b82f6,#2563eb)', color: '#fff', fontSize: 13, fontWeight: 600, textDecoration: 'none', boxShadow: '0 4px 14px rgba(37,99,235,0.3)' }}>
              <Plus style={{ width: 13, height: 13 }} /> Add Course
            </Link>
          </div>

          {allCourses.length === 0 ? (
            <div style={{ padding: '72px 32px', textAlign: 'center' }}>
              <BookOpen style={{ width: 36, height: 36, color: '#e2e8f0', margin: '0 auto 12px' }} />
              <p style={{ fontSize: 14, fontWeight: 600, color: '#64748b' }}>No courses yet</p>
              <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>Add your first course to get started.</p>
            </div>
          ) : (
            <>
              {/* Table header */}
              <div style={{ padding: '10px 24px', background: '#f8fafc', borderBottom: '1px solid #f1f5f9', display: 'grid', gridTemplateColumns: '1fr 160px 80px 80px 120px' }}>
                {['Title', 'Category', 'Rating', 'Students', 'Actions'].map((col) => (
                  <span key={col} style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#94a3b8' }}>{col}</span>
                ))}
              </div>
              {allCourses.map((course, idx) => {
                const m = META[course.category.slug] ?? FALLBACK
                return (
                  <div key={course.id} style={{ display: 'grid', gridTemplateColumns: '1fr 160px 80px 80px 120px', alignItems: 'center', padding: '14px 24px', borderBottom: idx < allCourses.length - 1 ? '1px solid #f8fafc' : 'none' }}>
                    <div style={{ minWidth: 0, paddingRight: 16 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', lineHeight: 1.3 }}>{course.title}</p>
                      {course.courseBy && <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>by {course.courseBy}</p>}
                    </div>
                    <div>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: `${m.accent}11`, color: m.accent, border: `1px solid ${m.accent}33` }}>
                        {course.category.name}
                      </span>
                    </div>
                    <div style={{ fontSize: 13, color: '#475569' }}>{course.rating ? `⭐ ${course.rating}` : '—'}</div>
                    <div style={{ fontSize: 13, color: '#475569' }}>{course.totalStudents}</div>
                    <CourseActions id={course.id} />
                  </div>
                )
              })}
            </>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          TAB: FAQs
      ══════════════════════════════════════════════════════ */}
      {activeTab === 'faqs' && (
        <div style={card()}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>All FAQs</p>
              <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{totalFaqs} question{totalFaqs !== 1 ? 's' : ''} across all categories</p>
            </div>
            <Link href="/admin/faqs/new"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 18px', borderRadius: 10, background: 'linear-gradient(135deg,#3b82f6,#2563eb)', color: '#fff', fontSize: 13, fontWeight: 600, textDecoration: 'none', boxShadow: '0 4px 14px rgba(37,99,235,0.3)' }}>
              <Plus style={{ width: 13, height: 13 }} /> Add FAQ
            </Link>
          </div>

          {allFaqs.length === 0 ? (
            <div style={{ padding: '72px 32px', textAlign: 'center' }}>
              <HelpCircle style={{ width: 36, height: 36, color: '#e2e8f0', margin: '0 auto 12px' }} />
              <p style={{ fontSize: 14, fontWeight: 600, color: '#64748b' }}>No FAQs yet</p>
              <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>Add your first FAQ to get started.</p>
            </div>
          ) : (
            <>
              <div style={{ padding: '10px 24px', background: '#f8fafc', borderBottom: '1px solid #f1f5f9', display: 'grid', gridTemplateColumns: '1.6fr 160px 1fr 120px' }}>
                {['Question', 'Category', 'Answer', 'Actions'].map((col) => (
                  <span key={col} style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#94a3b8' }}>{col}</span>
                ))}
              </div>
              {allFaqs.map((faq, idx) => (
                <div key={faq.id} style={{ display: 'grid', gridTemplateColumns: '1.6fr 160px 1fr 120px', alignItems: 'center', padding: '14px 24px', borderBottom: idx < allFaqs.length - 1 ? '1px solid #f8fafc' : 'none' }}>
                  <div style={{ paddingRight: 24, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                      <HelpCircle style={{ width: 13, height: 13, color: '#2563eb', marginTop: 1, flexShrink: 0 }} />
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', lineHeight: 1.5 }}>{faq.question}</span>
                    </div>
                  </div>
                  <div style={{ paddingRight: 16 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 100, background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0' }}>
                      {faq.category?.name || 'General'}
                    </span>
                  </div>
                  <div style={{ paddingRight: 16 }}>
                    <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>
                      {faq.answer}
                    </p>
                  </div>
                  <FaqActions id={faq.id} />
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          TAB: SYLLABUS
      ══════════════════════════════════════════════════════ */}
      {activeTab === 'syllabus' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ ...card(), padding: '28px 32px', textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <ListChecks style={{ width: 24, height: 24, color: '#94a3b8' }} />
            </div>
            <p style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>Syllabus Content</p>
            <p style={{ fontSize: 13, color: '#94a3b8', maxWidth: 400, margin: '0 auto 24px' }}>
              Syllabus content is embedded within each course description. Edit a course to update its syllabus.
            </p>
            <Link href="/admin/courses/new"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 22px', borderRadius: 10, background: 'linear-gradient(135deg,#3b82f6,#2563eb)', color: '#fff', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
              <Plus style={{ width: 13, height: 13 }} /> Add New Course
            </Link>
          </div>

          {/* Per-category syllabus overview */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px,1fr))', gap: 14 }}>
            {categories.map((cat) => {
              const m = META[cat.slug] ?? FALLBACK
              return (
                <div key={cat.id} style={{ ...card(), overflow: 'hidden' }}>
                  <div style={{ padding: '14px 18px', background: `${m.accent}0d`, borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 10, background: m.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <m.icon style={{ width: 16, height: 16, color: '#fff' }} />
                    </div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{cat.name}</p>
                      <p style={{ fontSize: 11, color: '#94a3b8' }}>{cat.courses.length} course{cat.courses.length !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <div style={{ padding: '12px 18px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {cat.courses.length === 0 ? (
                      <p style={{ fontSize: 12, color: '#94a3b8', fontStyle: 'italic' }}>No courses in this category.</p>
                    ) : (
                      cat.courses.map((course) => (
                        <div key={course.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                          <p style={{ fontSize: 12, color: '#374151', fontWeight: 500, flex: 1, minWidth: 0, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                            {course.title}
                          </p>
                          <Link href={`/admin/courses/${course.id}/edit`}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11, color: '#2563eb', textDecoration: 'none', fontWeight: 600, flexShrink: 0 }}>
                            <Pencil style={{ width: 10, height: 10 }} /> Edit
                          </Link>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

    </AdminLayout>
  )
}

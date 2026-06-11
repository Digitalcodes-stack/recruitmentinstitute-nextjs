import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getAdminSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import AdminLayout from '@/components/admin/AdminLayout'
import { HelpCircle, MessageSquare, ListChecks, Layers3, Plus } from 'lucide-react'
import FaqActions from '@/components/admin/FaqActions'

export default async function AdminFaqsPage() {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin') redirect('/admin/login')

  const faqs = await prisma.faq.findMany({
    include: { category: true },
    orderBy: { createdAt: 'desc' },
  })

  const total        = faqs.length
  const courseLinked = faqs.filter((f) => !!f.categoryId).length
  const general      = faqs.filter((f) => !f.categoryId).length

  return (
    <AdminLayout title="FAQs">

      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 28 }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#ecfeff', border: '1px solid #a5f3fc', borderRadius: 100, padding: '5px 13px', marginBottom: 12, fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase' as const, color: '#0891b2' }}>
            <MessageSquare style={{ width: 11, height: 11 }} />
            FAQ Content Management
          </div>
          <h2 style={{ fontSize: 26, fontWeight: 900, color: '#0f172a', lineHeight: 1.2, letterSpacing: '-0.02em' }}>
            FAQs
          </h2>
          <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 5 }}>
            Review, search, and organize FAQ content.
          </p>
        </div>

        {/* Stat mini-cards + Add button */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          {[
            { label: 'Total FAQs',    value: total,        icon: HelpCircle, accent: '#2563eb', bg: '#eff6ff', bdr: '#bfdbfe' },
            { label: 'Course Linked', value: courseLinked, icon: Layers3,    accent: '#059669', bg: '#f0fdf4', bdr: '#bbf7d0' },
            { label: 'General',       value: general,      icon: ListChecks, accent: '#475569', bg: '#f8fafc', bdr: '#e2e8f0' },
          ].map(({ label, value, icon: Icon, accent, bg, bdr }) => (
            <div key={label} style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', padding: '14px 18px', minWidth: 110 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase' as const, color: '#94a3b8', marginBottom: 8 }}>
                <Icon style={{ width: 10, height: 10 }} />
                {label}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <span style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>{value}</span>
                <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 100, background: bg, color: accent, border: `1px solid ${bdr}` }}>Live</span>
              </div>
            </div>
          ))}

          <Link
            href="/admin/faqs/new"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 12, background: 'linear-gradient(135deg,#3b82f6,#2563eb)', color: '#fff', fontSize: 13, fontWeight: 600, textDecoration: 'none', boxShadow: '0 4px 14px rgba(37,99,235,0.3)' }}
          >
            <Plus style={{ width: 14, height: 14 }} />
            Add FAQ
          </Link>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', overflow: 'hidden' }}>

        {faqs.length === 0 ? (
          <div style={{ padding: '72px 32px', textAlign: 'center' as const }}>
            <div style={{ width: 52, height: 52, borderRadius: 16, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <HelpCircle style={{ width: 22, height: 22, color: '#cbd5e1' }} />
            </div>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#64748b' }}>No FAQs found.</p>
            <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>FAQ entries will appear here once added.</p>
          </div>
        ) : (
          <>
            {/* Column headers */}
            <div style={{ padding: '12px 24px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc', display: 'grid', gridTemplateColumns: '1.6fr 160px 1fr 120px' }}>
              {['Question', 'Category', 'Answer', 'Actions'].map((col) => (
                <span key={col} style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#94a3b8' }}>{col}</span>
              ))}
            </div>
            <div>
              {faqs.map((faq, idx) => (
                <div
                  key={faq.id}
                  style={{ display: 'grid', gridTemplateColumns: '1.6fr 160px 1fr 120px', alignItems: 'center', padding: '18px 24px', borderBottom: idx < faqs.length - 1 ? '1px solid #f8fafc' : 'none' }}
                >
                  {/* Question */}
                  <div style={{ paddingRight: 24, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                      <HelpCircle style={{ width: 14, height: 14, color: '#2563eb', marginTop: 1, flexShrink: 0 }} />
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', lineHeight: 1.5 }}>{faq.question}</span>
                    </div>
                  </div>

                  {/* Category */}
                  <div style={{ paddingRight: 16 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 100, background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0' }}>
                      {faq.category?.name || 'General'}
                    </span>
                  </div>

                  {/* Answer */}
                  <div style={{ paddingRight: 16 }}>
                    <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.6, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>
                      {faq.answer}
                    </p>
                  </div>

                  {/* Actions */}
                  <FaqActions id={faq.id} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  )
}

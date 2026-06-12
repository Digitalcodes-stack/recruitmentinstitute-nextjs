'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AdminLayout from './AdminLayout'
import { ArrowLeft, Save, Eye, EyeOff, ImageIcon, Search, FileText, Globe, Code2, Braces, HelpCircle, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import toast from 'react-hot-toast'
import type { BlogPost } from '@/types'

interface BlogFaqItem { id: number; question: string; answer: string; sortOrder: number }
const EMPTY_FAQ = { question: '', answer: '', sortOrder: 0 }

interface Props {
  blog?: BlogPost
}

export default function AdminBlogForm({ blog }: Props) {
  const isEdit = !!blog
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title:           blog?.title           || '',
    content:         blog?.content         || '',
    author:          blog?.author          || '',
    metaTitle:       blog?.metaTitle       || '',
    metaKeywords:    blog?.metaKeywords    || '',
    metaDescription: blog?.metaDescription || '',
    canonicalUrl:    blog?.canonicalUrl    || '',
    featuredImage:   blog?.featuredImage   || '',
    schemaScript:    blog?.schemaScript    || '',
    customScript:    blog?.customScript    || '',
    isPublished:     blog?.isPublished     ?? true,
  })

  const set = (key: string, value: string | boolean) =>
    setForm((f) => ({ ...f, [key]: value }))

  // ── Blog FAQs ────────────────────────────────────────────
  const [faqs, setFaqs]         = useState<BlogFaqItem[]>([])
  const [faqForm, setFaqForm]   = useState(EMPTY_FAQ)
  const [editingFaq, setEditingFaq] = useState<BlogFaqItem | null>(null)
  const [faqOpen, setFaqOpen]   = useState<number | null>(null)

  const loadFaqs = useCallback(async () => {
    if (!blog?.id) return
    const res = await fetch(`/api/admin/blog-faqs?blogId=${blog.id}`)
    const json = await res.json()
    setFaqs(json.data || [])
  }, [blog?.id])

  useEffect(() => { if (isEdit) loadFaqs() }, [isEdit, loadFaqs])

  const saveFaq = async () => {
    if (!faqForm.question.trim() || !faqForm.answer.trim()) { toast.error('Question and answer are required'); return }
    try {
      if (editingFaq) {
        await fetch(`/api/admin/blog-faqs/${editingFaq.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(faqForm) })
        toast.success('FAQ updated')
      } else {
        await fetch('/api/admin/blog-faqs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...faqForm, blogId: blog!.id }) })
        toast.success('FAQ added')
      }
      setFaqForm(EMPTY_FAQ); setEditingFaq(null); loadFaqs()
    } catch { toast.error('Failed to save FAQ') }
  }

  const deleteFaq = async (id: number) => {
    if (!confirm('Delete this FAQ?')) return
    await fetch(`/api/admin/blog-faqs/${id}`, { method: 'DELETE' })
    toast.success('FAQ deleted'); loadFaqs()
  }
  // ────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const url = isEdit ? `/api/admin/blog/${blog.id}` : '/api/admin/blog'
    try {
      const res  = await fetch(url, {
        method:  isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(isEdit ? 'Blog updated!' : 'Blog created! Add FAQs below.')
        if (isEdit) {
          router.push('/admin/blog')
        } else {
          // redirect to edit so FAQs can be added right away
          router.push(`/admin/blog/${data.data.id}/edit`)
        }
      } else {
        toast.error(data.message || 'Failed to save')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  /* shared style helpers */
  const card: React.CSSProperties = {
    background:   '#ffffff',
    border:       '1px solid #e8ecf0',
    borderRadius: 20,
    boxShadow:    '0 1px 4px rgba(0,0,0,0.04)',
  }

  const inputStyle: React.CSSProperties = {
    width:        '100%',
    borderRadius: 12,
    border:       '1px solid #e8ecf0',
    background:   '#ffffff',
    padding:      '10px 16px',
    fontSize:     13,
    color:        '#0f172a',
    outline:      'none',
    boxSizing:    'border-box' as const,
    transition:   'border-color 0.15s, box-shadow 0.15s',
  }

  const labelStyle: React.CSSProperties = {
    display:    'block',
    fontSize:   11,
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
    color:      '#64748b',
    marginBottom: 7,
  }

  const sectionHeader = (title: string, icon: React.ReactNode) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '18px 24px', borderBottom: '1px solid #f1f5f9' }}>
      <div style={{ width: 32, height: 32, borderRadius: 10, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {icon}
      </div>
      <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{title}</h3>
    </div>
  )

  const focusIn  = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = '#60a5fa'
    e.currentTarget.style.boxShadow   = '0 0 0 3px rgba(96,165,250,0.15)'
  }
  const focusOut = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = '#e8ecf0'
    e.currentTarget.style.boxShadow   = 'none'
  }

  return (
    <AdminLayout title={isEdit ? 'Edit Blog Post' : 'New Blog Post'}>

      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
        <Link
          href="/admin/blog"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, color: '#94a3b8', textDecoration: 'none', transition: 'color 0.15s' }}


        >
          <ArrowLeft style={{ width: 13, height: 13 }} />
          Blog Posts
        </Link>
        <span style={{ color: '#e2e8f0', fontSize: 14 }}>/</span>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#0f172a' }}>
          {isEdit ? 'Edit Post' : 'New Post'}
        </span>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, alignItems: 'start' }}>

          {/* ── Left column ─────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Content card */}
            <div style={card}>
              {sectionHeader('Content', <FileText style={{ width: 15, height: 15, color: '#475569' }} />)}
              <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>

                {/* Title */}
                <div>
                  <label style={labelStyle}>Title <span style={{ color: '#e11d48' }}>*</span></label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => set('title', e.target.value)}
                    placeholder="Blog post title"
                    style={{ ...inputStyle, fontSize: 15, fontWeight: 600, padding: '12px 16px' }}
                    onFocus={focusIn}
                    onBlur={focusOut}
                  />
                </div>

                {/* Content */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }}>
                    <label style={{ ...labelStyle, marginBottom: 0 }}>Content <span style={{ color: '#e11d48' }}>*</span></label>
                    <span style={{ fontSize: 11, color: '#94a3b8' }}>HTML supported</span>
                  </div>
                  <textarea
                    required
                    value={form.content}
                    onChange={(e) => set('content', e.target.value)}
                    rows={18}
                    placeholder="Write your blog content here... HTML tags are supported"
                    style={{
                      ...inputStyle,
                      resize:     'vertical',
                      fontFamily: '"SF Mono","Fira Code",monospace',
                      fontSize:   12,
                      lineHeight: 1.7,
                      background: '#fafbfc',
                    }}
                    onFocus={focusIn}
                    onBlur={focusOut}
                  />
                </div>

                {/* Author */}
                <div>
                  <label style={labelStyle}>Author</label>
                  <input
                    type="text"
                    value={form.author}
                    onChange={(e) => set('author', e.target.value)}
                    placeholder="Author name"
                    style={inputStyle}
                    onFocus={focusIn}
                    onBlur={focusOut}
                  />
                </div>
              </div>
            </div>

            {/* SEO card */}
            <div style={card}>
              {sectionHeader('SEO Settings', <Search style={{ width: 15, height: 15, color: '#475569' }} />)}
              <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  { key: 'metaTitle',    label: 'Meta Title',    placeholder: 'SEO title (60 chars)',        hint: '60 chars recommended' },
                  { key: 'metaKeywords', label: 'Meta Keywords', placeholder: 'keyword1, keyword2, ...',    hint: 'Comma separated' },
                  { key: 'canonicalUrl', label: 'Canonical URL', placeholder: 'https://yourdomain.com/...', hint: 'Optional' },
                ].map(({ key, label, placeholder, hint }) => (
                  <div key={key}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }}>
                      <label style={{ ...labelStyle, marginBottom: 0 }}>{label}</label>
                      <span style={{ fontSize: 10, color: '#94a3b8' }}>{hint}</span>
                    </div>
                    <input
                      type="text"
                      value={form[key as keyof typeof form] as string}
                      onChange={(e) => set(key, e.target.value)}
                      placeholder={placeholder}
                      style={inputStyle}
                      onFocus={focusIn}
                      onBlur={focusOut}
                    />
                  </div>
                ))}

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }}>
                    <label style={{ ...labelStyle, marginBottom: 0 }}>Meta Description</label>
                    <span style={{ fontSize: 10, color: '#94a3b8' }}>160 chars recommended</span>
                  </div>
                  <textarea
                    value={form.metaDescription}
                    onChange={(e) => set('metaDescription', e.target.value)}
                    rows={3}
                    placeholder="SEO description for search engines..."
                    style={{ ...inputStyle, resize: 'none' }}
                    onFocus={focusIn}
                    onBlur={focusOut}
                  />
                </div>
              </div>
            </div>

            {/* Scripts card */}
            <div style={card}>
              {sectionHeader('Scripts', <Code2 style={{ width: 15, height: 15, color: '#475569' }} />)}
              <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>

                {/* Schema Script */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                        <Braces style={{ width: 13, height: 13, color: '#7c3aed' }} />
                        <label style={{ ...labelStyle, marginBottom: 0 }}>Schema Script</label>
                      </div>
                      <p style={{ fontSize: 11, color: '#94a3b8' }}>JSON-LD structured data — injected in <code style={{ background: '#f1f5f9', padding: '1px 5px', borderRadius: 4, fontSize: 10 }}>&lt;head&gt;</code></p>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 100, background: '#f5f3ff', color: '#7c3aed', border: '1px solid #ddd6fe', flexShrink: 0 }}>
                      JSON-LD
                    </span>
                  </div>
                  <textarea
                    value={form.schemaScript}
                    onChange={(e) => set('schemaScript', e.target.value)}
                    rows={8}
                    placeholder={`{\n  "@context": "https://schema.org",\n  "@type": "Article",\n  "headline": "Your article title",\n  "author": {\n    "@type": "Person",\n    "name": "Author Name"\n  }\n}`}
                    style={{
                      ...inputStyle,
                      resize:      'vertical',
                      fontFamily:  '"SF Mono","Fira Code","Cascadia Code",monospace',
                      fontSize:    12,
                      lineHeight:  1.7,
                      background:  '#0f172a',
                      color:       '#e2e8f0',
                      border:      '1px solid #1e293b',
                      borderRadius: 12,
                      padding:     '14px 16px',
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = '#7c3aed'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.15)' }}
                    onBlur={(e)  => { e.currentTarget.style.borderColor = '#1e293b'; e.currentTarget.style.boxShadow = 'none' }}
                  />
                </div>

                {/* Divider */}
                <div style={{ borderTop: '1px solid #f1f5f9' }} />

                {/* Custom Script */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                        <Code2 style={{ width: 13, height: 13, color: '#0891b2' }} />
                        <label style={{ ...labelStyle, marginBottom: 0 }}>Custom JavaScript</label>
                      </div>
                      <p style={{ fontSize: 11, color: '#94a3b8' }}>Raw JS injected before <code style={{ background: '#f1f5f9', padding: '1px 5px', borderRadius: 4, fontSize: 10 }}>&lt;/body&gt;</code> — use <code style={{ background: '#f1f5f9', padding: '1px 5px', borderRadius: 4, fontSize: 10 }}>&lt;script&gt;</code> tags if needed</p>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 100, background: '#ecfeff', color: '#0891b2', border: '1px solid #a5f3fc', flexShrink: 0 }}>
                      JS
                    </span>
                  </div>
                  <textarea
                    value={form.customScript}
                    onChange={(e) => set('customScript', e.target.value)}
                    rows={7}
                    placeholder={`<script>\n  // Custom tracking, analytics, or page-specific JS\n  console.log('Page loaded');\n</script>`}
                    style={{
                      ...inputStyle,
                      resize:      'vertical',
                      fontFamily:  '"SF Mono","Fira Code","Cascadia Code",monospace',
                      fontSize:    12,
                      lineHeight:  1.7,
                      background:  '#0f172a',
                      color:       '#e2e8f0',
                      border:      '1px solid #1e293b',
                      borderRadius: 12,
                      padding:     '14px 16px',
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = '#0891b2'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(8,145,178,0.15)' }}
                    onBlur={(e)  => { e.currentTarget.style.borderColor = '#1e293b'; e.currentTarget.style.boxShadow = 'none' }}
                  />
                  <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 8, background: '#fffbeb', border: '1px solid #fde68a' }}>
                    <span style={{ fontSize: 11, color: '#92400e' }}>⚠</span>
                    <span style={{ fontSize: 11, color: '#92400e' }}>Only add trusted scripts. Malicious JS can compromise site security.</span>
                  </div>
                </div>

              </div>
            </div>
            {/* FAQ card — only shown when editing an existing post */}
            {isEdit && (
              <div style={card}>
                {sectionHeader('Blog FAQs', <HelpCircle style={{ width: 15, height: 15, color: '#475569' }} />)}
                <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>

                  {/* Existing FAQs accordion */}
                  {faqs.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {faqs.map((faq) => (
                        <div key={faq.id} style={{ border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
                          {/* div instead of button — avoids nested <button> hydration error */}
                          <div
                            role="button"
                            tabIndex={0}
                            onClick={() => setFaqOpen(faqOpen === faq.id ? null : faq.id)}
                            onKeyDown={(e) => e.key === 'Enter' && setFaqOpen(faqOpen === faq.id ? null : faq.id)}
                            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '12px 16px', background: faqOpen === faq.id ? '#f8fafc' : '#fff', cursor: 'pointer' }}>
                            <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', flex: 1 }}>{faq.question}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                              <button type="button" onClick={(e) => { e.stopPropagation(); setEditingFaq(faq); setFaqForm({ question: faq.question, answer: faq.answer, sortOrder: faq.sortOrder }) }}
                                style={{ padding: '3px 10px', borderRadius: 6, border: '1px solid #e2e8f0', background: '#fff', fontSize: 11, fontWeight: 600, color: '#374151', cursor: 'pointer' }}>Edit</button>
                              <button type="button" onClick={(e) => { e.stopPropagation(); deleteFaq(faq.id) }}
                                style={{ padding: '3px 10px', borderRadius: 6, border: '1px solid #fecaca', background: '#fff', fontSize: 11, fontWeight: 600, color: '#dc2626', cursor: 'pointer' }}>
                                <Trash2 style={{ width: 11, height: 11 }} />
                              </button>
                              {faqOpen === faq.id
                                ? <ChevronUp style={{ width: 14, height: 14, color: '#94a3b8' }} />
                                : <ChevronDown style={{ width: 14, height: 14, color: '#94a3b8' }} />}
                            </div>
                          </div>
                          {faqOpen === faq.id && (
                            <div style={{ padding: '12px 16px', borderTop: '1px solid #f1f5f9', fontSize: 13, color: '#374151', lineHeight: 1.7, background: '#fafbfc' }}>
                              {faq.answer}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add / Edit FAQ form */}
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '16px' }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 12 }}>
                      {editingFaq ? 'Edit FAQ' : 'Add New FAQ'}
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <input value={faqForm.question} onChange={(e) => setFaqForm((f) => ({ ...f, question: e.target.value }))}
                        placeholder="Question" style={{ ...inputStyle, fontSize: 13 }} onFocus={focusIn} onBlur={focusOut} />
                      <textarea value={faqForm.answer} onChange={(e) => setFaqForm((f) => ({ ...f, answer: e.target.value }))}
                        placeholder="Answer" rows={3} style={{ ...inputStyle, resize: 'vertical', fontSize: 13 }} onFocus={focusIn} onBlur={focusOut} />
                      <div style={{ display: 'flex', gap: 8 }}>
                        <input type="number" value={faqForm.sortOrder} onChange={(e) => setFaqForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))}
                          placeholder="Order" style={{ ...inputStyle, width: 80 }} onFocus={focusIn} onBlur={focusOut} />
                        <button type="button" onClick={saveFaq}
                          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px 16px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#3b82f6,#2563eb)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                          <Plus style={{ width: 13, height: 13 }} />
                          {editingFaq ? 'Update FAQ' : 'Add FAQ'}
                        </button>
                        {editingFaq && (
                          <button type="button" onClick={() => { setEditingFaq(null); setFaqForm(EMPTY_FAQ) }}
                            style={{ padding: '9px 14px', borderRadius: 10, border: '1.5px solid #e2e8f0', background: '#fff', fontSize: 13, fontWeight: 600, color: '#64748b', cursor: 'pointer' }}>
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}

          </div>

          {/* ── Right sidebar ────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Publish card */}
            <div style={card}>
              {sectionHeader('Publish', <Globe style={{ width: 15, height: 15, color: '#475569' }} />)}
              <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>

                {/* Toggle */}
                <label
                  style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', padding: '12px 14px', borderRadius: 12, background: form.isPublished ? '#eff6ff' : '#f8fafc', border: `1px solid ${form.isPublished ? '#bfdbfe' : '#e8ecf0'}`, transition: 'all 0.2s' }}
                >
                  {/* custom toggle track */}
                  <div
                    style={{ position: 'relative', width: 36, height: 20, borderRadius: 10, flexShrink: 0, transition: 'background 0.2s', background: form.isPublished ? '#2563eb' : '#cbd5e1' }}
                  >
                    <span style={{ position: 'absolute', top: 2, left: form.isPublished ? 18 : 2, width: 16, height: 16, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transition: 'left 0.2s' }} />
                  </div>
                  <input
                    type="checkbox"
                    checked={form.isPublished}
                    onChange={(e) => set('isPublished', e.target.checked)}
                    style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
                  />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: form.isPublished ? '#1d4ed8' : '#64748b' }}>
                      {form.isPublished ? 'Published' : 'Draft'}
                    </p>
                    <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>
                      {form.isPublished ? 'Visible to the public' : 'Hidden from public'}
                    </p>
                  </div>
                  {form.isPublished
                    ? <Eye     style={{ width: 14, height: 14, color: '#2563eb', flexShrink: 0 }} />
                    : <EyeOff  style={{ width: 14, height: 14, color: '#94a3b8', flexShrink: 0 }} />}
                </label>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    padding: '12px 20px', borderRadius: 12, border: 'none', cursor: loading ? 'default' : 'pointer',
                    background: loading ? '#93c5fd' : 'linear-gradient(135deg,#3b82f6,#2563eb)',
                    color: '#fff', fontSize: 13, fontWeight: 700,
                    boxShadow: loading ? 'none' : '0 4px 14px rgba(37,99,235,0.3)',
                    transition: 'all 0.2s',
                  }}


                >
                  <Save style={{ width: 14, height: 14 }} />
                  {loading ? 'Saving…' : isEdit ? 'Update Post' : 'Publish Post'}
                </button>

                {/* Cancel */}
                <Link
                  href="/admin/blog"
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px 20px', borderRadius: 12, border: '1px solid #e8ecf0', background: '#f8fafc', color: '#475569', fontSize: 13, fontWeight: 600, textDecoration: 'none', textAlign: 'center' as const, transition: 'background 0.15s' }}


                >
                  Cancel
                </Link>
              </div>
            </div>

            {/* Featured Image card */}
            <div style={card}>
              {sectionHeader('Featured Image', <ImageIcon style={{ width: 15, height: 15, color: '#475569' }} />)}
              <div style={{ padding: '16px 20px' }}>

                {/* Image preview */}
                {form.featuredImage ? (
                  <div style={{ marginBottom: 12, borderRadius: 12, overflow: 'hidden', border: '1px solid #e8ecf0', height: 140, background: '#f8fafc' }}>
                    <img
                      src={`/uploads/blog/${form.featuredImage}`}
                      alt="Featured"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                    />
                  </div>
                ) : (
                  <div style={{ marginBottom: 12, borderRadius: 12, border: '1px dashed #e2e8f0', height: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#fafbfc', gap: 6 }}>
                    <ImageIcon style={{ width: 24, height: 24, color: '#cbd5e1' }} />
                    <span style={{ fontSize: 11, color: '#94a3b8' }}>No image selected</span>
                  </div>
                )}

                <input
                  type="text"
                  value={form.featuredImage}
                  onChange={(e) => set('featuredImage', e.target.value)}
                  placeholder="e.g. my-blog-image.jpg"
                  style={inputStyle}
                  onFocus={focusIn}
                  onBlur={focusOut}
                />
                <p style={{ marginTop: 8, fontSize: 11, color: '#94a3b8', lineHeight: 1.5 }}>
                  Upload to <code style={{ background: '#f1f5f9', padding: '1px 5px', borderRadius: 4, fontSize: 10 }}>/public/uploads/blog/</code> then enter the filename here.
                </p>
              </div>
            </div>

            {/* Quick info card */}
            {isEdit && blog && (
              <div style={{ ...card, padding: '16px 20px' }}>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: '#94a3b8', marginBottom: 12 }}>Post Info</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { label: 'Post ID',  value: `#${blog.id}` },
                    { label: 'Slug',     value: blog.slug || '—' },
                    { label: 'Created',  value: new Date(blog.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', borderRadius: 8, background: '#f8fafc' }}>
                      <span style={{ fontSize: 11, color: '#94a3b8' }}>{label}</span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#374151', fontFamily: label === 'Slug' ? 'monospace' : 'inherit', maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </form>

    </AdminLayout>
  )
}

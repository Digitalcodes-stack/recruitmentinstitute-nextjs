'use client'

import { useState } from 'react'
import Link from 'next/link'
import AdminLayout from './AdminLayout'
import { Plus, Edit2, Trash2, Eye, EyeOff, ArrowUpRight, FileText, Search, HelpCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import type { BlogPost } from '@/types'

type BlogWithFaqCount = BlogPost & { _count?: { blogFaqs: number } }

interface Props {
  blogs: BlogWithFaqCount[]
}

/* ── tiny helpers ───────────────────────────────────────── */
const fmtDate = (d: Date | string) =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

/* Action icon button */
function ActionBtn({
  onClick, href, title, danger, newTab, children,
}: {
  onClick?: () => void
  href?: string
  title: string
  danger?: boolean
  newTab?: boolean
  children: React.ReactNode
}) {
  const base: React.CSSProperties = {
    display:        'inline-flex',
    alignItems:     'center',
    justifyContent: 'center',
    width:  32,
    height: 32,
    borderRadius: 8,
    border: '1px solid #e8ecf0',
    background: '#ffffff',
    color: '#94a3b8',
    cursor: 'pointer',
    transition: 'all 0.15s',
    flexShrink: 0,
  }

  const handleEnter = (e: React.MouseEvent<HTMLElement>) => {
    const el = e.currentTarget as HTMLElement
    el.style.color      = danger ? '#e11d48' : '#2563eb'
    el.style.background = danger ? '#fff1f2' : '#eff6ff'
    el.style.borderColor = danger ? '#fecdd3' : '#bfdbfe'
  }
  const handleLeave = (e: React.MouseEvent<HTMLElement>) => {
    const el = e.currentTarget as HTMLElement
    el.style.color       = '#94a3b8'
    el.style.background  = '#ffffff'
    el.style.borderColor = '#e8ecf0'
  }

  if (href) {
    return (
      <Link
        href={href}
        title={title}
        target={newTab ? '_blank' : undefined}
        rel={newTab ? 'noopener noreferrer' : undefined}
        style={base}


      >
        {children}
      </Link>
    )
  }
  return (
    <button
      onClick={onClick}
      title={title}
      style={base}


    >
      {children}
    </button>
  )
}

/* ── main component ─────────────────────────────────────── */
export default function AdminBlogList({ blogs: initialBlogs }: Props) {
  const [blogs,  setBlogs]  = useState<BlogWithFaqCount[]>(initialBlogs)
  const [search, setSearch] = useState('')

  const published = blogs.filter((b) => b.isPublished).length
  const drafts    = blogs.length - published

  const visible = search.trim()
    ? blogs.filter(
        (b) =>
          b.title.toLowerCase().includes(search.toLowerCase()) ||
          (b.author || '').toLowerCase().includes(search.toLowerCase()),
      )
    : blogs

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this blog post?')) return
    const res  = await fetch(`/api/admin/blog/${id}`, { method: 'DELETE' })
    const data = await res.json()
    if (data.success) {
      setBlogs((b) => b.filter((blog) => blog.id !== id))
      toast.success('Blog deleted')
    } else {
      toast.error('Failed to delete')
    }
  }

  const handleToggle = async (id: number, current: boolean) => {
    const res  = await fetch(`/api/admin/blog/${id}`, {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ isPublished: !current }),
    })
    const data = await res.json()
    if (data.success) {
      setBlogs((b) =>
        b.map((blog) => (blog.id === id ? { ...blog, isPublished: !current } : blog)),
      )
      toast.success(`Blog ${!current ? 'published' : 'unpublished'}`)
    }
  }

  /* card wrapper style */
  const card: React.CSSProperties = {
    background:   '#ffffff',
    border:       '1px solid #e8ecf0',
    borderRadius: 20,
    boxShadow:    '0 1px 4px rgba(0,0,0,0.04)',
  }

  return (
    <AdminLayout title="Blog Posts">

      {/* ── Page header ─────────────────────────── */}
      <div
        className="flex items-start justify-between gap-6 mb-7"
        style={{ flexWrap: 'wrap' }}
      >
        <div>
          <h2
            className="font-black tracking-tight"
            style={{ fontSize: 26, color: '#0f172a', lineHeight: 1.2 }}
          >
            Blog Posts
          </h2>
          <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 5 }}>
            {blogs.length} total posts in the editorial pipeline
          </p>
        </div>

        <Link
          href="/admin/blog/new"
          className="inline-flex items-center gap-2 font-semibold text-white rounded-xl transition-all"
          style={{
            fontSize:   13,
            background: '#2563eb',
            padding:    '11px 20px',
            boxShadow:  '0 4px 14px rgba(37,99,235,0.32)',
            textDecoration: 'none',
          }}


        >
          <Plus style={{ width: 15, height: 15 }} />
          New Post
        </Link>
      </div>

      {/* ── Stat chips + Search bar ──────────────── */}
      <div className="flex items-center justify-between gap-4 mb-6" style={{ flexWrap: 'wrap' }}>
        {/* chips */}
        <div className="flex items-center gap-3" style={{ flexWrap: 'wrap' }}>
          {/* Total */}
          <div
            className="flex items-center gap-2 rounded-xl"
            style={{
              background: '#f8fafc',
              border:     '1px solid #e8ecf0',
              padding:    '8px 16px',
            }}
          >
            <FileText style={{ width: 14, height: 14, color: '#94a3b8' }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>
              {blogs.length} Total
            </span>
          </div>

          {/* Published */}
          <div
            className="flex items-center gap-2 rounded-xl"
            style={{
              background: '#f0fdf4',
              border:     '1px solid #bbf7d0',
              padding:    '8px 16px',
            }}
          >
            <span
              className="rounded-full"
              style={{ width: 7, height: 7, background: '#22c55e', flexShrink: 0 }}
            />
            <span style={{ fontSize: 12, fontWeight: 600, color: '#15803d' }}>
              {published} Published
            </span>
          </div>

          {/* Drafts */}
          <div
            className="flex items-center gap-2 rounded-xl"
            style={{
              background: '#f8fafc',
              border:     '1px solid #e8ecf0',
              padding:    '8px 16px',
            }}
          >
            <span
              className="rounded-full"
              style={{ width: 7, height: 7, background: '#94a3b8', flexShrink: 0 }}
            />
            <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>
              {drafts} Drafts
            </span>
          </div>
        </div>

        {/* Search */}
        <div
          className="flex items-center gap-2 rounded-xl"
          style={{
            background: '#ffffff',
            border:     '1px solid #e8ecf0',
            padding:    '9px 16px',
            boxShadow:  '0 1px 3px rgba(0,0,0,0.04)',
            minWidth:   220,
          }}
        >
          <Search style={{ width: 14, height: 14, color: '#94a3b8', flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search posts…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              border:     'none',
              outline:    'none',
              background: 'transparent',
              fontSize:   13,
              color:      '#0f172a',
              width:      '100%',
            }}
          />
        </div>
      </div>

      {/* ── Table ───────────────────────────────── */}
      <div style={{ ...card, overflow: 'hidden' }}>

        {/* Table header */}
        <div
          style={{
            display:         'grid',
            gridTemplateColumns: '1fr 130px 120px 110px 100px 130px',
            padding:         '12px 24px',
            background:      '#f8fafc',
            borderBottom:    '1px solid #e8ecf0',
          }}
        >
          {['Title', 'Author', 'Status', 'Date', 'FAQs', 'Actions'].map((col) => (
            <span
              key={col}
              style={{
                fontSize:      10,
                fontWeight:    700,
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                color:         '#94a3b8',
              }}
            >
              {col}
            </span>
          ))}
        </div>

        {/* Rows */}
        {visible.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center"
            style={{ padding: '72px 24px' }}
          >
            <div
              className="flex items-center justify-center rounded-2xl mb-5"
              style={{ width: 56, height: 56, background: '#f1f5f9' }}
            >
              <FileText style={{ width: 24, height: 24, color: '#cbd5e1' }} />
            </div>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#64748b' }}>
              {search ? 'No posts match your search.' : 'No blog posts yet.'}
            </p>
            {!search && (
              <Link
                href="/admin/blog/new"
                style={{
                  marginTop:  12,
                  fontSize:   13,
                  fontWeight: 600,
                  color:      '#2563eb',
                  textDecoration: 'none',
                }}
              >
                Create your first post →
              </Link>
            )}
          </div>
        ) : (
          <div>
            {visible.map((blog, idx) => (
              <div
                key={blog.id}
                style={{
                  display:         'grid',
                  gridTemplateColumns: '1fr 130px 120px 110px 100px 130px',
                  alignItems:      'center',
                  padding:         '16px 24px',
                  borderBottom:    idx < visible.length - 1 ? '1px solid #f1f5f9' : 'none',
                  transition:      'background 0.12s',
                  cursor:          'default',
                }}


              >
                {/* Title */}
                <div style={{ paddingRight: 24, minWidth: 0 }}>
                  <p
                    style={{
                      fontSize:     13,
                      fontWeight:   600,
                      color:        '#0f172a',
                      whiteSpace:   'nowrap',
                      overflow:     'hidden',
                      textOverflow: 'ellipsis',
                      lineHeight:   1.4,
                    }}
                  >
                    {blog.title}
                  </p>
                  <p
                    style={{
                      fontSize:     11,
                      color:        '#94a3b8',
                      marginTop:    3,
                      whiteSpace:   'nowrap',
                      overflow:     'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    /{blog.slug}
                  </p>
                </div>

                {/* Author */}
                <div style={{ paddingRight: 16 }}>
                  {blog.author ? (
                    <div className="flex items-center gap-2">
                      <div
                        className="flex items-center justify-center rounded-full text-white font-bold flex-shrink-0"
                        style={{
                          width:      26,
                          height:     26,
                          fontSize:   10,
                          background: authorColor(blog.author),
                        }}
                      >
                        {blog.author.charAt(0).toUpperCase()}
                      </div>
                      <span
                        style={{
                          fontSize:     12,
                          color:        '#475569',
                          fontWeight:   500,
                          whiteSpace:   'nowrap',
                          overflow:     'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {blog.author}
                      </span>
                    </div>
                  ) : (
                    <span style={{ fontSize: 12, color: '#cbd5e1' }}>—</span>
                  )}
                </div>

                {/* Status */}
                <div>
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full font-semibold"
                    style={{
                      fontSize:   11,
                      padding:    '4px 10px',
                      ...(blog.isPublished
                        ? { background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d' }
                        : { background: '#f8fafc', border: '1px solid #e2e8f0', color: '#64748b' }),
                    }}
                  >
                    <span
                      className="rounded-full"
                      style={{
                        width:      6,
                        height:     6,
                        flexShrink: 0,
                        background: blog.isPublished ? '#22c55e' : '#94a3b8',
                      }}
                    />
                    {blog.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>

                {/* Date */}
                <div>
                  <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>
                    {fmtDate(blog.createdAt)}
                  </span>
                </div>

                {/* FAQ count */}
                <div>
                  {(blog._count?.blogFaqs ?? 0) > 0 ? (
                    <Link
                      href={`/admin/blog/${blog.id}/edit`}
                      title="Edit FAQs"
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        padding: '3px 10px', borderRadius: 20,
                        background: '#eff6ff', border: '1px solid #bfdbfe',
                        color: '#1d4ed8', fontSize: 11, fontWeight: 700,
                        textDecoration: 'none',
                      }}
                    >
                      <HelpCircle style={{ width: 11, height: 11 }} />
                      {blog._count!.blogFaqs}
                    </Link>
                  ) : (
                    <Link
                      href={`/admin/blog/${blog.id}/edit`}
                      title="Add FAQs"
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        padding: '3px 10px', borderRadius: 20,
                        background: '#fff7ed', border: '1px solid #fed7aa',
                        color: '#c2410c', fontSize: 11, fontWeight: 700,
                        textDecoration: 'none',
                      }}
                    >
                      <HelpCircle style={{ width: 11, height: 11 }} />
                      0
                    </Link>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5">
                  <ActionBtn href={`/admin/blog/${blog.id}/edit`} title="Edit post">
                    <Edit2 style={{ width: 13, height: 13 }} />
                  </ActionBtn>

                  <ActionBtn
                    onClick={() => handleToggle(blog.id, blog.isPublished)}
                    title={blog.isPublished ? 'Unpublish' : 'Publish'}
                  >
                    {blog.isPublished
                      ? <EyeOff style={{ width: 13, height: 13 }} />
                      : <Eye    style={{ width: 13, height: 13 }} />}
                  </ActionBtn>

                  <ActionBtn
                    onClick={() => handleDelete(blog.id)}
                    title="Delete post"
                    danger
                  >
                    <Trash2 style={{ width: 13, height: 13 }} />
                  </ActionBtn>

                  <ActionBtn
                    href={`/blogs/${blog.slug}`}
                    title="View live"
                    newTab
                  >
                    <ArrowUpRight style={{ width: 13, height: 13 }} />
                  </ActionBtn>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        {visible.length > 0 && (
          <div
            className="flex items-center justify-between"
            style={{
              padding:      '14px 24px',
              borderTop:    '1px solid #f1f5f9',
              background:   '#fafbfc',
            }}
          >
            <span style={{ fontSize: 12, color: '#94a3b8' }}>
              Showing {visible.length} of {blogs.length} posts
            </span>
            <div className="flex items-center gap-1">
              {[1].map((p) => (
                <span
                  key={p}
                  className="flex items-center justify-center rounded-lg font-semibold"
                  style={{
                    width:      32,
                    height:     32,
                    fontSize:   12,
                    background: '#2563eb',
                    color:      '#ffffff',
                  }}
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

    </AdminLayout>
  )
}

/* deterministic author avatar color */
const AVATAR_COLORS = [
  '#2563eb', '#0891b2', '#7c3aed', '#d97706',
  '#059669', '#e11d48', '#0284c7', '#9333ea',
]
function authorColor(name: string) {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffffffff
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length]
}

'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  ArrowRight, BookOpen, Calendar, ChevronLeft, ChevronRight,
  GraduationCap, Search, Sparkles, User, Clock, Tag,
} from 'lucide-react'
import { buildPaginationPages } from '@/utils/pagination'
import { getBlogTopicImage, getRecentPostImage } from '@/lib/blog-images'
import type { BlogPost, PaginationMeta } from '@/types'

interface Props {
  blogs: BlogPost[]
  recentBlogs: Array<{ id: number; title: string; slug: string; publishedAt: string | null; createdAt: Date }>
  pagination: PaginationMeta & { hasNext: boolean; hasPrev: boolean; offset: number }
  search: string
}

const readTimes = ['5 min read', '7 min read', '4 min read', '6 min read', '8 min read', '5 min read', '9 min read']
const categories = ['Recruitment', 'HR Strategy', 'Talent Acquisition', 'Career Advice', 'Hiring Tips', 'HR Ops', 'Leadership']
const accentColors = [
  { color: '#1D4ED8', bg: '#EFF6FF', border: '#BFDBFE' },
  { color: '#0D9488', bg: '#F0FDFA', border: '#99F6E4' },
  { color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
  { color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE' },
  { color: '#DC2626', bg: '#FEF2F2', border: '#FECACA' },
  { color: '#059669', bg: '#F0FDF4', border: '#BBF7D0' },
  { color: '#0891B2', bg: '#ECFEFF', border: '#A5F3FC' },
]

function stripHtml(content: string) {
  return content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

function formatDate(date: string | Date | null) {
  if (!date) return 'Editorial'
  const value = new Date(date)
  if (Number.isNaN(value.getTime())) {
    return String(date).replace(/00:00:00 GMT\+0530 \(India Standard Time\)/, '').trim()
  }
  return value.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function getAccent(index: number) {
  return accentColors[index % accentColors.length]
}

export default function BlogListClient({ blogs, recentBlogs, pagination, search }: Props) {
  const [searchQuery, setSearchQuery] = useState(search)
  const router = useRouter()

  const handleSearch = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    router.push(`/blogs?s=${encodeURIComponent(searchQuery.trim())}`)
  }

  const pages = buildPaginationPages(pagination.page, pagination.totalPages)

  return (
    <>
      <style>{`
        /* Hero */
        .bl-hero-crumb { color: #94A3B8; text-decoration: none; font-size: 12px; font-weight: 600; transition: color .18s; }
        .bl-hero-crumb:hover { color: #fff; }

        /* Article card */
        .bl-card {
          background: #fff; border-radius: 20px; border: 1.5px solid #E2E8F0;
          box-shadow: 0 6px 28px rgba(15,23,42,.07); overflow: hidden;
          display: grid; transition: transform .3s ease, box-shadow .3s ease, border-color .3s ease;
        }
        .bl-card:hover { transform: translateY(-6px); box-shadow: 0 26px 64px rgba(15,23,42,.13); }
        .bl-card:hover .bl-card-img { transform: scale(1.06); }
        .bl-card-img { transition: transform .6s ease; width: 100%; height: 100%; object-fit: cover; }

        /* CTA read button */
        .bl-read-btn {
          display: inline-flex; align-items: center; gap: 8px;
          background: #0F172A; color: #fff; font-weight: 700; font-size: 13px;
          padding: 12px 22px; border-radius: 10px; text-decoration: none;
          transition: background .2s, transform .2s;
        }
        .bl-read-btn:hover { background: #1D4ED8; transform: translateX(2px); }

        /* Search */
        .bl-search-input {
          width: 100%; border: 1.5px solid #E2E8F0; border-radius: 11px;
          padding: 13px 50px 13px 16px; font-size: 14px; color: #0F172A;
          background: #F8FAFC; outline: none; transition: border-color .2s, box-shadow .2s;
          font-family: inherit;
        }
        .bl-search-input::placeholder { color: #CBD5E1; }
        .bl-search-input:focus { border-color: #2563EB; background: #fff; box-shadow: 0 0 0 4px rgba(37,99,235,.1); }

        .bl-search-btn {
          position: absolute; right: 6px; top: 6px; bottom: 6px;
          width: 40px; border: none; border-radius: 8px;
          background: linear-gradient(135deg,#1D4ED8,#2563EB);
          color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center;
          transition: background .2s;
        }
        .bl-search-btn:hover { background: #0F172A; }

        /* Recent post link */
        .bl-recent-link { font-size: 13px; font-weight: 700; color: #0F172A; text-decoration: none; line-height: 1.45; display: block; transition: color .18s; }
        .bl-recent-link:hover { color: #1D4ED8; }

        /* Sidebar card */
        .bl-sidebar-card { background: #fff; border-radius: 18px; border: 1.5px solid #E2E8F0; box-shadow: 0 4px 20px rgba(15,23,42,.06); overflow: hidden; }

        /* Pagination */
        .bl-page-btn {
          display: flex; align-items: center; justify-content: center;
          width: 42px; height: 42px; border-radius: 10px; border: 1.5px solid #E2E8F0;
          background: #fff; font-size: 13px; font-weight: 700; color: #475569;
          text-decoration: none; transition: border-color .2s, color .2s, background .2s;
        }
        .bl-page-btn:hover { border-color: #1D4ED8; color: #1D4ED8; }
        .bl-page-btn.active { border-color: #1D4ED8; background: #1D4ED8; color: #fff; box-shadow: 0 6px 18px rgba(29,78,216,.28); }

        @media (max-width: 900px) {
          .bl-card { grid-template-columns: 1fr !important; }
          .bl-card-img-wrap { height: 240px !important; }
        }
        @media (max-width: 1100px) {
          .bl-outer-grid { grid-template-columns: 1fr !important; }
          .bl-sidebar { display: none; }
        }
      `}</style>

      {/* ══════════════════════════════════════════
          HERO BANNER
      ══════════════════════════════════════════ */}
      <section style={{ background: 'linear-gradient(130deg,#060D1C 0%,#0B1629 40%,#0E1F3A 72%,#071120 100%)', position: 'relative', overflow: 'hidden', minHeight: 320, display: 'flex', alignItems: 'center' }}>
        {/* Background image */}
        <div className="absolute inset-0" style={{ zIndex: 0 }}>
          <Image src="/assets/images/blog/inner/8.jpg" alt="" fill priority sizes="100vw"
            style={{ objectFit: 'cover', opacity: .18 }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg,rgba(6,13,28,.97) 0%,rgba(11,22,41,.9) 55%,rgba(14,31,58,.8) 100%)' }} />
        </div>
        {/* Dot grid */}
        <div aria-hidden className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,.025) 1px,transparent 1px)', backgroundSize: '28px 28px', zIndex: 1 }} />
        {/* Glows */}
        <div aria-hidden className="absolute" style={{ top: -100, left: -80, width: 500, height: 500, background: 'radial-gradient(circle,rgba(29,78,216,.18) 0%,transparent 65%)', zIndex: 1 }} />
        <div aria-hidden className="absolute" style={{ bottom: -40, right: '20%', width: 340, height: 340, background: 'radial-gradient(circle,rgba(13,148,136,.1) 0%,transparent 65%)', zIndex: 1 }} />
        {/* Gold accent top */}
        <div aria-hidden className="absolute top-0 left-0 right-0" style={{ height: 2, background: 'linear-gradient(90deg,transparent,#D97706 28%,#14B8A6 72%,transparent)', zIndex: 3 }} />

        <div className="container" style={{ position: 'relative', zIndex: 10, padding: '64px 0 80px' }}>
          {/* Breadcrumb */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, fontSize: 12, fontWeight: 600 }}>
            <Link href="/" className="bl-hero-crumb">Home</Link>
            <span style={{ color: '#F59E0B', fontSize: 5 }}>●</span>
            <span style={{ color: '#F59E0B' }}>Blog</span>
          </nav>

          {/* Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 50, background: 'rgba(245,158,11,.12)', border: '1px solid rgba(245,158,11,.28)', marginBottom: 22 }}>
            <Sparkles style={{ width: 12, height: 12, color: '#F59E0B' }} />
            <span style={{ fontSize: 10, fontWeight: 800, color: '#FCD34D', letterSpacing: '.2em', textTransform: 'uppercase' }}>Recruitment Institute Insights</span>
          </div>

          <h1 style={{ fontSize: 'clamp(30px,4vw,56px)', fontWeight: 900, color: '#fff', lineHeight: 1.1, letterSpacing: '-.035em', marginBottom: 18, maxWidth: 780 }}>
            HR &amp; Recruitment{' '}
            <span style={{ background: 'linear-gradient(120deg,#60A5FA 0%,#5EEAD4 55%,#FCD34D 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Blog
            </span>
          </h1>
          <p style={{ fontSize: 16, color: '#94A3B8', lineHeight: 1.85, maxWidth: 580 }}>
            Practical hiring strategy, retention ideas, sourcing guidance, and HR operations thinking for modern teams.
          </p>
        </div>

        {/* Wave */}
        <div aria-hidden className="absolute bottom-0 left-0 right-0" style={{ height: 48, background: '#F1F5F9', clipPath: 'ellipse(55% 100% at 50% 100%)', zIndex: 10 }} />
      </section>

      {/* ══════════════════════════════════════════
          CONTENT
      ══════════════════════════════════════════ */}
      <section style={{ background: '#F1F5F9', padding: '64px 0 88px' }}>
        <div className="container">
          <div className="bl-outer-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 360px', gap: 28, alignItems: 'start' }}>

            {/* ── ARTICLE LIST ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {blogs.length === 0 ? (
                <div style={{ background: '#fff', borderRadius: 18, border: '1.5px solid #E2E8F0', padding: '52px 32px', textAlign: 'center', boxShadow: '0 4px 20px rgba(15,23,42,.06)' }}>
                  <p style={{ fontSize: 15, fontWeight: 600, color: '#64748B' }}>
                    {search ? `No articles found matching "${search}".` : 'No blog posts published yet. Check back soon.'}
                  </p>
                </div>
              ) : (
                blogs.map((blog, index) => {
                  const accent = getAccent(index)
                  const isFeatured = index === 0

                  return (
                    <article key={blog.id} className="bl-card"
                      style={{ gridTemplateColumns: isFeatured ? '380px 1fr' : '300px 1fr' }}>

                      {/* Image */}
                      <Link href={`/blogs/${blog.slug}`} className="bl-card-img-wrap"
                        style={{ position: 'relative', height: isFeatured ? 340 : 280, background: '#0F172A', overflow: 'hidden', display: 'block' }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={getBlogTopicImage(blog.title, blog.slug, blog.id)}
                          alt={blog.title}
                          className="bl-card-img"
                          style={{ position: 'absolute', inset: 0 }}
                        />
                        <div className="absolute inset-0" style={{ background: 'linear-gradient(to right,transparent 55%,rgba(0,0,0,.2) 100%)' }} />
                        {/* Category pill */}
                        <div style={{ position: 'absolute', top: 16, left: 16, padding: '4px 12px', borderRadius: 50, background: `${accent.color}20`, border: `1px solid ${accent.border}`, backdropFilter: 'blur(10px)' }}>
                          <span style={{ fontSize: 9, fontWeight: 800, color: accent.color, textTransform: 'uppercase', letterSpacing: '.14em' }}>
                            {categories[index % categories.length]}
                          </span>
                        </div>
                        {/* Read time */}
                        <div style={{ position: 'absolute', bottom: 16, left: 16, display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 50, background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,.15)' }}>
                          <Clock style={{ width: 10, height: 10, color: '#94A3B8' }} />
                          <span style={{ fontSize: 10, fontWeight: 700, color: '#CBD5E1' }}>{readTimes[index % readTimes.length]}</span>
                        </div>
                      </Link>

                      {/* Content */}
                      <div style={{ padding: isFeatured ? '32px 32px 28px' : '26px 28px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: isFeatured ? 340 : 280 }}>
                        <div>
                          {/* Meta */}
                          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 10, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '.1em' }}>
                              <Calendar style={{ width: 11, height: 11, color: '#1D4ED8' }} />
                              {formatDate(blog.publishedAt || blog.createdAt)}
                            </span>
                            {blog.author && (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 10, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '.1em', borderLeft: '1px solid #E2E8F0', paddingLeft: 12 }}>
                                <User style={{ width: 11, height: 11, color: '#059669' }} />
                                {blog.author}
                              </span>
                            )}
                          </div>

                          {/* Accent bar + Title */}
                          <div style={{ display: 'flex', gap: 10, marginBottom: 14, alignItems: 'flex-start' }}>
                            <div style={{ width: 3, height: 'auto', minHeight: 36, borderRadius: 2, background: accent.color, flexShrink: 0, marginTop: 3 }} />
                            <h2 style={{ fontSize: isFeatured ? 'clamp(19px,1.9vw,24px)' : 'clamp(16px,1.6vw,20px)', fontWeight: 900, color: '#0F172A', lineHeight: 1.25, letterSpacing: '-.022em', margin: 0 }}>
                              <Link href={`/blogs/${blog.slug}`} style={{ color: 'inherit', textDecoration: 'none', transition: 'color .18s' }}

>
                                {blog.title}
                              </Link>
                            </h2>
                          </div>

                          <p style={{ fontSize: 14, color: '#64748B', lineHeight: 1.8, marginBottom: 0, display: '-webkit-box', WebkitLineClamp: isFeatured ? 3 : 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {stripHtml(blog.content).substring(0, 260)}…
                          </p>
                        </div>

                        {/* CTA row */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 20, marginTop: 20, borderTop: '1px solid #F1F5F9' }}>
                          <Link href={`/blogs/${blog.slug}`} className="bl-read-btn">
                            Continue Reading <ArrowRight style={{ width: 14, height: 14 }} />
                          </Link>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 50, background: accent.bg, border: `1px solid ${accent.border}` }}>
                            <Tag style={{ width: 10, height: 10, color: accent.color }} />
                            <span style={{ fontSize: 9, fontWeight: 800, color: accent.color, textTransform: 'uppercase', letterSpacing: '.12em' }}>{categories[index % categories.length]}</span>
                          </div>
                        </div>
                      </div>
                    </article>
                  )
                })
              )}

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, paddingTop: 16 }}>
                  {pagination.hasPrev && (
                    <Link href={`/blogs?page=${pagination.page - 1}${search ? `&s=${search}` : ''}`}
                      className="bl-page-btn" aria-label="Previous page">
                      <ChevronLeft style={{ width: 16, height: 16 }} />
                    </Link>
                  )}
                  {pages.map((p, i) =>
                    p === '...' ? (
                      <span key={`dots-${i}`} style={{ padding: '0 4px', color: '#94A3B8', fontSize: 13, fontWeight: 600 }}>…</span>
                    ) : (
                      <Link key={p} href={`/blogs?page=${p}${search ? `&s=${search}` : ''}`}
                        className={`bl-page-btn${p === pagination.page ? ' active' : ''}`}>
                        {p}
                      </Link>
                    )
                  )}
                  {pagination.hasNext && (
                    <Link href={`/blogs?page=${pagination.page + 1}${search ? `&s=${search}` : ''}`}
                      className="bl-page-btn" aria-label="Next page">
                      <ChevronRight style={{ width: 16, height: 16 }} />
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* ── SIDEBAR ── */}
            <aside className="bl-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: 20, position: 'sticky', top: 112 }}>

              {/* Search */}
              <div className="bl-sidebar-card" style={{ padding: '22px 22px' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 800, color: '#0F172A', margin: '0 0 16px' }}>
                  <span style={{ width: 32, height: 32, borderRadius: 8, background: '#EFF6FF', border: '1px solid #BFDBFE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Search style={{ width: 15, height: 15, color: '#1D4ED8' }} />
                  </span>
                  Search Articles
                </h3>
                <form onSubmit={handleSearch} style={{ position: 'relative' }}>
                  <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search keywords…" className="bl-search-input" />
                  <button type="submit" className="bl-search-btn" aria-label="Search">
                    <Search style={{ width: 14, height: 14 }} />
                  </button>
                </form>
              </div>

              {/* Recent Posts */}
              <div className="bl-sidebar-card">
                <div style={{ padding: '20px 22px 16px', borderBottom: '1px solid #F1F5F9' }}>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                    <span style={{ width: 32, height: 32, borderRadius: 8, background: '#EFF6FF', border: '1px solid #BFDBFE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <BookOpen style={{ width: 15, height: 15, color: '#1D4ED8' }} />
                    </span>
                    Recent Posts
                  </h3>
                </div>
                <ul style={{ listStyle: 'none', margin: 0, padding: '14px 22px 18px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {recentBlogs.map((blog, index) => (
                    <li key={blog.id} style={{ display: 'grid', gridTemplateColumns: '76px 1fr', gap: 12, paddingBottom: 16, borderBottom: index < recentBlogs.length - 1 ? '1px solid #F1F5F9' : 'none' }}>
                      <Link href={`/blogs/${blog.slug}`} style={{ position: 'relative', display: 'block', borderRadius: 10, overflow: 'hidden', background: '#E2E8F0', aspectRatio: '4/3', flexShrink: 0 }}>
                        <Image
                          src={getRecentPostImage(index, blog.slug)}
                          alt={blog.title}
                          fill
                          sizes="76px"
                          style={{ objectFit: 'cover' }}
                        />
                      </Link>
                      <div>
                        <Link href={`/blogs/${blog.slug}`} className="bl-recent-link">
                          {blog.title}
                        </Link>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 6 }}>
                          <Calendar style={{ width: 10, height: 10, color: '#94A3B8' }} />
                          <span style={{ fontSize: 10, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '.08em' }}>
                            {formatDate(blog.publishedAt || blog.createdAt)}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Promo CTA */}
              <div style={{ borderRadius: 18, background: 'linear-gradient(130deg,#0B1629,#0F172A)', border: '1px solid rgba(255,255,255,.07)', overflow: 'hidden', position: 'relative', boxShadow: '0 8px 40px rgba(15,23,42,.18)' }}>
                <Image src="/assets/images/bg/course-contact-bg.jpg" alt="" fill sizes="360px"
                  style={{ objectFit: 'cover', opacity: .15 }} />
                {/* Top gradient line */}
                <div aria-hidden style={{ height: 2, background: 'linear-gradient(90deg,#1D4ED8,#D97706,#14B8A6)', position: 'relative', zIndex: 1 }} />
                <div style={{ padding: '26px 24px', position: 'relative', zIndex: 1 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, boxShadow: '0 6px 18px rgba(245,158,11,.4)' }}>
                    <GraduationCap style={{ width: 24, height: 24, color: '#0F172A' }} />
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 900, color: '#fff', lineHeight: 1.25, letterSpacing: '-.02em', margin: '0 0 10px' }}>Advance Your HR Skills</h3>
                  <p style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.75, margin: '0 0 20px' }}>
                    Join practical HR and recruitment programs built around real sourcing, screening, interviewing, and negotiation workflows.
                  </p>
                  <Link href="/courses" style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    padding: '13px 20px', borderRadius: 10, background: '#fff',
                    color: '#0F172A', fontWeight: 800, fontSize: 13, textDecoration: 'none',
                    transition: 'background .2s',
                  }}

>
                    View All Programs <ArrowRight style={{ width: 14, height: 14 }} />
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  )
}

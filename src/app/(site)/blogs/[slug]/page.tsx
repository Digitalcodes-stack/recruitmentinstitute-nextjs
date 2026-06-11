import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import {
  ArrowLeft, ArrowRight, BookOpen, Calendar, ChevronRight,
  Clock, GraduationCap, Share2, Tag, User,
} from 'lucide-react'

interface Props {
  params: Promise<{ slug: string }>
}

const blogImages = [
  '/assets/images/blog/inner/1.jpg',
  '/assets/images/blog/inner/2.jpg',
  '/assets/images/blog/inner/3.jpg',
  '/assets/images/blog/inner/4.jpg',
  '/assets/images/blog/inner/5.jpg',
  '/assets/images/blog/inner/6.jpg',
  '/assets/images/blog/inner/7.jpg',
  '/assets/images/blog/inner/8.jpg',
  '/assets/images/blog/style9/1.jpg',
  '/assets/images/blog/style9/2.jpg',
  '/assets/images/blog/style9/3.jpg',
  '/assets/images/blog/style9/4.jpg',
  '/assets/images/blog/style10/1.jpg',
  '/assets/images/blog/style10/2.jpg',
  '/assets/images/blog/style10/3.jpg',
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

function getBlogImage(index: number) {
  return blogImages[index % blogImages.length]
}

function imageIndexForSlug(slug: string) {
  return [...slug].reduce((total, char) => total + char.charCodeAt(0), 0) % blogImages.length
}

function estimateReadTime(content: string) {
  const words = stripHtml(content).split(/\s+/).length
  const mins = Math.max(1, Math.round(words / 200))
  return `${mins} min read`
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const blog = await prisma.blog.findUnique({ where: { slug } })
  if (!blog) return { title: 'Blog Post Not Found' }
  return {
    title: blog.metaTitle || blog.title,
    description: blog.metaDescription || stripHtml(blog.content).substring(0, 160),
    keywords: blog.metaKeywords || undefined,
    alternates: { canonical: blog.canonicalUrl || `/blogs/${slug}` },
    openGraph: {
      title: blog.metaTitle || blog.title,
      description: blog.metaDescription || undefined,
      images: [blog.featuredImage ? `/uploads/blog/${blog.featuredImage}` : getBlogImage(0)],
    },
  }
}

export const revalidate = 3600

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params
  const [blog, relatedBlogs] = await Promise.all([
    prisma.blog.findUnique({ where: { slug, isPublished: true } }),
    prisma.blog.findMany({
      where: { isPublished: true, NOT: { slug } },
      orderBy: { createdAt: 'desc' },
      take: 4,
      select: { id: true, title: true, slug: true, featuredImage: true, publishedAt: true, createdAt: true },
    }),
  ])

  if (!blog) notFound()

  const heroImage = getBlogImage(imageIndexForSlug(blog.slug))
  const readTime = estimateReadTime(blog.content)
  const shareUrl = encodeURIComponent(`https://recruitmentinstitute.in/blogs/${blog.slug}`)
  const shareTitle = encodeURIComponent(blog.title)

  return (
    <>
      <style>{`
        /* Breadcrumb */
        .bd-crumb { color: #94A3B8; text-decoration: none; font-size: 12px; font-weight: 600; transition: color .18s; }
        .bd-crumb:hover { color: #CBD5E1; }

        /* Back button */
        .bd-back {
          display: inline-flex; align-items: center; gap: 7px;
          border: 1.5px solid rgba(255,255,255,.14); background: rgba(255,255,255,.07);
          color: #CBD5E1; font-size: 11px; font-weight: 700; letter-spacing: .12em;
          text-transform: uppercase; padding: 9px 16px; border-radius: 9px;
          text-decoration: none; backdrop-filter: blur(8px);
          transition: background .2s, border-color .2s, color .2s;
        }
        .bd-back:hover { background: rgba(255,255,255,.13); border-color: rgba(255,255,255,.3); color: #fff; }

        /* Article prose */
        .bd-prose { font-size: 17px; line-height: 1.9; color: #374151; }
        .bd-prose p { margin: 0 0 22px; }
        .bd-prose h1, .bd-prose h2, .bd-prose h3, .bd-prose h4 { color: #0F172A; font-weight: 800; letter-spacing: -.025em; line-height: 1.25; }
        .bd-prose h2 { font-size: 28px; margin: 44px 0 16px; padding-top: 36px; border-top: 1px solid #F1F5F9; }
        .bd-prose h3 { font-size: 22px; margin: 34px 0 12px; }
        .bd-prose h4 { font-size: 18px; margin: 28px 0 10px; }
        .bd-prose ul, .bd-prose ol { margin: 0 0 22px 22px; padding: 0; }
        .bd-prose li { margin-bottom: 8px; }
        .bd-prose strong { color: #0F172A; font-weight: 700; }
        .bd-prose a { color: #1D4ED8; text-decoration: underline; text-underline-offset: 3px; }
        .bd-prose a:hover { color: #1E40AF; }
        .bd-prose blockquote { border-left: 3px solid #1D4ED8; margin: 28px 0; padding: 14px 22px; background: #EFF6FF; border-radius: 0 10px 10px 0; font-style: italic; color: #1E40AF; }
        .bd-prose img { width: 100%; border-radius: 12px; margin: 24px 0; }
        .bd-prose *:first-child { margin-top: 0; }

        /* Related post link */
        .bd-related-link { font-size: 13px; font-weight: 700; color: #0F172A; text-decoration: none; line-height: 1.45; display: block; transition: color .18s; }
        .bd-related-link:hover { color: #1D4ED8; }

        /* Share buttons */
        .bd-share-fb { display: inline-flex; align-items: center; gap: 6px; padding: 9px 18px; border-radius: 9px; background: #1877F2; color: #fff; font-size: 12px; font-weight: 700; text-decoration: none; transition: opacity .2s; }
        .bd-share-fb:hover { opacity: .88; }
        .bd-share-li { display: inline-flex; align-items: center; gap: 6px; padding: 9px 18px; border-radius: 9px; background: #0077B5; color: #fff; font-size: 12px; font-weight: 700; text-decoration: none; transition: opacity .2s; }
        .bd-share-li:hover { opacity: .88; }
        .bd-share-tw { display: inline-flex; align-items: center; gap: 6px; padding: 9px 18px; border-radius: 9px; background: #0F172A; color: #fff; font-size: 12px; font-weight: 700; text-decoration: none; transition: opacity .2s; }
        .bd-share-tw:hover { opacity: .88; }

        /* Sidebar card */
        .bd-sidebar-card { background: #fff; border-radius: 18px; border: 1.5px solid #E2E8F0; box-shadow: 0 4px 20px rgba(15,23,42,.06); overflow: hidden; }

        /* Sidebar related link hover */
        .bd-sidebar-img { transition: transform .45s ease; width: 100%; height: 100%; object-fit: cover; }
        .bd-sidebar-item:hover .bd-sidebar-img { transform: scale(1.06); }

        @media (max-width: 1100px) {
          .bd-outer-grid { grid-template-columns: 1fr !important; }
          .bd-sidebar { display: none !important; }
        }
      `}</style>

      {/* ══════════════════════════════════════════
          HERO BAND
      ══════════════════════════════════════════ */}
      <section style={{ background: 'linear-gradient(130deg,#060D1C 0%,#0B1629 40%,#0E1F3A 72%,#071120 100%)', position: 'relative', overflow: 'hidden' }}>
        {/* BG image */}
        <div className="absolute inset-0" style={{ zIndex: 0 }}>
          <Image src={heroImage} alt="" fill priority sizes="100vw"
            style={{ objectFit: 'cover', opacity: .2 }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg,rgba(6,13,28,.97) 0%,rgba(11,22,41,.93) 55%,rgba(14,31,58,.85) 100%)' }} />
        </div>
        {/* Dot grid */}
        <div aria-hidden className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,.024) 1px,transparent 1px)', backgroundSize: '28px 28px', zIndex: 1 }} />
        {/* Glows */}
        <div aria-hidden className="absolute" style={{ top: -80, left: -60, width: 440, height: 440, background: 'radial-gradient(circle,rgba(29,78,216,.16) 0%,transparent 65%)', zIndex: 1 }} />
        {/* Gold accent top */}
        <div aria-hidden className="absolute top-0 left-0 right-0" style={{ height: 2, background: 'linear-gradient(90deg,transparent,#D97706 28%,#14B8A6 72%,transparent)', zIndex: 3 }} />

        <div className="container" style={{ position: 'relative', zIndex: 10, padding: '36px 0 44px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <Link href="/blogs" className="bd-back">
              <ArrowLeft style={{ width: 14, height: 14 }} /> Back to Blog
            </Link>
            {/* Breadcrumb */}
            <nav style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <Link href="/" className="bd-crumb">Home</Link>
              <ChevronRight style={{ width: 12, height: 12, color: '#475569' }} />
              <Link href="/blogs" className="bd-crumb">Blog</Link>
              <ChevronRight style={{ width: 12, height: 12, color: '#475569' }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: '#F59E0B' }}>Article</span>
            </nav>
          </div>
        </div>

        {/* Wave */}
        <div aria-hidden className="absolute bottom-0 left-0 right-0" style={{ height: 40, background: '#F1F5F9', clipPath: 'ellipse(55% 100% at 50% 100%)', zIndex: 10 }} />
      </section>

      {/* ══════════════════════════════════════════
          MAIN CONTENT
      ══════════════════════════════════════════ */}
      <section style={{ background: '#F1F5F9', padding: '52px 0 88px' }}>
        <div className="container">
          <div className="bd-outer-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 360px', gap: 28, alignItems: 'start' }}>

            {/* ── ARTICLE ── */}
            <article style={{ background: '#fff', borderRadius: 22, border: '1.5px solid #E2E8F0', boxShadow: '0 8px 40px rgba(15,23,42,.08)', overflow: 'hidden' }}>

              {/* Article header inside card */}
              <div style={{ padding: '40px 52px 32px' }}>
                {/* Category badge */}
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 14px', borderRadius: 50, background: '#EFF6FF', border: '1px solid #BFDBFE', marginBottom: 20 }}>
                  <Tag style={{ width: 10, height: 10, color: '#1D4ED8' }} />
                  <span style={{ fontSize: 10, fontWeight: 800, color: '#1D4ED8', textTransform: 'uppercase', letterSpacing: '.18em' }}>
                    Recruitment Insights
                  </span>
                </div>

                <h1 style={{ fontSize: 'clamp(26px,3.2vw,42px)', fontWeight: 900, color: '#0F172A', lineHeight: 1.15, letterSpacing: '-.03em', margin: '0 0 24px' }}>
                  {blog.title}
                </h1>

                {/* Meta row */}
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 16, paddingBottom: 24, borderBottom: '1px solid #F1F5F9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 32, height: 32, borderRadius: '50%', background: '#EFF6FF', border: '1px solid #BFDBFE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Calendar style={{ width: 14, height: 14, color: '#1D4ED8' }} />
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '.1em' }}>
                      {formatDate(blog.publishedAt || blog.createdAt)}
                    </span>
                  </div>
                  {blog.author && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ width: 32, height: 32, borderRadius: '50%', background: '#F0FDF4', border: '1px solid #BBF7D0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <User style={{ width: 14, height: 14, color: '#059669' }} />
                      </span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '.1em' }}>
                        {blog.author}
                      </span>
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto' }}>
                    <span style={{ width: 32, height: 32, borderRadius: '50%', background: '#FFFBEB', border: '1px solid #FDE68A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Clock style={{ width: 14, height: 14, color: '#D97706' }} />
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '.1em' }}>
                      {readTime}
                    </span>
                  </div>
                </div>
              </div>

              {/* Featured image */}
              <div style={{ position: 'relative', margin: '0 52px 40px', borderRadius: 16, overflow: 'hidden', boxShadow: '0 16px 48px rgba(15,23,42,.14)', aspectRatio: '16/9', background: '#0F172A' }}>
                <Image src={heroImage} alt={blog.title} fill priority sizes="(min-width:1024px) 820px,100vw"
                  style={{ objectFit: 'cover' }} />
                {/* Subtle bottom scrim */}
                <div className="absolute bottom-0 left-0 right-0" style={{ height: 80, background: 'linear-gradient(to top,rgba(15,23,42,.4),transparent)' }} />
              </div>

              {/* Prose content */}
              <div style={{ padding: '0 52px 48px' }}>
                <div className="bd-prose" dangerouslySetInnerHTML={{ __html: blog.content }} />

                {/* Share row */}
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12, paddingTop: 32, marginTop: 44, borderTop: '1.5px solid #F1F5F9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginRight: 4 }}>
                    <Share2 style={{ width: 15, height: 15, color: '#94A3B8' }} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '.12em' }}>Share</span>
                  </div>
                  <a href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
                    target="_blank" rel="noopener noreferrer" className="bd-share-fb">
                    Facebook
                  </a>
                  <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`}
                    target="_blank" rel="noopener noreferrer" className="bd-share-li">
                    LinkedIn
                  </a>
                  <a href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`}
                    target="_blank" rel="noopener noreferrer" className="bd-share-tw">
                    X / Twitter
                  </a>
                </div>
              </div>
            </article>

            {/* ── SIDEBAR ── */}
            <aside className="bd-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: 20, position: 'sticky', top: 112 }}>

              {/* Related Posts */}
              <div className="bd-sidebar-card">
                {/* Header with image strip */}
                <div style={{ position: 'relative', height: 130, background: '#0B1629', flexShrink: 0 }}>
                  <Image src={getBlogImage(2)} alt="" fill sizes="360px"
                    style={{ objectFit: 'cover', opacity: .65 }} />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top,rgba(11,22,41,.95) 0%,rgba(11,22,41,.3) 100%)' }} />
                  {/* Top accent */}
                  <div aria-hidden style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,#1D4ED8,#14B8A6)', zIndex: 2 }} />
                  <div style={{ position: 'absolute', bottom: 16, left: 18, right: 18, zIndex: 2 }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 800, color: '#fff', margin: 0 }}>
                      <BookOpen style={{ width: 15, height: 15, color: '#FCD34D' }} />
                      Related Posts
                    </h3>
                  </div>
                </div>

                {/* List */}
                <ul style={{ listStyle: 'none', margin: 0, padding: '16px 20px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {relatedBlogs.map((related, index) => (
                    <li key={related.id} className="bd-sidebar-item"
                      style={{ display: 'grid', gridTemplateColumns: '76px 1fr', gap: 12, paddingBottom: 14, borderBottom: index < relatedBlogs.length - 1 ? '1px solid #F1F5F9' : 'none' }}>
                      <Link href={`/blogs/${related.slug}`}
                        style={{ position: 'relative', display: 'block', borderRadius: 10, overflow: 'hidden', background: '#E2E8F0', aspectRatio: '4/3', flexShrink: 0 }}>
                        <Image src={getBlogImage(index + 1)} alt={related.title} fill sizes="76px"
                          className="bd-sidebar-img" />
                      </Link>
                      <div>
                        <Link href={`/blogs/${related.slug}`} className="bd-related-link">
                          {related.title}
                        </Link>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 6 }}>
                          <Calendar style={{ width: 10, height: 10, color: '#94A3B8' }} />
                          <span style={{ fontSize: 10, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '.08em' }}>
                            {formatDate(related.publishedAt || related.createdAt)}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Career Advice CTA */}
              <div style={{ borderRadius: 18, background: 'linear-gradient(130deg,#0B1629,#0F172A)', border: '1px solid rgba(255,255,255,.07)', overflow: 'hidden', position: 'relative', boxShadow: '0 8px 40px rgba(15,23,42,.18)' }}>
                <Image src="/assets/images/bg/course-contact-bg.jpg" alt="" fill sizes="360px"
                  style={{ objectFit: 'cover', opacity: .15 }} />
                <div aria-hidden style={{ height: 2, background: 'linear-gradient(90deg,#1D4ED8,#D97706,#14B8A6)', position: 'relative', zIndex: 1 }} />
                <div style={{ padding: '26px 24px 28px', position: 'relative', zIndex: 1 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, boxShadow: '0 6px 18px rgba(245,158,11,.4)' }}>
                    <GraduationCap style={{ width: 24, height: 24, color: '#0F172A' }} />
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 900, color: '#fff', lineHeight: 1.25, letterSpacing: '-.02em', margin: '0 0 10px' }}>Need Career Advice?</h3>
                  <p style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.75, margin: '0 0 20px' }}>
                    Speak with our admissions team about HR training formats, syllabus options, and the right next step for your career.
                  </p>
                  <Link href="/contact" style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    padding: '13px 20px', borderRadius: 10, background: '#fff',
                    color: '#0F172A', fontWeight: 800, fontSize: 13, textDecoration: 'none',
                  }}>
                    Contact Admissions <ArrowRight style={{ width: 14, height: 14 }} />
                  </Link>
                </div>
              </div>

              {/* Browse more */}
              <div style={{ background: '#fff', borderRadius: 16, border: '1.5px solid #E2E8F0', padding: '20px 22px', boxShadow: '0 4px 16px rgba(15,23,42,.05)' }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', margin: '0 0 12px' }}>Explore more articles</p>
                <Link href="/blogs" style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '12px 18px', borderRadius: 10,
                  background: 'linear-gradient(135deg,#1D4ED8,#2563EB)',
                  color: '#fff', fontWeight: 700, fontSize: 13, textDecoration: 'none',
                  boxShadow: '0 4px 14px rgba(29,78,216,.3)',
                }}>
                  <BookOpen style={{ width: 14, height: 14 }} /> Back to Blog
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: blog.title,
          author: { '@type': 'Person', name: blog.author || 'Recruitment Institute' },
          datePublished: blog.publishedAt || blog.createdAt.toISOString(),
          image: blog.featuredImage ? `https://recruitmentinstitute.in/uploads/blog/${blog.featuredImage}` : heroImage,
          publisher: { '@type': 'Organization', name: 'Recruitment Institute', url: 'https://recruitmentinstitute.in' },
        }),
      }} />
    </>
  )
}

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import fs from 'fs'
import path from 'path'
import { prisma } from '@/lib/prisma'
import {
  ArrowLeft, ArrowRight, BookOpen, Calendar, ChevronRight,
  Clock, GraduationCap, Share2, Tag, User, Star, ChevronDown,
} from 'lucide-react'
import RawHtmlScript from '@/components/RawHtmlScript'

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
      description: blog.metaDescription || stripHtml(blog.content).substring(0, 160),
      images: [(() => {
        if (!blog.featuredImage) return getBlogImage(0)
        const diskPath = path.join(process.cwd(), 'public', blog.featuredImage)
        return fs.existsSync(diskPath) ? `/${blog.featuredImage}` : getBlogImage(0)
      })()],
    },
  }
}

export const revalidate = 3600

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params

  // Fetch blog first so we have the id for the FAQ query
  const blog = await prisma.blog.findUnique({ where: { slug, isPublished: true } })
  if (!blog) notFound()

  const [relatedBlogs, blogFaqs, testimonials, clientLogos] = await Promise.all([
    prisma.blog.findMany({
      where: { isPublished: true, NOT: { slug } },
      orderBy: { createdAt: 'desc' },
      take: 4,
      select: { id: true, title: true, slug: true, featuredImage: true, publishedAt: true, createdAt: true },
    }),
    prisma.blogFaq.findMany({
      where: { blogId: blog.id },
      orderBy: { sortOrder: 'asc' },
    }),
    prisma.testimonial.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      take: 3,
      select: { id: true, title: true, description: true, author: true, image: true, rating: true },
    }),
    prisma.clientLogo.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      select: { id: true, name: true, logo: true, website: true },
    }),
  ])

  const heroImage = getBlogImage(imageIndexForSlug(blog.slug))
  // DB stores paths like "uploads/blog/image.jpg" — check if the file actually
  // exists in public/. If not (images not yet migrated), fall back to a static hero.
  const featuredSrc = (() => {
    if (!blog.featuredImage) return heroImage
    const diskPath = path.join(process.cwd(), 'public', blog.featuredImage)
    return fs.existsSync(diskPath) ? `/${blog.featuredImage}` : heroImage
  })()
  const readTime = estimateReadTime(blog.content)
  const shareUrl = encodeURIComponent(`https://recruitmentinstitute.in/blogs/${blog.slug}`)
  const shareTitle = encodeURIComponent(blog.title)

  /* JSON-LD: FAQ schema */
  const faqSchema = blogFaqs.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: blogFaqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  } : null

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

        /* FAQ accordion */
        .bd-faq-item { border: 1.5px solid #E2E8F0; border-radius: 14px; overflow: hidden; transition: border-color .2s; }
        .bd-faq-item:hover { border-color: #BFDBFE; }
        .bd-faq-btn { width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 18px 22px; background: #fff; border: none; cursor: pointer; text-align: left; }
        .bd-faq-btn:hover { background: #F8FAFC; }
        .bd-faq-answer { padding: 0 22px 18px; font-size: 15px; line-height: 1.8; color: #374151; }
        details[open] .bd-faq-chevron { transform: rotate(180deg); }
        .bd-faq-chevron { transition: transform .25s ease; }

        /* Internal links */
        .bd-internal-link { display: inline-flex; align-items: center; gap: 5px; padding: 7px 14px; border-radius: 8px; background: #EFF6FF; border: 1px solid #BFDBFE; color: #1D4ED8; font-size: 12px; font-weight: 700; text-decoration: none; transition: background .18s, border-color .18s; }
        .bd-internal-link:hover { background: #DBEAFE; border-color: #93C5FD; }

        /* Client logo strip */
        .bd-client-logo { height: 40px; max-width: 120px; object-fit: contain; filter: grayscale(1) opacity(.55); transition: filter .3s; }
        .bd-client-logo:hover { filter: grayscale(0) opacity(1); }

        /* Testimonial card */
        .bd-testi-card { background: #fff; border-radius: 18px; border: 1.5px solid #E2E8F0; padding: 24px; display: flex; flex-direction: column; gap: 14px; box-shadow: 0 4px 16px rgba(15,23,42,.05); }

        @media (max-width: 1100px) {
          .bd-outer-grid { grid-template-columns: 1fr !important; }
          .bd-sidebar { display: none !important; }
        }
        @media (max-width: 768px) {
          .bd-testi-grid { grid-template-columns: 1fr !important; }
          .bd-client-strip { gap: 20px !important; }
        }
      `}</style>

      {/* ══════════════════════════════════════════
          HERO BAND
      ══════════════════════════════════════════ */}
      <section style={{ background: 'linear-gradient(130deg,#060D1C 0%,#0B1629 40%,#0E1F3A 72%,#071120 100%)', position: 'relative', overflow: 'hidden' }}>
        <div className="absolute inset-0" style={{ zIndex: 0 }}>
          <Image
            src={heroImage}
            alt={`${blog.title} — Recruitment Institute blog`}
            fill priority sizes="100vw"
            style={{ objectFit: 'cover', opacity: .2 }}
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg,rgba(6,13,28,.97) 0%,rgba(11,22,41,.93) 55%,rgba(14,31,58,.85) 100%)' }} />
        </div>
        <div aria-hidden className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,.024) 1px,transparent 1px)', backgroundSize: '28px 28px', zIndex: 1 }} />
        <div aria-hidden className="absolute" style={{ top: -80, left: -60, width: 440, height: 440, background: 'radial-gradient(circle,rgba(29,78,216,.16) 0%,transparent 65%)', zIndex: 1 }} />
        <div aria-hidden className="absolute top-0 left-0 right-0" style={{ height: 2, background: 'linear-gradient(90deg,transparent,#D97706 28%,#14B8A6 72%,transparent)', zIndex: 3 }} />

        <div className="container" style={{ position: 'relative', zIndex: 10, padding: '36px 0 44px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <Link href="/blogs" className="bd-back">
              <ArrowLeft style={{ width: 14, height: 14 }} /> Back to Blog
            </Link>
            <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <Link href="/" className="bd-crumb">Home</Link>
              <ChevronRight style={{ width: 12, height: 12, color: '#475569' }} />
              <Link href="/blogs" className="bd-crumb">Blog</Link>
              <ChevronRight style={{ width: 12, height: 12, color: '#475569' }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: '#F59E0B' }}>Article</span>
            </nav>
          </div>
        </div>

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

              {/* Featured image — alt tag from DB title */}
              <div style={{ position: 'relative', margin: '0 52px 40px', borderRadius: 16, overflow: 'hidden', boxShadow: '0 16px 48px rgba(15,23,42,.14)', aspectRatio: '16/9', background: '#0F172A' }}>
                <Image
                  src={featuredSrc}
                  alt={`${blog.title} — HR and Recruitment training at Recruitment Institute`}
                  fill priority
                  sizes="(min-width:1024px) 820px,100vw"
                  style={{ objectFit: 'cover' }}
                />
                <div className="absolute bottom-0 left-0 right-0" style={{ height: 80, background: 'linear-gradient(to top,rgba(15,23,42,.4),transparent)' }} />
              </div>

              {/* Prose content */}
              <div style={{ padding: '0 52px 48px' }}>
                <div className="bd-prose" dangerouslySetInnerHTML={{ __html: blog.content }} />

                {/* ── Internal navigation links ── */}
                <div style={{ margin: '44px 0 32px', padding: '24px', background: '#F8FAFC', borderRadius: 16, border: '1.5px solid #E2E8F0' }}>
                  <p style={{ fontSize: 12, fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '.14em', marginBottom: 14 }}>
                    Explore Our Programs
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                    {[
                      { label: 'End-to-End Recruitment Training', href: '/end-to-end-recruitment-training' },
                      { label: 'HR Courses for Beginners', href: '/hr-courses-for-beginners' },
                      { label: 'HR Entrepreneurship Program', href: '/hr-entrepreneurship-program' },
                      { label: 'Corporate Training', href: '/hr-corporate-training-course' },
                      { label: 'All Courses', href: '/courses' },
                      { label: 'View Fees', href: '/fees' },
                    ].map(({ label, href }) => (
                      <Link key={href} href={href} className="bd-internal-link">
                        <ArrowRight style={{ width: 11, height: 11 }} />
                        {label}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Share row */}
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12, paddingTop: 32, marginTop: 12, borderTop: '1.5px solid #F1F5F9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginRight: 4 }}>
                    <Share2 style={{ width: 15, height: 15, color: '#94A3B8' }} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '.12em' }}>Share</span>
                  </div>
                  <a href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
                    target="_blank" rel="noopener noreferrer" className="bd-share-fb"
                    aria-label="Share this article on Facebook">
                    Facebook
                  </a>
                  <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`}
                    target="_blank" rel="noopener noreferrer" className="bd-share-li"
                    aria-label="Share this article on LinkedIn">
                    LinkedIn
                  </a>
                  <a href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`}
                    target="_blank" rel="noopener noreferrer" className="bd-share-tw"
                    aria-label="Share this article on X / Twitter">
                    X / Twitter
                  </a>
                </div>
              </div>

              {/* ══ FAQ SECTION — always rendered ══ */}
              <div style={{ padding: '0 52px 52px' }}>
                <div style={{ borderTop: '2px solid #F1F5F9', paddingTop: 44 }}>

                  {/* Header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg,#1D4ED8,#2563EB)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 6px 18px rgba(29,78,216,.3)' }}>
                      <BookOpen style={{ width: 20, height: 20, color: '#fff' }} />
                    </div>
                    <div>
                      <h2 style={{ fontSize: 24, fontWeight: 900, color: '#0F172A', margin: 0, letterSpacing: '-.02em' }}>
                        Frequently Asked Questions
                      </h2>
                      <p style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>
                        Common questions about this topic
                      </p>
                    </div>
                  </div>

                  {blogFaqs.length > 0 ? (
                    /* Accordion */
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {blogFaqs.map((faq, idx) => (
                        <details key={faq.id} className="bd-faq-item" style={{ background: '#fff' }}>
                          <summary className="bd-faq-btn" style={{ listStyle: 'none' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flex: 1 }}>
                              <span style={{ width: 26, height: 26, borderRadius: 8, background: '#EFF6FF', border: '1px solid #BFDBFE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 11, fontWeight: 800, color: '#1D4ED8', marginTop: 1 }}>
                                {idx + 1}
                              </span>
                              <span style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', lineHeight: 1.45 }}>
                                {faq.question}
                              </span>
                            </div>
                            <ChevronDown className="bd-faq-chevron" style={{ width: 18, height: 18, color: '#94A3B8', flexShrink: 0 }} />
                          </summary>
                          <div className="bd-faq-answer">
                            {faq.answer}
                          </div>
                        </details>
                      ))}
                    </div>
                  ) : (
                    /* Empty state — no FAQs yet */
                    <div style={{ padding: '28px 24px', background: '#F8FAFC', borderRadius: 14, border: '1.5px dashed #E2E8F0', textAlign: 'center' }}>
                      <p style={{ fontSize: 14, color: '#94A3B8', margin: 0 }}>
                        No FAQs added for this post yet.
                      </p>
                    </div>
                  )}

                  {/* CTA below FAQ */}
                  <div style={{ marginTop: 28, padding: '18px 22px', background: '#EFF6FF', borderRadius: 14, border: '1px solid #BFDBFE', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                    <p style={{ fontSize: 13, color: '#1E40AF', fontWeight: 600, margin: 0 }}>
                      Still have questions? Our admissions team is happy to help.
                    </p>
                    <Link href="/contact" style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      padding: '9px 18px', borderRadius: 9,
                      background: '#1D4ED8', color: '#fff',
                      fontSize: 12, fontWeight: 700, textDecoration: 'none',
                    }}>
                      Contact Us <ArrowRight style={{ width: 12, height: 12 }} />
                    </Link>
                  </div>

                </div>
              </div>
            </article>

            {/* ── SIDEBAR ── */}
            <aside className="bd-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: 20, position: 'sticky', top: 112 }}>

              {/* Related Posts */}
              <div className="bd-sidebar-card">
                <div style={{ position: 'relative', height: 130, background: '#0B1629', flexShrink: 0 }}>
                  <Image
                    src={getBlogImage(2)}
                    alt="Related blog posts from Recruitment Institute"
                    fill sizes="360px"
                    style={{ objectFit: 'cover', opacity: .65 }}
                  />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top,rgba(11,22,41,.95) 0%,rgba(11,22,41,.3) 100%)' }} />
                  <div aria-hidden style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,#1D4ED8,#14B8A6)', zIndex: 2 }} />
                  <div style={{ position: 'absolute', bottom: 16, left: 18, right: 18, zIndex: 2 }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 800, color: '#fff', margin: 0 }}>
                      <BookOpen style={{ width: 15, height: 15, color: '#FCD34D' }} />
                      Related Posts
                    </h3>
                  </div>
                </div>

                <ul style={{ listStyle: 'none', margin: 0, padding: '16px 20px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {relatedBlogs.map((related, index) => (
                    <li key={related.id} className="bd-sidebar-item"
                      style={{ display: 'grid', gridTemplateColumns: '76px 1fr', gap: 12, paddingBottom: 14, borderBottom: index < relatedBlogs.length - 1 ? '1px solid #F1F5F9' : 'none' }}>
                      <Link href={`/blogs/${related.slug}`}
                        style={{ position: 'relative', display: 'block', borderRadius: 10, overflow: 'hidden', background: '#E2E8F0', aspectRatio: '4/3', flexShrink: 0 }}>
                        <Image
                          src={getBlogImage(index + 1)}
                          alt={`${related.title} — Recruitment Institute`}
                          fill sizes="76px"
                          className="bd-sidebar-img"
                        />
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
                <Image src="/assets/images/bg/course-contact-bg.jpg" alt="Career advice — Recruitment Institute" fill sizes="360px"
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

          {/* ══ TESTIMONIALS SECTION ══ */}
          {testimonials.length > 0 && (
            <div style={{ marginTop: 56 }}>
              {/* Section header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 28 }}>
                <div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 14px', borderRadius: 50, background: '#FFFBEB', border: '1px solid #FDE68A', marginBottom: 10 }}>
                    <Star style={{ width: 10, height: 10, color: '#D97706', fill: '#D97706' }} />
                    <span style={{ fontSize: 10, fontWeight: 800, color: '#92400E', textTransform: 'uppercase', letterSpacing: '.18em' }}>Student Stories</span>
                  </div>
                  <h2 style={{ fontSize: 26, fontWeight: 900, color: '#0F172A', margin: 0, letterSpacing: '-.025em' }}>
                    What Our Students Say
                  </h2>
                </div>
                <Link href="/testimonials" style={{ fontSize: 13, fontWeight: 700, color: '#1D4ED8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 5 }}>
                  View all testimonials <ArrowRight style={{ width: 13, height: 13 }} />
                </Link>
              </div>

              <div className="bd-testi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
                {testimonials.map((t) => {
                  const initials = (t.author || 'U').split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()
                  const colors = ['#2563EB', '#7C3AED', '#059669', '#D97706', '#DB2777']
                  const color = colors[t.id % colors.length]
                  return (
                    <div key={t.id} className="bd-testi-card">
                      {/* Stars */}
                      <div style={{ display: 'flex', gap: 2 }}>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} style={{ width: 14, height: 14, fill: i < t.rating ? '#F59E0B' : 'transparent', color: i < t.rating ? '#F59E0B' : '#E2E8F0' }} />
                        ))}
                      </div>
                      {/* Quote */}
                      <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.75, margin: 0, display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>
                        &ldquo;{t.description || t.title || ''}&rdquo;
                      </p>
                      {/* Author */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 14, borderTop: '1px solid #F1F5F9' }}>
                        {t.image ? (
                          <Image
                            src={t.image}
                            alt={`${t.author || 'Student'} — Recruitment Institute testimonial`}
                            width={36} height={36}
                            style={{ borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                          />
                        ) : (
                          <div style={{ width: 36, height: 36, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                            {initials}
                          </div>
                        )}
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', margin: 0 }}>{t.author || 'Anonymous'}</p>
                          {t.title && <p style={{ fontSize: 11, color: '#94A3B8', margin: 0 }}>{t.title}</p>}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ══ CLIENT LOGOS SECTION ══ */}
          {clientLogos.length > 0 && (
            <div style={{ marginTop: 56 }}>
              <div style={{ background: '#fff', borderRadius: 20, border: '1.5px solid #E2E8F0', padding: '36px 44px', boxShadow: '0 4px 20px rgba(15,23,42,.06)' }}>
                <div style={{ textAlign: 'center', marginBottom: 28 }}>
                  <p style={{ fontSize: 11, fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '.2em', margin: '0 0 8px' }}>
                    Trusted By Leading Companies
                  </p>
                  <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-.02em' }}>
                    Our Alumni Work At
                  </h2>
                </div>

                <div className="bd-client-strip" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 36 }}>
                  {clientLogos.map((client) => (
                    client.website ? (
                      <a
                        key={client.id}
                        href={client.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={`${client.name} — Recruits from Recruitment Institute`}
                      >
                        <Image
                          src={client.logo}
                          alt={`${client.name} company logo`}
                          width={120} height={40}
                          className="bd-client-logo"
                          style={{ objectFit: 'contain' }}
                        />
                      </a>
                    ) : (
                      <Image
                        key={client.id}
                        src={client.logo}
                        alt={`${client.name} company logo`}
                        width={120} height={40}
                        className="bd-client-logo"
                        style={{ objectFit: 'contain' }}
                      />
                    )
                  ))}
                </div>

                <div style={{ textAlign: 'center', marginTop: 28 }}>
                  <Link href="/courses" style={{ fontSize: 13, fontWeight: 700, color: '#1D4ED8', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                    View our placement-focused courses <ArrowRight style={{ width: 13, height: 13 }} />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* JSON-LD: BlogPosting */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: blog.title,
          description: blog.metaDescription || stripHtml(blog.content).substring(0, 160),
          author: { '@type': 'Person', name: blog.author || 'Recruitment Institute' },
          datePublished: blog.publishedAt || blog.createdAt.toISOString(),
          dateModified: blog.updatedAt.toISOString(),
          image: `https://recruitmentinstitute.in${featuredSrc}`,
          url: `https://recruitmentinstitute.in/blogs/${blog.slug}`,
          publisher: {
            '@type': 'Organization',
            name: 'Recruitment Institute',
            url: 'https://recruitmentinstitute.in',
            logo: { '@type': 'ImageObject', url: 'https://recruitmentinstitute.in/assets/images/logo.png' },
          },
          mainEntityOfPage: { '@type': 'WebPage', '@id': `https://recruitmentinstitute.in/blogs/${blog.slug}` },
        }),
      }} />

      {/* JSON-LD: FAQPage */}
      {faqSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      )}

      {/* Custom scripts from DB */}
      {blog.schemaScript && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: blog.schemaScript }} />
      )}
      {blog.customScript && (
        <RawHtmlScript html={blog.customScript} />
      )}
    </>
  )
}

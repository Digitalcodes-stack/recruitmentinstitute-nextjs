import Link from 'next/link'
import { ArrowLeft, Home, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 20px',
        background:
          'radial-gradient(circle at top, rgba(37,99,235,0.16) 0%, transparent 38%), linear-gradient(180deg, #F8FAFC 0%, #FFFFFF 100%)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '760px',
          background: 'rgba(255,255,255,0.9)',
          border: '1px solid #E2E8F0',
          borderRadius: '28px',
          boxShadow: '0 24px 80px rgba(15,23,42,0.08)',
          padding: 'clamp(28px, 5vw, 56px)',
          textAlign: 'center',
          backdropFilter: 'blur(10px)',
        }}
      >
        <div
          aria-hidden
          style={{
            width: 96,
            height: 96,
            margin: '0 auto 24px',
            borderRadius: '28px',
            background: 'linear-gradient(135deg, #1E40AF, #2563EB)',
            display: 'grid',
            placeItems: 'center',
            boxShadow: '0 18px 36px rgba(37,99,235,0.28)',
          }}
        >
          <Search size={40} strokeWidth={2.2} color="#FFFFFF" />
        </div>

        <p
          style={{
            margin: '0 0 10px',
            fontSize: 13,
            fontWeight: 800,
            letterSpacing: '.24em',
            textTransform: 'uppercase',
            color: '#2563EB',
          }}
        >
          404
        </p>
        <h1
          style={{
            margin: '0 0 16px',
            fontSize: 'clamp(32px, 4vw, 52px)',
            lineHeight: 1.08,
            letterSpacing: '-0.04em',
            color: '#0F172A',
          }}
        >
          We couldn&apos;t find that page
        </h1>
        <p
          style={{
            margin: '0 auto 32px',
            maxWidth: 560,
            fontSize: 16,
            lineHeight: 1.8,
            color: '#64748B',
          }}
        >
          The page you&apos;re looking for may have moved, been renamed, or no longer exists.
          Use the buttons below to get back to the main site.
        </p>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: 12,
          }}
        >
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              padding: '14px 22px',
              borderRadius: 14,
              background: 'linear-gradient(135deg, #1E40AF, #2563EB)',
              color: '#fff',
              textDecoration: 'none',
              fontWeight: 700,
              boxShadow: '0 10px 24px rgba(37,99,235,0.24)',
            }}
          >
            <Home size={18} />
            Go Home
          </Link>
          <Link
            href="/courses"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              padding: '14px 22px',
              borderRadius: 14,
              background: '#fff',
              color: '#0F172A',
              textDecoration: 'none',
              fontWeight: 700,
              border: '1px solid #CBD5E1',
            }}
          >
            <ArrowLeft size={18} />
            View Courses
          </Link>
        </div>
      </div>
    </main>
  )
}

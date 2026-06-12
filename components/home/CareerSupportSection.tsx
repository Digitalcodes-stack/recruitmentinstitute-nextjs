'use client'

import Image from 'next/image'

const ITEMS = [
  { icon: '🎯', title: 'Placement Assistance',           desc: 'Direct referrals to 500+ hiring companies across India' },
  { icon: '💼', title: 'Exclusive Job Portal Access',   desc: 'Priority access to our internal job listings & live openings' },
  { icon: '🎤', title: 'Mock Interview Preparation',    desc: 'Live mock rounds with real recruiter feedback and scoring' },
  { icon: '🧑‍💼', title: '1-on-1 Career Mentoring',      desc: 'Personal sessions with industry experts to plan your career path' },
  { icon: '🗓️', title: 'Career Oriented Sessions',      desc: 'Workshops on salary negotiation, industry trends & networking' },
  { icon: '📄', title: 'Resume & LinkedIn Building',    desc: 'Professional CV review and LinkedIn profile makeover included' },
]

export default function CareerSupportSection() {
  return (
    <section style={{ background: '#F8FAFC', padding: '80px 0 88px', borderTop: '1px solid #E2E8F0' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <span style={{ display: 'inline-block', fontSize: 12, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#0369A1', background: '#EFF6FF', border: '1px solid #BFDBFE', padding: '4px 14px', borderRadius: 50, marginBottom: 14 }}>
            After Course Completion
          </span>
          <h2 style={{ fontSize: 'clamp(26px,4vw,36px)', fontWeight: 800, color: '#0F172A', margin: '0 0 14px', lineHeight: 1.2 }}>
            Career Support
          </h2>
          <div style={{ width: 48, height: 4, background: 'linear-gradient(90deg,#0369A1,#0EA5E9)', borderRadius: 2, margin: '0 auto 16px' }} />
          <p style={{ fontSize: 15, color: '#64748B', maxWidth: 520, margin: '0 auto', lineHeight: 1.7 }}>
            We don't just train you — we help you land the job. Our placement support is active for <strong style={{ color: '#0F172A' }}>6 months</strong> after course completion.
          </p>
        </div>

        {/* Main card */}
        <div style={{ background: 'white', borderRadius: 20, boxShadow: '0 4px 32px rgba(15,23,42,0.08)', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }} className="cs-grid">

            {/* Left — photo */}
            <div style={{ position: 'relative', minHeight: 380, background: 'linear-gradient(135deg,#0F172A,#1E3A8A)' }} className="cs-img-col">
              <Image
                src="/assets/images/about/home8/2.jpg"
                alt="Students celebrating placement success"
                fill
                style={{ objectFit: 'cover', opacity: 0.82 }}
              />
              {/* Overlay gradient */}
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,rgba(15,23,42,0.5) 0%,rgba(30,58,138,0.3) 100%)' }} />
              {/* Stat badge */}
              <div style={{ position: 'absolute', bottom: 28, left: 28, background: 'white', borderRadius: 14, padding: '14px 20px', boxShadow: '0 8px 28px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#0369A1,#0EA5E9)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: 20 }}>🏆</span>
                </div>
                <div>
                  <p style={{ fontSize: 22, fontWeight: 900, color: '#0F172A', margin: 0, lineHeight: 1 }}>95%</p>
                  <p style={{ fontSize: 11, color: '#64748B', margin: '3px 0 0', fontWeight: 600 }}>Placement Support Rate</p>
                </div>
              </div>
              {/* Second badge */}
              <div style={{ position: 'absolute', top: 28, right: 28, background: 'white', borderRadius: 12, padding: '10px 16px', boxShadow: '0 4px 16px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 16 }}>🏢</span>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', margin: 0, lineHeight: 1 }}>500+</p>
                  <p style={{ fontSize: 10, color: '#64748B', margin: '2px 0 0', fontWeight: 600 }}>Partner Companies</p>
                </div>
              </div>
            </div>

            {/* Right — grid of 6 items */}
            <div style={{ padding: '32px 28px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="cs-items-grid">
              {ITEMS.map((item) => (
                <div key={item.title}
                  style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '16px', borderRadius: 12, background: '#F8FAFC', border: '1px solid #E2E8F0', transition: 'box-shadow 0.2s' }}
                  className="cs-item">
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg,#EFF6FF,#DBEAFE)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 18 }}>
                    {item.icon}
                  </div>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 700, color: '#0F172A', margin: '0 0 4px', lineHeight: 1.3 }}>{item.title}</p>
                    <p style={{ fontSize: 11, color: '#64748B', margin: 0, lineHeight: 1.5 }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      <style>{`
        @media (max-width: 768px) {
          .cs-grid { grid-template-columns: 1fr !important; }
          .cs-img-col { min-height: 260px !important; }
          .cs-items-grid { grid-template-columns: 1fr !important; padding: 20px 16px !important; gap: 12px !important; }
        }
        .cs-item:hover { box-shadow: 0 4px 16px rgba(3,105,161,0.12); border-color: #BFDBFE !important; background: white !important; }
      `}</style>
    </section>
  )
}

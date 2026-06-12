'use client'

const TESTS = [
  {
    badge: 'Test 1',
    title: 'Aptitude Test',
    color: '#0369A1',
    bg: '#EFF6FF',
    border: '#BFDBFE',
    desc: 'Assess logical reasoning, verbal ability, and numerical aptitude to benchmark your readiness before entering the job market.',
    skills: ['Logical Reasoning', 'Verbal Ability', 'Numerical Aptitude'],
  },
  {
    badge: 'Test 2',
    title: 'HR Skills Test',
    color: '#7C3AED',
    bg: '#F5F3FF',
    border: '#DDD6FE',
    desc: 'Practical evaluation of core HR knowledge — recruitment lifecycle, sourcing techniques, screening methods, and ATS tools.',
    skills: ['Recruitment Concepts', 'Sourcing Techniques', 'ATS & Screening'],
  },
]

const PARTNERS = [
  'TCS', 'Infosys', 'Wipro', 'HCL', 'Accenture', 'IBM',
  'Cognizant', 'Tech Mahindra', 'Capgemini', 'Mphasis',
  'Hexaware', 'Persistent', 'KPIT', 'Cyient',
]

const BENEFITS = [
  { icon: '🏢', text: 'Associated with 500+ top organisations including MNCs across India' },
  { icon: '🖥️', text: 'Separate student portals for placement — interview schedules and notifications via email' },
  { icon: '🤝', text: 'After 70% course completion, face-to-face interactions arranged with partner companies' },
  { icon: '📄', text: 'Placement trainers help develop resumes that match current industry needs' },
  { icon: '🎤', text: 'Mock interview rounds with real feedback from working industry professionals' },
  { icon: '🌐', text: 'Opportunities to place in top MNCs and growth-stage companies across the globe' },
]

export default function PlacementProjectsSection() {
  return (
    <>
      {/* ── Hands-on Placement Projects ── */}
      <section style={{ background: '#fff', padding: '80px 0 88px', borderTop: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <span style={{ display: 'inline-block', fontSize: 12, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#0369A1', background: '#EFF6FF', border: '1px solid #BFDBFE', padding: '4px 14px', borderRadius: 50, marginBottom: 14 }}>
              Real-World Practice
            </span>
            <h2 style={{ fontSize: 'clamp(24px,4vw,34px)', fontWeight: 800, color: '#0F172A', margin: '0 0 14px', lineHeight: 1.2 }}>
              Hands-on Real Time Placement Projects
            </h2>
            <div style={{ width: 48, height: 4, background: 'linear-gradient(90deg,#0369A1,#0EA5E9)', borderRadius: 2, margin: '0 auto 16px' }} />
            <p style={{ fontSize: 15, color: '#64748B', maxWidth: 540, margin: '0 auto', lineHeight: 1.7 }}>
              We conduct live mock exams and project assessments to prepare you for challenging real-world recruitment scenarios with confidence.
            </p>
          </div>

          {/* Two test cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, maxWidth: 860, margin: '0 auto' }} className="pps-grid">
            {TESTS.map((t) => (
              <div key={t.title} style={{ borderRadius: 18, border: `1.5px solid ${t.border}`, background: 'white', overflow: 'hidden', boxShadow: '0 4px 24px rgba(15,23,42,0.07)' }}>
                {/* Top accent */}
                <div style={{ height: 4, background: `linear-gradient(90deg,${t.color},${t.color}80)` }} />
                <div style={{ padding: '28px 28px 32px' }}>
                  {/* Badge */}
                  <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 800, color: 'white', background: t.color, padding: '4px 14px', borderRadius: 50, marginBottom: 16, letterSpacing: '.05em' }}>
                    {t.badge}
                  </span>
                  {/* Icon + title */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 14, background: t.bg, border: `1.5px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                      {t.badge === 'Test 1' ? '🎯' : '📊'}
                    </div>
                    <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', margin: 0, lineHeight: 1.2 }}>{t.title}</h3>
                  </div>
                  <p style={{ fontSize: 14, color: '#64748B', lineHeight: 1.7, margin: '0 0 20px' }}>{t.desc}</p>
                  {/* Skill chips */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {t.skills.map(s => (
                      <span key={s} style={{ fontSize: 11, fontWeight: 700, color: t.color, background: t.bg, border: `1px solid ${t.border}`, padding: '4px 12px', borderRadius: 50 }}>{s}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Top Hiring Partners ── */}
      <section style={{ background: '#F8FAFC', padding: '80px 0 88px', borderTop: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <span style={{ display: 'inline-block', fontSize: 12, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#059669', background: '#F0FDF4', border: '1px solid #BBF7D0', padding: '4px 14px', borderRadius: 50, marginBottom: 14 }}>
              Placement Network
            </span>
            <h2 style={{ fontSize: 'clamp(24px,4vw,34px)', fontWeight: 800, color: '#0F172A', margin: '0 0 14px', lineHeight: 1.2 }}>
              Our Top Hiring Partners for Placements
            </h2>
            <div style={{ width: 48, height: 4, background: 'linear-gradient(90deg,#059669,#10B981)', borderRadius: 2, margin: '0 auto 16px' }} />
            <p style={{ fontSize: 15, color: '#64748B', maxWidth: 580, margin: '0 auto', lineHeight: 1.7 }}>
              Recruitment Institute offers placement opportunities to every graduate through our strong network of hiring partners — from product startups to Fortune 500 MNCs.
            </p>
          </div>

          {/* Main 2-col layout */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'start' }} className="pps-grid">

            {/* Left — benefits list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {BENEFITS.map((b) => (
                <div key={b.text} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '16px 18px', borderRadius: 14, background: 'white', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(15,23,42,0.04)' }} className="pps-benefit">
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: '#F0FDF4', border: '1px solid #BBF7D0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                    {b.icon}
                  </div>
                  <p style={{ fontSize: 14, color: '#334155', margin: 0, lineHeight: 1.65, paddingTop: 2 }}>{b.text}</p>
                </div>
              ))}
            </div>

            {/* Right — company grid + CTA */}
            <div>
              <div style={{ background: 'white', borderRadius: 18, border: '1px solid #E2E8F0', padding: '28px', boxShadow: '0 4px 24px rgba(15,23,42,0.07)', marginBottom: 20 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 18 }}>Companies Hiring Our Graduates</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  {PARTNERS.map(p => (
                    <span key={p} style={{ fontSize: 12, fontWeight: 700, color: '#334155', background: '#F8FAFC', border: '1.5px solid #E2E8F0', padding: '7px 16px', borderRadius: 8 }}>{p}</span>
                  ))}
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#059669', background: '#F0FDF4', border: '1.5px solid #BBF7D0', padding: '7px 16px', borderRadius: 8 }}>+500 more</span>
                </div>
              </div>

              {/* Stat strip */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                {[
                  { value: '95%', label: 'Placement\nSupport Rate' },
                  { value: '500+', label: 'Hiring\nPartners' },
                  { value: '60days', label: 'Avg. Job\nTimeline' },
                ].map(s => (
                  <div key={s.label} style={{ borderRadius: 14, background: 'white', border: '1px solid #E2E8F0', padding: '18px 14px', textAlign: 'center', boxShadow: '0 2px 8px rgba(15,23,42,0.04)' }}>
                    <p style={{ fontSize: 22, fontWeight: 900, color: '#059669', margin: '0 0 4px', lineHeight: 1 }}>{s.value}</p>
                    <p style={{ fontSize: 10, color: '#64748B', margin: 0, fontWeight: 600, lineHeight: 1.4, whiteSpace: 'pre-line' }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <style>{`
          @media (max-width: 768px) {
            .pps-grid { grid-template-columns: 1fr !important; }
          }
          .pps-benefit:hover { border-color: #BBF7D0 !important; background: #F0FDF4 !important; }
        `}</style>
      </section>
    </>
  )
}

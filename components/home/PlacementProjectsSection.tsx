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
      <section className="pps-section-white">
        <div className="container">

          <div className="pps-header">
            <span className="pps-eyebrow-blue">Real-World Practice</span>
            <h2 className="pps-heading">Hands-on Real Time Placement Projects</h2>
            <div className="pps-divider-blue" />
            <p className="pps-desc">
              We conduct live mock exams and project assessments to prepare you for challenging real-world recruitment scenarios with confidence.
            </p>
          </div>

          <div className="pps-grid">
            {TESTS.map((t) => (
              <div
                key={t.title}
                className="pps-test-card"
                style={{ border: `1.5px solid ${t.border}` }}
              >
                <div className="pps-test-card-bar" style={{ background: `linear-gradient(90deg,${t.color},${t.color}80)` }} />
                <div className="pps-test-card-body">
                  <span className="pps-test-badge" style={{ background: t.color }}>
                    {t.badge}
                  </span>
                  <div className="pps-test-icon-row">
                    <div className="pps-test-icon" style={{ background: t.bg, border: `1.5px solid ${t.border}` }}>
                      {t.badge === 'Test 1' ? '🎯' : '📊'}
                    </div>
                    <h3 className="pps-test-title">{t.title}</h3>
                  </div>
                  <p className="pps-test-desc">{t.desc}</p>
                  <div className="pps-skill-chips">
                    {t.skills.map(s => (
                      <span
                        key={s}
                        className="pps-skill-chip"
                        style={{ color: t.color, background: t.bg, border: `1px solid ${t.border}` }}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Top Hiring Partners ── */}
      <section className="pps-section-grey">
        <div className="container">

          <div className="pps-header">
            <span className="pps-eyebrow-green">Placement Network</span>
            <h2 className="pps-heading">Our Top Hiring Partners for Placements</h2>
            <div className="pps-divider-green" />
            <p className="pps-desc-green">
              Recruitment Institute offers placement opportunities to every graduate through our strong network of hiring partners — from product startups to Fortune 500 MNCs.
            </p>
          </div>

          <div className="pps-partners-grid">

            {/* Left — benefits list */}
            <div className="pps-benefits-list">
              {BENEFITS.map((b) => (
                <div key={b.text} className="pps-benefit">
                  <div className="pps-benefit-icon">{b.icon}</div>
                  <p className="pps-benefit-text">{b.text}</p>
                </div>
              ))}
            </div>

            {/* Right — company grid + CTA */}
            <div>
              <div className="pps-partners-box">
                <p className="pps-partners-label">Companies Hiring Our Graduates</p>
                <div className="pps-partners-chips">
                  {PARTNERS.map(p => (
                    <span key={p} className="pps-partner-chip">{p}</span>
                  ))}
                  <span className="pps-partner-chip pps-partner-chip--more">+500 more</span>
                </div>
              </div>

              <div className="pps-stats-strip">
                {[
                  { value: '95%',    label: 'Placement\nSupport Rate' },
                  { value: '500+',   label: 'Hiring\nPartners' },
                  { value: '60days', label: 'Avg. Job\nTimeline' },
                ].map(s => (
                  <div key={s.label} className="pps-stat">
                    <p className="pps-stat-value">{s.value}</p>
                    <p className="pps-stat-label">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  )
}

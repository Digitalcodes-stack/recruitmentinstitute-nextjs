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
    <section className="cs-section">
      <div className="container">

        <div className="cs-header">
          <span className="cs-eyebrow">After Course Completion</span>
          <h2 className="cs-heading">Career Support</h2>
          <div className="cs-divider" />
          <p className="cs-desc">
            We don&apos;t just train you — we help you land the job. Our placement support is active for{' '}
            <strong style={{ color: '#0F172A' }}>6 months</strong> after course completion.
          </p>
        </div>

        <div className="cs-card">
          <div className="cs-grid">

            {/* Left — photo */}
            <div className="cs-img-col">
              <Image
                src="/assets/images/about/home8/2.jpg"
                alt="Students celebrating placement success"
                fill
                style={{ objectFit: 'cover', opacity: 0.82 }}
              />
              <div className="cs-img-overlay" />

              <div className="cs-stat-badge">
                <div className="cs-stat-badge-icon">🏆</div>
                <div>
                  <p className="cs-stat-num">95%</p>
                  <p className="cs-stat-sub">Placement Support Rate</p>
                </div>
              </div>

              <div className="cs-badge2">
                <span className="cs-badge2-emoji">🏢</span>
                <div>
                  <p className="cs-badge2-num">500+</p>
                  <p className="cs-badge2-sub">Partner Companies</p>
                </div>
              </div>
            </div>

            {/* Right — grid of 6 items */}
            <div className="cs-items-grid">
              {ITEMS.map((item) => (
                <div key={item.title} className="cs-item">
                  <div className="cs-item-icon">{item.icon}</div>
                  <div>
                    <p className="cs-item-title">{item.title}</p>
                    <p className="cs-item-desc">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>

      </div>
    </section>
  )
}

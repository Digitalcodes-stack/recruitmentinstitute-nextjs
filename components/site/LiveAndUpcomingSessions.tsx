import Image from 'next/image'
import { Radio, Clock, Calendar, Video } from 'lucide-react'

export interface SessionListItem {
  id: number
  title: string
  sessionDate: string // ISO date
  startTime: string   // ISO datetime
  endTime: string     // ISO datetime
  isLive: boolean
  meetLink: string | null
  batchName: string
  courseTitle: string
  trainerName: string
  trainerImage: string | null
}

interface Props {
  sessions: SessionListItem[]
}

/** Server-rendered strip of real scheduled/live sessions — trainer, batch, and join link. */
export default function LiveAndUpcomingSessions({ sessions }: Props) {
  if (sessions.length === 0) return null

  return (
    <section style={{ background: '#FFFFFF', padding: '64px 0', borderTop: '1px solid #E2E8F0' }}>
      <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 20px' }}>
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 40px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '50px', background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', fontSize: '11px', fontWeight: 800, letterSpacing: '.14em', textTransform: 'uppercase', marginBottom: '16px' }}>
            <Radio style={{ width: '12px', height: '12px' }} />
            <span>Live &amp; Upcoming Sessions</span>
          </div>
          <h2 style={{ fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 900, color: '#0F172A', lineHeight: 1.2, letterSpacing: '-.03em', margin: '0 0 12px' }}>
            Real classes, real trainers, real schedule
          </h2>
          <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.7, margin: 0, fontWeight: 500 }}>
            A live look at what's happening across our active cohorts this week.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {sessions.map((s) => {
            const dateStr = new Date(s.sessionDate).toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short' })
            const startStr = new Date(s.startTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
            const endStr = new Date(s.endTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })

            return (
              <div
                key={s.id}
                style={{
                  background: s.isLive ? '#FEF2F2' : '#F8FAFC',
                  border: `1px solid ${s.isLive ? '#FECACA' : '#E2E8F0'}`,
                  borderRadius: '20px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '50px',
                      fontSize: '10.5px', fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase',
                      background: s.isLive ? '#DC2626' : '#EFF6FF', color: s.isLive ? '#FFFFFF' : '#1D4ED8',
                      border: s.isLive ? 'none' : '1px solid #BFDBFE',
                    }}
                  >
                    {s.isLive && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fff', display: 'inline-block' }} />}
                    {s.isLive ? 'Live Now' : 'Upcoming'}
                  </span>
                  <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600 }}>{dateStr}</span>
                </div>

                <div>
                  <h3 style={{ fontSize: '14.5px', fontWeight: 800, color: '#0F172A', lineHeight: 1.35, margin: '0 0 4px' }}>{s.title}</h3>
                  <p style={{ fontSize: '12px', color: '#64748B', fontWeight: 600, margin: 0 }}>{s.courseTitle} · {s.batchName}</p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#475569', fontWeight: 600 }}>
                  <Clock style={{ width: '13px', height: '13px', color: '#94A3B8' }} />
                  <span>{startStr} – {endStr} IST</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '10px', borderTop: '1px solid rgba(15,23,42,0.06)' }}>
                  {s.trainerImage ? (
                    <div style={{ position: 'relative', width: '32px', height: '32px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: '1px solid #CBD5E1' }}>
                      <Image src={s.trainerImage} alt={s.trainerName} fill style={{ objectFit: 'cover', objectPosition: 'top' }} />
                    </div>
                  ) : (
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: '#0F172A', flexShrink: 0 }}>
                      {s.trainerName[0]}
                    </div>
                  )}
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <span style={{ fontSize: '9.5px', textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 800, color: '#94A3B8', display: 'block', lineHeight: 1, marginBottom: '2px' }}>Trainer</span>
                    <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#0F172A', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.trainerName}</span>
                  </div>

                  {s.isLive && s.meetLink && (
                    <a
                      href={s.meetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '7px 12px', borderRadius: '10px', background: '#DC2626', color: '#fff', fontSize: '11.5px', fontWeight: 800, textDecoration: 'none', flexShrink: 0 }}
                    >
                      <Video style={{ width: '12px', height: '12px' }} />
                      Join
                    </a>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

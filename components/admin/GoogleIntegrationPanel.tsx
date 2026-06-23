'use client'

import { useCallback, useState, type ComponentType } from 'react'
import { RefreshCw, RotateCcw, ShieldCheck, CalendarRange, Clock3, Bot } from 'lucide-react'

type GoogleStatus = {
  config: {
    serviceAccountConfigured: boolean
    impersonateEmail: string | null
    timeZone: string
    calendarScopes: string[]
  }
  stats: {
    totalSessions: number
    syncedSessions: number
    pendingSessions: number
    failedSessions: number
  }
  recentFailedJobs: Array<{
    id: number
    attempts: number
    error: string | null
    runAfter: string
    updatedAt: string
    payload: unknown
  }>
}

type JobStatus = {
  stats: {
    pending: number
    processing: number
    failed: number
    completed: number
  }
  recent: Array<{
    id: number
    type: string
    status: string
    attempts: number
    error: string | null
    runAfter: string
    updatedAt: string
    payload: unknown
  }>
}

const C = {
  white:      '#ffffff',
  border:     '#e6eaf0',
  borderSoft: '#f0f3f7',
  text:       '#0f172a',
  textMid:    '#475569',
  textSoft:   '#94a3b8',
  shadow:     '0 1px 4px rgba(15,23,42,0.07)',
  radius:     16,
  radiusSm:   10,
}

export default function GoogleIntegrationPanel({
  initialGoogleStatus,
  initialJobStatus,
}: {
  initialGoogleStatus: GoogleStatus | null
  initialJobStatus: JobStatus | null
}) {
  const [googleStatus, setGoogleStatus] = useState<GoogleStatus | null>(initialGoogleStatus)
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(initialJobStatus)
  const [loading, setLoading] = useState(false)
  const [busyJobId, setBusyJobId] = useState<number | null>(null)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [googleRes, jobsRes] = await Promise.all([fetch('/api/admin/integrations/google'), fetch('/api/admin/jobs')])
      const googleJson = await googleRes.json()
      const jobsJson = await jobsRes.json()
      if (!googleRes.ok) throw new Error(googleJson.message || 'Failed to load Google integration status')
      if (!jobsRes.ok) throw new Error(jobsJson.message || 'Failed to load job queue status')
      setGoogleStatus(googleJson.data)
      setJobStatus(jobsJson.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }, [])

  const retryJob = useCallback(
    async (id: number) => {
      setBusyJobId(id)
      setError('')
      try {
        const res = await fetch(`/api/admin/jobs/${id}/retry`, { method: 'POST' })
        const json = await res.json()
        if (!res.ok) throw new Error(json.message || 'Could not retry job')
        await load()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not retry job')
      } finally {
        setBusyJobId(null)
      }
    },
    [load]
  )

  return (
    <div style={{
      borderRadius: C.radius, background: C.white,
      border: `1px solid ${C.border}`, boxShadow: C.shadow,
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between',
        gap: 16, padding: '24px 28px', borderBottom: `1px solid ${C.borderSoft}`,
        background: '#0c1a2e',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12, flexShrink: 0,
            background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <ShieldCheck size={19} color="#ffffff" />
          </div>
          <div>
            <p style={{ fontSize: 16, fontWeight: 800, color: '#ffffff', lineHeight: 1.3 }}>Google Meet Automation</p>
            <p style={{ fontSize: 12.5, color: '#94b8d8', marginTop: 4 }}>Calendar sync, Meet generation, invitations, and reminders at a glance.</p>
          </div>
        </div>

        <button
          onClick={load}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            borderRadius: 24, border: '1px solid rgba(255,255,255,0.15)',
            background: 'rgba(255,255,255,0.08)', color: '#ffffff',
            padding: '9px 18px', fontSize: 13, fontWeight: 600,
            cursor: 'pointer', flexShrink: 0,
          }}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {error && (
        <div style={{ margin: '20px 28px 0', borderRadius: C.radiusSm, border: '1px solid #fecaca', background: '#fef2f2', padding: '12px 16px', fontSize: 13, color: '#b91c1c' }}>
          {error}
        </div>
      )}
      {loading && (
        <div style={{ margin: '20px 28px 0', borderRadius: C.radiusSm, border: '1px solid #bae6fd', background: '#f0f9ff', padding: '12px 16px', fontSize: 13, color: '#0369a1' }}>
          Refreshing integration status...
        </div>
      )}

      {/* Config row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14, padding: '24px 28px' }}>
        <StatCard
          icon={ShieldCheck}
          label="Service Account"
          value={googleStatus?.config.serviceAccountConfigured ? 'Configured' : 'Missing'}
          tone={googleStatus?.config.serviceAccountConfigured ? 'good' : 'warn'}
        />
        <StatCard icon={CalendarRange} label="Calendar Scope" value={googleStatus?.config.calendarScopes?.[0] ?? 'N/A'} />
        <StatCard icon={Clock3} label="Timezone" value={googleStatus?.config.timeZone ?? 'N/A'} />
        <StatCard icon={Bot} label="Impersonation" value={googleStatus?.config.impersonateEmail ?? 'Not set'} />
      </div>

      {/* Session metrics */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14,
        padding: '20px 28px', borderTop: `1px solid ${C.borderSoft}`, background: '#fafbfd',
      }}>
        <Metric label="Total Sessions" value={googleStatus?.stats.totalSessions ?? 0} />
        <Metric label="Synced" value={googleStatus?.stats.syncedSessions ?? 0} />
        <Metric label="Pending" value={googleStatus?.stats.pendingSessions ?? 0} />
        <Metric label="Failed" value={googleStatus?.stats.failedSessions ?? 0} danger />
      </div>

      {/* Queue health */}
      <div style={{ padding: '24px 28px 0', display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12, flexShrink: 0,
          background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Clock3 size={17} color="#b45309" />
        </div>
        <div>
          <p style={{ fontSize: 14.5, fontWeight: 700, color: C.text }}>Queue health overview</p>
          <p style={{ fontSize: 12.5, color: C.textSoft, marginTop: 2 }}>Retry failed Calendar and reminder jobs without leaving the settings page.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14, padding: '20px 28px 28px' }}>
        <Metric label="Pending" value={jobStatus?.stats.pending ?? 0} />
        <Metric label="Processing" value={jobStatus?.stats.processing ?? 0} />
        <Metric label="Failed" value={jobStatus?.stats.failed ?? 0} danger />
        <Metric label="Completed" value={jobStatus?.stats.completed ?? 0} />
      </div>

      {/* Recent jobs */}
      <div style={{ padding: '0 28px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: C.textMid }}>Recent jobs</p>
          <p style={{ fontSize: 12, color: C.textSoft }}>{jobStatus?.recent?.length ?? 0} shown</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {jobStatus?.recent?.length ? (
            jobStatus.recent.map((job) => {
              const isFailed = job.status === 'failed'
              return (
                <div
                  key={job.id}
                  style={{
                    borderRadius: C.radiusSm,
                    border: `1px solid ${isFailed ? '#fecdd3' : C.borderSoft}`,
                    background: '#fafbfd', padding: '16px 18px',
                  }}
                >
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
                        <p style={{ fontSize: 13.5, fontWeight: 700, color: C.text }}>{job.type}</p>
                        <span style={statusBadgeStyle(job.status)}>{job.status}</span>
                        <span style={{ fontSize: 11, color: C.textSoft }}>#{job.id}</span>
                      </div>
                      <p style={{ fontSize: 11.5, color: C.textSoft, marginTop: 5 }}>attempts {job.attempts} · scheduled {formatDateTime(job.runAfter)}</p>
                      {job.error && <p style={{ fontSize: 11.5, color: '#be123c', marginTop: 8, lineHeight: 1.6 }}>{job.error}</p>}
                    </div>

                    {isFailed && (
                      <button
                        onClick={() => retryJob(job.id)}
                        disabled={busyJobId === job.id}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 6,
                          borderRadius: 20, border: 'none', background: '#0f172a', color: '#ffffff',
                          padding: '8px 14px', fontSize: 11.5, fontWeight: 700,
                          cursor: busyJobId === job.id ? 'not-allowed' : 'pointer',
                          opacity: busyJobId === job.id ? 0.6 : 1, flexShrink: 0,
                        }}
                      >
                        <RotateCcw size={13} className={busyJobId === job.id ? 'animate-spin' : ''} />
                        {busyJobId === job.id ? 'Retrying' : 'Retry'}
                      </button>
                    )}
                  </div>
                </div>
              )
            })
          ) : (
            <div style={{ borderRadius: C.radiusSm, border: `1px dashed ${C.border}`, background: '#fafbfd', padding: '20px', fontSize: 13, color: C.textSoft, textAlign: 'center' }}>
              No recent jobs found.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: ComponentType<{ size?: number; color?: string }>
  label: string
  value: string
  tone?: 'good' | 'warn'
}) {
  return (
    <div style={{ borderRadius: C.radiusSm, border: `1px solid ${C.borderSoft}`, background: '#fafbfd', padding: '14px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10, flexShrink: 0,
          background: tone === 'warn' ? '#fffbeb' : '#f0f9ff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={16} color={tone === 'warn' ? '#b45309' : '#0369a1'} />
        </div>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.textSoft }}>{label}</p>
          <p style={{ fontSize: 13, fontWeight: 700, color: C.text, marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</p>
        </div>
      </div>
    </div>
  )
}

function Metric({ label, value, danger }: { label: string; value: number; danger?: boolean }) {
  return (
    <div style={{ borderRadius: C.radiusSm, border: `1px solid ${C.borderSoft}`, background: '#ffffff', padding: '16px 18px' }}>
      <p style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.textSoft }}>{label}</p>
      <p style={{ fontSize: 26, fontWeight: 900, letterSpacing: '-0.02em', color: danger && value > 0 ? '#e11d48' : C.text, marginTop: 6 }}>{value}</p>
    </div>
  )
}

function formatDateTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'now'
  return date.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

function statusBadgeStyle(status: string): React.CSSProperties {
  const base: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center',
    borderRadius: 20, padding: '3px 10px',
    fontSize: 10.5, fontWeight: 700,
  }
  if (status === 'failed') return { ...base, background: '#fff1f2', color: '#be123c' }
  if (status === 'completed') return { ...base, background: '#f0fdf4', color: '#15803d' }
  if (status === 'processing') return { ...base, background: '#fffbeb', color: '#b45309' }
  return { ...base, background: '#f1f5f9', color: '#475569' }
}

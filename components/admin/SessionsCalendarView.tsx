'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  CalendarDays, List, Video, ExternalLink, Users, Presentation,
  Clock, Search, CheckCircle2, ChevronRight, Layers3,
} from 'lucide-react'

interface SessionItem {
  id: number
  title: string
  description: string | null
  sessionDate: Date | string
  startTime: Date | string
  endTime: Date | string
  meetLink: string | null
  status: string
  batch: {
    id: number
    name: string
    course: { id: number; title: string }
    _count: { enrollments: number }
  }
  trainer: {
    id: number
    name: string
    image: string | null
    email: string
  }
}

export default function SessionsCalendarView({
  initialSessions,
  batches,
  trainers,
}: {
  initialSessions: SessionItem[]
  batches: Array<{ id: number; name: string }>
  trainers: Array<{ id: number; name: string }>
}) {
  const sessions = initialSessions
  const [viewMode, setViewMode] = useState<'list' | 'timeline'>('list')
  const [selectedBatch, setSelectedBatch] = useState<string>('all')
  const [selectedTrainer, setSelectedTrainer] = useState<string>('all')
  const [search, setSearch] = useState('')


  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      const matchBatch = selectedBatch === 'all' || s.batch.id === parseInt(selectedBatch)
      const matchTrainer = selectedTrainer === 'all' || s.trainer.id === parseInt(selectedTrainer)
      const matchSearch =
        s.title.toLowerCase().includes(search.toLowerCase()) ||
        s.batch.name.toLowerCase().includes(search.toLowerCase()) ||
        s.trainer.name.toLowerCase().includes(search.toLowerCase())

      return matchBatch && matchTrainer && matchSearch
    })
  }, [sessions, selectedBatch, selectedTrainer, search])

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 20,
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        overflow: 'hidden',
      }}
    >
      {/* View Switcher & Filter Toolbar */}
      <div
        style={{
          padding: '16px 24px',
          borderBottom: '1px solid #f1f5f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* Dual View Buttons */}
          <div style={{ display: 'inline-flex', padding: 3, background: '#f1f5f9', borderRadius: 8 }}>
            <button
              onClick={() => setViewMode('list')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '6px 12px',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: viewMode === 'list' ? 700 : 600,
                border: 'none',
                background: viewMode === 'list' ? '#ffffff' : 'transparent',
                color: viewMode === 'list' ? '#0f172a' : '#64748b',
                cursor: 'pointer',
                boxShadow: viewMode === 'list' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              <List style={{ width: 13, height: 13 }} />
              <span>List View</span>
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '6px 12px',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: viewMode === 'timeline' ? 700 : 600,
                border: 'none',
                background: viewMode === 'timeline' ? '#ffffff' : 'transparent',
                color: viewMode === 'timeline' ? '#0f172a' : '#64748b',
                cursor: 'pointer',
                boxShadow: viewMode === 'timeline' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              <CalendarDays style={{ width: 13, height: 13 }} />
              <span>Timeline Schedule</span>
            </button>
          </div>

          {/* Batch Selector */}
          <select
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            style={{
              padding: '6px 10px',
              borderRadius: 8,
              border: '1px solid #e2e8f0',
              fontSize: 12,
              color: '#334155',
              background: '#ffffff',
              outline: 'none',
            }}
          >
            <option value="all">All Batches</option>
            {batches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          {/* Trainer Selector */}
          <select
            value={selectedTrainer}
            onChange={(e) => setSelectedTrainer(e.target.value)}
            style={{
              padding: '6px 10px',
              borderRadius: 8,
              border: '1px solid #e2e8f0',
              fontSize: 12,
              color: '#334155',
              background: '#ffffff',
              outline: 'none',
            }}
          >
            <option value="all">All Trainers</option>
            {trainers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        {/* Search */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 8,
            padding: '0 12px',
            height: 36,
            minWidth: 220,
          }}
        >
          <Search style={{ width: 14, height: 14, color: '#94a3b8' }} />
          <input
            placeholder="Search class sessions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: 12.5,
              color: '#0f172a',
              width: '100%',
            }}
          />
        </div>
      </div>

      {/* Session List View */}
      {filteredSessions.length === 0 ? (
        <div style={{ padding: '64px 24px', textAlign: 'center', color: '#94a3b8' }}>
          <CalendarDays style={{ width: 36, height: 36, color: '#cbd5e1', margin: '0 auto 8px' }} />
          <p style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>No sessions found matching filters</p>
        </div>
      ) : viewMode === 'list' ? (
        <div>
          {/* Header row */}
          <div
            style={{
              padding: '12px 24px',
              background: '#f8fafc',
              borderBottom: '1px solid #f1f5f9',
              display: 'grid',
              gridTemplateColumns: '1.6fr 1.2fr 1.2fr 110px 140px',
              fontSize: 10,
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: '#64748b',
            }}
          >
            <span>Session & Date</span>
            <span>Batch & Course</span>
            <span>Faculty</span>
            <span>Status</span>
            <span style={{ textAlign: 'right' }}>Room & Attendance</span>
          </div>

          {/* Rows */}
          {filteredSessions.map((s, idx) => {
            const isLive = s.status === 'LIVE'
            const dateStr = new Date(s.sessionDate).toLocaleDateString('en-IN', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
            })
            const startTimeStr = new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            const endTimeStr = new Date(s.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

            return (
              <div
                key={s.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.6fr 1.2fr 1.2fr 110px 140px',
                  alignItems: 'center',
                  padding: '14px 24px',
                  borderBottom: idx < filteredSessions.length - 1 ? '1px solid #f8fafc' : 'none',
                }}
              >
                {/* Session title & time */}
                <div style={{ paddingRight: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <p style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                      {s.title}
                    </p>
                    {isLive && (
                      <span style={{ fontSize: 9, fontWeight: 800, padding: '1px 6px', borderRadius: 4, background: '#fee2e2', color: '#dc2626' }}>
                        LIVE
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: 11.5, color: '#64748b', margin: '3px 0 0' }}>
                    {dateStr} · {startTimeStr} – {endTimeStr}
                  </p>
                </div>

                {/* Batch & Course */}
                <div style={{ paddingRight: 16 }}>
                  <Link
                    href={`/admin/batches/${s.batch.id}`}
                    style={{ fontSize: 12.5, fontWeight: 700, color: '#2563eb', textDecoration: 'none' }}
                  >
                    {s.batch.name}
                  </Link>
                  <p style={{ fontSize: 11, color: '#64748b', margin: '2px 0 0' }}>
                    {s.batch.course.title} · {s.batch._count.enrollments} Students
                  </p>
                </div>

                {/* Faculty Trainer */}
                <div style={{ paddingRight: 16 }}>
                  <p style={{ fontSize: 12.5, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                    {s.trainer.name}
                  </p>
                  <span style={{ fontSize: 10.5, color: '#64748b' }}>Assigned Instructor</span>
                </div>

                {/* Status */}
                <div>
                  <span
                    style={{
                      fontSize: 10.5,
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: 6,
                      background: isLive ? '#fee2e2' : s.status === 'COMPLETED' ? '#f8fafc' : '#eff6ff',
                      color: isLive ? '#dc2626' : s.status === 'COMPLETED' ? '#64748b' : '#2563eb',
                      border: isLive ? '1px solid #fca5a5' : '1px solid #e2e8f0',
                    }}
                  >
                    {s.status}
                  </span>
                </div>

                {/* Action Trigger */}
                <div style={{ textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                  {s.meetLink ? (
                    <a
                      href={s.meetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '6px 12px',
                        borderRadius: 8,
                        fontSize: 11.5,
                        fontWeight: 700,
                        color: '#ffffff',
                        background: isLive ? '#dc2626' : '#2563eb',
                        textDecoration: 'none',
                      }}
                    >
                      <Video style={{ width: 12, height: 12 }} />
                      <span>{isLive ? 'Join Live' : 'Open Meet'}</span>
                    </a>
                  ) : (
                    <span style={{ fontSize: 11, color: '#94a3b8' }}>No link</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* Timeline View */
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filteredSessions.map((s) => (
            <div
              key={s.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 16,
                padding: '14px 18px',
                borderRadius: 12,
                border: '1px solid #f1f5f9',
                background: '#ffffff',
              }}
            >
              <div
                style={{
                  width: 52,
                  padding: '8px 4px',
                  borderRadius: 10,
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  textAlign: 'center',
                  flexShrink: 0,
                }}
              >
                <span style={{ fontSize: 14, fontWeight: 900, color: '#0f172a', display: 'block' }}>
                  {new Date(s.sessionDate).getDate()}
                </span>
                <span style={{ fontSize: 9.5, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  {new Date(s.sessionDate).toLocaleDateString([], { month: 'short' })}
                </span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h3 style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    {s.title}
                  </h3>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#2563eb' }}>
                    {new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p style={{ fontSize: 12, color: '#64748b', margin: '3px 0 0' }}>
                  Batch: <strong>{s.batch.name}</strong> · Faculty: <strong>{s.trainer.name}</strong>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import AdminLayout from './AdminLayout'
import {
  GraduationCap, Presentation, Layers3, BookOpen, Clock, IndianRupee,
  UserCheck, ClipboardCheck, Video, ExternalLink, ArrowUpRight, Plus,
  TrendingUp, Users, CalendarDays, CheckCircle2, AlertCircle, Sparkles,
  ChevronRight, RefreshCw, FileText, MessageSquare, ShieldAlert,
} from 'lucide-react'

interface StatsData {
  kpis: {
    totalStudents: number
    activeStudents: number
    totalTrainers: number
    activeTrainers: number
    totalBatches: number
    activeBatches: number
    totalCourses: number
    totalCategories: number
    pendingEnrollments: number
    totalEnrollments: number
    totalRevenue: number
    mtdRevenue: number
    avgAttendance: number
    pendingAssignmentReviews: number
  }
  upcomingSessions: Array<{
    id: number
    title: string
    sessionDate: string
    startTime: string
    endTime: string
    meetLink: string | null
    status: string
    batch: {
      id: number
      name: string
      course: { id: number; title: string }
      _count: { enrollments: number }
    }
    trainer: { id: number; name: string; image: string | null }
  }>
  recentActivity: {
    enrollments: Array<{
      id: number
      enrolledAt: string
      status: string
      student: { id: number; name: string; email: string; contact: string | null }
      batch: { id: number; name: string; course: { id: number; title: string } }
    }>
    submissions: Array<{
      id: number
      submittedAt: string
      student: { id: number; name: string; email: string }
      assignment: { id: number; title: string; batch: { id: number; name: string } }
    }>
    contacts: Array<{
      id: number
      name: string
      email: string
      message: string
      createdAt: string
    }>
  }
  batchTelemetry: Array<{
    id: number
    name: string
    startDate: string
    capacity: number
    status: string
    course: { id: number; title: string }
    trainer: { id: number; name: string } | null
    _count: { enrollments: number; sessions: number }
  }>
  topCourses: Array<{
    id: number
    title: string
    category: string
    categorySlug: string
    activeBatchesCount: number
    enrolledCount: number
  }>
}

function fmt(n: number) {
  return n ? n.toLocaleString('en-IN') : '0'
}

function timeAgo(dateString: string) {
  const m = Math.floor((Date.now() - new Date(dateString).getTime()) / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const days = Math.floor(h / 24)
  return days === 1 ? 'yesterday' : `${days}d ago`
}

export default function AdminDashboard() {
  const [data, setData] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchStats = async () => {
    try {
      setRefreshing(true)
      const res = await fetch('/api/admin/stats', { cache: 'no-store' })
      const json = await res.json()
      if (json.success) {
        setData(json.data)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  if (loading) {
    return (
      <AdminLayout title="Superadmin Dashboard">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              style={{
                height: 120,
                background: '#ffffff',
                borderRadius: 16,
                border: '1px solid #e2e8f0',
                animation: 'pulse 1.5s infinite',
              }}
            />
          ))}
        </div>
      </AdminLayout>
    )
  }

  const kpis = data?.kpis || {
    totalStudents: 0, activeStudents: 0, totalTrainers: 0, activeTrainers: 0,
    totalBatches: 0, activeBatches: 0, totalCourses: 0, totalCategories: 0,
    pendingEnrollments: 0, totalEnrollments: 0, totalRevenue: 0, mtdRevenue: 0,
    avgAttendance: 85, pendingAssignmentReviews: 0,
  }

  return (
    <AdminLayout title="Superadmin Dashboard">
      {/* ── Welcome Banner & Quick Action Header ─────────────────────────── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #090d16 0%, #1e293b 100%)',
          borderRadius: 20,
          padding: '28px 32px',
          color: '#ffffff',
          marginBottom: 28,
          boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.15)',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 20,
        }}
      >
        <div style={{ position: 'relative', zIndex: 2, maxWidth: 620 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 10px',
              borderRadius: 100,
              background: 'rgba(59, 130, 246, 0.2)',
              border: '1px solid rgba(96, 165, 250, 0.3)',
              color: '#93c5fd',
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: 10,
            }}
          >
            <Sparkles style={{ width: 12, height: 12 }} />
            <span>Institute Command Center</span>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1.2, margin: 0 }}>
            Welcome back, Super Administrator
          </h1>
          <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 6, lineHeight: 1.5 }}>
            Real-time telemetry across {kpis.totalStudents} students, {kpis.activeBatches} active batches, and {kpis.totalTrainers} faculty members.
          </p>
        </div>

        {/* Header Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, position: 'relative', zIndex: 2, flexWrap: 'wrap' }}>
          <button
            onClick={fetchStats}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '9px 15px',
              borderRadius: 10,
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#ffffff',
              fontSize: 12.5,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <RefreshCw style={{ width: 13, height: 13, animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
            <span>Refresh Telemetry</span>
          </button>
          <Link
            href="/admin/batches/new"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '9px 16px',
              borderRadius: 10,
              background: '#2563eb',
              color: '#ffffff',
              fontSize: 12.5,
              fontWeight: 700,
              textDecoration: 'none',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)',
            }}
          >
            <Plus style={{ width: 14, height: 14 }} />
            <span>Create Batch</span>
          </Link>
        </div>
      </div>

      {/* ── Top 8 KPI Metric Cards ───────────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 16,
          marginBottom: 28,
        }}
      >
        {/* 1. Total Students */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: 16,
            padding: '20px 22px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Total Students
            </span>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <GraduationCap style={{ width: 18, height: 18, color: '#2563eb' }} />
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontSize: 28, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>
                {fmt(kpis.totalStudents)}
              </span>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: '#16a34a' }}>
                {kpis.activeStudents} Active
              </span>
            </div>
            <Link href="/admin/students" style={{ fontSize: 11.5, fontWeight: 600, color: '#2563eb', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 3, marginTop: 8 }}>
              Explore Roster <ArrowUpRight style={{ width: 11, height: 11 }} />
            </Link>
          </div>
        </div>

        {/* 2. Active Trainers */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: 16,
            padding: '20px 22px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Active Faculty
            </span>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Presentation style={{ width: 18, height: 18, color: '#7c3aed' }} />
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontSize: 28, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>
                {fmt(kpis.totalTrainers)}
              </span>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: '#7c3aed' }}>
                {kpis.activeTrainers} Assigned
              </span>
            </div>
            <Link href="/admin/trainers" style={{ fontSize: 11.5, fontWeight: 600, color: '#7c3aed', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 3, marginTop: 8 }}>
              View Faculty <ArrowUpRight style={{ width: 11, height: 11 }} />
            </Link>
          </div>
        </div>

        {/* 3. Live Batches */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: 16,
            padding: '20px 22px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Live Batches
            </span>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Layers3 style={{ width: 18, height: 18, color: '#059669' }} />
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontSize: 28, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>
                {fmt(kpis.activeBatches)}
              </span>
              <span style={{ fontSize: 11.5, fontWeight: 600, color: '#64748b' }}>
                of {kpis.totalBatches} Total
              </span>
            </div>
            <Link href="/admin/batches" style={{ fontSize: 11.5, fontWeight: 600, color: '#059669', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 3, marginTop: 8 }}>
              Manage Batches <ArrowUpRight style={{ width: 11, height: 11 }} />
            </Link>
          </div>
        </div>

        {/* 4. Total Courses */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: 16,
            padding: '20px 22px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Course Offerings
            </span>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: '#ecfeff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BookOpen style={{ width: 18, height: 18, color: '#0891b2' }} />
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontSize: 28, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>
                {fmt(kpis.totalCourses)}
              </span>
              <span style={{ fontSize: 11.5, fontWeight: 600, color: '#64748b' }}>
                in {kpis.totalCategories} Categories
              </span>
            </div>
            <Link href="/admin/courses" style={{ fontSize: 11.5, fontWeight: 600, color: '#0891b2', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 3, marginTop: 8 }}>
              Course Catalog <ArrowUpRight style={{ width: 11, height: 11 }} />
            </Link>
          </div>
        </div>

        {/* 5. Pending Enrollments */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: 16,
            padding: '20px 22px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Pending Approvals
            </span>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock style={{ width: 18, height: 18, color: '#d97706' }} />
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontSize: 28, fontWeight: 900, color: kpis.pendingEnrollments > 0 ? '#d97706' : '#0f172a', letterSpacing: '-0.02em' }}>
                {fmt(kpis.pendingEnrollments)}
              </span>
              <span style={{ fontSize: 11.5, fontWeight: 600, color: '#64748b' }}>
                Awaiting Allocation
              </span>
            </div>
            <Link href="/admin/enrollments" style={{ fontSize: 11.5, fontWeight: 600, color: '#d97706', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 3, marginTop: 8 }}>
              Review Queue <ArrowUpRight style={{ width: 11, height: 11 }} />
            </Link>
          </div>
        </div>

        {/* 6. Revenue Telemetry */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: 16,
            padding: '20px 22px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Fee Collection
            </span>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IndianRupee style={{ width: 18, height: 18, color: '#16a34a' }} />
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{ fontSize: 24, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>
                ₹{fmt(kpis.totalRevenue)}
              </span>
            </div>
            <p style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
              MTD: <strong style={{ color: '#16a34a' }}>₹{fmt(kpis.mtdRevenue)}</strong>
            </p>
            <Link href="/admin/finance" style={{ fontSize: 11.5, fontWeight: 600, color: '#16a34a', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 3, marginTop: 6 }}>
              Finance Hub <ArrowUpRight style={{ width: 11, height: 11 }} />
            </Link>
          </div>
        </div>

        {/* 7. Average Attendance */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: 16,
            padding: '20px 22px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Avg Attendance
            </span>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UserCheck style={{ width: 18, height: 18, color: '#3b82f6' }} />
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontSize: 28, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>
                {kpis.avgAttendance}%
              </span>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#16a34a' }}>
                Good Health
              </span>
            </div>
            <Link href="/admin/sessions" style={{ fontSize: 11.5, fontWeight: 600, color: '#3b82f6', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 3, marginTop: 8 }}>
              Session Logs <ArrowUpRight style={{ width: 11, height: 11 }} />
            </Link>
          </div>
        </div>

        {/* 8. Pending Assignment Reviews */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: 16,
            padding: '20px 22px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Pending Homework
            </span>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: '#fdf4ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ClipboardCheck style={{ width: 18, height: 18, color: '#c026d3' }} />
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontSize: 28, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>
                {fmt(kpis.pendingAssignmentReviews)}
              </span>
              <span style={{ fontSize: 11.5, fontWeight: 600, color: '#64748b' }}>
                To Evaluate
              </span>
            </div>
            <Link href="/admin/assignments" style={{ fontSize: 11.5, fontWeight: 600, color: '#c026d3', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 3, marginTop: 8 }}>
              Grading Queue <ArrowUpRight style={{ width: 11, height: 11 }} />
            </Link>
          </div>
        </div>
      </div>

      {/* ── Main Two-Column Layout ────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.8fr) minmax(0, 1.2fr)', gap: 24, alignItems: 'start' }}>

        {/* LEFT COLUMN: Live Sessions & Batch Performance */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Section: Live & Upcoming Class Sessions */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: 20,
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid #f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Video style={{ width: 16, height: 16, color: '#2563eb' }} />
                </div>
                <div>
                  <h2 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Live & Upcoming Class Schedule
                  </h2>
                  <p style={{ fontSize: 11.5, color: '#64748b', marginTop: 2, margin: 0 }}>
                    Institute-wide scheduled sessions with real-time room launch
                  </p>
                </div>
              </div>
              <Link
                href="/admin/sessions"
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#2563eb',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                Full Calendar <ChevronRight style={{ width: 13, height: 13 }} />
              </Link>
            </div>

            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {data?.upcomingSessions && data.upcomingSessions.length > 0 ? (
                data.upcomingSessions.map((session) => {
                  const isLive = session.status === 'LIVE'
                  const startTimeStr = new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  const endTimeStr = new Date(session.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

                  return (
                    <div
                      key={session.id}
                      style={{
                        padding: '16px 18px',
                        borderRadius: 14,
                        border: isLive ? '1.5px solid #bfdbfe' : '1px solid #f1f5f9',
                        background: isLive ? '#f8faff' : '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: 12,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 260 }}>
                        <div
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: 10,
                            background: isLive ? '#dc2626' : '#eff6ff',
                            color: isLive ? '#ffffff' : '#2563eb',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: 11,
                            lineHeight: 1.1,
                          }}
                        >
                          <span>{startTimeStr}</span>
                          <span style={{ fontSize: 9, opacity: 0.8 }}>Start</span>
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <p style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                              {session.title}
                            </p>
                            {isLive && (
                              <span style={{ fontSize: 9.5, fontWeight: 800, padding: '2px 7px', borderRadius: 100, background: '#fee2e2', color: '#dc2626' }}>
                                LIVE NOW
                              </span>
                            )}
                          </div>
                          <p style={{ fontSize: 11.5, color: '#64748b', marginTop: 3, margin: 0 }}>
                            Batch: <strong>{session.batch.name}</strong> · Faculty: <strong>{session.trainer.name}</strong> · {session.batch._count.enrollments} Students
                          </p>
                        </div>
                      </div>

                      {/* Action Triggers */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {session.meetLink && (
                          <a
                            href={session.meetLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 5,
                              padding: '7px 14px',
                              borderRadius: 8,
                              fontSize: 12,
                              fontWeight: 700,
                              color: '#ffffff',
                              background: isLive ? '#dc2626' : '#2563eb',
                              textDecoration: 'none',
                              boxShadow: '0 2px 6px rgba(37,99,235,0.2)',
                            }}
                          >
                            <Video style={{ width: 13, height: 13 }} />
                            <span>{isLive ? 'Join Live Room' : 'Open Meet'}</span>
                            <ExternalLink style={{ width: 11, height: 11 }} />
                          </a>
                        )}
                        <Link
                          href={`/admin/batches/${session.batch.id}`}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            padding: '7px 12px',
                            borderRadius: 8,
                            fontSize: 12,
                            fontWeight: 600,
                            color: '#475569',
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            textDecoration: 'none',
                          }}
                        >
                          <span>Roster</span>
                        </Link>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div style={{ padding: '36px 20px', textAlign: 'center', color: '#94a3b8' }}>
                  <CalendarDays style={{ width: 32, height: 32, color: '#cbd5e1', margin: '0 auto 8px' }} />
                  <p style={{ fontSize: 13, fontWeight: 600, margin: 0 }}>No sessions scheduled for today</p>
                  <p style={{ fontSize: 11.5, marginTop: 4, margin: 0 }}>Use the sessions manager to schedule upcoming classes.</p>
                </div>
              )}
            </div>
          </div>

          {/* Section: Batch Capacity Telemetry & Health */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: 20,
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid #f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Layers3 style={{ width: 16, height: 16, color: '#16a34a' }} />
                </div>
                <div>
                  <h2 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Active Batch Capacity & Telemetry
                  </h2>
                  <p style={{ fontSize: 11.5, color: '#64748b', marginTop: 2, margin: 0 }}>
                    Roster fullness, assigned faculty, and total sessions completed
                  </p>
                </div>
              </div>
              <Link
                href="/admin/batches"
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#16a34a',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                All Batches <ChevronRight style={{ width: 13, height: 13 }} />
              </Link>
            </div>

            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {data?.batchTelemetry && data.batchTelemetry.length > 0 ? (
                data.batchTelemetry.map((b) => {
                  const max = b.capacity || 30
                  const enrolled = b._count.enrollments
                  const pct = Math.min(100, Math.round((enrolled / max) * 100))

                  return (
                    <div
                      key={b.id}
                      style={{
                        padding: '14px 18px',
                        borderRadius: 12,
                        border: '1px solid #f1f5f9',
                        background: '#ffffff',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Link
                              href={`/admin/batches/${b.id}`}
                              style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a', textDecoration: 'none' }}
                            >
                              {b.name}
                            </Link>
                            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 100, background: '#eff6ff', color: '#2563eb' }}>
                              {b.course.title}
                            </span>
                          </div>
                          <p style={{ fontSize: 11.5, color: '#64748b', marginTop: 2, margin: 0 }}>
                            Trainer: <strong>{b.trainer?.name || 'Unassigned'}</strong> · {b._count.sessions} Sessions Conducted
                          </p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>
                            {enrolled} / {max} seats
                          </span>
                          <span style={{ fontSize: 11, color: '#64748b', marginLeft: 6 }}>
                            ({pct}%)
                          </span>
                        </div>
                      </div>

                      {/* Capacity Meter Progress Bar */}
                      <div style={{ width: '100%', height: 6, borderRadius: 10, background: '#f1f5f9', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${pct}%`,
                            height: '100%',
                            background: pct >= 90 ? '#ef4444' : pct >= 60 ? '#3b82f6' : '#22c55e',
                            borderRadius: 10,
                            transition: 'width 0.3s ease',
                          }}
                        />
                      </div>
                    </div>
                  )
                })
              ) : (
                <div style={{ padding: '28px 20px', textAlign: 'center', color: '#94a3b8' }}>
                  No active batches recorded.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Recent Student Activity & Top Courses */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Section: Live Student Activity Feed */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: 20,
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid #f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: '#ecfeff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <TrendingUp style={{ width: 16, height: 16, color: '#0891b2' }} />
                </div>
                <div>
                  <h2 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Recent Student Activity
                  </h2>
                  <p style={{ fontSize: 11.5, color: '#64748b', marginTop: 2, margin: 0 }}>
                    Live stream of student enrollments & submissions
                  </p>
                </div>
              </div>
            </div>

            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {data?.recentActivity?.enrollments && data.recentActivity.enrollments.length > 0 ? (
                data.recentActivity.enrollments.map((enr) => (
                  <div
                    key={enr.id}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 12,
                      padding: '10px 12px',
                      borderRadius: 10,
                      background: '#f8fafc',
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: '#eff6ff',
                        color: '#2563eb',
                        fontSize: 11,
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        marginTop: 2,
                      }}
                    >
                      {enr.student.name[0]?.toUpperCase() || 'S'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <p style={{ fontSize: 12.5, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                          {enr.student.name}
                        </p>
                        <span style={{ fontSize: 10, color: '#94a3b8' }}>
                          {timeAgo(enr.enrolledAt)}
                        </span>
                      </div>
                      <p style={{ fontSize: 11, color: '#64748b', margin: '2px 0 0' }}>
                        Enrolled in <strong>{enr.batch.name}</strong> ({enr.batch.course.title})
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                        <span style={{ fontSize: 9.5, fontWeight: 700, padding: '1px 6px', borderRadius: 4, background: '#e0f2fe', color: '#0369a1' }}>
                          {enr.status}
                        </span>
                        <Link
                          href={`/admin/students`}
                          style={{ fontSize: 10.5, fontWeight: 600, color: '#2563eb', textDecoration: 'none' }}
                        >
                          View Student Profile →
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ padding: '24px 16px', textAlign: 'center', color: '#94a3b8' }}>
                  No recent enrollment activity.
                </div>
              )}
            </div>
          </div>

          {/* Section: Top Performing Courses */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: 20,
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid #f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: '#fdf4ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BookOpen style={{ width: 16, height: 16, color: '#c026d3' }} />
                </div>
                <div>
                  <h2 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Popular Course Programs
                  </h2>
                  <p style={{ fontSize: 11.5, color: '#64748b', marginTop: 2, margin: 0 }}>
                    Enrollment demand and active cohorts per course
                  </p>
                </div>
              </div>
              <Link
                href="/admin/courses"
                style={{ fontSize: 12, fontWeight: 700, color: '#c026d3', textDecoration: 'none' }}
              >
                All Courses →
              </Link>
            </div>

            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {data?.topCourses && data.topCourses.length > 0 ? (
                data.topCourses.map((c, idx) => (
                  <div
                    key={c.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      borderRadius: 10,
                      background: '#f8fafc',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 800,
                          color: '#64748b',
                          width: 20,
                        }}
                      >
                        #{idx + 1}
                      </span>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                          {c.title}
                        </p>
                        <span style={{ fontSize: 10.5, color: '#64748b' }}>
                          Category: {c.category} · {c.activeBatchesCount} Active Cohorts
                        </span>
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: 11.5,
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: 6,
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        color: '#0f172a',
                      }}
                    >
                      {c.enrolledCount} Enrolled
                    </span>
                  </div>
                ))
              ) : (
                <div style={{ padding: '20px 16px', textAlign: 'center', color: '#94a3b8' }}>
                  No courses recorded yet.
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </AdminLayout>
  )
}

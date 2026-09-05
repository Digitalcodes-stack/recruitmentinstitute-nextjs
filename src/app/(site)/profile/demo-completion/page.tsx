'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Award, ArrowLeft, CheckCircle2, Play, Sparkles, User, BookOpen, Calendar } from 'lucide-react'
import SessionCompletionModal from '@/components/shared/SessionCompletionModal'

export default function StudentCompletionDemoPage() {
  const [isModalOpen, setIsModalOpen] = useState(true)
  const [selectedStudent, setSelectedStudent] = useState({
    name: 'Priya Sharma',
    email: 'priya.sharma@gmail.com',
    role: 'HR Trainee / Student',
    course: 'End-to-End Recruitment Training & Certification',
    session: 'Module 3: Advanced AI Boolean Search & Candidate Sourcing',
    progress: '75%',
  })

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', padding: '40px 20px 80px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {/* Navigation Breadcrumb */}
        <Link
          href="/profile"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: '#64748B',
            fontSize: '13px',
            fontWeight: 600,
            textDecoration: 'none',
            marginBottom: '24px',
          }}
        >
          <ArrowLeft style={{ width: '15px', height: '15px' }} />
          <span>Back to Student Dashboard</span>
        </Link>

        {/* Page Header */}
        <div style={{ background: '#FFFFFF', borderRadius: '24px', padding: '32px', border: '1px solid #E2E8F0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', marginBottom: '24px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '50px', background: '#EFF6FF', color: '#1D4ED8', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
            <Sparkles style={{ width: '13px', height: '13px' }} />
            <span>Interactive UI Showcase</span>
          </div>

          <h1 style={{ fontSize: '26px', fontWeight: 900, color: '#0F172A', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
            Session Completion Celebration Modal
          </h1>
          <p style={{ fontSize: '14px', color: '#64748B', margin: '0 0 24px', lineHeight: 1.6 }}>
            Demonstrating the corporate e-learning completion experience for enrolled students upon successfully completing live and self-paced sessions.
          </p>

          {/* Student Card */}
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#0A1628', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '16px' }}>
                  PS
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                    {selectedStudent.name}
                  </h3>
                  <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 0' }}>
                    {selectedStudent.email} • {selectedStudent.role}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setIsModalOpen(true)}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '10px',
                    background: '#0A1628',
                    color: '#FFFFFF',
                    fontSize: '13px',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 10px rgba(10, 22, 40, 0.2)',
                  }}
                >
                  <Play style={{ width: '14px', height: '14px' }} />
                  <span>Launch Session Modal</span>
                </button>

                <Link
                  href="/profile/certificate"
                  style={{
                    padding: '10px 18px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                    color: '#FFFFFF',
                    fontSize: '13px',
                    fontWeight: 700,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 10px rgba(5, 150, 105, 0.2)',
                  }}
                >
                  <Award style={{ width: '15px', height: '15px' }} />
                  <span>View Course Certificate</span>
                </Link>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', paddingTop: '12px', borderTop: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '13px', color: '#475569' }}>
                <span style={{ color: '#94A3B8', display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>Enrolled Course</span>
                <strong style={{ color: '#0F172A' }}>{selectedStudent.course}</strong>
              </div>
              <div style={{ fontSize: '13px', color: '#475569' }}>
                <span style={{ color: '#94A3B8', display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>Completed Session</span>
                <strong style={{ color: '#0284C7' }}>{selectedStudent.session}</strong>
              </div>
              <div style={{ fontSize: '13px', color: '#475569' }}>
                <span style={{ color: '#94A3B8', display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>Progress Status</span>
                <strong style={{ color: '#059669' }}>{selectedStudent.progress} Complete</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Live Completion Modal Component */}
        <SessionCompletionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          studentName={selectedStudent.name}
          courseTitle={selectedStudent.course}
          sessionTitle={selectedStudent.session}
          completedSessionNum={3}
          totalSessions={4}
          nextSessionTitle="Module 4: End-to-End Talent Acquisition Mastery & Certification"
          nextSessionDate="Tomorrow at 7:00 PM"
        />
      </div>
    </div>
  )
}

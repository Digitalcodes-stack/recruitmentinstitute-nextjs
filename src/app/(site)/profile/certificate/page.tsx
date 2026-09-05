'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Award, Sparkles, CheckCircle2, User, BookOpen } from 'lucide-react'
import CourseCertificate from '@/components/shared/CourseCertificate'

export default function StudentCertificatePage() {
  const [student, setStudent] = useState({
    certificateNo: 'RI-CERT-2026-000010',
    studentName: 'Priya Sharma',
    courseTitle: 'End-to-End Recruitment Training & Certification Program',
    finalScore: '94.5%',
    issuedAt: 'August 27, 2026',
    trainerName: 'Brahmita Nayak',
    directorName: 'Shesha Shhiv Mohanty',
  })

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', padding: '32px 16px 80px' }}>
      <div style={{ maxWidth: '1020px', margin: '0 auto' }}>
        
        {/* Navigation Breadcrumbs */}
        <div className="no-print" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
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
            }}
          >
            <ArrowLeft style={{ width: '15px', height: '15px' }} />
            <span>Back to Dashboard</span>
          </Link>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '50px', background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#059669', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            <CheckCircle2 style={{ width: '13px', height: '13px' }} />
            <span>Official Credential</span>
          </div>
        </div>

        {/* Certificate Display */}
        <CourseCertificate
          certificateNo={student.certificateNo}
          studentName={student.studentName}
          courseTitle={student.courseTitle}
          finalScore={student.finalScore}
          issuedAt={student.issuedAt}
          trainerName={student.trainerName}
          directorName={student.directorName}
        />
      </div>
    </div>
  )
}

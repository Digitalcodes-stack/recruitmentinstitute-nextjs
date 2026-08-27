'use client'

import React, { useRef } from 'react'
import { Award, Printer, Download, Share2, CheckCircle2, ShieldCheck, QrCode } from 'lucide-react'

export interface CertificateData {
  certificateNo: string
  studentName: string
  courseTitle: string
  finalScore?: number | string
  issuedAt?: string | Date
  trainerName?: string
  directorName?: string
  verificationUrl?: string
}

export default function CourseCertificate({
  certificateNo = 'RI-CERT-2026-000010',
  studentName = 'Priya Sharma',
  courseTitle = 'End-to-End Recruitment Training & Certification Program',
  finalScore = '94%',
  issuedAt = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }),
  trainerName = 'Brahmita Nayak (HR & Talent Faculty)',
  directorName = 'Shesha Shhiv Mohanty (Director of Academics)',
  verificationUrl = 'https://recruitmentinstitute.in/verify',
}: Partial<CertificateData>) {
  const printRef = useRef<HTMLDivElement>(null)

  const handlePrint = () => {
    window.print()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', width: '100%' }}>
      {/* Top Action Bar */}
      <div
        className="no-print"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          width: '100%',
          maxWidth: '960px',
          background: '#FFFFFF',
          padding: '16px 24px',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#FEF3C7', color: '#B45309', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Award style={{ width: '20px', height: '20px' }} />
          </div>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Official Course Completion Certificate
            </h3>
            <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>
              ID: <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0A1628' }}>{certificateNo}</span> • Verified Credential
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={handlePrint}
            style={{
              padding: '10px 20px',
              borderRadius: '10px',
              background: '#0A1628',
              color: '#FFFFFF',
              fontSize: '13px',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 2px 8px rgba(10,22,40,0.2)',
            }}
          >
            <Printer style={{ width: '15px', height: '15px' }} />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* ── PRINT STYLES ── */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .certificate-container, .certificate-container * {
            visibility: visible;
          }
          .certificate-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100vw !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* ── THE EXECUTIVE CERTIFICATE CANVAS ── */}
      <div
        ref={printRef}
        className="certificate-container"
        style={{
          width: '100%',
          maxWidth: '960px',
          aspectRatio: '1.414 / 1', // Standard A4 Landscape
          background: '#FCFDFE',
          borderRadius: '16px',
          boxShadow: '0 20px 60px -10px rgba(10, 22, 40, 0.15), 0 0 0 1px rgba(226, 232, 240, 0.8)',
          position: 'relative',
          padding: '36px',
          boxSizing: 'border-box',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        {/* Outer Classic Double Border with Metallic Gold Accent */}
        <div
          style={{
            position: 'absolute',
            inset: '16px',
            border: '2px solid #D4AF37',
            borderRadius: '10px',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: '22px',
            border: '1px solid #0A1628',
            borderRadius: '8px',
            pointerEvents: 'none',
          }}
        />

        {/* 4 Classic Corner Flourishes */}
        <svg
          viewBox="0 0 960 680"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
          }}
        >
          {/* Top-Left Corner Ornament */}
          <g transform="translate(30, 30)" stroke="#D4AF37" strokeWidth="1.5" fill="none">
            <path d="M 0 35 L 0 0 L 35 0" />
            <circle cx="8" cy="8" r="4" fill="#D4AF37" />
          </g>
          {/* Top-Right Corner Ornament */}
          <g transform="translate(930, 30)" stroke="#D4AF37" strokeWidth="1.5" fill="none">
            <path d="M 0 35 L 0 0 L -35 0" />
            <circle cx="-8" cy="8" r="4" fill="#D4AF37" />
          </g>
          {/* Bottom-Left Corner Ornament */}
          <g transform="translate(30, 650)" stroke="#D4AF37" strokeWidth="1.5" fill="none">
            <path d="M 0 -35 L 0 0 L 35 0" />
            <circle cx="8" cy="-8" r="4" fill="#D4AF37" />
          </g>
          {/* Bottom-Right Corner Ornament */}
          <g transform="translate(930, 650)" stroke="#D4AF37" strokeWidth="1.5" fill="none">
            <path d="M 0 -35 L 0 0 L -35 0" />
            <circle cx="-8" cy="-8" r="4" fill="#D4AF37" />
          </g>

          {/* Watermark Logo Background */}
          <g transform="translate(480, 340)" opacity="0.035" fill="#0A1628">
            <circle cx="0" cy="0" r="140" />
            <text x="0" y="30" fontSize="120" fontWeight="900" textAnchor="middle" fontFamily="serif">RI</text>
          </g>
        </svg>

        {/* ── 1. HEADER SECTION: LOGO & INSTITUTION ── */}
        <div style={{ textAlign: 'center', position: 'relative', zIndex: 10, paddingTop: '8px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #0A1628 0%, #1E3A8A 100%)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '14px', letterSpacing: '-0.05em' }}>
              RI
            </div>
            <span style={{ fontSize: '16px', fontWeight: 900, color: '#0A1628', letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: 'sans-serif' }}>
              Recruitment Institute
            </span>
          </div>

          <p style={{ fontSize: '10px', color: '#64748B', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', margin: 0 }}>
            Centre for Talent Acquisition &amp; Human Resource Excellence
          </p>

          <div style={{ width: '120px', height: '2px', background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)', margin: '12px auto 0' }} />
        </div>

        {/* ── 2. MAIN TITLE SECTION ── */}
        <div style={{ textAlign: 'center', position: 'relative', zIndex: 10, margin: '8px 0' }}>
          <h1
            style={{
              fontSize: 'clamp(28px, 4vw, 42px)',
              fontWeight: 800,
              color: '#0A1628',
              fontFamily: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              margin: '0 0 6px',
            }}
          >
            Certificate of Completion
          </h1>
          <p style={{ fontSize: '12px', fontStyle: 'italic', color: '#64748B', margin: 0, fontFamily: 'serif' }}>
            This is to proudly certify that
          </p>

          {/* Candidate Name in Calligraphic Serif */}
          <div style={{ margin: '14px auto 10px' }}>
            <h2
              style={{
                fontSize: 'clamp(32px, 4.5vw, 48px)',
                fontWeight: 900,
                color: '#1E3A8A',
                fontFamily: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
                letterSpacing: '-0.01em',
                margin: 0,
                lineHeight: 1.1,
                borderBottom: '2px solid #E2E8F0',
                display: 'inline-block',
                paddingBottom: '4px',
                minWidth: '380px',
              }}
            >
              {studentName}
            </h2>
          </div>

          <p style={{ fontSize: '13px', color: '#475569', maxWidth: '680px', margin: '0 auto', lineHeight: 1.6 }}>
            has successfully fulfilled all curriculum requirements, practical assessments, and masterclass sessions for
          </p>

          {/* Course Title Badge */}
          <h3
            style={{
              fontSize: 'clamp(16px, 2.2vw, 22px)',
              fontWeight: 800,
              color: '#0A1628',
              margin: '8px 0',
              fontFamily: 'sans-serif',
              letterSpacing: '-0.01em',
            }}
          >
            {courseTitle}
          </h3>

          {/* Performance Honor */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 14px', borderRadius: '50px', background: '#F8FAFC', border: '1px solid #E2E8F0', fontSize: '11px', fontWeight: 700, color: '#0F172A' }}>
            <ShieldCheck style={{ width: '13px', height: '13px', color: '#059669' }} />
            <span>Passed with Distinction • Cumulative Score: <strong style={{ color: '#059669' }}>{finalScore}</strong></span>
          </div>
        </div>

        {/* ── 3. BOTTOM FOOTER SECTION: SIGNATURES, SEAL & VERIFICATION ── */}
        <div
          style={{
            position: 'relative',
            zIndex: 10,
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            alignItems: 'flex-end',
            gap: '20px',
            padding: '0 20px 8px',
          }}
        >
          {/* Left Signature */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: 'Brush Script MT, cursive, serif', fontSize: '24px', color: '#1E3A8A' }}>
                Brahmita Nayak
              </span>
            </div>
            <div style={{ width: '180px', height: '1px', background: '#94A3B8', margin: '4px auto' }} />
            <p style={{ fontSize: '11px', fontWeight: 800, color: '#0F172A', margin: 0 }}>{trainerName}</p>
            <p style={{ fontSize: '9.5px', color: '#64748B', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Faculty Lead</p>
          </div>

          {/* Center Official Gold Security Seal */}
          <div style={{ textAlign: 'center', position: 'relative' }}>
            <div
              style={{
                width: '76px',
                height: '76px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, #FFFBEB 0%, #FDE68A 50%, #D97706 100%)',
                boxShadow: '0 4px 14px rgba(217, 119, 6, 0.35)',
                border: '2px dashed #B45309',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
                color: '#78350F',
              }}
            >
              <Award style={{ width: '24px', height: '24px', color: '#78350F' }} />
              <span style={{ fontSize: '7.5px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '2px' }}>
                Official Seal
              </span>
            </div>
            <p style={{ fontSize: '9px', color: '#94A3B8', marginTop: '6px', fontWeight: 600 }}>
              Issued: {typeof issuedAt === 'string' ? issuedAt : new Date(issuedAt).toLocaleDateString()}
            </p>
          </div>

          {/* Right Signature */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: 'Brush Script MT, cursive, serif', fontSize: '24px', color: '#1E3A8A' }}>
                S. S. Mohanty
              </span>
            </div>
            <div style={{ width: '180px', height: '1px', background: '#94A3B8', margin: '4px auto' }} />
            <p style={{ fontSize: '11px', fontWeight: 800, color: '#0F172A', margin: 0 }}>{directorName}</p>
            <p style={{ fontSize: '9.5px', color: '#64748B', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Director of Academics</p>
          </div>
        </div>

        {/* Bottom Verification Strip */}
        <div
          style={{
            textAlign: 'center',
            fontSize: '9px',
            color: '#94A3B8',
            fontWeight: 600,
            letterSpacing: '0.04em',
            paddingTop: '6px',
            borderTop: '1px solid #F1F5F9',
          }}
        >
          Certificate ID: <strong style={{ color: '#475569' }}>{certificateNo}</strong> • Verify authenticity online at <span style={{ color: '#2563EB' }}>recruitmentinstitute.in/verify</span>
        </div>
      </div>
    </div>
  )
}

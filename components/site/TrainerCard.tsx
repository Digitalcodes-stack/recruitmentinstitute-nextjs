'use client'

import Image from 'next/image'
import { Star, ArrowRight, Briefcase, CheckCircle } from 'lucide-react'
import { TrainerItem } from '@/types/training'

interface TrainerCardProps {
  trainer: TrainerItem
  onSelect: (trainer: TrainerItem) => void
}

export default function TrainerCard({ trainer, onSelect }: TrainerCardProps) {
  return (
    <div
      onClick={() => onSelect(trainer)}
      style={{
        background: '#FFFFFF',
        borderRadius: '24px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 4px 20px rgba(15,23,42,0.06)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      }}
    >
      {/* ── PHOTO CONTAINER (3:4 Ratio) ─────────────────────────────── */}
      <div style={{ position: 'relative', width: '100%', height: '320px', overflow: 'hidden', background: '#F1F5F9' }}>
        <Image
          src={trainer.image}
          alt={trainer.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          style={{ objectFit: 'cover', objectPosition: 'top' }}
        />

        {/* Soft Bottom Gradient Overlay for Contrast */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(15,23,42,0.85) 0%, rgba(15,23,42,0.1) 40%, transparent 100%)',
            pointerEvents: 'none',
          }}
        />

        {/* Floating Experience Badge (Top-Left) */}
        <div
          style={{
            position: 'absolute',
            top: '14px',
            left: '14px',
            padding: '5px 12px',
            borderRadius: '50px',
            background: 'rgba(15,23,42,0.85)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.2)',
            color: '#FFFFFF',
            fontSize: '11px',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          }}
        >
          <Briefcase style={{ width: '12px', height: '12px', color: '#F87171' }} />
          <span>{trainer.experienceYears}+ Yrs</span>
        </div>

        {/* Floating Rating Badge (Top-Right) */}
        <div
          style={{
            position: 'absolute',
            top: '14px',
            right: '14px',
            padding: '5px 10px',
            borderRadius: '50px',
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.2)',
            color: '#FDE047',
            fontSize: '11px',
            fontWeight: 900,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          }}
        >
          <Star style={{ width: '12px', height: '12px', fill: '#FACC15', color: '#FACC15' }} />
          <span>{trainer.rating.toFixed(1)}</span>
        </div>

        {/* Ex-Company Pill at Bottom of Photo */}
        {trainer.companyEx && (
          <div style={{ position: 'absolute', bottom: '12px', left: '12px', right: '12px' }}>
            <div
              style={{
                padding: '7px 12px',
                borderRadius: '12px',
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.4)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}
            >
              <span
                style={{
                  fontSize: '10.5px',
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  letterSpacing: '.06em',
                  color: '#1E293B',
                  display: 'block',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {trainer.companyEx}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ── CARD BODY ─────────────────────────────────────────────────── */}
      <div style={{ padding: '20px 22px 22px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#FFFFFF' }}>
        <div>
          {/* Trainer Name + Verified Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#0F172A', lineHeight: 1.25, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {trainer.name}
            </h3>
            <CheckCircle style={{ width: '16px', height: '16px', color: '#10B981', flexShrink: 0 }} />
          </div>

          {/* Role Title */}
          <p style={{ fontSize: '12px', fontWeight: 700, color: '#DC2626', marginBottom: '10px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {trainer.designation}
          </p>

          {/* 2-Line Bio */}
          <p style={{ fontSize: '12.5px', color: '#64748B', lineHeight: 1.6, height: '40px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', marginBottom: '14px', fontWeight: 500 }}>
            {trainer.bio}
          </p>

          {/* Specialization Tags */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
            {trainer.specializationTags.slice(0, 2).map((skill, idx) => (
              <span
                key={idx}
                style={{
                  padding: '3px 10px',
                  borderRadius: '8px',
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  color: '#475569',
                  fontSize: '11px',
                  fontWeight: 600,
                }}
              >
                {skill}
              </span>
            ))}
            {trainer.specializationTags.length > 2 && (
              <span
                style={{
                  padding: '3px 8px',
                  borderRadius: '8px',
                  background: '#F1F5F9',
                  color: '#64748B',
                  fontSize: '11px',
                  fontWeight: 800,
                }}
              >
                +{trainer.specializationTags.length - 2}
              </span>
            )}
          </div>
        </div>

        {/* Footer Row: Impact & Action */}
        <div style={{ paddingTop: '12px', borderTop: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#64748B' }}>
            <span>{trainer.studentsMentored}+ Trained</span>
          </div>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: 800, color: '#0F172A' }}>
            <span>View Profile</span>
            <ArrowRight style={{ width: '13px', height: '13px' }} />
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import {
  Search,
  RotateCcw,
  X,
  ShieldCheck,
  Users,
  Award,
  MessageCircle,
} from 'lucide-react'
import { TrainerItem } from '@/types/training'
import TrainerCard from './TrainerCard'
import EnquiryModal from '@/components/home/EnquiryModal'

interface TrainersListClientProps {
  initialTrainers: TrainerItem[]
}

export default function TrainersListClient({ initialTrainers }: TrainersListClientProps) {
  const [search, setSearch] = useState('')
  const [selectedSpecialization, setSelectedSpecialization] = useState('ALL')
  const [selectedExperience, setSelectedExperience] = useState('ALL')
  const [selectedMode, setSelectedMode] = useState('ALL')
  const [activeTrainer, setActiveTrainer] = useState<TrainerItem | null>(null)
  const [enquiryOpen, setEnquiryOpen] = useState(false)

  // Extract unique specialization tags
  const specializations = useMemo(() => {
    const set = new Set<string>()
    initialTrainers.forEach((t) => {
      t.specializationTags.forEach((tag) => set.add(tag))
    })
    return Array.from(set)
  }, [initialTrainers])

  // Filtered trainers
  const filteredTrainers = useMemo(() => {
    return initialTrainers.filter((t) => {
      // Search
      if (search.trim()) {
        const q = search.toLowerCase()
        const matchName = t.name.toLowerCase().includes(q)
        const matchRole = t.designation.toLowerCase().includes(q)
        const matchComp = (t.companyEx || '').toLowerCase().includes(q)
        const matchBio = t.bio.toLowerCase().includes(q)
        const matchSkills = t.specializationTags.some((s) => s.toLowerCase().includes(q))
        if (!matchName && !matchRole && !matchComp && !matchBio && !matchSkills) return false
      }

      // Specialization
      if (selectedSpecialization !== 'ALL') {
        if (!t.specializationTags.includes(selectedSpecialization)) {
          return false
        }
      }

      // Experience
      if (selectedExperience !== 'ALL') {
        const yrs = t.experienceYears
        if (selectedExperience === '15+' && yrs < 15) return false
        if (selectedExperience === '10-15' && (yrs < 10 || yrs > 15)) return false
        if (selectedExperience === '5-10' && (yrs < 5 || yrs > 10)) return false
      }

      // Mode
      if (selectedMode !== 'ALL') {
        const modeMatch = t.modes.some(
          (m) => m.toLowerCase() === selectedMode.toLowerCase()
        )
        if (!modeMatch) return false
      }

      return true
    })
  }, [initialTrainers, search, selectedSpecialization, selectedExperience, selectedMode])

  const hasActiveFilters =
    search.trim() !== '' ||
    selectedSpecialization !== 'ALL' ||
    selectedExperience !== 'ALL' ||
    selectedMode !== 'ALL'

  const resetFilters = () => {
    setSearch('')
    setSelectedSpecialization('ALL')
    setSelectedExperience('ALL')
    setSelectedMode('ALL')
  }

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 20px' }}>
      {/* ── SEARCH & FILTER TOOLBAR ─────────────────────────────────── */}
      <div style={{ background: '#FFFFFF', borderRadius: '20px', padding: '16px 20px', boxShadow: '0 4px 20px rgba(15,23,42,0.06)', border: '1px solid #E2E8F0', marginBottom: '36px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', alignItems: 'center' }}>
          {/* Search Box */}
          <div style={{ position: 'relative', gridColumn: 'span 2' }}>
            <Search style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#94A3B8', pointerEvents: 'none' }} />
            <input
              type="text"
              placeholder="Search faculty by name, company, skills..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                paddingLeft: '40px',
                paddingRight: '36px',
                paddingTop: '10px',
                paddingBottom: '10px',
                background: '#F8FAFC',
                fontSize: '13px',
                color: '#0F172A',
                borderRadius: '12px',
                border: '1px solid #CBD5E1',
                outline: 'none',
              }}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
              >
                <X style={{ width: '16px', height: '16px' }} />
              </button>
            )}
          </div>

          {/* Specialization Filter */}
          <div>
            <select
              value={selectedSpecialization}
              onChange={(e) => setSelectedSpecialization(e.target.value)}
              aria-label="Filter by specialization"
              style={{
                width: '100%',
                padding: '10px 14px',
                background: '#F8FAFC',
                fontSize: '13px',
                color: '#334155',
                fontWeight: 600,
                borderRadius: '12px',
                border: '1px solid #CBD5E1',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="ALL">All Specializations</option>
              {specializations.map((spec) => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
            </select>
          </div>

          {/* Experience Filter */}
          <div>
            <select
              value={selectedExperience}
              onChange={(e) => setSelectedExperience(e.target.value)}
              aria-label="Filter by experience"
              style={{
                width: '100%',
                padding: '10px 14px',
                background: '#F8FAFC',
                fontSize: '13px',
                color: '#334155',
                fontWeight: 600,
                borderRadius: '12px',
                border: '1px solid #CBD5E1',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="ALL">All Experience</option>
              <option value="15+">15+ Years</option>
              <option value="10-15">10–15 Years</option>
              <option value="5-10">5–10 Years</option>
            </select>
          </div>

          {/* Delivery Mode Filter */}
          <div>
            <select
              value={selectedMode}
              onChange={(e) => setSelectedMode(e.target.value)}
              aria-label="Filter by delivery mode"
              style={{
                width: '100%',
                padding: '10px 14px',
                background: '#F8FAFC',
                fontSize: '13px',
                color: '#334155',
                fontWeight: 600,
                borderRadius: '12px',
                border: '1px solid #CBD5E1',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="ALL">All Delivery Modes</option>
              <option value="ONLINE">Live Online</option>
              <option value="OFFLINE">Pune Classroom</option>
              <option value="HYBRID">Hybrid Tracks</option>
            </select>
          </div>

          {/* Reset Action */}
          <div>
            <button
              onClick={resetFilters}
              disabled={!hasActiveFilters}
              title="Reset all filters"
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '12px',
                background: '#F1F5F9',
                color: '#475569',
                fontWeight: 700,
                fontSize: '12px',
                border: '1px solid #E2E8F0',
                cursor: hasActiveFilters ? 'pointer' : 'not-allowed',
                opacity: hasActiveFilters ? 1 : 0.4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <RotateCcw style={{ width: '13px', height: '13px' }} />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Filter Results Status */}
        <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: '#64748B', fontWeight: 600 }}>
          <span>
            Showing <strong style={{ color: '#0F172A' }}>{filteredTrainers.length}</strong> of{' '}
            <strong style={{ color: '#0F172A' }}>{initialTrainers.length}</strong> master faculty members
          </span>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              style={{ background: 'none', border: 'none', color: '#DC2626', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* ── TRAINERS GRID (3 Columns Auto-Fit) ───────────────────────── */}
      {filteredTrainers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#FFFFFF', borderRadius: '24px', border: '1px dashed #CBD5E1', maxWidth: '500px', margin: '0 auto' }}>
          <Users style={{ width: '48px', height: '48px', color: '#94A3B8', margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1E293B', marginBottom: '6px' }}>No faculty found</h3>
          <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '20px' }}>
            We couldn&apos;t find any trainers matching your current search or filters.
          </p>
          <button
            onClick={resetFilters}
            style={{ padding: '10px 20px', background: '#0F172A', color: '#FFFFFF', fontSize: '13px', fontWeight: 700, borderRadius: '12px', border: 'none', cursor: 'pointer' }}
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '32px' }}>
          {filteredTrainers.map((trainer) => (
            <TrainerCard
              key={trainer.id}
              trainer={trainer}
              onSelect={(t) => setActiveTrainer(t)}
            />
          ))}
        </div>
      )}

      {/* ── FACULTY PROFILE MODAL ────────────────────────────────────── */}
      {activeTrainer && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(4px)',
          }}
          onClick={() => setActiveTrainer(null)}
        >
          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '620px',
              background: '#FFFFFF',
              borderRadius: '24px',
              overflow: 'hidden',
              boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
              border: '1px solid #CBD5E1',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setActiveTrainer(null)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                zIndex: 20,
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'rgba(0,0,0,0.6)',
                color: '#FFFFFF',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <X style={{ width: '18px', height: '18px' }} />
            </button>

            {/* Modal Header Banner */}
            <div style={{ background: '#0F172A', padding: '28px', color: '#FFFFFF', position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                {/* Photo */}
                <div style={{ position: 'relative', width: '90px', height: '90px', borderRadius: '18px', overflow: 'hidden', flexShrink: 0, border: '2px solid rgba(255,255,255,0.2)', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}>
                  <Image
                    src={activeTrainer.image}
                    alt={activeTrainer.name}
                    fill
                    style={{ objectFit: 'cover', objectPosition: 'top' }}
                  />
                </div>

                {/* Header Details */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '50px', background: 'rgba(255,255,255,0.1)', color: '#34D399', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '8px' }}>
                    <ShieldCheck style={{ width: '13px', height: '13px' }} />
                    <span>Verified Corporate Faculty</span>
                  </div>

                  <h3 style={{ fontSize: '22px', fontWeight: 900, color: '#FFFFFF', lineHeight: 1.2, margin: '0 0 4px' }}>
                    {activeTrainer.name}
                  </h3>

                  <p style={{ fontSize: '12.5px', fontWeight: 700, color: '#F87171', margin: '0 0 4px' }}>
                    {activeTrainer.designation}
                  </p>

                  {activeTrainer.companyEx && (
                    <p style={{ fontSize: '12px', color: '#94A3B8', fontFamily: 'monospace', fontWeight: 600, margin: 0 }}>
                      {activeTrainer.companyEx}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Content Scrollable Area */}
            <div style={{ padding: '24px 28px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px', flex: 1, color: '#334155', fontSize: '13.5px' }}>
              {/* Impact Highlights Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                <div style={{ padding: '14px', borderRadius: '14px', background: '#F8FAFC', border: '1px solid #E2E8F0', textAlign: 'center' }}>
                  <span style={{ fontSize: '10px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '.08em', display: 'block' }}>Experience</span>
                  <span style={{ fontSize: '17px', fontWeight: 900, color: '#0F172A' }}>{activeTrainer.experienceYears}+ Yrs</span>
                </div>
                <div style={{ padding: '14px', borderRadius: '14px', background: '#F8FAFC', border: '1px solid #E2E8F0', textAlign: 'center' }}>
                  <span style={{ fontSize: '10px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '.08em', display: 'block' }}>Mentored</span>
                  <span style={{ fontSize: '17px', fontWeight: 900, color: '#059669' }}>{activeTrainer.studentsMentored}+</span>
                </div>
                <div style={{ padding: '14px', borderRadius: '14px', background: '#F8FAFC', border: '1px solid #E2E8F0', textAlign: 'center' }}>
                  <span style={{ fontSize: '10px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '.08em', display: 'block' }}>Rating</span>
                  <span style={{ fontSize: '17px', fontWeight: 900, color: '#D97706' }}>★ {activeTrainer.rating.toFixed(1)}</span>
                </div>
              </div>

              {/* Executive Bio */}
              <div>
                <h4 style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.1em', color: '#94A3B8', margin: '0 0 8px' }}>
                  Executive Background
                </h4>
                <p style={{ color: '#475569', lineHeight: 1.7, margin: 0, fontWeight: 500 }}>
                  {activeTrainer.longBio || activeTrainer.bio}
                </p>
              </div>

              {/* Skills & Domains */}
              <div>
                <h4 style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.1em', color: '#94A3B8', margin: '0 0 10px' }}>
                  Core Competencies &amp; Modules
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {activeTrainer.specializationTags.map((skill, idx) => (
                    <span
                      key={idx}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '10px',
                        background: '#F1F5F9',
                        color: '#1E293B',
                        fontSize: '12px',
                        fontWeight: 600,
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Certifications & Credentials */}
              {activeTrainer.certifications && activeTrainer.certifications.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.1em', color: '#94A3B8', margin: '0 0 10px' }}>
                    Certifications &amp; Accreditations
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {activeTrainer.certifications.map((cert, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#334155', fontWeight: 600, fontSize: '12.5px' }}>
                        <Award style={{ width: '14px', height: '14px', color: '#2563EB', flexShrink: 0 }} />
                        <span>{cert}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Bottom CTA */}
            <div style={{ padding: '18px 28px', background: '#F8FAFC', borderTop: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
              <span style={{ fontSize: '13px', color: '#64748B', fontWeight: 500 }}>
                Want to learn directly from {activeTrainer.name.split(' ')[0]}?
              </span>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  onClick={() => {
                    setActiveTrainer(null)
                    setEnquiryOpen(true)
                  }}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #DC2626 0%, #E63946 100%)',
                    color: '#FFFFFF',
                    fontWeight: 800,
                    fontSize: '12.5px',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(220,38,38,0.25)',
                  }}
                >
                  Schedule Mentorship Call
                </button>

                <a
                  href={`https://wa.me/917385204165?text=Hello,%20I%20want%20to%20know%20more%20about%20learning%20under%20${encodeURIComponent(
                    activeTrainer.name
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: '10px 12px',
                    borderRadius: '12px',
                    background: '#059669',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textDecoration: 'none',
                  }}
                >
                  <MessageCircle style={{ width: '16px', height: '16px' }} />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Counselling Modal */}
      <EnquiryModal
        isOpen={enquiryOpen}
        onClose={() => setEnquiryOpen(false)}
      />
    </div>
  )
}

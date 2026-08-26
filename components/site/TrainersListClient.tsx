'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import {
  Search,
  Star,
  Award,
  Users,
  CheckCircle2,
  X,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react'
import { TrainerItem } from '@/types/training'
import { DEFAULT_TRAINERS } from '@/lib/data/trainingData'
import TrainerCard from '@/components/site/TrainerCard'
import EnquiryModal from '@/components/home/EnquiryModal'

interface TrainersListClientProps {
  trainers?: TrainerItem[]
}

const EXPERTISE_OPTIONS = [
  'All Specializations',
  'Tech Recruitment',
  'Corporate HR',
  'Executive Search',
  'HR Entrepreneurship',
  'Boolean Sourcing',
  'Volume Hiring',
  'Statutory Compliance',
]

const EXPERIENCE_OPTIONS = [
  { label: 'All Experience', min: 0 },
  { label: '10+ Years', min: 10 },
  { label: '14+ Years', min: 14 },
  { label: '16+ Years', min: 16 },
]

const MODE_OPTIONS = [
  { label: 'All Modes', value: 'ALL' },
  { label: 'Live Online', value: 'Online' },
  { label: 'Pune Classroom', value: 'Offline' },
  { label: 'Hybrid Cohort', value: 'Hybrid' },
]

export default function TrainersListClient({ trainers = DEFAULT_TRAINERS }: TrainersListClientProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedExpertise, setSelectedExpertise] = useState('All Specializations')
  const [selectedMinExp, setSelectedMinExp] = useState(0)
  const [selectedMode, setSelectedMode] = useState('ALL')
  const [selectedTrainer, setSelectedTrainer] = useState<TrainerItem | null>(null)
  const [enquiryOpen, setEnquiryOpen] = useState(false)

  const rawTrainers = trainers && trainers.length > 0 ? trainers : DEFAULT_TRAINERS

  const filteredTrainers = useMemo(() => {
    return rawTrainers.filter((trainer) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchesName = trainer.name.toLowerCase().includes(q)
        const matchesDesignation = trainer.designation.toLowerCase().includes(q)
        const matchesCompany = (trainer.companyEx || '').toLowerCase().includes(q)
        const matchesTags = trainer.specializationTags.some((t) => t.toLowerCase().includes(q))
        if (!matchesName && !matchesDesignation && !matchesCompany && !matchesTags) {
          return false
        }
      }

      // Specialization Filter
      if (selectedExpertise !== 'All Specializations') {
        const hasTag = trainer.specializationTags.some(
          (tag) => tag.toLowerCase() === selectedExpertise.toLowerCase()
        )
        if (!hasTag) return false
      }

      // Experience Filter
      if (selectedMinExp > 0 && trainer.experienceYears < selectedMinExp) {
        return false
      }

      // Delivery Mode Filter
      if (selectedMode !== 'ALL') {
        const hasMode = trainer.modes.includes(selectedMode as 'Online' | 'Offline' | 'Hybrid')
        if (!hasMode) return false
      }

      return true
    })
  }, [rawTrainers, searchQuery, selectedExpertise, selectedMinExp, selectedMode])

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedExpertise !== 'All Specializations' ||
    selectedMinExp > 0 ||
    selectedMode !== 'ALL'

  const handleResetFilters = () => {
    setSearchQuery('')
    setSelectedExpertise('All Specializations')
    setSelectedMinExp(0)
    setSelectedMode('ALL')
  }

  return (
    <div className="bg-[#F8FAFC]">
      {/* ── CLEAN FILTER TOOLBAR (Single Neat Row) ─────────────── */}
      <section className="bg-white border-b border-slate-200/70 py-4 shadow-2xs">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by name, company, or skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-9 py-2.5 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-xs sm:text-sm text-slate-900 placeholder-slate-400 rounded-xl border border-slate-200 focus:border-[#E63946] focus:ring-2 focus:ring-[#E63946]/15 outline-none transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Dropdown Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedExpertise}
                onChange={(e) => setSelectedExpertise(e.target.value)}
                className="px-3 py-2.5 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 rounded-xl border border-slate-200 outline-none cursor-pointer"
              >
                {EXPERTISE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>

              <select
                value={selectedMinExp}
                onChange={(e) => setSelectedMinExp(Number(e.target.value))}
                className="px-3 py-2.5 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 rounded-xl border border-slate-200 outline-none cursor-pointer"
              >
                {EXPERIENCE_OPTIONS.map((opt) => (
                  <option key={opt.label} value={opt.min}>
                    {opt.label}
                  </option>
                ))}
              </select>

              <select
                value={selectedMode}
                onChange={(e) => setSelectedMode(e.target.value)}
                className="px-3 py-2.5 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 rounded-xl border border-slate-200 outline-none cursor-pointer"
              >
                {MODE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-1 px-3 py-2.5 rounded-xl bg-red-50 text-[#E63946] text-xs font-bold hover:bg-red-100 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>

          {/* Results Counter */}
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 text-[11.5px] text-slate-500 font-medium">
            <span>
              Showing <strong className="text-slate-800 font-bold">{filteredTrainers.length}</strong> of{' '}
              {rawTrainers.length} mentors
            </span>
          </div>
        </div>
      </section>

      {/* ── TRAINERS GRID (Even 3-Column Layout) ────────────────── */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          {filteredTrainers.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center border border-slate-200 shadow-xs max-w-md mx-auto my-8">
              <p className="text-base font-bold text-slate-800 mb-1">No trainers found</p>
              <p className="text-xs text-slate-500 mb-5">Try resetting your filters or search keywords.</p>
              <button
                onClick={handleResetFilters}
                className="px-5 py-2 bg-[#0A1628] text-white rounded-xl text-xs font-bold hover:bg-slate-800 cursor-pointer"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 items-stretch">
              {filteredTrainers.map((trainer) => (
                <TrainerCard
                  key={trainer.id}
                  trainer={trainer}
                  onSelect={(t) => setSelectedTrainer(t)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── PROFILE MODAL ────────────────────────────────────────── */}
      {selectedTrainer && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
          onClick={() => setSelectedTrainer(null)}
        >
          <div
            className="relative w-full max-w-xl bg-white rounded-2xl overflow-hidden shadow-xl border border-slate-200 max-h-[88vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedTrainer(null)}
              className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-slate-900/60 text-white flex items-center justify-center hover:bg-slate-900 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Header */}
            <div className="relative bg-[#0A1628] p-6 text-white flex items-center gap-4">
              <div className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-[#E63946] shrink-0">
                <Image
                  src={selectedTrainer.image}
                  alt={selectedTrainer.name}
                  fill
                  sizes="90px"
                  className="object-cover object-top"
                />
              </div>

              <div>
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-500/20 text-red-300 text-[10px] font-bold uppercase tracking-wider mb-1">
                  <ShieldCheck className="w-3 h-3 text-red-400" />
                  <span>Master Faculty</span>
                </div>
                <h3 className="text-xl font-bold text-white">{selectedTrainer.name}</h3>
                <p className="text-xs font-semibold text-slate-300">{selectedTrainer.designation}</p>
                {selectedTrainer.companyEx && (
                  <p className="text-[11px] font-bold text-amber-300 mt-0.5">{selectedTrainer.companyEx}</p>
                )}

                <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-300">
                  <span className="flex items-center gap-1">
                    <Award className="w-3 h-3 text-amber-400" /> {selectedTrainer.experienceYears}+ Yrs Exp
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {selectedTrainer.rating.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 text-slate-700 text-xs sm:text-sm space-y-5">
              {/* Quote */}
              {selectedTrainer.quote && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs italic font-medium">
                  &ldquo;{selectedTrainer.quote}&rdquo;
                </div>
              )}

              {/* Bio */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Background</h4>
                <p className="text-slate-600 leading-relaxed text-xs sm:text-sm">
                  {selectedTrainer.longBio || selectedTrainer.bio}
                </p>
              </div>

              {/* Specializations */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Core Expertise</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedTrainer.specializationTags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-semibold border border-slate-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Certifications */}
              {selectedTrainer.certifications && selectedTrainer.certifications.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Certifications
                  </h4>
                  <ul className="space-y-1">
                    {selectedTrainer.certifications.map((cert) => (
                      <li key={cert} className="flex items-center gap-2 text-xs text-slate-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{cert}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
              <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                Learn directly from {selectedTrainer.name.split(' ')[0]}
              </span>

              <button
                onClick={() => {
                  setSelectedTrainer(null)
                  setEnquiryOpen(true)
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#E63946] text-white font-bold text-xs hover:bg-red-700 transition-all cursor-pointer"
              >
                Schedule Faculty Counselling
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Enquiry Modal */}
      <EnquiryModal isOpen={enquiryOpen} onClose={() => setEnquiryOpen(false)} />
    </div>
  )
}

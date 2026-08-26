'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import {
  Search,
  RotateCcw,
  X,
  Star,
  ShieldCheck,
  Building2,
  Briefcase,
  Users,
  CheckCircle,
  GraduationCap,
  Calendar,
  MessageCircle,
  ArrowRight,
  Phone,
  Mail,
  Award,
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

  // Extract unique filter choices
  const specializations = useMemo(() => {
    const set = new Set<string>()
    initialTrainers.forEach((t) => {
      if (t.specialization) set.add(t.specialization)
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
        const matchRole = t.role.toLowerCase().includes(q)
        const matchComp = t.exCompany.toLowerCase().includes(q)
        const matchBio = t.bio.toLowerCase().includes(q)
        const matchSkills = t.skills.some((s) => s.toLowerCase().includes(q))
        if (!matchName && !matchRole && !matchComp && !matchBio && !matchSkills) return false
      }

      // Specialization
      if (selectedSpecialization !== 'ALL') {
        if (t.specialization !== selectedSpecialization && !t.skills.includes(selectedSpecialization)) {
          return false
        }
      }

      // Experience
      if (selectedExperience !== 'ALL') {
        const yrs = parseInt(t.experience.replace(/\D/g, '')) || 0
        if (selectedExperience === '15+' && yrs < 15) return false
        if (selectedExperience === '10-15' && (yrs < 10 || yrs > 15)) return false
        if (selectedExperience === '5-10' && (yrs < 5 || yrs > 10)) return false
      }

      // Mode
      if (selectedMode !== 'ALL') {
        if (!t.deliveryModes.includes(selectedMode as any)) return false
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
    <div className="space-y-10">
      {/* ── SEARCH & FILTER TOOLBAR ─────────────────────────────────── */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-lg shadow-slate-900/5 border border-slate-200/90">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3.5 items-center">
          {/* Search Box */}
          <div className="relative lg:col-span-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search faculty by name, ex-company, skills..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 focus:bg-white text-xs sm:text-sm text-slate-900 rounded-2xl border border-slate-200 focus:border-[#E63946] focus:ring-2 focus:ring-[#E63946]/15 outline-none transition-all placeholder:text-slate-400"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Specialization Filter */}
          <div className="lg:col-span-3">
            <select
              value={selectedSpecialization}
              onChange={(e) => setSelectedSpecialization(e.target.value)}
              aria-label="Filter by specialization"
              className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white text-xs sm:text-sm text-slate-700 font-semibold rounded-2xl border border-slate-200 focus:border-[#E63946] outline-none transition-all cursor-pointer"
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
          <div className="lg:col-span-2">
            <select
              value={selectedExperience}
              onChange={(e) => setSelectedExperience(e.target.value)}
              aria-label="Filter by experience"
              className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white text-xs sm:text-sm text-slate-700 font-semibold rounded-2xl border border-slate-200 focus:border-[#E63946] outline-none transition-all cursor-pointer"
            >
              <option value="ALL">All Experience</option>
              <option value="15+">15+ Years</option>
              <option value="10-15">10–15 Years</option>
              <option value="5-10">5–10 Years</option>
            </select>
          </div>

          {/* Delivery Mode Filter */}
          <div className="lg:col-span-2">
            <select
              value={selectedMode}
              onChange={(e) => setSelectedMode(e.target.value)}
              aria-label="Filter by delivery mode"
              className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white text-xs sm:text-sm text-slate-700 font-semibold rounded-2xl border border-slate-200 focus:border-[#E63946] outline-none transition-all cursor-pointer"
            >
              <option value="ALL">All Delivery Modes</option>
              <option value="ONLINE">Live Online</option>
              <option value="OFFLINE">Pune Classroom</option>
              <option value="HYBRID">Hybrid Tracks</option>
            </select>
          </div>

          {/* Reset Action */}
          <div className="lg:col-span-1 flex justify-end">
            <button
              onClick={resetFilters}
              disabled={!hasActiveFilters}
              title="Reset all filters"
              className="w-full py-2.5 px-3 rounded-2xl bg-slate-100 text-slate-600 font-bold text-xs hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="lg:hidden">Reset</span>
            </button>
          </div>
        </div>

        {/* Filter Results Status */}
        <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-semibold">
          <span>
            Showing <strong className="text-slate-900">{filteredTrainers.length}</strong> of{' '}
            <strong className="text-slate-900">{initialTrainers.length}</strong> master faculty members
          </span>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-[#E63946] hover:underline font-bold cursor-pointer"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* ── TRAINERS GRID (3 Columns) ────────────────────────────────── */}
      {filteredTrainers.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200 p-8 max-w-lg mx-auto">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800 mb-1">No faculty found</h3>
          <p className="text-xs text-slate-500 mb-5">
            We couldn&apos;t find any trainers matching your current search or filters.
          </p>
          <button
            onClick={resetFilters}
            className="px-5 py-2.5 bg-[#0A1628] text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in"
          onClick={() => setActiveTrainer(null)}
        >
          <div
            className="relative w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setActiveTrainer(null)}
              className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/60 text-white hover:bg-black/80 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header Banner */}
            <div className="bg-[#0A1628] p-6 sm:p-8 text-white relative">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                {/* Photo */}
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden shrink-0 border-2 border-white/20 shadow-xl">
                  <Image
                    src={activeTrainer.image}
                    alt={activeTrainer.name}
                    fill
                    className="object-cover object-top"
                  />
                </div>

                {/* Header Details */}
                <div className="text-center sm:text-left flex-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Verified Corporate Faculty</span>
                  </div>

                  <h3 className="text-2xl font-black text-white leading-tight mb-1">
                    {activeTrainer.name}
                  </h3>

                  <p className="text-xs font-bold text-red-400 mb-2">
                    {activeTrainer.role}
                  </p>

                  <p className="text-xs text-slate-300 font-mono font-semibold">
                    {activeTrainer.exCompany}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Content Scrollable Area */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1 text-slate-700 text-xs sm:text-sm">
              {/* Impact Highlights Row */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Experience</span>
                  <span className="text-base font-black text-[#0A1628]">{activeTrainer.experience}</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Students</span>
                  <span className="text-base font-black text-emerald-600">{activeTrainer.studentsTrained}+</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Rating</span>
                  <span className="text-base font-black text-amber-500">★ {activeTrainer.rating}</span>
                </div>
              </div>

              {/* Executive Bio */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Executive Background
                </h4>
                <p className="text-slate-600 leading-relaxed font-medium">
                  {activeTrainer.bio}
                </p>
              </div>

              {/* Skills & Domains */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                  Core Competencies & Modules
                </h4>
                <div className="flex flex-wrap gap-2">
                  {activeTrainer.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-xl bg-slate-100 text-slate-800 text-xs font-semibold"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Certifications & Credentials */}
              {activeTrainer.certifications && activeTrainer.certifications.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                    Certifications & Accreditations
                  </h4>
                  <div className="space-y-1.5">
                    {activeTrainer.certifications.map((cert, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-slate-700 font-semibold text-xs">
                        <Award className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>{cert}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Bottom CTA */}
            <div className="p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-slate-500 font-medium text-center sm:text-left">
                Want to learn directly from {activeTrainer.name.split(' ')[0]}?
              </span>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  onClick={() => {
                    setActiveTrainer(null)
                    setEnquiryOpen(true)
                  }}
                  className="flex-1 sm:flex-initial py-3 px-5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold text-xs hover:from-red-700 transition-all shadow-md shadow-red-600/15 cursor-pointer text-center"
                >
                  Schedule Mentorship Call
                </button>

                <a
                  href={`https://wa.me/917385204165?text=Hello,%20I%20want%20to%20know%20more%20about%20learning%20under%20${encodeURIComponent(
                    activeTrainer.name
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
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

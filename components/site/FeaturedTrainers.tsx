'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Star,
  Award,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Users,
  Briefcase,
  X,
  ExternalLink,
  Phone,
  MessageSquare,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react'
import { FeaturedTrainersProps, TrainerItem } from '@/types/training'
import { DEFAULT_TRAINERS } from '@/lib/data/trainingData'
import EnquiryModal from '@/components/home/EnquiryModal'

export default function FeaturedTrainers({
  trainers = DEFAULT_TRAINERS,
  title = 'Learn From The Best',
  subtitle = 'Get trained directly by active talent acquisition leaders who hire for top tech giants and Fortune 500 enterprises.',
  limit = 4,
  viewAllHref = '/trainers',
  className = '',
  darkBackground = false,
}: FeaturedTrainersProps) {
  const [selectedTrainer, setSelectedTrainer] = useState<TrainerItem | null>(null)
  const [enquiryOpen, setEnquiryOpen] = useState(false)

  const rawTrainers = trainers && trainers.length > 0 ? trainers : DEFAULT_TRAINERS
  const displayedTrainers = rawTrainers.slice(0, limit)

  return (
    <section
      className={`relative py-16 lg:py-24 overflow-hidden ${
        darkBackground
          ? 'bg-gradient-to-b from-[#04091A] via-[#0A1628] to-[#04091A] text-white'
          : 'bg-white text-slate-900 border-t border-slate-200/80'
      } ${className}`}
    >
      {/* Subtle Ambient Glows */}
      <div
        aria-hidden
        className="absolute top-1/3 left-0 w-96 h-96 bg-red-600/5 rounded-full blur-3xl pointer-events-none"
      />
      <div
        aria-hidden
        className="absolute bottom-10 right-0 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl pointer-events-none"
      />

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 lg:mb-16 gap-6">
          <div className="max-w-2xl">
            <div
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-extrabold mb-4 ${
                darkBackground
                  ? 'bg-red-500/15 border border-red-500/30 text-red-400'
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-red-500" />
              <span className="uppercase tracking-wider">Expert Mentors & Faculty</span>
            </div>

            <h2
              className={`text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight ${
                darkBackground ? 'text-white' : 'text-[#0A1628]'
              }`}
            >
              {title}
            </h2>

            <p
              className={`mt-3 text-base sm:text-lg leading-relaxed ${
                darkBackground ? 'text-slate-300' : 'text-slate-600'
              }`}
            >
              {subtitle}
            </p>
          </div>

          <Link
            href={viewAllHref}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-extrabold text-sm hover:from-red-700 hover:to-rose-700 transition-all duration-200 shadow-md shadow-red-600/20 hover:shadow-lg hover:shadow-red-600/30 hover:-translate-y-0.5 shrink-0 self-start md:self-auto"
          >
            <span>Meet All Mentors</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Trainers Grid / Horizontal Scroll for Mobile */}
        <div className="flex overflow-x-auto pb-6 -mx-4 px-4 sm:mx-0 sm:px-0 sm:pb-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-6 scroll-smooth snap-x snap-mandatory">
          {displayedTrainers.map((trainer) => (
            <div
              key={trainer.id}
              className={`min-w-[280px] sm:min-w-0 snap-center rounded-3xl transition-all duration-300 flex flex-col justify-between overflow-hidden group ${
                darkBackground
                  ? 'bg-[#0E1E38]/90 border border-slate-800 hover:border-red-500/50 hover:bg-[#122444]'
                  : 'bg-[#F8FAFC] border border-slate-200/90 hover:border-red-300 hover:bg-white'
              } hover:-translate-y-2 hover:shadow-[0_22px_45px_-15px_rgba(10,22,40,0.14)]`}
            >
              {/* Photo Area */}
              <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-slate-950">
                <Image
                  src={trainer.image}
                  alt={trainer.name}
                  fill
                  sizes="(max-width: 640px) 280px, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  priority
                />
                {/* Gradient Shadow Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                {/* Experience Badge */}
                <div className="absolute top-3.5 left-3.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-white/20 text-white text-xs font-extrabold shadow-sm">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  <span>{trainer.experienceYears}+ Yrs</span>
                </div>

                {/* Rating Badge */}
                <div className="absolute top-3.5 right-3.5 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-white/20 text-amber-400 text-xs font-extrabold">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span className="text-white">{trainer.rating.toFixed(2)}</span>
                </div>

                {/* Pedigree snippet at bottom of image */}
                {trainer.companyEx && (
                  <div className="absolute bottom-3 left-3.5 right-3.5">
                    <div className="inline-block px-2.5 py-1 rounded-lg bg-slate-950/85 backdrop-blur-md border border-white/10 max-w-full">
                      <p className="text-[11px] font-bold text-amber-300 uppercase tracking-wider truncate drop-shadow-sm">
                        {trainer.companyEx}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Body Content */}
              <div className="p-5 sm:p-6 flex flex-col flex-1">
                <h3
                  className={`text-xl font-extrabold tracking-tight mb-1 group-hover:text-red-600 transition-colors ${
                    darkBackground ? 'text-white' : 'text-[#0A1628]'
                  }`}
                >
                  {trainer.name}
                </h3>

                <p
                  className={`text-xs font-semibold leading-snug mb-3.5 line-clamp-2 ${
                    darkBackground ? 'text-slate-300' : 'text-slate-600'
                  }`}
                >
                  {trainer.designation}
                </p>

                {/* Specialization Tags (Max 2) */}
                <div className="flex flex-wrap gap-1.5 mb-3.5">
                  {trainer.specializationTags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-md border ${
                        darkBackground
                          ? 'bg-slate-800 text-slate-300 border-slate-700'
                          : 'bg-white text-slate-700 border-slate-200'
                      }`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Short Quote / Bio */}
                <p
                  className={`text-xs leading-relaxed italic line-clamp-2 mb-5 ${
                    darkBackground ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  &ldquo;{trainer.quote || trainer.bio}&rdquo;
                </p>

                {/* Action Row */}
                <div className="mt-auto pt-3.5 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                    <Users className="w-3.5 h-3.5 text-red-500" />
                    <span>{trainer.studentsMentored}+ trained</span>
                  </div>

                  <button
                    onClick={() => setSelectedTrainer(trainer)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-700 transition-colors cursor-pointer"
                  >
                    <span>View Profile</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Swipe Tip */}
        <div className="text-center sm:hidden mt-2 text-xs text-slate-400 flex items-center justify-center gap-1">
          <span>Swipe to explore mentors →</span>
        </div>
      </div>

      {/* Trainer Profile Modal */}
      {selectedTrainer && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
          onClick={() => setSelectedTrainer(null)}
        >
          <div
            className="relative w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedTrainer(null)}
              className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-slate-900/60 text-white flex items-center justify-center hover:bg-slate-900 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header with Trainer Hero */}
            <div className="relative bg-gradient-to-r from-[#04091A] to-[#0A1628] p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center sm:items-start gap-5">
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-red-500 shrink-0 shadow-lg">
                <Image
                  src={selectedTrainer.image}
                  alt={selectedTrainer.name}
                  fill
                  sizes="120px"
                  className="object-cover"
                />
              </div>

              <div className="text-center sm:text-left flex-1">
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-500/20 border border-red-400/40 text-red-300 text-[11px] font-bold uppercase tracking-wider mb-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-red-400" />
                  <span>Verified Master Faculty</span>
                </div>
                <h3 className="text-2xl font-black">{selectedTrainer.name}</h3>
                <p className="text-sm font-semibold text-slate-300 mt-0.5">{selectedTrainer.designation}</p>
                {selectedTrainer.companyEx && (
                  <p className="text-xs font-bold text-amber-400 mt-1">{selectedTrainer.companyEx}</p>
                )}

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-3 text-xs text-slate-300">
                  <span className="flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-amber-400" /> {selectedTrainer.experienceYears}+ Years
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {selectedTrainer.rating} (
                    {selectedTrainer.reviewsCount} reviews)
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-sky-400" /> {selectedTrainer.studentsMentored}+ Mentored
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 overflow-y-auto flex-1 text-slate-700 text-sm space-y-6">
              {/* Quote */}
              {selectedTrainer.quote && (
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/70 text-amber-900 text-xs italic font-medium">
                  &ldquo;{selectedTrainer.quote}&rdquo;
                </div>
              )}

              {/* Bio */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">About The Mentor</h4>
                <p className="text-slate-600 leading-relaxed text-sm">
                  {selectedTrainer.longBio || selectedTrainer.bio}
                </p>
              </div>

              {/* Specializations */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Core Specializations</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedTrainer.specializationTags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-semibold border border-slate-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Certifications */}
              {selectedTrainer.certifications && selectedTrainer.certifications.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Credentials & Certifications</h4>
                  <ul className="space-y-1.5">
                    {selectedTrainer.certifications.map((cert) => (
                      <li key={cert} className="flex items-center gap-2 text-xs font-medium text-slate-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{cert}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Courses Taught */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Programs Mentored</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedTrainer.coursesTaught.map((c) => (
                    <span
                      key={c}
                      className="px-3 py-1 bg-red-50 text-red-700 rounded-lg text-xs font-bold border border-red-200"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer CTAs */}
            <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-slate-500 text-center sm:text-left">
                Want to learn directly from {selectedTrainer.name.split(' ')[0]}?
              </span>

              <button
                onClick={() => {
                  setSelectedTrainer(null)
                  setEnquiryOpen(true)
                }}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold text-xs sm:text-sm hover:from-red-700 hover:to-rose-700 transition-all shadow-md shadow-red-600/20 cursor-pointer text-center"
              >
                Schedule Faculty Counselling
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enquiry Modal */}
      <EnquiryModal isOpen={enquiryOpen} onClose={() => setEnquiryOpen(false)} />
    </section>
  )
}

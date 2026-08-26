'use client'

import Image from 'next/image'
import { Star, ShieldCheck, ArrowRight, Briefcase, Award, CheckCircle } from 'lucide-react'
import { TrainerItem } from '@/types/training'

interface TrainerCardProps {
  trainer: TrainerItem
  onSelect: (trainer: TrainerItem) => void
}

export default function TrainerCard({ trainer, onSelect }: TrainerCardProps) {
  return (
    <div
      onClick={() => onSelect(trainer)}
      className="group bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer"
    >
      {/* ── PHOTO CONTAINER (3:4 Ratio) ─────────────────────────────── */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-100">
        <Image
          src={trainer.image}
          alt={trainer.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover object-top group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Soft Bottom Gradient Overlay for Typography Contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A1628]/80 via-[#0A1628]/15 to-transparent pointer-events-none" />

        {/* Floating Experience Badge (Top-Left) */}
        <div className="absolute top-3.5 left-3.5 px-3 py-1 rounded-full bg-[#0A1628]/85 backdrop-blur-md border border-white/20 text-white text-[11px] font-extrabold tracking-wide flex items-center gap-1.5 shadow-sm">
          <Briefcase className="w-3 h-3 text-red-400" />
          <span>{trainer.experience}</span>
        </div>

        {/* Floating Rating Badge (Top-Right) */}
        <div className="absolute top-3.5 right-3.5 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-amber-300 text-[11px] font-black flex items-center gap-1 shadow-sm">
          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
          <span>{trainer.rating}</span>
        </div>

        {/* Ex-Company Pill at Bottom of Photo */}
        <div className="absolute bottom-3 left-3 right-3">
          <div className="px-3 py-1.5 rounded-xl bg-white/95 backdrop-blur-md border border-white/40 shadow-md">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-800 block truncate">
              {trainer.exCompany}
            </span>
          </div>
        </div>
      </div>

      {/* ── CARD BODY ─────────────────────────────────────────────────── */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between bg-white">
        <div>
          {/* Trainer Name + Verified Badge */}
          <div className="flex items-center gap-1.5 mb-1">
            <h3 className="text-lg font-black text-[#0A1628] group-hover:text-[#E63946] transition-colors leading-tight truncate">
              {trainer.name}
            </h3>
            <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
          </div>

          {/* Role Title */}
          <p className="text-xs font-bold text-[#E63946] mb-2.5 truncate">
            {trainer.role}
          </p>

          {/* 2-Line Bio */}
          <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 h-9 mb-4">
            {trainer.bio}
          </p>

          {/* Skills / Specialization Tags */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {trainer.skills.slice(0, 2).map((skill, idx) => (
              <span
                key={idx}
                className="px-2.5 py-0.5 rounded-lg bg-slate-50 border border-slate-200/80 text-slate-600 text-[10.5px] font-semibold"
              >
                {skill}
              </span>
            ))}
            {trainer.skills.length > 2 && (
              <span className="px-1.5 py-0.5 rounded-lg bg-slate-100 text-slate-500 text-[10.5px] font-bold">
                +{trainer.skills.length - 2}
              </span>
            )}
          </div>
        </div>

        {/* Footer Row: Impact & Action */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="text-[11px] font-bold text-slate-500">
            <span>{trainer.studentsTrained}+ Trained</span>
          </div>

          <div className="inline-flex items-center gap-1 text-xs font-extrabold text-[#0A1628] group-hover:text-[#E63946] group-hover:translate-x-1 transition-all">
            <span>View Profile</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </div>
  )
}

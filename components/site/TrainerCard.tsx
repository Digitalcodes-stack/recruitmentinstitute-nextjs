'use client'

import Image from 'next/image'
import { Star, Award, Building2, ArrowRight } from 'lucide-react'
import { TrainerItem } from '@/types/training'

interface TrainerCardProps {
  trainer: TrainerItem
  onSelect: (trainer: TrainerItem) => void
}

export default function TrainerCard({ trainer, onSelect }: TrainerCardProps) {
  return (
    <div className="group h-full bg-white rounded-2xl border border-slate-200/80 hover:border-slate-300 hover:-translate-y-1 transition-all duration-200 shadow-xs hover:shadow-md flex flex-col justify-between overflow-hidden">
      {/* ── Photo Container with Consistent 4:3 Aspect Ratio ──────── */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
        <Image
          src={trainer.image}
          alt={trainer.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover object-top transition-transform duration-300 group-hover:scale-103"
          priority={trainer.id <= 3}
        />

        {/* Subtle dark gradient on bottom for text contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />

        {/* Small Experience Badge (Top Left) */}
        <div className="absolute top-3.5 left-3.5 inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-950/75 backdrop-blur-md text-white text-[11px] font-bold">
          <Award className="w-3 h-3 text-amber-400" />
          <span>{trainer.experienceYears}+ Yrs</span>
        </div>

        {/* Small Rating Badge (Top Right) */}
        <div className="absolute top-3.5 right-3.5 inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-950/75 backdrop-blur-md text-white text-[11px] font-bold">
          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
          <span>{trainer.rating.toFixed(2)}</span>
        </div>

        {/* Previous Company (Bottom of Photo) */}
        {trainer.companyEx && (
          <div className="absolute bottom-3 left-3.5 right-3.5">
            <span className="inline-block px-2 py-0.5 rounded bg-slate-950/80 backdrop-blur-md text-[10.5px] font-bold uppercase tracking-wider text-amber-300 truncate max-w-full">
              {trainer.companyEx}
            </span>
          </div>
        )}
      </div>

      {/* ── Card Body (Generous, Balanced Padding) ─────────────────── */}
      <div className="p-5 sm:p-6 flex flex-col flex-1 justify-between">
        <div>
          {/* Trainer Name */}
          <h3 className="text-lg font-bold text-[#0A1628] tracking-tight group-hover:text-[#E63946] transition-colors leading-tight">
            {trainer.name}
          </h3>

          {/* Role / Designation (1 Line) */}
          <p className="text-xs font-semibold text-[#E63946] mt-1 truncate">
            {trainer.designation}
          </p>

          {/* Short Bio (2 Lines Max, Fixed Height to Align Grid) */}
          <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 mt-3 h-9">
            {trainer.bio}
          </p>
        </div>

        {/* Footer Row (Aligned CTA) */}
        <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">
            {trainer.studentsMentored}+ Trained
          </span>

          <button
            onClick={() => onSelect(trainer)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0A1628] group-hover:text-[#E63946] transition-colors cursor-pointer"
          >
            <span>View Profile</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  )
}

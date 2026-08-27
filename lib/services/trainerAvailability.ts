/**
 * trainerAvailability.ts
 * Finds trainers available for a given weekly class schedule (days + time window),
 * ranked by current workload so batches spread evenly across the trainer pool.
 */

import { prisma } from '@/lib/prisma'

export interface ScheduleRequirement {
  classDays: number[]  // 0=Sun ... 6=Sat
  startTime: string    // "HH:mm"
  endTime: string      // "HH:mm"
}

export interface RankedTrainer {
  id: number
  name: string
  specialization: string | null
  activeBatchCount: number
  matchesSpecialization: boolean
}

/** True if a trainer's declared slot on `day` fully covers [startTime, endTime]. */
function slotCovers(slot: { dayOfWeek: number; startTime: string; endTime: string }, day: number, startTime: string, endTime: string) {
  return slot.dayOfWeek === day && slot.startTime <= startTime && slot.endTime >= endTime
}

/**
 * Returns active trainers who declared availability covering every requested class day/time,
 * ranked by fewest active (UPCOMING/ACTIVE) batches first, then by specialization match.
 * A trainer with zero declared availability rows is excluded — they haven't set a schedule yet.
 */
export async function findAvailableTrainers(
  requirement: ScheduleRequirement,
  opts: { specialization?: string | null } = {},
): Promise<RankedTrainer[]> {
  const trainers = await prisma.trainer.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      specialization: true,
      availability: { select: { dayOfWeek: true, startTime: true, endTime: true } },
      batches: { where: { status: { in: ['UPCOMING', 'ACTIVE'] } }, select: { id: true } },
    },
  })

  const specNeedle = opts.specialization?.toLowerCase().trim()

  const eligible = trainers.filter((t) =>
    requirement.classDays.every((day) =>
      t.availability.some((slot) => slotCovers(slot, day, requirement.startTime, requirement.endTime))
    )
  )

  const ranked: RankedTrainer[] = eligible.map((t) => ({
    id: t.id,
    name: t.name,
    specialization: t.specialization,
    activeBatchCount: t.batches.length,
    matchesSpecialization: !!specNeedle && !!t.specialization?.toLowerCase().includes(specNeedle),
  }))

  // Fewer active batches wins first (avoid overload); specialization match breaks ties.
  ranked.sort((a, b) => {
    if (a.activeBatchCount !== b.activeBatchCount) return a.activeBatchCount - b.activeBatchCount
    if (a.matchesSpecialization !== b.matchesSpecialization) return a.matchesSpecialization ? -1 : 1
    return 0
  })

  return ranked
}

/** Picks the single best trainer for a schedule, or null if nobody is available. */
export async function pickBestTrainer(
  requirement: ScheduleRequirement,
  opts: { specialization?: string | null } = {},
): Promise<RankedTrainer | null> {
  const ranked = await findAvailableTrainers(requirement, opts)
  return ranked[0] ?? null
}

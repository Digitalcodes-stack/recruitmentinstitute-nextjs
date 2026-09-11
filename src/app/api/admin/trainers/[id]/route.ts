import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession, hashPassword } from '@/lib/auth'
import { z } from 'zod'
import { trainerAvailabilitySlotSchema } from '@/lib/validations'

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  phone: z.string().optional(),
  specialization: z.string().optional(),
  bio: z.string().max(2000).optional(),
  image: z.string().optional(),
  isActive: z.boolean().optional(),
  profileJson: z.record(z.string(), z.any()).optional(),
  designation: z.string().optional(),
  experienceYears: z.coerce.number().optional(),
  companyEx: z.string().optional(),
  linkedinUrl: z.string().optional(),
  quote: z.string().optional(),
  longBio: z.string().optional(),
  specializationTags: z.array(z.string()).optional(),
  certifications: z.array(z.string()).optional(),
  coursesTaught: z.array(z.string()).optional(),
  availability: z.array(trainerAvailabilitySlotSchema).optional(),
})

const trainerSelect = {
  id: true, name: true, email: true, phone: true, specialization: true,
  bio: true, image: true, isActive: true, profileJson: true, createdAt: true,
  availability: { select: { id: true, dayOfWeek: true, startTime: true, endTime: true } },
} as const

async function guard() {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin')
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  return null
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const err = await guard()
  if (err) return err

  const { id } = await params
  const trainer = await prisma.trainer.findUnique({ where: { id: parseInt(id) }, select: trainerSelect })
  if (!trainer) return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 })
  return NextResponse.json({ success: true, data: trainer })
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const err = await guard()
  if (err) return err

  const { id } = await params
  const body = await req.json()
  const validated = updateSchema.safeParse(body)
  if (!validated.success)
    return NextResponse.json({ success: false, errors: validated.error.flatten().fieldErrors }, { status: 400 })

  const trainerId = parseInt(id)
  const existing = await prisma.trainer.findUnique({
    where: { id: trainerId },
    select: { profileJson: true },
  })
  const existingProfile = (existing?.profileJson && typeof existing.profileJson === 'object')
    ? (existing.profileJson as Record<string, any>)
    : {}

  const {
    password,
    availability,
    profileJson: incomingProfileJson,
    designation,
    experienceYears,
    companyEx,
    linkedinUrl,
    quote,
    longBio,
    specializationTags,
    certifications,
    coursesTaught,
    ...rest
  } = validated.data

  const mergedProfile: Record<string, any> = {
    ...existingProfile,
    ...(incomingProfileJson || {}),
  }

  if (designation !== undefined) mergedProfile.designation = designation.trim()
  if (experienceYears !== undefined) mergedProfile.experienceYears = experienceYears
  if (companyEx !== undefined) mergedProfile.companyEx = companyEx.trim()
  if (linkedinUrl !== undefined) mergedProfile.linkedinUrl = linkedinUrl.trim()
  if (quote !== undefined) mergedProfile.quote = quote.trim()
  if (longBio !== undefined) mergedProfile.longBio = longBio.trim()
  if (rest.bio !== undefined) mergedProfile.bio = rest.bio.trim()
  if (specializationTags !== undefined) mergedProfile.specializationTags = specializationTags
  if (certifications !== undefined) mergedProfile.certifications = certifications
  if (coursesTaught !== undefined) mergedProfile.coursesTaught = coursesTaught

  const data: any = {
    ...rest,
    profileJson: mergedProfile,
  }

  if (designation && !rest.specialization) {
    data.specialization = designation.trim()
  }

  if (password) {
    data.password = await hashPassword(password)
  }

  // Availability has no stable per-slot identity from the client — replace the whole set.
  const trainer = await prisma.$transaction(async (tx) => {
    if (availability !== undefined) {
      await tx.trainerAvailability.deleteMany({ where: { trainerId } })
      if (availability.length) {
        await tx.trainerAvailability.createMany({
          data: availability.map((slot) => ({ ...slot, trainerId })),
        })
      }
    }
    return tx.trainer.update({ where: { id: trainerId }, data, select: trainerSelect })
  })
  return NextResponse.json({ success: true, data: trainer })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const err = await guard()
  if (err) return err

  const { id } = await params
  await prisma.trainer.delete({ where: { id: parseInt(id) } })
  return NextResponse.json({ success: true, message: 'Trainer deleted' })
}

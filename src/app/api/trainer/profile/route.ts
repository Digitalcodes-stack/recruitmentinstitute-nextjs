import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserSession, hashPassword } from '@/lib/auth'

export async function GET() {
  const session = await getUserSession()
  if (!session || session.type !== 'trainer') {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  const trainer = await prisma.trainer.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      specialization: true,
      bio: true,
      image: true,
      profileJson: true,
      isActive: true,
    },
  })

  if (!trainer) {
    return NextResponse.json({ success: false, message: 'Trainer not found' }, { status: 404 })
  }

  const profile = (typeof trainer.profileJson === 'object' && trainer.profileJson !== null)
    ? (trainer.profileJson as Record<string, any>)
    : {}

  return NextResponse.json({
    success: true,
    data: {
      id: trainer.id,
      name: trainer.name,
      email: trainer.email,
      phone: trainer.phone || '',
      image: trainer.image || '',
      designation: profile.designation || trainer.specialization || '',
      experienceYears: profile.experienceYears ?? 15,
      companyEx: profile.companyEx || '',
      linkedinUrl: profile.linkedinUrl || '',
      quote: profile.quote || '',
      bio: trainer.bio || profile.bio || '',
      longBio: profile.longBio || trainer.bio || '',
      specializationTags: Array.isArray(profile.specializationTags)
        ? profile.specializationTags
        : (trainer.specialization ? trainer.specialization.split(',').map((s: string) => s.trim()).filter(Boolean) : []),
      certifications: Array.isArray(profile.certifications) ? profile.certifications : [],
      coursesTaught: Array.isArray(profile.coursesTaught) ? profile.coursesTaught : [],
    },
  })
}

export async function PUT(req: NextRequest) {
  const session = await getUserSession()
  if (!session || session.type !== 'trainer') {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const {
      name,
      phone,
      password,
      image,
      designation,
      experienceYears,
      companyEx,
      linkedinUrl,
      quote,
      bio,
      longBio,
      specializationTags,
      certifications,
      coursesTaught,
    } = body

    const existing = await prisma.trainer.findUnique({
      where: { id: session.userId },
      select: { profileJson: true },
    })

    const existingProfile = (existing?.profileJson && typeof existing.profileJson === 'object')
      ? (existing.profileJson as Record<string, any>)
      : {}

    const updatedProfile: Record<string, any> = {
      ...existingProfile,
      designation: designation !== undefined ? String(designation).trim() : existingProfile.designation,
      experienceYears: experienceYears !== undefined ? Number(experienceYears) : existingProfile.experienceYears,
      companyEx: companyEx !== undefined ? String(companyEx).trim() : existingProfile.companyEx,
      linkedinUrl: linkedinUrl !== undefined ? String(linkedinUrl).trim() : existingProfile.linkedinUrl,
      quote: quote !== undefined ? String(quote).trim() : existingProfile.quote,
      bio: bio !== undefined ? String(bio).trim() : existingProfile.bio,
      longBio: longBio !== undefined ? String(longBio).trim() : existingProfile.longBio,
      specializationTags: Array.isArray(specializationTags) ? specializationTags : existingProfile.specializationTags,
      certifications: Array.isArray(certifications) ? certifications : existingProfile.certifications,
      coursesTaught: Array.isArray(coursesTaught) ? coursesTaught : existingProfile.coursesTaught,
    }

    const updateData: any = {
      profileJson: updatedProfile,
    }

    if (name && typeof name === 'string' && name.trim()) {
      updateData.name = name.trim()
    }
    if (phone !== undefined) {
      updateData.phone = String(phone).trim() || null
    }
    if (image !== undefined) {
      updateData.image = String(image).trim() || null
    }
    if (designation !== undefined) {
      updateData.specialization = String(designation).trim()
    }
    if (bio !== undefined) {
      updateData.bio = String(bio).trim().slice(0, 2000)
    }
    if (password && typeof password === 'string' && password.trim().length >= 6) {
      updateData.password = await hashPassword(password.trim())
    }

    const updatedTrainer = await prisma.trainer.update({
      where: { id: session.userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        specialization: true,
        bio: true,
        image: true,
        profileJson: true,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedTrainer,
    })
  } catch (err: any) {
    console.error('Error updating trainer profile:', err)
    return NextResponse.json(
      { success: false, message: err.message || 'Failed to update profile' },
      { status: 500 }
    )
  }
}

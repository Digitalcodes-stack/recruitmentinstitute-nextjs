import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'

import { hashPassword } from '@/lib/auth'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin') {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const candidateId = parseInt(id)
  const currentCandidate = await prisma.candidate.findUnique({ where: { id: candidateId } })
  if (!currentCandidate) {
    return NextResponse.json({ success: false, message: 'Candidate not found' }, { status: 404 })
  }

  try {
    const body = await req.json()
    const { name, email, mobile, phone, birthdate, city, gender, address, courseSelect, acceptSignin, password } = body

    const updateData: any = {}

    if (name !== undefined) {
      if (!name.trim()) return NextResponse.json({ success: false, message: 'Name cannot be empty' }, { status: 400 })
      updateData.name = name.trim()
    }

    if (email !== undefined) {
      const cleanEmail = email.trim().toLowerCase()
      if (!cleanEmail.includes('@')) {
        return NextResponse.json({ success: false, message: 'Valid email is required' }, { status: 400 })
      }
      if (cleanEmail !== currentCandidate.email.toLowerCase()) {
        const existing = await prisma.candidate.findUnique({ where: { email: cleanEmail } })
        if (existing && existing.id !== candidateId) {
          return NextResponse.json({ success: false, message: 'A candidate with this email already exists' }, { status: 409 })
        }
      }
      updateData.email = cleanEmail
    }

    if (mobile !== undefined) updateData.mobile = mobile ? mobile.trim() : null
    if (phone !== undefined) updateData.phone = phone ? phone.trim() : null
    if (birthdate !== undefined) {
      if (!birthdate) {
        updateData.birthdate = null
      } else {
        const parsedDate = new Date(birthdate)
        updateData.birthdate = isNaN(parsedDate.getTime()) ? null : parsedDate
      }
    }
    if (city !== undefined) updateData.city = city ? city.trim() : null
    if (gender !== undefined) updateData.gender = gender ? gender.trim() : null
    if (address !== undefined) {
      updateData.address = address ? address.trim() : null
      updateData.streetAddress = address ? address.trim() : null
    }
    if (courseSelect !== undefined) updateData.courseSelect = courseSelect ? courseSelect.trim() : null
    if (acceptSignin !== undefined) updateData.acceptSignin = Number(acceptSignin)

    let hashedPassword: string | undefined = undefined
    if (password && password.trim().length > 0) {
      if (password.trim().length < 6) {
        return NextResponse.json({ success: false, message: 'Password must be at least 6 characters' }, { status: 400 })
      }
      hashedPassword = await hashPassword(password.trim())
      updateData.password = hashedPassword
    }

    const candidate = await prisma.candidate.update({
      where: { id: candidateId },
      data: updateData,
    })

    // Keep Student table synchronized
    const oldEmail = currentCandidate.email.trim().toLowerCase()
    const effectiveEmail = candidate.email.trim().toLowerCase()
    const contactNumber = candidate.mobile || candidate.phone || null

    if (candidate.acceptSignin === 1) {
      await prisma.student.upsert({
        where: { email: effectiveEmail },
        update: {
          name: candidate.name,
          contact: contactNumber,
          ...(hashedPassword ? { password: hashedPassword } : {}),
          isActive: true,
        },
        create: {
          name: candidate.name,
          email: effectiveEmail,
          password: candidate.password,
          contact: contactNumber,
          isActive: true,
        },
      })
      // If email changed, also update any record that had oldEmail
      if (oldEmail !== effectiveEmail) {
        await prisma.student.updateMany({
          where: { email: oldEmail },
          data: {
            name: candidate.name,
            email: effectiveEmail,
            contact: contactNumber,
            ...(hashedPassword ? { password: hashedPassword } : {}),
          },
        })
      }
    } else if (candidate.acceptSignin === 0) {
      await prisma.student.updateMany({
        where: { OR: [{ email: oldEmail }, { email: effectiveEmail }] },
        data: {
          name: candidate.name,
          email: effectiveEmail,
          contact: contactNumber,
          isActive: false,
          ...(hashedPassword ? { password: hashedPassword } : {}),
        },
      })
    } else {
      // General profile sync even if acceptSignin wasn't toggled
      await prisma.student.updateMany({
        where: { OR: [{ email: oldEmail }, { email: effectiveEmail }] },
        data: {
          name: candidate.name,
          email: effectiveEmail,
          contact: contactNumber,
          ...(hashedPassword ? { password: hashedPassword } : {}),
        },
      })
    }

    return NextResponse.json({ success: true, data: candidate, message: 'Candidate updated successfully' })
  } catch (error) {
    console.error('Update candidate error:', error)
    return NextResponse.json({ success: false, message: 'Failed to update candidate' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin') {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  await prisma.candidate.delete({ where: { id: parseInt(id) } })
  return NextResponse.json({ success: true, message: 'Candidate deleted' })
}

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserSession, hashPassword, signToken, setUserCookie } from '@/lib/auth'

export async function GET() {
  const session = await getUserSession()
  if (!session) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  try {
    let profile: any = null

    if (session.type === 'student') {
      const student = await prisma.student.findUnique({
        where: { id: session.userId },
        select: {
          id: true,
          name: true,
          email: true,
          contact: true,
          city: true,
          gender: true,
          address: true,
          createdAt: true,
          isActive: true,
        },
      })
      if (student) {
        profile = {
          ...student,
          type: 'student',
          phone: student.contact,
        }
      }
    } else if (session.type === 'membership') {
      const member = await prisma.membership.findUnique({
        where: { id: session.userId },
        select: { id: true, name: true, email: true, contact: true, createdAt: true, isActive: true },
      })
      if (member) {
        profile = {
          ...member,
          type: 'membership',
          phone: member.contact,
        }
      }
    }

    if (!profile) {
      return NextResponse.json({ success: false, message: 'User profile not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: profile })
  } catch (error) {
    console.error('Fetch profile error:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getUserSession()
  if (!session) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { name, email, contact, phone, city, gender, address, password } = body

    if (!name?.trim()) {
      return NextResponse.json({ success: false, message: 'Name is required' }, { status: 400 })
    }
    if (!email?.trim() || !email.includes('@')) {
      return NextResponse.json({ success: false, message: 'Valid email is required' }, { status: 400 })
    }

    const cleanEmail = email.trim().toLowerCase()
    const currentEmail = session.email.trim().toLowerCase()
    const phoneNumber = (contact || phone || '').trim() || null

    // If changing email, ensure it's not already in use by another student/member
    if (cleanEmail !== currentEmail) {
      const [existingStudent, existingMember] = await Promise.all([
        prisma.student.findUnique({ where: { email: cleanEmail } }),
        prisma.membership.findUnique({ where: { email: cleanEmail } }),
      ])

      const isConflict =
        (session.type === 'student' && existingStudent && existingStudent.id !== session.userId) ||
        (session.type === 'membership' && existingMember && existingMember.id !== session.userId)

      if (isConflict) {
        return NextResponse.json({ success: false, message: 'This email is already in use by another account' }, { status: 409 })
      }
    }

    let hashedPassword: string | undefined = undefined
    if (password && password.trim().length > 0) {
      if (password.trim().length < 6) {
        return NextResponse.json({ success: false, message: 'Password must be at least 6 characters' }, { status: 400 })
      }
      hashedPassword = await hashPassword(password.trim())
    }

    let updatedUserId = session.userId
    const updatedName = name.trim()

    if (session.type === 'student') {
      const updateData: any = {
        name: updatedName,
        email: cleanEmail,
        contact: phoneNumber,
        city: city?.trim() || null,
        gender: gender?.trim() || null,
        address: address?.trim() || null,
      }
      if (hashedPassword) updateData.password = hashedPassword

      const student = await prisma.student.update({
        where: { id: session.userId },
        data: updateData,
      })
      updatedUserId = student.id
    } else if (session.type === 'membership') {
      const updateData: any = {
        name: updatedName,
        email: cleanEmail,
        contact: phoneNumber,
      }
      if (hashedPassword) updateData.password = hashedPassword

      const member = await prisma.membership.update({
        where: { id: session.userId },
        data: updateData,
      })
      updatedUserId = member.id
    }

    // Refresh JWT session cookie
    const newToken = signToken({
      userId: updatedUserId,
      email: cleanEmail,
      name: updatedName,
      role: session.role || 'EMPLOYEE',
      type: session.type,
    })

    const response = NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: updatedUserId,
        name: updatedName,
        email: cleanEmail,
        contact: phoneNumber,
        type: session.type,
      },
    })

    response.cookies.set(setUserCookie(newToken))
    return response
  } catch (error) {
    console.error('Update profile error:', error)
    return NextResponse.json({ success: false, message: 'Failed to update profile' }, { status: 500 })
  }
}

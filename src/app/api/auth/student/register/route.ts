import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, signToken, setUserCookie } from '@/lib/auth'
import { studentRegisterSchema } from '@/lib/validations'
import { sendRegistrationEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validated = studentRegisterSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { success: false, message: 'Validation failed', errors: validated.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { name, password, city, gender, address, courseSelect, comments } = validated.data
    const phone = (validated.data.contact || validated.data.phone || '').trim() || null
    const email = validated.data.email.trim().toLowerCase()

    const existing = await prisma.student.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ success: false, message: 'An account with this email already exists' }, { status: 409 })
    }

    const hashedPassword = await hashPassword(password)

    const student = await prisma.student.create({
      data: {
        name: name.trim(),
        email,
        password: hashedPassword,
        contact: phone,
        city: city?.trim() || null,
        gender: gender?.trim() || null,
        address: address?.trim() || null,
        isActive: true,
      },
    })

    // Notify student & admin via email
    await sendRegistrationEmail({
      name: student.name,
      email: student.email,
      type: 'student',
      phone: phone || undefined,
      courseSelect: courseSelect || undefined,
      city: city || undefined,
      address: address || undefined,
      comments: comments || undefined,
    }).catch((err) => console.error('[Student Register] Email notification error:', err))

    // Automatically authenticate the new student
    const token = signToken({
      userId: student.id,
      email: student.email,
      name: student.name,
      role: 'EMPLOYEE',
      type: 'student',
    })

    const response = NextResponse.json({
      success: true,
      message: 'Registration successful! Welcome to Recruitment Institute.',
      user: {
        id: student.id,
        name: student.name,
        email: student.email,
        type: 'student',
      },
    })

    response.cookies.set(setUserCookie(token))
    return response
  } catch (error) {
    console.error('Student registration error:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}

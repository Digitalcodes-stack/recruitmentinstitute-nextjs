import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'
import { candidateSignupSchema } from '@/lib/validations'
import { sendRegistrationEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validated = candidateSignupSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { success: false, message: 'Validation failed', errors: validated.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { name, password, birthdate, gender, address, streetAddress, city, state, zip, phone, courseSelect, comments } = validated.data
    const email = validated.data.email.trim().toLowerCase()

    const existing = await prisma.candidate.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ success: false, message: 'Email already registered' }, { status: 409 })
    }

    const hashedPassword = await hashPassword(password)

    await prisma.candidate.create({
      data: {
        name,
        email,
        password: hashedPassword,
        mobile: phone,
        birthdate: birthdate ? new Date(birthdate) : null,
        gender,
        address,
        streetAddress,
        city,
        state,
        zip,
        phone,
        courseSelect,
        comments,
        acceptSignin: 0,
      },
    })

    await sendRegistrationEmail({
      name,
      email,
      type: 'candidate',
      phone,
      courseSelect,
      city,
      state,
      address,
      comments,
    }).catch(console.error)

    return NextResponse.json({
      success: true,
      message: 'Registration submitted. Pending admin approval.',
    })
  } catch (error) {
    console.error('Candidate register error:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}

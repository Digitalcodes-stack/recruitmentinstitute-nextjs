import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { courseEnquirySchema } from '@/lib/validations'
import { sendCourseEnquiryEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validated = courseEnquirySchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { success: false, message: 'Validation failed', errors: validated.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { firstName, lastName, email, contact } = validated.data

    await prisma.courseLead.create({
      data: { firstName, lastName, email, contact },
    })

    await sendCourseEnquiryEmail({ firstName, lastName, email, contact }).catch(console.error)

    return NextResponse.json({ success: true, msg: 1, message: 'Enquiry submitted successfully' })
  } catch (error) {
    console.error('Course enquiry error:', error)
    return NextResponse.json({ success: false, msg: 0, message: 'Internal server error' }, { status: 500 })
  }
}

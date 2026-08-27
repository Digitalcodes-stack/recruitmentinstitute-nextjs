import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { sendFeesEnquiryEmail } from '@/lib/email'

const feesEnquirySchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().optional(),
  email: z.string().email(),
  contact: z.string().min(10),
  visitorDate: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validated = feesEnquirySchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json({ success: false, message: 'Validation failed' }, { status: 400 })
    }

    const { firstName, lastName, email, contact, visitorDate } = validated.data

    await prisma.feesLead.create({
      data: {
        firstName,
        lastName,
        email,
        contact,
        visitorDate: visitorDate ? new Date(visitorDate) : null,
      },
    })

    await sendFeesEnquiryEmail({ firstName, lastName, email, contact, visitorDate }).catch(console.error)

    return NextResponse.json({ success: true, message: 'Fees enquiry submitted' })
  } catch (error) {
    console.error('Fees enquiry error:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}

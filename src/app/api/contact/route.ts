import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { contactSchema } from '@/lib/validations'
import { sendContactEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validated = contactSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { success: false, message: 'Validation failed', errors: validated.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { name, email, mobile, message, interest } = validated.data

    const savedMessage = interest
      ? `[Inquiry Option: ${interest}]\n\n${message}`
      : message

    await prisma.contactSubmission.create({
      data: { name, email, message: savedMessage, mobile },
    })

    await sendContactEmail({ name, email, mobile, message, interest }).catch(console.error)

    return NextResponse.json({ success: true, message: 'Message sent successfully' })
  } catch (error) {
    console.error('Contact API error:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}

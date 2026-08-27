import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth'
import { issueCertificate, AlreadyCertifiedError, FailingScoreError } from '@/lib/services/certificates'

async function guard() {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin')
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  return null
}

/** POST — issue a certificate for this enrollment, given the final score. */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const err = await guard()
  if (err) return err

  const { id } = await params
  const enrollmentId = parseInt(id)
  if (isNaN(enrollmentId)) return NextResponse.json({ success: false, message: 'Invalid id' }, { status: 400 })

  const body = await req.json().catch(() => ({}))
  const finalScore = Number(body.finalScore)
  if (isNaN(finalScore) || finalScore < 0 || finalScore > 100) {
    return NextResponse.json({ success: false, message: 'finalScore must be a number between 0 and 100' }, { status: 400 })
  }

  try {
    const certificate = await issueCertificate(enrollmentId, finalScore)
    return NextResponse.json({ success: true, data: certificate }, { status: 201 })
  } catch (err) {
    if (err instanceof AlreadyCertifiedError) return NextResponse.json({ success: false, message: err.message }, { status: 409 })
    if (err instanceof FailingScoreError) return NextResponse.json({ success: false, message: err.message }, { status: 422 })
    const message = err instanceof Error ? err.message : 'Failed to issue certificate'
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}

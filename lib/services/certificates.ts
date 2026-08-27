/**
 * certificates.ts
 * Issues a certificate for a completed enrollment. Called by the admin "Issue
 * Certificate" action today; wire this into the FastAPI grading webhook later
 * to go fully automatic once that integration point is confirmed.
 */

import { prisma } from '@/lib/prisma'
import { sendCertificateIssuedEmail } from '@/lib/email'

const PASSING_SCORE = 50 // percent; ponytail: flat threshold, move to per-course config if courses need different bars

export class AlreadyCertifiedError extends Error {
  constructor() { super('This enrollment already has a certificate.'); this.name = 'AlreadyCertifiedError' }
}
export class FailingScoreError extends Error {
  constructor(score: number) { super(`Score ${score}% is below the ${PASSING_SCORE}% passing threshold.`); this.name = 'FailingScoreError' }
}

function generateCertificateNo(enrollmentId: number) {
  const year = new Date().getFullYear()
  return `RI-CERT-${year}-${String(enrollmentId).padStart(6, '0')}`
}

/**
 * Issues a certificate for an enrollment, given a final score. Idempotent —
 * throws AlreadyCertifiedError if one already exists rather than duplicating.
 */
export async function issueCertificate(enrollmentId: number, finalScore: number) {
  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    include: {
      student: { select: { name: true, email: true } },
      batch: { include: { course: { select: { title: true } } } },
      certificate: true,
    },
  })
  if (!enrollment) throw new Error('Enrollment not found')
  if (enrollment.certificate) throw new AlreadyCertifiedError()
  if (finalScore < PASSING_SCORE) throw new FailingScoreError(finalScore)

  const certificate = await prisma.certificate.create({
    data: {
      enrollmentId,
      certificateNo: generateCertificateNo(enrollmentId),
      studentName: enrollment.student.name,
      courseTitle: enrollment.batch.course.title,
      finalScore,
    },
  })

  await sendCertificateIssuedEmail({
    studentEmail: enrollment.student.email,
    studentName: enrollment.student.name,
    courseTitle: enrollment.batch.course.title,
    certificateNo: certificate.certificateNo,
    finalScore,
  }).catch((err) => console.error('[certificates] Failed to send certificate email:', err))

  return certificate
}

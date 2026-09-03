import { prisma } from '@/lib/prisma'

/**
 * Synchronizes approved candidates from `candidate_login` (Candidate model)
 * into `login_student` (Student model).
 *
 * This ensures that any newly added or approved candidate immediately has an active
 * Student record, enabling them to appear in batch enrollment dropdowns, the student
 * directory, and LMS access controls.
 */
export async function syncApprovedCandidatesToStudents() {
  try {
    const approvedCandidates = await prisma.candidate.findMany({
      where: { acceptSignin: 1 },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        mobile: true,
        phone: true,
      },
    })

    for (const cand of approvedCandidates) {
      if (!cand.email) continue
      const email = cand.email.trim().toLowerCase()

      await prisma.student.upsert({
        where: { email },
        update: {
          name: cand.name,
          contact: cand.mobile || cand.phone || undefined,
          isActive: true,
        },
        create: {
          name: cand.name,
          email,
          password: cand.password,
          contact: cand.mobile || cand.phone || null,
          isActive: true,
        },
      })
    }
  } catch (err) {
    console.error('Error syncing approved candidates to students:', err)
  }
}

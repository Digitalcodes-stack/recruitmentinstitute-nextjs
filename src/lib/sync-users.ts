/**
 * Deprecated helper: The platform now strictly uses Student, Trainer, and Admin roles.
 * All registrations directly create active Student records.
 */
export async function syncApprovedCandidatesToStudents(): Promise<void> {
  // No-op: Candidate role removed, Students are natively active and managed directly.
  return Promise.resolve()
}

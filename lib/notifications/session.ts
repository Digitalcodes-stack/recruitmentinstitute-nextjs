import type { RecipientType } from '@prisma/client'
import type { AuthSession } from '@/types'

const TYPE_MAP: Record<AuthSession['type'], RecipientType | null> = {
  student: 'STUDENT',
  admin: 'ADMIN',
  trainer: 'TRAINER',
  membership: null,
  community: null,
}

export function recipientTypeForSession(session: AuthSession): RecipientType | null {
  return TYPE_MAP[session.type]
}

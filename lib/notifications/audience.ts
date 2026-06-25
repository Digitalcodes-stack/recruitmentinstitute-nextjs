import { prisma } from '@/lib/prisma'
import { AudienceType, RecipientType, NotificationChannel } from '@prisma/client'

export interface ResolvedRecipient {
  recipientType: RecipientType
  recipientId: number | null
  channel: NotificationChannel
  address: string
}

function addressForChannel(
  channel: NotificationChannel,
  person: { id: number; email?: string | null; contact?: string | null; phone?: string | null }
): string | null {
  if (channel === 'EMAIL') return person.email ?? null
  if (channel === 'SMS' || channel === 'WHATSAPP') return person.phone ?? person.contact ?? null
  if (channel === 'IN_APP' || channel === 'PUSH') return String(person.id)
  return null
}

async function studentsForFilter(filter: Record<string, unknown> | null) {
  const batchId = filter?.batchId as number | undefined
  const courseId = filter?.courseId as number | undefined

  if (batchId) {
    const enrollments = await prisma.enrollment.findMany({
      where: { batchId, status: { in: ['APPROVED', 'ACTIVE', 'ENROLLED'] } },
      include: { student: true },
    })
    return enrollments.map((e) => e.student)
  }
  if (courseId) {
    const enrollments = await prisma.enrollment.findMany({
      where: { batch: { courseId }, status: { in: ['APPROVED', 'ACTIVE', 'ENROLLED'] } },
      include: { student: true },
    })
    return enrollments.map((e) => e.student)
  }
  return prisma.student.findMany({ where: { isActive: true } })
}

export async function resolveAudience(
  audienceType: AudienceType,
  audienceFilter: Record<string, unknown> | null,
  channels: NotificationChannel[],
  customList?: { recipientType: RecipientType; recipientId: number; address?: string }[],
  optOutCategory?: string
): Promise<ResolvedRecipient[]> {
  const out: ResolvedRecipient[] = []

  const people: { recipientType: RecipientType; list: { id: number; email?: string | null; contact?: string | null; phone?: string | null }[] }[] = []

  if (audienceType === 'SINGLE' || audienceType === 'SEGMENT') {
    people.push({ recipientType: 'STUDENT', list: await studentsForFilter(audienceFilter) })
  } else if (audienceType === 'ALL_STUDENTS') {
    people.push({ recipientType: 'STUDENT', list: await prisma.student.findMany({ where: { isActive: true } }) })
  } else if (audienceType === 'ALL_CANDIDATES') {
    people.push({ recipientType: 'CANDIDATE', list: await prisma.candidate.findMany() })
  } else if (audienceType === 'CUSTOM_LIST') {
    for (const entry of customList ?? []) {
      for (const channel of channels) {
        const address = entry.address ?? null
        if (!address) continue
        out.push({ recipientType: entry.recipientType, recipientId: entry.recipientId, channel, address })
      }
    }
    return out
  }

  const optOuts = optOutCategory
    ? await prisma.notificationSubscription.findMany({
        where: { category: optOutCategory, isEnabled: false },
        select: { recipientType: true, recipientId: true, channel: true },
      })
    : []
  const optOutKey = (t: RecipientType, id: number, c: NotificationChannel) => `${t}:${id}:${c}`
  const optOutSet = new Set(optOuts.map((o) => optOutKey(o.recipientType, o.recipientId, o.channel)))

  for (const { recipientType, list } of people) {
    for (const person of list) {
      for (const channel of channels) {
        if (optOutSet.has(optOutKey(recipientType, person.id, channel))) continue
        const address = addressForChannel(channel, person)
        if (!address) continue
        out.push({ recipientType, recipientId: person.id, channel, address })
      }
    }
  }

  return out
}

import { google } from 'googleapis'

let jwtClient: InstanceType<typeof google.auth.JWT> | null = null

function getAuthClient() {
  if (jwtClient) return jwtClient

  const encodedKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_BASE64
  const impersonateEmail = process.env.GOOGLE_IMPERSONATE_EMAIL

  if (!encodedKey || !impersonateEmail) {
    throw new Error('Google Calendar credentials are not configured')
  }

  const keyJson = Buffer.from(encodedKey, 'base64').toString('utf8')
  const key = JSON.parse(keyJson)

  jwtClient = new google.auth.JWT({
    email: key.client_email,
    key: key.private_key,
    scopes: ['https://www.googleapis.com/auth/calendar.events'],
    subject: impersonateEmail,
  })
  return jwtClient
}

function getCalendarClient() {
  return google.calendar({ version: 'v3', auth: getAuthClient() })
}

export interface SessionEventInput {
  title: string
  description?: string | null
  startTime: Date
  endTime: Date
  attendees: { email: string }[]
  withMeet: boolean
  recurrence?: string[]
  reminders?: {
    useDefault?: boolean
    overrides?: Array<{ method: 'email' | 'popup'; minutes: number }>
  }
  eventId?: string
}

function extractMeetLink(
  event:
    | {
        hangoutLink?: string | null
        conferenceData?: {
          entryPoints?: Array<{ entryPointType?: string | null; uri?: string | null }>
        } | null
      }
    | null
    | undefined
) {
  const conferenceLink = event?.conferenceData?.entryPoints?.find((entry) => entry.entryPointType === 'video' && entry.uri)?.uri
  return conferenceLink ?? event?.hangoutLink ?? null
}

export async function createCalendarEvent(input: SessionEventInput): Promise<{ eventId: string; meetLink: string | null }> {
  const calendar = getCalendarClient()
  const calendarId = process.env.GOOGLE_IMPERSONATE_EMAIL!
  const requestId = input.eventId ?? crypto.randomUUID()

  const res = await calendar.events.insert({
    calendarId,
    requestBody: {
      id: input.eventId,
      summary: input.title,
      description: input.description ?? undefined,
      start: { dateTime: input.startTime.toISOString(), timeZone: process.env.GOOGLE_CALENDAR_TIME_ZONE || 'Asia/Kolkata' },
      end: { dateTime: input.endTime.toISOString(), timeZone: process.env.GOOGLE_CALENDAR_TIME_ZONE || 'Asia/Kolkata' },
      attendees: input.attendees,
      ...(input.recurrence?.length ? { recurrence: input.recurrence } : {}),
      reminders: input.reminders ?? {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },
          { method: 'email', minutes: 60 },
          { method: 'popup', minutes: 10 },
        ],
      },
      ...(input.withMeet && {
        conferenceData: {
          createRequest: {
            requestId,
            conferenceSolutionKey: { type: 'hangoutsMeet' },
          },
        },
      }),
      guestsCanModify: false,
    },
    conferenceDataVersion: input.withMeet ? 1 : 0,
    sendUpdates: 'all',
  })

  return { eventId: res.data.id!, meetLink: extractMeetLink(res.data) }
}

export async function patchCalendarEvent(eventId: string, input: Partial<SessionEventInput>): Promise<{ meetLink: string | null }> {
  const calendar = getCalendarClient()
  const calendarId = process.env.GOOGLE_IMPERSONATE_EMAIL!

  const res = await calendar.events.patch({
    calendarId,
    eventId,
    conferenceDataVersion: input.withMeet === false ? 0 : 1,
    sendUpdates: 'all',
    requestBody: {
      ...(input.title && { summary: input.title }),
      ...(input.description !== undefined && { description: input.description ?? undefined }),
      ...(input.startTime && { start: { dateTime: input.startTime.toISOString(), timeZone: 'Asia/Kolkata' } }),
      ...(input.endTime && { end: { dateTime: input.endTime.toISOString(), timeZone: 'Asia/Kolkata' } }),
      ...(input.attendees && { attendees: input.attendees }),
      ...(input.recurrence?.length ? { recurrence: input.recurrence } : {}),
      ...(input.reminders ? { reminders: input.reminders } : {}),
      ...(input.withMeet && {
        conferenceData: {
          createRequest: {
            requestId: input.eventId ?? crypto.randomUUID(),
            conferenceSolutionKey: { type: 'hangoutsMeet' },
          },
        },
      }),
    },
  })

  return { meetLink: extractMeetLink(res.data) }
}

export async function cancelCalendarEvent(eventId: string): Promise<void> {
  const calendar = getCalendarClient()
  const calendarId = process.env.GOOGLE_IMPERSONATE_EMAIL!

  await calendar.events.delete({ calendarId, eventId, sendUpdates: 'all' })
}

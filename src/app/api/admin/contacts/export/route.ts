import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'
import * as XLSX from 'xlsx'

export async function GET() {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin') {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  // 1. Fetch web form contacts
  const contacts = await prisma.contactSubmission.findMany({
    orderBy: { createdAt: 'desc' },
  })

  // 2. Fetch voice leads from AI-Desk
  let voiceData: any = { slots: [], conversations: [] }
  try {
    const aiDeskUrl =
      process.env.AIDESK_SERVICE_URL ||
      'https://recruitmentinstitute-aidesk-396924250862.asia-south1.run.app'
    const res = await fetch(`${aiDeskUrl}/api/public/voice-leads`, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    })
    if (res.ok) {
      const json = await res.json()
      if (json?.data) {
        voiceData = json.data
      }
    }
  } catch (e) {
    console.error('Error fetching voice leads for Excel export:', e)
  }

  const workbook = XLSX.utils.book_new()

  // Sheet 1: Web Enquiries
  const enquiriesData = contacts.map((c, idx) => ({
    '#': idx + 1,
    'Lead ID': c.id,
    'Date & Time (IST)': c.createdAt
      ? new Date(c.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
      : '',
    'Candidate Name': c.name || '',
    'Email Address': c.email || '',
    'Mobile Number': c.mobile || '',
    'Message / Inquiry Details': c.message || '',
  }))
  const wsEnquiries = XLSX.utils.json_to_sheet(
    enquiriesData.length ? enquiriesData : [{ Status: 'No web enquiries found' }]
  )
  wsEnquiries['!cols'] = [
    { wch: 5 },
    { wch: 10 },
    { wch: 22 },
    { wch: 25 },
    { wch: 30 },
    { wch: 18 },
    { wch: 80 },
  ]
  XLSX.utils.book_append_sheet(workbook, wsEnquiries, 'Web Enquiries')

  // Sheet 2: AI Voice Leads
  const voiceDataList = (voiceData.conversations || []).map((conv: any, idx: number) => {
    const startedStr = conv.started_at
      ? new Date(conv.started_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
      : ''
    const durationFormatted = conv.duration_seconds
      ? `${Math.floor(conv.duration_seconds / 60)}m ${conv.duration_seconds % 60}s`
      : '0s'
    const transcriptText = (conv.transcript || [])
      .map((t: any) => `${t.role === 'assistant' ? 'Priya (AI)' : 'Caller'}: ${t.text}`)
      .join('\n')

    return {
      '#': idx + 1,
      'Call ID': conv.id || '',
      'Date & Time (IST)': startedStr,
      'Caller Name': conv.caller_name || '',
      'Phone Number': conv.caller_phone || '',
      'Email Address': conv.caller_email || '',
      Duration: durationFormatted,
      'Duration (Sec)': conv.duration_seconds || 0,
      Disposition: conv.extracted_data?.disposition || '',
      'Interest Level': conv.extracted_data?.interest_level || '',
      'Booked Demo Slot': conv.extracted_data?.interview_slot_booked || '',
      'Preferred Course': conv.extracted_data?.preferred_course || '',
      'Candidate Background': conv.extracted_data?.candidate_background || '',
      'Office Notes': conv.extracted_data?.key_notes_for_office || '',
      'Full Transcript': transcriptText,
    }
  })
  const wsVoice = XLSX.utils.json_to_sheet(
    voiceDataList.length ? voiceDataList : [{ Status: 'No voice calls found' }]
  )
  wsVoice['!cols'] = [
    { wch: 5 },
    { wch: 20 },
    { wch: 22 },
    { wch: 25 },
    { wch: 18 },
    { wch: 30 },
    { wch: 12 },
    { wch: 14 },
    { wch: 20 },
    { wch: 16 },
    { wch: 25 },
    { wch: 30 },
    { wch: 30 },
    { wch: 40 },
    { wch: 100 },
  ]
  XLSX.utils.book_append_sheet(workbook, wsVoice, 'AI Voice Leads')

  // Sheet 3: Demo & Counselling Slots
  const slotsDataList = (voiceData.slots || []).map((slot: any, idx: number) => ({
    '#': idx + 1,
    Date: slot.date || '',
    'Slot Label': slot.label || '',
    'Time Range': `${slot.start_time || ''} - ${slot.end_time || ''}`,
    Status: slot.is_booked ? 'BOOKED' : 'AVAILABLE',
    'Booked By Name': slot.booked_by_name || '',
    'Booked By Phone': slot.booked_by_phone || '',
    'Booked By Email': slot.booked_by_email || '',
    'Booked At': slot.booked_at
      ? new Date(slot.booked_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
      : '',
  }))
  const wsSlots = XLSX.utils.json_to_sheet(
    slotsDataList.length ? slotsDataList : [{ Status: 'No slots configured' }]
  )
  wsSlots['!cols'] = [
    { wch: 5 },
    { wch: 14 },
    { wch: 25 },
    { wch: 16 },
    { wch: 14 },
    { wch: 25 },
    { wch: 18 },
    { wch: 30 },
    { wch: 22 },
  ]
  XLSX.utils.book_append_sheet(workbook, wsSlots, 'Counselling Slots')

  const buf = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })
  const today = new Date().toISOString().split('T')[0]

  return new Response(buf, {
    status: 200,
    headers: {
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="recruitment_institute_contacts_and_leads_${today}.xlsx"`,
    },
  })
}

'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Mail,
  Phone,
  MessageSquare,
  Clock3,
  Inbox,
  PhoneCall,
  Calendar,
  CalendarCheck,
  CalendarClock,
  Sparkles,
  User,
  ChevronDown,
  ChevronUp,
  Search,
  CheckCircle2,
  AlertCircle,
  Volume2,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Lock,
  Unlock,
  Plus,
  X,
  Check,
  CalendarPlus,
  Send,
  Copy,
  Share2,
} from 'lucide-react'
import toast from 'react-hot-toast'

interface ContactSubmission {
  id: number
  name: string
  email: string
  mobile?: string | null
  message: string
  createdAt: string | Date
}

interface ConversationTurn {
  role: 'assistant' | 'caller' | 'user'
  text: string
}

interface VoiceConversation {
  id: string
  executive_id: string
  caller_name: string
  caller_phone: string
  caller_email: string
  started_at: string | null
  ended_at: string | null
  duration_seconds: number
  extracted_data: {
    interest_level?: string
    disposition?: string
    interview_slot_booked?: string
    best_callback_number?: string
    candidate_email?: string
    key_notes_for_office?: string
    candidate_background?: string
    preferred_course?: string
    [key: string]: any
  }
  transcript: ConversationTurn[]
}

interface ActionSlot {
  label: string
  date: string
  start_time: string
  end_time: string
  is_booked?: boolean
  booked_by_name?: string
  booked_by_phone?: string
  booked_by_email?: string
  booked_at?: string
  conversation_id?: string
}

interface VoiceLeadsData {
  executive: {
    id: string | null
    name: string
    role: string
    company: string
    phone: string
  } | null
  slots: ActionSlot[]
  conversations: VoiceConversation[]
}

export default function AdminContactsClient({
  initialContacts,
}: {
  initialContacts: ContactSubmission[]
}) {
  const [activeTab, setActiveTab] = useState<'voice' | 'slots' | 'inbox'>('voice')
  const [searchQuery, setSearchQuery] = useState('')
  const [slotFilter, setSlotFilter] = useState<'all' | 'booked' | 'available'>('all')
  const [updatingSlotIndex, setUpdatingSlotIndex] = useState<number | null>(null)
  
  // New Slot Modal
  const [newSlotModalOpen, setNewSlotModalOpen] = useState(false)
  const [newSlotLabel, setNewSlotLabel] = useState('')
  const [newSlotDate, setNewSlotDate] = useState(new Date().toISOString().split('T')[0])
  const [newSlotStart, setNewSlotStart] = useState('16:00')
  const [newSlotEnd, setNewSlotEnd] = useState('16:45')
  const [addingSlot, setAddingSlot] = useState(false)

  // Manual Book Modal
  const [manualBookIndex, setManualBookIndex] = useState<number | null>(null)
  const [manualName, setManualName] = useState('')
  const [manualPhone, setManualPhone] = useState('')
  const [manualEmail, setManualEmail] = useState('')

  const [voiceData, setVoiceData] = useState<VoiceLeadsData>({
    executive: null,
    slots: [],
    conversations: [],
  })
  const [loadingVoice, setLoadingVoice] = useState(true)
  const [expandedTranscripts, setExpandedTranscripts] = useState<Record<string, boolean>>({})

  // Fetch voice conversations and slots from AI-Desk backend
  const fetchVoiceLeads = async () => {
    setLoadingVoice(true)
    try {
      const res = await fetch('/api/admin/voice-leads')
      const json = await res.json()
      if (json?.data) {
        setVoiceData(json.data)
      }
    } catch (err) {
      console.error('Failed to load voice leads:', err)
    } finally {
      setLoadingVoice(false)
    }
  }

  useEffect(() => {
    fetchVoiceLeads()
  }, [])

  const toggleTranscript = (id: string) => {
    setExpandedTranscripts((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  // Toggle or Release Slot
  const toggleSlotStatus = async (
    slotIndex: number,
    isBooked: boolean,
    name = '',
    phone = '',
    email = ''
  ) => {
    setUpdatingSlotIndex(slotIndex)
    try {
      const res = await fetch('/api/admin/voice-leads/slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slot_index: slotIndex,
          is_booked: isBooked,
          booked_by_name: name,
          booked_by_phone: phone,
          booked_by_email: email,
        }),
      })
      const json = await res.json()
      if (res.ok && json.success) {
        toast.success(
          isBooked
            ? 'Slot successfully marked as BOOKED (Protected from duplicate AI assignment)'
            : 'Slot RELEASED and marked AVAILABLE for Priya to offer'
        )
        fetchVoiceLeads()
        setManualBookIndex(null)
      } else {
        throw new Error(json.error || 'Failed to update slot')
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update slot')
    } finally {
      setUpdatingSlotIndex(null)
    }
  }

  // Add new demo slot
  const handleAddNewSlot = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSlotLabel || !newSlotStart) {
      toast.error('Please enter slot label and start time')
      return
    }
    setAddingSlot(true)
    try {
      const res = await fetch('/api/admin/voice-leads/slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add',
          label: newSlotLabel,
          date: newSlotDate,
          start_time: newSlotStart,
          end_time: newSlotEnd,
        }),
      })
      const json = await res.json()
      if (res.ok && json.success) {
        toast.success('New demo & counselling slot added successfully!')
        setNewSlotModalOpen(false)
        setNewSlotLabel('')
        fetchVoiceLeads()
      } else {
        throw new Error(json.error || 'Failed to add slot')
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to add slot')
    } finally {
      setAddingSlot(false)
    }
  }

  // Filtering
  const filteredContacts = initialContacts.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.mobile && c.mobile.includes(searchQuery)) ||
      c.message.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredConversations = (voiceData.conversations || []).filter(
    (conv) =>
      conv.caller_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.caller_phone.includes(searchQuery) ||
      conv.caller_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (conv.extracted_data?.key_notes_for_office || '')
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (conv.extracted_data?.disposition || '')
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
  )

  const bookedSlots = (voiceData.slots || []).filter((s) => s.is_booked)
  const availableSlots = (voiceData.slots || []).filter((s) => !s.is_booked)

  const handleSendToAdminWhatsApp = (conv: VoiceConversation) => {
    const caller = conv.caller_name || 'Candidate'
    const phone = conv.caller_phone || 'Not provided'
    const email = conv.caller_email || 'Not provided'
    const analysis = analyzeCandidateConversation(conv)
    const disp = conv.extracted_data?.disposition || (analysis.badges.length > 0 ? 'HIGH INTEREST' : 'Recorded')
    const slot = conv.extracted_data?.interview_slot_booked || 'None'
    const notes = conv.extracted_data?.key_notes_for_office || 'None'

    const cleanCandidatePhone = phone.replace(/\D/g, '')
    const waDirect = cleanCandidatePhone
      ? `https://wa.me/${cleanCandidatePhone.startsWith('91') ? cleanCandidatePhone : '91' + cleanCandidatePhone}`
      : ''

    const badgeBullets = analysis.badges.map((b) => `• ${b.icon} *${b.title}:* ${b.label}`).join('\n')
    const quoteBullets = analysis.candidateQuotes.map((q) => `💬 _"${q}"_`).join('\n')

    const snippet = (conv.transcript || [])
      .slice(-3)
      .map((t) => `• *${t.role === 'assistant' ? 'Priya' : 'Candidate'}:* ${t.text.substring(0, 75)}`)
      .join('\n')

    const message = `🎓 *VOICE AI LEAD ALERT — Recruitment Institute*\n━━━━━━━━━━━━━━━━━━━━\n👤 *Candidate:* ${caller}\n📞 *Phone:* ${phone}\n✉️ *Email:* ${email}\n🤖 *Counsellor:* Priya (Voice AI)\n🎯 *Disposition:* ${disp.toUpperCase()}\n📅 *Booked Slot:* ${slot}\n\n🎯 *EXACT CANDIDATE INQUIRIES & DEMANDS:*\n${badgeBullets || '• General Admissions Consultation'}\n\n${quoteBullets ? `💬 *CANDIDATE SPOKEN WORDS:*\n${quoteBullets}\n\n` : ''}${notes !== 'None' ? `📝 *Office Notes:* ${notes}\n\n` : ''}${waDirect ? `💬 *Direct Candidate Chat:* ${waDirect}\n` : ''}🔗 *Admin Portal:* https://recruitmentinstitute.in/admin/contacts\n━━━━━━━━━━━━━━━━━━━━\n*Recent Dialogue Summary:*\n${snippet || '(Logged in database)'}`

    window.open(`https://wa.me/917385204165?text=${encodeURIComponent(message)}`, '_blank')
    toast.success('Forwarding lead summary to Admin WhatsApp (+91 7385204165)...')
  }

  const handleWhatsAppCandidate = (conv: VoiceConversation) => {
    if (!conv.caller_phone) {
      toast.error('No candidate phone number recorded on this call')
      return
    }
    const digits = conv.caller_phone.replace(/\D/g, '')
    const target = digits.startsWith('91') ? digits : '91' + digits
    const message = `Hello ${conv.caller_name || 'there'}! This is regarding your recent voice enquiry with our Senior Career Counsellor Priya at *Recruitment Institute Pune*. How can we assist you today with our practical HR & Recruitment courses, syllabus, and demo class details?`
    window.open(`https://wa.me/${target}?text=${encodeURIComponent(message)}`, '_blank')
  }

  const handleCopyLeadSummary = (conv: VoiceConversation) => {
    const caller = conv.caller_name || 'Candidate'
    const phone = conv.caller_phone || 'Not provided'
    const email = conv.caller_email || 'Not provided'
    const analysis = analyzeCandidateConversation(conv)
    const disp = conv.extracted_data?.disposition || (analysis.badges.length > 0 ? 'HIGH INTEREST' : 'Recorded')
    const slot = conv.extracted_data?.interview_slot_booked || 'None'
    const notes = conv.extracted_data?.key_notes_for_office || 'None'
    const badgeText = analysis.badges.map((b) => `${b.icon} ${b.label}`).join(' | ')
    const quotesText = analysis.candidateQuotes.map((q) => `"${q}"`).join('; ')
    const text = `RECRUITMENT INSTITUTE — VOICE AI LEAD REPORT\nCandidate: ${caller}\nPhone: ${phone}\nEmail: ${email}\nDisposition: ${disp}\nBooked Slot: ${slot}\nRequirements: ${badgeText}\nCandidate Quotes: ${quotesText}\nNotes: ${notes}\nAdmin Dashboard: https://recruitmentinstitute.in/admin/contacts`
    navigator.clipboard.writeText(text)
    toast.success('Lead report copied to clipboard!')
  }

  interface RequirementBadge {
    category: 'course' | 'fee' | 'batch' | 'placement' | 'mode' | 'demo' | 'qualification'
    label: string
    title: string
    bg: string
    border: string
    text: string
    dotColor: string
    icon: string
  }

  const analyzeCandidateConversation = (conv: VoiceConversation) => {
    const turns = conv.transcript || []
    const callerTurns = turns.filter((t) => t.role === 'caller' || t.role === 'user')
    const fullText = (
      turns.map((t) => t.text).join(' ') +
      ' ' +
      (conv.extracted_data?.key_notes_for_office || '') +
      ' ' +
      (conv.extracted_data?.preferred_course || '')
    ).toLowerCase()

    const badges: RequirementBadge[] = []
    const candidateQuotes: string[] = []

    // 1. Course Focus
    if (
      fullText.includes('recruitment') ||
      fullText.includes('boolean') ||
      fullText.includes('sourcing') ||
      fullText.includes('talent acquisition') ||
      fullText.includes('headhunt') ||
      fullText.includes('ats')
    ) {
      badges.push({
        category: 'course',
        label: 'End-to-End Recruitment & Talent Acquisition',
        title: 'Course Requirement',
        bg: '#eff6ff',
        border: '#bfdbfe',
        text: '#1e40af',
        dotColor: '#3b82f6',
        icon: '🎓',
      })
    }
    if (
      fullText.includes('payroll') ||
      fullText.includes('generalist') ||
      fullText.includes('statutory') ||
      fullText.includes('pf') ||
      fullText.includes('esic') ||
      fullText.includes('compliance') ||
      fullText.includes('operations')
    ) {
      badges.push({
        category: 'course',
        label: 'HR Generalist & Payroll Operations',
        title: 'Course Requirement',
        bg: '#eef2ff',
        border: '#c7d2fe',
        text: '#3730a3',
        dotColor: '#6366f1',
        icon: '📘',
      })
    }
    if (
      fullText.includes('entrepreneur') ||
      fullText.includes('agency') ||
      fullText.includes('consultancy') ||
      fullText.includes('client') ||
      fullText.includes('business') ||
      fullText.includes('start firm')
    ) {
      badges.push({
        category: 'course',
        label: 'HR Entrepreneurship & Agency Setup',
        title: 'Business Track',
        bg: '#faf5ff',
        border: '#e9d5ff',
        text: '#6b21a8',
        dotColor: '#a855f7',
        icon: '🚀',
      })
    }

    // 2. Fee / Pricing Inquiry (Highlight in Vivid Emerald Green)
    if (
      fullText.includes('fee') ||
      fullText.includes('cost') ||
      fullText.includes('price') ||
      fullText.includes('how much') ||
      fullText.includes('discount') ||
      fullText.includes('charge') ||
      fullText.includes('rupees') ||
      fullText.includes('₹') ||
      fullText.includes('commercial') ||
      fullText.includes('installment')
    ) {
      badges.push({
        category: 'fee',
        label: 'Inquired about Course Fees & Special Discount Offer',
        title: 'Fee / Pricing Query',
        bg: '#ecfdf5',
        border: '#6ee7b7',
        text: '#065f46',
        dotColor: '#10b981',
        icon: '💰',
      })
    }

    // 3. Batches & Schedule (Highlight in Warm Amber)
    if (fullText.includes('weekend') || fullText.includes('saturday') || fullText.includes('sunday')) {
      badges.push({
        category: 'batch',
        label: 'Weekend Batch (Saturday & Sunday)',
        title: 'Batch Preference',
        bg: '#fffbeb',
        border: '#fde68a',
        text: '#92400e',
        dotColor: '#f59e0b',
        icon: '📅',
      })
    } else if (
      fullText.includes('weekday') ||
      fullText.includes('evening') ||
      fullText.includes('morning') ||
      fullText.includes('timing') ||
      fullText.includes('time')
    ) {
      badges.push({
        category: 'batch',
        label: 'Weekday Evening Batch Schedule',
        title: 'Timing Preference',
        bg: '#fffbeb',
        border: '#fde68a',
        text: '#92400e',
        dotColor: '#f59e0b',
        icon: '⏰',
      })
    }

    // 4. Placement Assistance (Highlight in Fuchsia / Purple)
    if (
      fullText.includes('placement') ||
      fullText.includes('job') ||
      fullText.includes('support') ||
      fullText.includes('interview') ||
      fullText.includes('package') ||
      fullText.includes('salary') ||
      fullText.includes('hiring partner') ||
      fullText.includes('95%') ||
      fullText.includes('100%')
    ) {
      badges.push({
        category: 'placement',
        label: 'Inquired about 95% Placement & Corporate Hiring Partners',
        title: 'Placement Assurance',
        bg: '#fdf4ff',
        border: '#f5d0fe',
        text: '#86198f',
        dotColor: '#d946ef',
        icon: '🎯',
      })
    }

    // 5. Learning Mode: Pune Classroom vs Online (Highlight in Cyan)
    if (
      fullText.includes('pune') ||
      fullText.includes('classroom') ||
      fullText.includes('offline') ||
      fullText.includes('campus') ||
      fullText.includes('fc road') ||
      fullText.includes('shivajinagar')
    ) {
      badges.push({
        category: 'mode',
        label: 'Inquired about Pune Classroom Training',
        title: 'Learning Mode',
        bg: '#ecfeff',
        border: '#a5f3fc',
        text: '#155e75',
        dotColor: '#06b6d4',
        icon: '🏢',
      })
    } else if (
      fullText.includes('online') ||
      fullText.includes('zoom') ||
      fullText.includes('live class') ||
      fullText.includes('remote')
    ) {
      badges.push({
        category: 'mode',
        label: 'Live Online Interactive Batches',
        title: 'Learning Mode',
        bg: '#ecfeff',
        border: '#a5f3fc',
        text: '#155e75',
        dotColor: '#06b6d4',
        icon: '💻',
      })
    }

    // 6. Free Demo Session (Highlight in Rose Red)
    if (
      conv.extracted_data?.interview_slot_booked ||
      fullText.includes('demo') ||
      fullText.includes('trial') ||
      fullText.includes('counselling') ||
      fullText.includes('slot') ||
      fullText.includes('attend')
    ) {
      badges.push({
        category: 'demo',
        label: conv.extracted_data?.interview_slot_booked
          ? `Locked Demo Slot: ${conv.extracted_data.interview_slot_booked}`
          : 'Free Live Demo Session Inquired / Requested',
        title: 'Live Demo Class',
        bg: '#fff1f2',
        border: '#fecdd3',
        text: '#9f1239',
        dotColor: '#f43f5e',
        icon: '🎟️',
      })
    }

    // Fallback if no specific tags caught
    if (badges.length === 0) {
      badges.push({
        category: 'course',
        label: 'General Course & Admissions Inquiry',
        title: 'Admissions Enquiry',
        bg: '#f8fafc',
        border: '#e2e8f0',
        text: '#334155',
        dotColor: '#64748b',
        icon: '💡',
      })
    }

    // Extract up to 3 direct candidate questions/statements
    for (const t of callerTurns) {
      const clean = t.text.trim()
      if (clean.length > 8 && !clean.match(/^(hello|hi|yes|no|okay|ok|thanks|thank you|namaste|sure)$/i)) {
        candidateQuotes.push(clean)
        if (candidateQuotes.length >= 3) break
      }
    }

    return {
      badges,
      candidateQuotes,
    }
  }

  const getDispositionTheme = (dispRaw?: string, interestRaw?: string, hasBadges?: boolean) => {
    const d = (dispRaw || interestRaw || '').toLowerCase()
    if (d.includes('booked') || d.includes('demo') || d.includes('scheduled')) {
      return {
        label: 'DEMO SCHEDULED',
        badgeBg: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
        badgeBorder: '#059669',
        badgeText: '#ffffff',
        cardBorder: '#86efac',
        noteBg: '#f0fdf4',
        noteBorder: '#bbf7d0',
        noteAccent: '#16a34a',
        noteText: '#14532d',
        icon: CalendarCheck,
      }
    }
    if (d.includes('interested') || d.includes('high') || (d.includes('undetermined') && hasBadges)) {
      return {
        label: 'HIGH INTEREST',
        badgeBg: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
        badgeBorder: '#2563eb',
        badgeText: '#ffffff',
        cardBorder: '#bfdbfe',
        noteBg: '#eff6ff',
        noteBorder: '#bfdbfe',
        noteAccent: '#2563eb',
        noteText: '#1e3a8a',
        icon: Sparkles,
      }
    }
    if (d.includes('callback') || d.includes('call_back')) {
      return {
        label: 'CALLBACK REQUESTED',
        badgeBg: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
        badgeBorder: '#d97706',
        badgeText: '#ffffff',
        cardBorder: '#fde68a',
        noteBg: '#fffbeb',
        noteBorder: '#fde68a',
        noteAccent: '#d97706',
        noteText: '#78350f',
        icon: PhoneCall,
      }
    }
    if (d.includes('not_interested') || d.includes('wrong') || d.includes('drop')) {
      return {
        label: 'NOT INTERESTED',
        badgeBg: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
        badgeBorder: '#dc2626',
        badgeText: '#ffffff',
        cardBorder: '#fecaca',
        noteBg: '#fef2f2',
        noteBorder: '#fecaca',
        noteAccent: '#dc2626',
        noteText: '#7f1d1d',
        icon: AlertCircle,
      }
    }
    return {
      label: dispRaw && !dispRaw.toLowerCase().includes('undetermined') ? dispRaw.toUpperCase() : 'COURSE ENQUIRY',
      badgeBg: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
      badgeBorder: '#4f46e5',
      badgeText: '#ffffff',
      cardBorder: '#c7d2fe',
      noteBg: '#f5f3ff',
      noteBorder: '#ddd6fe',
      noteAccent: '#6366f1',
      noteText: '#312e81',
      icon: Sparkles,
    }
  }

  return (
    <div>
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
          marginBottom: 24,
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: 100,
              padding: '5px 13px',
              marginBottom: 10,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: '#2563eb',
            }}
          >
            <Sparkles style={{ width: 12, height: 12, color: '#3b82f6' }} />
            Admissions & Voice AI Hub
          </div>
          <h2
            style={{
              fontSize: 26,
              fontWeight: 900,
              color: '#0f172a',
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
            }}
          >
            Contact Submissions & Voice Leads
          </h2>
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
            Monitor real-time AI phone calls with Priya, booked counselling slots, and website enquiries.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            onClick={fetchVoiceLeads}
            disabled={loadingVoice}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: '#fff',
              border: '1px solid #e2e8f0',
              padding: '8px 14px',
              borderRadius: 10,
              fontSize: 12,
              fontWeight: 600,
              color: '#334155',
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
            }}
          >
            <RefreshCw
              style={{
                width: 13,
                height: 13,
                animation: loadingVoice ? 'spin 1s linear infinite' : 'none',
              }}
            />
            Refresh AI Calls
          </button>
          <Link
            href="/admin/brochures"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              color: '#1d4ed8',
              padding: '8px 14px',
              borderRadius: 10,
              fontSize: 12,
              fontWeight: 700,
              textDecoration: 'none',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
            }}
          >
            <Sparkles style={{ width: 13, height: 13, color: '#2563eb' }} />
            Course Brochures Hub
          </Link>
          <a
            href="/desk/admin/"
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'linear-gradient(135deg, #4f46e5, #4338ca)',
              color: '#fff',
              padding: '8px 14px',
              borderRadius: 10,
              fontSize: 12,
              fontWeight: 700,
              textDecoration: 'none',
              boxShadow: '0 2px 6px rgba(79, 70, 229, 0.25)',
            }}
          >
            <ShieldCheck style={{ width: 13, height: 13 }} />
            AI Desk Portal
            <ExternalLink style={{ width: 11, height: 11, opacity: 0.8 }} />
          </a>
        </div>
      </div>

      {/* Metric Counters */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 12,
          marginBottom: 24,
        }}
      >
        <div
          style={{
            background: '#fff',
            border: '1px solid #e8ecf0',
            borderRadius: 16,
            padding: '16px 20px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
          }}
        >
          <p
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: '#64748b',
              marginBottom: 6,
            }}
          >
            Voice Calls (Priya)
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 24, fontWeight: 900, color: '#0f172a' }}>
              {voiceData.conversations?.length || 0}
            </span>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 100,
                background: '#eff6ff',
                color: '#2563eb',
                border: '1px solid #bfdbfe',
              }}
            >
              Gemini Live
            </span>
          </div>
        </div>

        <div
          style={{
            background: '#fff',
            border: '1px solid #e8ecf0',
            borderRadius: 16,
            padding: '16px 20px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
          }}
        >
          <p
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: '#64748b',
              marginBottom: 6,
            }}
          >
            Booked Demo Slots
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 24, fontWeight: 900, color: '#059669' }}>
              {bookedSlots.length}
            </span>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 100,
                background: '#f0fdf4',
                color: '#059669',
                border: '1px solid #bbf7d0',
              }}
            >
              Confirmed
            </span>
          </div>
        </div>

        <div
          style={{
            background: '#fff',
            border: '1px solid #e8ecf0',
            borderRadius: 16,
            padding: '16px 20px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
          }}
        >
          <p
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: '#64748b',
              marginBottom: 6,
            }}
          >
            Available Demo Slots
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 24, fontWeight: 900, color: '#4f46e5' }}>
              {availableSlots.length}
            </span>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 100,
                background: '#eef2ff',
                color: '#4f46e5',
                border: '1px solid #c7d2fe',
              }}
            >
              Open
            </span>
          </div>
        </div>

        <div
          style={{
            background: '#fff',
            border: '1px solid #e8ecf0',
            borderRadius: 16,
            padding: '16px 20px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
          }}
        >
          <p
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: '#64748b',
              marginBottom: 6,
            }}
          >
            Web Form Enquiries
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 24, fontWeight: 900, color: '#0f172a' }}>
              {initialContacts.length}
            </span>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 100,
                background: '#f8fafc',
                color: '#475569',
                border: '1px solid #e2e8f0',
              }}
            >
              Inbox
            </span>
          </div>
        </div>
      </div>

      {/* Search & Tabs Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
          marginBottom: 20,
          background: '#fff',
          padding: '12px 16px',
          borderRadius: 16,
          border: '1px solid #e8ecf0',
        }}
      >
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('voice')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 16px',
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              border: activeTab === 'voice' ? '1px solid #4f46e5' : '1px solid transparent',
              background: activeTab === 'voice' ? '#4f46e5' : '#f8fafc',
              color: activeTab === 'voice' ? '#fff' : '#475569',
              transition: 'all 0.15s ease',
            }}
          >
            <PhoneCall style={{ width: 14, height: 14 }} />
            AI Voice Calls ({voiceData.conversations?.length || 0})
          </button>

          <button
            onClick={() => setActiveTab('slots')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 16px',
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              border: activeTab === 'slots' ? '1px solid #059669' : '1px solid transparent',
              background: activeTab === 'slots' ? '#059669' : '#f8fafc',
              color: activeTab === 'slots' ? '#fff' : '#475569',
              transition: 'all 0.15s ease',
            }}
          >
            <CalendarClock style={{ width: 14, height: 14 }} />
            Demo & Counselling Slots ({voiceData.slots?.length || 0})
          </button>

          <button
            onClick={() => setActiveTab('inbox')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 16px',
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              border: activeTab === 'inbox' ? '1px solid #2563eb' : '1px solid transparent',
              background: activeTab === 'inbox' ? '#2563eb' : '#f8fafc',
              color: activeTab === 'inbox' ? '#fff' : '#475569',
              transition: 'all 0.15s ease',
            }}
          >
            <MessageSquare style={{ width: 14, height: 14 }} />
            Web Enquiries ({initialContacts.length})
          </button>
        </div>

        {/* Filter / Search input */}
        <div style={{ position: 'relative', minWidth: 240, flexGrow: 1, maxWidth: 360 }}>
          <Search
            style={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 14,
              height: 14,
              color: '#94a3b8',
            }}
          />
          <input
            type="text"
            placeholder={
              activeTab === 'voice'
                ? 'Search calls by candidate, phone, notes...'
                : activeTab === 'slots'
                ? 'Filter slots...'
                : 'Search enquiries...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              boxSizing: 'border-box',
              padding: '8px 12px 8px 34px',
              fontSize: 13,
              borderRadius: 10,
              border: '1px solid #cbd5e1',
              outline: 'none',
              background: '#f8fafc',
              color: '#1e293b',
            }}
          />
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          TAB 1: AI VOICE CONVERSATIONS
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'voice' && (
        <div>
          {loadingVoice ? (
            <div
              style={{
                background: '#fff',
                border: '1px solid #e8ecf0',
                borderRadius: 20,
                padding: '60px 20px',
                textAlign: 'center',
              }}
            >
              <RefreshCw
                style={{
                  width: 28,
                  height: 28,
                  color: '#4f46e5',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto 14px',
                }}
              />
              <p style={{ fontSize: 14, fontWeight: 700, color: '#1e293b' }}>
                Fetching live AI conversations from Cloud SQL...
              </p>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div
              style={{
                background: '#fff',
                border: '1px dashed #cbd5e1',
                borderRadius: 20,
                padding: '64px 20px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: '50%',
                  background: '#eef2ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                }}
              >
                <PhoneCall style={{ width: 24, height: 24, color: '#4f46e5' }} />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#1e293b', margin: '0 0 6px' }}>
                No Voice Calls Recorded Yet
              </h3>
              <p style={{ fontSize: 13, color: '#64748b', maxWidth: 450, margin: '0 auto 16px' }}>
                When candidates click <strong>📞 Call Priya</strong> on the website, their voice conversations,
                automated transcripts, and admissions notes will appear here automatically.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {filteredConversations.map((conv) => {
                const isExpanded = expandedTranscripts[conv.id]
                const analysis = analyzeCandidateConversation(conv)
                const disp = conv.extracted_data?.disposition || 'Undetermined'
                const theme = getDispositionTheme(disp, conv.extracted_data?.interest_level, analysis.badges.length > 0)

                return (
                  <div
                    key={conv.id}
                    style={{
                      background: '#fff',
                      border: `1.5px solid ${theme.cardBorder}`,
                      borderRadius: 18,
                      boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                      padding: '20px 24px',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        gap: 16,
                        flexWrap: 'wrap',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                          <div
                            style={{
                              width: 38,
                              height: 38,
                              borderRadius: 12,
                              background: theme.noteBg,
                              border: `1.5px solid ${theme.cardBorder}`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: theme.noteAccent,
                              fontWeight: 800,
                              fontSize: 14,
                            }}
                          >
                            <PhoneCall style={{ width: 17, height: 17 }} />
                          </div>
                          <div>
                            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                              {conv.caller_name || 'Candidate'}
                            </h3>
                            <span style={{ fontSize: 12, color: '#64748b' }}>
                              Counsellor: <strong>Priya</strong> &bull; Recruitment Institute
                            </span>
                          </div>
                        </div>

                        <div
                          style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            alignItems: 'center',
                            gap: 16,
                            marginTop: 10,
                          }}
                        >
                          {conv.caller_phone && (
                            <a
                              href={`tel:${conv.caller_phone}`}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 5,
                                fontSize: 12,
                                color: '#2563eb',
                                fontWeight: 700,
                                textDecoration: 'none',
                                background: '#eff6ff',
                                padding: '2px 8px',
                                borderRadius: 6,
                                border: '1px solid #bfdbfe',
                              }}
                            >
                              <Phone style={{ width: 12, height: 12 }} />
                              {conv.caller_phone}
                            </a>
                          )}
                          {conv.caller_email && (
                            <a
                              href={`mailto:${conv.caller_email}`}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 5,
                                fontSize: 12,
                                color: '#475569',
                                textDecoration: 'none',
                                background: '#f8fafc',
                                padding: '2px 8px',
                                borderRadius: 6,
                                border: '1px solid #e2e8f0',
                              }}
                            >
                              <Mail style={{ width: 12, height: 12 }} />
                              {conv.caller_email}
                            </a>
                          )}
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '4px 12px',
                            borderRadius: 100,
                            fontSize: 11,
                            fontWeight: 900,
                            background: theme.badgeBg,
                            color: theme.badgeText,
                            boxShadow: `0 2px 6px ${theme.noteAccent}33`,
                            marginBottom: 6,
                            letterSpacing: '0.03em',
                          }}
                        >
                          <theme.icon style={{ width: 12, height: 12 }} />
                          {theme.label}
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            color: '#94a3b8',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                            gap: 5,
                          }}
                        >
                          <Clock3 style={{ width: 11, height: 11 }} />
                          {conv.started_at
                            ? new Date(conv.started_at).toLocaleString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : '-'}
                          &bull; {conv.duration_seconds || 0}s duration
                        </div>
                      </div>
                    </div>

                    {/* Color-Coded Key Notes / Admissions Extraction Card */}
                    <div
                      style={{
                        background: '#ffffff',
                        border: `1.5px solid ${theme.noteBorder}`,
                        borderLeft: `5px solid ${theme.noteAccent}`,
                        borderRadius: 14,
                        padding: '16px 20px',
                        marginTop: 14,
                        fontSize: 13,
                        lineHeight: 1.6,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                      }}
                    >
                      {/* Section Header */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 8,
                          marginBottom: 12,
                          flexWrap: 'wrap',
                          borderBottom: '1px solid #f1f5f9',
                          paddingBottom: 8,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span
                            style={{
                              fontSize: 12,
                              fontWeight: 900,
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                              color: theme.noteAccent,
                            }}
                          >
                            🎯 Exactly What Candidate Wants & Inquired:
                          </span>
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              padding: '1px 8px',
                              borderRadius: 100,
                              background: theme.noteBg,
                              color: theme.noteText,
                              border: `1px solid ${theme.noteBorder}`,
                            }}
                          >
                            {analysis.badges.length} Identified Needs
                          </span>
                        </div>
                        {conv.extracted_data?.interview_slot_booked && (
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 800,
                              padding: '3px 10px',
                              borderRadius: 6,
                              background: '#10b981',
                              color: '#fff',
                              boxShadow: '0 2px 4px rgba(16,185,129,0.3)',
                            }}
                          >
                            📅 Demo Slot Confirmed
                          </span>
                        )}
                      </div>

                      {/* 1. Distinct Color Badges per Requirement */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                        {analysis.badges.map((b, bIdx) => (
                          <div
                            key={bIdx}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                              padding: '5px 12px',
                              borderRadius: 8,
                              background: b.bg,
                              border: `1.5px solid ${b.border}`,
                              color: b.text,
                              fontSize: 12,
                              fontWeight: 700,
                              boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                            }}
                          >
                            <span style={{ fontSize: 13 }}>{b.icon}</span>
                            <span>{b.label}</span>
                          </div>
                        ))}
                      </div>

                      {/* 2. Direct Spoken Quotes from Candidate */}
                      {analysis.candidateQuotes.length > 0 && (
                        <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                          <div
                            style={{
                              fontSize: 11,
                              fontWeight: 800,
                              textTransform: 'uppercase',
                              letterSpacing: '0.04em',
                              color: '#64748b',
                            }}
                          >
                            💬 Candidate Spoken Words & Key Questions:
                          </div>
                          {analysis.candidateQuotes.map((q, qIdx) => (
                            <div
                              key={qIdx}
                              style={{
                                background: '#f8fafc',
                                borderLeft: '3.5px solid #6366f1',
                                borderTop: '1px solid #e2e8f0',
                                borderRight: '1px solid #e2e8f0',
                                borderBottom: '1px solid #e2e8f0',
                                borderRadius: '0 8px 8px 0',
                                padding: '6px 12px',
                                fontSize: 12.5,
                                color: '#1e293b',
                                lineHeight: 1.45,
                              }}
                            >
                              <strong style={{ color: '#4f46e5', marginRight: 4 }}>&ldquo;</strong>
                              <span>{q}</span>
                              <strong style={{ color: '#4f46e5', marginLeft: 4 }}>&rdquo;</strong>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* 3. Official Summary if provided */}
                      {conv.extracted_data?.key_notes_for_office && (
                        <div
                          style={{
                            marginTop: 10,
                            background: theme.noteBg,
                            padding: '8px 12px',
                            borderRadius: 8,
                            border: `1px solid ${theme.noteBorder}`,
                          }}
                        >
                          <strong style={{ color: theme.noteAccent, fontSize: 11.5, textTransform: 'uppercase' }}>
                            Counsellor Summary:
                          </strong>{' '}
                          <span style={{ color: theme.noteText, fontSize: 12.5 }}>
                            {conv.extracted_data.key_notes_for_office}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Action Toolbar & Toggle Transcript */}
                    <div
                      style={{
                        marginTop: 14,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: 10,
                      }}
                    >
                      <button
                        onClick={() => toggleTranscript(conv.id)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          background: 'transparent',
                          border: 'none',
                          color: '#4f46e5',
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: 'pointer',
                          padding: 0,
                        }}
                      >
                        <Volume2 style={{ width: 14, height: 14 }} />
                        {isExpanded ? 'Hide Conversation Transcript' : `View Full Transcript (${conv.transcript?.length || 0} turns)`}
                        {isExpanded ? <ChevronUp style={{ width: 13, height: 13 }} /> : <ChevronDown style={{ width: 13, height: 13 }} />}
                      </button>

                      {/* 1-Click WhatsApp & Share Actions */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        {conv.caller_phone && (
                          <button
                            onClick={() => handleWhatsAppCandidate(conv)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 5,
                              padding: '5px 10px',
                              borderRadius: 8,
                              fontSize: 11.5,
                              fontWeight: 700,
                              background: '#ecfdf5',
                              color: '#059669',
                              border: '1px solid #a7f3d0',
                              cursor: 'pointer',
                              textDecoration: 'none',
                            }}
                            title="Chat with Candidate on WhatsApp"
                          >
                            <MessageSquare style={{ width: 12, height: 12 }} />
                            <span>WhatsApp Candidate</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleSendToAdminWhatsApp(conv)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            padding: '5px 10px',
                            borderRadius: 8,
                            fontSize: 11.5,
                            fontWeight: 700,
                            background: '#eff6ff',
                            color: '#2563eb',
                            border: '1px solid #bfdbfe',
                            cursor: 'pointer',
                          }}
                          title="Forward conversation summary to Admin WhatsApp (+91 7385204165)"
                        >
                          <Send style={{ width: 12, height: 12 }} />
                          <span>Forward to Admin WhatsApp (+91 7385204165)</span>
                        </button>

                        <button
                          onClick={() => handleCopyLeadSummary(conv)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            padding: '5px 8px',
                            borderRadius: 8,
                            fontSize: 11,
                            fontWeight: 600,
                            background: '#f8fafc',
                            color: '#64748b',
                            border: '1px solid #e2e8f0',
                            cursor: 'pointer',
                          }}
                          title="Copy text summary"
                        >
                          <Copy style={{ width: 12, height: 12 }} />
                        </button>
                      </div>
                    </div>

                    {/* Spoken Dialog Transcript */}
                    {isExpanded && (
                      <div
                        style={{
                          marginTop: 14,
                          borderTop: '1px solid #f1f5f9',
                          paddingTop: 14,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 10,
                        }}
                      >
                        {conv.transcript && conv.transcript.length > 0 ? (
                          conv.transcript.map((turn, i) => {
                            const isPriya = turn.role === 'assistant'
                            return (
                              <div
                                key={i}
                                style={{
                                  display: 'flex',
                                  alignItems: 'flex-start',
                                  gap: 10,
                                  alignSelf: isPriya ? 'flex-start' : 'flex-end',
                                  maxWidth: '85%',
                                }}
                              >
                                {isPriya && (
                                  <div
                                    style={{
                                      width: 24,
                                      height: 24,
                                      borderRadius: '50%',
                                      background: '#4f46e5',
                                      color: '#fff',
                                      fontSize: 10,
                                      fontWeight: 800,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      flexShrink: 0,
                                    }}
                                  >
                                    P
                                  </div>
                                )}
                                <div
                                  style={{
                                    background: isPriya ? '#f1f5f9' : '#e0e7ff',
                                    color: isPriya ? '#1e293b' : '#1e1b4b',
                                    padding: '8px 14px',
                                    borderRadius: 12,
                                    fontSize: 13,
                                    lineHeight: 1.5,
                                  }}
                                >
                                  <strong style={{ fontSize: 11, display: 'block', marginBottom: 2, color: isPriya ? '#475569' : '#3730a3' }}>
                                    {isPriya ? 'Priya (Counsellor)' : conv.caller_name || 'Candidate'}
                                  </strong>
                                  {turn.text}
                                </div>
                              </div>
                            )
                          })
                        ) : (
                          <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>
                            No spoken turns recorded for this call.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 2: BOOKED & AVAILABLE SLOTS (DUPLICATE PROTECTED)
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'slots' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Slots Toolbar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              flexWrap: 'wrap',
              background: '#fff',
              padding: '12px 18px',
              borderRadius: 14,
              border: '1px solid #e8ecf0',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>Filter Slots:</span>
              <button
                onClick={() => setSlotFilter('all')}
                style={{
                  padding: '5px 12px',
                  borderRadius: 100,
                  fontSize: 12,
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  background: slotFilter === 'all' ? '#1e293b' : '#f1f5f9',
                  color: slotFilter === 'all' ? '#fff' : '#475569',
                }}
              >
                All Slots ({(voiceData.slots || []).length})
              </button>
              <button
                onClick={() => setSlotFilter('booked')}
                style={{
                  padding: '5px 12px',
                  borderRadius: 100,
                  fontSize: 12,
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  background: slotFilter === 'booked' ? '#dc2626' : '#fee2e2',
                  color: slotFilter === 'booked' ? '#fff' : '#991b1b',
                }}
              >
                🔴 Booked Slots ({bookedSlots.length})
              </button>
              <button
                onClick={() => setSlotFilter('available')}
                style={{
                  padding: '5px 12px',
                  borderRadius: 100,
                  fontSize: 12,
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  background: slotFilter === 'available' ? '#16a34a' : '#dcfce7',
                  color: slotFilter === 'available' ? '#fff' : '#15803d',
                }}
              >
                🟢 Available Slots ({availableSlots.length})
              </button>
            </div>

            <button
              onClick={() => setNewSlotModalOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: '#4f46e5',
                color: '#fff',
                padding: '7px 14px',
                borderRadius: 10,
                fontSize: 12,
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 2px 5px rgba(79,70,229,0.25)',
              }}
            >
              <Plus style={{ width: 14, height: 14 }} />
              Add Demo Slot
            </button>
          </div>

          {/* Slots Cards Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: 16,
            }}
          >
            {(voiceData.slots || [])
              .map((slot, index) => ({ slot, index }))
              .filter(({ slot }) => {
                if (slotFilter === 'booked') return slot.is_booked
                if (slotFilter === 'available') return !slot.is_booked
                return true
              })
              .map(({ slot, index }) => {
                const isBooked = !!slot.is_booked
                const isUpdating = updatingSlotIndex === index

                return (
                  <div
                    key={index}
                    style={{
                      background: '#fff',
                      border: `1.5px solid ${isBooked ? '#f87171' : '#86efac'}`,
                      borderRadius: 18,
                      padding: '20px',
                      boxShadow: isBooked
                        ? '0 4px 12px rgba(239, 68, 68, 0.08)'
                        : '0 4px 12px rgba(34, 197, 94, 0.06)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      position: 'relative',
                    }}
                  >
                    <div>
                      {/* Top Badges */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: 12,
                          gap: 8,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 900,
                            padding: '4px 12px',
                            borderRadius: 100,
                            background: isBooked ? '#dc2626' : '#16a34a',
                            color: '#fff',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            letterSpacing: '0.04em',
                            boxShadow: isBooked
                              ? '0 2px 6px rgba(220, 38, 38, 0.25)'
                              : '0 2px 6px rgba(22, 163, 74, 0.25)',
                          }}
                        >
                          {isBooked ? (
                            <Lock style={{ width: 12, height: 12 }} />
                          ) : (
                            <CheckCircle2 style={{ width: 12, height: 12 }} />
                          )}
                          {isBooked ? 'BOOKED (RESERVED)' : 'AVAILABLE (OPEN)'}
                        </span>

                        <span style={{ fontSize: 12, color: '#64748b', fontWeight: 700 }}>
                          📅 {slot.date}
                        </span>
                      </div>

                      {/* Title & Time */}
                      <h3
                        style={{
                          fontSize: 16,
                          fontWeight: 800,
                          color: '#0f172a',
                          margin: '0 0 6px',
                          lineHeight: 1.3,
                        }}
                      >
                        {slot.label}
                      </h3>

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          fontSize: 13,
                          color: '#334155',
                          fontWeight: 600,
                          marginBottom: 12,
                        }}
                      >
                        <Clock3 style={{ width: 14, height: 14, color: '#64748b' }} />
                        {slot.start_time} – {slot.end_time} IST
                      </div>

                      {/* Duplicate Protection / AI Status Alert */}
                      {isBooked ? (
                        <div
                          style={{
                            background: '#fef2f2',
                            border: '1px solid #fecaca',
                            borderRadius: 12,
                            padding: '12px 14px',
                            marginBottom: 14,
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 6,
                              fontSize: 11,
                              fontWeight: 800,
                              color: '#b91c1c',
                              textTransform: 'uppercase',
                              letterSpacing: '0.04em',
                              marginBottom: 6,
                            }}
                          >
                            <ShieldCheck style={{ width: 13, height: 13 }} />
                            DUPLICATE PROTECTION ACTIVE
                          </div>
                          <p style={{ fontSize: 11, color: '#7f1d1d', margin: '0 0 8px', lineHeight: 1.4 }}>
                            Priya will <strong>NOT</strong> offer or assign this slot to any other caller.
                          </p>

                          <div
                            style={{
                              borderTop: '1px dashed #fca5a5',
                              paddingTop: 8,
                              fontSize: 12,
                              color: '#1e293b',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 3,
                            }}
                          >
                            <div>
                              <strong>Candidate:</strong>{' '}
                              <span style={{ fontWeight: 700, color: '#991b1b' }}>
                                {slot.booked_by_name || 'Candidate from Voice Call'}
                              </span>
                            </div>
                            {slot.booked_by_phone && (
                              <div>
                                <strong>Phone:</strong>{' '}
                                <a
                                  href={`tel:${slot.booked_by_phone}`}
                                  style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 600 }}
                                >
                                  {slot.booked_by_phone}
                                </a>
                              </div>
                            )}
                            {slot.booked_by_email && (
                              <div>
                                <strong>Email:</strong>{' '}
                                <a
                                  href={`mailto:${slot.booked_by_email}`}
                                  style={{ color: '#475569', textDecoration: 'none' }}
                                >
                                  {slot.booked_by_email}
                                </a>
                              </div>
                            )}
                            {slot.booked_at && (
                              <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                                <strong>Reserved:</strong>{' '}
                                {new Date(slot.booked_at).toLocaleString('en-IN', {
                                  day: '2-digit',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div
                          style={{
                            background: '#f0fdf4',
                            border: '1px solid #bbf7d0',
                            borderRadius: 12,
                            padding: '10px 14px',
                            marginBottom: 14,
                            fontSize: 12,
                            color: '#166534',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontWeight: 700 }}>
                            <Sparkles style={{ width: 13, height: 13, color: '#15803d' }} />
                            Open for Priya AI Voice Assistant
                          </div>
                          <div style={{ fontSize: 11, color: '#15803d', marginTop: 3 }}>
                            Priya is actively offering this slot to candidates during live phone calls.
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Bottom Action Buttons */}
                    <div
                      style={{
                        borderTop: '1px solid #f1f5f9',
                        paddingTop: 12,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 8,
                      }}
                    >
                      {isBooked ? (
                        <button
                          onClick={() => toggleSlotStatus(index, false)}
                          disabled={isUpdating}
                          style={{
                            width: '100%',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 6,
                            background: '#f1f5f9',
                            border: '1px solid #cbd5e1',
                            color: '#334155',
                            padding: '8px 12px',
                            borderRadius: 10,
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                          }}
                        >
                          <Unlock style={{ width: 13, height: 13, color: '#16a34a' }} />
                          {isUpdating ? 'Updating...' : 'Release Slot (Make Available for Priya)'}
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setManualBookIndex(index)
                            setManualName('')
                            setManualPhone('')
                            setManualEmail('')
                          }}
                          disabled={isUpdating}
                          style={{
                            width: '100%',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 6,
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            color: '#0f172a',
                            padding: '8px 12px',
                            borderRadius: 10,
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                          }}
                        >
                          <Lock style={{ width: 13, height: 13, color: '#dc2626' }} />
                          Reserve / Mark Booked Manually
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
          </div>

          {/* Manual Book Modal */}
          {manualBookIndex !== null && (
            <div
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 60,
                background: 'rgba(15, 23, 42, 0.6)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 16,
              }}
            >
              <div
                style={{
                  background: '#fff',
                  borderRadius: 20,
                  maxWidth: 440,
                  width: '100%',
                  overflow: 'hidden',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                  border: '1px solid #e2e8f0',
                }}
              >
                <div
                  style={{
                    background: '#1e293b',
                    color: '#fff',
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Lock style={{ width: 16, height: 16, color: '#f87171' }} />
                    <strong style={{ fontSize: 14 }}>Manually Reserve Slot</strong>
                  </div>
                  <button
                    onClick={() => setManualBookIndex(null)}
                    style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                  >
                    <X style={{ width: 18, height: 18 }} />
                  </button>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    toggleSlotStatus(manualBookIndex, true, manualName, manualPhone, manualEmail)
                  }}
                  style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}
                >
                  <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>
                    Marking this slot as booked prevents Priya AI Voice Assistant from offering it to any other callers.
                  </p>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                      Candidate Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Patil"
                      value={manualName}
                      onChange={(e) => setManualName(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        fontSize: 13,
                        borderRadius: 10,
                        border: '1px solid #cbd5e1',
                        outline: 'none',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                      Phone / WhatsApp Number
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. +91 9823456789"
                      value={manualPhone}
                      onChange={(e) => setManualPhone(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        fontSize: 13,
                        borderRadius: 10,
                        border: '1px solid #cbd5e1',
                        outline: 'none',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. candidate@gmail.com"
                      value={manualEmail}
                      onChange={(e) => setManualEmail(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        fontSize: 13,
                        borderRadius: 10,
                        border: '1px solid #cbd5e1',
                        outline: 'none',
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
                    <button
                      type="button"
                      onClick={() => setManualBookIndex(null)}
                      style={{
                        padding: '8px 14px',
                        borderRadius: 10,
                        background: '#f1f5f9',
                        border: '1px solid #cbd5e1',
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      style={{
                        padding: '8px 18px',
                        borderRadius: 10,
                        background: '#dc2626',
                        color: '#fff',
                        border: 'none',
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Confirm Booking & Lock Slot
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Add New Slot Modal */}
          {newSlotModalOpen && (
            <div
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 60,
                background: 'rgba(15, 23, 42, 0.6)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 16,
              }}
            >
              <div
                style={{
                  background: '#fff',
                  borderRadius: 20,
                  maxWidth: 460,
                  width: '100%',
                  overflow: 'hidden',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                  border: '1px solid #e2e8f0',
                }}
              >
                <div
                  style={{
                    background: '#4f46e5',
                    color: '#fff',
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <CalendarPlus style={{ width: 16, height: 16 }} />
                    <strong style={{ fontSize: 14 }}>Create New Demo Slot</strong>
                  </div>
                  <button
                    onClick={() => setNewSlotModalOpen(false)}
                    style={{ background: 'transparent', border: 'none', color: '#e0e7ff', cursor: 'pointer' }}
                  >
                    <X style={{ width: 18, height: 18 }} />
                  </button>
                </div>

                <form onSubmit={handleAddNewSlot} style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                      Slot Label / Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Tomorrow at 4:00 PM (Live Demo)"
                      value={newSlotLabel}
                      onChange={(e) => setNewSlotLabel(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        fontSize: 13,
                        borderRadius: 10,
                        border: '1px solid #cbd5e1',
                        outline: 'none',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                      Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={newSlotDate}
                      onChange={(e) => setNewSlotDate(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        fontSize: 13,
                        borderRadius: 10,
                        border: '1px solid #cbd5e1',
                        outline: 'none',
                      }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                        Start Time *
                      </label>
                      <input
                        type="time"
                        required
                        value={newSlotStart}
                        onChange={(e) => setNewSlotStart(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          fontSize: 13,
                          borderRadius: 10,
                          border: '1px solid #cbd5e1',
                          outline: 'none',
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                        End Time
                      </label>
                      <input
                        type="time"
                        value={newSlotEnd}
                        onChange={(e) => setNewSlotEnd(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          fontSize: 13,
                          borderRadius: 10,
                          border: '1px solid #cbd5e1',
                          outline: 'none',
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
                    <button
                      type="button"
                      onClick={() => setNewSlotModalOpen(false)}
                      style={{
                        padding: '8px 14px',
                        borderRadius: 10,
                        background: '#f1f5f9',
                        border: '1px solid #cbd5e1',
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={addingSlot}
                      style={{
                        padding: '8px 18px',
                        borderRadius: 10,
                        background: '#4f46e5',
                        color: '#fff',
                        border: 'none',
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      {addingSlot ? 'Creating...' : 'Create & Enable Slot'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 3: CONTACT FORM ENQUIRIES
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'inbox' && (
        <div>
          {filteredContacts.length === 0 ? (
            <div
              style={{
                background: '#fff',
                border: '1px dashed #e8ecf0',
                borderRadius: 20,
                padding: '72px 32px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 16,
                  background: '#f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                }}
              >
                <Inbox style={{ width: 22, height: 22, color: '#cbd5e1' }} />
              </div>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#64748b' }}>
                No contact submissions matching your search.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {filteredContacts.map((contact) => (
                <div
                  key={contact.id}
                  style={{
                    background: '#fff',
                    border: '1px solid #e8ecf0',
                    borderRadius: 20,
                    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                    padding: '20px 24px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: 16,
                      marginBottom: 14,
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 10,
                            background: '#eff6ff',
                            border: '1px solid #bfdbfe',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <MessageSquare style={{ width: 14, height: 14, color: '#2563eb' }} />
                        </div>
                        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
                          {contact.name}
                        </h3>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 16 }}>
                        <a
                          href={`mailto:${contact.email}`}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            fontSize: 12,
                            color: '#475569',
                            textDecoration: 'none',
                          }}
                        >
                          <Mail style={{ width: 11, height: 11 }} />
                          {contact.email}
                        </a>
                        {contact.mobile && (
                          <a
                            href={`tel:${contact.mobile}`}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 5,
                              fontSize: 12,
                              color: '#475569',
                              textDecoration: 'none',
                            }}
                          >
                            <Phone style={{ width: 11, height: 11 }} />
                            {contact.mobile}
                          </a>
                        )}
                      </div>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5,
                        fontSize: 11,
                        color: '#94a3b8',
                        flexShrink: 0,
                      }}
                    >
                      <Clock3 style={{ width: 11, height: 11 }} />
                      {new Date(contact.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </div>
                  </div>
                  <div
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderLeft: '4px solid #2563eb',
                      borderRadius: 12,
                      padding: '14px 18px',
                      fontSize: 13,
                      lineHeight: 1.7,
                      color: '#1e293b',
                    }}
                  >
                    <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{contact.message}</p>
                  </div>
                  {contact.mobile && (
                    <div style={{ marginTop: 10, display: 'flex', justifyContent: 'flex-end' }}>
                      <a
                        href={`https://wa.me/${contact.mobile.replace(/\D/g, '').startsWith('91') ? contact.mobile.replace(/\D/g, '') : '91' + contact.mobile.replace(/\D/g, '')}?text=${encodeURIComponent(`Hello ${contact.name}! Thank you for contacting Recruitment Institute. How can we assist you with our programs?`)}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '5px 12px',
                          borderRadius: 8,
                          fontSize: 11.5,
                          fontWeight: 700,
                          background: '#ecfdf5',
                          color: '#059669',
                          border: '1px solid #a7f3d0',
                          textDecoration: 'none',
                        }}
                      >
                        <MessageSquare style={{ width: 12, height: 12 }} />
                        <span>Reply on WhatsApp</span>
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

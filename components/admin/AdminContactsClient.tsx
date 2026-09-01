'use client'

import React, { useState, useEffect } from 'react'
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
} from 'lucide-react'

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
                const disp = conv.extracted_data?.disposition || 'Undetermined'
                const isInterested =
                  disp.toLowerCase().includes('interested') ||
                  disp.toLowerCase().includes('booked') ||
                  conv.extracted_data?.interest_level === 'interested'

                return (
                  <div
                    key={conv.id}
                    style={{
                      background: '#fff',
                      border: '1px solid #e2e8f0',
                      borderRadius: 18,
                      boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
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
                              width: 36,
                              height: 36,
                              borderRadius: 10,
                              background: '#eef2ff',
                              border: '1px solid #c7d2fe',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#4f46e5',
                              fontWeight: 800,
                              fontSize: 14,
                            }}
                          >
                            <PhoneCall style={{ width: 16, height: 16 }} />
                          </div>
                          <div>
                            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                              {conv.caller_name || 'Anonymous Candidate'}
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
                                fontWeight: 600,
                                textDecoration: 'none',
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
                            padding: '4px 10px',
                            borderRadius: 100,
                            fontSize: 11,
                            fontWeight: 700,
                            background: isInterested ? '#f0fdf4' : '#f8fafc',
                            color: isInterested ? '#15803d' : '#475569',
                            border: `1px solid ${isInterested ? '#bbf7d0' : '#e2e8f0'}`,
                            marginBottom: 6,
                          }}
                        >
                          {isInterested ? (
                            <CheckCircle2 style={{ width: 12, height: 12 }} />
                          ) : (
                            <Clock3 style={{ width: 12, height: 12 }} />
                          )}
                          {disp.toUpperCase()}
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

                    {/* Key Notes / Extraction Card */}
                    {(conv.extracted_data?.key_notes_for_office ||
                      conv.extracted_data?.interview_slot_booked ||
                      conv.extracted_data?.preferred_course) && (
                      <div
                        style={{
                          background: '#f8fafc',
                          border: '1px solid #edf2f7',
                          borderRadius: 12,
                          padding: '12px 16px',
                          marginTop: 14,
                          fontSize: 13,
                          lineHeight: 1.6,
                          color: '#334155',
                        }}
                      >
                        {conv.extracted_data?.interview_slot_booked && (
                          <div style={{ marginBottom: 6, color: '#15803d', fontWeight: 700 }}>
                            📅 Booked Slot: {conv.extracted_data.interview_slot_booked}
                          </div>
                        )}
                        {conv.extracted_data?.preferred_course && (
                          <div style={{ marginBottom: 6, color: '#1e40af', fontWeight: 600 }}>
                            🎓 Course of Interest: {conv.extracted_data.preferred_course}
                          </div>
                        )}
                        {conv.extracted_data?.key_notes_for_office && (
                          <div>
                            <strong>Admissions Note:</strong>{' '}
                            {conv.extracted_data.key_notes_for_office}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Toggle Transcript */}
                    <div style={{ marginTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
          TAB 2: BOOKED & AVAILABLE SLOTS
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'slots' && (
        <div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 16,
            }}
          >
            {(voiceData.slots || []).map((slot, index) => {
              const isBooked = slot.is_booked
              return (
                <div
                  key={index}
                  style={{
                    background: '#fff',
                    border: `1px solid ${isBooked ? '#fecaca' : '#bbf7d0'}`,
                    borderRadius: 16,
                    padding: '18px 20px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 12,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 800,
                        padding: '3px 10px',
                        borderRadius: 100,
                        background: isBooked ? '#fee2e2' : '#dcfce7',
                        color: isBooked ? '#b91c1c' : '#15803d',
                        border: `1px solid ${isBooked ? '#f87171' : '#86efac'}`,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      {isBooked ? <AlertCircle style={{ width: 12, height: 12 }} /> : <CheckCircle2 style={{ width: 12, height: 12 }} />}
                      {isBooked ? 'BOOKED' : 'AVAILABLE'}
                    </span>
                    <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>
                      {slot.date}
                    </span>
                  </div>

                  <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>
                    {slot.label}
                  </h3>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: 13,
                      color: '#475569',
                      marginTop: 8,
                    }}
                  >
                    <Clock3 style={{ width: 13, height: 13, color: '#64748b' }} />
                    {slot.start_time} - {slot.end_time} IST
                  </div>

                  {isBooked && (
                    <div
                      style={{
                        marginTop: 12,
                        padding: '8px 12px',
                        background: '#fef2f2',
                        borderRadius: 8,
                        fontSize: 12,
                        color: '#991b1b',
                      }}
                    >
                      <strong>Booked Candidate:</strong> {slot.booked_by_name || 'Candidate'}
                      {slot.booked_by_phone ? ` (${slot.booked_by_phone})` : ''}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
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
                      border: '1px solid #f1f5f9',
                      borderRadius: 12,
                      padding: '14px 18px',
                      fontSize: 13,
                      lineHeight: 1.7,
                      color: '#475569',
                    }}
                  >
                    {contact.message}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

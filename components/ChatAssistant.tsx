'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Bot, User, ChevronDown } from 'lucide-react'

interface Message {
  role: 'bot' | 'user'
  text: string
}

/* ─── Knowledge Base ─────────────────────────────────────── */

const KB = {
  contact: {
    phone: '+91 99750 48884',
    email: 'support@recruitmentinstitute.in',
    whatsapp: 'https://wa.me/919975048884',
    address: 'Pune, Maharashtra, India',
  },
  courses: [
    { name: 'Degree Courses', category: 'Degree', desc: 'Full degree-level HR and recruitment programs for comprehensive career foundation.' },
    { name: 'Certification Courses', category: 'Certification', desc: 'Industry-recognized certification programs to validate your recruitment skills.' },
    { name: 'Entrepreneur Courses', category: 'Entrepreneur', desc: 'Courses designed for those looking to start their own recruitment agency or consultancy.' },
    { name: 'Corporate Training', category: 'Corporate Training', desc: 'Customized training for corporate HR teams and hiring managers.' },
  ],
  services: [
    { name: 'Recruitment Training', desc: 'Training for aspiring recruiters covering sourcing, screening, and closing techniques.' },
    { name: 'Corporate HR Solutions', desc: 'End-to-end HR consulting — workforce planning, mass hiring, and L&D programs.' },
    { name: 'Placement Assistance', desc: 'We connect trained candidates with top recruiters. 85%+ placement success rate.' },
    { name: 'Online Certification', desc: 'Flexible online courses with industry-recognized certificates.' },
    { name: 'HR Consulting', desc: 'Strategic HR consulting for startups and SMEs — hiring strategy and policy creation.' },
    { name: 'Interview Preparation', desc: 'Mock interviews, body language coaching, and domain-specific question banks.' },
  ],
  stats: { alumni: '5,000+', experience: '10+ years', placement: '95%', programs: 4 },
}

/* ─── Intent matching ────────────────────────────────────── */

type Intent =
  | 'greeting' | 'goodbye' | 'howareyou' | 'courses' | 'services' | 'contact'
  | 'placement' | 'fees' | 'duration' | 'certification' | 'online'
  | 'about' | 'location' | 'enroll' | 'whatsapp' | 'thanks' | 'unknown'

function detectIntent(msg: string): Intent {
  const m = msg.toLowerCase().trim()

  // Greetings — fuzzy match (hii, heyyy, etc.)
  if (/^(hi+|hey+|hello+|helo|hii+|hai|good\s*(morning|afternoon|evening|day)|namaste|namaskar|greetings|howdy|sup|what'?s up|wassup)/.test(m)) return 'greeting'
  if (/(how are you|how r u|how are u|how do you do|how's it going|hows it going|how have you been|you good|are you good|doing well)/.test(m)) return 'howareyou'
  if (/(bye|goodbye|see you|take care|good night|cya|ok bye|thanks bye)/.test(m)) return 'goodbye'
  if (/^(thank|thanks|thank you|thx|ty|tq|great|awesome|perfect|nice|wonderful|excellent|brilliant)/.test(m)) return 'thanks'

  // Core topics
  if (/(course|program|programme|degree|diploma|curriculum|syllabus|what do you teach|what can i learn)/.test(m)) return 'courses'
  if (/(service|offering|what do you (offer|provide|do)|help me with)/.test(m)) return 'services'
  if (/(placement|placed|get a job|job (after|guarantee|support|assistance)|hiring|employ|career (support|help))/.test(m)) return 'placement'
  if (/(fee|fees|price|cost|charges|how much|payment|emi|installment|afford|scholarship)/.test(m)) return 'fees'
  if (/(duration|how long|time|months|weeks|period|batch|schedule|timing|hours)/.test(m)) return 'duration'
  if (/(online|remote|virtual|from home|distance|live class|recorded)/.test(m)) return 'online'
  if (/(certif|certificate|certified|credential)/.test(m)) return 'certification'
  if (/(contact|call|phone|email|reach|support|helpline|talk to|speak to|get in touch)/.test(m)) return 'contact'
  if (/(location|address|where (are|is)|pune|office|centre|center|visit|campus)/.test(m)) return 'location'
  if (/(enroll|join|register|admission|apply|sign up|book|start|get started|how to (join|start))/.test(m)) return 'enroll'
  if (/(whatsapp|wa\.me|chat on|message us)/.test(m)) return 'whatsapp'
  if (/(about|who are you|what is|tell me|overview|institute|recruitment institute|your institute)/.test(m)) return 'about'

  return 'unknown'
}

function buildReply(intent: Intent): string {
  switch (intent) {
    case 'greeting':
      return `Hello! Welcome to **Recruitment Institute** — India's leading HR & Recruitment Training Academy. It's great to have you here!\n\nI'm your virtual assistant and I'm happy to help you with information about our courses, placement support, fees, enrollment, or anything else about the institute.\n\nWhat can I help you with today?`

    case 'howareyou':
      return `I'm doing wonderfully, thank you for asking! I'm here and ready to help you with anything you need.\n\nWhether it's information about our courses, placement support, fees, or enrollment — I'm at your service. What would you like to know today?`

    case 'goodbye':
      return `Thank you so much for connecting with us! It was a pleasure assisting you. We hope to see you soon at Recruitment Institute.\n\nIf you ever have more questions, don't hesitate to reach out — we're always here for you.\n\n📞 **${KB.contact.phone}** | ✉️ **${KB.contact.email}**\n\nWishing you all the best in your career journey!`

    case 'thanks':
      return `You're most welcome! It's our pleasure to assist you. If there's anything else you'd like to know — whether about our programs, enrollment process, or career support — feel free to ask anytime. We're here to help!`

    case 'about':
      return `**Recruitment Institute** is India's #1 HR & Recruitment Training Academy, headquartered in **Pune, Maharashtra**.\n\nOver the past **${KB.stats.experience}**, we have trained **${KB.stats.alumni}** professionals and built a strong reputation for practical, industry-ready education in HR and recruitment.\n\nWith a **${KB.stats.placement}** placement support rate and ${KB.stats.programs} specialized programs, our mission is simple — to equip every student with the real-world skills needed to thrive in recruitment and HR careers.\n\nWould you like to know more about our courses or services?`

    case 'courses':
      return `We offer **${KB.courses.length} specialized program categories** tailored for different career goals:\n\n${KB.courses.map(c => `• **${c.name}** — ${c.desc}`).join('\n\n')}\n\nEach program is designed to be practical, job-ready, and industry-recognized. Would you like details on a specific course, or shall I guide you on how to enroll?`

    case 'services':
      return `At Recruitment Institute, we offer a comprehensive range of services designed to support your entire recruitment career journey:\n\n${KB.services.map(s => `• **${s.name}** — ${s.desc}`).join('\n\n')}\n\nIs there a specific service you'd like to learn more about? I'm happy to help!\n\n📞 You can also speak directly with our team at **${KB.contact.phone}**.`

    case 'placement':
      return `Placement support is one of the things we're most proud of at Recruitment Institute. We maintain an **${KB.stats.placement} placement support rate**, backed by a dedicated placement cell that works closely with every student.\n\nHere's what our placement program includes:\n\n• Active connections with **500+ hiring companies** across India\n• One-on-one resume building and profile review\n• Mock interview sessions with industry professionals\n• Career counseling and job matching support\n\nOur goal is to ensure that every student who completes our program has a strong chance at a rewarding career. Want to speak with our placement team? Call us at **${KB.contact.phone}**.`

    case 'fees':
      return `Our course fees vary depending on the program and duration you choose. We understand that investing in education is an important decision, so we've made the process as flexible as possible.\n\nWe offer **easy EMI and installment plans**, and our admissions counselors can walk you through scholarship options and any ongoing discounts.\n\nFor an exact fee breakdown tailored to your chosen program, please reach out directly:\n\n📞 **${KB.contact.phone}**\n✉️ **${KB.contact.email}**\n\nOur team will be happy to share all the details and help you find the best option.`

    case 'duration':
      return `Course durations at Recruitment Institute are designed to fit different schedules and career goals:\n\n• **Certification Courses** — 1 to 3 months\n• **Degree Programs** — 6 to 12 months\n• **Entrepreneur Programs** — 2 to 4 months\n• **Corporate Training** — Fully customized (1 day to 4 weeks)\n\nWe offer both **weekday** and **weekend batches**, so you can learn without disrupting your current commitments. Want to know which batch would suit you best? Give us a call at **${KB.contact.phone}**.`

    case 'online':
      return `Absolutely! Recruitment Institute offers **fully online programs** so you can learn from the comfort of your home, no matter where you are in India.\n\nOur online courses include:\n\n• **Live, instructor-led sessions** — not just recorded videos\n• Access to recorded lectures for revision\n• Industry-recognized certificates upon completion\n• Weekend and weekday batch options\n\nOnline learning with us is just as thorough and career-focused as our in-person programs. Visit **/courses** to explore, or call **${KB.contact.phone}** to speak with an advisor.`

    case 'certification':
      return `Our **Certification Courses** are among the most popular programs we offer — and for good reason. They are industry-recognized, practically focused, and can be completed in just **1 to 3 months**.\n\nWhether you're starting your career in recruitment or looking to upskill, our certifications give you the credibility and knowledge to stand out.\n\n• Available both online and offline\n• Hands-on assignments and real-world case studies\n• Certificate recognized across India\n\nReady to get certified? Visit **/courses** or call us at **${KB.contact.phone}** to find the right program for you.`

    case 'contact':
      return `We'd love to hear from you! Here are all the ways you can get in touch with our team:\n\n📞 **Phone:** ${KB.contact.phone}\n✉️ **Email:** ${KB.contact.email}\n📍 **Location:** ${KB.contact.address}\n🕘 **Office Hours:** Monday to Saturday, 9 AM – 6 PM\n\nYou can also visit our **/contact** page to send us a message directly. We typically respond within a few hours on business days.`

    case 'location':
      return `Recruitment Institute is based in **Pune, Maharashtra, India** — one of India's leading education and business hubs.\n\nIf you're local, you're welcome to visit us in person for a campus tour or a free consultation. For students from other cities, we also offer complete **online programs** with the same quality and outcomes.\n\n📞 Call us at **${KB.contact.phone}** and we'll share the exact address and directions.`

    case 'enroll':
      return `Getting started with Recruitment Institute is easy! Here's how:\n\n1. Explore our programs at **/courses** and choose what fits your goals\n2. Book a **free demo session** to experience our teaching style\n3. Our admissions team will guide you through fees, batch timing, and eligibility\n\nYou can reach us through any of the following:\n\n📞 **${KB.contact.phone}**\n✉️ **${KB.contact.email}**\n💬 WhatsApp: **+91 99750 48884**\n\nWe'll make the enrollment process smooth and hassle-free for you!`

    case 'whatsapp':
      return `You can reach our team directly on **WhatsApp** for quick support:\n\n💬 **+91 99750 48884**\n\nJust send us a message and one of our advisors will get back to you. We're available **Monday to Saturday, 9 AM – 6 PM**.\n\nWhatsApp is great for sharing documents, asking quick questions, or getting enrollment guidance on the go!`

    default:
      return `Thank you for your message! I want to make sure I give you the right information. Could you rephrase your question? I'm well-equipped to help with:\n\n• Our **courses and programs**\n• **Fees** and payment options\n• **Placement support**\n• **Enrollment** process\n• **Location** and contact details\n\nAlternatively, you can speak directly with our team at **${KB.contact.phone}** — they'll be happy to assist!`
  }
}

/* ─── Quick replies ──────────────────────────────────────── */

const QUICK_REPLIES = [
  'What courses do you offer?',
  'Tell me about placement',
  'What are the fees?',
  'How do I enroll?',
  'Contact details',
]

/* ─── Component ──────────────────────────────────────────── */

export default function ChatAssistant() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', text: `Hello! Welcome to **Recruitment Institute** — India's leading HR & Recruitment Training Academy.\n\nI'm your virtual assistant, here to help you with information about our courses, placement support, fees, enrollment, and more.\n\nHow can I assist you today?` },
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [unread, setUnread] = useState(1)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setUnread(0)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  function sendMessage(text: string) {
    const trimmed = text.trim()
    if (!trimmed) return

    setMessages((prev) => [...prev, { role: 'user', text: trimmed }])
    setInput('')
    setTyping(true)

    setTimeout(() => {
      const intent = detectIntent(trimmed)
      const reply = buildReply(intent)
      setTyping(false)
      setMessages((prev) => [...prev, { role: 'bot', text: reply }])
      if (!open) setUnread((n) => n + 1)
    }, 600)
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  function renderText(text: string) {
    return text.split('\n').map((line, i) => {
      const parts = line.split(/\*\*(.*?)\*\*/g)
      return (
        <span key={i}>
          {parts.map((part, j) =>
            j % 2 === 1 ? <strong key={j}>{part}</strong> : part
          )}
          {i < text.split('\n').length - 1 && <br />}
        </span>
      )
    })
  }

  return (
    <>
      {/* Floating buttons stack */}
      <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>

        {/* WhatsApp button */}
        <a
          href="https://wa.me/919975048884?text=Hello%2C%20I%20am%20interested%20in%20Recruitment%20Institute%20courses"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat on WhatsApp"
          style={{
            width: 52, height: 52, borderRadius: '50%',
            background: '#25D366',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(37,211,102,0.45)',
            transition: 'transform 0.2s',
            textDecoration: 'none', flexShrink: 0,
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.transform = 'scale(1.1)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.transform = 'scale(1)' }}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        </a>

        {/* Chat assistant button */}
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Chat assistant"
          style={{
            width: 52, height: 52, borderRadius: '50%',
            background: 'linear-gradient(135deg, #1E40AF, #2563EB)',
            color: 'white', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(30,64,175,0.45)',
            transition: 'transform 0.2s',
            position: 'relative', flexShrink: 0,
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.1)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)' }}
        >
          {open ? <X style={{ width: 22, height: 22 }} /> : <MessageCircle style={{ width: 22, height: 22 }} />}
          {!open && unread > 0 && (
            <span style={{
              position: 'absolute', top: -4, right: -4,
              width: 18, height: 18, borderRadius: '50%',
              background: '#EF4444', color: 'white',
              fontSize: 10, fontWeight: 800,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '2px solid white',
            }}>
              {unread}
            </span>
          )}
        </button>

      </div>{/* end floating buttons stack */}

      {/* Chat window */}
      {open && (
        <div style={{
          position: 'fixed', bottom: 148, right: 24, zIndex: 999,
          width: 360, maxWidth: 'calc(100vw - 48px)',
          background: 'white', borderRadius: 20,
          boxShadow: '0 24px 80px rgba(0,0,0,0.18)',
          border: '1px solid #E2E8F0',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
          animation: 'chatSlideUp 0.2s ease',
        }}>

          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #0F172A, #1E40AF)',
            padding: '14px 16px',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'rgba(255,255,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Bot style={{ width: 18, height: 18, color: 'white' }} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: 'white', lineHeight: 1.2 }}>RI Assistant</p>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', marginTop: 1 }}>Recruitment Institute • Online</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{ background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: 8, width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}
            >
              <ChevronDown style={{ width: 14, height: 14 }} />
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 10, minHeight: 280, maxHeight: 380 }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', gap: 8, alignItems: 'flex-end' }}>
                {msg.role === 'bot' && (
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Bot style={{ width: 13, height: 13, color: '#1E40AF' }} />
                  </div>
                )}
                <div style={{
                  maxWidth: '78%', padding: '10px 13px', borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  background: msg.role === 'user' ? 'linear-gradient(135deg,#1E40AF,#2563EB)' : '#F8FAFC',
                  color: msg.role === 'user' ? 'white' : '#0F172A',
                  fontSize: 13, lineHeight: 1.6,
                  border: msg.role === 'bot' ? '1px solid #E2E8F0' : 'none',
                }}>
                  {renderText(msg.text)}
                </div>
                {msg.role === 'user' && (
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#1E40AF,#2563EB)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <User style={{ width: 13, height: 13, color: 'white' }} />
                  </div>
                )}
              </div>
            ))}

            {typing && (
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bot style={{ width: 13, height: 13, color: '#1E40AF' }} />
                </div>
                <div style={{ padding: '10px 14px', borderRadius: '16px 16px 16px 4px', background: '#F8FAFC', border: '1px solid #E2E8F0', display: 'flex', gap: 4 }}>
                  {[0, 1, 2].map(i => (
                    <span key={i} style={{
                      width: 6, height: 6, borderRadius: '50%', background: '#94A3B8',
                      animation: `typingDot 1.2s ease-in-out ${i * 0.2}s infinite`,
                      display: 'inline-block',
                    }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick replies */}
          <div style={{ padding: '8px 12px 4px', display: 'flex', gap: 6, overflowX: 'auto', borderTop: '1px solid #F1F5F9' }}>
            {QUICK_REPLIES.map((qr) => (
              <button
                key={qr}
                onClick={() => sendMessage(qr)}
                style={{
                  fontSize: 11, fontWeight: 600, padding: '5px 10px', borderRadius: 20,
                  background: '#EFF6FF', color: '#1E40AF', border: '1px solid #BFDBFE',
                  cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
                }}
              >
                {qr}
              </button>
            ))}
          </div>

          {/* Input */}
          <div style={{ padding: '10px 12px 12px', display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask me anything..."
              style={{
                flex: 1, padding: '10px 14px', borderRadius: 12,
                border: '1px solid #E2E8F0', fontSize: 13, outline: 'none',
                background: '#F8FAFC', color: '#0F172A',
              }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim()}
              style={{
                width: 38, height: 38, borderRadius: 10,
                background: input.trim() ? 'linear-gradient(135deg,#1E40AF,#2563EB)' : '#F1F5F9',
                border: 'none', cursor: input.trim() ? 'pointer' : 'default',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, transition: 'background 0.15s',
              }}
            >
              <Send style={{ width: 15, height: 15, color: input.trim() ? 'white' : '#CBD5E1' }} />
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes chatSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes typingDot {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30%            { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
    </>
  )
}

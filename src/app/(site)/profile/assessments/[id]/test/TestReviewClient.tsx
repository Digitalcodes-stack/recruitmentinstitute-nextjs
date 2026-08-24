'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ChevronRight,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Filter,
  Sparkles,
  BookOpen,
  CalendarCheck2,
  Search,
} from 'lucide-react'
import { QuestionBankItem } from '@/lib/fastapiClient'

interface Props {
  questions: QuestionBankItem[]
  studentAssessmentId: number
}

export default function TestReviewClient({
  questions,
  studentAssessmentId,
}: Props) {
  const [filter, setFilter] = useState<'all' | 'incorrect' | 'correct'>('all')
  const [selectedTopic, setSelectedTopic] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  const correctCount = questions.filter(
    (q) => q.student_answer && q.student_answer === q.correct_option
  ).length
  const incorrectCount = questions.length - correctCount
  const accuracy = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0

  const topics = Array.from(new Set(questions.map((q) => q.topic_name).filter(Boolean)))

  const filteredQuestions = questions.filter((q) => {
    const isCorrect = q.student_answer && q.student_answer === q.correct_option
    if (filter === 'incorrect' && isCorrect) return false
    if (filter === 'correct' && !isCorrect) return false
    if (selectedTopic !== 'all' && q.topic_name !== selectedTopic) return false
    if (
      searchTerm &&
      !q.question_text.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !q.topic_name.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false
    }
    return true
  })

  return (
    <div style={{ maxWidth: 1060, margin: '0 auto', padding: '32px 20px 80px' }}>
      {/* Breadcrumb */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontSize: 13,
          marginBottom: 24,
        }}
      >
        <Link
          href="/profile"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            color: '#64748b',
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          <ArrowLeft style={{ width: 14, height: 14 }} /> Student Portal
        </Link>
        <ChevronRight style={{ width: 13, height: 13, color: '#cbd5e1' }} />
        <Link
          href={`/profile/assessments/${studentAssessmentId}`}
          style={{ color: '#64748b', fontWeight: 600, textDecoration: 'none' }}
        >
          Assessment Diagnostic
        </Link>
        <ChevronRight style={{ width: 13, height: 13, color: '#cbd5e1' }} />
        <span style={{ color: '#1e40af', fontWeight: 700 }}>Question Bank Review</span>
      </div>

      {/* Hero Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #090D16 0%, #0F172A 50%, #1E3A8A 100%)',
          borderRadius: 24,
          padding: '32px 36px',
          color: '#fff',
          marginBottom: 32,
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 16px 36px -10px rgba(15, 23, 42, 0.3)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 24 }}>
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 12px',
                borderRadius: 100,
                background: 'rgba(255, 255, 255, 0.12)',
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: 12,
              }}
            >
              <Sparkles style={{ width: 12, height: 12, color: '#60a5fa' }} /> Comprehensive Review
            </div>
            <h1 style={{ fontSize: 32, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 8 }}>
              Assessment Question Breakdown
            </h1>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', maxWidth: 540, lineHeight: 1.6 }}>
              Review correct solutions, explanations, and your submitted choices to understand key concepts.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <div
              style={{
                background: 'rgba(255,255,255,0.08)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.14)',
                borderRadius: 16,
                padding: '12px 20px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 24, fontWeight: 900, color: '#34d399' }}>{correctCount}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>Correct</div>
            </div>
            <div
              style={{
                background: 'rgba(255,255,255,0.08)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.14)',
                borderRadius: 16,
                padding: '12px 20px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 24, fontWeight: 900, color: '#f87171' }}>{incorrectCount}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>Needs Review</div>
            </div>
            <div
              style={{
                background: 'rgba(255,255,255,0.08)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.14)',
                borderRadius: 16,
                padding: '12px 20px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 24, fontWeight: 900, color: '#60a5fa' }}>{accuracy}%</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>Accuracy</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: 20,
          padding: '16px 20px',
          border: '1px solid #e2e8f0',
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
        }}
      >
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <button
            onClick={() => setFilter('all')}
            style={{
              padding: '8px 16px',
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              background: filter === 'all' ? '#0f172a' : '#f1f5f9',
              color: filter === 'all' ? '#ffffff' : '#64748b',
              transition: 'all 0.15s ease',
            }}
          >
            All Questions ({questions.length})
          </button>
          <button
            onClick={() => setFilter('incorrect')}
            style={{
              padding: '8px 16px',
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              background: filter === 'incorrect' ? '#f43f5e' : '#fff1f2',
              color: filter === 'incorrect' ? '#ffffff' : '#9f1239',
              transition: 'all 0.15s ease',
            }}
          >
            Incorrect Only ({incorrectCount})
          </button>
          <button
            onClick={() => setFilter('correct')}
            style={{
              padding: '8px 16px',
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              background: filter === 'correct' ? '#10b981' : '#ecfdf5',
              color: filter === 'correct' ? '#ffffff' : '#065f46',
              transition: 'all 0.15s ease',
            }}
          >
            Correct Only ({correctCount})
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 260, maxWidth: 400 }}>
          {topics.length > 1 && (
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              style={{
                padding: '8px 14px',
                borderRadius: 10,
                border: '1px solid #cbd5e1',
                fontSize: 13,
                color: '#334155',
                background: '#fff',
                cursor: 'pointer',
                outline: 'none',
                fontWeight: 600,
              }}
            >
              <option value="all">All Topics ({topics.length})</option>
              {topics.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          )}

          <div
            style={{
              position: 'relative',
              flex: 1,
            }}
          >
            <Search
              style={{
                position: 'absolute',
                left: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 15,
                height: 15,
                color: '#94a3b8',
              }}
            />
            <input
              type="text"
              placeholder="Search questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 36px',
                borderRadius: 10,
                border: '1px solid #cbd5e1',
                fontSize: 13,
                outline: 'none',
                background: '#fff',
              }}
            />
          </div>
        </div>
      </div>

      {/* Questions List */}
      {filteredQuestions.length === 0 ? (
        <div
          style={{
            background: '#fff',
            border: '1px dashed #cbd5e1',
            borderRadius: 20,
            padding: '48px 24px',
            textAlign: 'center',
            color: '#64748b',
          }}
        >
          <Filter style={{ width: 36, height: 36, margin: '0 auto 12px', color: '#94a3b8' }} />
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
            No questions match your filter
          </h3>
          <p style={{ fontSize: 13 }}>Try adjusting your search criteria or resetting filters.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {filteredQuestions.map((q, idx) => {
            const isCorrect = q.student_answer && q.student_answer === q.correct_option
            const isAnswered = !!q.student_answer

            return (
              <div
                key={q.id}
                style={{
                  background: '#ffffff',
                  border: isCorrect ? '1px solid #e2e8f0' : '1px solid #fecdd3',
                  borderRadius: 22,
                  padding: '28px 30px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Status Accent Bar */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 4,
                    background: isCorrect ? '#10b981' : '#f43f5e',
                  }}
                />

                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 18 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: isCorrect ? '#ecfdf5' : '#fff1f2',
                        color: isCorrect ? '#059669' : '#e11d48',
                        fontSize: 14,
                        fontWeight: 900,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {idx + 1}
                    </div>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        color: '#64748b',
                        background: '#f1f5f9',
                        padding: '4px 12px',
                        borderRadius: 100,
                      }}
                    >
                      {q.topic_name}
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '4px 12px',
                      borderRadius: 100,
                      fontSize: 11,
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      background: isCorrect ? '#ecfdf5' : '#fff1f2',
                      color: isCorrect ? '#065f46' : '#9f1239',
                      border: isCorrect ? '1px solid #a7f3d0' : '1px solid #fecdd3',
                    }}
                  >
                    {isCorrect ? (
                      <>
                        <CheckCircle2 style={{ width: 14, height: 14, color: '#10b981' }} /> Correct (+1.0)
                      </>
                    ) : (
                      <>
                        <XCircle style={{ width: 14, height: 14, color: '#f43f5e' }} /> Incorrect (0.0)
                      </>
                    )}
                  </div>
                </div>

                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', lineHeight: 1.6, marginBottom: 20 }}>
                  {q.question_text}
                </h3>

                {/* Option Choices */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                  {[
                    { key: 'A', text: q.option_a },
                    { key: 'B', text: q.option_b },
                    { key: 'C', text: q.option_c },
                    { key: 'D', text: q.option_d },
                  ].map((opt) => {
                    const isOptionCorrect = q.correct_option === opt.key
                    const isSelected = q.student_answer === opt.key

                    let bg = '#f8fafc'
                    let border = '#e2e8f0'
                    let text = '#334155'
                    let badgeBg = '#f1f5f9'
                    let badgeText = '#64748b'

                    if (isOptionCorrect) {
                      bg = '#f0fdf4'
                      border = '#86efac'
                      text = '#14532d'
                      badgeBg = '#10b981'
                      badgeText = '#ffffff'
                    } else if (isSelected && !isOptionCorrect) {
                      bg = '#fff1f2'
                      border = '#fda4af'
                      text = '#881337'
                      badgeBg = '#f43f5e'
                      badgeText = '#ffffff'
                    }

                    return (
                      <div
                        key={opt.key}
                        style={{
                          padding: '14px 18px',
                          borderRadius: 14,
                          background: bg,
                          border: `1.5px solid ${border}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 14,
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div
                            style={{
                              width: 26,
                              height: 26,
                              borderRadius: '50%',
                              background: badgeBg,
                              color: badgeText,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: 12,
                              fontWeight: 800,
                              flexShrink: 0,
                            }}
                          >
                            {opt.key}
                          </div>
                          <span style={{ fontSize: 14, color: text, fontWeight: isOptionCorrect || isSelected ? 700 : 500 }}>
                            {opt.text}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {isSelected && !isOptionCorrect && (
                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 800,
                                color: '#be123c',
                                background: '#ffe4e6',
                                padding: '3px 10px',
                                borderRadius: 999,
                              }}
                            >
                              Your Choice
                            </span>
                          )}
                          {isSelected && isOptionCorrect && (
                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 800,
                                color: '#15803d',
                                background: '#dcfce7',
                                padding: '3px 10px',
                                borderRadius: 999,
                              }}
                            >
                              Your Choice
                            </span>
                          )}
                          {isOptionCorrect && (
                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 800,
                                color: '#15803d',
                                background: '#dcfce7',
                                padding: '3px 10px',
                                borderRadius: 999,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                              }}
                            >
                              <CheckCircle2 style={{ width: 13, height: 13 }} /> Correct Answer
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Explanation Box */}
                {q.explanation && (
                  <div
                    style={{
                      background: '#f8fafc',
                      borderRadius: 16,
                      padding: '16px 20px',
                      border: '1px solid #e2e8f0',
                      borderLeft: '4px solid #3b82f6',
                    }}
                  >
                    <div style={{ fontSize: 12, fontWeight: 800, color: '#1e40af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                      Explanation & Rationale
                    </div>
                    <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.6 }}>{q.explanation}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

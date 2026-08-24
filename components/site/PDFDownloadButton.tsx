'use client'

import { useState } from 'react'
import { Download, Loader2 } from 'lucide-react'

interface Props {
  studentAssessmentId: number
  variant?: 'glass' | 'white' | 'primary'
  style?: React.CSSProperties
}

export default function PDFDownloadButton({
  studentAssessmentId,
  variant = 'glass',
  style,
}: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDownload = async () => {
    setLoading(true)
    setError(null)
    try {
      const genRes = await fetch(`/api/assessment/${studentAssessmentId}/report`, { method: 'POST' })
      if (!genRes.ok) {
        const err = await genRes.json().catch(() => null)
        throw new Error(err?.message || 'Failed to generate report')
      }
      const rawData = await genRes.json()
      const genData = rawData?.data ?? rawData

      if (genData?.status === 'generating') {
        for (let i = 0; i < 12; i++) {
          await new Promise((r) => setTimeout(r, 2000))
          const statusRes = await fetch(`/api/assessment/${studentAssessmentId}/report`)
          if (!statusRes.ok) continue
          const rawStatus = await statusRes.json()
          const statusData = rawStatus?.data ?? rawStatus
          if (statusData?.status === 'ready') {
            window.open(`/api/assessment/${studentAssessmentId}/report/download`, '_blank')
            return
          }
          if (statusData?.status === 'error') throw new Error('Report generation failed')
        }
        throw new Error('Report generation is still in progress. Please try again in a moment.')
      } else if (genData?.status === 'ready') {
        window.open(`/api/assessment/${studentAssessmentId}/report/download`, '_blank')
      }
    } catch (e: any) {
      setError(e.message || 'Failed to download PDF')
    } finally {
      setLoading(false)
    }
  }

  const getVariantStyles = (): React.CSSProperties => {
    if (variant === 'white') {
      return {
        background: '#ffffff',
        color: '#0f172a',
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
      }
    }
    if (variant === 'primary') {
      return {
        background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
        color: '#ffffff',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 4px 14px rgba(37,99,235,0.25)',
      }
    }
    // glass default
    return {
      background: 'rgba(255, 255, 255, 0.14)',
      backdropFilter: 'blur(12px)',
      color: '#ffffff',
      border: '1px solid rgba(255, 255, 255, 0.22)',
    }
  }

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', gap: 4 }}>
      <button
        onClick={handleDownload}
        disabled={loading}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '12px 20px',
          borderRadius: 14,
          fontSize: 13,
          fontWeight: 700,
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.75 : 1,
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          letterSpacing: '-0.01em',
          ...getVariantStyles(),
          ...style,
        }}
      >
        {loading ? (
          <Loader2 style={{ width: 15, height: 15, animation: 'spin 1s linear infinite' }} />
        ) : (
          <Download style={{ width: 15, height: 15 }} />
        )}
        <span>{loading ? 'Generating PDF…' : 'Download PDF Report'}</span>
      </button>
      {error && (
        <span style={{ color: '#fca5a5', fontSize: 11, fontWeight: 600, paddingLeft: 4 }}>
          {error}
        </span>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

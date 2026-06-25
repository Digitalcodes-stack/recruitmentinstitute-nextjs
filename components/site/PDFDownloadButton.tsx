'use client'

import { useState } from 'react'
import { Download, Loader2 } from 'lucide-react'

export default function PDFDownloadButton({ studentAssessmentId }: { studentAssessmentId: number }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDownload = async () => {
    setLoading(true)
    setError(null)
    try {
      // Trigger report generation via Next.js API route proxy
      const genRes = await fetch(`/api/assessment/${studentAssessmentId}/report`, { method: 'POST' })
      if (!genRes.ok) {
        const err = await genRes.json().catch(() => null)
        throw new Error(err?.message || 'Failed to generate report')
      }
      const genData = await genRes.json()

      // Poll for completion
      if (genData.status === 'generating') {
        for (let i = 0; i < 10; i++) {
          await new Promise(r => setTimeout(r, 2000))
          const statusRes = await fetch(`/api/assessment/${studentAssessmentId}/report`)
          if (!statusRes.ok) continue
          const statusData = await statusRes.json()
          if (statusData.status === 'ready') {
            window.open(`/api/assessment/${studentAssessmentId}/report/download`, '_blank')
            return
          }
          if (statusData.status === 'error') throw new Error('Report generation failed')
        }
        throw new Error('Report generation is still in progress. Please try again in a moment.')
      } else if (genData.status === 'ready') {
        window.open(`/api/assessment/${studentAssessmentId}/report/download`, '_blank')
      }
    } catch (e: any) {
      setError(e.message || 'Failed to download PDF')
    } finally {
      setLoading(false)
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
          padding: '12px 18px',
          borderRadius: 12,
          background: 'rgba(255,255,255,0.12)',
          border: '1px solid rgba(255,255,255,0.2)',
          color: '#fff',
          fontSize: 13,
          fontWeight: 700,
          textDecoration: 'none',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.7 : 1,
          transition: 'opacity 0.2s ease',
        }}
      >
        {loading ? (
          <Loader2 style={{ width: 14, height: 14, animation: 'spin 1s linear infinite' }} />
        ) : (
          <Download style={{ width: 14, height: 14 }} />
        )}
        {loading ? 'Generating PDF...' : 'Download PDF'}
      </button>
      {error && <span style={{ color: '#FCA5A5', fontSize: 11, paddingLeft: 4 }}>{error}</span>}
    </div>
  )
}

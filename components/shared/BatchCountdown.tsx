'use client'

import { useEffect, useState } from 'react'
import { Hourglass } from 'lucide-react'

interface Props {
  startDate: string // ISO date/datetime
  batchName: string
}

function getRemaining(startDate: string) {
  const diff = new Date(startDate).getTime() - Date.now()
  if (diff <= 0) return null
  const days = Math.floor(diff / 86_400_000)
  const hours = Math.floor((diff % 86_400_000) / 3_600_000)
  const minutes = Math.floor((diff % 3_600_000) / 60_000)
  return { days, hours, minutes }
}

/** Live countdown to a batch's start date. Renders nothing once the batch has started. */
export default function BatchCountdown({ startDate, batchName }: Props) {
  const [remaining, setRemaining] = useState(() => getRemaining(startDate))

  useEffect(() => {
    const id = setInterval(() => setRemaining(getRemaining(startDate)), 60_000)
    return () => clearInterval(id)
  }, [startDate])

  if (!remaining) return null

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 14 }}>
      <Hourglass style={{ width: 16, height: 16, color: '#1e40af', flexShrink: 0 }} />
      <div>
        <p style={{ fontSize: 12.5, fontWeight: 700, color: '#0f172a', margin: 0 }}>
          {batchName} starts in {remaining.days}d {remaining.hours}h {remaining.minutes}m
        </p>
        <p style={{ fontSize: 11, color: '#64748b', margin: '2px 0 0' }}>Countdown to batch start (IST)</p>
      </div>
    </div>
  )
}

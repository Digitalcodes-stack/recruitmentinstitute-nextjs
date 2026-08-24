'use client'

import React, { useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

export interface TopicScoreData {
  topic: string
  correct: number
  total: number
  percentage: number
  status: 'Strong' | 'Moderate' | 'Weak'
}

type Props = {
  strongTopics?: string[]
  weakTopics?: string[]
  topicScores?: TopicScoreData[]
}

export default function AssessmentPerformanceChart({
  strongTopics = [],
  weakTopics = [],
  topicScores,
}: Props) {
  const [filter, setFilter] = useState<'all' | 'strong' | 'weak'>('all')

  // Prepare chart data with real percentages if available
  let data: TopicScoreData[] = []
  if (topicScores && topicScores.length > 0) {
    data = topicScores
  } else {
    data = [
      ...strongTopics.map((topic) => ({
        topic,
        correct: 1,
        total: 1,
        percentage: 100,
        status: 'Strong' as const,
      })),
      ...weakTopics.map((topic) => ({
        topic,
        correct: 0,
        total: 1,
        percentage: 25,
        status: 'Weak' as const,
      })),
    ]
  }

  const filteredData = data.filter((item) => {
    if (filter === 'strong') return item.status === 'Strong'
    if (filter === 'weak') return item.status === 'Weak' || item.status === 'Moderate'
    return true
  })

  if (data.length === 0) {
    return (
      <div style={{ padding: '32px 16px', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
        No topic metrics available.
      </div>
    )
  }

  const getColor = (status: string, pct: number) => {
    if (status === 'Strong' || pct >= 70) return '#10b981' // emerald-500
    if (status === 'Moderate' || pct >= 40) return '#f59e0b' // amber-500
    return '#f43f5e' // rose-500
  }

  // Calculate dynamic height based on topic count
  const chartHeight = Math.max(260, Math.min(filteredData.length * 36 + 40, 520))

  return (
    <div>
      {/* Filter Tabs */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 16,
          paddingBottom: 12,
          borderBottom: '1px solid #f1f5f9',
        }}
      >
        <div style={{ display: 'flex', gap: 6, background: '#f8fafc', padding: 4, borderRadius: 10 }}>
          <button
            onClick={() => setFilter('all')}
            style={{
              padding: '5px 12px',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              background: filter === 'all' ? '#fff' : 'transparent',
              color: filter === 'all' ? '#0f172a' : '#64748b',
              boxShadow: filter === 'all' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            All ({data.length})
          </button>
          <button
            onClick={() => setFilter('strong')}
            style={{
              padding: '5px 12px',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              background: filter === 'strong' ? '#ecfdf5' : 'transparent',
              color: filter === 'strong' ? '#065f46' : '#64748b',
              boxShadow: filter === 'strong' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            Strong ({data.filter((d) => d.status === 'Strong').length})
          </button>
          <button
            onClick={() => setFilter('weak')}
            style={{
              padding: '5px 12px',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              background: filter === 'weak' ? '#fff1f2' : 'transparent',
              color: filter === 'weak' ? '#9f1239' : '#64748b',
              boxShadow: filter === 'weak' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            Focus Needed ({data.filter((d) => d.status !== 'Strong').length})
          </button>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 11, color: '#64748b' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
            Mastered (≥70%)
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f43f5e' }} />
            Needs Focus (&lt;70%)
          </span>
        </div>
      </div>

      {/* Chart Canvas */}
      <div style={{ width: '100%', height: chartHeight }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={filteredData}
            layout="vertical"
            margin={{ top: 4, right: 36, bottom: 4, left: 8 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
            <XAxis
              type="number"
              domain={[0, 100]}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              tickFormatter={(v) => `${v}%`}
              axisLine={{ stroke: '#e2e8f0' }}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="topic"
              width={160}
              tick={{ fontSize: 12, fill: '#334155', fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(val) =>
                val.length > 20 ? `${val.substring(0, 18)}…` : val
              }
            />
            <Tooltip
              cursor={{ fill: 'rgba(241,245,249,0.7)' }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const item = payload[0].payload as TopicScoreData
                const color = getColor(item.status, item.percentage)
                return (
                  <div
                    style={{
                      background: '#0f172a',
                      color: '#fff',
                      padding: '10px 14px',
                      borderRadius: 12,
                      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
                      fontSize: 12,
                      border: '1px solid rgba(255,255,255,0.1)',
                      minWidth: 180,
                    }}
                  >
                    <p style={{ fontWeight: 700, fontSize: 13, marginBottom: 4, color: '#f8fafc' }}>
                      {item.topic}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                      <span style={{ color: '#94a3b8' }}>Score:</span>
                      <span style={{ fontWeight: 800, color }}>
                        {item.percentage.toFixed(1)}%
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 2 }}>
                      <span style={{ color: '#94a3b8' }}>Questions:</span>
                      <span style={{ fontWeight: 600, color: '#e2e8f0' }}>
                        {item.correct} / {item.total} correct
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 4, paddingTop: 4, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                      <span style={{ color: '#94a3b8' }}>Classification:</span>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          letterSpacing: '0.08em',
                          color,
                        }}
                      >
                        {item.status}
                      </span>
                    </div>
                  </div>
                )
              }}
            />
            <Bar dataKey="percentage" radius={[0, 8, 8, 0]} barSize={16}>
              {filteredData.map((entry) => (
                <Cell
                  key={entry.topic}
                  fill={getColor(entry.status, entry.percentage)}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

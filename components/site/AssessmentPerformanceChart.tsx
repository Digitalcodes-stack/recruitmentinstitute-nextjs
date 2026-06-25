'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

type Props = {
  strongTopics: string[]
  weakTopics: string[]
}

export default function AssessmentPerformanceChart({ strongTopics, weakTopics }: Props) {
  const data = [
    ...strongTopics.map((topic) => ({ topic, status: 'Strong', value: 100 })),
    ...weakTopics.map((topic) => ({ topic, status: 'Weak', value: 100 })),
  ]

  if (data.length === 0) return null

  return (
    <div style={{ width: '100%', height: 280 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 8, right: 24, bottom: 8, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e8ecf0" horizontal={false} />
          <XAxis type="number" hide domain={[0, 100]} />
          <YAxis
            type="category"
            dataKey="topic"
            width={160}
            tick={{ fontSize: 12, fill: '#475569' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: 'rgba(37,99,235,0.06)' }}
            formatter={(_value, _name, item) => [item.payload.status, 'Performance']}
            contentStyle={{ borderRadius: 12, border: '1px solid #e8ecf0', fontSize: 12 }}
          />
          <Bar dataKey="value" radius={[8, 8, 8, 8]} barSize={18}>
            {data.map((entry) => (
              <Cell key={entry.topic} fill={entry.status === 'Strong' ? '#16A34A' : '#DC2626'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

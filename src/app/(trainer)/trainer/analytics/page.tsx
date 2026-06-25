import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getUserSession } from '@/lib/auth'
import { getTrainerBatchPerformance, getTrainerWeakTopics } from '@/lib/fastapiClient'
import { BarChart, Activity, Users, TrendingDown } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Trainer Analytics | Dashboard',
}

export default async function TrainerAnalyticsPage() {
  const session = await getUserSession()
  if (!session || session.type !== 'trainer') {
    redirect('/login')
  }

  // Hardcode a batch for now or assume batch 1 for the scope of the demo
  const trainerId = session.userId

  let performance = { avg_score: 0, avg_percentage: 0, count: 0 }
  let weakTopics: any[] = []

  try {
    const perfRes = await getTrainerBatchPerformance(trainerId)
    if (perfRes) performance = perfRes
    
    const weakRes = await getTrainerWeakTopics(trainerId)
    if (weakRes) weakTopics = weakRes
  } catch (error) {
    console.error("Failed to load analytics", error)
  }

  return (
    <div style={{ padding: '32px 24px', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>Analytics Overview</h1>
        <p style={{ fontSize: 15, color: '#64748b', marginTop: 4 }}>Monitor batch performance and identify areas for improvement.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 32 }}>
        <div style={{ background: '#fff', borderRadius: 20, padding: 24, border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Average Score</h3>
            <div style={{ background: '#EFF6FF', padding: 8, borderRadius: 10 }}>
              <Activity style={{ width: 18, height: 18, color: '#3B82F6' }} />
            </div>
          </div>
          <p style={{ fontSize: 36, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>{performance.avg_percentage?.toFixed(1) || 0}%</p>
        </div>

        <div style={{ background: '#fff', borderRadius: 20, padding: 24, border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Assessments Taken</h3>
            <div style={{ background: '#F0FDF4', padding: 8, borderRadius: 10 }}>
              <Users style={{ width: 18, height: 18, color: '#22C55E' }} />
            </div>
          </div>
          <p style={{ fontSize: 36, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>{performance.count || 0}</p>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: 24, padding: 32, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
          <TrendingDown style={{ width: 22, height: 22, color: '#EF4444' }} />
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a' }}>Top Weak Topics Across Batches</h2>
        </div>
        
        {weakTopics.length === 0 ? (
          <p style={{ fontSize: 15, color: '#64748b' }}>No weak topics identified yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {weakTopics.map((topic, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: '#F8FAFC', borderRadius: 12, border: '1px solid #F1F5F9' }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: '#334155' }}>{topic.topic_name}</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: '#EF4444', background: '#FEF2F2', padding: '4px 10px', borderRadius: 100 }}>
                  {topic.occurrence_count} occurrences
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

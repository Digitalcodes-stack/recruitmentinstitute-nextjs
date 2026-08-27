import { Pool } from 'pg'
import { sendBatchStartReminderEmail } from '../lib/email'
import { scheduleBatchStartReminders } from '../lib/jobs/sendBatchStartReminder'
import dotenv from 'dotenv'

dotenv.config()

async function main() {
  console.log('====================================================')
  console.log('  CRON JOB & BATCH COUNTDOWN EMAIL VALIDATION TEST  ')
  console.log('====================================================')

  const targetEmail = 'patilrupalib@gmail.com'
  const recipientName = 'Rupali Patil'

  // 1. Send Test Countdown Emails directly to patilrupalib@gmail.com
  console.log(`\n[1/3] Testing Countdown Email sending to: ${targetEmail}...`)
  
  try {
    const info3d = await sendBatchStartReminderEmail({
      recipientEmail: targetEmail,
      recipientName: recipientName,
      role: 'student',
      batchName: 'HR Executive Fast-Track Batch (Sep 2026)',
      courseTitle: 'End-to-End Recruitment Training & Certification Program',
      startDate: 'September 01, 2026 at 07:00 PM IST',
      leadLabel: 'in 3 days',
    })
    console.log('✅ 3-Day Countdown Email sent successfully!')

    const info1d = await sendBatchStartReminderEmail({
      recipientEmail: targetEmail,
      recipientName: recipientName,
      role: 'student',
      batchName: 'AI in Recruitment & Headhunting Batch',
      courseTitle: 'Advanced Talent Sourcing & Executive Search',
      startDate: 'Tomorrow at 07:00 PM IST',
      leadLabel: 'tomorrow',
    })
    console.log('✅ 1-Day (Tomorrow) Countdown Email sent successfully!')
  } catch (err: any) {
    console.error('❌ Failed to send countdown email:', err.message)
  }

  // 2. Test Cron Scheduler: scheduleBatchStartReminders
  console.log('\n[2/3] Testing scheduleBatchStartReminders() cron scanner...')
  try {
    const enqueued = await scheduleBatchStartReminders()
    console.log(`✅ scheduleBatchStartReminders() completed successfully! Auto-enqueued ${enqueued} batch reminder jobs.`)
  } catch (err: any) {
    console.error('❌ scheduleBatchStartReminders error:', err.message)
  }

  // 3. Inspect Job Queue Status in Database
  console.log('\n[3/3] Inspecting Job Queue & pending cron tasks...')
  const localDbUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/recruitmentinstitute'
  const pool = new Pool({ connectionString: localDbUrl })

  try {
    const jobs = await pool.query(`
      SELECT id, type, status, attempts, error, created_at, run_after
      FROM job_queue
      ORDER BY id DESC
      LIMIT 10
    `)
    console.log(`Found ${jobs.rows.length} recent jobs in job_queue:`)
    console.table(jobs.rows)

    const pendingCount = await pool.query(`SELECT count(*) FROM job_queue WHERE status = 'pending'`)
    console.log(`Total pending cron jobs ready to process: ${pendingCount.rows[0].count}`)
  } catch (err: any) {
    console.error('❌ Database job_queue inspection error:', err.message)
  } finally {
    await pool.end()
  }

  console.log('\n====================================================')
  console.log('  ALL CRON & COUNTDOWN EMAIL CHECKS COMPLETED!      ')
  console.log('====================================================')
}

main().catch(console.error)

import 'dotenv/config'
import { ensureSessionSyllabusPdf } from '../lib/services/sessionSyllabusPdfGenerator'

async function run() {
  console.log('Testing session syllabus PDF generation for Session 55...')
  const result = await ensureSessionSyllabusPdf(55, true)
  console.log('Success! Result:', {
    pdfUrl: result.pdfUrl,
    filePath: result.filePath,
    bytes: result.buffer.length,
  })
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Test failed:', err)
    process.exit(1)
  })

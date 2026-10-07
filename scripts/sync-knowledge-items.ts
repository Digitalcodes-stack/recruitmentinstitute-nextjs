import { Client } from 'pg'
import { ALL_KNOWLEDGE_FAQS } from '../lib/data/boolean-knowledge-data'

async function syncKnowledge() {
  const connectionString =
    process.env.DATABASE_URL ||
    'postgresql://postgres:postgres@localhost:5432/recruitmentinstitute'
  const client = new Client({ connectionString })

  await client.connect()
  console.log(`Connected to PostgreSQL. Total playbooks to sync: ${ALL_KNOWLEDGE_FAQS.length}`)

  // Clear current table
  await client.query('TRUNCATE TABLE knowledge_items RESTART IDENTITY CASCADE;')
  console.log('Cleared existing table.')

  for (const item of ALL_KNOWLEDGE_FAQS) {
    const leadAnswer = item.fullAnswer.split(/\n\n+/)[0]
    await client.query(
      `INSERT INTO knowledge_items (question_id, question, answer, date, added_by, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
      [
        item.id,
        item.question,
        leadAnswer,
        '2026-10-07',
        item.category,
      ]
    )
  }

  const res = await client.query('SELECT count(*) FROM knowledge_items;')
  console.log(`Successfully synced ${res.rows[0].count} items into PostgreSQL knowledge_items table!`)

  await client.end()
}

syncKnowledge().catch((err) => {
  console.error('Error syncing:', err)
  process.exit(1)
})

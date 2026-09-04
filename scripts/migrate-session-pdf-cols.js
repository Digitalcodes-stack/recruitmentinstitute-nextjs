const { Client } = require('pg');

async function migrate(name, url) {
  if (!url) return;
  console.log(`Migrating ${name}...`);
  const client = new Client({ connectionString: url });
  await client.connect();
  await client.query(`
    ALTER TABLE "sessions" ADD COLUMN IF NOT EXISTS "syllabus_pdf_url" TEXT;
    ALTER TABLE "sessions" ADD COLUMN IF NOT EXISTS "syllabus_pdf_sent_at" TIMESTAMP(3);
  `);
  console.log(`Migrated ${name} successfully!`);
  await client.end();
}

async function main() {
  await migrate('local', 'postgresql://postgres:postgres@localhost:5432/recruitmentinstitute');
  await migrate('prod', 'postgresql://postgres:RI_CloudSql_2026_Pass!@35.200.228.49:5432/recruitmentinstitute');
}

main()
  .then(() => {
    console.log('Migration completed successfully on all databases!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
  });

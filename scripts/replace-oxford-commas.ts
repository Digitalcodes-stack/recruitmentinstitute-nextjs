import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { prisma } from '../lib/prisma'

const TARGET_DIRS = [
  path.join(__dirname, '..', 'src'),
  path.join(__dirname, '..', 'components'),
  path.join(__dirname, '..', 'lib', 'data'),
]

// Patterns to replace:
// 1. " and" or " and" -> " and"
// 2. " or" or " or" -> " or"
function replaceOxfordCommas(text: string): { newText: string; count: number } {
  let count = 0
  let res = text

  // Replace " and " / " and " with " and "
  res = res.replace(/(\s*,\s*and\b)/g, (match) => {
    count++
    return ' and'
  })

  // Replace " or " / " or " with " or "
  res = res.replace(/(\s*,\s*or\b)/g, (match) => {
    count++
    return ' or'
  })

  return { newText: res, count }
}

function processDirectory(dir: string): { totalFiles: number; totalReplacements: number } {
  let totalFiles = 0
  let totalReplacements = 0

  function walk(current: string) {
    const entries = fs.readdirSync(current, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = path.join(current, entry.name)
      if (entry.isDirectory()) {
        if (entry.name === 'node_modules' || entry.name === '.next' || entry.name === '.git') continue
        walk(fullPath)
      } else if (/\.(tsx|ts|jsx|js|json|html|md)$/.test(entry.name)) {
        // Skip Prisma generated or migrations
        if (fullPath.includes('node_modules') || fullPath.includes('.next')) continue
        const original = fs.readFileSync(fullPath, 'utf8')
        const { newText, count } = replaceOxfordCommas(original)
        if (count > 0 && newText !== original) {
          fs.writeFileSync(fullPath, newText, 'utf8')
          totalFiles++
          totalReplacements += count
          console.log(`[FILE] ${path.relative(process.cwd(), fullPath)}: ${count} replacements`)
        }
      }
    }
  }

  walk(dir)
  return { totalFiles, totalReplacements }
}

async function updateDatabaseContent() {
  console.log('\n--- Updating Database Content ---')
  
  // 1. Trainers
  const trainers = await prisma.trainer.findMany()
  for (const t of trainers) {
    let changed = false
    let bio = t.bio || ''
    let spec = t.specialization || ''
    const bRes = replaceOxfordCommas(bio)
    if (bRes.count > 0) { bio = bRes.newText; changed = true }
    const sRes = replaceOxfordCommas(spec)
    if (sRes.count > 0) { spec = sRes.newText; changed = true }

    if (changed) {
      await prisma.trainer.update({
        where: { id: t.id },
        data: { bio, specialization: spec },
      })
      console.log(`[DB trainer] ${t.name}: bio/spec updated`)
    }
  }

  // 2. Courses
  const courses = await prisma.course.findMany()
  for (const c of courses) {
    let changed = false
    let desc = c.description || ''
    let review = c.review || ''
    const dRes = replaceOxfordCommas(desc)
    if (dRes.count > 0) { desc = dRes.newText; changed = true }
    const rRes = replaceOxfordCommas(review)
    if (rRes.count > 0) { review = rRes.newText; changed = true }

    if (changed) {
      await prisma.course.update({
        where: { id: c.id },
        data: { description: desc, review },
      })
      console.log(`[DB course] ${c.title}: updated`)
    }
  }

  // 3. Faqs
  const faqs = await prisma.faq.findMany()
  for (const f of faqs) {
    let changed = false
    let q = f.question
    let a = f.answer
    const qRes = replaceOxfordCommas(q)
    if (qRes.count > 0) { q = qRes.newText; changed = true }
    const aRes = replaceOxfordCommas(a)
    if (aRes.count > 0) { a = aRes.newText; changed = true }

    if (changed) {
      await prisma.faq.update({
        where: { id: f.id },
        data: { question: q, answer: a },
      })
      console.log(`[DB faq] ${f.id}: updated`)
    }
  }

  // 4. Testimonials
  const testimonials = await prisma.testimonial.findMany()
  for (const tm of testimonials) {
    let changed = false
    let desc = tm.description || ''
    const tRes = replaceOxfordCommas(desc)
    if (tRes.count > 0) { desc = tRes.newText; changed = true }

    if (changed) {
      await prisma.testimonial.update({
        where: { id: tm.id },
        data: { description: desc },
      })
      console.log(`[DB testimonial] ${tm.id}: updated`)
    }
  }
}

async function main() {
  console.log('--- Processing Codebase Files ---')
  let grandTotalFiles = 0
  let grandTotalReplacements = 0

  for (const dir of TARGET_DIRS) {
    const { totalFiles, totalReplacements } = processDirectory(dir)
    grandTotalFiles += totalFiles
    grandTotalReplacements += totalReplacements
  }

  console.log(`\nCodebase Summary: ${grandTotalReplacements} replacements across ${grandTotalFiles} files.`)

  try {
    await updateDatabaseContent()
  } catch (err) {
    console.error('Database update error (non-fatal):', err)
  }

  console.log('\nAll replacements completed successfully.')
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })

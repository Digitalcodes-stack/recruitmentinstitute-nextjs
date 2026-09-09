import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { prisma } from '../lib/prisma'

const ROOT_DIR = path.join(__dirname, '..')

const TARGET_DIRECTORIES = [
  path.join(ROOT_DIR, 'src'),
  path.join(ROOT_DIR, 'components'),
  path.join(ROOT_DIR, 'lib'),
  path.join(ROOT_DIR, 'prisma'),
  path.join(ROOT_DIR, 'scripts'),
]

const STANDALONE_FILES = [
  path.join(ROOT_DIR, 'seed-community.js'),
  path.join(ROOT_DIR, 'seed-knowledge.js'),
]

export function replaceOxfordCommas(text: string): { newText: string; count: number } {
  let count = 0

  // Replace ", and" / " ,and" / " , and"
  let res = text.replace(/(\s*,\s*and\b)/gi, (match) => {
    count++
    const idx = match.toLowerCase().indexOf('and')
    const isUpper = match[idx] === 'A'
    return isUpper ? ' And' : ' and'
  })

  // Replace ", or" / " ,or" / " , or"
  res = res.replace(/(\s*,\s*or\b)/gi, (match) => {
    count++
    const idx = match.toLowerCase().indexOf('or')
    const isUpper = match[idx] === 'O'
    return isUpper ? ' Or' : ' or'
  })

  return { newText: res, count }
}

function processFile(filePath: string): number {
  if (filePath.endsWith('.d.ts') || filePath.includes('node_modules') || filePath.includes('.next')) {
    return 0
  }
  // Ignore this script itself and previous replace scripts to prevent recursion
  if (filePath.includes('full-site-replace.ts') || filePath.includes('find-remaining.ts')) {
    return 0
  }

  const original = fs.readFileSync(filePath, 'utf8')
  const { newText, count } = replaceOxfordCommas(original)
  if (count > 0 && newText !== original) {
    fs.writeFileSync(filePath, newText, 'utf8')
    console.log(`[FILE UPDATED] ${path.relative(ROOT_DIR, filePath)}: ${count} replacements`)
    return count
  }
  return 0
}

function processDirectory(dir: string): { totalFiles: number; totalReplacements: number } {
  let totalFiles = 0
  let totalReplacements = 0

  function walk(current: string) {
    if (!fs.existsSync(current)) return
    const entries = fs.readdirSync(current, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = path.join(current, entry.name)
      if (entry.isDirectory()) {
        if (
          entry.name === 'node_modules' ||
          entry.name === '.next' ||
          entry.name === '.git' ||
          entry.name === '.venv' ||
          entry.name === 'venv'
        ) {
          continue
        }
        walk(fullPath)
      } else if (/\.(tsx|ts|jsx|js|json|html|md)$/.test(entry.name)) {
        const replacements = processFile(fullPath)
        if (replacements > 0) {
          totalFiles++
          totalReplacements += replacements
        }
      }
    }
  }

  walk(dir)
  return { totalFiles, totalReplacements }
}

async function updateAllDatabaseTables() {
  console.log('\n--- Scanning and Updating ALL Database Tables ---')

  const modelNames = Object.keys(prisma).filter(
    (k) => !k.startsWith('_') && !k.startsWith('$') && typeof (prisma as any)[k]?.findMany === 'function'
  )

  console.log(`Found ${modelNames.length} Prisma models to check:`, modelNames.join(', '))

  for (const model of modelNames) {
    try {
      const delegate = (prisma as any)[model]
      const records = await delegate.findMany()
      if (!records || records.length === 0) continue

      let updatedCount = 0

      for (const record of records) {
        const updateData: Record<string, any> = {}
        let hasChanges = false

        for (const [key, value] of Object.entries(record)) {
          if (typeof value === 'string') {
            const { newText, count } = replaceOxfordCommas(value)
            if (count > 0 && newText !== value) {
              updateData[key] = newText
              hasChanges = true
            }
          } else if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
            // Check JSON objects
            try {
              const strVal = JSON.stringify(value)
              const { newText, count } = replaceOxfordCommas(strVal)
              if (count > 0 && newText !== strVal) {
                updateData[key] = JSON.parse(newText)
                hasChanges = true
              }
            } catch (e) {
              // Ignore non-stringifiable JSON
            }
          } else if (Array.isArray(value)) {
            // Check string arrays
            let arrayChanged = false
            const newArr = value.map((item) => {
              if (typeof item === 'string') {
                const { newText, count } = replaceOxfordCommas(item)
                if (count > 0) {
                  arrayChanged = true
                  return newText
                }
              }
              return item
            })
            if (arrayChanged) {
              updateData[key] = newArr
              hasChanges = true
            }
          }
        }

        if (hasChanges) {
          // Identify primary key: usually id or code or name
          const whereClause: Record<string, any> = {}
          if ('id' in record) {
            whereClause.id = record.id
          } else if ('code' in record) {
            whereClause.code = record.code
          } else {
            console.warn(`[DB ${model}] Could not determine primary key for record:`, record)
            continue
          }

          await delegate.update({
            where: whereClause,
            data: updateData,
          })
          updatedCount++
        }
      }

      if (updatedCount > 0) {
        console.log(`[DB ${model}] Updated ${updatedCount} records.`)
      }
    } catch (err: any) {
      console.warn(`[DB ${model}] Error scanning model:`, err.message || err)
    }
  }
}

async function main() {
  console.log('=== Starting Full Site Oxford Comma Replacement ===\n')

  let grandTotalFiles = 0
  let grandTotalReplacements = 0

  for (const dir of TARGET_DIRECTORIES) {
    console.log(`Scanning directory: ${dir}`)
    const { totalFiles, totalReplacements } = processDirectory(dir)
    grandTotalFiles += totalFiles
    grandTotalReplacements += totalReplacements
  }

  for (const file of STANDALONE_FILES) {
    if (fs.existsSync(file)) {
      const count = processFile(file)
      if (count > 0) {
        grandTotalFiles++
        grandTotalReplacements += count
      }
    }
  }

  console.log(`\nFiles Summary: ${grandTotalReplacements} replacements across ${grandTotalFiles} files.`)

  try {
    await updateAllDatabaseTables()
  } catch (err) {
    console.error('Database update encountered an error:', err)
  }

  console.log('\n=== Full Site Replacement Completed Successfully ===')
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error('Fatal error:', e)
    process.exit(1)
  })

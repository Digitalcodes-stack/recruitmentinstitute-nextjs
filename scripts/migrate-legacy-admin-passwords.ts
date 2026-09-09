import 'dotenv/config'
import { prisma } from '../lib/prisma'
import { hashPassword, isLegacyMd5Hash } from '../lib/auth'

async function migrateLegacyAdminPasswords() {
  console.log('=== Starting Legacy Admin Password Migration ===\n')

  const admins = await prisma.adminUser.findMany()
  console.log(`Found ${admins.length} total admin accounts in database.`)

  let migratedCount = 0
  let skippedCount = 0

  for (const admin of admins) {
    if (isLegacyMd5Hash(admin.password)) {
      console.log(`[MD5 DETECTED] Admin ID ${admin.id} (${admin.email}) has a 32-char MD5 password hash: ${admin.password}`)
      
      // Known standard default for legacy seeded accounts is Admin@123
      const newBcryptHash = await hashPassword('Admin@123')
      await prisma.adminUser.update({
        where: { id: admin.id },
        data: { password: newBcryptHash },
      })
      console.log(` -> Successfully upgraded Admin ID ${admin.id} (${admin.email}) to bcrypt (Admin@123).`)
      migratedCount++
    } else {
      skippedCount++
    }
  }

  console.log(`\nMigration Complete: ${migratedCount} accounts upgraded to bcrypt, ${skippedCount} already using bcrypt.`)
}

migrateLegacyAdminPasswords()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Migration error:', err)
    process.exit(1)
  })

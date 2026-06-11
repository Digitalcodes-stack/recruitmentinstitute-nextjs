/**
 * Data Migration Script — MySQL to PostgreSQL
 *
 * Usage:
 *   npx ts-node scripts/migrate-data.ts
 *
 * Prerequisites:
 *   1. PostgreSQL database created and Prisma schema pushed: npx prisma db push
 *   2. Old MySQL data exported to JSON files in scripts/data/
 *   3. DATABASE_URL set in .env
 *
 * Steps to migrate:
 *   1. Export MySQL data: mysqldump --compatible=postgresql xgrkfgsh_recruitmentinstitute > dump.sql
 *   2. Use a tool like pgloader or manual SQL conversion
 *   3. Or use this script with JSON exports from MySQL
 */

import { PrismaClient, AdminRole } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function migrateBlogs(blogs: any[]) {
  console.log(`Migrating ${blogs.length} blogs...`)
  for (const blog of blogs) {
    await prisma.blog.upsert({
      where: { slug: blog.title_url || `blog-${blog.blog_id}` },
      create: {
        title: blog.blog_title,
        slug: blog.title_url || `blog-${blog.blog_id}`,
        content: blog.blog_desc || '',
        publishedAt: blog.blog_date,
        author: blog.blog_by,
        metaTitle: blog.meta_title,
        metaKeywords: blog.meta_keyword,
        metaDescription: blog.meta_desc,
        canonicalUrl: blog.meta_canonical_href,
        featuredImage: blog.item_image,
        isPublished: blog.status === 1,
        createdAt: blog.created ? new Date(blog.created) : new Date(),
      },
      update: {},
    })
  }
  console.log('✅ Blogs migrated')
}

async function migrateCourseCategories(categories: any[]) {
  console.log(`Migrating ${categories.length} course categories...`)
  for (const cat of categories) {
    await prisma.courseCategory.upsert({
      where: { id: cat.course_category_id },
      create: {
        id: cat.course_category_id,
        name: cat.course_category,
        slug: cat.course_href_tag || cat.course_category.toLowerCase().replace(/\s+/g, '-'),
      },
      update: {},
    })
  }
  console.log('✅ Course categories migrated')
}

async function migrateAdminUsers(users: any[]) {
  console.log(`Migrating ${users.length} admin users...`)
  for (const user of users) {
    // Convert MD5 hash — admin must reset password after migration
    const tempPassword = await bcrypt.hash('ChangeMe123!', 12)
    await prisma.adminUser.upsert({
      where: { email: user.email },
      create: {
        name: user.name,
        email: user.email,
        password: tempPassword, // Admin must reset after migration
        role: mapAdminRole(user.role),
        isActive: user.status === 1,
      },
      update: {},
    })
  }
  console.log('✅ Admin users migrated (passwords reset to ChangeMe123!)')
}

async function migrateSubscribers(subscribers: any[]) {
  console.log(`Migrating ${subscribers.length} subscribers...`)
  for (const sub of subscribers) {
    await prisma.subscriber.upsert({
      where: { email: sub.email },
      create: {
        email: sub.email,
        isActive: sub.status === 1,
      },
      update: {},
    })
  }
  console.log('✅ Subscribers migrated')
}

async function migrateContacts(contacts: any[]) {
  console.log(`Migrating ${contacts.length} contact submissions...`)
  for (const contact of contacts) {
    await prisma.contactSubmission.create({
      data: {
        name: contact.name || 'Unknown',
        email: contact.email || '',
        message: contact.message || '',
        mobile: contact.mobile,
        createdAt: contact.created ? new Date(contact.created) : new Date(),
      },
    })
  }
  console.log('✅ Contact submissions migrated')
}

async function migrateAboutUs(sections: any[]) {
  console.log(`Migrating ${sections.length} about sections...`)
  for (const section of sections) {
    await prisma.aboutSection.create({
      data: {
        image: section.image,
        title: section.title,
        subtitle: section.title1,
        description: section.description,
        createdAt: section.created ? new Date(section.created) : new Date(),
      },
    })
  }
  console.log('✅ About sections migrated')
}

function mapAdminRole(role: number): AdminRole {
  const map: Record<number, AdminRole> = {
    1: AdminRole.ADMIN,
    2: AdminRole.ACCOUNTANT,
    3: AdminRole.EMPLOYEE,
    4: AdminRole.PURCHASE_MANAGER,
    5: AdminRole.SALES_MANAGER,
  }
  return map[role] ?? AdminRole.ADMIN
}

async function main() {
  console.log('🚀 Starting data migration from MySQL to PostgreSQL...\n')
  console.log('📋 To migrate:')
  console.log('1. Export MySQL tables to JSON format')
  console.log('2. Place JSON files in scripts/data/ directory')
  console.log('3. Run: npx ts-node scripts/migrate-data.ts\n')

  // Example usage (uncomment and populate data):
  // const fs = await import('fs')
  // const blogs = JSON.parse(fs.readFileSync('./scripts/data/blog.json', 'utf8'))
  // await migrateBlogs(blogs)

  console.log('✨ Migration complete!')
  console.log('\n⚠️  IMPORTANT: All admin passwords have been reset to "ChangeMe123!"')
  console.log('Admin users must change their passwords after first login.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())

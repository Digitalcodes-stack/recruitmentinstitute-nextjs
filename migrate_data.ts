import * as dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'xgrkfgsh_recruitmentinstitute',
  });

  console.log('Connected to MySQL');

  try {
    // Clear existing data for idempotency
    console.log('Clearing existing PostgreSQL data...');
    await prisma.answer.deleteMany();
    await prisma.question.deleteMany();
    await prisma.communityUser.deleteMany();
    await prisma.blog.deleteMany();
    await prisma.course.deleteMany();
    await prisma.courseCategory.deleteMany();
    await prisma.adminUser.deleteMany();
    await prisma.aboutSection.deleteMany();

    // 1. ADMIN USER
    console.log('Migrating admin_user...');
    const [adminRows] = await connection.query<any[]>('SELECT * FROM user_admin');
    for (const row of adminRows) {
      await prisma.adminUser.create({
        data: {
          id: row.user_admin_id || row.id,
          name: row.name,
          middleName: row.m_name,
          lastName: row.l_name,
          email: row.email,
          contact: row.contact ? String(row.contact) : null,
          password: row.password,
          role: row.role === 'Admin' ? 'ADMIN' : 'ADMIN', // Simplification, handle roles if needed
          image: row.image,
          isActive: row.status === 1 || row.status === '1',
          createdAt: row.created_at || new Date(),
        },
      });
    }

    // 2. COURSE CATEGORY
    console.log('Migrating course_category...');
    const [categoryRows] = await connection.query<any[]>('SELECT * FROM course_category');
    for (const row of categoryRows) {
      await prisma.courseCategory.create({
        data: {
          id: row.course_category_id,
          name: row.course_category,
          slug: row.course_href_tag,
          createdAt: row.cr_date || new Date(),
        },
      });
    }

    // 3. COURSES (MySQL table: cources)
    console.log('Migrating courses (cources)...');
    const [courseRows] = await connection.query<any[]>('SELECT * FROM cources');
    for (const row of courseRows) {
      let totalStudents = 0;
      if (row.total_stud && !isNaN(parseInt(row.total_stud))) {
        totalStudents = parseInt(row.total_stud);
      }
      
      await prisma.course.create({
        data: {
          id: row.id,
          title: row.title,
          description: row.description,
          categoryId: row.couses_category_id,
          totalStudents: totalStudents,
          rating: row.rating ? parseFloat(row.rating) : 0,
          review: row.review,
          courseBy: row.course_by,
          startDate: row.Date ? new Date(row.Date) : null,
          createdAt: row.created ? new Date(row.created) : new Date(),
        },
      });
    }

    // 4. BLOG
    console.log('Migrating blog...');
    const [blogRows] = await connection.query<any[]>('SELECT * FROM blog');
    for (const row of blogRows) {
      await prisma.blog.create({
        data: {
          id: row.blog_id,
          title: row.blog_title,
          slug: row.title_url,
          content: row.blog_desc,
          publishedAt: row.blog_date ? String(row.blog_date) : null,
          author: row.blog_by,
          metaTitle: row.meta_title,
          metaKeywords: row.meta_keyword,
          metaDescription: row.meta_desc,
          canonicalUrl: row.meta_canonical_href,
          featuredImage: row.item_image,
          isPublished: row.status === 1 || row.status === '1',
          createdAt: row.created ? new Date(row.created) : new Date(),
        },
      });
    }

    // 5. COMMUNITY USERS (registers)
    console.log('Migrating community users (registers)...');
    const [communityUserRows] = await connection.query<any[]>('SELECT * FROM registers');
    for (const row of communityUserRows) {
      try {
        await prisma.communityUser.create({
          data: {
            id: row.user_id,
            name: row.Name,
            mobile: row.Mobile ? String(row.Mobile) : null,
            email: row.email,
            password: row.password,
            createdAt: row.created_at ? new Date(row.created_at) : new Date(),
          },
        });
      } catch (e: any) {
        if (e.code === 'P2002') {
          console.warn(`Skipping duplicate email for user ${row.email}`);
        } else {
          throw e;
        }
      }
    }

    // 6. QUESTIONS
    console.log('Migrating questions...');
    const [questionRows] = await connection.query<any[]>('SELECT * FROM questions');
    for (const row of questionRows) {
      try {
        await prisma.question.create({
          data: {
            id: row.id,
            userId: row.user_id,
            question: row.question,
            createdAt: row.created_at ? new Date(row.created_at) : new Date(),
          },
        });
      } catch (e: any) {
        if (e.code === 'P2003') {
          console.warn(`Skipping question ${row.id} due to invalid userId ${row.user_id}`);
        } else {
          throw e;
        }
      }
    }

    // 7. ANSWERS
    console.log('Migrating answers...');
    const [answerRows] = await connection.query<any[]>('SELECT * FROM answers');
    for (const row of answerRows) {
      try {
        await prisma.answer.create({
          data: {
            id: row.id,
            questionId: row.question_id,
            userId: row.user_id,
            answer: row.answer,
            createdAt: row.created_at ? new Date(row.created_at) : new Date(),
          },
        });
      } catch (e: any) {
        if (e.code === 'P2003') {
          console.warn(`Skipping answer ${row.id} due to invalid foreign key`);
        } else {
          throw e;
        }
      }
    }

    // 8. ABOUT US
    console.log('Migrating about_us...');
    const [aboutRows] = await connection.query<any[]>('SELECT * FROM about_us');
    for (const row of aboutRows) {
      await prisma.aboutSection.create({
        data: {
          id: row.about_us_id,
          image: row.image,
          title: row.title,
          subtitle: row.title1,
          description: row.description,
          createdAt: row.created ? new Date(row.created) : new Date(),
        },
      });
    }

    console.log('Data migration complete!');

  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    await connection.end();
    await prisma.$disconnect();
  }
}

main();

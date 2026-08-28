import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'
import * as XLSX from 'xlsx'

const DURATION_MAP: Record<string, string> = {
  'End-to-End Recruitment Training': '3 Months',
  'BBA in Recruitment & HR': '3 Years',
  'PGDM Human Resources': '2 Years',
  'HR Courses for Beginners': '6 Weeks',
  'HR Analytics Certification': '4 Weeks',
  'Talent Acquisition Certification': '6 Weeks',
  'HR Entrepreneurship Program': '2 Months',
  'Business Leadership Program': '3 Months',
  'HR Corporate Training Course': 'Flexible / Custom',
  'Mass Hiring & Bulk Recruitment': '4 Weeks',
  'Executive Search & Headhunting': '6 Weeks',
  'Technical Recruitment Bootcamp': '8 Weeks',
  'Non-IT & BFSI Hiring Specialist': '4 Weeks',
  'AI-Powered Recruitment Operations': '4 Weeks',
  'Statutory Compliance & Payroll in Hiring': '4 Weeks',
  'Recruitment Agency Launchpad': '8 Weeks',
}

function resolveDuration(courseName: string, categoryName: string, existingDuration?: string | null): string {
  if (existingDuration && existingDuration.trim()) return existingDuration.trim()
  if (DURATION_MAP[courseName]) return DURATION_MAP[courseName]
  if (DURATION_MAP[categoryName]) return DURATION_MAP[categoryName]

  const lower = courseName.toLowerCase()
  if (lower.includes('bootcamp') || lower.includes('masterclass')) return '8 Weeks'
  if (lower.includes('certification') || lower.includes('specialist')) return '6 Weeks'
  if (lower.includes('diploma') || lower.includes('pgdm')) return '1 Year'
  if (lower.includes('degree') || lower.includes('bba')) return '3 Years'
  if (lower.includes('executive') || lower.includes('entrepreneurship')) return '2 Months'
  if (lower.includes('corporate') || lower.includes('custom')) return 'Flexible / 2–6 Weeks'
  return '6 Weeks'
}

export async function GET() {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin') {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  const [categories, courses, courseFees] = await Promise.all([
    prisma.courseCategory.findMany({ orderBy: { id: 'asc' } }),
    prisma.course.findMany({
      orderBy: { id: 'asc' },
      include: { category: true, modules: true },
    }),
    prisma.courseFee.findMany({
      orderBy: { id: 'asc' },
      include: { category: true },
    }),
  ])

  // Sheet 1: Master Course Schedule with Fees & Durations
  const masterSheetData = courseFees.map((fee, index) => {
    const matchedCourse = courses.find((c) => c.title.toLowerCase() === fee.courseName.toLowerCase() || c.categoryId === fee.categoryId)
    const duration = resolveDuration(fee.courseName, fee.category?.name || '', matchedCourse?.duration)
    const baseFee = fee.fees ? Number(fee.fees) : 0
    const discount = fee.discount ? Number(fee.discount) : 0
    const finalTotal = fee.finalTotal ? Number(fee.finalTotal) : (baseFee - discount)

    return {
      'Sr. No': index + 1,
      'Course / Program Name': fee.courseName,
      'Category': fee.category?.name || 'General',
      'Duration': duration,
      'Base Fee (₹)': baseFee,
      'Discount (₹)': discount > 0 ? -discount : 0,
      'Final Fee Total (₹)': finalTotal,
      'Coupon Code': fee.couponCode || '—',
      'Total Enrolled': matchedCourse?.totalStudents ?? 0,
      'Rating': matchedCourse?.rating ? Number(matchedCourse.rating) : 5.0,
      'LMS Modules Count': matchedCourse?.modules?.length ?? 7,
      'Status': 'Active / Live',
    }
  })

  // Sheet 2: LMS Master Courses Detail
  const coursesSheetData = courses.map((c, idx) => ({
    'Sr. No': idx + 1,
    'Course ID': c.id,
    'Course Title': c.title,
    'Category': c.category.name,
    'Duration': c.duration || resolveDuration(c.title, c.category.name),
    'Total Students': c.totalStudents,
    'Rating (0-5)': c.rating ? Number(c.rating) : 5.0,
    'Instructor / By': c.courseBy || 'Industry Mentors',
    'LMS Modules': c.modules.length,
    'Description': c.description.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim(),
  }))

  // Sheet 3: Categories Summary
  const categorySheetData = categories.map((cat) => {
    const catFees = courseFees.filter((f) => f.categoryId === cat.id)
    const catCourses = courses.filter((c) => c.categoryId === cat.id)
    return {
      'Category ID': cat.id,
      'Category Name': cat.name,
      'Category Slug': cat.slug,
      'Total Courses / Fee Entries': catFees.length,
      'Total LMS Courses': catCourses.length,
    }
  })

  const workbook = XLSX.utils.book_new()
  const wsMaster = XLSX.utils.json_to_sheet(masterSheetData)
  const wsCourses = XLSX.utils.json_to_sheet(coursesSheetData)
  const wsCategories = XLSX.utils.json_to_sheet(categorySheetData)

  const autoFitColumns = (json: any[]) => {
    if (!json || json.length === 0) return []
    const headers = Object.keys(json[0])
    return headers.map((key) => {
      const maxLen = Math.max(
        key.length,
        ...json.map((row) => (row[key] ? String(row[key]).length : 0))
      )
      return { wch: Math.min(Math.max(maxLen + 3, 10), 60) }
    })
  }

  wsMaster['!cols'] = autoFitColumns(masterSheetData)
  wsCourses['!cols'] = autoFitColumns(coursesSheetData)
  wsCategories['!cols'] = autoFitColumns(categorySheetData)

  XLSX.utils.book_append_sheet(workbook, wsMaster, 'All Courses & Fees')
  XLSX.utils.book_append_sheet(workbook, wsCourses, 'LMS Master Courses')
  XLSX.utils.book_append_sheet(workbook, wsCategories, 'Categories Summary')

  const buf = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

  return new Response(buf, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="recruitment_institute_all_courses.xlsx"',
    },
  })
}

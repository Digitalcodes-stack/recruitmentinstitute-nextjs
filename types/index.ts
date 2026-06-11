// Shared TypeScript types for the entire application

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  errors?: Record<string, string[]>
}

export interface BlogPost {
  id: number
  title: string
  slug: string
  content: string
  publishedAt: string | null
  author: string | null
  metaTitle: string | null
  metaKeywords: string | null
  metaDescription: string | null
  canonicalUrl: string | null
  featuredImage: string | null
  schemaScript: string | null
  customScript: string | null
  isPublished: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CourseCategory {
  id: number
  name: string
  slug: string
  createdAt: Date
  courses?: Course[]
  fees?: CourseFee[]
  reviews?: CourseReview[]
  experts?: Expert[]
  faqs?: Faq[]
}

export interface Course {
  id: number
  title: string
  description: string
  categoryId: number
  totalStudents: number
  rating: number | null
  review: string | null
  courseBy: string | null
  startDate: Date | null
  createdAt: Date
  category?: CourseCategory
}

export interface Expert {
  id: number
  title: string
  profession: string | null
  image: string | null
  categoryId: number
  category?: CourseCategory
}

export interface CourseFee {
  id: number
  courseName: string
  categoryId: number
  fees: number | null
  discount: number | null
  total: number | null
  feeTotal: number | null
  subtotal: number | null
  finalTotal: number | null
  couponCode: string | null
  category?: CourseCategory
}

export interface CourseReview {
  id: number
  title: string
  description: string | null
  rating: number
  review: string | null
  categoryId: number
  category?: CourseCategory
}

export interface Faq {
  id: number
  question: string
  answer: string
  categoryId: number | null
  createdAt: Date
  category?: CourseCategory
}

export interface KnowledgeItem {
  id: number
  question: string
  answer: string
  date: string | null
  addedBy: string | null
  createdAt: Date
}

export interface CommunityQuestion {
  id: number
  userId: number
  question: string
  createdAt: Date
  user?: {
    name: string
    email: string
  }
  answers?: CommunityAnswer[]
  _count?: { answers: number }
}

export interface CommunityAnswer {
  id: number
  questionId: number
  userId: number
  answer: string
  createdAt: Date
  user?: {
    name: string
    email: string
  }
}

export interface AboutSection {
  id: number
  image: string | null
  title: string | null
  subtitle: string | null
  description: string | null
  createdAt: Date
}

export interface Testimonial {
  id: number
  title: string | null
  description: string | null
  author: string | null
  image: string | null
  rating: number
  isActive: boolean
  createdAt: Date
}

export interface Service {
  id: number
  title: string
  slug: string
  description: string | null
  image: string | null
  isActive: boolean
  sortOrder: number
  createdAt: Date
}

export interface ContactSubmission {
  id: number
  name: string
  email: string
  message: string
  mobile: string | null
  createdAt: Date
}

export interface AdminUser {
  id: number
  name: string
  email: string
  role: AdminRole
  image: string | null
  isActive: boolean
  createdAt: Date
}

export type AdminRole =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'ACCOUNTANT'
  | 'EMPLOYEE'
  | 'PURCHASE_MANAGER'
  | 'SALES_MANAGER'

export interface AuthSession {
  userId: number
  email: string
  name: string
  role: AdminRole
  type: 'admin' | 'student' | 'membership' | 'candidate' | 'community'
}

// Form Types
export interface ContactFormData {
  name: string
  email: string
  mobile: string
  message: string
}

export interface CourseEnquiryData {
  firstName: string
  lastName: string
  email: string
  contact: string
}

export interface CandidateLoginData {
  email: string
  password: string
}

export interface CandidateSignupData {
  name: string
  email: string
  password: string
  confirmPassword: string
  birthdate?: string
  gender?: string
  address?: string
  streetAddress?: string
  city?: string
  state?: string
  zip?: string
  phone?: string
  courseSelect?: string
  comments?: string
}

export interface StudentRegisterData {
  name: string
  contact: string
  email: string
  password: string
  re_password: string
}

export interface NewsletterData {
  email: string
}

import { z } from 'zod'

export const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  mobile: z.string().min(10, 'Mobile number must be at least 10 digits'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000),
})

export const courseEnquirySchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  contact: z.string().min(10, 'Contact must be at least 10 digits'),
})

export const blogVisitorSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().optional(),
  email: z.string().email('Invalid email address'),
  contact: z.string().min(10, 'Contact required'),
})

export const candidateLoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const candidateSignupSchema = z
  .object({
    name: z.string().min(2, 'Name is required'),
    email: z.string().email('Invalid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Confirm password required'),
    birthdate: z.string().optional(),
    gender: z.enum(['male', 'female', 'other']).optional(),
    address: z.string().optional(),
    streetAddress: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zip: z.string().optional(),
    phone: z.string().optional(),
    courseSelect: z.string().optional(),
    comments: z.string().optional(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export const studentRegisterSchema = z
  .object({
    name: z.string().min(2, 'Name is required'),
    contact: z.string().min(10, 'Contact is required'),
    email: z.string().email('Invalid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    re_password: z.string().min(6, 'Confirm password required'),
  })
  .refine((d) => d.password === d.re_password, {
    message: 'Passwords do not match',
    path: ['re_password'],
  })

export const newsletterSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export const communityQuestionSchema = z.object({
  question: z.string().min(10, 'Question must be at least 10 characters'),
})

export const communityAnswerSchema = z.object({
  questionId: z.number().int().positive(),
  answer: z.string().min(5, 'Answer must be at least 5 characters'),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Token required'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export const adminLoginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
})

export const blogSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  content: z.string().min(50, 'Content is required'),
  author: z.string().optional(),
  metaTitle: z.string().optional(),
  metaKeywords: z.string().optional(),
  metaDescription: z.string().optional(),
  canonicalUrl: z.string().optional(),
  schemaScript: z.string().optional(),
  customScript: z.string().optional(),
  isPublished: z.boolean().default(true),
})

export const courseSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  description: z.string().min(10, 'Description is required'),
  categoryId: z.number().int().positive(),
  totalStudents: z.number().int().default(0),
  rating: z.number().min(0).max(5).optional(),
  courseBy: z.string().optional(),
})

export const faqSchema = z.object({
  question: z.string().min(5, 'Question is required'),
  answer: z.string().min(5, 'Answer is required'),
  categoryId: z.number().int().positive().optional(),
})

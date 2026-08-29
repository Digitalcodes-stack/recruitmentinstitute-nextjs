export type BatchMode = 'ONLINE' | 'OFFLINE' | 'HYBRID'
export type BatchStatus = 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'

export interface BatchItem {
  id: number
  name: string
  batchCode: string
  courseId: number
  courseTitle: string
  courseSlug: string
  trainerId?: number
  trainerName: string
  trainerImage?: string
  trainerTitle?: string
  capacity: number
  enrolledCount: number
  seatsLeft: number
  mode: BatchMode
  startDate: string // e.g. '2025-04-15' or ISO string
  displayStartDate?: string // e.g. '15th April, 2025'
  endDate?: string
  schedule: string // e.g. 'Weekend Batch • Sat & Sun 10:00 AM - 1:00 PM IST'
  duration: string // e.g. '8 Weeks | Weekend'
  originalPrice: number
  discountedPrice: number
  onlinePrice: number
  offlinePrice: number
  currency?: string
  isFastFilling?: boolean
  isGuaranteed?: boolean
  timing?: string
}

export interface TrainerItem {
  id: number
  name: string
  email?: string
  phone?: string
  designation: string
  companyEx?: string
  experienceYears: number
  specializationTags: string[]
  bio: string
  longBio?: string
  image: string
  rating: number
  reviewsCount: number
  studentsMentored: number
  coursesTaught: string[]
  modes: ('Online' | 'Offline' | 'Hybrid')[]
  featured?: boolean
  linkedinUrl?: string
  quote?: string
  certifications?: string[]
}

export interface UpcomingBatchesProps {
  batches?: BatchItem[]
  title?: string
  subtitle?: string
  showAllButton?: boolean
  compact?: boolean
  defaultFilter?: 'ALL' | 'ONLINE' | 'OFFLINE' | 'HYBRID'
}

export interface FeaturedTrainersProps {
  trainers?: TrainerItem[]
  title?: string
  subtitle?: string
  limit?: number
  viewAllHref?: string
  className?: string
  darkBackground?: boolean
}

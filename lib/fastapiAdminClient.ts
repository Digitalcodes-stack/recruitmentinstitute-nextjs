import { fastApiFetchWithCookie } from '@/lib/fastapiClient'
import type { AssessmentSummary } from '@/lib/fastapiClient'

const ADMIN_COOKIE = 'ri_admin_token'

function adminFetch<T>(path: string, init?: RequestInit): Promise<T> {
  return fastApiFetchWithCookie<T>(ADMIN_COOKIE, path, init)
}

export type QuestionBankItem = {
  id: number
  assessment_id: number
  topic_name: string
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_option: 'A' | 'B' | 'C' | 'D'
  sort_order: number
  created_at: string
}

export type QuestionBankItemInput = {
  topic_name: string
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_option: 'A' | 'B' | 'C' | 'D'
  sort_order?: number
}

export function createAssessment(courseId: number, assessmentName: string, totalMarks: number, durationMinutes: number) {
  return adminFetch<AssessmentSummary>('/api/v1/assessment/', {
    method: 'POST',
    body: JSON.stringify({
      course_id: courseId,
      assessment_name: assessmentName,
      total_marks: totalMarks,
      duration_minutes: durationMinutes,
    }),
  })
}

export function getAssessmentByCourseAdmin(courseId: number) {
  return adminFetch<AssessmentSummary>(`/api/v1/assessment/by-course/${courseId}`)
}

export function listQuestions(assessmentId: number) {
  return adminFetch<QuestionBankItem[]>(`/api/v1/assessment/${assessmentId}/questions`)
}

export function addQuestion(assessmentId: number, input: QuestionBankItemInput) {
  return adminFetch<QuestionBankItem>(`/api/v1/assessment/${assessmentId}/questions`, {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function deleteQuestion(assessmentId: number, questionId: number) {
  return adminFetch<null>(`/api/v1/assessment/${assessmentId}/questions/${questionId}`, {
    method: 'DELETE',
  })
}

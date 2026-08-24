import { cookies } from 'next/headers'

const USER_COOKIE = 'ri_user_token'

export class FastApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

export async function fastApiFetchWithCookie<T>(cookieName: string, path: string, init?: RequestInit): Promise<T> {
  const cookieStore = await cookies()
  const token = cookieStore.get(cookieName)?.value
  if (!token) throw new FastApiError('Unauthorized', 401)

  const baseUrl = process.env.FASTAPI_SERVICE_URL || 'http://localhost:8000'
  const res = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...init?.headers,
    },
    cache: 'no-store',
  })

  const json = await res.json().catch(() => null)
  if (!res.ok || !json?.success) {
    throw new FastApiError(json?.message || 'FastAPI request failed', res.status)
  }
  return json.data as T
}

async function fastApiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  return fastApiFetchWithCookie<T>(USER_COOKIE, path, init)
}

export type TopicScoreInput = {
  topic_name: string
  correct: number
  total: number
}

export type AIAssessmentAnalysis = {
  id: number
  student_id: number
  assessment_id: number
  score: number
  percentage: number
  strong_topics: string[]
  weak_topics: string[]
  analysis_json: Record<string, unknown>
  created_at: string
}

export type AIGeneratedNote = {
  id: number
  student_id: number
  assessment_id: number
  topic_name: string
  notes_content: string
  created_at: string
}

export type StudentStudyPlan = {
  id: number
  student_id: number
  assessment_id: number
  plan_json: Record<string, unknown>
  created_at: string
}

export type StudentAssessment = {
  id: number
  student_id: number
  assessment_id: number
  started_at: string
  completed_at: string | null
  score: number | null
  percentage: number | null
  status: string
}

export type AssessmentSubmitResult = {
  student_assessment_id: number
  analysis: AIAssessmentAnalysis
  notes: AIGeneratedNote[]
  study_plan: StudentStudyPlan
  recommendations: string[]
}

export type AssessmentResult = {
  student_assessment: StudentAssessment
  analysis: AIAssessmentAnalysis
}

export type AssessmentSummary = {
  id: number
  course_id: number
  assessment_name: string
  total_marks: number
  duration_minutes: number
}

export type AssessmentQuestion = {
  id: number
  assessment_id: number
  topic_name: string
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  sort_order: number
}

export type AssessmentAnswerInput = {
  question_id: number
  selected_option: 'A' | 'B' | 'C' | 'D'
}

export function submitAssessment(assessmentId: number, topicScores: TopicScoreInput[]) {
  return fastApiFetch<AssessmentSubmitResult>('/api/v1/assessment/submit', {
    method: 'POST',
    body: JSON.stringify({ assessment_id: assessmentId, topic_scores: topicScores }),
  })
}

export function listMyAssessments() {
  return fastApiFetch<StudentAssessment[]>('/api/v1/assessment/my')
}

export function getAssessmentResult(studentAssessmentId: number) {
  return fastApiFetch<AssessmentResult>(`/api/v1/assessment/result/${studentAssessmentId}`)
}

export function getAssessmentNotes(studentAssessmentId: number) {
  return fastApiFetch<AIGeneratedNote[]>(`/api/v1/assessment/notes/${studentAssessmentId}`)
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
  correct_option: string
  explanation: string | null
  difficulty: string
  sort_order: number
  student_answer?: string | null
}

export function getAssessmentTest(studentAssessmentId: number) {
  return fastApiFetch<QuestionBankItem[]>(`/api/v1/assessment/result/${studentAssessmentId}/test`)
}

export function getAssessmentStudyPlan(studentAssessmentId: number) {
  return fastApiFetch<StudentStudyPlan>(`/api/v1/assessment/study-plan/${studentAssessmentId}`)
}
export async function getAssessmentReportStatus(id: number) {
  return fastApiFetch<{ status: string; file_path?: string | null }>(`/api/v1/assessment/report/${id}/status`)
}
export function getAssessmentByCourse(courseId: number) {
  return fastApiFetch<AssessmentSummary>(`/api/v1/assessment/by-course/${courseId}`)
}

export function getTrainerBatchPerformance(trainerId: number) {
  return fastApiFetch<any>(`/api/v1/trainer/analytics/${trainerId}/batch-performance`)
}

export function getTrainerWeakTopics(trainerId: number) {
  return fastApiFetch<any[]>(`/api/v1/trainer/analytics/${trainerId}/weak-topics`)
}

export function getTrainerBatchRecommendations(trainerId: number, batchId: number) {
  return fastApiFetch<{ recommendations: string[] }>(`/api/v1/trainer/analytics/${trainerId}/batches/${batchId}/recommendations`)
}

export function startAssessment(assessmentId: number) {
  return fastApiFetch<AssessmentQuestion[]>(`/api/v1/assessment/${assessmentId}/start`)
}

export function gradeAndSubmitAssessment(assessmentId: number, answers: AssessmentAnswerInput[]) {
  return fastApiFetch<AssessmentSubmitResult>(`/api/v1/assessment/${assessmentId}/grade-and-submit`, {
    method: 'POST',
    body: JSON.stringify({ assessment_id: assessmentId, answers }),
  })
}

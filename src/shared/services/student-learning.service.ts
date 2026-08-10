import axiosInstance from '@/shared/lib/axios'
import type { ApiResponse } from '@/types'
import type {
  StudentLearningDashboard,
  StudentRoadmap,
  LearningContent,
  LearningProgress,
  ContinueLearningResult,
  LessonCompletionResult,
  LearningProgressStatus,
} from '@/shared/types/learning-cms'

const STUDENT_BASE = '/learning'

// ─── Dashboard ───────────────────────────────────────────────────────────────

const getDashboard = () =>
  axiosInstance.get<ApiResponse<StudentLearningDashboard>>(`${STUDENT_BASE}/dashboard`)

// ─── Roadmap ─────────────────────────────────────────────────────────────────

const getRoadmap = () =>
  axiosInstance.get<ApiResponse<StudentRoadmap>>(`${STUDENT_BASE}/roadmap`)

// ─── Content / Lessons ───────────────────────────────────────────────────────

const getContentById = (id: string) =>
  axiosInstance.get<ApiResponse<LearningContent>>(`${STUDENT_BASE}/content/${id}`)

// ─── Progress & Completion ───────────────────────────────────────────────────

const startLesson = (contentId: string) =>
  axiosInstance.post<ApiResponse<LearningProgress>>(`${STUDENT_BASE}/content/${contentId}/start`)

const completeLesson = (contentId: string) =>
  axiosInstance.post<ApiResponse<LessonCompletionResult>>(
    `${STUDENT_BASE}/content/${contentId}/complete`,
  )

const updateProgressStatus = (contentId: string, status: LearningProgressStatus) =>
  axiosInstance.patch<ApiResponse<LearningProgress>>(
    `${STUDENT_BASE}/content/${contentId}/progress`,
    { status },
  )

// ─── Continue Learning ───────────────────────────────────────────────────────

const getContinueLearning = () =>
  axiosInstance.get<ApiResponse<ContinueLearningResult | null>>(`${STUDENT_BASE}/continue`)

// ─── Export Service ──────────────────────────────────────────────────────────

export const studentLearningService = {
  getDashboard,
  getRoadmap,
  getContentById,
  startLesson,
  completeLesson,
  updateProgressStatus,
  getContinueLearning,
}

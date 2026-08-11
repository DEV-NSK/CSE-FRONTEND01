import axiosInstance from '@/shared/lib/axios'
import type { ApiResponse } from '@/types'
import type {
  Course,
  CourseFormData,
  LearningLevel,
  LearningLevelFormData,
  LearningContent,
  LearningContentFormData,
  LearningContentStatus,
  LearningNoteImage,
  NoteImageReorderData,
  AdminLearningDashboardStats,
  AdminLearningContentFilters,
  AdminLearningContentListResponse,
  NotesUploadResult,
} from '@/shared/types/learning-cms'

const ADMIN_BASE = '/admin/learning'

// ─── Courses ─────────────────────────────────────────────────────────────────

const getCourses = (params?: { search?: string; status?: string; page?: number; limit?: number }) =>
  axiosInstance.get<ApiResponse<{ data: Course[]; total: number; page: number; limit: number; totalPages: number }>>(`${ADMIN_BASE}/courses`, { params })

const getCourseById = (id: string) =>
  axiosInstance.get<ApiResponse<Course>>(`${ADMIN_BASE}/courses/${id}`)

const createCourse = (data: CourseFormData) =>
  axiosInstance.post<ApiResponse<Course>>(`${ADMIN_BASE}/courses`, data)

const updateCourse = (id: string, data: Partial<CourseFormData>) =>
  axiosInstance.put<ApiResponse<Course>>(`${ADMIN_BASE}/courses/${id}`, data)

const deleteCourse = (id: string) =>
  axiosInstance.delete<ApiResponse<void>>(`${ADMIN_BASE}/courses/${id}`)

// ─── Dashboard ───────────────────────────────────────────────────────────────

const getDashboardStats = () =>
  axiosInstance.get<ApiResponse<AdminLearningDashboardStats>>(`${ADMIN_BASE}/dashboard`)

// ─── Levels ──────────────────────────────────────────────────────────────────

const getLevels = (params?: { includeInactive?: boolean }) =>
  axiosInstance.get<ApiResponse<LearningLevel[]>>(`${ADMIN_BASE}/levels`, { params })

const getLevelById = (id: string) =>
  axiosInstance.get<ApiResponse<LearningLevel>>(`${ADMIN_BASE}/levels/${id}`)

const createLevel = (data: LearningLevelFormData) =>
  axiosInstance.post<ApiResponse<LearningLevel>>(`${ADMIN_BASE}/levels`, data)

const updateLevel = (id: string, data: Partial<LearningLevelFormData>) =>
  axiosInstance.patch<ApiResponse<LearningLevel>>(`${ADMIN_BASE}/levels/${id}`, data)

const deleteLevel = (id: string) =>
  axiosInstance.delete<ApiResponse<void>>(`${ADMIN_BASE}/levels/${id}`)

// ─── Content ─────────────────────────────────────────────────────────────────

const getContentList = (filters?: AdminLearningContentFilters) =>
  axiosInstance.get<ApiResponse<AdminLearningContentListResponse>>(`${ADMIN_BASE}/content`, {
    params: filters,
  })

const getContentById = (id: string) =>
  axiosInstance.get<ApiResponse<LearningContent>>(`${ADMIN_BASE}/content/${id}`)

const createContent = (data: LearningContentFormData) =>
  axiosInstance.post<ApiResponse<LearningContent>>(`${ADMIN_BASE}/content`, data)

const updateContent = (id: string, data: Partial<LearningContentFormData>) =>
  axiosInstance.patch<ApiResponse<LearningContent>>(`${ADMIN_BASE}/content/${id}`, data)

const deleteContent = (id: string) =>
  axiosInstance.delete<ApiResponse<void>>(`${ADMIN_BASE}/content/${id}`)

const publishContent = (id: string) =>
  axiosInstance.post<ApiResponse<LearningContent>>(`${ADMIN_BASE}/content/${id}/publish`)

const unpublishContent = (id: string) =>
  axiosInstance.post<ApiResponse<LearningContent>>(`${ADMIN_BASE}/content/${id}/unpublish`)

const archiveContent = (id: string) =>
  axiosInstance.post<ApiResponse<LearningContent>>(`${ADMIN_BASE}/content/${id}/archive`)

const bulkUpdateStatus = (ids: string[], status: LearningContentStatus) =>
  axiosInstance.post<ApiResponse<{ updated: number }>>(`${ADMIN_BASE}/content/bulk-status`, {
    ids,
    status,
  })

const bulkDelete = (ids: string[]) =>
  axiosInstance.post<ApiResponse<{ deleted: number }>>(`${ADMIN_BASE}/content/bulk-delete`, { ids })

// ─── Notes Upload ────────────────────────────────────────────────────────────

const uploadNotes = (contentId: string, formData: FormData) =>
  axiosInstance.post<ApiResponse<NotesUploadResult>>(
    `${ADMIN_BASE}/content/${contentId}/notes`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  )

const deleteNoteImage = (contentId: string, imageId: string) =>
  axiosInstance.delete<ApiResponse<void>>(`${ADMIN_BASE}/content/${contentId}/notes/${imageId}`)

const reorderNoteImages = (contentId: string, reorderData: NoteImageReorderData[]) =>
  axiosInstance.patch<ApiResponse<LearningNoteImage[]>>(
    `${ADMIN_BASE}/content/${contentId}/notes/reorder`,
    { order: reorderData },
  )

// ─── Export Service ──────────────────────────────────────────────────────────

export const adminLearningService = {
  getDashboardStats,
  // Courses
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  // Levels
  getLevels,
  getLevelById,
  createLevel,
  updateLevel,
  deleteLevel,
  // Content
  getContentList,
  getContentById,
  createContent,
  updateContent,
  deleteContent,
  publishContent,
  unpublishContent,
  archiveContent,
  bulkUpdateStatus,
  bulkDelete,
  // Notes
  uploadNotes,
  deleteNoteImage,
  reorderNoteImages,
}

/**
 * FPRD-10: Manager CMS Service
 * Centralised API client for all Manager Console endpoints
 */
import axiosInstance from '@/shared/lib/axios'
import type { ApiResponse } from '@/types'

// ── Generic list response ─────────────────────────────────────────────────────
export interface ListResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}

// ── Filter params helper ───────────────────────────────────────────────────────
export interface ListParams {
  search?: string
  status?: 'published' | 'draft' | 'archived' | 'all'
  categoryId?: string
  difficulty?: string
  type?: string
  companyId?: string
  lessonId?: string
  sectionId?: string
  page?: number
  limit?: number
}

const BASE = '/manager'

// ── Dashboard ──────────────────────────────────────────────────────────────────
const getDashboard = () =>
  axiosInstance.get<ApiResponse<unknown>>(`${BASE}/dashboard`)

const getCMSDashboard = () =>
  axiosInstance.get<ApiResponse<unknown>>(`${BASE}/cms/dashboard`)

// ── Learning: Categories ───────────────────────────────────────────────────────
const getCategories = (params?: ListParams) =>
  axiosInstance.get<ApiResponse<ListResponse<Category>>>(`${BASE}/categories`, { params })

const createCategory = (data: Partial<Category>) =>
  axiosInstance.post<ApiResponse<Category>>(`${BASE}/categories`, data)

const updateCategory = (id: string, data: Partial<Category>) =>
  axiosInstance.patch<ApiResponse<Category>>(`${BASE}/categories/${id}`, data)

const deleteCategory = (id: string) =>
  axiosInstance.delete<ApiResponse<void>>(`${BASE}/categories/${id}`)

// ── Learning: Roadmaps ─────────────────────────────────────────────────────────
const getRoadmaps = (params?: ListParams) =>
  axiosInstance.get<ApiResponse<ListResponse<Roadmap>>>(`${BASE}/roadmaps`, { params })

const getRoadmapById = (id: string) =>
  axiosInstance.get<ApiResponse<Roadmap>>(`${BASE}/roadmaps/${id}`)

const createRoadmap = (data: Partial<Roadmap>) =>
  axiosInstance.post<ApiResponse<Roadmap>>(`${BASE}/roadmaps`, data)

const updateRoadmap = (id: string, data: Partial<Roadmap>) =>
  axiosInstance.patch<ApiResponse<Roadmap>>(`${BASE}/roadmaps/${id}`, data)

const deleteRoadmap = (id: string) =>
  axiosInstance.delete<ApiResponse<void>>(`${BASE}/roadmaps/${id}`)

const publishRoadmap = (id: string) =>
  axiosInstance.patch<ApiResponse<Roadmap>>(`${BASE}/roadmaps/${id}/publish`)

const archiveRoadmap = (id: string) =>
  axiosInstance.patch<ApiResponse<Roadmap>>(`${BASE}/roadmaps/${id}/archive`)

const duplicateRoadmap = (id: string) =>
  axiosInstance.post<ApiResponse<Roadmap>>(`${BASE}/roadmaps/${id}/duplicate`)

// ── Learning: Sections ─────────────────────────────────────────────────────────
const getSections = (roadmapId: string) =>
  axiosInstance.get<ApiResponse<Section[]>>(`${BASE}/roadmaps/${roadmapId}/sections`)

const createSection = (data: Partial<Section>) =>
  axiosInstance.post<ApiResponse<Section>>(`${BASE}/sections`, data)

const updateSection = (id: string, data: Partial<Section>) =>
  axiosInstance.patch<ApiResponse<Section>>(`${BASE}/sections/${id}`, data)

const deleteSection = (id: string) =>
  axiosInstance.delete<ApiResponse<void>>(`${BASE}/sections/${id}`)

// ── Learning: Lessons ──────────────────────────────────────────────────────────
const getLessons = (params?: ListParams) =>
  axiosInstance.get<ApiResponse<ListResponse<Lesson>>>(`${BASE}/lessons`, { params })

const getLessonById = (id: string) =>
  axiosInstance.get<ApiResponse<Lesson>>(`${BASE}/lessons/${id}`)

const createLesson = (data: Partial<Lesson>) =>
  axiosInstance.post<ApiResponse<Lesson>>(`${BASE}/lessons`, data)

const updateLesson = (id: string, data: Partial<Lesson>) =>
  axiosInstance.patch<ApiResponse<Lesson>>(`${BASE}/lessons/${id}`, data)

const deleteLesson = (id: string) =>
  axiosInstance.delete<ApiResponse<void>>(`${BASE}/lessons/${id}`)

// ── Learning: Resources ────────────────────────────────────────────────────────
const getResources = (params?: ListParams) =>
  axiosInstance.get<ApiResponse<ListResponse<Resource>>>(`${BASE}/resources`, { params })

const createResource = (data: Partial<Resource>) =>
  axiosInstance.post<ApiResponse<Resource>>(`${BASE}/resources`, data)

const updateResource = (id: string, data: Partial<Resource>) =>
  axiosInstance.patch<ApiResponse<Resource>>(`${BASE}/resources/${id}`, data)

const deleteResource = (id: string) =>
  axiosInstance.delete<ApiResponse<void>>(`${BASE}/resources/${id}`)

// ── Coding: Problem Categories ─────────────────────────────────────────────────
const getProblemCategories = (params?: ListParams) =>
  axiosInstance.get<ApiResponse<ListResponse<ProblemCategory>>>(`${BASE}/problem-categories`, { params })

const createProblemCategory = (data: { name: string; slug: string; description?: string }) =>
  axiosInstance.post<ApiResponse<ProblemCategory>>(`${BASE}/problem-categories`, data)

const updateProblemCategory = (id: string, data: Partial<ProblemCategory>) =>
  axiosInstance.patch<ApiResponse<ProblemCategory>>(`${BASE}/problem-categories/${id}`, data)

const deleteProblemCategory = (id: string) =>
  axiosInstance.delete<ApiResponse<void>>(`${BASE}/problem-categories/${id}`)

// ── Coding: Problems ───────────────────────────────────────────────────────────
const getProblems = (params?: ListParams) =>
  axiosInstance.get<ApiResponse<ListResponse<CodingProblem>>>(`${BASE}/problems`, { params })

const getProblemById = (id: string) =>
  axiosInstance.get<ApiResponse<CodingProblem>>(`${BASE}/problems/${id}`)

const createProblem = (data: Partial<CodingProblem>) =>
  axiosInstance.post<ApiResponse<CodingProblem>>(`${BASE}/problems`, data)

const updateProblem = (id: string, data: Partial<CodingProblem>) =>
  axiosInstance.put<ApiResponse<CodingProblem>>(`${BASE}/problems/${id}`, data)

const deleteProblem = (id: string) =>
  axiosInstance.delete<ApiResponse<void>>(`${BASE}/problems/${id}`)

const publishProblem = (id: string) =>
  axiosInstance.patch<ApiResponse<CodingProblem>>(`${BASE}/problems/${id}/publish`)

const archiveProblem = (id: string) =>
  axiosInstance.patch<ApiResponse<CodingProblem>>(`${BASE}/problems/${id}/archive`)

const duplicateProblem = (id: string) =>
  axiosInstance.post<ApiResponse<CodingProblem>>(`${BASE}/problems/${id}/duplicate`)

// ── Projects: Categories ───────────────────────────────────────────────────────
const getProjectCategories = (params?: ListParams) =>
  axiosInstance.get<ApiResponse<ListResponse<ProjectCategory>>>(`${BASE}/project-categories`, { params })

const createProjectCategory = (data: { name: string; slug: string; description?: string; icon?: string }) =>
  axiosInstance.post<ApiResponse<ProjectCategory>>(`${BASE}/project-categories`, data)

const updateProjectCategory = (id: string, data: Partial<ProjectCategory>) =>
  axiosInstance.patch<ApiResponse<ProjectCategory>>(`${BASE}/project-categories/${id}`, data)

const deleteProjectCategory = (id: string) =>
  axiosInstance.delete<ApiResponse<void>>(`${BASE}/project-categories/${id}`)

// ── Projects ───────────────────────────────────────────────────────────────────
const getProjects = (params?: ListParams) =>
  axiosInstance.get<ApiResponse<ListResponse<Project>>>(`${BASE}/projects`, { params })

const getProjectById = (id: string) =>
  axiosInstance.get<ApiResponse<Project>>(`${BASE}/projects/${id}`)

const createProject = (data: Partial<Project>) =>
  axiosInstance.post<ApiResponse<Project>>(`${BASE}/projects`, data)

const updateProject = (id: string, data: Partial<Project>) =>
  axiosInstance.put<ApiResponse<Project>>(`${BASE}/projects/${id}`, data)

const deleteProject = (id: string) =>
  axiosInstance.delete<ApiResponse<void>>(`${BASE}/projects/${id}`)

const publishProject = (id: string) =>
  axiosInstance.patch<ApiResponse<Project>>(`${BASE}/projects/${id}/publish`)

const archiveProject = (id: string) =>
  axiosInstance.patch<ApiResponse<Project>>(`${BASE}/projects/${id}/archive`)

// ── Placements: Companies ──────────────────────────────────────────────────────
const getCompanies = (params?: ListParams) =>
  axiosInstance.get<ApiResponse<ListResponse<Company>>>(`${BASE}/placements/companies`, { params })

const createCompany = (data: Partial<Company>) =>
  axiosInstance.post<ApiResponse<Company>>(`${BASE}/placements/companies`, data)

const updateCompany = (id: string, data: Partial<Company>) =>
  axiosInstance.put<ApiResponse<Company>>(`${BASE}/placements/companies/${id}`, data)

const deleteCompany = (id: string) =>
  axiosInstance.delete<ApiResponse<void>>(`${BASE}/placements/companies/${id}`)

// ── Placements: Jobs ───────────────────────────────────────────────────────────
const getJobs = (params?: ListParams) =>
  axiosInstance.get<ApiResponse<ListResponse<JobPosting>>>(`${BASE}/placements/jobs`, { params })

const getJobById = (id: string) =>
  axiosInstance.get<ApiResponse<JobPosting>>(`${BASE}/placements/jobs/${id}`)

const createJob = (data: Partial<JobPosting>) =>
  axiosInstance.post<ApiResponse<JobPosting>>(`${BASE}/placements/jobs`, data)

const updateJob = (id: string, data: Partial<JobPosting>) =>
  axiosInstance.put<ApiResponse<JobPosting>>(`${BASE}/placements/jobs/${id}`, data)

const deleteJob = (id: string) =>
  axiosInstance.delete<ApiResponse<void>>(`${BASE}/placements/jobs/${id}`)

const publishJob = (id: string) =>
  axiosInstance.patch<ApiResponse<JobPosting>>(`${BASE}/placements/jobs/${id}/publish`)

// ── Events ─────────────────────────────────────────────────────────────────────
const getEvents = (params?: ListParams) =>
  axiosInstance.get<ApiResponse<ListResponse<CMSEvent>>>(`${BASE}/events`, { params })

const getEventById = (id: string) =>
  axiosInstance.get<ApiResponse<CMSEvent>>(`${BASE}/events/${id}`)

const createEvent = (data: Partial<CMSEvent>) =>
  axiosInstance.post<ApiResponse<CMSEvent>>(`${BASE}/events`, data)

const updateEvent = (id: string, data: Partial<CMSEvent>) =>
  axiosInstance.put<ApiResponse<CMSEvent>>(`${BASE}/events/${id}`, data)

const deleteEvent = (id: string) =>
  axiosInstance.delete<ApiResponse<void>>(`${BASE}/events/${id}`)

const publishEvent = (id: string) =>
  axiosInstance.patch<ApiResponse<CMSEvent>>(`${BASE}/events/${id}/publish`)

const archiveEvent = (id: string) =>
  axiosInstance.patch<ApiResponse<CMSEvent>>(`${BASE}/events/${id}/archive`)

const getEventRegistrations = (id: string) =>
  axiosInstance.get<ApiResponse<unknown[]>>(`${BASE}/events/${id}/registrations`)

// ── Notifications ──────────────────────────────────────────────────────────────
const getNotifications = (params?: ListParams) =>
  axiosInstance.get<ApiResponse<ListResponse<CMSNotification>>>(`${BASE}/notifications`, { params })

const createNotification = (data: { userId: string; title: string; message: string; type: string }) =>
  axiosInstance.post<ApiResponse<CMSNotification>>(`${BASE}/notifications`, data)

const broadcastNotification = (data: { title: string; message: string; type: string; targetRole?: string }) =>
  axiosInstance.post<ApiResponse<{ sent: number }>>(`${BASE}/notifications/broadcast`, data)

const deleteNotification = (id: string) =>
  axiosInstance.delete<ApiResponse<void>>(`${BASE}/notifications/${id}`)

// ── Reports ────────────────────────────────────────────────────────────────────
const getReports = () =>
  axiosInstance.get<ApiResponse<unknown>>(`${BASE}/reports`)

// ── Activity Log ───────────────────────────────────────────────────────────────
const getActivityLog = (params?: { page?: number; limit?: number }) =>
  axiosInstance.get<ApiResponse<unknown>>(`${BASE}/activity`, { params })

// ── Bulk Operations ────────────────────────────────────────────────────────────
const bulkPublish = (entity: string, ids: string[]) =>
  axiosInstance.post<ApiResponse<{ updated: number }>>(`${BASE}/content/bulk-publish`, { entity, ids })

const bulkArchive = (entity: string, ids: string[]) =>
  axiosInstance.post<ApiResponse<{ updated: number }>>(`${BASE}/content/bulk-archive`, { entity, ids })

const bulkDelete = (entity: string, ids: string[]) =>
  axiosInstance.post<ApiResponse<{ deleted: number }>>(`${BASE}/content/bulk-delete`, { entity, ids })

const bulkRestore = (entity: string, ids: string[]) =>
  axiosInstance.post<ApiResponse<{ restored: number }>>(`${BASE}/content/bulk-restore`, { entity, ids })

// ── Export ─────────────────────────────────────────────────────────────────────
const exportContent = (entity: string, format: 'json' | 'csv' = 'json') =>
  axiosInstance.get<ApiResponse<unknown>>(`${BASE}/export`, { params: { entity, format } })

// ── Global CMS Search ─────────────────────────────────────────────────────────
const globalCMSSearch = (q: string, limit = 30) =>
  axiosInstance.get<ApiResponse<{ results: unknown[]; total: number; query: string }>>(`${BASE}/search`, { params: { q, limit } })

// ── Banners (Module 7) ────────────────────────────────────────────────────────
const getBanners = (params?: Record<string, unknown>) =>
  axiosInstance.get<ApiResponse<{ data: unknown[]; total: number }>>(`${BASE}/banners`, { params })
const createBanner = (data: Record<string, unknown>) =>
  axiosInstance.post<ApiResponse<unknown>>(`${BASE}/banners`, data)
const updateBanner = (id: string, data: Record<string, unknown>) =>
  axiosInstance.patch<ApiResponse<unknown>>(`${BASE}/banners/${id}`, data)
const deleteBanner = (id: string) =>
  axiosInstance.delete<ApiResponse<void>>(`${BASE}/banners/${id}`)

// ── FAQ (Module 8) ────────────────────────────────────────────────────────────
const getFaqCategories = () =>
  axiosInstance.get<ApiResponse<unknown[]>>(`${BASE}/faq/categories`)
const createFaqCategory = (data: { name: string; slug: string; displayOrder?: number }) =>
  axiosInstance.post<ApiResponse<unknown>>(`${BASE}/faq/categories`, data)
const updateFaqCategory = (id: string, data: Record<string, unknown>) =>
  axiosInstance.patch<ApiResponse<unknown>>(`${BASE}/faq/categories/${id}`, data)
const deleteFaqCategory = (id: string) =>
  axiosInstance.delete<ApiResponse<void>>(`${BASE}/faq/categories/${id}`)
const getFaqs = (params?: Record<string, unknown>) =>
  axiosInstance.get<ApiResponse<{ data: unknown[]; total: number }>>(`${BASE}/faq`, { params })
const createFaq = (data: Record<string, unknown>) =>
  axiosInstance.post<ApiResponse<unknown>>(`${BASE}/faq`, data)
const updateFaq = (id: string, data: Record<string, unknown>) =>
  axiosInstance.patch<ApiResponse<unknown>>(`${BASE}/faq/${id}`, data)
const deleteFaq = (id: string) =>
  axiosInstance.delete<ApiResponse<void>>(`${BASE}/faq/${id}`)

// ── Testimonials (Module 9) ───────────────────────────────────────────────────
const getTestimonials = (params?: Record<string, unknown>) =>
  axiosInstance.get<ApiResponse<{ data: unknown[]; total: number }>>(`${BASE}/testimonials`, { params })
const createTestimonial = (data: Record<string, unknown>) =>
  axiosInstance.post<ApiResponse<unknown>>(`${BASE}/testimonials`, data)
const updateTestimonial = (id: string, data: Record<string, unknown>) =>
  axiosInstance.patch<ApiResponse<unknown>>(`${BASE}/testimonials/${id}`, data)
const deleteTestimonial = (id: string) =>
  axiosInstance.delete<ApiResponse<void>>(`${BASE}/testimonials/${id}`)

// ── Media Library (Module 10) ─────────────────────────────────────────────────
const getMediaFiles = (params?: Record<string, unknown>) =>
  axiosInstance.get<ApiResponse<{ data: unknown[]; total: number }>>(`${BASE}/media`, { params })
const getMediaFolders = () =>
  axiosInstance.get<ApiResponse<string[]>>(`${BASE}/media/folders`)
const createMediaFile = (data: Record<string, unknown>) =>
  axiosInstance.post<ApiResponse<unknown>>(`${BASE}/media`, data)
const updateMediaFile = (id: string, data: Record<string, unknown>) =>
  axiosInstance.patch<ApiResponse<unknown>>(`${BASE}/media/${id}`, data)
const deleteMediaFile = (id: string) =>
  axiosInstance.delete<ApiResponse<void>>(`${BASE}/media/${id}`)

// ── Version History (Module 12) ───────────────────────────────────────────────
const getVersionHistory = (entity: string, entityId: string) =>
  axiosInstance.get<ApiResponse<unknown[]>>(`${BASE}/versions/${entity}/${entityId}`)
const restoreVersion = (versionId: string) =>
  axiosInstance.post<ApiResponse<unknown>>(`${BASE}/versions/${versionId}/restore`)

export const managerService = {
  getDashboard,
  getCMSDashboard,
  // Learning
  getCategories, createCategory, updateCategory, deleteCategory,
  getRoadmaps, getRoadmapById, createRoadmap, updateRoadmap, deleteRoadmap, publishRoadmap, archiveRoadmap, duplicateRoadmap,
  getSections, createSection, updateSection, deleteSection,
  getLessons, getLessonById, createLesson, updateLesson, deleteLesson,
  getResources, createResource, updateResource, deleteResource,
  // Coding
  getProblemCategories, createProblemCategory, updateProblemCategory, deleteProblemCategory,
  getProblems, getProblemById, createProblem, updateProblem, deleteProblem, publishProblem, archiveProblem, duplicateProblem,
  // Projects
  getProjectCategories, createProjectCategory, updateProjectCategory, deleteProjectCategory,
  getProjects, getProjectById, createProject, updateProject, deleteProject, publishProject, archiveProject,
  // Placements
  getCompanies, createCompany, updateCompany, deleteCompany,
  getJobs, getJobById, createJob, updateJob, deleteJob, publishJob,
  // Events
  getEvents, getEventById, createEvent, updateEvent, deleteEvent, publishEvent, archiveEvent, getEventRegistrations,
  // Notifications
  getNotifications, createNotification, broadcastNotification, deleteNotification,
  // Reports & Activity
  getReports, getActivityLog,
  // Bulk
  bulkPublish, bulkArchive, bulkDelete, bulkRestore,
  // Export
  exportContent,
  // Global Search
  globalCMSSearch,
  // Banners
  getBanners, createBanner, updateBanner, deleteBanner,
  // FAQ
  getFaqCategories, createFaqCategory, updateFaqCategory, deleteFaqCategory,
  getFaqs, createFaq, updateFaq, deleteFaq,
  // Testimonials
  getTestimonials, createTestimonial, updateTestimonial, deleteTestimonial,
  // Media
  getMediaFiles, getMediaFolders, createMediaFile, updateMediaFile, deleteMediaFile,
  // Versions
  getVersionHistory, restoreVersion,
}

// ── CMS Entity Types ──────────────────────────────────────────────────────────
export interface Category {
  id: string
  title: string
  slug: string
  description?: string
  icon?: string
  displayOrder: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Roadmap {
  id: string
  categoryId: string
  category?: { id: string; title: string }
  title: string
  slug: string
  description?: string
  thumbnail?: string
  banner?: string
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
  estimatedHours?: number
  prerequisites?: string
  tags?: string
  learningOutcomes?: string
  seoTitle?: string
  seoDescription?: string
  visibility?: string
  displayOrder: number
  isPublished: boolean
  createdAt: string
  updatedAt: string
  sections?: Section[]
}

export interface Section {
  id: string
  roadmapId: string
  title: string
  description?: string
  order: number
  lessons?: Lesson[]
}

export interface Lesson {
  id: string
  sectionId: string
  section?: { id: string; title: string; roadmap?: { id: string; title: string } }
  title: string
  slug: string
  description?: string
  content?: string            // FPRD-10: rich text / markdown body
  contentType: 'NOTE' | 'VIDEO' | 'ARTICLE' | 'QUIZ' | 'ASSIGNMENT' | 'PROJECT' | 'CODING_PROBLEM'
  estimatedMinutes?: number
  order: number
  isPublished: boolean
  createdAt: string
  updatedAt: string
  resources?: Resource[]
}

export interface Resource {
  id: string
  lessonId: string
  lesson?: { id: string; title: string }
  type: 'PDF' | 'VIDEO' | 'ARTICLE' | 'GITHUB' | 'DOCUMENTATION' | 'PRACTICE_LINK'
  title: string
  url: string
  duration?: number
  author?: string
  thumbnail?: string
  createdAt: string
}

export interface ProblemCategory {
  id: string
  name: string
  slug: string
  description?: string
  displayOrder: number
  isActive: boolean
  createdAt: string
}

export interface CodingProblem {
  id: string
  categoryId: string
  category?: { id: string; name: string }
  title: string
  slug: string
  description?: string
  problemStatement: string
  inputFormat?: string
  outputFormat?: string
  constraints?: string
  sampleInput?: string
  sampleOutput?: string
  explanation?: string
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  timeLimit: number
  memoryLimit: number
  acceptanceRate: number
  points: number
  isPublished: boolean
  createdAt: string
  updatedAt: string
  testCases?: TestCase[]
  templates?: CodeTemplate[]
  tags?: Array<{ tag: { id: string; name: string } }>
  companies?: Array<{ company: { id: string; name: string } }>
}

export interface TestCase {
  id: string
  problemId: string
  input: string
  expectedOutput: string
  isSample: boolean
  isHidden: boolean
  weight: number
}

export interface CodeTemplate {
  id: string
  problemId: string
  language: string
  template: string
}

export interface ProjectCategory {
  id: string
  name: string
  slug: string
  description?: string
  icon?: string
  displayOrder: number
  isActive: boolean
  createdAt: string
}

export interface Project {
  id: string
  categoryId: string
  category?: { id: string; name: string }
  title: string
  slug: string
  description?: string
  overview?: string
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT'
  estimatedDuration?: string
  thumbnail?: string
  githubRepository?: string
  liveDemo?: string
  documentationUrl?: string
  requirements?: string
  learningOutcomes?: string
  isPublished: boolean
  createdAt: string
  updatedAt: string
  technologies?: Array<{ technology: { id: string; name: string; icon?: string } }>
}

export interface Company {
  id: string
  name: string
  slug: string
  logo?: string
  website?: string
  description?: string
  industry?: string
  headquarters?: string
  careersUrl?: string
  verified: boolean
}

export interface JobPosting {
  id: string
  companyId: string
  company?: { id: string; name: string; logo?: string }
  title: string
  type: 'INTERNSHIP' | 'FULL_TIME' | 'PART_TIME'
  location?: string
  workMode: 'REMOTE' | 'HYBRID' | 'ONSITE'
  description: string
  requirements?: string
  salaryRange?: string
  applicationUrl?: string
  applicationDeadline?: string
  experienceRequired?: string
  isPublished: boolean
  createdAt: string
  updatedAt: string
}

export interface CMSEvent {
  id: string
  title: string
  description?: string
  type: 'HACKATHON' | 'WEBINAR' | 'WORKSHOP' | 'CONTEST' | 'BOOTCAMP' | 'MEETUP'
  organizer?: string
  location?: string
  startTime: string
  endTime: string
  registrationUrl?: string
  maxParticipants?: number
  isPublished: boolean
  createdAt: string
  updatedAt: string
  _count?: { registrations: number }
}

export interface CMSNotification {
  id: string
  userId: string
  user?: { id: string; fullName: string; email: string }
  title: string
  message: string
  type: 'PLACEMENT' | 'PROJECT' | 'CODING' | 'LEARNING' | 'EVENT' | 'SYSTEM'
  isRead: boolean
  createdAt: string
}

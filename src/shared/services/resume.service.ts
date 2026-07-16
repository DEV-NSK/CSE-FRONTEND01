import axiosInstance from '@/shared/lib/axios'
import type { ApiResponse } from '@/types'
import type { Resume, ResumeSection, ResumeTemplate } from '@/shared/types/placement'

export const resumeService = {
  // ─── Resumes ──────────────────────────────────────────────────────────────
  getResumes: () =>
    axiosInstance.get<ApiResponse<Resume[]>>('/resumes'),

  getResumeById: (id: string) =>
    axiosInstance.get<ApiResponse<Resume>>(`/resumes/${id}`),

  createResume: (data: { title: string; template: string }) =>
    axiosInstance.post<ApiResponse<Resume>>('/resumes', data),

  updateResume: (id: string, data: Partial<{ title: string; template: string; isDefault: boolean }>) =>
    axiosInstance.put<ApiResponse<Resume>>(`/resumes/${id}`, data),

  deleteResume: (id: string) =>
    axiosInstance.delete<ApiResponse<void>>(`/resumes/${id}`),

  setDefault: (id: string) =>
    axiosInstance.patch<ApiResponse<Resume>>(`/resumes/${id}/default`),

  // ─── Resume Sections ──────────────────────────────────────────────────────
  getSections: (resumeId: string) =>
    axiosInstance.get<ApiResponse<ResumeSection[]>>(`/resumes/${resumeId}/sections`),

  addSection: (
    resumeId: string,
    data: { type: string; title: string; content: Record<string, unknown>; order: number }
  ) =>
    axiosInstance.post<ApiResponse<ResumeSection>>(`/resumes/${resumeId}/sections`, data),

  updateSection: (
    resumeId: string,
    sectionId: string,
    data: Partial<{ title: string; content: Record<string, unknown>; order: number }>
  ) =>
    axiosInstance.put<ApiResponse<ResumeSection>>(`/resumes/${resumeId}/sections/${sectionId}`, data),

  deleteSection: (resumeId: string, sectionId: string) =>
    axiosInstance.delete<ApiResponse<void>>(`/resumes/${resumeId}/sections/${sectionId}`),

  reorderSections: (resumeId: string, sectionOrders: { id: string; order: number }[]) =>
    axiosInstance.patch<ApiResponse<ResumeSection[]>>(`/resumes/${resumeId}/sections/reorder`, {
      sections: sectionOrders,
    }),

  // ─── Templates ────────────────────────────────────────────────────────────
  getTemplates: () =>
    axiosInstance.get<ApiResponse<ResumeTemplate[]>>('/resumes/templates'),

  // ─── ATS Score ────────────────────────────────────────────────────────────
  getAtsScore: (resumeId: string) =>
    axiosInstance.get<ApiResponse<{ score: number; suggestions: string[] }>>(`/resumes/${resumeId}/ats-score`),

  // ─── Export ───────────────────────────────────────────────────────────────
  exportPdf: (resumeId: string) =>
    axiosInstance.get<Blob>(`/resumes/${resumeId}/export/pdf`, { responseType: 'blob' }),
}

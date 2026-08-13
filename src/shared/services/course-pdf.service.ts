/**
 * Course PDF service — HTTP calls for both admin and student sides.
 */
import axiosInstance from '@/shared/lib/axios';
import type { ApiResponse } from '@/types';

export interface CoursePdf {
  id: string;
  title: string;
  description: string | null;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  isPublished: boolean;
  displayOrder: number;
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
}

// ── Student ───────────────────────────────────────────────────────────────────

const getPublishedPdfs = () =>
  axiosInstance.get<ApiResponse<CoursePdf[]>>('/learning/pdfs');

// ── Admin ─────────────────────────────────────────────────────────────────────

const adminGetAllPdfs = () =>
  axiosInstance.get<ApiResponse<CoursePdf[]>>('/admin/pdfs');

const adminUploadPdf = (
  file: File,
  title: string,
  description: string,
  onProgress?: (pct: number) => void,
) => {
  const form = new FormData();
  form.append('pdf', file);
  form.append('title', title);
  if (description) form.append('description', description);
  return axiosInstance.post<ApiResponse<CoursePdf>>('/admin/pdfs', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (onProgress && e.total) onProgress(Math.round((e.loaded / e.total) * 100));
    },
  });
};

const adminUpdatePdf = (
  id: string,
  data: Partial<{ title: string; description: string; isPublished: boolean; displayOrder: number }>,
) => axiosInstance.patch<ApiResponse<CoursePdf>>(`/admin/pdfs/${id}`, data);

const adminDeletePdf = (id: string) =>
  axiosInstance.delete<ApiResponse<null>>(`/admin/pdfs/${id}`);

export const coursePdfService = {
  getPublishedPdfs,
  adminGetAllPdfs,
  adminUploadPdf,
  adminUpdatePdf,
  adminDeletePdf,
};

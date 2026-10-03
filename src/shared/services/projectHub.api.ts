/**
 * Project Hub Integration — Public API Client
 *
 * Consumes only the public (unauthenticated) Project Hub API endpoints.
 * Uses a dedicated axios instance so CAMPUSRANK auth headers (Bearer tokens)
 * are never sent to the external Project Hub service.
 *
 * All requests are read-only (GET). No CAMPUSRANK credentials leave this file.
 *
 * Base URL: VITE_PROJECT_HUB_API_URL
 */

import axios from 'axios'
import { PROJECT_HUB_API_URL } from '@/shared/lib/projectHub.config'
import type {
  PHPublicProjectsResponse,
  PHPublicProjectDetailResponse,
  PHUserProjectsResponse,
  PHProjectsQueryParams,
} from '@/shared/types/projectHub'

// ─── Dedicated axios instance ─────────────────────────────────────────────────
// IMPORTANT: This is intentionally separate from the CAMPUSRANK axiosInstance.
// It does NOT attach Authorization headers — Project Hub public API is unauthenticated.
// It does NOT use the CAMPUSRANK refresh/token logic.

const projectHubAxios = axios.create({
  baseURL: PROJECT_HUB_API_URL,
  timeout: 12000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// Offline guard (matches CAMPUSRANK's main axios instance pattern)
projectHubAxios.interceptors.request.use((config) => {
  if (!navigator.onLine) {
    return Promise.reject(
      new Error('You are offline. Please check your internet connection.'),
    ) as never
  }
  return config
})

// ─── API functions ────────────────────────────────────────────────────────────

/**
 * Fetches the public list of projects from Project Hub.
 *
 * Endpoint: GET /public/projects
 * Auth: None required
 *
 * Query params are forwarded as-is to the Project Hub API.
 * Only public, published, non-archived projects are returned
 * (Project Hub enforces visibility server-side).
 */
export async function getPublicProjects(
  params?: PHProjectsQueryParams,
): Promise<PHPublicProjectsResponse> {
  const response = await projectHubAxios.get<{ success: boolean; data: PHPublicProjectsResponse }>(
    '/public/projects',
    { params },
  )
  return response.data.data
}

/**
 * Fetches a single public project by slug.
 *
 * Endpoint: GET /public/projects/:slug
 * Auth: None required
 *
 * Returns 404 if the project does not exist, is private, or is archived.
 * CAMPUSRANK must treat a 404 as "project not found" and never cache
 * private project metadata.
 */
export async function getPublicProject(
  slug: string,
): Promise<PHPublicProjectDetailResponse> {
  const response = await projectHubAxios.get<{ success: boolean; data: PHPublicProjectDetailResponse }>(
    `/public/projects/${encodeURIComponent(slug)}`,
  )
  return response.data.data
}

/**
 * Fetches public projects for a specific user/creator.
 *
 * Endpoint: GET /public/users/:username/projects
 * Auth: None required
 *
 * NOTE: This endpoint may not yet exist in Project Hub.
 * If it returns 404, the caller should handle gracefully and show an empty state.
 * This is intentionally a best-effort call for profile page enrichment.
 *
 * Only returns publicly visible projects owned or contributed to by the user.
 */
export async function getPublicProjectsByUser(
  username: string,
  params?: Pick<PHProjectsQueryParams, 'page' | 'limit'>,
): Promise<PHUserProjectsResponse> {
  const response = await projectHubAxios.get<{ success: boolean; data: PHUserProjectsResponse }>(
    `/public/users/${encodeURIComponent(username)}/projects`,
    { params },
  )
  return response.data.data
}

export const projectHubApi = {
  getPublicProjects,
  getPublicProject,
  getPublicProjectsByUser,
}

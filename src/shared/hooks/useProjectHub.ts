/**
 * Project Hub Integration — TanStack Query hooks
 *
 * Dedicated query key namespace: projectHubKeys
 * Stale time: 60 seconds (public discovery data, relatively fresh)
 * refetchOnWindowFocus: false (matches CAMPUSRANK global default)
 *
 * All hooks are isolated — a Project Hub API failure only affects
 * the hook's own query, never other CAMPUSRANK features.
 */

import { useQuery } from '@tanstack/react-query'
import { projectHubApi } from '@/shared/services/projectHub.api'
import type { PHProjectsQueryParams } from '@/shared/types/projectHub'

// ─── Query Key Namespace ──────────────────────────────────────────────────────

export const projectHubKeys = {
  all: ['projectHub'] as const,

  /** All project list queries (any params) */
  projects: () => [...projectHubKeys.all, 'projects'] as const,

  /** Specific project list with filter params */
  projectList: (params?: PHProjectsQueryParams) =>
    [...projectHubKeys.projects(), 'list', params ?? {}] as const,

  /** Single project by slug */
  project: (slug: string) =>
    [...projectHubKeys.all, 'project', slug] as const,

  /** Projects for a specific user */
  userProjects: (username: string, params?: { page?: number; limit?: number }) =>
    [...projectHubKeys.all, 'userProjects', username, params ?? {}] as const,
} as const

// ─── Hooks ────────────────────────────────────────────────────────────────────

/**
 * Fetches the public project list from Project Hub.
 *
 * Used by: ProjectsDiscoveryPage, ProjectHubDashboardWidget
 *
 * Gracefully handles Project Hub being unavailable — isError will be true
 * but CAMPUSRANK continues to function normally.
 */
export function usePublicProjects(params?: PHProjectsQueryParams) {
  return useQuery({
    queryKey: projectHubKeys.projectList(params),
    queryFn: () => projectHubApi.getPublicProjects(params),
    staleTime: 60 * 1000,          // 60 seconds — public discovery data
    gcTime: 5 * 60 * 1000,         // 5 minutes in-memory cache
    refetchOnWindowFocus: false,
    retry: 1,                       // One retry only — PH may be cold-starting
    retryDelay: 3000,               // 3s delay for Render cold-start
  })
}

/**
 * Fetches a single public project by slug.
 *
 * Used by: ProjectHubPreviewPage
 *
 * Returns isError=true if the project does not exist, is private, or is
 * archived. CAMPUSRANK must show "Project not found" in that case.
 */
export function usePublicProject(slug: string) {
  return useQuery({
    queryKey: projectHubKeys.project(slug),
    queryFn: () => projectHubApi.getPublicProject(slug),
    enabled: !!slug,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
    retryDelay: 3000,
  })
}

/**
 * Fetches public projects for a CAMPUSRANK user's profile page.
 *
 * Used by: PublicProfilePage (Projects section)
 *
 * This is best-effort — if the Project Hub API does not yet support
 * /public/users/:username/projects, this query will fail silently
 * and the profile page will simply not show the projects section.
 *
 * IMPORTANT: Never show projects from a failed/pending query.
 * Only show data when isSuccess === true.
 */
export function usePublicProjectsByUser(
  username: string,
  params?: { page?: number; limit?: number },
) {
  return useQuery({
    queryKey: projectHubKeys.userProjects(username, params),
    queryFn: () => projectHubApi.getPublicProjectsByUser(username, params),
    enabled: !!username,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 0,    // No retry for profile enrichment — fail silently
  })
}

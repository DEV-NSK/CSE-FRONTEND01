/**
 * Project Hub Integration — Public API Types
 *
 * These types model the Project Hub public API response contract.
 * They are deliberately separate from CAMPUSRANK-internal project types
 * (src/shared/types/project.ts) to keep the two systems independent.
 *
 * Source: https://project-hub-2mc4.onrender.com/api/public/projects
 * API contract defined in the integration spec (CAMPUSRANK × PROJECT HUB).
 *
 * NOTE: Property names here must match the actual Project Hub API response.
 * If the Project Hub backend uses different casing/naming, update these types
 * and the projectHub.api.ts mapping layer accordingly.
 */

// ─── Owner ────────────────────────────────────────────────────────────────────

export interface PHProjectOwner {
  /** Project Hub user identifier */
  username: string
  /** Display name shown to users */
  displayName: string
  /** Absolute avatar URL (may be null if not set) */
  avatarUrl: string | null
}

// ─── Public Project (list item) ───────────────────────────────────────────────

export interface PHPublicProject {
  /** URL-safe slug, used to construct showcase URLs */
  slug: string
  /** Project display name */
  name: string
  /** Short one-line description */
  shortDescription: string
  /** Absolute cover image URL (may be null) */
  imageUrl: string | null
  /**
   * Technology tag strings, e.g. ["React", "Node.js", "PostgreSQL"]
   * The exact values come from Project Hub — CAMPUSRANK renders them as-is.
   */
  technologies: string[]
  /**
   * Completion progress 0–100 (percentage).
   * May be null if Project Hub does not track progress.
   */
  progress: number | null
  /** Project owner information */
  owner: PHProjectOwner
  /** Number of team members (null if not returned) */
  teamSize: number | null
  /**
   * Canonical Project Hub showcase URL.
   * Returned by the API so CAMPUSRANK does not have to construct it,
   * but if absent, getProjectHubShowcaseUrl(slug) is used as fallback.
   */
  showcaseUrl: string | null
  /** ISO 8601 last-updated timestamp */
  updatedAt: string
}

// ─── Public Project (detail) ─────────────────────────────────────────────────

export interface PHPublicProjectDetail extends PHPublicProject {
  /** Full description / overview (may be markdown) */
  description: string | null
  /** Project goals text */
  goals: string | null
  /** Live demo URL */
  liveUrl: string | null
  /** GitHub repository URL */
  githubUrl: string | null
  /** Team member list (public names only) */
  team: PHProjectOwner[]
}

// ─── API Response Shapes ──────────────────────────────────────────────────────

export interface PHPagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface PHPublicProjectsResponse {
  projects: PHPublicProject[]
  pagination: PHPagination
}

export interface PHPublicProjectDetailResponse {
  project: PHPublicProjectDetail
}

// ─── Query Params ─────────────────────────────────────────────────────────────

export interface PHProjectsQueryParams {
  /** Search query — matched against name and description */
  q?: string
  /** Technology filter tag (matches items in technologies array) */
  technology?: string
  /** Page number (1-indexed) */
  page?: number
  /** Items per page (max 20 recommended) */
  limit?: number
  /** Sort order */
  sort?: 'updatedAt' | 'createdAt'
}

// ─── User Projects ────────────────────────────────────────────────────────────

export interface PHUserProjectsResponse {
  projects: PHPublicProject[]
  pagination: PHPagination
}

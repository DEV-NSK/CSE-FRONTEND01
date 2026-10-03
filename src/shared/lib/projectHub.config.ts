/**
 * Project Hub Integration — Centralized URL Configuration
 *
 * Project Hub is an independent application.
 * CAMPUSRANK consumes only its public integration surface.
 *
 * All Project Hub URLs must be constructed through this module.
 * Never hardcode Project Hub URLs anywhere else in CAMPUSRANK.
 *
 * Environment variables:
 *   VITE_PROJECT_HUB_URL      — Project Hub frontend (deep links)
 *   VITE_PROJECT_HUB_API_URL  — Project Hub public REST API
 */

// ─── Base URLs ────────────────────────────────────────────────────────────────

/** Project Hub frontend base URL (no trailing slash). */
export const PROJECT_HUB_URL: string =
  (import.meta.env.VITE_PROJECT_HUB_URL as string | undefined) ??
  'https://projecthub-gilt-zeta.vercel.app'

/** Project Hub public REST API base URL (no trailing slash). */
export const PROJECT_HUB_API_URL: string =
  (import.meta.env.VITE_PROJECT_HUB_API_URL as string | undefined) ??
  'https://project-hub-2mc4.onrender.com/api'

// ─── URL Helpers ──────────────────────────────────────────────────────────────

/**
 * Returns the Project Hub frontend root URL.
 * Use this to open Project Hub in a new tab without a specific path.
 *
 * @example
 * getProjectHubUrl() // → "https://projecthub-gilt-zeta.vercel.app"
 */
export function getProjectHubUrl(): string {
  return PROJECT_HUB_URL
}

/**
 * Returns the URL for a specific public project showcase.
 *
 * Project Hub's confirmed showcase route: /showcase/:slug
 *
 * @example
 * getProjectHubShowcaseUrl('ai-resume-builder')
 * // → "https://projecthub-gilt-zeta.vercel.app/showcase/ai-resume-builder"
 */
export function getProjectHubShowcaseUrl(slug: string): string {
  if (!slug) return PROJECT_HUB_URL
  // Sanitize: only allow slug-safe characters to prevent open redirect
  const safeSlug = slug.replace(/[^a-zA-Z0-9-_]/g, '')
  return `${PROJECT_HUB_URL}/showcase/${safeSlug}`
}

/**
 * Returns the URL for the Project Hub project creation flow.
 *
 * NOTE: The /projects/new route is the standard SPA convention.
 * If the real Project Hub create route differs, update this constant
 * and the VITE_PROJECT_HUB_URL in the environment.
 *
 * ⚠️  UNVERIFIED — Project Hub backend was unavailable during integration.
 *     Verify the actual create-project route in the Project Hub repository.
 *
 * @example
 * getProjectHubCreateUrl() // → "https://projecthub-gilt-zeta.vercel.app/projects/new"
 */
export const PROJECT_HUB_CREATE_ROUTE = '/app/projects/new'

export function getProjectHubCreateUrl(): string {
  return `${PROJECT_HUB_URL}${PROJECT_HUB_CREATE_ROUTE}`
}

/**
 * Returns the URL for a user's profile/dashboard in Project Hub.
 *
 * NOTE: Project Hub has no confirmed public profile route at integration time.
 * If Project Hub adds a /profile/:username or /u/:username route,
 * update this function and remove the fallback.
 *
 * @example
 * getProjectHubProfileUrl('saikiran')
 * // → "https://projecthub-gilt-zeta.vercel.app/profile/saikiran" (unverified)
 */
export function getProjectHubProfileUrl(username: string): string {
  if (!username) return PROJECT_HUB_URL
  const safeUsername = username.replace(/[^a-zA-Z0-9-_.]/g, '')
  return `${PROJECT_HUB_URL}/profile/${safeUsername}`
}

/**
 * Returns the canonical CAMPUSRANK public profile URL for a given username.
 * Used in Project Hub → CAMPUSRANK backlinks.
 *
 * Route confirmed: /u/:username (and aliased at /profile/:username)
 */
export function getCampusRankProfileUrl(username: string): string {
  if (!username) return '/'
  return `/u/${encodeURIComponent(username)}`
}

// ─── Navigation helper ────────────────────────────────────────────────────────

/**
 * Opens a Project Hub URL in a new tab with safe attributes.
 * All external Project Hub navigation should go through this function.
 *
 * Security: constructs the URL from PROJECT_HUB_URL base only —
 * never navigates to arbitrary user-supplied URLs.
 *
 * @param path  Optional path within Project Hub (must start with /).
 *              If omitted, opens the Project Hub root.
 */
export function openProjectHub(path?: string): void {
  const base = PROJECT_HUB_URL
  let url: string

  if (!path) {
    url = base
  } else {
    // Validate: path must start with / and contain only safe URL characters
    const safePath = /^\/[a-zA-Z0-9\-_/.?=&%]*$/.test(path) ? path : '/'
    url = `${base}${safePath}`
  }

  const win = window.open(url, '_blank', 'noopener,noreferrer')
  // Fallback for popup blockers
  if (win) win.opener = null
}

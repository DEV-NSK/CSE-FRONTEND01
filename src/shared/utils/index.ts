/**
 * Shared utility re-exports.
 * All helpers from lib/utils and the new safe helpers are available here.
 */
export * from '@/shared/lib/utils'

// ── Safe helpers (FPRD-13) ───────────────────────────────────────────────────
export {
  safeArray,
  safeMap,
  safeFilter,
  safeFind,
  safeLength,
  safeSlice,
  safeGet,
  normalizeObject,
  normalizeString,
  normalizeNumber,
  normalizeBoolean,
  safePaginatedData,
} from '@/shared/utils/safe'

// debounce, formatBytes, slugify, and createHeadingId are all
// re-exported via `export * from '@/shared/lib/utils'` above.

/**
 * Safely converts any value into a string array.
 * - Already an array  → returned as-is (filtered to strings)
 * - Comma-separated string → split, trimmed, empty values removed
 * - null / undefined / other → empty array
 */
export function normalizeArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((v): v is string => typeof v === 'string')
  }
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean)
  }
  return []
}

/** Alias for normalizeArray — semantically clearer when the field is `tags`. */
export const normalizeTags = normalizeArray

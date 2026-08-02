/**
 * FPRD-13: Global Safe Helpers
 *
 * Use these utilities everywhere instead of direct .map(), .filter(), etc.
 * on values that might be null, undefined, or non-arrays from the API.
 *
 * This eliminates "Cannot read properties of undefined" runtime errors.
 */

// ─── Array Helpers ────────────────────────────────────────────────────────────

/**
 * Safely wraps any value as an array.
 * - Already an array → returned as-is
 * - null / undefined  → []
 * - Other value       → [value]
 */
export function safeArray<T>(value: T[] | null | undefined): T[] {
  if (Array.isArray(value)) return value
  return []
}

/**
 * Safely maps over any value that might not be an array.
 * Returns [] instead of throwing when value is null/undefined.
 */
export function safeMap<T, U>(
  value: T[] | null | undefined,
  fn: (item: T, index: number) => U
): U[] {
  return safeArray(value).map(fn)
}

/**
 * Safely filters any value that might not be an array.
 * Returns [] instead of throwing when value is null/undefined.
 */
export function safeFilter<T>(
  value: T[] | null | undefined,
  fn: (item: T, index: number) => boolean
): T[] {
  return safeArray(value).filter(fn)
}

/**
 * Safely finds in any value that might not be an array.
 * Returns undefined instead of throwing when value is null/undefined.
 */
export function safeFind<T>(
  value: T[] | null | undefined,
  fn: (item: T) => boolean
): T | undefined {
  return safeArray(value).find(fn)
}

/**
 * Returns the length of an array safely.
 * Returns 0 when value is null/undefined.
 */
export function safeLength(value: unknown[] | null | undefined): number {
  return safeArray(value).length
}

/**
 * Slices an array safely.
 * Returns [] when value is null/undefined.
 */
export function safeSlice<T>(value: T[] | null | undefined, start?: number, end?: number): T[] {
  return safeArray(value).slice(start, end)
}

// ─── Primitive Helpers ────────────────────────────────────────────────────────

/**
 * Normalises any value to a string.
 * Returns fallback (default: '') when value is null/undefined.
 */
export function normalizeString(value: string | null | undefined, fallback = ''): string {
  if (typeof value === 'string') return value
  return fallback
}

/**
 * Normalises any value to a number.
 * Returns fallback (default: 0) when value is null/undefined/NaN.
 */
export function normalizeNumber(value: number | null | undefined, fallback = 0): number {
  if (typeof value === 'number' && !isNaN(value)) return value
  return fallback
}

/**
 * Normalises any value to a boolean.
 * Returns fallback (default: false) when value is null/undefined.
 */
export function normalizeBoolean(value: boolean | null | undefined, fallback = false): boolean {
  if (typeof value === 'boolean') return value
  return fallback
}

// ─── Object Helpers ───────────────────────────────────────────────────────────

/**
 * Safely accesses a property of an object that might be null/undefined.
 * Returns fallback instead of throwing.
 */
export function safeGet<T, K extends keyof T>(
  obj: T | null | undefined,
  key: K,
  fallback?: T[K]
): T[K] | undefined {
  if (obj == null) return fallback
  return obj[key] ?? fallback
}

/**
 * Normalizes an API response object. Returns {} when value is null/undefined.
 */
export function normalizeObject<T extends object>(value: T | null | undefined): Partial<T> {
  if (value != null && typeof value === 'object' && !Array.isArray(value)) return value
  return {}
}

// ─── String Array Helpers (from existing utils) ───────────────────────────────

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

// ─── Pagination Helpers ───────────────────────────────────────────────────────

/**
 * Safely extracts paginated data array from an API response.
 * Handles both `data.data` (paginated) and `data` (plain array) shapes.
 */
export function safePaginatedData<T>(
  response: { data: T[] } | T[] | null | undefined
): T[] {
  if (response == null) return []
  if (Array.isArray(response)) return response
  if (Array.isArray((response as { data: T[] }).data)) return (response as { data: T[] }).data
  return []
}

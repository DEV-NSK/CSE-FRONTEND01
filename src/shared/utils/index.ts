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

// ── Local helpers ────────────────────────────────────────────────────────────

export function debounce<T extends (...args: unknown[]) => void>(fn: T, delay: number): T {
  let timer: ReturnType<typeof setTimeout>
  return ((...args: Parameters<T>) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }) as T
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .trim()
}

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

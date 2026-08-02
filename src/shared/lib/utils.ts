import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}

export function getInitials(name: string | undefined | null): string {
  if (!name) return '?'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

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
 * Creates a stable, CSS-safe heading ID from a title string.
 *
 * Rules:
 * - Always prefixes with "section-" so the result can never start with a digit
 *   (CSS selectors like `#1-foo` are invalid; `#section-1-foo` is safe)
 * - Lowercases the entire string
 * - Replaces any run of characters that are not a–z, 0–9, or hyphen with a single hyphen
 * - Strips leading/trailing hyphens from the slug portion
 *
 * Examples:
 *   "Variables"              → "section-variables"
 *   "1. Easy to Read & Write" → "section-1-easy-to-read-write"
 *   "For Loops (basics)"    → "section-for-loops-basics"
 *   "I/O Operations"        → "section-i-o-operations"
 *   "What is Python?"       → "section-what-is-python"
 */
export function createHeadingId(title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
  return `section-${slug}`
}

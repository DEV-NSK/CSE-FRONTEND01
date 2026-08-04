import { useState, useEffect, useRef, useCallback, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Search, Clock, X, ArrowRight } from 'lucide-react'
import { useSearch } from '@/shared/hooks/useLearning'

const RECENT_KEY = 'cse_dashboard_recent_searches'
const MAX_RECENT = 5

function getRecentSearches(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]')
  } catch {
    return []
  }
}

function saveRecentSearch(query: string) {
  const existing = getRecentSearches().filter((s) => s !== query)
  const updated = [query, ...existing].slice(0, MAX_RECENT)
  localStorage.setItem(RECENT_KEY, JSON.stringify(updated))
}

function clearRecentSearches() {
  localStorage.removeItem(RECENT_KEY)
}

export const DashboardSearchBar = memo(function DashboardSearchBar() {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  const { data: searchResults } = useSearch(query)

  // Ctrl+K shortcut
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(true)
        setTimeout(() => inputRef.current?.focus(), 50)
      }
      if (e.key === 'Escape') {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleFocus = useCallback(() => {
    setRecentSearches(getRecentSearches())
    setOpen(true)
  }, [])

  const handleSubmit = useCallback(
    (q: string) => {
      if (!q.trim()) return
      saveRecentSearch(q.trim())
      setOpen(false)
      setQuery('')
      navigate(`/dashboard/learning/search?q=${encodeURIComponent(q.trim())}`)
    },
    [navigate],
  )

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSubmit(query)
  }

  const handleClearRecent = () => {
    clearRecentSearches()
    setRecentSearches([])
  }

  const showDropdown = open && (query.trim().length >= 2 ? true : recentSearches.length > 0)

  return (
    <div ref={containerRef} className="relative w-full max-w-xl" role="search">
      {/* Input */}
      <div
        className="flex items-center gap-2.5 rounded-[14px] px-4 py-2.5 transition-all duration-200"
        style={{
          background: '#0F1629',
          border: open
            ? '1px solid rgba(124,92,252,0.5)'
            : '1px solid rgba(255,255,255,0.07)',
          boxShadow: open ? '0 0 0 3px rgba(124,92,252,0.12)' : 'none',
        }}
      >
        <Search className="h-4 w-4 shrink-0" style={{ color: 'rgba(255,255,255,0.35)' }} aria-hidden="true" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder="Search courses, problems, lessons..."
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-[rgba(255,255,255,0.3)]"
          style={{ color: '#fff' }}
          aria-label="Search courses, problems, lessons"
          aria-expanded={showDropdown}
          aria-haspopup="listbox"
          autoComplete="off"
        />
        {query ? (
          <button
            onClick={() => setQuery('')}
            className="shrink-0 p-0.5 rounded transition-colors duration-150"
            style={{ color: 'rgba(255,255,255,0.35)' }}
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : (
          <kbd
            className="hidden sm:flex items-center gap-0.5 text-[10px] font-mono px-1.5 py-0.5 rounded"
            style={{
              background: 'rgba(255,255,255,0.06)',
              color: 'rgba(255,255,255,0.3)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
            aria-label="Keyboard shortcut: Ctrl+K"
          >
            <span>⌘</span>K
          </kbd>
        )}
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 rounded-[14px] overflow-hidden z-50"
            style={{
              background: '#0F1629',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
            }}
            role="listbox"
            aria-label="Search suggestions"
          >
            {/* Autocomplete results */}
            {query.trim().length >= 2 && searchResults ? (
              <div className="p-2">
                <p
                  className="text-[10px] font-semibold uppercase tracking-widest px-2 py-1.5"
                  style={{ color: 'rgba(255,255,255,0.35)' }}
                >
                  Results
                </p>
                {(searchResults as any[]).length > 0 ? (
                  (searchResults as any[]).slice(0, 6).map((result: any, i: number) => (
                    <button
                      key={i}
                      role="option"
                      aria-selected="false"
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-colors duration-150"
                      style={{ color: 'rgba(255,255,255,0.75)' }}
                      onMouseEnter={(e) =>
                        ((e.currentTarget as HTMLElement).style.background =
                          'rgba(255,255,255,0.05)')
                      }
                      onMouseLeave={(e) =>
                        ((e.currentTarget as HTMLElement).style.background = 'transparent')
                      }
                      onClick={() => handleSubmit(result.title ?? result.name ?? query)}
                    >
                      <Search className="h-3.5 w-3.5 shrink-0" style={{ color: 'rgba(255,255,255,0.3)' }} aria-hidden="true" />
                      <span className="text-sm truncate">
                        {result.title ?? result.name ?? result}
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 ml-auto shrink-0" style={{ color: 'rgba(255,255,255,0.2)' }} aria-hidden="true" />
                    </button>
                  ))
                ) : (
                  <p className="text-sm px-3 py-2" style={{ color: 'rgba(255,255,255,0.35)' }}>
                    No results for "{query}"
                  </p>
                )}
              </div>
            ) : (
              /* Recent searches */
              recentSearches.length > 0 && (
                <div className="p-2">
                  <div className="flex items-center justify-between px-2 py-1.5">
                    <p
                      className="text-[10px] font-semibold uppercase tracking-widest"
                      style={{ color: 'rgba(255,255,255,0.35)' }}
                    >
                      Recent
                    </p>
                    <button
                      onClick={handleClearRecent}
                      className="text-[10px] transition-colors duration-150"
                      style={{ color: 'rgba(255,255,255,0.3)' }}
                      aria-label="Clear recent searches"
                    >
                      Clear
                    </button>
                  </div>
                  {recentSearches.map((s, i) => (
                    <button
                      key={i}
                      role="option"
                      aria-selected="false"
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-colors duration-150"
                      style={{ color: 'rgba(255,255,255,0.65)' }}
                      onMouseEnter={(e) =>
                        ((e.currentTarget as HTMLElement).style.background =
                          'rgba(255,255,255,0.05)')
                      }
                      onMouseLeave={(e) =>
                        ((e.currentTarget as HTMLElement).style.background = 'transparent')
                      }
                      onClick={() => {
                        setQuery(s)
                        handleSubmit(s)
                      }}
                    >
                      <Clock className="h-3.5 w-3.5 shrink-0" style={{ color: 'rgba(255,255,255,0.25)' }} aria-hidden="true" />
                      <span className="text-sm truncate">{s}</span>
                    </button>
                  ))}
                </div>
              )
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
})

import { useState, useEffect, useRef, useCallback, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Search, Clock, X, ArrowRight } from 'lucide-react'
import { useSearch } from '@/shared/hooks/useLearning'

const RECENT_KEY = 'cse_dashboard_recent_searches'
const MAX_RECENT = 5

function getRecent(): string[] {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]') } catch { return [] }
}
function saveRecent(q: string) {
  const list = [q, ...getRecent().filter(s => s !== q)].slice(0, MAX_RECENT)
  localStorage.setItem(RECENT_KEY, JSON.stringify(list))
}

export const DashboardSearchBar = memo(function DashboardSearchBar() {
  const [query, setQuery]     = useState('')
  const [open, setOpen]       = useState(false)
  const [recent, setRecent]   = useState<string[]>([])
  const inputRef              = useRef<HTMLInputElement>(null)
  const containerRef          = useRef<HTMLDivElement>(null)
  const navigate              = useNavigate()

  const { data: results } = useSearch(query)

  // Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault(); setOpen(true)
        setTimeout(() => inputRef.current?.focus(), 50)
      }
      if (e.key === 'Escape') { setOpen(false); setQuery('') }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  // Outside click
  useEffect(() => {
    const click = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node))
        setOpen(false)
    }
    document.addEventListener('mousedown', click)
    return () => document.removeEventListener('mousedown', click)
  }, [])

  const onFocus = useCallback(() => { setRecent(getRecent()); setOpen(true) }, [])

  const submit = useCallback((q: string) => {
    if (!q.trim()) return
    saveRecent(q.trim()); setOpen(false); setQuery('')
    navigate(`/dashboard/learning/search?q=${encodeURIComponent(q.trim())}`)
  }, [navigate])

  const showDrop = open && (query.trim().length >= 2 ? true : recent.length > 0)

  return (
    <div ref={containerRef} className="relative w-full max-w-xl" role="search">
      {/* Input */}
      <div className={[
        'flex items-center gap-2.5 rounded-[14px] px-4 py-2.5 bg-card border transition-all duration-200',
        open ? 'border-violet-500/50 ring-2 ring-violet-500/15' : 'border-border',
      ].join(' ')}>
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={onFocus}
          onKeyDown={e => e.key === 'Enter' && submit(query)}
          placeholder="Search courses, problems, lessons..."
          className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground"
          aria-label="Search"
          aria-expanded={showDrop}
          aria-haspopup="listbox"
          autoComplete="off"
        />
        {query ? (
          <button onClick={() => setQuery('')} className="shrink-0 text-muted-foreground hover:text-foreground" aria-label="Clear">
            <X className="h-3.5 w-3.5" />
          </button>
        ) : (
          <kbd className="hidden sm:flex items-center gap-0.5 text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border">
            <span>⌘</span>K
          </kbd>
        )}
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {showDrop && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 rounded-[14px] overflow-hidden z-50 bg-card border border-border shadow-xl"
            role="listbox"
          >
            {query.trim().length >= 2 && results ? (
              <div className="p-2">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground px-2 py-1.5">Results</p>
                {(results as any[]).length > 0 ? (
                  (results as any[]).slice(0, 6).map((r: any, i: number) => (
                    <button
                      key={i}
                      role="option"
                      aria-selected="false"
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-foreground hover:bg-muted transition-colors"
                      onClick={() => submit(r.title ?? r.name ?? query)}
                    >
                      <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      <span className="text-sm truncate">{r.title ?? r.name ?? r}</span>
                      <ArrowRight className="h-3.5 w-3.5 ml-auto shrink-0 text-muted-foreground/50" />
                    </button>
                  ))
                ) : (
                  <p className="text-sm px-3 py-2 text-muted-foreground">No results for "{query}"</p>
                )}
              </div>
            ) : (
              recent.length > 0 && (
                <div className="p-2">
                  <div className="flex items-center justify-between px-2 py-1.5">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Recent</p>
                    <button
                      onClick={() => { localStorage.removeItem(RECENT_KEY); setRecent([]) }}
                      className="text-[10px] text-muted-foreground hover:text-foreground"
                    >
                      Clear
                    </button>
                  </div>
                  {recent.map((s, i) => (
                    <button
                      key={i}
                      role="option"
                      aria-selected="false"
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-foreground hover:bg-muted transition-colors"
                      onClick={() => { setQuery(s); submit(s) }}
                    >
                      <Clock className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
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

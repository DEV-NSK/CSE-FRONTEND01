/**
 * FPRD-10: Global CMS Search — Module 14 & 15
 * Searches all content types through /manager/search?q=...
 */
import { useState, useCallback, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, BookOpen, Code2, FolderKanban, Building2, CalendarDays, Link2, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/shared/lib/utils'
import { managerService } from '@/shared/services/manager.service'

interface SearchResult {
  kind: string
  id: string
  title?: string
  name?: string
  description?: string
  difficulty?: string
  isPublished?: boolean
  extra?: string
}

interface SearchResponse {
  results: SearchResult[]
  total: number
  query: string
}

const TYPE_CONFIG: Record<string, {
  icon: React.ComponentType<{ className?: string }>
  label: string
  color: string
  href: string
}> = {
  roadmap:  { icon: BookOpen,     label: 'Roadmap',   color: 'bg-violet-100 text-violet-600', href: '/manager/learning' },
  lesson:   { icon: BookOpen,     label: 'Lesson',    color: 'bg-blue-100 text-blue-600',     href: '/manager/learning' },
  problem:  { icon: Code2,        label: 'Problem',   color: 'bg-emerald-100 text-emerald-600', href: '/manager/coding' },
  project:  { icon: FolderKanban, label: 'Project',   color: 'bg-orange-100 text-orange-600', href: '/manager/projects' },
  company:  { icon: Building2,    label: 'Company',   color: 'bg-pink-100 text-pink-600',     href: '/manager/placements' },
  event:    { icon: CalendarDays, label: 'Event',     color: 'bg-cyan-100 text-cyan-600',     href: '/manager/events' },
  resource: { icon: Link2,        label: 'Resource',  color: 'bg-slate-100 text-slate-600',   href: '/manager/learning' },
}

export default function ManagerSearchPage() {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const navigate = useNavigate()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleQueryChange = useCallback((value: string) => {
    setQuery(value)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setDebouncedQuery(value), 400)
  }, [])

  const { data: searchData, isFetching } = useQuery({
    queryKey: ['manager', 'cms-search-noop'],
    queryFn: () => Promise.resolve(null),
    enabled: false,
    staleTime: 0,
  })

  // Real search — direct service call
  const { data: realSearch, isFetching: searching } = useQuery({
    queryKey: ['manager', 'global-search', debouncedQuery],
    queryFn: async (): Promise<SearchResponse | null> => {
      if (debouncedQuery.trim().length < 2) return null
      const res = await managerService.globalCMSSearch(debouncedQuery, 30)
      return res.data.data as SearchResponse
    },
    enabled: debouncedQuery.trim().length >= 2,
    staleTime: 30_000,
    retry: 2,
  })

  void searchData // suppress unused warning

  const results = realSearch?.results ?? []
  const grouped = results.reduce<Record<string, SearchResult[]>>((acc, r) => {
    const key = r.kind ?? 'other'
    if (!acc[key]) acc[key] = []
    acc[key].push(r)
    return acc
  }, {})

  const getLabel = (r: SearchResult) => r.title ?? r.name ?? 'Untitled'

  return (
    <div className="space-y-6 max-w-3xl" role="main" aria-label="Global CMS Search">
      <div>
        <h1 className="text-lg font-bold text-slate-900">Global CMS Search</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Search across roadmaps, lessons, problems, projects, companies and events
        </p>
      </div>

      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        {(isFetching || searching) && (
          <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 animate-spin" />
        )}
        <input
          type="search"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          placeholder="Search all content… (min. 2 characters)"
          className="w-full pl-10 pr-10 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 shadow-sm bg-white"
          aria-label="Global search"
          autoFocus
        />
      </div>

      {/* Prompt */}
      {debouncedQuery.trim().length < 2 && (
        <div className="text-center py-12">
          <Search className="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <p className="text-sm text-slate-400">Type at least 2 characters to search</p>
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {Object.entries(TYPE_CONFIG).map(([type, cfg]) => {
              const Icon = cfg.icon
              return (
                <span key={type} className={cn('inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium', cfg.color)}>
                  <Icon className="w-3 h-3" />{cfg.label}s
                </span>
              )
            })}
          </div>
        </div>
      )}

      {/* No results */}
      {debouncedQuery.trim().length >= 2 && !searching && results.length === 0 && (
        <div className="text-center py-12">
          <Search className="w-10 h-10 text-slate-200 mx-auto mb-3" />
          <p className="text-sm text-slate-500">No results for <strong>"{debouncedQuery}"</strong></p>
          <p className="text-xs text-slate-400 mt-1">Try different keywords or check spelling.</p>
        </div>
      )}

      {/* Grouped results */}
      {results.length > 0 && (
        <div className="space-y-5">
          <p className="text-xs text-slate-500 font-medium">
            {realSearch?.total ?? 0} results for "{realSearch?.query}"
          </p>
          {Object.entries(grouped).map(([type, items]) => {
            const cfg = TYPE_CONFIG[type] ?? {
              icon: Search, label: type, color: 'bg-slate-100 text-slate-600', href: '/manager/dashboard',
            }
            const Icon = cfg.icon
            return (
              <div key={type}>
                <div className="flex items-center gap-2 mb-2.5">
                  <span className={cn('inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold', cfg.color)}>
                    <Icon className="w-3 h-3" />{cfg.label}s
                  </span>
                  <span className="text-xs text-slate-400">{items.length} found</span>
                </div>
                <div className="space-y-1.5">
                  {items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => navigate(cfg.href)}
                      className="w-full flex items-start gap-3 p-3 bg-white border border-slate-200 rounded-xl hover:border-violet-300 hover:shadow-sm transition-all text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                      aria-label={`Go to ${getLabel(item)}`}
                    >
                      <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5', cfg.color)}>
                        <Icon className="w-4 h-4" aria-hidden="true" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate group-hover:text-violet-700 transition-colors">
                          {getLabel(item)}
                        </p>
                        {item.description && (
                          <p className="text-xs text-slate-500 mt-0.5 truncate">{item.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          {item.difficulty && (
                            <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded',
                              item.difficulty === 'EASY' || item.difficulty === 'BEGINNER'
                                ? 'bg-emerald-100 text-emerald-700'
                                : item.difficulty === 'MEDIUM' || item.difficulty === 'INTERMEDIATE'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-red-100 text-red-700'
                            )}>
                              {item.difficulty}
                            </span>
                          )}
                          {item.isPublished !== undefined && (
                            <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded',
                              item.isPublished ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                            )}>
                              {item.isPublished ? 'Published' : 'Draft'}
                            </span>
                          )}
                          {item.extra && (
                            <span className="text-[10px] text-slate-400">{item.extra}</span>
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-slate-300 group-hover:text-violet-400 self-center flex-shrink-0" aria-hidden="true">→</span>
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

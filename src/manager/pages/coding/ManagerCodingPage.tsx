import { useState } from 'react'
import { Code2, Tag, Building2, FileCode, CalendarCheck } from 'lucide-react'
import { ContentTable, ContentRow } from '@/manager/components/ContentTable'
import { Badge } from '@/shared/components/ui/badge'

const mockProblems: ContentRow[] = [
  { id: '1', title: 'Two Sum', status: 'published', category: 'Arrays', updatedAt: 'Jul 17, 2026', extra: 'Easy' },
  { id: '2', title: 'Longest Palindromic Substring', status: 'published', category: 'Strings', updatedAt: 'Jul 16, 2026', extra: 'Medium' },
  { id: '3', title: 'Merge K Sorted Lists', status: 'published', category: 'Linked Lists', updatedAt: 'Jul 15, 2026', extra: 'Hard' },
  { id: '4', title: 'Binary Tree Level Order Traversal', status: 'draft', category: 'Trees', updatedAt: 'Jul 14, 2026', extra: 'Medium' },
  { id: '5', title: 'LRU Cache Implementation', status: 'published', category: 'Design', updatedAt: 'Jul 13, 2026', extra: 'Hard' },
  { id: '6', title: 'Valid Parentheses', status: 'published', category: 'Stacks', updatedAt: 'Jul 12, 2026', extra: 'Easy' },
  { id: '7', title: 'Coin Change Problem', status: 'draft', category: 'DP', updatedAt: 'Jul 11, 2026', extra: 'Medium' },
  { id: '8', title: 'Word Search II', status: 'archived', category: 'Backtracking', updatedAt: 'Jul 9, 2026', extra: 'Hard' },
  { id: '9', title: 'Number of Islands', status: 'published', category: 'Graphs', updatedAt: 'Jul 8, 2026', extra: 'Medium' },
  { id: '10', title: 'Trapping Rain Water', status: 'published', category: 'Arrays', updatedAt: 'Jul 7, 2026', extra: 'Hard' },
]

const mockTags: ContentRow[] = [
  { id: '1', title: 'Arrays', status: 'published', updatedAt: 'Jul 10, 2026' },
  { id: '2', title: 'Dynamic Programming', status: 'published', updatedAt: 'Jul 9, 2026' },
  { id: '3', title: 'Graph Theory', status: 'published', updatedAt: 'Jul 8, 2026' },
  { id: '4', title: 'Sliding Window', status: 'draft', updatedAt: 'Jul 7, 2026' },
]

const mockCompanies: ContentRow[] = [
  { id: '1', title: 'Google', status: 'published', category: 'FAANG', updatedAt: 'Jul 16, 2026' },
  { id: '2', title: 'Microsoft', status: 'published', category: 'FAANG', updatedAt: 'Jul 15, 2026' },
  { id: '3', title: 'Amazon', status: 'published', category: 'FAANG', updatedAt: 'Jul 14, 2026' },
  { id: '4', title: 'Atlassian', status: 'draft', category: 'Product', updatedAt: 'Jul 12, 2026' },
]

const TABS = [
  { id: 'problems', label: 'Problems', icon: FileCode },
  { id: 'tags', label: 'Tags', icon: Tag },
  { id: 'companies', label: 'Companies', icon: Building2 },
  { id: 'daily', label: 'Daily Challenge', icon: CalendarCheck },
]

const dataMap: Record<string, ContentRow[]> = {
  problems: mockProblems,
  tags: mockTags,
  companies: mockCompanies,
  daily: [],
}

export default function ManagerCodingPage() {
  const [activeTab, setActiveTab] = useState('problems')

  return (
    <div className="space-y-5" role="main" aria-label="Coding Management">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-emerald-100 rounded-lg flex items-center justify-center">
          <Code2 className="w-5 h-5 text-emerald-600" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-900">Coding Management</h1>
          <p className="text-xs text-slate-500">Manage problems, tags, companies and daily challenges</p>
        </div>
      </div>

      <div className="flex items-center gap-1 border-b border-slate-200" role="tablist">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            role="tab"
            aria-selected={activeTab === id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${
              activeTab === id
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Icon className="w-3.5 h-3.5" aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Easy', count: 312, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
          { label: 'Medium', count: 389, color: 'text-amber-600 bg-amber-50 border-amber-200' },
          { label: 'Hard', count: 155, color: 'text-red-600 bg-red-50 border-red-200' },
        ].map(({ label, count, color }) => (
          <div key={label} className={`border rounded-lg px-4 py-3 flex items-center justify-between ${color}`}>
            <span className="text-sm font-medium">{label}</span>
            <span className="text-lg font-bold">{count}</span>
          </div>
        ))}
      </div>

      <div role="tabpanel">
        <ContentTable
          title={TABS.find((t) => t.id === activeTab)?.label || ''}
          rows={dataMap[activeTab] || []}
          onCreateNew={() => {}}
          createLabel={`New ${TABS.find((t) => t.id === activeTab)?.label?.replace(/s$/, '')}`}
        />
      </div>
    </div>
  )
}

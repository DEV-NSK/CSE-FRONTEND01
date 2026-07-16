import { useState } from 'react'
import { Tabs } from '@/shared/components/ui/tabs'
import { ContentTable, ContentRow } from '@/manager/components/ContentTable'
import { BookOpen, Layers, FileText, Link2, Tag } from 'lucide-react'

const mockCategories: ContentRow[] = [
  { id: '1', title: 'Data Structures & Algorithms', status: 'published', updatedAt: 'Jul 16, 2026', author: 'System' },
  { id: '2', title: 'Web Development', status: 'published', updatedAt: 'Jul 15, 2026', author: 'System' },
  { id: '3', title: 'Machine Learning', status: 'draft', updatedAt: 'Jul 14, 2026', author: 'Manager' },
  { id: '4', title: 'DevOps & Cloud', status: 'published', updatedAt: 'Jul 12, 2026', author: 'System' },
  { id: '5', title: 'System Design', status: 'draft', updatedAt: 'Jul 10, 2026', author: 'Manager' },
]

const mockRoadmaps: ContentRow[] = [
  { id: '1', title: 'Full Stack Web Developer', status: 'published', category: 'Web Development', updatedAt: 'Jul 16, 2026' },
  { id: '2', title: 'DSA Mastery Path', status: 'published', category: 'DSA', updatedAt: 'Jul 15, 2026' },
  { id: '3', title: 'React + TypeScript', status: 'draft', category: 'Frontend', updatedAt: 'Jul 14, 2026' },
  { id: '4', title: 'Python Data Science', status: 'archived', category: 'ML', updatedAt: 'Jul 10, 2026' },
  { id: '5', title: 'Kubernetes & Docker', status: 'draft', category: 'DevOps', updatedAt: 'Jul 8, 2026' },
  { id: '6', title: 'AWS Solutions Architect', status: 'published', category: 'Cloud', updatedAt: 'Jul 5, 2026' },
]

const mockLessons: ContentRow[] = [
  { id: '1', title: 'Introduction to Binary Trees', status: 'published', category: 'DSA', updatedAt: 'Jul 17, 2026', author: 'Manager' },
  { id: '2', title: 'React Hooks Deep Dive', status: 'published', category: 'Frontend', updatedAt: 'Jul 16, 2026', author: 'Manager' },
  { id: '3', title: 'SQL Joins Explained', status: 'draft', category: 'Databases', updatedAt: 'Jul 15, 2026', author: 'Manager' },
  { id: '4', title: 'CSS Grid & Flexbox', status: 'published', category: 'Frontend', updatedAt: 'Jul 14, 2026', author: 'Manager' },
  { id: '5', title: 'REST API Design', status: 'draft', category: 'Backend', updatedAt: 'Jul 12, 2026', author: 'Manager' },
  { id: '6', title: 'Graph Algorithms', status: 'published', category: 'DSA', updatedAt: 'Jul 11, 2026', author: 'Manager' },
  { id: '7', title: 'Docker Fundamentals', status: 'archived', category: 'DevOps', updatedAt: 'Jul 8, 2026', author: 'Manager' },
  { id: '8', title: 'TypeScript Advanced Types', status: 'published', category: 'Frontend', updatedAt: 'Jul 6, 2026', author: 'Manager' },
  { id: '9', title: 'Redis Caching Patterns', status: 'draft', category: 'Backend', updatedAt: 'Jul 4, 2026', author: 'Manager' },
]

const TABS = [
  { id: 'categories', label: 'Categories', icon: Tag },
  { id: 'roadmaps', label: 'Roadmaps', icon: Layers },
  { id: 'lessons', label: 'Lessons', icon: FileText },
  { id: 'resources', label: 'Resources', icon: Link2 },
]

export default function ManagerLearningPage() {
  const [activeTab, setActiveTab] = useState('categories')

  const dataMap: Record<string, ContentRow[]> = {
    categories: mockCategories,
    roadmaps: mockRoadmaps,
    lessons: mockLessons,
    resources: [],
  }

  return (
    <div className="space-y-5" role="main" aria-label="Learning Management">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-violet-100 rounded-lg flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-violet-600" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-900">Learning Management</h1>
          <p className="text-xs text-slate-500">Manage categories, roadmaps, lessons and resources</p>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-1 border-b border-slate-200" role="tablist">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            role="tab"
            aria-selected={activeTab === id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${
              activeTab === id
                ? 'border-violet-600 text-violet-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Icon className="w-3.5 h-3.5" aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div role="tabpanel">
        <ContentTable
          title={TABS.find((t) => t.id === activeTab)?.label || ''}
          rows={dataMap[activeTab] || []}
          onCreateNew={() => {}}
          createLabel={`New ${TABS.find((t) => t.id === activeTab)?.label.slice(0, -1)}`}
        />
      </div>
    </div>
  )
}

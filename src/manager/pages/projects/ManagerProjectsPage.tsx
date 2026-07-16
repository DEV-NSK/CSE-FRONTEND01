import { useState } from 'react'
import { FolderKanban, Tag, Cpu, LayoutTemplate } from 'lucide-react'
import { ContentTable, ContentRow } from '@/manager/components/ContentTable'

const mockProjects: ContentRow[] = [
  { id: '1', title: 'E-Commerce Platform (React + Node)', status: 'published', category: 'Full Stack', updatedAt: 'Jul 17, 2026', extra: 'Advanced' },
  { id: '2', title: 'Real-time Chat Application', status: 'published', category: 'Backend', updatedAt: 'Jul 16, 2026', extra: 'Intermediate' },
  { id: '3', title: 'ML Image Classifier', status: 'draft', category: 'AI/ML', updatedAt: 'Jul 15, 2026', extra: 'Advanced' },
  { id: '4', title: 'Portfolio Website', status: 'published', category: 'Frontend', updatedAt: 'Jul 14, 2026', extra: 'Beginner' },
  { id: '5', title: 'Microservices with Docker', status: 'draft', category: 'DevOps', updatedAt: 'Jul 13, 2026', extra: 'Advanced' },
  { id: '6', title: 'Todo App with Authentication', status: 'published', category: 'Full Stack', updatedAt: 'Jul 12, 2026', extra: 'Beginner' },
  { id: '7', title: 'Blockchain Voting System', status: 'archived', category: 'Blockchain', updatedAt: 'Jul 10, 2026', extra: 'Advanced' },
]

const mockCategories: ContentRow[] = [
  { id: '1', title: 'Full Stack', status: 'published', updatedAt: 'Jul 10, 2026' },
  { id: '2', title: 'Frontend', status: 'published', updatedAt: 'Jul 9, 2026' },
  { id: '3', title: 'Backend', status: 'published', updatedAt: 'Jul 8, 2026' },
  { id: '4', title: 'AI/ML', status: 'draft', updatedAt: 'Jul 7, 2026' },
]

const mockTech: ContentRow[] = [
  { id: '1', title: 'React', status: 'published', updatedAt: 'Jul 10, 2026' },
  { id: '2', title: 'Node.js', status: 'published', updatedAt: 'Jul 9, 2026' },
  { id: '3', title: 'Python', status: 'published', updatedAt: 'Jul 8, 2026' },
  { id: '4', title: 'Docker', status: 'draft', updatedAt: 'Jul 7, 2026' },
]

const TABS = [
  { id: 'projects', label: 'Projects', icon: FolderKanban },
  { id: 'categories', label: 'Categories', icon: Tag },
  { id: 'technologies', label: 'Technologies', icon: Cpu },
  { id: 'templates', label: 'Templates', icon: LayoutTemplate },
]

const dataMap: Record<string, ContentRow[]> = {
  projects: mockProjects,
  categories: mockCategories,
  technologies: mockTech,
  templates: [],
}

export default function ManagerProjectsPage() {
  const [activeTab, setActiveTab] = useState('projects')

  return (
    <div className="space-y-5" role="main" aria-label="Project Management">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-orange-100 rounded-lg flex items-center justify-center">
          <FolderKanban className="w-5 h-5 text-orange-600" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-900">Project Management</h1>
          <p className="text-xs text-slate-500">Manage projects, categories, technologies and templates</p>
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
                ? 'border-orange-500 text-orange-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Icon className="w-3.5 h-3.5" aria-hidden="true" />
            {label}
          </button>
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

import { useState } from 'react'
import { Briefcase, Building2, GraduationCap, FileText, BarChart3 } from 'lucide-react'
import { ContentTable, ContentRow } from '@/manager/components/ContentTable'

const mockCompanies: ContentRow[] = [
  { id: '1', title: 'Google', status: 'published', category: 'FAANG', updatedAt: 'Jul 17, 2026' },
  { id: '2', title: 'Microsoft', status: 'published', category: 'FAANG', updatedAt: 'Jul 16, 2026' },
  { id: '3', title: 'Amazon', status: 'published', category: 'FAANG', updatedAt: 'Jul 15, 2026' },
  { id: '4', title: 'Infosys', status: 'published', category: 'Service', updatedAt: 'Jul 14, 2026' },
  { id: '5', title: 'Wipro', status: 'published', category: 'Service', updatedAt: 'Jul 13, 2026' },
  { id: '6', title: 'Atlassian', status: 'draft', category: 'Product', updatedAt: 'Jul 12, 2026' },
]

const mockJobs: ContentRow[] = [
  { id: '1', title: 'SDE-1 – Google', status: 'published', category: 'Full-time', updatedAt: 'Jul 17, 2026' },
  { id: '2', title: 'Frontend Engineer – Microsoft', status: 'published', category: 'Full-time', updatedAt: 'Jul 16, 2026' },
  { id: '3', title: 'Data Scientist – Amazon', status: 'draft', category: 'Full-time', updatedAt: 'Jul 15, 2026' },
  { id: '4', title: 'Backend Dev Intern – Razorpay', status: 'published', category: 'Internship', updatedAt: 'Jul 14, 2026' },
  { id: '5', title: 'ML Research Intern – Meta', status: 'draft', category: 'Internship', updatedAt: 'Jul 13, 2026' },
]

const mockInternships: ContentRow[] = [
  { id: '1', title: 'Summer Intern – Adobe', status: 'published', category: 'Summer', updatedAt: 'Jul 15, 2026' },
  { id: '2', title: 'Winter Intern – Flipkart', status: 'draft', category: 'Winter', updatedAt: 'Jul 12, 2026' },
]

const TABS = [
  { id: 'companies', label: 'Companies', icon: Building2 },
  { id: 'jobs', label: 'Jobs', icon: Briefcase },
  { id: 'internships', label: 'Internships', icon: GraduationCap },
  { id: 'applications', label: 'Applications', icon: FileText },
  { id: 'statistics', label: 'Statistics', icon: BarChart3 },
]

const dataMap: Record<string, ContentRow[]> = {
  companies: mockCompanies,
  jobs: mockJobs,
  internships: mockInternships,
  applications: [],
  statistics: [],
}

export default function ManagerPlacementsPage() {
  const [activeTab, setActiveTab] = useState('companies')

  return (
    <div className="space-y-5" role="main" aria-label="Placement Management">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-pink-100 rounded-lg flex items-center justify-center">
          <Briefcase className="w-5 h-5 text-pink-600" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-900">Placement Management</h1>
          <p className="text-xs text-slate-500">Manage companies, jobs, internships and applications</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Active Jobs', value: '67', color: 'bg-pink-50 border-pink-200 text-pink-700' },
          { label: 'Companies', value: '38', color: 'bg-blue-50 border-blue-200 text-blue-700' },
          { label: 'Applications', value: '284', color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
          { label: 'Placements', value: '47', color: 'bg-amber-50 border-amber-200 text-amber-700' },
        ].map(({ label, value, color }) => (
          <div key={label} className={`border rounded-lg px-4 py-3 ${color}`}>
            <p className="text-xs font-medium opacity-80">{label}</p>
            <p className="text-2xl font-bold mt-0.5">{value}</p>
          </div>
        ))}
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
                ? 'border-pink-500 text-pink-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Icon className="w-3.5 h-3.5" aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>

      <div role="tabpanel">
        {activeTab === 'statistics' ? (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-400">
            <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="text-sm">Placement statistics and analytics available here</p>
          </div>
        ) : (
          <ContentTable
            title={TABS.find((t) => t.id === activeTab)?.label || ''}
            rows={dataMap[activeTab] || []}
            onCreateNew={() => {}}
            createLabel={`New ${TABS.find((t) => t.id === activeTab)?.label?.replace(/s$/, '')}`}
          />
        )}
      </div>
    </div>
  )
}

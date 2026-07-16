import { useState } from 'react'
import { LayoutGrid, List, Search, Filter, X } from 'lucide-react'
import { motion } from 'framer-motion'
import { PageHeader } from '@/shared/components/common/PageHeader'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { CompanyCard } from '@/student/components/placement/CompanyCard'
import { CompanyCardSkeleton } from '@/student/components/placement/PlacementSkeletons'
import { EmptyState } from '@/shared/components/feedback/EmptyState'
import { useCompanies } from '@/shared/hooks/usePlacement'
import { usePlacementStore } from '@/shared/store/placementStore'
import { Building2 } from 'lucide-react'

const INDUSTRIES = ['Technology', 'Finance', 'Healthcare', 'E-Commerce', 'Consulting', 'Manufacturing', 'Media', 'Education', 'Other']

export function CompaniesPage() {
  const { companyFilters, companiesViewMode, setCompanyFilters, resetCompanyFilters, setCompaniesViewMode } = usePlacementStore()
  const [showFilters, setShowFilters] = useState(false)

  const { data, isLoading } = useCompanies({
    search: companyFilters.search,
    industry: companyFilters.industry,
    isVerified: companyFilters.isVerified ?? undefined,
  })

  const companies = data?.data ?? []
  const hasFilters = companyFilters.search || companyFilters.industry || companyFilters.isVerified !== null

  return (
    <div className="space-y-5">
      <PageHeader
        title="Companies"
        description="Explore companies hiring from your campus"
        breadcrumbs={[{ label: 'Placement', href: '/dashboard/placement' }, { label: 'Companies' }]}
      />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search companies…"
            value={companyFilters.search}
            onChange={(e) => setCompanyFilters({ search: e.target.value })}
            className="pl-9 h-9"
          />
        </div>
        <Button variant="outline" size="sm" className="gap-1.5 h-9" onClick={() => setShowFilters(!showFilters)}>
          <Filter className="h-3.5 w-3.5" />Filters
          {hasFilters && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
        </Button>
        {hasFilters && (
          <Button variant="ghost" size="sm" className="h-9 gap-1.5 text-muted-foreground" onClick={resetCompanyFilters}>
            <X className="h-3.5 w-3.5" />Clear
          </Button>
        )}
        <div className="flex items-center border rounded-md h-9 ml-auto">
          <Button variant={companiesViewMode === 'grid' ? 'default' : 'ghost'} size="icon-sm" className="rounded-r-none h-9" onClick={() => setCompaniesViewMode('grid')} aria-label="Grid view">
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button variant={companiesViewMode === 'list' ? 'default' : 'ghost'} size="icon-sm" className="rounded-l-none h-9" onClick={() => setCompaniesViewMode('list')} aria-label="List view">
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="flex flex-wrap gap-3 p-4 bg-muted/30 rounded-lg border border-border">
          <Select value={companyFilters.industry || 'all'} onValueChange={(v) => setCompanyFilters({ industry: v === 'all' ? '' : v })}>
            <SelectTrigger className="w-44 h-8 text-sm"><SelectValue placeholder="Industry" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Industries</SelectItem>
              {INDUSTRIES.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={companyFilters.isVerified === null ? 'all' : String(companyFilters.isVerified)} onValueChange={(v) => setCompanyFilters({ isVerified: v === 'all' ? null : v === 'true' })}>
            <SelectTrigger className="w-36 h-8 text-sm"><SelectValue placeholder="Verified" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="true">Verified Only</SelectItem>
              <SelectItem value="false">Unverified</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>
      )}

      {/* Results */}
      {isLoading ? (
        <div className={companiesViewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : 'space-y-3'}>
          {Array.from({ length: 8 }).map((_, i) => <CompanyCardSkeleton key={i} />)}
        </div>
      ) : companies.length === 0 ? (
        <EmptyState icon={<Building2 className="h-12 w-12" />} title="No companies found" description="Try adjusting your search or filters." action={{ label: 'Clear filters', onClick: resetCompanyFilters }} />
      ) : (
        <div className={companiesViewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : 'space-y-3'}>
          {companies.map((company) => (
            <motion.div key={company.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <CompanyCard company={company} viewMode={companiesViewMode} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

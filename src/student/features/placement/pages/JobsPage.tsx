import { useState } from 'react'
import { Search, Filter, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { PageHeader } from '@/shared/components/common/PageHeader'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { JobCard } from '@/student/components/placement/JobCard'
import { JobCardSkeleton } from '@/student/components/placement/PlacementSkeletons'
import { EmptyState } from '@/shared/components/feedback/EmptyState'
import { Briefcase } from 'lucide-react'
import { useJobs, useSaveJob, useUnsaveJob } from '@/shared/hooks/usePlacement'
import { usePlacementStore } from '@/shared/store/placementStore'
import { useToast } from '@/shared/hooks/useToast'

export function JobsPage() {
  const { jobFilters, jobsPage, setJobFilters, resetJobFilters, setJobsPage } = usePlacementStore()
  const [showFilters, setShowFilters] = useState(false)
  const { toast } = useToast()

  const { data, isLoading } = useJobs({ ...jobFilters, page: jobsPage, limit: 10 })
  const saveJob = useSaveJob()
  const unsaveJob = useUnsaveJob()

  const jobs = data?.data ?? []
  const total = data?.total ?? 0
  const totalPages = data?.totalPages ?? 1
  const hasFilters = jobFilters.search || jobFilters.workMode !== 'all' || jobFilters.jobType !== 'all' || jobFilters.experienceLevel !== 'all' || jobFilters.location

  const handleSaveToggle = async (jobId: string, isSaved: boolean) => {
    try {
      if (isSaved) await unsaveJob.mutateAsync(jobId)
      else await saveJob.mutateAsync(jobId)
    } catch {
      toast({ title: 'Error', description: 'Could not update job save status.', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Jobs"
        description={`${total} positions available`}
        breadcrumbs={[{ label: 'Placement', href: '/dashboard/placement' }, { label: 'Jobs' }]}
      />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search jobs, skills…" value={jobFilters.search} onChange={(e) => setJobFilters({ search: e.target.value })} className="pl-9 h-9" />
        </div>
        <Button variant="outline" size="sm" className="gap-1.5 h-9" onClick={() => setShowFilters(!showFilters)}>
          <Filter className="h-3.5 w-3.5" />Filters
          {hasFilters && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
        </Button>
        {hasFilters && (
          <Button variant="ghost" size="sm" className="h-9 gap-1.5 text-muted-foreground" onClick={resetJobFilters}>
            <X className="h-3.5 w-3.5" />Clear
          </Button>
        )}
      </div>

      {showFilters && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="flex flex-wrap gap-3 p-4 bg-muted/30 rounded-lg border border-border">
          <Select value={jobFilters.workMode} onValueChange={(v) => setJobFilters({ workMode: v as typeof jobFilters.workMode })}>
            <SelectTrigger className="w-36 h-8 text-sm"><SelectValue placeholder="Work Mode" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Modes</SelectItem>
              <SelectItem value="remote">Remote</SelectItem>
              <SelectItem value="onsite">On-site</SelectItem>
              <SelectItem value="hybrid">Hybrid</SelectItem>
            </SelectContent>
          </Select>
          <Select value={jobFilters.jobType} onValueChange={(v) => setJobFilters({ jobType: v as typeof jobFilters.jobType })}>
            <SelectTrigger className="w-36 h-8 text-sm"><SelectValue placeholder="Job Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="full_time">Full Time</SelectItem>
              <SelectItem value="internship">Internship</SelectItem>
              <SelectItem value="part_time">Part Time</SelectItem>
              <SelectItem value="contract">Contract</SelectItem>
            </SelectContent>
          </Select>
          <Select value={jobFilters.experienceLevel} onValueChange={(v) => setJobFilters({ experienceLevel: v as typeof jobFilters.experienceLevel })}>
            <SelectTrigger className="w-36 h-8 text-sm"><SelectValue placeholder="Experience" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="fresher">Fresher</SelectItem>
              <SelectItem value="junior">Junior</SelectItem>
              <SelectItem value="mid">Mid-Level</SelectItem>
              <SelectItem value="senior">Senior</SelectItem>
            </SelectContent>
          </Select>
          <Input placeholder="Location…" value={jobFilters.location} onChange={(e) => setJobFilters({ location: e.target.value })} className="w-40 h-8 text-sm" />
        </motion.div>
      )}

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 6 }).map((_, i) => <JobCardSkeleton key={i} />)}</div>
      ) : jobs.length === 0 ? (
        <EmptyState icon={<Briefcase className="h-12 w-12" />} title="No jobs found" description="Try adjusting your search or filters." action={{ label: 'Clear filters', onClick: resetJobFilters }} />
      ) : (
        <>
          <div className="space-y-3">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} onSaveToggle={handleSaveToggle} isSaving={saveJob.isPending || unsaveJob.isPending} />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between py-2">
              <p className="text-xs text-muted-foreground">Page {jobsPage} of {totalPages} · {total} results</p>
              <div className="flex gap-1">
                <Button variant="outline" size="icon-sm" disabled={jobsPage <= 1} onClick={() => setJobsPage(jobsPage - 1)} aria-label="Previous">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon-sm" disabled={jobsPage >= totalPages} onClick={() => setJobsPage(jobsPage + 1)} aria-label="Next">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

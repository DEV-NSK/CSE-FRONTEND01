import { useParams, Link } from 'react-router-dom'
import { MapPin, Clock, Briefcase, Bookmark, BookmarkCheck, Building2, ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import { PageHeader } from '@/shared/components/common/PageHeader'
import { Card, CardContent } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Separator } from '@/shared/components/ui/separator'
import { ErrorState } from '@/shared/components/feedback/ErrorState'
import { JobCardSkeleton } from '@/student/components/placement/PlacementSkeletons'
import { formatDate } from '@/shared/lib/utils'
import { useJob, useSaveJob, useUnsaveJob, useApplyJob } from '@/shared/hooks/usePlacement'
import { useToast } from '@/shared/hooks/useToast'

export function JobDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: job, isLoading, isError } = useJob(id!)
  const saveJob = useSaveJob()
  const unsaveJob = useUnsaveJob()
  const applyJob = useApplyJob()
  const { toast } = useToast()

  if (isLoading) return <div className="space-y-4"><div className="h-8 w-48 bg-muted rounded animate-pulse" /><JobCardSkeleton /></div>
  if (isError || !job) return <ErrorState title="Job not found" message="This job listing may have expired." onRetry={() => window.history.back()} />

  const handleSave = async () => {
    try {
      if (job.isSaved) await unsaveJob.mutateAsync(id!)
      else await saveJob.mutateAsync(id!)
    } catch { toast({ title: 'Error', description: 'Could not save job.', variant: 'destructive' }) }
  }

  const handleApply = async () => {
    try {
      await applyJob.mutateAsync({ jobId: id! })
      toast({ title: 'Applied!', description: `You've applied to ${job.title}.` })
    } catch { toast({ title: 'Error', description: 'Could not apply. You may have already applied.', variant: 'destructive' }) }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={job.title}
        breadcrumbs={[
          { label: 'Placement', href: '/dashboard/placement' },
          { label: 'Jobs', href: '/dashboard/placement/jobs' },
          { label: job.title },
        ]}
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <motion.div className="lg:col-span-2 space-y-5" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          {/* Company Header */}
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg border bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                  {job.company.logo ? <img src={job.company.logo} alt={job.company.name} className="h-10 w-10 object-contain" /> : <Building2 className="h-6 w-6 text-muted-foreground" />}
                </div>
                <div>
                  <Link to={`/dashboard/placement/companies/${job.company.id}`} className="font-semibold text-foreground hover:text-primary transition-colors">{job.company.name}</Link>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">{job.jobType.replace('_', ' ')}</Badge>
                    <Badge variant="outline" className="text-xs capitalize">{job.workMode}</Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" />{job.location}</span>
                    {job.salary && <span className="text-xs text-muted-foreground">{job.salary}</span>}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardContent className="p-5 space-y-4">
              <section>
                <h2 className="font-semibold text-base mb-2">Job Description</h2>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{job.description}</p>
              </section>
              {job.requirements && (
                <>
                  <Separator />
                  <section>
                    <h2 className="font-semibold text-base mb-2">Requirements</h2>
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{job.requirements}</p>
                  </section>
                </>
              )}
              {job.skills.length > 0 && (
                <>
                  <Separator />
                  <section>
                    <h2 className="font-semibold text-base mb-2">Required Skills</h2>
                    <div className="flex flex-wrap gap-2">
                      {job.skills.map((skill) => (
                        <span key={skill} className="text-xs px-2.5 py-1 bg-primary/10 text-primary rounded-full">{skill}</span>
                      ))}
                    </div>
                  </section>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Sticky Sidebar */}
        <div>
          <div className="sticky top-6 space-y-4">
            <Card>
              <CardContent className="p-5 space-y-4">
                <Button className="w-full gap-2" onClick={handleApply} loading={applyJob.isPending} disabled={!!job.applicationStatus && job.applicationStatus !== 'saved'}>
                  <Briefcase className="h-4 w-4" />
                  {job.applicationStatus && job.applicationStatus !== 'saved' ? 'Already Applied' : 'Apply Now'}
                </Button>
                <Button variant="outline" className="w-full gap-2" onClick={handleSave} loading={saveJob.isPending || unsaveJob.isPending}>
                  {job.isSaved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                  {job.isSaved ? 'Saved' : 'Save Job'}
                </Button>
                <Separator />
                <div className="space-y-3 text-sm">
                  {job.deadline && (
                    <div className="flex items-start gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div>
                        <p className="text-muted-foreground text-xs">Application Deadline</p>
                        <p className="font-medium">{formatDate(job.deadline)}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-muted-foreground text-xs">Company</p>
                      <Link to={`/dashboard/placement/companies/${job.company.id}`} className="font-medium hover:text-primary transition-colors">{job.company.name}</Link>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-muted-foreground text-xs">Location</p>
                      <p className="font-medium">{job.location} · {job.workMode}</p>
                    </div>
                  </div>
                  {job.salary && (
                    <div className="flex items-start gap-2">
                      <span className="text-muted-foreground mt-0.5 text-base leading-none">₹</span>
                      <div>
                        <p className="text-muted-foreground text-xs">Salary</p>
                        <p className="font-medium">{job.salary}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

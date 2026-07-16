import { useParams, Link } from 'react-router-dom'
import { Building2, MapPin, Globe, Briefcase, BadgeCheck, ExternalLink, ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import { PageHeader } from '@/shared/components/common/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { JobCard } from '@/student/components/placement/JobCard'
import { CompanyCardSkeleton, JobCardSkeleton } from '@/student/components/placement/PlacementSkeletons'
import { ErrorState } from '@/shared/components/feedback/ErrorState'
import { useCompany, useJobs } from '@/shared/hooks/usePlacement'

export function CompanyDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: company, isLoading, isError } = useCompany(id!)
  const { data: jobsData } = useJobs({ company: id, limit: 10 } as Parameters<typeof useJobs>[0])

  if (isLoading) return (
    <div className="space-y-6">
      <div className="h-8 w-48 bg-muted rounded animate-pulse" />
      <CompanyCardSkeleton />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <JobCardSkeleton key={i} />)}
      </div>
    </div>
  )

  if (isError || !company) return (
    <ErrorState title="Company not found" message="This company may have been removed." onRetry={() => window.history.back()} />
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title={company.name}
        breadcrumbs={[
          { label: 'Placement', href: '/dashboard/placement' },
          { label: 'Companies', href: '/dashboard/placement/companies' },
          { label: company.name },
        ]}
      />

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        {/* Overview Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-5">
              <div className="h-16 w-16 rounded-xl border bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                {company.logo ? (
                  <img src={company.logo} alt={company.name} className="h-14 w-14 object-contain" />
                ) : (
                  <Building2 className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-bold text-foreground">{company.name}</h2>
                  {company.isVerified && (
                    <Badge variant="info" className="gap-1"><BadgeCheck className="h-3 w-3" />Verified</Badge>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><Building2 className="h-3.5 w-3.5" />{company.industry}</span>
                  {company.headquarters && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{company.headquarters}</span>}
                  <span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" />{company.openJobsCount} open positions</span>
                </div>
                <div className="flex gap-3 mt-3">
                  {company.website && (
                    <Button variant="outline" size="sm" className="gap-1.5 h-8" asChild>
                      <a href={company.website} target="_blank" rel="noopener noreferrer">
                        <Globe className="h-3.5 w-3.5" />Website
                      </a>
                    </Button>
                  )}
                  {company.careersLink && (
                    <Button size="sm" className="gap-1.5 h-8" asChild>
                      <a href={company.careersLink} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3.5 w-3.5" />Careers
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
            {company.description && (
              <div className="mt-5 pt-5 border-t border-border">
                <h3 className="font-semibold text-sm mb-2">About</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{company.description}</p>
              </div>
            )}
            {company.technologies && company.technologies.length > 0 && (
              <div className="mt-4">
                <h3 className="font-semibold text-sm mb-2">Technologies</h3>
                <div className="flex flex-wrap gap-2">
                  {company.technologies.map((tech) => (
                    <span key={tech} className="text-xs px-2 py-1 bg-muted rounded-full text-muted-foreground">{tech}</span>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Open Positions */}
        <div>
          <h2 className="font-semibold text-foreground mb-3">Open Positions</h2>
          {jobsData?.data && jobsData.data.length > 0 ? (
            <div className="space-y-3">
              {jobsData.data.map((job) => <JobCard key={job.id} job={job} />)}
            </div>
          ) : (
            <Card>
              <CardContent className="py-10 text-center text-muted-foreground text-sm">
                No open positions at the moment.
              </CardContent>
            </Card>
          )}
        </div>
      </motion.div>
    </div>
  )
}

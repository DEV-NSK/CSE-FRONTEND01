import { Link } from 'react-router-dom'
import { MapPin, Clock, Bookmark, BookmarkCheck, Building2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/utils'
import { formatDate } from '@/shared/lib/utils'
import type { JobListItem } from '@/shared/types/placement'

const workModeColors: Record<string, string> = {
  remote: 'success',
  onsite: 'info',
  hybrid: 'warning',
}

const jobTypeLabels: Record<string, string> = {
  full_time: 'Full Time',
  part_time: 'Part Time',
  internship: 'Internship',
  contract: 'Contract',
}

interface JobCardProps {
  job: JobListItem
  onSaveToggle?: (jobId: string, isSaved: boolean) => void
  isSaving?: boolean
}

export function JobCard({ job, onSaveToggle, isSaving }: JobCardProps) {
  return (
    <motion.div layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="hover:border-primary/40 hover:shadow-sm transition-all">
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className="h-11 w-11 rounded-lg border bg-muted flex items-center justify-center shrink-0 overflow-hidden">
              {job.company.logo ? (
                <img src={job.company.logo} alt={job.company.name} className="h-9 w-9 object-contain" />
              ) : (
                <Building2 className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <Link
                    to={`/dashboard/placement/jobs/${job.id}`}
                    className="font-semibold text-foreground hover:text-primary transition-colors line-clamp-1"
                  >
                    {job.title}
                  </Link>
                  <p className="text-sm text-muted-foreground mt-0.5">{job.company.name}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => onSaveToggle?.(job.id, job.isSaved)}
                  disabled={isSaving}
                  aria-label={job.isSaved ? 'Unsave job' : 'Save job'}
                  className={cn(job.isSaved && 'text-primary')}
                >
                  {job.isSaved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <Badge variant={workModeColors[job.workMode] as 'success' | 'info' | 'warning'} className="text-xs">
                  {job.workMode.charAt(0).toUpperCase() + job.workMode.slice(1)}
                </Badge>
                <Badge variant="outline" className="text-xs">{jobTypeLabels[job.jobType]}</Badge>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" />{job.location}
                </span>
                {job.salary && <span className="text-xs text-muted-foreground">{job.salary}</span>}
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {job.skills.slice(0, 4).map((skill) => (
                  <span key={skill} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                    {skill}
                  </span>
                ))}
                {job.skills.length > 4 && (
                  <span className="text-xs text-muted-foreground">+{job.skills.length - 4} more</span>
                )}
              </div>
              {job.deadline && (
                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                  <Clock className="h-3 w-3" />Deadline: {formatDate(job.deadline)}
                </p>
              )}
            </div>
          </div>
          {job.applicationStatus && (
            <div className="mt-3 pt-3 border-t border-border">
              <Badge variant="secondary" className="text-xs capitalize">
                {job.applicationStatus.replace('_', ' ')}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

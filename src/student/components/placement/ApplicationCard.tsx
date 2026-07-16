import { Building2, MoreVertical, Trash2, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import { formatDate } from '@/shared/lib/utils'
import type { Application, ApplicationStatus } from '@/shared/types/placement'

const statusColors: Record<ApplicationStatus, string> = {
  saved: 'secondary',
  applied: 'info',
  oa: 'warning',
  interview: 'warning',
  hr: 'warning',
  offered: 'success',
  rejected: 'destructive',
}

const statusLabels: Record<ApplicationStatus, string> = {
  saved: 'Saved',
  applied: 'Applied',
  oa: 'Online Assessment',
  interview: 'Interview',
  hr: 'HR Round',
  offered: 'Offered',
  rejected: 'Rejected',
}

interface ApplicationCardProps {
  application: Application
  onDelete?: (id: string) => void
  onStatusChange?: (id: string, status: ApplicationStatus) => void
  compact?: boolean
}

export function ApplicationCard({ application, onDelete, compact }: ApplicationCardProps) {
  const { job } = application

  return (
    <Card className="hover:shadow-sm transition-shadow">
      <CardContent className={compact ? 'p-3' : 'p-4'}>
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 rounded-md border bg-muted flex items-center justify-center shrink-0 overflow-hidden">
            {job.company.logo ? (
              <img src={job.company.logo} alt={job.company.name} className="h-7 w-7 object-contain" />
            ) : (
              <Building2 className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm text-foreground truncate">{job.title}</p>
            <p className="text-xs text-muted-foreground truncate">{job.company.name}</p>
            {!compact && (
              <>
                <div className="flex items-center gap-2 mt-1.5">
                  <Badge
                    variant={statusColors[application.status] as 'secondary' | 'info' | 'warning' | 'success' | 'destructive'}
                    className="text-xs"
                  >
                    {statusLabels[application.status]}
                  </Badge>
                </div>
                {application.appliedAt && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Applied {formatDate(application.appliedAt)}
                  </p>
                )}
              </>
            )}
          </div>
          {onDelete && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm" aria-label="Actions">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => onDelete(application.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />Remove
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        {application.notes && !compact && (
          <p className="text-xs text-muted-foreground mt-2 line-clamp-2 italic">
            <ArrowRight className="h-3 w-3 inline mr-1" />{application.notes}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
